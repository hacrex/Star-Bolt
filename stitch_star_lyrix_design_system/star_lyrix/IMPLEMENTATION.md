# Star Lyrix UI Implementation Notes

This folder is the visual source of truth for the Star-Bolt React application. The implemented UI preserves the Stitch direction: **Cinema for your Ears**, warm charcoal surfaces, soft gold active states, glassmorphism, editorial spacing, and a serif-led lyrics experience.

## Implemented surfaces

| Surface | React route | Stitch reference | Implementation status |
|---|---|---|---|
| Discovery home | `/` | `star_lyrix_home` | Cinematic hero, gold actions, Bento-style sections, featured video rail, mood/category discovery |
| Search | `/search` | `search_infinite_field` | Oversized search field, recent/trending chips, editorial song results, lyric-video cards, artist rail |
| Video gallery | `/videos` | `cinema_video_gallery` | Mood filters, Video of the Week hero, gold play control, duration/rating metadata, video cards, Shorts rail |
| Reading Room | `/songs/:id` | `the_reading_room_lyrics` | Album/metadata rail, Save/Add/Share actions, lyrics canvas, translation state, active-line treatment, playback bar, community notes |

## Reading Room contract

The Reading Room is intentionally data-driven. Song metadata, lyrics, ratings, and comments continue to load through the existing Supabase queries in `src/pages/SongDetails.tsx`. The page adds presentation state without replacing the data layer:

- The lyrics body is split into blank-line sections and rendered with verse/chorus labels.
- Each lyric line is keyboard-reachable and clickable. The selected line receives the gold active state, scale treatment, text glow, and left indicator bar shown in the Stitch reference.
- The Translate control exposes a non-destructive translation status panel. A licensed translation source can be connected later without changing the page composition.
- Save, Add, and Share are explicit interaction surfaces. Save is local UI state for now, Add surfaces a coming-soon toast, and Share uses the native share API with clipboard fallback.
- Playback controls are a visual shell for the future licensed audio/synchronization layer. Progress, volume, play/pause, and lyrics state are interactive; queue and track navigation remain intentionally lightweight until an authorized player is connected.

## Visual tokens

The page uses the palette and type hierarchy from `DESIGN.md`: Inter for interface chrome, Source Serif 4 for lyrics, JetBrains Mono for labels and timestamps, deep charcoal surfaces, warm off-white text, muted beige secondary text, and `#d4a843` / `#f2c35b` gold for primary and active states.

## Content and rights

Only lyrics that Star Lyrix is licensed or authorized to publish should be rendered. The page includes a rights note beneath the lyric canvas, and translation or community corrections should be marked verified only after review.

## Responsive behavior

Desktop uses a two-column Reading Room with a sticky playback bar. Tablet collapses the volume controls and keeps the main controls centered. Mobile stacks the album rail above the lyrics canvas, keeps the translation action compact, and converts the playback bar into a full-width sticky mini-player.


## Follow-up alignment

The shared shell now includes a Stitch-style mobile bottom navigation for Discover, Lyrics, Library, and Search. Active route state is derived from React Router, and the mobile content area reserves space so the fixed navigation does not cover page content.

The follow-up pass also extends the same surface language to authenticated experiences: profile, playlists, playlist detail, generated lyrics, and authentication now use warm surfaced cards, gold accents, mono metadata labels, softer modal treatment, and serif lyric presentation. These routes continue using their existing authentication and Supabase store flows.

The implementation intentionally keeps unfinished data integrations explicit. The Reading Room player is a UI shell until an authorized audio/synchronization provider is connected; playlist Add remains a coming-soon interaction; and video/search mock content remains clearly separated from the existing Supabase-backed song catalog.


## Authorized playback and synchronization

Reading Room playback is now backed by `public.song_playback`. The table stores an explicit `audio_authorized` flag, source URL, duration, and a JSON array of timed cue objects. The client queries only rows where `audio_authorized = true`, loads the source through a native HTML audio element, and updates the active lyric line from `currentTime` against `startMs` / `endMs`. Clicking a synchronized line seeks the authorized player to that cue. If no authorized source exists, the player remains visibly unavailable rather than attempting to play a guessed or third-party source.

Contributors can add playback metadata from the authenticated Add Song route. The form requires a rights confirmation, a valid audio URL, whole-second duration, and optional cue JSON before inserting `song_playback`. The migration is `supabase/migrations/20260822000000_add_song_playback.sql`; `supabase/setup.sql` contains the equivalent one-shot setup.

## Playlist management

Playlist actions now use the existing Supabase-backed store and RLS policies end to end. Users can create playlists, add a song from the Reading Room through a playlist picker, create a new playlist and add the current song in one action, remove songs from playlist detail, and delete playlists from the library. The UI keeps link and button controls separate for keyboard and screen-reader correctness, and duplicate junction rows surface as a friendly already-added message.


## Full prototype coverage

The React implementation now maps the four checked-in Stitch HTML prototypes as follows:

| Stitch prototype | React route | Implemented reference behavior |
|---|---|---|
| `star_lyrix_home` | `/` | Cinema for your Ears Bento hero, featured cinematic card, Lyric of the Day card, three supporting discovery cards, mood chips, archive CTA panel, and latest-song cards. |
| `search_infinite_field` | `/search` | Centered infinite search field, recent/trending context, songs-to-revisit state, lyric-video cards, artist discovery rail, and popular-right-now chips. |
| `cinema_video_gallery` | `/videos` | Mood filters, Video of the Week hero, gold play treatment, editorial video grid, view/rating metadata, and Short & Sweet rail. |
| `the_reading_room_lyrics` | `/songs/:id` | Album/metadata rail, Reading Room lyrics canvas, masked serif reading flow, active cue highlighting, translation state, community notes, and sticky player. |

The home route intentionally no longer composes the earlier `FeaturedArtist`, `CategorySection`, `TrendingSection`, or `TopNewSongs` legacy blocks. The Stitch Bento canvas is the canonical discovery surface; dynamic Supabase songs still populate the latest-song area without changing the reference hierarchy.


## AI Lyrics Studio

The `/ai-lyrics` route now uses the Stitch lyric-studio composition: a warm prompt canvas, compact settings rail, editorial serif output surface, and explicit save, share, and translation actions. The legacy orphaned category, artist, trending, and placeholder song blocks were removed from the active implementation so they cannot reintroduce the earlier visual language.

## Signup and profile creation

Signup validation uses the browser-safe username pattern `[-A-Za-z0-9_]+`; placing the hyphen at the beginning avoids the modern browser `v`-flag character-class error. The client passes the username in Supabase Auth metadata and only attempts a profile upsert when an authenticated session exists. Migration `supabase/migrations/20260822000001_fix_signup_profile_trigger.sql` adds a security-definer trigger that creates the matching `public.users` profile after a new `auth.users` row is created, including when email confirmation means the initial signup response has no session.

## Original multilingual QA catalog

Migration `supabase/migrations/20260822000002_add_multilingual_test_catalog.sql` adds the `songs.language` field, the `test_catalog_assets` manifest table, and the public `test-catalog-lyrics` Storage bucket. The checked-in seed contains 10 original Hindi, 10 original English, and 10 original Tamil songs with short original lyrics. `scripts/seed-stitch-test-catalog.mjs` requires a Supabase service-role key and a valid `public.users` profile UUID; it has not been run from this workspace because no service credential is available. See `supabase/seed/README.md` for safe execution instructions.

## Dedicated legal routes

The shared Footer now links to `/terms`, `/privacy`, `/copyright`, and `/community-guidelines`. These routes render the reusable Stitch-styled `src/pages/Legal.tsx` surface and include account-use, privacy, rights-reporting, original test-content, and community-safety language. The copy is product guidance for QA and should be reviewed by the project owner or counsel before production publication.


## Modern Gen Z interaction layer

The latest UI pass keeps the warm cinematic system but makes the product more personal and participatory. Home now includes a taste-profile card, local recent-reading shelf, mood discovery, language tabs, lyric pulse content, richer song cards, and intentional empty states. Search supports language and mood filters, while Videos now filters its editorial rail by mood rather than only changing visual state.

The shared header includes a command palette available from the Search control or `/` / `Ctrl+K` / `Cmd+K` shortcuts. Mobile navigation is intent-led: Discover, Read, Create, Library, and Search, with Create visually elevated as the primary action. A persistent Now Reading bar keeps the last lyric room available across non-reading routes.

Reading Room actions now remember local saves, support share-a-line moments, persist lightweight reactions, expose language metadata, and retain authorized audio synchronization. These local enhancements are deliberately independent of Supabase so they remain useful while authenticated backend features are unavailable. The motion layer uses short transform/opacity transitions and respects reduced-motion preferences.


## Supabase light-architecture cross-check

The attached `Star_Lyrix_Supabase_Database_Light_Architecture.md` was cross-checked against the current repository. The source document is not currently tracked in the selected Git branch, so the full comparison is preserved in `qa/supabase-architecture-crosscheck.md`.

The implementation matches the requested Supabase foundation and currently supports Auth, PostgreSQL, Storage, RLS, private playlists/favorites/generated lyrics, authorized playback, and the multilingual QA catalog. Add Song now captures explicit language metadata. The documented next architecture milestones are rights-aware lyric fields, translation and contribution workflows, lyric requests, normalized artists, cached YouTube videos with scheduled Edge Function synchronization, production Storage buckets, and moderator/admin authorization. These are intentionally tracked as additive milestones rather than silently changing the existing `public.users` and free-text artist model.


## Phase 1 rights-aware lyrics and translations

Migration `supabase/migrations/20260822000003_add_rights_aware_lyrics_translations.sql` adds additive song and lyric metadata for `language_code`, lyrics publication status, rights status, rights holder, license reference, verification, and update timestamps. Lyric records also carry `source_type`, `allowed_display`, `allowed_translation`, and `allowed_synchronization`. Existing `language` and `content` fields remain for compatibility.

The same schema is mirrored in `supabase/setup.sql`. Public lyric reads now require explicit display authorization, an approved or verified status, and an allowed rights status. Contributors can view and manage their own pending lyric submissions, but cannot publish, approve, or verify them. The new `translations` table uses one target-language row per lyric record, stores contributor and rights metadata, and follows the same pending-versus-public RLS boundary.

`SongDetails.tsx` now loads the rights-aware lyric record and authorized translations, presents the rights-aware lyric status, and enables the translation selector only when public authorized translations exist. `AddSong.tsx` captures language, lyric source type, rights status, rights holder, license reference, and an explicit authorization confirmation; submitted lyrics remain pending and hidden until review. The QA catalog seed marks its original test records as owned, verified, and display-authorized so the Reading Room can be tested after the migration and secure seed are run.


## Phase 2 animated lyric synchronization

The Reading Room now composes `AnimatedLyricLine` and `LyricSyncStatus`. Active cues receive a subtle focus entrance, a gold progress underline driven by the current cue interval, past-line depth treatment, and automatic centering inside the lyric scroll container. `LyricSyncStatus` communicates manual reading, ready-to-sync, and live lyric-sync states with an accessible cue count and progress rail.

The animation contract remains purposeful and rights-safe: it only responds to the existing authorized playback state and structured cue data, uses transform/opacity plus a small progress scale, avoids autoplay, keeps lyric buttons keyboard reachable, and disables non-essential pulse/focus animation under `prefers-reduced-motion`. Browser QA verified that the unavailable-content fallback and console remain clean when no authorized song is present.


## Phase 3 collaborative translation and version control

The protected route `/translate/:lyricsId` now provides a two-column collaboration workspace: the authorized source lyric on the left and a target-language editor on the right. Contributors can select Hindi, English, or Tamil targets, record rights status and change notes, and submit a translation only when the source lyric is marked translation-eligible. New and revised work remains pending and hidden until review.

Migration `supabase/migrations/20260822000004_add_translation_versions.sql` adds `translation_versions` as immutable snapshots linked to a canonical `translations` row. A security-definer trigger assigns monotonically increasing version numbers under a transaction lock. Public users can see only authorized approved snapshots; contributors can manage their own pending snapshots, and no client action can self-approve or self-verify content. The workspace displays the current translation, version labels, pending state, and change notes while preserving the existing warm editorial interaction language.
