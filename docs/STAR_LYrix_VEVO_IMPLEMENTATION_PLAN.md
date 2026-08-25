# Star Lyrix — Vevo-for-Lyrics implementation plan

**Status:** Cached channel-video foundation implemented; staging sync validation pending  
**Source requirements:** [`Star_Lyrix_Vevo_for_Lyrics_Product_Requirements.md`](./Star_Lyrix_Vevo_for_Lyrics_Product_Requirements.md)  
**Related product plan:** [`STAR_LYrix_BYOK_IMPLEMENTATION_PLAN.md`](./STAR_LYrix_BYOK_IMPLEMENTATION_PLAN.md)

## Product interpretation

The attached document expands Star Lyrix from a lyrics reader into a connected media network with three products: public lyrics and music discovery, authorized lyric-media distribution, and an authenticated AI Creator Studio. The phrase **“The Vevo for Lyrics”** is strategic positioning, not a claim that Star Lyrix is affiliated with Vevo. The implementation must use “official,” “verified,” “authorized,” and “original” only when the platform has a documented basis for each label.

YouTube is the first distribution channel, while Star Lyrix is intended to become the durable destination. The product flywheel is sound: rights-holder or creator submission, rights review, lyric/video production, review, YouTube distribution, cached metadata, and discovery back on Star Lyrix. The current site already implements the Creator Studio/BYOK foundation, the marketing-first public surface, a rights-aware Lyrics Reader boundary, authorized Reading Room playback, translation versioning, private Realtime collaboration, and server-derived reputation. The remaining requirements are broader than the current MVP and must be staged rather than represented as already available.

## Current-state gap analysis

| Requirement family | Current repository status | Safe next decision |
|---|---|---|
| Marketing positioning | Implemented on `/` with Creator Studio messaging, public `/lyrics`, and `/shorts`. | Keep public pages focused; do not expose private creator dashboards to crawlers. |
| YouTube distribution | Public gallery function exists and accepts a server-side playlist or video allowlist, but it is live-fetch oriented. | Add a cached `youtube_videos` catalog and a controlled sync function; never query YouTube on every page request. |
| Lyrics discovery | Spotify matching and licensed Musixmatch boundary exist; Spotify is not treated as a lyric source. | Keep lyric text behind explicit licensed/rights-approved metadata and preserve source attribution. |
| Reading Room/player | Authorized audio gate and synchronized lyric cues already exist. | Extend with cached video/song/artist identity only after rights and source fields are present. |
| Artist/channel/album graph | Not implemented as first-class public entities. | Add normalized entities only after the video cache contract; avoid thin SEO pages. |
| Community, requests, moderation | Some contribution and reputation foundations exist; full request/moderation/admin platform is not complete. | Defer until moderator roles, audit logs, RLS policies, and abuse workflows are specified. |
| Creator Studio | Protected `/creator`, `/ai-lyrics`, `/settings/ai`, and secure BYOK generation are implemented. | Add projects/jobs only with a worker-backed lifecycle and owner-scoped RLS. |
| Rendering/media factory | Not implemented; no FFmpeg/Whisper/TTS worker is attached. | Do not simulate rendering or publishing. Use a future job contract and dedicated worker. |
| Publishing/analytics/monetization | Not implemented. | Defer YouTube OAuth/publishing, charts, billing, and creator analytics until review and audit boundaries exist. |

## Architecture decision

The next implementation slice is a **cached YouTube content identity foundation**. It adds a public-read, server-written `youtube_videos` catalog for Star Lyrix channel items, retains the source YouTube URL and content classification, and makes no rights claim about associated lyrics or audio. A controlled sync function will read only the configured Star Lyrix playlist or explicit video allowlist and upsert metadata. The public media gateway can serve the cache first and use the live API only as a staging fallback.

This is preferred over immediately adding artists, albums, charts, or a video renderer because it establishes the content identity required by all of them while reducing YouTube quota use and avoiding a large graph with no trusted ingestion path. Metadata and lyrics rights remain separate. A cached YouTube row is not permission to copy lyrics, download audio/video, or host media outside approved YouTube playback/link rules.

## Proposed data boundaries

| Data | Stored in Star Lyrix | Publicly returned |
|---|---|---|
| YouTube video ID, title, description, thumbnail URL, published time | Yes, via controlled sync | Yes, for public rows |
| Content classification (`short`, `lyrics_video`, `meaning_video`, `other`) | Yes, curator/sync field | Yes, as a neutral label |
| Associated song/artist IDs | Nullable references only after trusted matching | Only when the linked entity is public |
| Rights status for Star Lyrix-hosted lyrics/audio | Separate rights-aware tables | Only when display/playback conditions pass |
| YouTube API key, OAuth refresh token, sync secret | Server secrets only | Never |
| Scraped or copied third-party lyrics | Never | Never |

## Phased roadmap

| Phase | Outcome | Production gate |
|---|---|---|
| A | Cached YouTube channel/video metadata and public Shorts gallery | YouTube API key, curated playlist/allowlist, scheduled sync, quota/error monitoring |
| B | First-class artists, channels, albums, and public song/video relationships | Admin/editor workflow, slug uniqueness, verification policy, RLS, no thin pages |
| C | Submission and rights-review portal | Rights evidence, moderator roles, audit log, signed asset handling |
| D | Creator projects, AI jobs, and lyric-video editor contracts | Owner-scoped jobs, cancellation/retry, worker queue, Storage policies |
| E | Rendered lyric videos and Shorts factory | Dedicated FFmpeg/Whisper/TTS worker, rights contracts, preview/review gate |
| F | YouTube publishing and synchronization | OAuth consent, review approval, publish audit, token rotation, rollback |
| G | Charts, analytics, and monetization | Documented ranking methodology, consent/privacy, billing and abuse controls |

## Non-negotiable product rules

Star Lyrix must not scrape or republish full copyrighted lyrics from public lyric sites. Metadata licensing and lyric licensing are separate concerns. Public lyric display requires the existing approved/verified and allowed-display gates. Audio playback remains restricted to `audio_authorized=true`. Creator rendering accepts only original, owned, licensed, or explicitly authorized inputs. AI generation remains original-content oriented and BYOK credentials remain server-side.

The requirements mention followers, views, requests, shares, and charts. Until real event sources and privacy/anti-manipulation rules exist, the UI must not show fake counts or imply popularity. “Verified Artist,” “Official Lyrics Video,” and “Star Lyrix Original” are controlled labels, not decorative chips.

## Acceptance criteria for the next slice

The next slice is complete when a staging project can apply the additive video-catalog migration, run a controlled channel sync using server secrets, expose only public cached metadata through the public gateway, render Shorts from the cache, and demonstrate that no raw API key, OAuth secret, unauthorized lyric text, or media download path reaches the browser. A missing API configuration must keep the official channel link and show an explicit unconfigured state.

## Current implementation checkpoint

Migration `20260824000008_add_youtube_video_catalog.sql` now defines a public-read, server-written `youtube_videos` catalog for Star Lyrix channel metadata. The new `sync-youtube-catalog` Edge Function reads only a configured YouTube playlist or explicit video allowlist, authenticates with a server-side sync secret, and upserts title, description, thumbnail, publish time, neutral content type, and official YouTube URL. The public Shorts gallery reads cached rows first and keeps the live API path only as a staging fallback.

This checkpoint does not assert that a YouTube video is official, licensed, or safe to pair with copied lyrics. It stores metadata and distribution links only. Rights-aware lyrics/audio, creator submission, moderation, rendering, and publishing remain separate workflows with their own authorization gates.

## References

[1]: ./Star_Lyrix_Vevo_for_Lyrics_Product_Requirements.md "Star Lyrix Vevo-for-Lyrics Product Requirements"

[2]: ./STAR_LYrix_BYOK_IMPLEMENTATION_PLAN.md "Star Lyrix AI Creator Studio and BYOK Implementation Plan"
