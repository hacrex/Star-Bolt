# Star Lyrix — Complete Phased Build Specification

**Document status:** Canonical implementation plan for the Star Lyrix project  
**Product concept:** A YouTube-powered, multilingual lyrics and music-creator ecosystem  
**Primary design promise:** **Cinema for your ears.**

## 1. Purpose and product boundary

Star Lyrix is a community-driven music discovery platform centered on lyric videos, authorized lyrics, multilingual reading, creator tools, and community contribution. It should begin as a polished MVP rather than an attempt to reproduce a massive lyrics database. The initial catalog should grow from Star Lyrix content, original material, user requests, and authorized submissions.

The product must keep metadata retrieval separate from lyric licensing. A song may have a public metadata page even when its lyrics are unavailable. Copyrighted lyrics must never be scraped from third-party lyric websites or displayed without appropriate ownership, license, public-domain status, or authorization. This rule applies to ordinary lyrics, translations, synchronized cues, video assets, and AI-assisted workflows. [1]

The current implementation uses React, TypeScript, Vite, Tailwind CSS, Zustand, Supabase Auth, PostgreSQL, Storage, and RLS. It already contains a Stitch-based public shell, Reading Room, search, video gallery, AI Lyrics Studio, playlists, favorites, generated lyrics, authorized playback, legal pages, and an original multilingual QA catalog. [2] [3]

## 2. Non-negotiable product principles

| Principle | Requirement |
|---|---|
| **Rights first** | Store and enforce the authorization state of lyrics, translations, audio, synchronization cues, and user media. Never infer permission from the existence of a URL. |
| **Lyrics are the hero** | Keep the Reading Room calm, readable, and content-led. UI should disappear while a user reads. |
| **Warmth over neon** | Use charcoal, warm white, muted beige, and metallic gold. Do not introduce purple-pink-blue gradients or high-saturation neon as the primary visual language. |
| **Progressive catalog growth** | Launch with authorized/original content, requests, and community workflows. Do not seed or scrape a giant unlicensed catalog. |
| **Server-side trust boundaries** | Use Supabase Edge Functions for YouTube synchronization, AI proxying, translation proxying, moderation actions, and other privileged operations. Never put service-role or third-party secrets in browser code. |
| **Mobile-first** | Design for thumb reach, 48px minimum touch targets, bottom-sheet actions, readable lyrics, and sticky playback context. |
| **Transparent unfinished states** | A feature that is not connected to production data must be visibly labeled as a mock, preview, pending, or coming soon. |
| **Modular evolution** | Add normalized models and workflow tables additively. Do not break the current `public.users`, free-text artist, or MVP route contracts without a migration and compatibility plan. |

## 3. Target architecture

### 3.1 Services

Use Supabase PostgreSQL as the application database, Supabase Auth for credentials and sessions, Supabase Storage for public and private media, RLS for authorization, Edge Functions for privileged server-side operations, and Realtime only where live moderation or community updates justify it. The recommended YouTube flow is **YouTube API → scheduled Edge Function → PostgreSQL cache → website**; visitor requests must not call YouTube directly. [4]

The browser client may use only the Supabase project URL and anon key. Service-role credentials, YouTube API credentials, AI provider credentials, translation credentials, and administrative operations must remain server-side. The current project follows this browser boundary and the catalog seed requires an explicit service-role environment variable only when run outside the browser. [5]

### 3.2 Canonical data domains

The long-term model is divided into identity, catalog, rights, community, media, and creator domains. The current MVP tables remain valid as a compatibility layer while the missing normalized domains are added incrementally.

| Domain | Target entities | Current state |
|---|---|---|
| Identity | `auth.users`, `profiles` or compatible `public.users`, roles | `auth.users` plus `public.users` and signup trigger exist. |
| Catalog | `artists`, `songs`, `albums`, `genres` | `songs` exists with free-text artist and multilingual `language`. |
| Lyrics | `lyrics`, `translations`, status and rights metadata | `lyrics` exists with content and verification; translations are not yet implemented. |
| Community | `contributions`, `lyrics_requests`, votes, reports, moderation events | Not yet implemented. |
| Video | `youtube_videos`, Shorts classification, playlists, related content | Current `/videos` uses mock content; cache/sync is not yet implemented. |
| Personal library | `favorites`, `playlists`, `playlist_songs`, followed artists | Favorites and song playlists exist; public/mixed-media playlist features are future work. |
| Creator tools | `generated_lyrics`, AI share records, video-maker assets | Private generated lyrics exist; public sharing and video maker are future work. |
| Operations | Storage manifests, audit records, scheduled jobs, analytics events | QA Storage manifest exists; production operations are future work. |

### 3.3 Additive migration strategy

Do not rename `public.users` to `profiles` or replace `songs.artist` with `artist_id` in one destructive change. First add target tables and nullable compatibility fields, backfill deterministic relationships, update types and stores, dual-read where necessary, migrate writes, verify RLS, and only then consider deprecating old fields. Every migration must be idempotent or use explicit policy-existence guards.

## 4. Visual and interaction specification

### 4.1 Visual system

The visual system is a premium low-light editorial environment. Use deep charcoal backgrounds, tonal surfaces, warm off-white text, muted beige metadata, and metallic gold for active states and primary actions. Inter handles interface text, Source Serif 4 handles lyrics and long-form editorial copy, and JetBrains Mono handles labels, timestamps, statuses, and archival metadata. [6]

| Token family | Target values |
|---|---|
| Background | `#0A0A0A` / `#14130F` |
| Surfaces | `#141414`, `#1C1C1C`, `#242424` |
| Primary gold | `#D4A843` |
| Hover gold | `#E8C675` / `#F2C35B` |
| Warm text | `#F5F0E8` / `#E7E2DA` |
| Secondary text | `#A89F91` / `#D2C5B1` |
| Muted text | `#6B6560` / `#9A8F7D` |
| Mood accents | muted rose, amber, sage, lavender, coral, and sky only as restrained tags or indicators |

Use 16px card radii, 12px or pill-shaped buttons, 8px-scale spacing, 20px Bento gaps, 12-column desktop grids, 8-column tablet grids, and 4-column mobile grids. Use subtle borders and gold glows instead of heavy black shadows. [6]

### 4.2 Core page compositions

| Surface | Required behavior |
|---|---|
| Home | Cinematic hero, search/discovery entry, Bento grid, lyric pulse, mood filters, language filters, personalized shelf, latest songs, videos, and a clear create/contribute loop. |
| Search | Large infinite search field, recent/trending searches, language and mood filters, result cards, artist/video discovery rails, no-result recovery, and future request-song CTA. |
| Reading Room | Album art and metadata rail, authorized playback only, serif lyrics at 20px minimum with 2.0 line height, active line anchoring, section labels, translation controls, share quote, save/add actions, comments, rights note, and related discovery. |
| Videos | Video of the Week hero, mood filters, 16:9 cards, play/share/save controls, duration/view metadata, Shorts rail, and future cached YouTube data. |
| AI Lyrics Studio | Prompt canvas, theme/mood/genre/language/structure controls, original-only safety language, output editing, private save, translation through secure server code, and future public share route. |
| Library | Saved songs, saved lyrics, saved videos, playlists, generated lyrics, and followed artists with expressive empty states. |
| Profile | Identity, taste summary, contribution counts, badges, language signals, saved content, and settings. |
| Community/Admin | Pending contribution queue, requests, reports, verification, role-protected moderation actions, and audit history. |

### 4.3 Gen Z engagement loop

The primary loop is **discover a feeling → read the lyric → save the moment → share the line → return to the archive**. Use mood-first labels such as `midnight`, `soft launch`, `main character`, `heartbreak`, `focus mode`, and `2AM drive`, but do not use fake engagement metrics. Social proof must be based on real aggregate data or clearly labeled preview data.

The lyric line should be the main social unit. Users should be able to select a line, react to it, copy or share it where rights allow, translate it where authorized, and save it to a shelf. Community reactions should remain lightweight and secondary to the reading experience.

### 4.4 Motion and accessibility

Use transitions primarily on transform and opacity, generally under 300ms. Keyboard command actions should be instant; modals, drawers, and toasts may use short eased entry/exit motion. Respect `prefers-reduced-motion`. Maintain visible gold focus rings, semantic headings, descriptive alt text, keyboard-reachable lyric lines, appropriate ARIA labels, and WCAG 2.1 AA contrast targets. [7]

## 5. Route specification

### 5.1 Current MVP routes

| Route | Access | Acceptance requirement |
|---|---|---|
| `/` | Public | Renders the Stitch Bento discovery home and graceful no-data states. |
| `/auth` | Public | Sign-in/sign-up works with safe username validation and confirmation-mode messaging. |
| `/search` | Public | Searches songs and supports recent/trending context plus language/mood filters. |
| `/songs/:id` | Public | Loads authorized song metadata, lyrics, comments, rating, and playback; unavailable records fail gracefully. |
| `/videos` | Public | Renders the cinematic gallery and filtered mock/real video data. |
| `/ai-lyrics` | Public/private actions | Generates original lyrics through the configured secure path and clearly labels unavailable integrations. |
| `/add-song` | Protected | Captures metadata, language, and optional authorized playback; rejects invalid rights confirmations. |
| `/profile` | Protected | Shows user identity and taste/library information. |
| `/playlists` | Protected | Creates/deletes private playlists and presents useful empty states. |
| `/playlists/:id` | Protected | Adds/removes songs and handles ownership safely. |
| `/generated-lyrics` | Protected | Lists the current user’s own generated lyric drafts. |
| `/terms`, `/privacy`, `/copyright`, `/community-guidelines` | Public | Each route renders distinct, owner-reviewable legal content. |

### 5.2 Target expansion routes

Implement only when the backing data and authorization are ready: `/youtube`, `/youtube/:videoId`, `/shorts`, `/artists`, `/artists/:artist`, `/genres`, `/genres/:genre`, `/library`, `/community`, `/community/:postSlug`, `/requests`, `/translate`, `/ai-lyrics/share/:id`, `/video-maker`, `/settings`, and role-protected `/admin`.

Keep `/videos` as a compatibility alias or migrate it deliberately to `/youtube`; do not create empty route shells that imply functionality that does not exist. [8]

## 6. Supabase schema specification

### 6.1 Current MVP schema

The current migrations create `users`, `songs`, `lyrics`, `comments`, `ratings`, `playlists`, `playlist_songs`, `favorites`, `generated_lyrics`, `song_playback`, and `test_catalog_assets`. All application tables are intended to use RLS. The authorized playback row contains an explicit authorization flag, URL, duration, and structured synchronized cues. [9]

### 6.2 Target additive tables and fields

| Table/field | Required purpose |
|---|---|
| `profiles` or compatibility extension | Display name, bio, contribution counters, verified contribution counters, updated timestamp, and role linkage. |
| `artists` | Stable artist identity, slug, bio, image, country, and verified state. |
| `songs` additions | Stable slug, `artist_id`, `language_code`, genre, cover reference, lyric status, rights status, rights holder, license reference, verified state, and updated timestamp. |
| `lyrics` additions | `language_code`, `source_type`, `rights_status`, `rights_holder`, `license_reference`, `allowed_display`, `allowed_translation`, `allowed_synchronization`, `status`, and updated timestamp. |
| `translations` | Source lyric relationship, target language, translated text, submitter, status, verification, and timestamps. |
| `contributions` | User, type, target entity, content payload, workflow status, moderator, moderator note, and timestamps. |
| `lyrics_requests` | Title, artist, language, requester, vote count, status, and timestamps. |
| `youtube_videos` | YouTube ID, metadata, publication time, channel, content type, song/artist relation, tags/playlists, featured state, and timestamps. |
| `generated_lyrics` additions | Prompt, language, genre, optional public flag, and share-safe publication metadata. Private-by-default must remain the default. |
| `playlists` additions | Description and explicit public/private flag only after corresponding RLS is implemented. |

### 6.3 RLS requirements

Enable RLS on every application table. Public reads must expose only intentionally public, approved, authorized content. Authenticated users may create their own requests and contributions, edit their own pending contributions, manage their own playlists/favorites/AI drafts, and never self-approve or self-verify. Moderators may review content through server-side role checks; administrators alone may manage roles and site-wide settings. Frontend route guards are UX only and never replace database authorization. [4]

## 7. Phased execution plan

### Phase 0 — Baseline and safety

Freeze the current working branch, record repository and Supabase project identifiers, verify environment-variable boundaries, confirm migration order, and ensure no credentials appear in source, logs, screenshots, or documentation. Establish the design tokens and route inventory before adding features.

**Exit criteria:** clean baseline build, documented environment variables, no secret leaks, migration order known, current route QA record present.

### Phase 1 — Foundation and Stitch shell

Implement the shared header, footer, theme provider, mobile navigation, responsive site shell, Stitch tokens, typography, focus states, loading states, error boundary, and route fallback. Build the Home, Search, Videos, and Reading Room compositions against the checked-in Stitch references. [2] [6]

**Exit criteria:** all four public prototype surfaces visually align at desktop and mobile widths; no orphaned legacy components remain active; keyboard and reduced-motion checks pass.

### Phase 2 — Catalog and authorized Reading Room

Implement songs and separate lyrics records, public metadata pages, language labels, rights notes, authorized playback, structured cue synchronization, comments, ratings, and graceful unavailable-content states. Add the original 30-song QA catalog workflow without scraping copyrighted lyrics. [3] [5]

**Exit criteria:** one authorized QA song can play and synchronize; unauthorized playback never loads; song language is explicit; seed validation confirms exactly 10 Hindi, 10 English, and 10 Tamil records when run with user credentials.

### Phase 3 — Auth and personal library

Complete Supabase Auth, server-side profile creation, profile editing, favorites, playlists, playlist membership, generated lyric drafts, protected route behavior, and local optimistic UI reconciliation. Verify email-confirmation mode and avoid unauthenticated profile writes. [3]

**Exit criteria:** authenticated users can create a playlist, add/remove a song, save a favorite, save a private AI draft, and access only their own private records.

### Phase 4 — Search and discovery intelligence

Add PostgreSQL full-text/trigram search, normalized artists, genres, recommendation inputs, mood taxonomy, language filters, request-song recovery, related songs, real aggregate metrics, and a persistent “Now Reading” context. Keep mock data visibly separate from Supabase-backed data until migration is complete.

**Exit criteria:** search covers songs and normalized artists; no-result users can request a song; discovery labels are backed by real data or marked preview; filters preserve URL state and are keyboard accessible.

### Phase 5 — Community contributions and moderation

Add translations, corrections, contributions, reports, lyrics requests, voting, moderation queues, verification badges, contributor history, role claims, moderator actions, and audit records. Enforce pending/approved/rejected/needs-changes workflow in the database and Edge Functions.

**Exit criteria:** a user contribution enters pending status, cannot self-approve, can be reviewed by a moderator, and becomes public only after policy-approved state changes.

### Phase 6 — YouTube and Shorts platform

Create the `youtube_videos` cache, scheduled Edge Function synchronization, content classification, `/youtube`, `/youtube/:videoId`, `/shorts`, related video links, share controls, and stale-cache/error handling. Do not call YouTube API per visitor.

**Exit criteria:** a scheduled sync can upsert video metadata idempotently, classify Shorts, associate videos with songs/artists, and render cached results when the API is unavailable.

### Phase 7 — AI and creator tools

Secure the AI/translation proxy, enforce original-lyrics policy, add prompt/language/genre persistence, owner-controlled public sharing, `/ai-lyrics/share/:id`, lyric quote-card generation, and the `/video-maker` workflow for user-owned or authorized media. Private drafts must never leak through public routes.

**Exit criteria:** original AI output is saved privately by default; public sharing requires an explicit owner action; translation rejects unauthorized source content; creator assets use the correct Storage policies.

### Phase 8 — Growth, performance, SEO, and analytics

Add a community blog, contributor reputation, notifications, recommendations, aggregate analytics, Open Graph metadata, canonical URLs, sitemap, robots rules, structured data, image optimization, route-based code splitting, lazy media, caching, and performance budgets. Track aggregate events without unnecessary personal information.

**Exit criteria:** Core Web Vitals budgets are measured, SEO metadata exists for canonical public routes, media is lazy-loaded, and analytics events are documented with data-minimization rules.

### Phase 9 — Production security and operations

Review every RLS policy, Storage object policy, Edge Function secret, role boundary, rate limit, moderation action, deletion path, backup/restore procedure, and legal page. Run migration rehearsal against a staging project, seed only with secure credentials, and deploy through a protected CI/CD path.

**Exit criteria:** security review has no unresolved critical findings; staging migrations are reproducible; production deployment, rollback, monitoring, and incident response are documented.

## 8. Testing and acceptance strategy

Use four test layers. First, run deterministic static checks: TypeScript, ESLint, formatting, migration SQL review, seed distribution checks, and secret scanning. Second, run integration tests against a disposable Supabase project or local instance for Auth, RLS, Storage, playlist CRUD, catalog seed, and authorized playback. Third, run browser QA for public routes, command palette, language/mood filters, responsive navigation, legal routes, and protected redirects. Fourth, run authenticated browser QA with a dedicated test account for profile, Add Song, playlists, generated lyrics, favorites, and Reading Room actions.

| Test concern | Pass condition |
|---|---|
| Auth regex | Signup field accepts supported usernames without browser invalid-RegExp warnings. |
| Profile creation | Email-confirmation signup creates `public.users` server-side; immediate-session signup remains authorized. |
| RLS | Anonymous users cannot read private library or drafts; owners can manage only their own records. |
| Rights | Unlicensed lyrics/audio/translation/sync content is not publicly displayed or played. |
| Catalog | QA seed contains exactly 30 original records with 10/10/10 language distribution and one lyric asset per song. |
| Reading Room | Authorized audio only, cue synchronization correct, active line readable, no autoplay. |
| Responsive UI | 320px, 425px, 768px, 1024px, and 1280px layouts remain usable with no covered content. |
| Accessibility | Keyboard operation, focus visibility, screen-reader labels, contrast, and reduced-motion behavior pass. |
| Routing | Registered routes render; protected routes redirect signed-out users; unknown routes have a safe fallback. |
| Performance | Images lazy-load, heavy routes split, and performance budgets are measured rather than assumed. |

## 9. Operations and environment contract

The frontend requires only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Secure seed and server-side jobs may use `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, a valid `SEED_USER_ID`, and provider-specific secrets in a protected environment. Never place service-role values in Vite-prefixed variables, commit history, screenshots, or browser logs. The QA seed instructions and migration order are documented in [`supabase/seed/README.md`](../supabase/seed/README.md). [5]

All migrations must be applied in order and tested for rerun behavior. Storage buckets should default to private unless intentionally public. Public Storage read policies must be scoped to the intended bucket, while user-owned assets must use owner-based object paths and policies. Scheduled synchronization must be idempotent and observable, with retry/backoff and stale-data handling.

## 10. Definition of done

Star Lyrix is ready for a production MVP when the public discovery, search, video, Reading Room, Auth, profile, playlist, favorites, AI-draft, legal, and contribution surfaces are visually coherent; Supabase RLS and Storage policies are verified; authorized content is enforced; the YouTube cache is server-synchronized; the catalog can grow through requests and moderated contributions; core SEO and performance budgets are measured; and deployment/rollback/monitoring procedures are documented.

The long-term product is complete when the community loop and creator loop are operational:

> **User → Request or Contribution → Moderation → Verification → Reputation → More Contributions**
>
> **Create → YouTube → Star Lyrix Website → Discover → Request → Contribute → Translate → Verify → Create More**

## References

[1]: ../Star_Lyrix_Web_Project_Requirements.md "Star Lyrix Web Project Requirements"
[2]: ../stitch_star_lyrix_design_system/star_lyrix/IMPLEMENTATION.md "Stitch implementation notes"
[3]: ../qa/supabase-architecture-crosscheck.md "Supabase architecture cross-check"
[4]: ../qa/supabase-architecture-crosscheck.md "Attached Supabase architecture represented by the cross-check"
[5]: ../supabase/seed/README.md "Multilingual QA catalog seed instructions"
[6]: ../stitch_star_lyrix_design_system/star_lyrix/DESIGN.md "Stitch Star Lyrix design system"
[7]: ../UIUX.md "Star Lyrix UI/UX Design System"
[8]: ../qa/genz-ui-check.md "Star Lyrix UI and route QA record"
[9]: ../supabase/setup.sql "One-shot Supabase setup schema"
