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

const getUserContext = async (req: Request) => {
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

const getValidSettings = (value: unknown) => {
  if (!value || typeof value !== 'object') throw new ProviderRequestError('provider_error', 400);
  const settings = value as Record<string, unknown>;
  const rhymeScheme = typeof settings.rhymeScheme === 'string' ? settings.rhymeScheme : 'FREE';
  const syllablesPerLine = typeof settings.syllablesPerLine === 'number' ? settings.syllablesPerLine : 8;
  const language = typeof settings.language === 'string' ? settings.language : 'en';
  const genre = typeof settings.genre === 'string' ? settings.genre : 'pop';
  const mood = typeof settings.mood === 'string' ? settings.mood : 'reflective';
  if (!['ABAB', 'AABB', 'FREE'].includes(rhymeScheme) || !Number.isInteger(syllablesPerLine) || syllablesPerLine < 4 || syllablesPerLine > 16) {
    throw new ProviderRequestError('provider_error', 400);
  }
  return { rhymeScheme, syllablesPerLine, language: language.slice(0, 32), genre: genre.slice(0, 64), mood: mood.slice(0, 64) };
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ code: 'method_not_allowed', error: 'Method not allowed' }, 405);

  const context = await getUserContext(req);
  if (!context) return json({ code: 'unauthorized', error: 'Sign in to generate original lyrics.' }, 401);

  try {
    const body = await req.json() as Record<string, unknown>;
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    if (!prompt || prompt.length > 1200) return json({ code: 'provider_error', error: 'Add a prompt between 1 and 1200 characters.' }, 400);
    const settings = getValidSettings(body.settings);
    const requestedProvider = typeof body.provider === 'string' && SUPPORTED_PROVIDERS.has(body.provider as SupportedProvider)
      ? body.provider as SupportedProvider
      : null;

    const admin = createClient(context.supabaseUrl, context.serviceRoleKey);
    let providerQuery = admin.from('user_ai_providers').select('provider, model_name, base_url, enabled, is_default').eq('user_id', context.user.id).eq('enabled', true);
    if (requestedProvider) providerQuery = providerQuery.eq('provider', requestedProvider);
    else providerQuery = providerQuery.eq('is_default', true);
    const { data: providers, error: providerError } = await providerQuery.limit(1);
    if (providerError || !providers?.[0]) return json({ code: 'provider_not_configured', error: safeProviderMessage('provider_not_configured') }, 409);
    const selected = providers[0] as { provider: SupportedProvider; model_name: string; base_url: string | null };

    const { data: secrets, error: secretError } = await admin.rpc('get_user_ai_provider_secret', {
      p_user_id: context.user.id,
      p_provider: selected.provider,
    });
    const secretRow = Array.isArray(secrets) ? secrets[0] : secrets;
    if (secretError || !secretRow || typeof secretRow.secret !== 'string') return json({ code: 'provider_not_configured', error: safeProviderMessage('provider_not_configured') }, 409);

    const systemPrompt = `Generate original song lyrics only. Never reproduce, transform, or imitate copyrighted lyrics or a living artist's distinctive lyrics. The user must own or have permission for any source material. Write a complete draft with clear section labels. Parameters: rhyme scheme ${settings.rhymeScheme}; approximately ${settings.syllablesPerLine} syllables per line; genre ${settings.genre}; mood ${settings.mood}; language ${settings.language}.`;
    const generation = await requestProviderText({
      provider: selected.provider,
      apiKey: secretRow.secret,
      model: selected.model_name,
      baseUrl: selected.base_url,
      systemPrompt,
      userPrompt: prompt,
    });

    return json({
      content: generation.content,
      generation: {
        provider: selected.provider,
        model: selected.model_name,
        usage: generation.usage,
      },
    });
  } catch (error) {
    if (error instanceof ProviderRequestError) return json({ code: error.code, error: safeProviderMessage(error.code) }, error.status >= 400 ? error.status : 400);
    return json({ code: 'provider_error', error: safeProviderMessage('provider_error') }, 400);
  }
});
