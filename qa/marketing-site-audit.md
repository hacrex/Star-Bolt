# Star Lyrix marketing-site audit

**Audited URL:** https://starlyrix.vercel.app/  
**Date:** 2026-08-24

The deployed homepage currently presents the Star Lyrix shell with public navigation for Discover, Lyrics, Videos, and AI Lyrics, plus a visible Sign in action. The homepage exposes discovery cards, mood/category links, Explore lyrics, Create lyrics, and footer links for My Lyrics, Playlists, and Contribute. The current public surface does not yet communicate a focused Creator Studio product story, and the AI Lyrics entry is visibly reachable before authentication even though generation is provider/auth dependent.

The requested product direction is to make the public site a marketing site for **Star Lyrix Creator Studio**, with creator tools and BYOK provider settings behind login. The public site should show only Star Lyrix’s YouTube channel Shorts gallery at https://www.youtube.com/@starlyrix and a safe lyrics-reader/discovery experience. The latter must use only provider-authorized lyrics and should integrate Musixmatch and Spotify through server-side/provider-approved flows rather than scraping or exposing provider credentials.

The browser capture had one transient blank/about:blank follow-up state after the initial deployed-page extraction, so implementation decisions are based on the successful first extraction and repository source inspection. No account was used and no external provider credentials were entered.

## Official integration findings

The official YouTube Data API reference exposes supported `channels`, `videos`, `playlistItems`, `playlists`, `search`, and related resources, and requires an API key or OAuth token for requests. It does not document a dedicated Shorts API resource, so the public gallery should be sourced from the Star Lyrix channel’s public uploads/playlist data and rendered as links or official embeds, with Shorts classification handled from returned video metadata or a curated allowlist. Source: [YouTube Data API reference](https://developers.google.com/youtube/v3/docs).

The official Musixmatch Pro documentation describes a licensed music-data catalog with lyrics and translation APIs, an API-key onboarding flow, content restrictions, lyrics-view tracking, and a checklist before going live. Any Star Lyrix lyrics display must be gated on an approved Musixmatch commercial/API agreement and its display/tracking requirements; reverse-engineered or unofficial endpoints are not acceptable. Source: [Musixmatch Pro API documentation](https://docs.musixmatch.com/overview).

Spotify’s official Web API search reference supports catalog metadata for tracks, artists, albums, playlists, shows, episodes, and audiobooks through OAuth-backed search. It does not provide lyric text in the search response, and the documentation includes a policy note prohibiting use of Spotify content to train machine-learning or AI models. Star Lyrix should therefore use Spotify for catalog identity, cover art, preview/deep links where permitted, and matching—not as a lyric source. Source: [Spotify Web API Search reference](https://developer.spotify.com/documentation/web-api/reference/search).

Direct navigation to `https://starlyrix.vercel.app/ai-lyrics` returned a Vercel `404: NOT_FOUND` response, indicating the deployed project currently lacks SPA fallback behavior for deep links or the deployment is not aligned with the repository branch. This is a deployment/configuration gate separate from the local route implementation.
