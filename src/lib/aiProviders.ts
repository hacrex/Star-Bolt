export type AIProviderId = 'openai' | 'gemini' | 'openrouter' | 'custom_openai';

export interface AIProviderDefinition {
  id: AIProviderId;
  name: string;
  description: string;
  defaultModel: string;
  supportsBaseUrl: boolean;
  keyPlaceholder: string;
}

export const AI_PROVIDERS: AIProviderDefinition[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT models for original lyric drafts and revisions.',
    defaultModel: 'gpt-4o-mini',
    supportsBaseUrl: false,
    keyPlaceholder: 'sk-••••••••••••',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini models through Google’s generative language API.',
    defaultModel: 'gemini-2.0-flash',
    supportsBaseUrl: false,
    keyPlaceholder: 'AIza••••••••••••',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Route original lyric work through your selected model.',
    defaultModel: 'openai/gpt-4o-mini',
    supportsBaseUrl: false,
    keyPlaceholder: 'sk-or-••••••••••••',
  },
  {
    id: 'custom_openai',
    name: 'Custom OpenAI-compatible',
    description: 'Use an HTTPS gateway, self-hosted service, or compatible provider.',
    defaultModel: 'your-model',
    supportsBaseUrl: true,
    keyPlaceholder: 'provider-key-••••••••',
  },
];

export const getAIProvider = (provider: AIProviderId) => AI_PROVIDERS.find((item) => item.id === provider) || AI_PROVIDERS[0];

export const isAIProviderId = (value: string): value is AIProviderId => AI_PROVIDERS.some((provider) => provider.id === value);

export const providerLabel = (provider: string) => AI_PROVIDERS.find((item) => item.id === provider)?.name || provider;

export interface AIProviderMetadata {
  id: string;
  user_id: string;
  provider: AIProviderId;
  model_name: string;
  base_url: string | null;
  enabled: boolean;
  is_default: boolean;
  last_validated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIUsageMetadata {
  available: boolean;
  inputTokens?: number;
  outputTokens?: number;
}

export interface AIProviderGenerationMetadata {
  provider: AIProviderId;
  model: string;
  usage: AIUsageMetadata;
}
