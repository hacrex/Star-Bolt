# Star Lyrix

A community-driven lyrics platform where music lovers create, share, and discover lyrics. Built with React, TypeScript, and Supabase.

## Features

- **Search & Discover** — Browse and search songs by title, artist, or lyrics
- **AI Lyrics Generation** — Create unique lyrics with OpenAI (GPT-3.5-turbo), configurable by genre, mood, rhyme scheme, and syllable count
- **Multilingual Translation** — Translate generated lyrics into 9 languages via Google Translate API
- **Playlists** — Create and manage personal playlists
- **Comments & Ratings** — Discuss songs and rate them 1-5 stars
- **Favorites** — Save songs to your favorites collection
- **Dark/Light Mode** — Toggle theme with localStorage persistence
- **Export & Share** — Download lyrics as `.txt` or share via Web Share API

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, PostCSS, Autoprefixer |
| State | Zustand |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| AI | OpenAI API, Google Translate API |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/Hacrex/Star-Bolt.git
cd Star-Bolt
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Database

The app uses Supabase with 3 migrations creating 9 tables:

| Table | Purpose |
|---|---|
| `users` | Extended user profiles (username, avatar) |
| `songs` | Song metadata (title, artist, album, thumbnail) |
| `lyrics` | Song lyrics content |
| `comments` | User comments on songs |
| `ratings` | 1-5 star ratings per user per song |
| `playlists` | User-created playlists |
| `playlist_songs` | Playlist-song junction table |
| `favorites` | User song favorites |
| `generated_lyrics` | AI-generated lyrics with settings |

All tables have Row Level Security (RLS) enabled.

## Project Structure

```
src/
  components/     # Reusable UI components
  pages/          # Route-level page components
  store/          # Zustand state stores
  lib/            # Supabase client & DB types
  context/        # Theme context provider
supabase/
  migrations/     # SQL migration files
```

## License

This project is private and not publicly licensed.
