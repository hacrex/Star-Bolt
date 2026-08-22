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
