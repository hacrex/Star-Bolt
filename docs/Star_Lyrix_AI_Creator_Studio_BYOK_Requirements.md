# Star Lyrix — AI Creator Studio & BYOK Video Generation Requirements

## 1. Project Overview

**Project:** Star Lyrix  
**Website:** https://starlyrix.com  
**Core backend:** Supabase  
**Reference project:** MoneyPrinterTurbo — https://github.com/harry0703/MoneyPrinterTurbo/

Star Lyrix should take inspiration from the **AI video-production pipeline, multi-provider AI configuration, subtitles, stock/AI visual sourcing, batch generation, rendering, and API/WebUI architecture** demonstrated by MoneyPrinterTurbo, while building a product specifically for music, lyrics videos, Shorts, and Star Lyrix YouTube content.

MoneyPrinterTurbo's repository describes a one-stop AI short-video workflow that can generate scripts, find materials, generate subtitles/music, and synthesize videos. Its configuration also exposes multiple LLM, TTS, media and API-key/provider options. 

### Critical Product Decision

Star Lyrix should use **BYOK — Bring Your Own Key** as the primary AI model.

A logged-in user connects their own AI provider/API key, then uses that provider to generate:

- Original lyrics
- Lyrics concepts
- Video plans
- Visual prompts
- Voiceover/narration
- Subtitles
- Lyric videos
- Shorts
- Social captions

Star Lyrix should therefore avoid making every user's AI generation a platform-wide inference expense.

---

# 2. Product Vision

## Star Lyrix AI Creator Studio

> **Bring your own AI. Create your own lyrics. Make your own videos.**

Complete flow:

```text
User Login
    ↓
AI Provider Setup
    ↓
Add / Connect Own API Key
    ↓
AI Lyrics Generator
    ↓
Edit / Approve Lyrics
    ↓
Lyric Video Creator
    ↓
Visual + Subtitle + Audio Pipeline
    ↓
FFmpeg Rendering Worker
    ↓
Supabase Storage
    ↓
Preview / Export
    ↓
Generate Shorts
    ↓
Publish / Share
    ↓
Star Lyrix YouTube
```

---

# 3. Inspiration from MoneyPrinterTurbo

Do not copy MoneyPrinterTurbo's product identity or UI.

Use its **architecture and feature concepts as inspiration**:

- AI script generation
- Custom scripts
- Multiple video sizes
- 9:16 and 16:9 output
- Batch video generation
- Multi-language generation
- Multiple TTS providers
- Subtitle generation and styling
- Background music
- Pexels/Pixabay/Coverr/local media sources
- AI-generated video material
- API and WebUI access
- Configurable LLM providers and API keys
- FFmpeg-based rendering
- Cross-platform publishing integrations

For Star Lyrix, adapt these capabilities to a music-first workflow:

```text
Music
+
Lyrics
+
Visuals
+
Subtitles
+
Karaoke Timing
+
Lyric Videos
+
Shorts
+
YouTube
```

---

# 4. Star Lyrix Product Difference

MoneyPrinterTurbo is generalized AI short-video generation.

Star Lyrix should specialize the pipeline for:

> **Music → Lyrics → Visuals → Subtitles → Lyric Video → Shorts → YouTube**

The platform should support:

### A. AI-generated original content

Example:

> Create an original emotional Hindi pop song about long-distance love.

### B. User-owned / licensed / authorized material

Examples:

- User's own song
- User's own lyrics
- Licensed lyrics
- Authorized artist content
- Original Star Lyrix content

Do **not** build an automatic workflow that copies arbitrary copyrighted lyrics from third-party lyrics websites and converts them into videos.

---

# 5. BYOK Architecture

Each user manages their own AI provider credentials.

```text
                     STAR LYrix
                         |
                     Logged In
                         |
                   AI Provider
                         |
          +--------------+--------------+
          |              |              |
        OpenAI         Gemini        OpenRouter
          |              |              |
          +--------------+--------------+
                         |
                    User API Key
                         |
                  Secure Secret Store
                         |
                  Creator Studio
```

The API key must never be exposed to the browser after it is saved.

---

# 6. Supported AI Providers

Initial provider list:

- OpenAI
- Google Gemini
- Anthropic Claude
- DeepSeek
- Qwen
- OpenRouter
- Moonshot / Kimi
- Groq
- xAI / Grok
- MiniMax
- Cloudflare AI Gateway
- ModelScope
- AIHubMix
- AIML API
- EvoLink
- OneAPI
- LiteLLM
- Ollama
- Custom OpenAI-compatible endpoint

The exact provider registry should be configurable so new providers can be added without changing the creator UI.

MoneyPrinterTurbo's current configuration demonstrates a multi-provider model registry with provider-specific API keys, model names, and base URLs, including OpenAI, Anthropic, Gemini, DeepSeek, Qwen, Azure, Grok, MiniMax, Xiaomi MiMo, Cloudflare, ModelScope, AIHubMix, AIML API, EvoLink, Ollama, OneAPI, LiteLLM and Groq.

---

# 7. AI Settings Page

Route:

```text
/settings/ai
```

UI:

```text
┌─────────────────────────────────────────────┐
│ AI PROVIDERS                                │
├─────────────────────────────────────────────┤
│ OpenAI                         [Connected ✓] │
│ sk-••••••••••••                        │
│ [Change] [Remove]                           │
│                                             │
│ Google Gemini                 [Not Connected]│
│ [Add API Key]                               │
│                                             │
│ Anthropic                     [Not Connected]│
│ [Add API Key]                               │
│                                             │
│ DeepSeek                      [Not Connected]│
│ [Add API Key]                               │
│                                             │
│ OpenRouter                    [Not Connected]│
│ [Add API Key]                               │
│                                             │
│ Ollama                        [Configure]    │
│                                             │
└─────────────────────────────────────────────┘
```

User can:

- Add provider
- Add API key
- Validate key
- Select default model
- Select default provider
- Remove provider
- Disable provider
- Test connection

Never display the full saved key again.

---

# 8. BYOK Security Requirements

## Never store API keys in normal profile rows

Do not create:

```text
profiles.openai_api_key
profiles.gemini_api_key
```

Do not store raw API keys in normal Postgres tables.

Recommended flow:

```text
Browser
   ↓
Supabase authenticated request
   ↓
Secure server-side secret storage
   ↓
Edge Function / API service
   ↓
Provider
```

The database should store only metadata/reference information.

Example:

```sql
create table user_ai_providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  provider text not null,
  model_name text,
  key_reference text,
  base_url text,
  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, provider)
);
```

`key_reference` must not be the raw API key.

---

# 9. AI Provider Abstraction

Build a common interface:

```ts
interface AIProvider {
  validateCredentials(): Promise<boolean>;
  generateText(request: TextGenerationRequest): Promise<TextGenerationResponse>;
  listModels?(): Promise<ModelInfo[]>;
}
```

Provider adapters:

```text
providers/
  openai.ts
  gemini.ts
  anthropic.ts
  deepseek.ts
  qwen.ts
  openrouter.ts
  groq.ts
  ollama.ts
  custom-openai.ts
```

This makes the application provider-independent.

---

# 10. Custom OpenAI-Compatible Provider

Allow advanced users to enter:

```text
Provider Name
Base URL
API Key
Model Name
```

Example:

```text
Provider:
Custom

Base URL:
https://example.com/v1

Model:
my-model

API Key:
••••••••
```

This is important for self-hosted and gateway solutions.

---

# 11. Ollama Support

Support local AI.

Example:

```text
Provider:
Ollama

Endpoint:
http://localhost:11434

Model:
qwen
```

Important browser/security considerations:

- The user's browser must be able to reach the local endpoint.
- CORS/network restrictions must be handled.
- Never assume every hosted website can directly access localhost.
- Prefer a secure local agent/desktop companion in a future phase if direct browser access becomes unreliable.

---

# 12. AI Jobs

All expensive generation tasks should be asynchronous.

```sql
create table ai_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  provider text,
  model text,
  job_type text not null,
  status text default 'queued',
  progress integer default 0,
  input_data jsonb,
  output_data jsonb,
  error_message text,
  created_at timestamptz default now(),
  started_at timestamptz,
  completed_at timestamptz
);
```

Job types:

```text
lyrics_generation
lyrics_revision
lyrics_translation
video_concept
scene_plan
visual_prompt
voice_generation
subtitle_generation
video_render
short_generation
social_caption
```

Statuses:

```text
queued
processing
rendering
completed
failed
cancelled
published
```

---

# 13. AI Lyrics Generator

Route:

```text
/ai-lyrics
```

Inputs:

- Theme
- Language
- Genre
- Mood
- Tone
- Rhyme scheme
- Syllable target
- Song length
- Verse count
- Chorus
- Bridge
- Custom instructions

Example:

```text
Theme:
Long-distance love

Language:
Hindi

Genre:
Pop

Mood:
Emotional

Rhyme:
AABB

Structure:
Verse
Chorus
Verse
Bridge
Chorus
```

Output:

```text
Title

Verse 1
...

Chorus
...

Verse 2
...

Bridge
...

Chorus
...
```

Actions:

- Regenerate
- Rewrite selected section
- Shorten
- Expand
- Change mood
- Translate
- Save
- Create video

The system must generate original content and avoid reproducing copyrighted songs.

---

# 14. AI Lyrics to Video Pipeline

Primary flow:

```text
Original / Authorized Lyrics
       ↓
AI Video Concept
       ↓
Scene Plan
       ↓
Visual Selection
       ↓
Audio / Voice / User Audio
       ↓
Lyrics Timing
       ↓
Subtitle Styling
       ↓
FFmpeg Render
       ↓
Final MP4
```

---

# 15. Creator Studio

Route:

```text
/creator
```

Dashboard:

```text
┌─────────────────────────────────────────────┐
│ STAR LYrix CREATOR STUDIO                   │
├─────────────────────────────────────────────┤
│                                             │
│  ✨ AI Lyrics        🎬 Lyric Video         │
│  📱 Shorts          🎨 Visualizer            │
│  🎙 Voiceover       ✨ Meaning Video         │
│                                             │
│─────────────────────────────────────────────│
│ Recent Projects                             │
│                                             │
│ Hindi Song          Rendering 82%           │
│ K-Pop Short         Published               │
│ Romantic Song       Draft                   │
│                                             │
└─────────────────────────────────────────────┘
```

---

# 16. Lyric Video Maker

Route:

```text
/creator/lyrics-video
```

Inputs:

- Song title
- Artist
- Authorized/original lyrics
- Audio
- Cover image
- Visual template
- Font
- Lyrics animation
- Background
- Aspect ratio

Formats:

```text
16:9 — YouTube
9:16 — YouTube Shorts
1:1 — Social
```

---

# 17. Star Lyrix Templates

Build original branded templates.

### Star Gold

Black background + gold typography + subtle stars.

### Cosmic Lyrics

Stars + constellations + animated lyrics.

### Karaoke

Large lyrics + active-line highlighting.

### Cinematic

Large typography + cinematic footage.

### Dark Minimal

Black + white + subtle gold.

### Bollywood Mood

Indian-inspired cinematic visuals.

### K-Pop Mood

Modern energetic visual design.

Templates should be configurable in the database.

---

# 18. Lyrics Synchronization

Support timestamped lyrics:

```json
{
  "line": "Example lyric line",
  "startMs": 12450,
  "endMs": 15800
}
```

Pipeline:

```text
Audio
 ↓
Whisper / transcription
 ↓
Timestamped segments
 ↓
Lyrics alignment
 ↓
Manual adjustment
 ↓
Karaoke rendering
```

Allow manual editing because automatic transcription/alignment is not always perfect.

---

# 19. Subtitle Designer

Controls:

- Font
- Font size
- Color
- Outline
- Shadow
- Position
- Alignment
- Animation
- Active-line color
- Background opacity
- Letter spacing

---

# 20. Video/Visual Sources

Support:

### User assets

- User-uploaded video
- User-uploaded images
- User-owned audio
- Cover art

### Stock media

- Pexels
- Pixabay
- Coverr

### Generated visuals

- AI image generation
- AI video generation

### Star Lyrix library

- Stars
- Galaxies
- Rain
- City
- Ocean
- Mountains
- Golden particles
- Abstract music backgrounds
- Brand assets

---

# 21. Background Music

Support:

- User-owned audio
- Licensed/authorized music
- Original/generated background music
- Star Lyrix music library

Controls:

- Volume
- Fade in
- Fade out
- Ducking
- Start offset
- Loop

Do not automatically use copyrighted commercial music without the necessary rights.

---

# 22. Voiceover

Use TTS for creator content such as:

- Behind the Lyrics
- Song meaning
- Artist story
- Music facts
- Intro/outro
- Community content

Potential providers:

- Google
- Azure
- ElevenLabs
- Other supported TTS providers

Do not use TTS as a substitute for a singer unless the user has the necessary rights/permissions.

---

# 23. AI Shorts Generator

Route:

```text
/creator/shorts
```

Input:

- Full lyric video
- Song
- Original/authorized lyrics

Output:

```text
Short #1 — Chorus
Short #2 — Verse
Short #3 — Best Line
Short #4 — Emotional Moment
Short #5 — Quote
```

Allow:

```text
Generate 3
Generate 5
Generate 10
```

Each Short:

- 9:16
- Captions
- Star Lyrix branding
- Hook text
- CTA
- YouTube-ready output

---

# 24. AI Content Factory

One song should be able to generate:

```text
1 Full Lyrics Video
5 Shorts
1 Quote Card
1 Song Meaning Video
1 Blog Post Draft
1 Social Caption Set
1 YouTube Description
```

Workflow:

```text
Song
 ↓
AI analysis
 ↓
Content plan
 ↓
Generate assets
 ↓
Render
 ↓
Review
 ↓
Publish
```

---

# 25. Batch Generation

Allow:

```text
Generate 5 Shorts
Generate 10 Shorts
Generate 3 visual variations
Generate 3 title variations
Generate 3 thumbnail concepts
```

Track each task separately.

---

# 26. FFmpeg Rendering

Do not run heavy rendering in Supabase Edge Functions.

Recommended architecture:

```text
Supabase
  |
  | create video job
  ↓
Rendering Worker
  |
  ├── FFmpeg
  ├── Whisper
  ├── Image processing
  ├── Audio processing
  └── Video processing
  |
  ↓
Supabase Storage
```

Worker options:

- VPS
- Docker host
- GPU server
- Cloud Run
- ECS
- Kubernetes
- Dedicated worker machine

---

# 27. Video Jobs

```sql
create table video_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  project_id uuid,
  type text not null,
  status text default 'queued',
  progress integer default 0,
  input_data jsonb,
  output_url text,
  error_message text,
  created_at timestamptz default now(),
  started_at timestamptz,
  completed_at timestamptz
);
```

---

# 28. Supabase Storage

Buckets:

```text
avatars
song-artwork
user-audio
user-video
creator-assets
generated-videos
generated-shorts
generated-images
blog-images
```

Use private storage for user files.

Use signed URLs for controlled downloads.

Use public storage only for explicitly public assets.

---

# 29. Creator Projects

```sql
create table creator_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  name text not null,
  project_type text not null,
  status text default 'draft',
  settings jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Project types:

```text
lyrics_video
short
visualizer
meaning_video
social_package
```

---

# 30. YouTube Integration

Star Lyrix already uses YouTube as the initial content engine.

Create:

```text
/youtube
/shorts
/youtube/:videoId
```

Sync channel content into Supabase:

```text
YouTube
 ↓
YouTube Data API
 ↓
Supabase Edge Function
 ↓
Postgres cache
 ↓
Website
```

Store:

- Video ID
- Title
- Description
- Thumbnail
- Published time
- Playlist
- Content type
- Song
- Artist

---

# 31. Creator-to-YouTube Workflow

```text
Creator Studio
      ↓
Generate Video
      ↓
Preview
      ↓
Approve
      ↓
Export
      ↓
YouTube
      ↓
YouTube API
      ↓
Supabase
      ↓
Star Lyrix website
```

Future publishing:

- YouTube
- YouTube Shorts
- Instagram
- TikTok
- Other platforms through a publishing provider

---

# 32. YouTube Content Classification

Classify:

```text
lyric_video
short
meaning_video
artist_story
community
other
```

Allow manual admin override.

---

# 33. Lyrics Database Strategy

Star Lyrix does not require a huge database at launch.

Start with:

```text
Star Lyrix YouTube videos
+
Star Lyrix Shorts
+
Artists discovered through your content
+
Requested songs
+
Authorized submissions
+
Licensed lyrics
+
Original Star Lyrix content
```

The database should grow organically.

---

# 34. Lyrics Request System

If a song is missing:

```text
Song not found?

[ Request This Song ]
```

Schema:

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
```

This becomes Star Lyrix's content roadmap.

---

# 35. Community Contribution

Users can submit:

- Authorized lyrics
- Translations
- Corrections
- Song metadata
- Artist information

Workflow:

```text
User
 ↓
Submission
 ↓
Pending
 ↓
Moderator
 ↓
Approved
 ↓
Verified
```

---

# 36. Translation System

Languages:

- English
- Hindi
- Korean
- Spanish
- Punjabi
- Tamil
- Telugu
- Marathi
- Bengali
- Japanese

Translations must only be generated/displayed where the underlying lyrics/content is authorized for the intended use.

---

# 37. User Authentication

Use Supabase Auth.

Support:

- Email/password
- Google OAuth
- Optional magic link

Users manage:

- AI providers
- Projects
- Lyrics
- Videos
- Shorts
- Playlists
- Favorites
- Contributions

---

# 38. User Profile

Display:

```text
Profile
───────
29 Contributions
18 Approved
7 Translations
4 Corrections
3 Verified

AI Providers
OpenAI ✓
Gemini ✓

Projects
12
```

---

# 39. Usage and Cost Transparency

Because users provide their own API keys, show:

```text
Provider: OpenAI
Model: selected model
Key: Connected
```

Also show job-level information when available:

```text
AI generation completed
Provider: OpenAI
Model: ...
Provider usage: available / unavailable
```

Do not claim exact billing amounts unless the provider exposes reliable usage/cost data.

---

# 40. Optional Star Lyrix AI Mode

In the future:

```text
AI Mode

○ My API Key (BYOK)
○ Star Lyrix AI Credits
○ Local / Ollama
```

### BYOK

User pays provider directly.

### Star Lyrix AI

Star Lyrix charges credits/subscription.

### Local AI

User supplies local Ollama or another supported endpoint.

---

# 41. AI Provider Test

Before saving a provider:

```text
[ Test Connection ]
```

Success:

```text
✓ Connection successful

Provider:
Gemini

Model:
...

Ready to generate.
```

Failure:

```text
✕ Authentication failed

Check:
- API key
- Model name
- Base URL
```

Do not expose secret values in errors or logs.

---

# 42. Error Handling

Common errors:

```text
invalid_api_key
provider_unavailable
rate_limited
model_not_found
insufficient_quota
timeout
render_failed
storage_failed
youtube_publish_failed
```

Provide actionable messages without revealing credentials.

---

# 43. Security Requirements

Implement:

- Supabase RLS
- Authenticated API calls
- Secure server-side secret handling
- Signed URLs
- Input validation
- Rate limits
- Job ownership checks
- Admin/moderator roles
- Audit logs

Users must never be able to access another user's:

- API key references
- private assets
- private projects
- private AI outputs
- private videos

---

# 44. Content Safety / Copyright

Clearly distinguish:

### Original AI content

Generated by the user through their connected provider.

### User-owned content

Uploaded by the user.

### Licensed content

Covered by a license.

### Authorized community content

Submitted with permission/authorization.

### Restricted content

Not allowed to be displayed/generated into videos without rights.

Do not implement a tool intended to automatically scrape and republish full copyrighted lyrics.

---

# 45. Suggested Creator Routes

```text
/creator
/creator/new
/creator/lyrics
/creator/lyrics-video
/creator/shorts
/creator/visualizer
/creator/templates
/creator/projects
/creator/projects/:id
/creator/assets
/creator/queue
/creator/published
/settings/ai
```

---

# 46. Creator Workflow UI

```text
STEP 1
Choose Content

○ AI Lyrics
○ Existing Lyrics
○ YouTube Video
○ Upload Audio

        ↓

STEP 2
Choose AI Provider

OpenAI
Gemini
Claude
DeepSeek
Qwen
OpenRouter
Ollama
Custom

        ↓

STEP 3
Create / Edit

Lyrics
Concept
Visual Style
Timing

        ↓

STEP 4
Video Settings

16:9
9:16
1:1

        ↓

STEP 5
Generate

        ↓

STEP 6
Preview

        ↓

STEP 7
Export / Create Shorts

        ↓

STEP 8
Publish
```

---

# 47. MVP

## Phase 1

- [ ] Star Lyrix design system
- [ ] Supabase Auth
- [ ] User profiles
- [ ] AI Provider settings
- [ ] BYOK secret handling
- [ ] OpenAI provider
- [ ] Gemini provider
- [ ] OpenRouter provider
- [ ] Custom OpenAI-compatible provider
- [ ] AI Lyrics Generator
- [ ] Save AI lyrics

## Phase 2

- [ ] Creator Studio
- [ ] Templates
- [ ] Lyric Video Maker
- [ ] Subtitle styling
- [ ] Timestamp editor
- [ ] FFmpeg worker
- [ ] Supabase Storage
- [ ] Video preview
- [ ] Export

## Phase 3

- [ ] Shorts Generator
- [ ] Batch generation
- [ ] Visual generation
- [ ] TTS
- [ ] AI scene planner
- [ ] Content factory

## Phase 4

- [ ] YouTube publishing
- [ ] YouTube synchronization
- [ ] Social publishing
- [ ] Community contributions
- [ ] Lyrics requests
- [ ] Translation

## Phase 5

- [ ] Star Lyrix AI credits
- [ ] Usage analytics
- [ ] Billing
- [ ] Advanced AI providers
- [ ] Local AI / Ollama improvements
- [ ] Mobile/PWA experience

---

# 48. Final Star Lyrix Architecture

```text
                         STAR LYrix
                             |
              +--------------+--------------+
              |                             |
          Public Site                  Creator Studio
              |                             |
        Lyrics / Artists              BYOK AI
        YouTube / Shorts                  |
        Community                         |
              |                    +------+------+
              |                    |             |
              |                 AI LLM         AI Media
              |                    |             |
              |                    +------+------+
              |                           |
              |                    Video Pipeline
              |                           |
              |                    Whisper / TTS
              |                           |
              |                         FFmpeg
              |                           |
              +-------------+-------------+
                            |
                         Supabase
                +-----------+-----------+
                |           |           |
              Auth       Postgres     Storage
                |
              Users
```

---

# 49. Final Product Positioning

Star Lyrix should become:

> **A BYOK AI-powered lyrics and music video creation platform connected directly to a real YouTube content ecosystem.**

The key loop is:

```text
USER
 ↓
Connect Own AI API Key
 ↓
Generate Original Lyrics
 ↓
Edit / Approve
 ↓
Create Lyric Video
 ↓
Generate Shorts
 ↓
Preview
 ↓
Publish to YouTube
 ↓
Website Automatically Updates
```

This creates three connected products:

```text
1. Lyrics & Music Discovery
2. Community Lyrics Platform
3. AI Creator Studio
```

The core strategy is to borrow the **multi-provider AI, content pipeline, subtitle/media sourcing, batch generation and rendering concepts** from MoneyPrinterTurbo while making Star Lyrix specifically about **lyrics, music videos, Shorts, creators, and YouTube**.
