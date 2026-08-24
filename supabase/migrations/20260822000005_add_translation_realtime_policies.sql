/*
  # Authorize private translation collaboration channels

  Presence and cursor payloads are ephemeral and never stored as application data.
  Realtime authorization is evaluated against realtime.messages when clients join
  or publish to a private channel.
*/

CREATE OR REPLACE FUNCTION public.can_access_translation_workspace(channel_topic text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH topic AS (
    SELECT substring(channel_topic FROM '^translation-workspace:([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$')::uuid AS lyric_id
  )
  SELECT EXISTS (
    SELECT 1
    FROM public.lyrics l
    CROSS JOIN topic
    WHERE l.id = topic.lyric_id
      AND (
        (
          l.allowed_translation = true
          AND l.allowed_display = true
          AND l.status IN ('approved', 'verified')
          AND l.rights_status IN ('owned', 'licensed', 'authorized', 'public_domain')
        )
        OR l.created_by = auth.uid()
      )
  );
$$;

DO $$
BEGIN
  IF to_regclass('realtime.messages') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can receive translation collaboration" ON realtime.messages';
    EXECUTE $policy$
      CREATE POLICY "Authenticated users can receive translation collaboration"
        ON realtime.messages FOR SELECT TO authenticated
        USING (
          extension IN ('presence', 'broadcast')
          AND public.can_access_translation_workspace((SELECT realtime.topic()))
        )
    $policy$;

    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can publish translation collaboration" ON realtime.messages';
    EXECUTE $policy$
      CREATE POLICY "Authenticated users can publish translation collaboration"
        ON realtime.messages FOR INSERT TO authenticated
        WITH CHECK (
          extension IN ('presence', 'broadcast')
          AND public.can_access_translation_workspace((SELECT realtime.topic()))
        )
    $policy$;
  END IF;
END;
$$;
