# Star Lyrix marketing-site release readiness

**Date:** 2026-08-24  
**Scope:** Marketing-first public surface for Star Lyrix Creator Studio.

## Product direction

The public site now sells the product story: Star Lyrix Creator Studio helps creators shape original lyrics, think in lyric-led video scenes, and publish short visual moments when the underlying rights are clear. The application surfaces remain authenticated. Public users see the Creator Studio marketing homepage, the official Star Lyrix YouTube Shorts gallery, and a rights-aware Lyrics Reader.

## Implemented routes

| Route | Public behavior |
|---|---|
| `/` | Creator Studio marketing homepage with original-first positioning, product principles, Shorts entry point, and Lyrics Reader entry point. |
| `/lyrics` | Public catalog search boundary. Spotify is used for track identity/matching; lyric text is displayed only from a configured licensed Musixmatch Pro endpoint. |
| `/shorts` | Public curated Star Lyrix channel gallery. Items come from an explicit server-side playlist or video allowlist and link to `https://www.youtube.com/@starlyrix`. |
| `/videos` | Redirects to `/shorts` for backward compatibility. |
| `/ai-lyrics` | Protected; signed-out users are redirected to `/auth`. |
| `/creator` | Protected Creator Studio landing page. |
| `/settings/ai` | Protected BYOK provider settings. |
| `/search` | Existing catalog route retained as a legacy/internal discovery surface; it is no longer the marketing primary navigation. |

## Verification

TypeScript, Vite production build, targeted ESLint, and `git diff --check` passed after the rewrite. The Playwright smoke suite passed **22 tests**, including the marketing homepage, public Lyrics Reader, public Shorts page, mobile navigation, command palette, legal routes, SPA fallback behavior, missing-song resilience, and signed-out redirects for all creator/application routes.

The deployed audit found that `https://starlyrix.vercel.app/` rendered the previous discovery-first shell, while direct navigation to `/ai-lyrics` returned Vercel `404: NOT_FOUND`. The new `vercel.json` catch-all rewrite is intended to resolve direct client-side routes after redeployment; the deployed domain must be verified again after Vercel publishes this branch.

## External integration boundaries

The YouTube Data API supports channel, video, playlist, and playlist-item resources and requires an API key or OAuth token for requests [1]. It does not provide a documented Shorts-specific resource; the implementation therefore uses a curated playlist or explicit video allowlist rather than an undocumented endpoint.

Musixmatch Pro documents a licensed lyrics and music-data catalog, API-key onboarding, content restrictions, lyrics-view tracking, and a pre-launch checklist [2]. The Lyrics Reader must not use unofficial or reverse-engineered endpoints, and production display requires the correct Musixmatch agreement and configuration.

Spotify’s Web API search returns catalog information for tracks, artists, albums, playlists, and related media [3]. The implementation uses Spotify for catalog matching and outbound track links only; it does not claim Spotify supplies lyric text. Spotify’s policy notes must also be reviewed before using catalog data in any AI workflow.

## Required deployment configuration

Configure `YOUTUBE_API_KEY` plus either `YOUTUBE_SHORTS_PLAYLIST_ID` or `YOUTUBE_SHORTS_VIDEO_IDS` as Supabase Edge Function secrets. Configure `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` for catalog matching. Configure `MUSIXMATCH_PRO_API_KEY`, `MUSIXMATCH_PRO_SEARCH_ENDPOINT`, and `MUSIXMATCH_PRO_LYRICS_ENDPOINT` only after confirming the licensed Musixmatch Pro endpoint contract for the account. These must never be exposed as `VITE_*` variables.

The public media function is intentionally honest when configuration is absent: the Shorts page keeps the official channel link, and the Lyrics Reader shows catalog/authorization availability rather than fabricated tracks or lyrics. No live provider credentials, authenticated account, or deployed integration request was used in this workspace.

## References

[1]: https://developers.google.com/youtube/v3/docs "YouTube Data API reference"

[2]: https://docs.musixmatch.com/overview "Musixmatch Pro API documentation"

[3]: https://developer.spotify.com/documentation/web-api/reference/search "Spotify Web API Search reference"
