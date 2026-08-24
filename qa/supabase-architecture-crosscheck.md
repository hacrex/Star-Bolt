# Star Lyrix Supabase Architecture Cross-Check

**Repository:** `hac​​rex/Star-Bolt` implementation branch `feat/star-lyrix-ui-foundation`  
**Compared against:** User-provided `Star_Lyrix_Supabase_Database_Light_Architecture.md` attachment  
**Audit scope:** Supabase services, PostgreSQL schema, Storage, RLS, frontend data flows, routes, and background integrations.

## Executive conclusion

The project is correctly using the requested Supabase direction: Supabase Auth, PostgreSQL, Storage, browser-safe anon client access, typed database access, and RLS-backed playlist, favorites, generated-lyrics, comments, ratings, and authorized playback flows are present. The current implementation is a functional MVP foundation, but it is not yet the complete architecture described in the document.

The largest architectural gap is that the current database is centered on a compact `public.users` + free-text `songs.artist` model, while the document describes a normalized, moderation-ready model using `profiles`, `artists`, rights-aware `songs` and `lyrics`, `translations`, `contributions`, `lyrics_requests`, and a cached `youtube_videos` table. The current app also has no scheduled YouTube synchronization or Supabase Edge Function implementation in this repository.

The requested architecture filename was not found in the current repository, `origin/main`, or local Git history. This report uses the attached document as the comparison source.

## Area-by-area comparison

| Area | Architecture document | Current project | Status | Recommendation |
|---|---|---|---|---|
| Supabase services | PostgreSQL, Auth, Storage, RLS, Edge Functions, optional Realtime | PostgreSQL/Auth/Storage/RLS are wired. Edge Functions and Realtime are not represented in this repository. | Partial | Add server-side functions only when YouTube sync, AI proxying, translation, or moderation workflows are introduced. |
| Profiles | `profiles` table references `auth.users`, with display name, bio, contribution counters, and timestamps | Uses `public.users` with username, avatar URL, and created timestamp. Signup trigger creates the row. | Partial | Keep `public.users` for MVP compatibility or plan a deliberate rename/compatibility view before adding contributor workflows. Do not create a second profile source casually. |
| Artists | Normalized `artists` table with slug, bio, image, country, and verification | Artist is a text field on `songs`; no artist table or artist routes. | Missing | Add `artists` before implementing A–Z navigation, artist pages, follows, or artist moderation. |
| Songs | Slug, artist relation, language code, genre, cover, lyric status, rights metadata, verification, updated timestamp | `songs` has title, artist text, album, release date, thumbnail, language, created timestamp, and creator. | Partial | Add explicit rights and publication-status fields before broadening the catalog. Consider a slug and `artist_id` once artist normalization begins. |
| Lyrics | Separate records with language code, source type, rights status, submitter, status, verification, and timestamps | `lyrics` stores one content field, verified flag, creator, and created timestamp. A unique song index was added for the QA catalog. | Partial | Add rights/source/status fields and ensure authorized display is enforced in query policies or server-side views. |
| Translations | Dedicated `translations` table per lyrics record with status and verification | No translations table. AI translation UI only displays a readiness message. | Missing | Add translations with owner/contributor and moderation policies before exposing translation submission. |
| Contributions | Moderation-ready `contributions` table with pending/approved/rejected/needs-changes workflow | No contributions or moderation queue. Add Song writes directly to `songs`; comments and ratings write directly to their tables. | Missing | Route community submissions through pending contribution records rather than publishing every future edit directly. |
| Lyrics requests | `lyrics_requests` with voting and requested status | No request table or request UI. Search no-result state is informational only. | Missing | Add requests as a high-value catalog-growth feature. |
| YouTube cache | `youtube_videos` table populated by scheduled Edge Function from YouTube API | `/videos` uses local mock data; no YouTube cache table or scheduled sync. | Missing | Implement server-side sync and cache before using live YouTube data in production. |
| Playlists | Name, description, public flag; items may reference songs/videos/Shorts | Private song playlists are implemented with `name`, `user_id`, and `playlist_songs`. | Partial | Add description/public visibility only with explicit RLS for public playlists and mixed media item modeling. |
| Favorites | User-specific saved content | `favorites` table and store are implemented. Reading Room also has local save state for immediate UX. | Partial | Choose one source of truth for production saved songs; synchronize local optimistic state with `favorites`. |
| AI lyrics | `ai_lyrics` with prompt, generated text, language, genre, settings, public flag, share route | `generated_lyrics` stores title, content, settings, owner, and timestamp. It is private by RLS; no public/share fields or share route. | Partial | Add prompt/language/genre/is_public only when share/public drafts are implemented; preserve owner-only default. |
| Storage | Suggested buckets for avatars, artwork, audio, video, AI assets; private by default where appropriate | Only the public `test-catalog-lyrics` QA bucket is defined in migrations. User-provided URLs are used for current thumbnails/audio. | Partial | Add production buckets and object policies incrementally; keep private/user-owned assets private. |
| RLS | Public users read approved public content; owners manage private data; moderators/admins have privileged actions | Public select is broad for users/songs/lyrics/comments/ratings; owner RLS exists for playlists/favorites/generated lyrics. No moderator role model. | Partial | Introduce status-aware public policies before accepting unreviewed community content. Add server-side role checks for moderation. |
| Auth | Email/password, Google OAuth, optional magic link, guest browsing | Supabase Auth email/password and anonymous browsing are present; signup trigger and regex fix are implemented. | Partial | Add OAuth/magic link only if required by product growth. |
| Search | PostgreSQL search across songs, artists, videos, Shorts, and genres | Search queries the `songs` table; UI includes mock video/artist discovery rails. | Partial | Add indexed full-text/trigram search after the normalized tables exist. |
| Routes | `/youtube`, `/shorts`, `/artists`, `/genres`, `/community`, `/library`, `/translate`, `/video-maker`, `/admin`, AI share, and profile routes | Current routes include `/`, `/search`, `/videos`, `/songs/:id`, `/ai-lyrics`, legal pages, and protected profile/library/playlist/add-song pages. | Partial | Add aliases like `/youtube` and `/shorts` before production; introduce larger modules behind clear milestones. |
| Background sync | Scheduled YouTube API → Edge Function → PostgreSQL cache | No scheduled sync implementation is present. | Missing | Requires secure API connector/function configuration; do not call YouTube API from every visitor request. |
| Rights compliance | Rights status, holder, license reference, source type, allowed display/translation/synchronization | Legal pages and authorized playback confirmation exist, but rights fields are not stored on songs/lyrics. | Partial | Treat metadata retrieval and lyric licensing separately; add rights columns and review status before production lyric expansion. |

## Immediate code-level correction applied during this audit

The authoring flow previously relied on the database default for song language. `src/pages/AddSong.tsx` now captures Hindi, English, or Tamil explicitly and writes the selected value to `songs.language`. This brings the live contribution flow into alignment with the multilingual catalog extension and the architecture’s language-aware song model.

The requested architecture’s richer rights fields are intentionally not silently simulated in frontend state. They require a database migration and policy review before being used for production authorization decisions.

## Important schema compatibility observations

The compact current migrations and the architecture document use different names and normalization levels. The current app depends on `public.users`, not `profiles`; `songs.artist` is free text, not `artist_id`; and the current lyric record uses `content`, not `lyrics_text`. A direct rename would break existing stores, routes, seed scripts, and RLS policies. The safest migration strategy is additive: introduce normalized tables and compatibility fields, backfill, then move frontend reads/writes deliberately.

The local TypeScript types should remain aligned with actual nullability in the current SQL. Several legacy foreign-key columns are nullable in the migrations but had been represented as required strings in the local type file. This should be corrected before regenerating or extending types further.

## Recommended implementation order

1. Add `language` to Add Song, which is now complete.
2. Add rights/source/status metadata to `songs` and `lyrics`, then update RLS/public read behavior.
3. Add `lyrics_requests` with owner/vote policies and a no-result request flow.
4. Add `translations` and `contributions` with pending moderation states.
5. Add `artists` and `youtube_videos`, then add artist/video routes and a server-side sync function.
6. Extend AI lyric persistence with prompt, language, genre, and owner-controlled `is_public`; only then implement `/ai-lyrics/share/:id`.
7. Add production Storage buckets with explicit object ownership policies.
8. Add admin/moderation role infrastructure and server-side authorization.

## Security conclusion

No service-role key or other secret was used during this audit. The browser client continues to use only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The test catalog seed remains a separately authorized operation requiring secure service-role credentials and a valid profile ID. The architecture’s rule that copyrighted lyrics must not be scraped or displayed without appropriate rights remains compatible with the current implementation and should be enforced at the data model and policy layers as the catalog grows.
