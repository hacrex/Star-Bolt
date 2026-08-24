import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  requestProviderText,
  safeProviderMessage,
  SUPPORTED_PROVIDERS,
  type SupportedProvider,
  ProviderRequestError,
} from "../_shared/byok.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const getUser = async (req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = req.headers.get("Authorization");
  if (!supabaseUrl || !serviceRoleKey || !authorization) return null;
  const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || serviceRoleKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: { user }, error } = await authClient.auth.getUser();
  return error || !user ? null : { user, supabaseUrl, serviceRoleKey };
};

const providerRequest = (input: Record<string, unknown>, testOnly = true) => {
  const provider = input.provider;
  const model = typeof input.modelName === "string" ? input.modelName.trim() : '';
  const apiKey = typeof input.apiKey === "string" ? input.apiKey.trim() : '';
  const baseUrl = typeof input.baseUrl === "string" ? input.baseUrl.trim() : null;
  if (typeof provider !== 'string' || !SUPPORTED_PROVIDERS.has(provider as SupportedProvider) || !model || !apiKey) {
    throw new ProviderRequestError('provider_error', 400);
  }
  if (provider === 'custom_openai' && (!baseUrl || !baseUrl.startsWith('https://'))) {
    throw new ProviderRequestError('provider_error', 400);
  }
  return {
    provider: provider as SupportedProvider,
    model,
    apiKey,
    baseUrl,
    systemPrompt: 'Reply with one short confirmation word. Do not generate or reproduce song lyrics.',
    userPrompt: 'Connection test.',
    testOnly,
  };
};

const sanitizeProvider = (provider: Record<string, unknown> | null | undefined) => provider ? {
  id: provider.id,
  provider: provider.provider,
  model_name: provider.model_name,
  base_url: provider.base_url,
  enabled: provider.enabled,
  is_default: provider.is_default,
  last_validated_at: provider.last_validated_at,
  created_at: provider.created_at,
  updated_at: provider.updated_at,
} : undefined;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ code: 'method_not_allowed', error: 'Method not allowed' }, 405);

  const context = await getUser(req);
  if (!context) return json({ code: 'unauthorized', error: 'Sign in to manage AI providers.' }, 401);

  try {
    const body = await req.json() as Record<string, unknown>;
    const action = body.action;
    const provider = body.provider;
    if (typeof provider !== 'string' || !SUPPORTED_PROVIDERS.has(provider as SupportedProvider)) {
      return json({ code: 'provider_error', error: 'Choose a supported AI provider.' }, 400);
    }

    const admin = createClient(context.supabaseUrl, context.serviceRoleKey);
    if (action === 'test' || action === 'connect') {
      const request = providerRequest(body, true);
      await requestProviderText(request);
      if (action === 'test') return json({ ready: true });

      const { data, error } = await admin.rpc('store_user_ai_provider', {
        p_user_id: context.user.id,
        p_provider: request.provider,
        p_model_name: request.model,
        p_base_url: request.baseUrl,
        p_api_key: request.apiKey,
      });
      if (error) throw new ProviderRequestError('provider_error', 400);
      await admin.from('user_ai_providers')
        .update({ last_validated_at: new Date().toISOString() })
        .eq('user_id', context.user.id)
        .eq('provider', request.provider);
      return json({ ready: true, provider: sanitizeProvider(data as Record<string, unknown>) });
    }

    if (action === 'remove') {
      const { data, error } = await admin.rpc('remove_user_ai_provider', {
        p_user_id: context.user.id,
        p_provider: provider,
      });
      if (error) throw new ProviderRequestError('provider_error', 400);
      return json({ ready: Boolean(data) });
    }

    if (action === 'set_default') {
      const { data, error } = await admin.rpc('set_user_ai_provider_default', {
        p_user_id: context.user.id,
        p_provider: provider,
      });
      if (error) throw new ProviderRequestError('provider_error', 400);
      return json({ ready: Boolean(data) });
    }

    if (action === 'set_enabled') {
      if (typeof body.enabled !== 'boolean') return json({ code: 'provider_error', error: 'Choose whether to enable this provider.' }, 400);
      const { data, error } = await admin.rpc('set_user_ai_provider_enabled', {
        p_user_id: context.user.id,
        p_provider: provider,
        p_enabled: body.enabled,
      });
      if (error) throw new ProviderRequestError('provider_error', 400);
      return json({ ready: Boolean(data) });
    }

    return json({ code: 'provider_error', error: 'Unsupported provider action.' }, 400);
  } catch (error) {
    if (error instanceof ProviderRequestError) return json({ code: error.code, error: safeProviderMessage(error.code) }, error.status >= 400 ? error.status : 400);
    return json({ code: 'provider_error', error: safeProviderMessage('provider_error') }, 400);
  }
});
