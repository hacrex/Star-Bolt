# Star Lyrix multilingual QA catalog

This directory contains **30 original test songs** for local and staging QA: exactly 10 Hindi, 10 English, and 10 Tamil records. Every record includes short original lyrics written for testing. The catalog is not scraped from published music and must not be presented as production repertoire.

## Setup order

Apply the migrations in order through the Supabase SQL editor or your normal migration workflow:

```text
20260822000000_add_song_playback.sql
20260822000001_fix_signup_profile_trigger.sql
20260822000002_add_multilingual_test_catalog.sql
20260822000003_add_rights_aware_lyrics_translations.sql
```

The catalog migration adds `songs.language`, deterministic indexes, the `test_catalog_assets` manifest table, and the public `test-catalog-lyrics` Storage bucket. The rights-aware migration adds song/lyric authorization metadata and the `translations` table. The service-role seed marks QA lyrics as original/owned and explicitly display-authorized, while the service-role upload does not require a browser-client Storage upload policy.

## Seed command

First create or use an authenticated profile in `public.users`. The value required by `SEED_USER_ID` is the profile UUID, not the email address. Keep the service-role key outside source control, preferably in a local untracked `.env.local` file or an environment manager.

```bash
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
SEED_USER_ID=your-public-users-uuid \
npm run seed:test-catalog
```

The script is idempotent for the catalog identity `(title, artist)`: it upserts the song and lyric rows, replaces the matching UTF-8 `.txt` file in Storage, and upserts its `test_catalog_assets` manifest row. Never place `SUPABASE_SERVICE_ROLE_KEY` in Vite variables, committed files, screenshots, or browser code.

## Verification

After the command completes, verify that `public.songs` contains 30 catalog rows with `language` and `language_code` values `hi`, `en`, and `ta`, that `public.lyrics` has one lyric row for each seeded song with `source_type = 'star_lyrix_original'`, `rights_status = 'owned'`, `allowed_display = true`, and `status = 'verified'`, and that `storage.objects` contains one `.txt` file per song in `test-catalog-lyrics`. If the database migration has not been applied, the script will fail rather than silently creating an incomplete catalog.
