import { supabase } from './supabase';
import type { AIProviderId, AIProviderGenerationMetadata } from './aiProviders';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface FunctionErrorPayload {
  error?: string;
  code?: string;
}

async function authenticatedFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Must be logged in');

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: ANON_KEY,
    },
    body: JSON.stringify(body),
  });

  let data: T & FunctionErrorPayload;
  try {
    data = await response.json();
  } catch {
    throw new Error('The server returned an invalid response');
  }
  if (!response.ok) throw new Error(data.error || 'The request could not be completed');
  return data;
}

export interface GenerateLyricsResponse {
  content: string;
  generation: AIProviderGenerationMetadata;
}

export async function generateLyricsAPI(
  prompt: string,
  settings: {
    rhymeScheme: string;
    syllablesPerLine: number;
    language: string;
    genre: string;
    mood: string;
  },
  provider?: AIProviderId,
): Promise<GenerateLyricsResponse> {
  return authenticatedFunction<GenerateLyricsResponse>('generate-lyrics', { prompt, settings, provider });
}

export async function translateLyricsAPI(
  content: string,
  targetLanguage: string,
): Promise<string> {
  const data = await authenticatedFunction<{ translatedText: string }>('translate-lyrics', { content, targetLanguage });
  return data.translatedText;
}

export interface ProviderInput {
  provider: AIProviderId;
  modelName: string;
  baseUrl?: string;
  apiKey: string;
}

export interface ProviderActionResponse {
  provider?: {
    id: string;
    provider: AIProviderId;
    model_name: string;
    base_url: string | null;
    enabled: boolean;
    is_default: boolean;
    last_validated_at: string | null;
    created_at: string;
    updated_at: string;
  };
  ready?: boolean;
}

export async function saveAIProviderAPI(input: ProviderInput) {
  return authenticatedFunction<ProviderActionResponse>('manage-ai-provider', { action: 'connect', ...input });
}

export async function testAIProviderAPI(input: ProviderInput) {
  return authenticatedFunction<ProviderActionResponse>('manage-ai-provider', { action: 'test', ...input });
}

export async function removeAIProviderAPI(provider: AIProviderId) {
  return authenticatedFunction<ProviderActionResponse>('manage-ai-provider', { action: 'remove', provider });
}

export async function setDefaultAIProviderAPI(provider: AIProviderId) {
  return authenticatedFunction<ProviderActionResponse>('manage-ai-provider', { action: 'set_default', provider });
}

export async function setAIProviderEnabledAPI(provider: AIProviderId, enabled: boolean) {
  return authenticatedFunction<ProviderActionResponse>('manage-ai-provider', { action: 'set_enabled', provider, enabled });
}
