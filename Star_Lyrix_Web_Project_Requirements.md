# Star Lyrix Web Platform — Project Requirements

## 1. Project Overview

**Project Name:** Star Lyrix  
**Domain:** `starlyrix.com`  
**Primary Purpose:** Build a modern music and lyrics discovery platform around the Star Lyrix YouTube channel, combining lyric-video discovery, song/artist pages, community contributions, translations, AI-powered tools, and YouTube content.

The website should feel like a premium modern lyrics platform while maintaining a distinctive **dark + golden Star Lyrix visual identity**.

> Important: Commercial/public display of copyrighted song lyrics requires appropriate licensing/permissions. The platform should support licensed lyrics, user-owned/original lyrics, public-domain content, and properly authorized community submissions.

---

# 2. Product Vision

Star Lyrix should become more than a traditional lyrics website.

The platform should combine:

- 🎵 Song discovery
- 📝 Lyrics
- 🎬 Star Lyrix lyric videos
- 📱 YouTube Shorts
- 🌍 Multilingual lyrics and translations
- 👥 Community contributions
- ✅ Moderation and verification
- 🤖 AI-powered original lyrics generation
- 🎨 Lyric/video creation tools
- 🔎 Powerful song/artist search
- 📊 Trending music and community activity
- 📖 Music-related community content

The website should use the Star Lyrix YouTube channel as a major content source so that new YouTube uploads can automatically appear on the website.

---

# 3. Design Direction

## Visual Style

Create a premium, cinematic music-oriented interface.

### Primary Style

- Dark black/charcoal background
- Gold/golden-yellow accent color
- White/off-white typography
- Subtle gradients
- Minimal glow effects
- Musical symbols and star/celestial elements
- Clean modern cards
- Rounded corners
- Premium spacing
- Responsive design
- Avoid excessive neon effects
- Avoid overly complicated layouts

### Brand

Use:

**STARLYRIX**

Suggested positioning:

> Lyrics That Light Up Your World.

Alternative brand messaging can be configurable.

---

# 4. Technology Stack

## Frontend

Preferred:

- React
- TypeScript
- Vite or Next.js
- Tailwind CSS
- Responsive CSS
- Component-based architecture

## Backend

Firebase:

- Firebase Hosting
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Cloud Functions
- Firebase App Check where appropriate

## External Services

- YouTube Data API v3
- YouTube embedded player
- Optional Genius API for metadata/search where permitted
- Optional translation service such as Google Cloud Translation
- AI provider API for original lyrics generation
- Optional Hugging Face inference endpoint for future models

## Development

Use environment variables for all secrets.

Never expose:

- YouTube API secrets
- AI API keys
- Translation API secrets
- Firebase Admin credentials

in client-side source code.

---

# 5. Core Navigation

Create a consistent global header.

### Header

Left:

- Star Lyrix logo

Navigation:

- Discover
- Lyrics
- YouTube
- Shorts
- Artists
- Genres
- Community
- AI Tools

Right:

- Search
- Language selector
- Dark/Light toggle
- Login/Profile

Mobile:

- Logo
- Search
- Hamburger menu

---

# 6. Homepage

Create a highly visual homepage with the following sections.

## Hero Section

Include:

- Star Lyrix branding
- Short tagline
- Search bar
- Search suggestions
- CTA buttons:
  - Explore Lyrics
  - Watch Star Lyrix
  - Create Lyrics

Optional background:

- Dark celestial/music artwork
- Golden musical notes
- Stars

---

# 7. Featured Lyric Videos

Create a prominent carousel.

### Data Source

Automatically fetch Star Lyrix YouTube videos using YouTube Data API.

Display:

- Thumbnail
- Video title
- Artist
- Song title
- Duration where available
- Publication date
- Genre/category
- Watch button
- Share button

Clicking a card should open the internal video experience rather than immediately sending the user away from the website.

---

# 8. Star Lyrix YouTube Page

Create a dedicated `/youtube` page.

Features:

- Latest Star Lyrix videos
- Featured videos
- Popular videos
- Genre filters
- Search
- Pagination/infinite scrolling
- Playlist sections

Video cards should support:

- Thumbnail
- Hover interaction
- Play button
- Title
- Artist
- View/watch CTA
- Share
- Add to playlist

Include:

**Watch More on YouTube**

button linking to the official Star Lyrix channel.

---

# 9. YouTube Shorts

Create a dedicated `/shorts` page.

Also feature a Shorts section on the homepage.

### UI

Use a vertical-video card/grid similar to modern short-video interfaces.

Display:

- Shorts thumbnail
- Title
- Artist/song
- Play button
- Share
- YouTube link

Features:

- Responsive grid
- Horizontal scrolling section on desktop
- Swipe-friendly layout on mobile
- Lazy loading

Include:

**Watch More Shorts**

CTA.

---

# 10. Watch & Share

Every Star Lyrix video should have a sharing panel.

Options:

- Copy link
- WhatsApp
- Facebook
- X
- Telegram
- LinkedIn
- Native Web Share API when supported

Generate a default message:

> 🎵 Check out this Star Lyrix lyric video: [VIDEO TITLE]  
> Watch now: [VIDEO LINK]

Allow users to edit the message before sharing.

---

# 11. Lyrics System

Create song pages using a scalable structure.

Example:

`/lyrics/[artist]/[song]`

Display:

- Song title
- Artist
- Album
- Release year
- Language
- Genre
- Cover artwork
- Lyrics
- Star Lyrix video
- YouTube link
- Translation count
- Contributor information
- Verification status
- Related songs
- Related artists

---

# 12. Lyrics Display

Create a premium lyrics-reading interface.

Features:

- Clean typography
- Line spacing
- Copy controls where legally permitted
- Share lyric quote
- Translation selector
- Font size control
- Reading mode
- Dark/light mode
- Optional karaoke synchronization

Do not assume that full copyrighted lyrics can be displayed without licensing.

---

# 13. YouTube + Lyrics Experience

Create a unique split-screen experience:

Left:

- YouTube player

Right:

- Lyrics

Optional future functionality:

- Timestamped lyrics
- Current-line highlighting
- Auto-scroll
- Karaoke mode

The synchronization system should store timestamps as structured data rather than hard-coded UI text.

Example:

```json
{
  "line": "Example lyric line",
  "startMs": 12450,
  "endMs": 15800
}
```

---

# 14. Trending Now

Create a card-based section.

Cards can show:

- Song
- Artist
- Thumbnail
- Language
- Genre
- Views
- Likes where available
- Trending indicator

Ranking should be configurable.

---

# 15. Top New Songs This Week

Create a horizontal scrolling section.

Show:

- Album/song artwork
- Song title
- Artist
- Release date
- Language
- Listen/watch CTA

---

# 16. Most Streamed / Popular Artists

Create a horizontal artist section.

Circular profile images.

Each artist card:

- Image
- Artist name
- Number of songs
- Popularity indicator

Artist page:

`/artists/[artist]`

Include:

- Biography
- Songs
- Albums
- Genres
- Star Lyrix videos
- Shorts
- Related artists

---

# 17. Lyrics That Live Forever

Create a visually distinctive section for memorable/original/licensed lyric excerpts.

Use colorful premium cards.

Each card:

- Short excerpt
- Song title
- Artist
- Share button

Only display copyrighted excerpts where legally permitted.

---

# 18. Trending Lyrics by Genre

Create an icon-based category grid.

Initial genres:

- Pop
- Bollywood
- Hindi
- Hip-Hop
- Rap
- Rock
- EDM
- K-Pop
- Korean
- Spanish
- Punjabi
- Indie
- Classical
- Regional

Allow adding new genres from Firestore.

---

# 19. Language Support

Initial languages:

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

Allow future expansion.

Language selector should exist globally.

---

# 20. Translation System

Each song can have translations.

Example:

`lyrics/{songId}/translations/{translationId}`

Fields:

- language
- translatedText
- contributorId
- status
- verified
- createdAt
- updatedAt

UI:

**Translations (45)**

Clicking opens a language selector.

---

# 21. Community Contribution

Create a community-driven contribution system.

Users can:

- Submit lyrics they are authorized to submit
- Submit corrections
- Submit translations
- Add metadata
- Suggest artist information
- Report errors

Every submission should initially be:

`pending`

Possible states:

- pending
- approved
- rejected
- needs_changes

---

# 22. Moderation System

Create `/admin` or `/moderation`.

Moderator dashboard:

- Pending lyrics
- Pending translations
- Corrections
- Reports
- User activity
- Verification queue

Actions:

- Approve
- Reject
- Request changes
- Verify
- Remove
- Flag

Only authorized moderator/admin accounts can perform these actions.

Use Firebase Security Rules and server-side validation.

---

# 23. Verification System

Support badges such as:

- ✓ Verified Lyrics
- ✓ Verified Translation
- ✓ Verified Artist
- ✓ Official Star Lyrix
- ✓ Community Contributor

Do not use third-party trademarks such as “Verified by Musixmatch” unless legally authorized.

---

# 24. Contribution Tracking

User profile should display:

- Total contributions
- Approved contributions
- Translation contributions
- Corrections
- Verified contributions
- Badges
- Contribution history

Example:

> 29 Contributions

Create a contributor leaderboard.

---

# 25. User Authentication

Firebase Authentication.

Support:

- Email/password
- Google login
- Anonymous browsing

User profile:

- Display name
- Avatar
- Favorite songs
- Saved lyrics
- Playlists
- Contributions
- Badges
- Settings

---

# 26. Personal Library

Authenticated users can:

- Save songs
- Save lyrics
- Save videos
- Create playlists
- Follow artists
- Save AI-generated original lyrics

Firestore structure should be optimized for user-specific queries.

---

# 27. Search

Create global search.

Search across:

- Songs
- Artists
- Albums
- Genres
- Lyrics metadata
- Star Lyrix videos
- Shorts
- Community posts

Search UI should provide:

- Autocomplete
- Recent searches
- Popular searches
- Search categories
- No-result suggestions

For larger datasets, design the search layer so it can later move from Firestore-only search to Algolia/Typesense/Meilisearch/OpenSearch.

---

# 28. A-Z Artist Navigation

Create an artist directory.

Alphabet:

A–Z

Clicking a letter shows artists beginning with that letter.

Example:

`/artists/a`

---

# 29. Community Blog

Create `/community`.

Blog cards:

- Thumbnail
- Title
- Short description
- Author
- Date
- Category

Possible categories:

- Song meanings
- Artist stories
- Music culture
- Lyrics analysis
- K-Pop
- Bollywood
- Global music
- Tutorials
- Star Lyrix news

Use Firestore for content initially.

---

# 30. AI Lyrics Generator

Create an `/ai-lyrics` tool.

Important:

The generator should create **original lyrics**, not reproduce copyrighted songs or imitate a living artist's exact lyrical style.

Inputs:

- Theme
- Mood
- Genre
- Language
- Song structure
- Rhyme scheme
- Syllable target
- Verse count
- Chorus count
- Bridge
- Tone

Example controls:

Genre:
- Pop
- Rock
- Rap
- Hip-Hop
- EDM
- Bollywood-inspired broad genre
- K-Pop-inspired broad genre

Mood:

- Happy
- Sad
- Romantic
- Motivational
- Dark
- Energetic
- Peaceful

Rhyme:

- AABB
- ABAB
- Free verse

---

# 31. Save AI Lyrics

Authenticated users can save generated original lyrics.

Firestore:

`users/{uid}/generatedLyrics/{lyricsId}`

Store:

- title
- prompt
- generatedText
- language
- genre
- settings
- createdAt

---

# 32. Share AI Lyrics

Generate a shareable page:

`/ai-lyrics/share/[id]`

Allow:

- Copy link
- WhatsApp
- X
- Facebook
- Telegram
- Native Share API

Do not expose private drafts.

---

# 33. AI Translation

Allow users to translate their own/or authorized lyrics.

Languages:

- English
- Hindi
- Korean
- Spanish
- Punjabi
- Tamil
- Telugu
- Japanese

Use a translation API through a secure backend/serverless function.

Never expose translation API secrets in frontend code.

---

# 34. Lyric Video Maker

Create `/video-maker`.

MVP functionality:

1. Enter title
2. Enter artist
3. Add original/authorized lyrics
4. Select background
5. Select font
6. Select animation
7. Add timestamps
8. Preview
9. Export/share

Future:

- Audio upload
- Video upload
- Waveform
- Automatic timestamping
- Karaoke animation
- Golden Star Lyrix templates

Use Firebase Storage for user-authorized media.

---

# 35. AI-Assisted Lyric Video Creation

Future feature:

User provides:

- Original lyrics
- Audio they own/control
- Visual theme

AI assists with:

- Line segmentation
- Timing suggestions
- Scene suggestions
- Background prompts
- Typography recommendations

Do not automatically extract/reproduce copyrighted lyrics from third-party videos without authorization.

---

# 36. YouTube Data Integration

Use YouTube Data API v3.

Fetch:

- Channel information
- Videos
- Shorts
- Playlists
- Thumbnails
- Titles
- Descriptions
- Published dates

Recommended architecture:

YouTube API → Firebase Cloud Function → Firestore cache → Website

Do not call YouTube API from every visitor request.

Cache data in Firestore.

Create scheduled synchronization.

Example collection:

`youtubeVideos/{videoId}`

Fields:

- videoId
- title
- description
- thumbnail
- publishedAt
- channelId
- playlistIds
- category
- contentType
- tags
- updatedAt

---

# 37. YouTube Content Classification

Classify Star Lyrix uploads into:

- Lyric Video
- Short
- Playlist
- Featured
- Other

Allow manual overrides from admin.

---

# 38. YouTube Video Page

Create:

`/youtube/[videoId]`

Display:

- Embedded YouTube player
- Title
- Artist/song metadata
- Lyrics if authorized
- Translation selector
- Share controls
- Related videos
- Shorts
- Playlist
- Comments/community area where appropriate

---

# 39. Social Sharing

Implement:

- Web Share API
- WhatsApp
- Telegram
- X
- Facebook
- LinkedIn
- Copy Link

Generate Open Graph metadata for pages.

---

# 40. Dark/Light Mode

Default:

Dark mode.

Theme toggle:

- Dark
- Light
- System

Persist preference locally.

---

# 41. Responsive Design

Must work on:

- Desktop
- Laptop
- Tablet
- Mobile

Prioritize mobile UX because Shorts and music discovery are mobile-heavy experiences.

---

# 42. SEO

Implement SEO for:

- Song pages
- Artist pages
- Genre pages
- YouTube pages
- Blog posts
- AI tool pages

Include:

- Dynamic title
- Meta description
- Canonical URLs
- Open Graph
- Twitter/X cards
- Sitemap
- Robots.txt
- Structured data where applicable

Do not generate thousands of thin pages.

---

# 43. Performance

Implement:

- Lazy loading
- Image optimization
- YouTube thumbnail optimization
- Code splitting
- Caching
- Firestore query optimization
- Pagination
- Skeleton loading
- Error states

Avoid loading YouTube iframes until the user interacts where practical.

---

# 44. Firebase Data Model

Recommended high-level collections:

```text
users
songs
artists
albums
genres
translations
contributions
reports
youtubeVideos
playlists
blogPosts
aiLyrics
userPlaylists
favorites
notifications
settings
```

Use subcollections where user-specific or song-specific data is appropriate.

---

# 45. Security

Implement Firebase Security Rules.

Rules must ensure:

- Public users can read approved public content.
- Authenticated users can create contributions.
- Users can edit only their own pending contributions.
- Users cannot mark their own content verified.
- Only moderators can approve/verify.
- Only admins can manage roles.
- Private AI drafts are only accessible to their owner.

Use Cloud Functions for privileged operations.

---

# 46. Admin Dashboard

Create:

`/admin`

Dashboard cards:

- Total Songs
- Total Artists
- YouTube Videos
- Shorts
- Pending Contributions
- Pending Translations
- Reports
- Registered Users

Sections:

- Content Management
- YouTube Sync
- Moderation
- Users
- Genres
- Blog
- AI settings
- Site settings

---

# 47. Analytics

Track aggregate platform events:

- Song views
- Video clicks
- Shorts clicks
- Searches
- Shares
- Favorites
- Playlist additions
- Contributions
- Translation submissions
- AI generator usage

Do not collect unnecessary personal information.

---

# 48. Footer

Footer sections:

### Star Lyrix

- About
- Contact
- Advertise
- Careers

### Explore

- Lyrics
- Artists
- Genres
- YouTube
- Shorts
- Community

### Tools

- AI Lyrics Generator
- Lyric Video Maker
- Translation

### Legal

- Terms
- Privacy
- Copyright
- DMCA/Content Removal
- Community Guidelines

### Social

- YouTube
- Instagram
- X
- Facebook

---

# 49. Copyright & Content Policy

Build a dedicated copyright workflow.

Features:

- Copyright notice
- Rights-holder contact
- Content removal request
- Report content
- Moderation queue
- Source/authorization metadata
- License status

Each lyric record should optionally contain:

```text
rightsStatus
rightsHolder
licenseSource
licenseReference
allowedDisplay
allowedTranslation
allowedSynchronization
```

Do not automatically scrape lyrics from third-party websites.

---

# 50. MVP Development Phases

## Phase 1 — Foundation

- [ ] React/TypeScript project
- [ ] Firebase configuration
- [ ] Firebase Hosting
- [ ] Firestore
- [ ] Authentication
- [ ] Dark/golden design system
- [ ] Header/footer
- [ ] Responsive layout

## Phase 2 — YouTube

- [ ] YouTube API integration
- [ ] Video synchronization
- [ ] Video page
- [ ] Featured carousel
- [ ] Shorts page
- [ ] Playlist integration
- [ ] Watch/share functionality

## Phase 3 — Lyrics

- [ ] Song model
- [ ] Artist model
- [ ] Genre model
- [ ] Lyrics pages
- [ ] Translation UI
- [ ] Search
- [ ] A-Z artists

## Phase 4 — Community

- [ ] Authentication
- [ ] Contributions
- [ ] Translation submissions
- [ ] Corrections
- [ ] Moderation
- [ ] Verification
- [ ] Contributor profiles
- [ ] Leaderboard

## Phase 5 — AI

- [ ] AI lyrics generator
- [ ] Customization controls
- [ ] Save generated lyrics
- [ ] Share generated lyrics
- [ ] Translation
- [ ] Usage limits

## Phase 6 — Creator Tools

- [ ] Lyric Video Maker
- [ ] Timestamp editor
- [ ] Video preview
- [ ] Templates
- [ ] Export workflow

## Phase 7 — Growth

- [ ] Blog
- [ ] SEO
- [ ] Analytics
- [ ] Notifications
- [ ] Favorites
- [ ] Playlists
- [ ] Personalized discovery

---

# 51. Suggested Routes

```text
/
 /discover
 /lyrics
 /lyrics/:artist/:song
 /artists
 /artists/:artist
 /genres
 /genres/:genre
 /youtube
 /youtube/:videoId
 /shorts
 /community
 /community/:postSlug
 /search
 /contribute
 /translate
 /ai-lyrics
 /ai-lyrics/share/:id
 /video-maker
 /profile
 /profile/:username
 /playlists
 /settings
 /login
 /admin
```

---

# 52. UX Principles

The website should feel:

- Fast
- Premium
- Music-focused
- Community-driven
- Modern
- Easy to search
- Mobile-friendly
- Visually consistent

Avoid:

- Clutter
- Excessive animations
- Excessive neon
- Autoplay audio
- Popups on every page
- Huge blocks of text
- Poor mobile navigation

---

# 53. Final Goal

Build Star Lyrix as a **YouTube-powered music and lyrics ecosystem**, not merely a lyrics database.

The primary growth loop should be:

**YouTube Video → Star Lyrix Website → Song/Lyrics Page → Discover Related Songs → Share → YouTube Channel**

And the community loop:

**User → Contribution → Moderation → Verification → Reputation → More Contributions**

And the creator loop:

**User → AI Lyrics → Save → Share → Lyric Video Maker → Original Content**

The architecture must be modular so that features can be added without rebuilding the entire application.

The first implementation should prioritize a polished MVP, working YouTube integration, responsive design, Firestore-backed content, authentication, community contribution workflow, and scalable foundations for AI tools.
