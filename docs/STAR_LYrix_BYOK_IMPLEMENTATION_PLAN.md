# Star Lyrix AI Creator Studio and BYOK Implementation Plan

**Status:** Phase 1 foundation implemented; staging validation pending  
**Source requirements:** [`Star_Lyrix_AI_Creator_Studio_BYOK_Requirements.md`](./Star_Lyrix_AI_Creator_Studio_BYOK_Requirements.md)  
**Existing product constraints:** Supabase Auth, PostgreSQL/RLS, authorized lyrics and audio only, no secret exposure in browser code, and no automatic copying or republishing of arbitrary copyrighted lyrics.

## Architectural analysis

The requirements describe a complete creator pipeline: provider setup, original lyric generation, lyric editing, authorized media selection, subtitle timing, rendering, preview, Shorts creation, export, and eventual publishing. The current repository already has a protected AI Lyrics Studio at `/ai-lyrics`, private generated-lyrics drafts, an authenticated Supabase Edge Function, and rights-aware Reading Room/playback rules. It does not yet have provider metadata, secure per-user key storage, creator projects, asynchronous AI/video jobs, a rendering worker, creator routes, or publishing integrations.

The current generation function is platform-key based: it verifies the signed-in user and then calls OpenAI with a deployment-wide `OPENAI_API_KEY` and a hard-coded model. The first slice therefore must change the trust boundary before expanding the UI. A provider key entered by a user may be accepted by an authenticated Edge Function and stored only in a server-side secret store; the browser may receive provider status, masked display metadata, model name, and safe error codes, but never the raw key after submission.

## Phased implementation decision

| Slice | Implement now | Defer until backing infrastructure exists |
|---|---|---|
| BYOK foundation | Provider registry, metadata-only `user_ai_providers` rows, server-side secret references, authenticated provider settings route, safe test-connection path, selected/default provider metadata, provider-aware original lyric generation | Raw-key display, browser persistence, client-side provider calls |
| Creator workspace | Protected `/creator` dashboard, project metadata, transparent draft/queue states, links into existing AI Lyrics Studio | Full project editor, asset timeline, scene planner, template marketplace |
| Media pipeline | Rights-aware inputs and job contracts | FFmpeg/Whisper/TTS worker, video rendering, storage exports, Shorts batch jobs |
| Publishing | Review-before-publish workflow and explicit ownership/authorization labels | YouTube/social OAuth and publishing, scheduled synchronization |

The first implementation slice supports OpenAI, Google Gemini, OpenRouter, and custom OpenAI-compatible endpoints because they share a text-generation workflow or are explicitly required in the MVP. The provider registry is extensible so additional adapters can be added without redesigning the settings screen. Ollama is represented as a local-only option in the UI contract but is not invoked from a hosted Edge Function because a deployed function cannot assume access to a user’s localhost endpoint.

## Security boundary

The database stores provider name, model, base URL where applicable, enabled/default state, and an opaque secret reference. It must not store raw API keys in profile rows, ordinary metadata columns, local storage, URL parameters, generated-lyrics settings, error messages, or logs. The browser calls authenticated Edge Functions for connect, test, remove, and generation actions. Only server-side code with the service role may resolve a secret reference, and the secret resolver is not executable by `anon` or `authenticated` clients.

Provider errors are normalized into safe codes such as `invalid_api_key`, `provider_unavailable`, `rate_limited`, `model_not_found`, `insufficient_quota`, and `timeout`. Raw provider response bodies, authorization headers, and key material must never be returned to the browser. Generation responses include provider/model provenance and whether provider usage metadata was available, but do not claim exact cost unless the provider returns reliable usage data.

Originality and rights checks remain mandatory. The lyric generator is for original content and user-supplied/authorized material only; no workflow may scrape third-party lyrics or transform restricted lyrics into videos. Any future video, subtitle, voice, or synchronization job must carry an explicit content-rights contract before it can render or publish.

## Data and job milestones

1. Apply the additive BYOK metadata migration only after reviewing Supabase Vault availability in the target project. The migration creates owner-scoped provider metadata and a server-only secret resolver, without changing existing `generated_lyrics` rows.
2. Add `creator_projects` and `ai_jobs` only when the UI begins persisting projects/jobs; both require owner-scoped RLS, status constraints, bounded progress, safe error fields, and cancellation semantics.
3. Add `video_jobs` and private Storage buckets only when a rendering worker exists. Heavy FFmpeg, Whisper, image, audio, and video processing must run outside Supabase Edge Functions on a managed worker or dedicated host.
4. Add publishing integrations only after preview and explicit owner approval exist. Publishing must be asynchronous, auditable, retryable, and rights-aware.

## Acceptance criteria for the first slice

The first slice is complete when a signed-in user can open `/settings/ai`, see supported provider cards, submit a key through an authenticated server path, receive only masked metadata, test or remove the provider, choose a default provider/model, and generate original lyrics through that provider. A signed-out user must be redirected to `/auth`. A missing provider must produce an actionable setup state rather than silently falling back to a platform-wide key. Existing private draft RLS, authorized Reading Room behavior, and legal/rights language must remain unchanged.

No live provider secret, Supabase service-role credential, migration application, or authenticated provider test is available in this workspace. The implementation therefore includes code and SQL for staging review, while production validation remains an explicit release gate.
