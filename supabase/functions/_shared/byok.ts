export type SupportedProvider = 'openai' | 'gemini' | 'openrouter' | 'custom_openai';

export interface ProviderRequest {
  provider: SupportedProvider;
  apiKey: string;
  model: string;
  baseUrl?: string | null;
  systemPrompt: string;
  userPrompt: string;
  testOnly?: boolean;
}

export interface ProviderTextResponse {
  content: string;
  usage: {
    available: boolean;
    inputTokens?: number;
    outputTokens?: number;
  };
}

export const SUPPORTED_PROVIDERS = new Set<SupportedProvider>(['openai', 'gemini', 'openrouter', 'custom_openai']);

const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const REQUEST_TIMEOUT_MS = 30_000;

const normalizeBaseUrl = (value: string | null | undefined, fallback: string) => {
  const normalized = value?.trim().replace(/\/+$/, '');
  return normalized || fallback;
};

const responseErrorCode = (status: number) => {
  if (status === 401 || status === 403) return 'invalid_api_key';
  if (status === 404) return 'model_not_found';
  if (status === 408 || status === 504) return 'timeout';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'provider_unavailable';
  return 'provider_error';
};

export class ProviderRequestError extends Error {
  code: string;
  status: number;

  constructor(code: string, status = 502) {
    super(code);
    this.name = 'ProviderRequestError';
    this.code = code;
    this.status = status;
  }
}

const requestJson = async (url: string, init: RequestInit): Promise<Record<string, unknown>> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const data = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) throw new ProviderRequestError(responseErrorCode(response.status), response.status);
    return data;
  } catch (error) {
    if (error instanceof ProviderRequestError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') throw new ProviderRequestError('timeout', 504);
    throw new ProviderRequestError('provider_unavailable', 502);
  } finally {
    clearTimeout(timeout);
  }
};

const openAICompatibleRequest = async (request: ProviderRequest): Promise<ProviderTextResponse> => {
  const fallback = request.provider === 'openrouter' ? OPENROUTER_BASE_URL : OPENAI_BASE_URL;
  const baseUrl = normalizeBaseUrl(request.baseUrl, fallback);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${request.apiKey}`,
  };
  if (request.provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://starlyrix.com';
    headers['X-Title'] = 'Star Lyrix';
  }
  const data = await requestJson(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: request.model,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
      temperature: request.testOnly ? 0 : 0.85,
      max_tokens: request.testOnly ? 1 : 1400,
    }),
  });
  const choices = Array.isArray(data.choices) ? data.choices as Array<Record<string, unknown>> : [];
  const firstMessage = choices[0]?.message as Record<string, unknown> | undefined;
  const content = typeof firstMessage?.content === 'string' ? firstMessage.content.trim() : '';
  if (!content) throw new ProviderRequestError('provider_error', 502);
  const usage = data.usage as Record<string, unknown> | undefined;
  const inputTokens = typeof usage?.prompt_tokens === 'number' ? usage.prompt_tokens : undefined;
  const outputTokens = typeof usage?.completion_tokens === 'number' ? usage.completion_tokens : undefined;
  return {
    content,
    usage: {
      available: inputTokens !== undefined || outputTokens !== undefined,
      inputTokens,
      outputTokens,
    },
  };
};

const geminiRequest = async (request: ProviderRequest): Promise<ProviderTextResponse> => {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(request.model)}:generateContent?key=${encodeURIComponent(request.apiKey)}`;
  const data = await requestJson(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${request.systemPrompt}\n\n${request.userPrompt}` }] }],
      generationConfig: { temperature: request.testOnly ? 0 : 0.85, maxOutputTokens: request.testOnly ? 1 : 1400 },
    }),
  });
  const candidates = Array.isArray(data.candidates) ? data.candidates as Array<Record<string, unknown>> : [];
  const candidateContent = candidates[0]?.content as Record<string, unknown> | undefined;
  const parts = Array.isArray(candidateContent?.parts) ? candidateContent.parts as Array<Record<string, unknown>> : [];
  const content = parts.map((part) => typeof part.text === 'string' ? part.text : '').join('').trim();
  if (!content) throw new ProviderRequestError('provider_error', 502);
  const usage = data.usageMetadata as Record<string, unknown> | undefined;
  const inputTokens = typeof usage?.promptTokenCount === 'number' ? usage.promptTokenCount : undefined;
  const outputTokens = typeof usage?.candidatesTokenCount === 'number' ? usage.candidatesTokenCount : undefined;
  return {
    content,
    usage: {
      available: inputTokens !== undefined || outputTokens !== undefined,
      inputTokens,
      outputTokens,
    },
  };
};

export const requestProviderText = async (request: ProviderRequest): Promise<ProviderTextResponse> => {
  if (!SUPPORTED_PROVIDERS.has(request.provider)) throw new ProviderRequestError('provider_error', 400);
  if (request.provider === 'gemini') return geminiRequest(request);
  return openAICompatibleRequest(request);
};

export const safeProviderMessage = (code: string) => {
  const messages: Record<string, string> = {
    invalid_api_key: 'The provider rejected this key. Check the key and try again.',
    provider_unavailable: 'The provider is unavailable right now. Try again shortly.',
    rate_limited: 'The provider rate limit was reached. Try again later.',
    model_not_found: 'That model was not found. Choose another model name.',
    insufficient_quota: 'The provider reported insufficient quota for this key.',
    timeout: 'The provider took too long to respond. Try again shortly.',
    provider_error: 'The provider returned an unsupported response.',
    provider_not_configured: 'Connect an AI provider in Settings before generating.',
  };
  return messages[code] || 'The AI request could not be completed.';
};
