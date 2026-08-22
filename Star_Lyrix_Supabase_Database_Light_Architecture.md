# Star Lyrix — Database-Light Architecture with Supabase

## Project

**Name:** Star Lyrix  
**Domain:** starlyrix.com  
**Backend:** Supabase  
**Frontend:** React / Next.js + TypeScript  
**Hosting:** Firebase Hosting, Vercel, or Netlify

## Core Strategy

Star Lyrix does not need a large pre-existing lyrics database to launch.

Start with the **Star Lyrix YouTube channel as the initial content engine**, then progressively build a structured catalog using:

- YouTube metadata
- Song and artist metadata
- User requests
- Authorized community contributions
- Licensed lyrics
- Verified translations
- Original Star Lyrix content
- AI-generated original lyrics

The initial architecture should be:

```text
Star Lyrix YouTube
        |
   YouTube Data API
        |
 Supabase Edge Function
        |
 Supabase PostgreSQL
        |
   Star Lyrix Website
        |
 +------+-------+--------+
 |              |        |
Lyrics       Community   AI Tools
Search       Requests    Creator Tools
```

---

# 1. Supabase Services

Use:

- **Supabase PostgreSQL** — application database
- **Supabase Auth** — user authentication
- **Supabase Storage** — images, audio, video assets
- **Supabase Row Level Security** — authorization
- **Supabase Edge Functions** — YouTube synchronization, AI/translation proxying, privileged operations
- **Supabase Realtime** — optional live moderation/community updates

---

# 2. YouTube as the Initial Content Source

Do not manually enter thousands of songs.

Use the Star Lyrix YouTube channel to populate the initial catalog.

Synchronize:

- Video ID
- Title
- Description
- Thumbnail
- Published date
- Channel ID
- Playlist information
- Tags where available
- Content type

Recommended flow:

```text
YouTube API
     ↓
Supabase Edge Function
     ↓
PostgreSQL cache
     ↓
Website
```

Do not call the YouTube API for every website visitor.

Create a scheduled synchronization job that periodically updates Supabase.

---

# 3. Database Schema

## Profiles

Supabase Auth handles credentials. Store application profile data separately.

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  contribution_count integer default 0,
  verified_contributions integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## Artists

```sql
create table artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  bio text,
  image_url text,
  country text,
  verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## Songs

Initially store metadata even when lyrics are unavailable.

```sql
create table songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  artist_id uuid references artists(id),
  album text,
  release_date date,
  language_code text,
  genre text,
  cover_url text,
  lyrics_status text default 'not_available',
  rights_status text default 'unknown',
  rights_holder text,
  license_reference text,
  verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Possible `lyrics_status` values:

```text
not_available
pending
available
licensed
community_submitted
verified
```

## YouTube Videos

```sql
create table youtube_videos (
  id uuid primary key default gen_random_uuid(),
  youtube_video_id text unique not null,
  title text not null,
  description text,
  thumbnail_url text,
  published_at timestamptz,
  channel_id text,
  content_type text default 'other',
  song_id uuid references songs(id),
  artist_id uuid references artists(id),
  playlist_ids jsonb,
  tags jsonb,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Use `content_type` values such as:

```text
lyric_video
short
playlist_video
featured
other
```

Shorts can use the same table with `content_type = 'short'`.

---

# 4. Lyrics Architecture

Lyrics should be a separate entity because not every song will have lyrics available.

```sql
create table lyrics (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references songs(id) on delete cascade,
  language_code text not null,
  lyrics_text text,
  source_type text,
  rights_status text default 'unknown',
  submitted_by uuid references profiles(id),
  status text default 'pending',
  verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Possible source types:

```text
star_lyrix_original
licensed
authorized_submission
public_domain
community
```

Do not scrape copyrighted lyrics from third-party sites just to populate the database.

---

# 5. Translations

```sql
create table translations (
  id uuid primary key default gen_random_uuid(),
  lyrics_id uuid not null references lyrics(id) on delete cascade,
  language_code text not null,
  translated_text text,
  submitted_by uuid references profiles(id),
  status text default 'pending',
  verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

UI example:

```text
Translations (5)

English
Hindi
Korean
Spanish
Japanese
```

---

# 6. Community Contribution System

Users can submit:

- Authorized lyrics
- Corrections
- Translations
- Artist information
- Song metadata
- Genre suggestions
- Video metadata corrections

Workflow:

```text
User
 ↓
Contribution
 ↓
Pending
 ↓
Moderator Review
 ├── Approve
 ├── Reject
 └── Request Changes
 ↓
Published
 ↓
Verified
```

Contribution table:

```sql
create table contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  contribution_type text not null,
  song_id uuid references songs(id),
  lyrics_id uuid references lyrics(id),
  translation_id uuid references translations(id),
  content jsonb,
  status text default 'pending',
  moderator_id uuid references profiles(id),
  moderator_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

# 7. Verification

Use Star Lyrix's own badges:

- ✓ Verified Lyrics
- ✓ Verified Translation
- ✓ Verified Artist
- ★ Star Lyrix Original
- ✓ Trusted Contributor

Do not use third-party verification names or trademarks unless Star Lyrix has explicit authorization.

---

# 8. Contribution Tracking

User profiles should show:

```text
29 Contributions
18 Approved
7 Translations
4 Corrections
3 Verified
```

Potential badges:

- First Contribution
- 10 Contributions
- 50 Contributions
- 100 Contributions
- Verified Contributor
- Translation Expert
- Community Helper

---

# 9. Lyrics Request System

This is critical because Star Lyrix starts without a large lyrics database.

If a user searches for a missing song:

```text
Song not found?

[ Request This Song ]
```

Database:

```sql
create table lyrics_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text,
  language_code text,
  requested_by uuid references profiles(id),
  vote_count integer default 1,
  status text default 'requested',
  created_at timestamptz default now()
);
```

Display:

```text
🔥 Most Requested Lyrics

1. Song A — 2,481 requests
2. Song B — 1,923 requests
3. Song C — 1,102 requests
```

This becomes Star Lyrix's data-driven content roadmap.

---

# 10. Content Growth Loop

```text
User searches
      ↓
Song unavailable
      ↓
Request song
      ↓
Community votes
      ↓
Star Lyrix sees demand
      ↓
Create authorized content
      ↓
Upload YouTube video
      ↓
YouTube API sync
      ↓
Supabase record
      ↓
Website page automatically appears
```

---

# 11. Song Page

Example:

```text
/lyrics/artist/song-name
```

If lyrics are not available, the page can still exist:

```text
Song Name
Artist Name

🎬 Star Lyrix Video

[ Watch ]

Language: Hindi
Genre: Bollywood

Lyrics
────────────────────
Lyrics currently unavailable.

[ Request Lyrics ]

Translations
[ Submit Translation ]

Related Star Lyrix Videos
```

This means the website can launch before the lyrics database is large.

---

# 12. YouTube Integration

Create:

```text
/youtube
/youtube/:videoId
/shorts
```

Homepage:

- Featured Star Lyrix Videos
- Latest Videos
- Trending Videos
- Short & Sweet
- Popular Artists
- Trending Genres

Video page:

- Embedded YouTube player
- Song metadata
- Artist
- Lyrics availability
- Translation count
- Share
- Related videos
- Related Shorts
- Playlist

Shorts page:

- Vertical-video cards
- Responsive grid
- Play
- Share
- Song/artist information
- Watch on YouTube

---

# 13. Watch & Share

Every video should support:

- Copy link
- WhatsApp
- Telegram
- X
- Facebook
- LinkedIn
- Native Web Share API

Default message:

```text
🎵 Check out this Star Lyrix lyric video!

[Title]

Watch now:
[URL]
```

---

# 14. Search

Initially use PostgreSQL search.

Search:

- Songs
- Artists
- YouTube videos
- Shorts
- Genres

Start with PostgreSQL full-text search and/or `pg_trgm`.

Consider external search such as Meilisearch, Typesense, Algolia, or OpenSearch only when the dataset grows enough to justify it.

---

# 15. A-Z Artist Directory

Route:

```text
/artists
```

Display:

```text
A B C D E F G H I J K L M
N O P Q R S T U V W X Y Z
```

Clicking a letter filters artists.

---

# 16. Authentication

Use Supabase Auth.

Support:

- Email/password
- Google OAuth
- Optional magic link
- Guest browsing

Authenticated users can:

- Save songs
- Create playlists
- Request lyrics
- Submit contributions
- Submit translations
- Save AI lyrics
- Manage profiles

---

# 17. Personal Library

Create:

```text
/library
```

Sections:

- Saved Songs
- Saved Lyrics
- Saved Videos
- Playlists
- AI Lyrics
- Followed Artists

---

# 18. Playlists

```sql
create table playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  description text,
  is_public boolean default false,
  created_at timestamptz default now()
);
```

Playlist items can reference songs, YouTube videos, and Shorts.

---

# 19. AI Lyrics Generator

Route:

```text
/ai-lyrics
```

Generate original lyrics from:

- Theme
- Mood
- Genre
- Language
- Rhyme scheme
- Syllable target
- Verse count
- Chorus
- Bridge
- Tone

The system must not reproduce copyrighted songs or ask the model to imitate a living artist's exact lyrical style.

---

# 20. AI Lyrics Storage

```sql
create table ai_lyrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  title text,
  prompt text,
  generated_text text,
  language_code text,
  genre text,
  settings jsonb,
  is_public boolean default false,
  created_at timestamptz default now()
);
```

Users can:

- Save
- Edit
- Delete
- Share
- Make public
- Keep private

Share route:

```text
/ai-lyrics/share/:id
```

---

# 21. AI Translation

Allow translation of:

- User-owned lyrics
- Original Star Lyrix content
- Licensed/authorized lyrics

Call translation services through Supabase Edge Functions so API secrets never reach the browser.

---

# 22. Lyric Video Maker

Route:

```text
/video-maker
```

MVP:

1. Enter title
2. Enter artist
3. Add original/authorized lyrics
4. Choose background
5. Choose font
6. Choose animation
7. Add timestamps
8. Preview

Future:

- Audio upload
- Video upload
- Waveform
- Automatic timing
- Karaoke effects
- Star Lyrix templates

Store user assets in Supabase Storage.

---

# 23. Supabase Storage

Suggested buckets:

```text
avatars
artist-images
song-artwork
blog-images
video-assets
audio-assets
ai-assets
```

Use private buckets for private/user-owned media and public buckets only for intentionally public content.

---

# 24. Community Blog

Route:

```text
/community
```

Topics:

- Song meanings
- Artist stories
- Music culture
- K-Pop
- Bollywood
- Global music
- Lyrics analysis
- Star Lyrix news

Use Supabase Postgres for articles and Supabase Storage for images.

---

# 25. Admin and Moderation

Route:

```text
/admin
```

Dashboard:

```text
Songs
Artists
YouTube Videos
Shorts
Pending Lyrics
Pending Translations
Contributions
Reports
Users
Blog
Requests
```

Moderator actions:

- Approve
- Reject
- Request changes
- Verify
- Flag
- Remove

Role management must be restricted to administrators.

---

# 26. Row Level Security

Enable RLS on all application tables.

Public users can read approved public content.

Authenticated users can:

- Create their own requests
- Create contributions
- Edit their own pending contributions
- Manage their own playlists
- Manage their own AI lyrics

Moderators can review/approve content.

Admins can manage roles and site-wide settings.

Never rely only on frontend checks for authorization.

---

# 27. Copyright and Rights Metadata

Every lyrics record should support:

```text
rights_status
rights_holder
license_reference
source_type
allowed_display
allowed_translation
allowed_synchronization
```

Possible statuses:

```text
unknown
owned
licensed
authorized
public_domain
pending_review
restricted
```

Do not scrape Genius, AZLyrics, LyricsFreak, or other lyrics websites merely to populate Star Lyrix.

Metadata retrieval and lyrics licensing should be treated separately.

---

# 28. Launch Phases

## Phase 1 — Launch Without a Lyrics Database

- [ ] Star Lyrix branding
- [ ] Homepage
- [ ] YouTube API integration
- [ ] Featured video carousel
- [ ] YouTube video page
- [ ] Shorts page
- [ ] Search
- [ ] Artist directory
- [ ] Genre pages
- [ ] Supabase Auth
- [ ] User profiles

## Phase 2 — Build the Catalog

- [ ] Song pages
- [ ] Lyrics request system
- [ ] Request voting
- [ ] Community contributions
- [ ] Translation submissions
- [ ] Moderation
- [ ] Verification
- [ ] Contributor profiles

## Phase 3 — Lyrics

- [ ] Authorized/licensed lyrics
- [ ] Translation system
- [ ] Lyrics search
- [ ] Karaoke synchronization
- [ ] Lyrics sharing

## Phase 4 — Creator Tools

- [ ] AI Lyrics Generator
- [ ] AI Translation
- [ ] Save/share AI lyrics
- [ ] Lyric Video Maker
- [ ] Timestamp editor
- [ ] Templates

## Phase 5 — Growth

- [ ] Blog
- [ ] Favorites
- [ ] Playlists
- [ ] Recommendations
- [ ] Analytics
- [ ] Contributor reputation
- [ ] Notifications
- [ ] Monetization

---

# 29. Recommended Initial Dataset

Do not target 100,000+ songs initially.

Start with:

```text
Star Lyrix YouTube videos
+
Star Lyrix Shorts
+
Artists appearing in your videos
+
Songs requested by users
+
Authorized/community contributions
+
Original Star Lyrix content
```

The catalog grows organically.

---

# 30. Recommended Stack

```text
Frontend
React / Next.js
TypeScript
Tailwind CSS

Backend
Supabase

Database
PostgreSQL

Authentication
Supabase Auth

Storage
Supabase Storage

Server-side Logic
Supabase Edge Functions

YouTube
YouTube Data API v3

AI
Secure server-side AI API

Translation
Secure server-side translation API

Search
PostgreSQL initially

Hosting
Firebase Hosting / Vercel / Netlify
```

If Firebase Hosting is already being used, keep Firebase Hosting for the frontend and use Supabase as the backend.

---

# 31. Immediate Build Order

Build in this order:

1. Star Lyrix design system
2. Header/footer
3. Homepage
4. Supabase project
5. PostgreSQL schema
6. Supabase Auth
7. YouTube synchronization
8. YouTube video page
9. Shorts page
10. Artist pages
11. Search
12. Song pages
13. Lyrics request system
14. Community contributions
15. Moderation
16. Translation
17. Profiles
18. Favorites/playlists
19. AI Lyrics Generator
20. Lyric Video Maker
21. SEO
22. Analytics
23. Security review
24. Production deployment

---

# 32. Final Product Concept

Star Lyrix should begin as:

> **A YouTube-powered music discovery and lyrics platform**

and evolve into:

> **A community-powered multilingual lyrics and music creator ecosystem.**

The key advantage is that a huge lyrics database is **not required for launch**.

Your YouTube channel provides the initial content.

Supabase provides the structured backend.

Users provide requests and authorized contributions.

The community progressively expands the catalog.

AI and creator tools differentiate Star Lyrix from a basic lyrics website.

The long-term flywheel is:

```text
Create
  ↓
YouTube
  ↓
Star Lyrix Website
  ↓
Discover
  ↓
Request
  ↓
Contribute
  ↓
Translate
  ↓
Verify
  ↓
Create More
  ↓
YouTube
```
