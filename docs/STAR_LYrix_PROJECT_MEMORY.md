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


## Phase 1 rights-aware lyrics and translations

The new additive migration `supabase/migrations/20260822000003_add_rights_aware_lyrics_translations.sql` adds rights and publication metadata to `songs` and `lyrics`, creates `translations`, and replaces the legacy broad public lyric-read policy with explicit display authorization. Existing records default to hidden until reviewed. Owners can view and edit their own pending lyric/translation submissions, while users cannot self-approve or self-verify.

The Reading Room now loads public authorized translations and shows a rights-aware lyric status. Add Song captures lyric source, rights status, holder, license reference, and authorization confirmation; submissions are stored as pending and hidden. The QA seed now marks original test lyrics as owned, verified, and display-authorized. Apply migrations through `20260822000003` before running or verifying the QA seed. No Supabase write was executed from the sandbox.


## Phase 2 animated lyric synchronization

The Reading Room now uses `AnimatedLyricLine` for cue-aware line focus, past-line depth, keyboard selection, auto-centering, and a gold progress underline driven by structured cue timing. `LyricSyncStatus` exposes manual, ready, and live authorized-sync states with a cue count and progress rail. These components remain dependent on `song_playback.audio_authorized` and existing structured cues; they do not introduce autoplay or guessed media. Non-essential pulse/focus animation is disabled under `prefers-reduced-motion`.


## Phase 3 collaborative translation and version control

The protected route `/translate/:lyricsId` is the collaboration surface. It loads an accessible lyric source, lets a signed-in contributor choose a target language, edit a translation, provide a change note, and confirm rights before submission. The UI clearly communicates that new work is pending and cannot replace public content until reviewed.

Migration `20260822000004_add_translation_versions.sql` creates immutable `translation_versions` snapshots and a transaction-locked database trigger that assigns version numbers. The `translationStore` owns public/pending translation reads, version-history reads, and pending submissions. The Reading Room exposes the collaboration entry point only when a lyric record is available, while Supabase RLS remains the source of truth for eligibility and approval.


## Phase 4 realtime multiplayer collaboration

The protected translation workspace now includes Supabase Realtime presence and broadcast signals through `useTranslationRealtime`. Collaborators share only pseudonymous display metadata, language code, cursor index, selection length, editing state, stable color, and activity timestamp. No lyric text, email, rights data, or credentials are transmitted.

`CollaboratorPresence` presents live/connecting/offline status, collaborator initials, editing indicators, and truthful draft-line cursor labels. The hook handles reconnect and browser online/offline transitions, ignores stale events, and removes its channel on unmount. Production rollout still requires authenticated Supabase Realtime channel authorization and an end-to-end test with two dedicated accounts; the local workspace cannot perform that authenticated test without user credentials.


## Phase 4 private Realtime authorization

Migration `20260822000005_add_translation_realtime_policies.sql` authorizes private presence and broadcast channels through policies on Supabase's managed `realtime.messages` table. The topic format is `translation-workspace:<lyrics_uuid>`. Access is limited to authenticated users who can access an explicitly translation-eligible/authorized source or own the pending source lyric. The browser hook now requests `private: true`, and the payload remains ephemeral and metadata-only.

Production requires applying migration 00005 and disabling public channel access in Supabase Realtime Settings. Two-account end-to-end presence and cursor tests remain pending until a live configured Supabase project and dedicated test accounts are available.


## Phase 5 contribution reputation and badges

The profile dashboard now reads owner-scoped `reputation_events` and derives points, submissions, approvals, language breadth, active days, recent activity, and badge progress through `src/lib/reputation.ts`. Badge thresholds are deterministic and based on real submission/approval activity rather than fake social metrics.

Migration `20260822000006_add_reputation_events.sql` creates trigger-generated events for songs, lyrics, translations, and translation versions, revokes direct client access to the point-recording function, and backfills existing records idempotently. RLS exposes events only to the owning authenticated user. If the migration is unavailable, the UI shows a truthful “data will appear after migration” state.


## Phase 6 production hardening

Phase 6 added npm-consistent Playwright smoke testing through `npm run test:e2e`, using the installed system Chromium executable and no browser or ffmpeg download requirement. The public suite covers the Home shell, command palette open/close and focus path, all four dedicated legal routes, URL-preserved Hindi language filtering, narrow mobile navigation, signed-out protected-route redirects, wildcard fallback, route-aware document metadata, and safe missing-song behavior. The final local run passed 17 tests.

Production polish added route-aware `SeoHead` metadata, canonical URLs, rights-safe descriptions, `robots.txt`, a minimal public sitemap, asynchronous lazy image decoding for noncritical discovery/video imagery, and Vite manual chunks for framework, Supabase, icons, and remaining vendor code. The measured local production asset total was 508.65 KiB uncompressed across the generated `dist/assets` files; this is a build artifact measurement, not a Core Web Vitals claim. `qa/bundle-report.json` records the file-level report.

Static validation completed with `npx tsc -p tsconfig.app.json --noEmit`, `npm run build`, targeted ESLint for Phase 6 files, `git diff --check`, and the 17-test Playwright suite. A full repository lint run remains a separate inventory because historical unrelated legacy errors exist outside the Phase 6 paths.

The release is conditionally ready from the frontend perspective only. Before production, apply migrations 00000 through 00006 in a staging project, run the secure original 30-song seed, configure Storage and Edge Function secrets, disable public Realtime channels and validate two authenticated collaboration accounts, execute authenticated playlist/profile/Reading Room/reputation tests, measure deployed Core Web Vitals, configure SPA fallback/rollback/monitoring, and obtain owner or counsel review of legal copy. No service-role credential, authenticated session, live migration, seed, Realtime two-user test, or deployed production test was available in this workspace.

## BYOK Creator Studio implementation checkpoint

The attached `docs/Star_Lyrix_AI_Creator_Studio_BYOK_Requirements.md` is now tracked as the source specification. `docs/STAR_LYrix_BYOK_IMPLEMENTATION_PLAN.md` records the gap analysis and incremental rollout decision.

The first secure slice adds `user_ai_providers` metadata with owner-scoped access, a sanitized `user_ai_provider_metadata` view, and Vault-backed server functions in migration `20260824000007_add_byok_provider_metadata.sql`. Raw provider keys are never stored in normal profile rows or returned to the browser. The client settings screen at protected `/settings/ai` accepts a key only in transient password input and sends it to the authenticated `manage-ai-provider` Edge Function. The protected `/creator` route provides an honest Creator Studio landing surface and links to the existing original-lyrics studio.

`generate-lyrics` now requires an authenticated user with an enabled BYOK provider, retrieves the provider secret only server-side, supports the initial OpenAI, Gemini, OpenRouter, and custom OpenAI-compatible adapters, and returns provider/model/usage provenance without raw provider errors or credentials. Existing rights-aware lyrics and authorized playback rules remain unchanged. Supabase Vault availability, migration behavior, provider API compatibility, and authenticated end-to-end key rotation/generation remain staging validation requirements; none were executed here.

## Marketing-first public site checkpoint

The public information architecture now positions Star Lyrix as a Creator Studio marketing site. The homepage leads with original lyrics, lyric-led video ideas, and Shorts, while creator work and BYOK settings remain behind authentication. Protected `/ai-lyrics`, `/creator`, and `/settings/ai` routes are not public marketing pages; public `/lyrics` is the rights-aware reader/discovery surface and public `/shorts` is the Star Lyrix YouTube gallery.

`ShortsGallery` calls a server-only `search-media` Edge Function. The function is designed for an explicit YouTube Shorts playlist or video allowlist and never assumes an undocumented Shorts API. It returns official channel video metadata and links to `https://www.youtube.com/@starlyrix`; when server variables are absent, the UI shows an honest configuration state and channel link.

`LyricsReader` uses Spotify only for catalog identity/matching and exposes lyric text only through an explicitly configured licensed Musixmatch Pro endpoint. Spotify is not treated as a lyric source. Provider credentials and API keys are not included in Vite variables or browser code. The `vercel.json` SPA fallback addresses direct-route 404 behavior observed on `https://starlyrix.vercel.app/ai-lyrics`, but the deployed site must be redeployed and verified.

## Vevo-for-Lyrics foundation checkpoint

The complete `docs/Star_Lyrix_Vevo_for_Lyrics_Product_Requirements.md` is now tracked, with `docs/STAR_LYrix_VEVO_IMPLEMENTATION_PLAN.md` capturing the gap analysis and staged architecture. The first next slice adds migration `20260824000008_add_youtube_video_catalog.sql` and the `youtube_videos` metadata catalog. It is public-read and server-written; it stores channel/video identity, thumbnails, publish time, a neutral content classification, and official YouTube links, but it does not grant permission to copy lyrics, download media, or pair unauthorized audio with a Reading Room.

The `sync-youtube-catalog` Edge Function is protected by a server-only sync secret and reads from a configured YouTube playlist or explicit allowlist. The public Shorts gallery reads cached rows first and retains a live API fallback only for staging when the cache is unavailable. No YouTube API key or sync secret is exposed to the browser. Production still requires a scheduled sync mechanism, quota/error monitoring, curated content policy, and separate rights review for any associated lyrics, audio, or hosted media.

## Marketing UI/UX redesign checkpoint

The user requested a stronger, eyecatching marketing experience after the previous marketing homepage felt too dull. The new source document is `docs/STAR_LYrix_MARKETING_UIUX_SPEC.md`. It restores the Stitch direction through an asymmetric editorial hero, the existing Star Lyrix gold artwork as a compressed WebP visual stage, a content ticker, varied Bento-style path cards, a channel feature/rail, a serif Lyrics Reader preview, a creator flywheel CTA, and a restrained rights/trust band.

The public homepage now leads with `Turn a lyric into a world.` and makes the three public/product stories visible: lyrics, Shorts, and Creator Studio. Public `/lyrics` and `/shorts` remain the destination surfaces; `/creator`, `/ai-lyrics`, `/settings/ai`, saved drafts, playlists, profiles, and contribution work remain behind authentication. No fake metrics, autoplay, scraped lyrics, or unsupported official/verified claims were added. The marketing home clips decorative off-canvas rings to prevent horizontal overflow while preserving the layered composition.

## Artist submission foundation checkpoint
The protected `/submit` Artist Submission Portal is now implemented as the first rights-aware intake slice. Signed-in artists can create an owner-scoped artist profile, submit a YouTube review URL with release metadata and rights evidence, and complete three explicit attestations before the server-mediated `submit_artist_video_submission` function changes the record from `draft` to `submitted`. The migration is `20260825000009_add_artist_video_submissions.sql`; its section is mirrored byte-for-byte in `supabase/setup.sql`, and the audit event records the actual prior state when a submission is resubmitted after changes are requested.

The browser cannot approve, publish, set a YouTube video ID, or mark a publication timestamp. Reviewer transitions and YouTube OAuth publishing remain future server-only work requiring a real reviewer identity model, official channel-owner OAuth, idempotent queueing, rights evidence, and staging validation. The portal intentionally accepts a review URL; hosted uploads are labeled as coming soon until a reviewed storage pipeline exists. The public marketing header and homepage invite artists to submit, but the route remains login gated and is excluded from robots indexing. Authenticated live submission testing was not performed because no test account or applied Supabase staging migration was available in this implementation session.

## For Creators marketing page checkpoint
The public `/creators` route now serves the Artist/Stars marketing surface. It explains the current creator toolkit—original lyric studio, BYOK provider control, rights-aware Reading Room, and artist submission for review—alongside clearly labeled future stages for lyric-video direction, Shorts packaging, voiceover, and the server-only official-channel pathway. Public CTAs route to the existing protected surfaces, while the page avoids promising approval, official status, or automatic YouTube publication.

The global header and mobile navigation no longer expose `Submit a video` as a primary navigation item. They now point to `/creators` through `For Creators`; the submission flow remains available from the creator marketing page and the protected `/submit` route. Footer, command palette, SEO metadata, sitemap, responsive CSS, and public-route tests were updated consistently.

## Final repository cleanup and product baseline — 2026-08-25

Star Lyrix is now in a final cleaned baseline on `feat/star-lyrix-ui-foundation`. The canonical public surfaces are the cinematic marketing homepage, `/lyrics` Reading Room, `/shorts` official-channel gallery, and `/creators` Artist/Stars marketing page. The protected product surfaces include Creator Studio, AI lyrics, provider settings, generated lyrics, playlists, profile, translation, and `/submit` artist review intake.

The Lyrics Reader hero uses the Stitch-inspired editorial search instrument. Its combobox performs a debounced live lookup through the existing server-backed public music catalog gateway, supports loading and empty states, stale-request cancellation, keyboard selection, and listbox semantics. Catalog identity and authorized lyrics remain separate concerns: Spotify identifies tracks, while lyrics appear only through an approved provider path.

The global Header is the mobile navigation source of truth across public and protected routes. Its hamburger opens a full-height drawer with Explore and Your studio sections, protected destinations, official `@starlyrix` access, backdrop and Escape dismissal, route-change close behavior, body scroll locking, safe-area padding, and reduced-motion handling. The mobile bottom navigation remains as the persistent complementary shell.

The cleanup removed the stale duplicate `home/project` application tree, unused legacy `src/pages/Videos.tsx`, root `activity.txt`, obsolete root SVG mockups, and unused legacy `public/metaimage.png` after confirming no active imports or runtime references. Historical QA documents were updated to distinguish legacy records from the current application.

Final validation baseline: TypeScript passed, production Vite build passed, focused ESLint passed, repository-wide `npm run lint` passed with two non-blocking Fast Refresh warnings in `Toast.tsx` and `ThemeContext.tsx`, whitespace validation passed, and the Playwright suite passed with 25 tests. Live catalog suggestions remain dependent on configured provider/gateway data; authenticated artist submission and official-channel publishing remain rights-reviewed, server-only follow-up work and were not live-tested in this environment. The connected Vercel identity still cannot access or create the existing Production Deployment for `starlyrix`, so the existing production project was not overwritten.
