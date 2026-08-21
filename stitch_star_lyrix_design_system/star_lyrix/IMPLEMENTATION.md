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
