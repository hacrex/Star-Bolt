-- Star Lyrix Phase 1 BYOK provider metadata.
-- Raw provider keys are stored only in Supabase Vault, never in public tables.
-- Apply after migrations 00000 through 00006 and verify Vault is enabled in the target project.

CREATE EXTENSION IF NOT EXISTS vault WITH SCHEMA vault;

CREATE TABLE IF NOT EXISTS public.user_ai_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  model_name text NOT NULL,
  base_url text,
  secret_reference uuid,
  enabled boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  last_validated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_ai_providers_provider_valid CHECK (provider IN ('openai', 'gemini', 'openrouter', 'custom_openai')),
  CONSTRAINT user_ai_providers_model_valid CHECK (length(trim(model_name)) BETWEEN 1 AND 120),
  CONSTRAINT user_ai_providers_custom_url_valid CHECK (
    provider <> 'custom_openai' OR (base_url IS NOT NULL AND base_url ~ '^https://')
  ),
  UNIQUE (user_id, provider)
);

ALTER TABLE public.user_ai_providers ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX IF NOT EXISTS user_ai_providers_one_default_idx
  ON public.user_ai_providers(user_id)
  WHERE is_default = true;
CREATE INDEX IF NOT EXISTS user_ai_providers_user_enabled_idx
  ON public.user_ai_providers(user_id, enabled, is_default);

DROP POLICY IF EXISTS "Users can view own AI provider metadata" ON public.user_ai_providers;
CREATE POLICY "Users can view own AI provider metadata"
  ON public.user_ai_providers FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- The browser may read only sanitized metadata. All writes and secret resolution happen in Edge Functions.
REVOKE SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.user_ai_providers FROM anon, authenticated;
CREATE OR REPLACE VIEW public.user_ai_provider_metadata AS
SELECT id, user_id, provider, model_name, base_url, enabled, is_default, last_validated_at, created_at, updated_at
FROM public.user_ai_providers
WHERE auth.uid() = user_id;
REVOKE ALL ON public.user_ai_provider_metadata FROM PUBLIC, anon;
GRANT SELECT ON public.user_ai_provider_metadata TO authenticated;

CREATE OR REPLACE FUNCTION public.store_user_ai_provider(
  p_user_id uuid,
  p_provider text,
  p_model_name text,
  p_base_url text,
  p_api_key text
)
RETURNS public.user_ai_providers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  existing_provider public.user_ai_providers;
  saved_provider public.user_ai_providers;
  secret_id uuid;
  should_be_default boolean;
  normalized_url text;
BEGIN
  IF p_user_id IS NULL OR p_provider IS NULL OR p_model_name IS NULL OR p_api_key IS NULL THEN
    RAISE EXCEPTION 'Invalid BYOK provider payload' USING ERRCODE = '22023';
  END IF;
  IF p_provider NOT IN ('openai', 'gemini', 'openrouter', 'custom_openai') THEN
    RAISE EXCEPTION 'Unsupported BYOK provider' USING ERRCODE = '22023';
  END IF;
  IF length(trim(p_model_name)) < 1 OR length(trim(p_model_name)) > 120 THEN
    RAISE EXCEPTION 'Invalid BYOK model name' USING ERRCODE = '22023';
  END IF;
  IF length(trim(p_api_key)) < 8 OR length(p_api_key) > 512 THEN
    RAISE EXCEPTION 'Invalid BYOK API key' USING ERRCODE = '22023';
  END IF;

  normalized_url := NULLIF(regexp_replace(trim(COALESCE(p_base_url, '')), '/+$', ''), '');
  IF p_provider = 'custom_openai' AND (normalized_url IS NULL OR normalized_url !~ '^https://') THEN
    RAISE EXCEPTION 'Custom providers require an HTTPS base URL' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO existing_provider
  FROM public.user_ai_providers
  WHERE user_id = p_user_id AND provider = p_provider
  FOR UPDATE;

  IF existing_provider.secret_reference IS NOT NULL THEN
    secret_id := existing_provider.secret_reference;
    PERFORM vault.update_secret(
      secret_id,
      p_api_key,
      format('star-lyrix:%s:%s', p_user_id, p_provider),
      'Star Lyrix BYOK provider credential'
    );
  ELSE
    secret_id := vault.create_secret(
      p_api_key,
      format('star-lyrix:%s:%s', p_user_id, p_provider),
      'Star Lyrix BYOK provider credential'
    );
  END IF;

  should_be_default := existing_provider.is_default OR NOT EXISTS (
    SELECT 1 FROM public.user_ai_providers WHERE user_id = p_user_id AND enabled = true
  );

  IF should_be_default THEN
    UPDATE public.user_ai_providers
    SET is_default = false, updated_at = now()
    WHERE user_id = p_user_id AND provider <> p_provider;
  END IF;

  INSERT INTO public.user_ai_providers (
    user_id, provider, model_name, base_url, secret_reference, enabled, is_default, updated_at
  ) VALUES (
    p_user_id, p_provider, trim(p_model_name), normalized_url, secret_id, true, should_be_default, now()
  )
  ON CONFLICT (user_id, provider) DO UPDATE SET
    model_name = EXCLUDED.model_name,
    base_url = EXCLUDED.base_url,
    secret_reference = EXCLUDED.secret_reference,
    enabled = true,
    is_default = EXCLUDED.is_default,
    updated_at = now()
  RETURNING * INTO saved_provider;

  RETURN saved_provider;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_ai_provider_secret(
  p_user_id uuid,
  p_provider text
)
RETURNS TABLE (
  provider text,
  model_name text,
  base_url text,
  enabled boolean,
  is_default boolean,
  secret text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, vault
AS $$
  SELECT p.provider, p.model_name, p.base_url, p.enabled, p.is_default, d.decrypted_secret
  FROM public.user_ai_providers p
  JOIN vault.decrypted_secrets d ON d.id = p.secret_reference
  WHERE p.user_id = p_user_id
    AND p.provider = p_provider
    AND p.enabled = true;
$$;

CREATE OR REPLACE FUNCTION public.set_user_ai_provider_default(
  p_user_id uuid,
  p_provider text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_ai_providers
    WHERE user_id = p_user_id AND provider = p_provider AND enabled = true
  ) THEN
    RETURN false;
  END IF;
  UPDATE public.user_ai_providers
  SET is_default = (provider = p_provider), updated_at = now()
  WHERE user_id = p_user_id;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_user_ai_provider_enabled(
  p_user_id uuid,
  p_provider text,
  p_enabled boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  changed boolean;
  was_default boolean;
BEGIN
  SELECT is_default INTO was_default
  FROM public.user_ai_providers
  WHERE user_id = p_user_id AND provider = p_provider
  FOR UPDATE;

  UPDATE public.user_ai_providers
  SET enabled = p_enabled,
      is_default = CASE WHEN p_enabled THEN is_default ELSE false END,
      updated_at = now()
  WHERE user_id = p_user_id AND provider = p_provider
  RETURNING true INTO changed;

  IF COALESCE(was_default, false) AND NOT p_enabled THEN
    UPDATE public.user_ai_providers
    SET is_default = true, updated_at = now()
    WHERE id = (
      SELECT id FROM public.user_ai_providers
      WHERE user_id = p_user_id AND enabled = true
      ORDER BY updated_at DESC
      LIMIT 1
    );
  END IF;

  RETURN COALESCE(changed, false);
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_user_ai_provider(
  p_user_id uuid,
  p_provider text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  existing_provider public.user_ai_providers;
BEGIN
  SELECT * INTO existing_provider
  FROM public.user_ai_providers
  WHERE user_id = p_user_id AND provider = p_provider
  FOR UPDATE;

  IF existing_provider.id IS NULL THEN
    RETURN false;
  END IF;

  -- Do not assume an undocumented delete API. Overwrite the encrypted value with a
  -- non-secret tombstone before removing the metadata reference.
  IF existing_provider.secret_reference IS NOT NULL THEN
    PERFORM vault.update_secret(
      existing_provider.secret_reference,
      'revoked',
      format('star-lyrix:revoked:%s:%s', p_user_id, p_provider),
      'Revoked Star Lyrix BYOK provider credential'
    );
  END IF;
  DELETE FROM public.user_ai_providers WHERE id = existing_provider.id;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.store_user_ai_provider(uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_user_ai_provider_secret(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_user_ai_provider_default(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_user_ai_provider_enabled(uuid, text, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.remove_user_ai_provider(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.store_user_ai_provider(uuid, text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_ai_provider_secret(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_user_ai_provider_default(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_user_ai_provider_enabled(uuid, text, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.remove_user_ai_provider(uuid, text) TO service_role;
