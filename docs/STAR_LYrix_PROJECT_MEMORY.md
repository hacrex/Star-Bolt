# Star Lyrix — Project Memory

**Purpose:** Durable handoff memory for future implementation sessions.  
**Repository:** `hacrex/Star-Bolt`  
**Primary branch:** `feat/star-lyrix-ui-foundation`

## Product identity

Star Lyrix is a community-driven, multilingual lyrics and music-creator ecosystem built around the promise **Cinema for your ears**. It should feel premium, warm, cinematic, calm, editorial, and content-led. It is not a generic dashboard, not a neon AI portal, and not an unlicensed lyrics scraper.

The main growth loop is **YouTube or discovery → Star Lyrix song/lyrics page → related discovery → share → return to YouTube**. The community loop is **request or contribution → moderation → verification → reputation → more contributions**. The creator loop is **original AI lyrics → save → share → authorized lyric-video creation → original content**.

## Source-of-truth documents

| Document | Role |
|---|---|
| [`Star_Lyrix_Web_Project_Requirements.md`](../Star_Lyrix_Web_Project_Requirements.md) | Product vision, routes, features, security, SEO, performance, and growth roadmap |
| [`UIUX.md`](../UIUX.md) | Product UI/UX principles, palette, typography, motion, accessibility, and Gen Z engagement guidance |
| [`stitch_star_lyrix_design_system/star_lyrix/DESIGN.md`](../stitch_star_lyrix_design_system/star_lyrix/DESIGN.md) | Stitch design tokens and composition rules |
| [`stitch_star_lyrix_design_system/star_lyrix/IMPLEMENTATION.md`](../stitch_star_lyrix_design_system/star_lyrix/IMPLEMENTATION.md) | Implemented route mapping, Reading Room contract, auth fixes, QA catalog, legal routes, and UI history |
| [`docs/STAR_LYrix_BUILD_SPEC.md`](./STAR_LYrix_BUILD_SPEC.md) | Canonical phased build plan and acceptance criteria |
| [`qa/supabase-architecture-crosscheck.md`](../qa/supabase-architecture-crosscheck.md) | Current-vs-target Supabase architecture comparison |
| [`supabase/seed/README.md`](../supabase/seed/README.md) | Secure QA catalog setup and seed instructions |
| [`qa/legal-route-check.md`](../qa/legal-route-check.md) | Legal and signup QA evidence |
| [`qa/genz-ui-check.md`](../qa/genz-ui-check.md) | Modern UI/UX browser QA evidence |

The requested `Star_Lyrix_Supabase_Database_Light_Architecture.md` is not tracked in the selected repository or Git refs. The user-provided attachment is the comparison source; its extracted content is represented in the cross-check report.

## Current implementation

The project is a React 18 + TypeScript + Vite + Tailwind CSS + Zustand + Supabase application with React Router. The public Stitch-aligned surfaces are `/`, `/search`, `/videos`, `/songs/:id`, `/ai-lyrics`, and the four legal pages. Protected routes are `/add-song`, `/profile`, `/playlists`, `/playlists/:id`, and `/generated-lyrics`.

The UI uses deep charcoal, warm off-white, muted beige, metallic gold, Inter, Source Serif 4, and JetBrains Mono. Home has a Bento layout, lyric pulse, mood and language filters, taste card, recent shelf, modern empty states, and create/contribute CTAs. Search has recent/trending context, language/mood filters, and editorial results. Videos has functional mood filtering. The header has a command palette on Search, `/`, `Ctrl+K`, and `Cmd+K`. Mobile nav is Discover, Read, Create, Library, and Search. A local “Now Reading” bar persists the most recently opened Reading Room.

The Reading Room queries only authorized playback rows, supports structured cue synchronization, active lyric lines, translation status, share-a-line, local saves, reactions, comments, ratings, and playlist actions. Do not remove the explicit `audio_authorized` gate or rights note.

## Current Supabase MVP

Current SQL and types include `users`, `songs`, `lyrics`, `comments`, `ratings`, `playlists`, `playlist_songs`, `favorites`, `generated_lyrics`, `song_playback`, and `test_catalog_assets`. Auth profile creation is handled by a security-definer trigger from `auth.users`; the browser avoids unauthenticated `public.users` writes. Add Song captures explicit `language` (`hi`, `en`, or `ta`) and optional authorized playback metadata.

The QA catalog has exactly 30 original records: 10 Hindi, 10 English, and 10 Tamil. It has not been uploaded unless a user runs the service-role seed with secure credentials and a valid `public.users` UUID. Never fabricate successful Supabase writes.

## Architecture gaps to implement in order

The target light architecture calls for normalized artists, rights-aware songs/lyrics, translations, contributions, requests/voting, cached YouTube videos, scheduled Edge Function sync, production Storage buckets, richer AI lyric fields and public sharing, moderation roles, reports, and audit records. Add these additively. Do not immediately rename `public.users` to `profiles` or replace free-text `songs.artist` with `artist_id` without compatibility views/backfills and RLS verification.

Before public catalog expansion, add and enforce `rights_status`, `source_type`, `rights_holder`, `license_reference`, `allowed_display`, `allowed_translation`, `allowed_synchronization`, and moderation status fields. Public reads should expose only approved and authorized content. Users must not self-approve or self-verify.

## Known constraints

No Supabase service-role credential is available in the sandbox. No authenticated session was available during prior browser QA because signup encountered an email rate limit. Do not ask for or enter personal credentials into source or screenshots. Authenticated browser QA remains a release requirement once a dedicated test account is available.

The current video gallery uses mock data until a secure cached YouTube integration exists. AI generation and translation require secure server-side providers. Legal pages are product drafts and require owner/counsel review before production publication.

## Session startup checklist

1. Read this file and [`docs/STAR_LYrix_BUILD_SPEC.md`](./STAR_LYrix_BUILD_SPEC.md).
2. Inspect `git status`, branch, latest commit, environment boundaries, and migration order.
3. Read the relevant UIUX, Supabase, or integrations reference before editing.
4. Make a sequential plan and classify work as immediate MVP, additive architecture, or future roadmap.
5. Never expose secrets or claim backend writes without an observed authorized result.
6. Run build, targeted lint, `git diff --check`, browser QA, and a clean-tree check before delivery.
