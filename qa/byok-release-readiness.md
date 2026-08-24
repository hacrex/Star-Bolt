# Star Lyrix BYOK implementation readiness

**Date:** 2026-08-24  
**Scope:** First secure BYOK foundation from `docs/Star_Lyrix_AI_Creator_Studio_BYOK_Requirements.md`.

## Status

The first BYOK slice is implemented and **ready for staging validation**, not production-certified. It preserves the existing Star Lyrix warm cinematic UI, Auth boundary, private generated-lyrics drafts, rights-aware lyrics rules, and authorized playback rules.

## Implemented surface

| Area | Implementation |
|---|---|
| Requirements | The complete user-provided requirements are tracked at `docs/Star_Lyrix_AI_Creator_Studio_BYOK_Requirements.md`. |
| Decision record | `docs/STAR_LYrix_BYOK_IMPLEMENTATION_PLAN.md` defines the incremental architecture and non-goals. |
| Provider registry | Client registry supports OpenAI, Google Gemini, OpenRouter, and custom HTTPS OpenAI-compatible endpoints. |
| Provider settings | Protected `/settings/ai` screen supports transient key entry, server-side test/connect/remove/enable/default actions, masked metadata, and safe user-facing errors. |
| Creator Studio | Protected `/creator` landing surface shows BYOK status, original-content guardrails, and honest deferred-pipeline states. |
| Lyrics Studio | `/ai-lyrics` now requires an authenticated configured provider for generation and displays provider/model/usage provenance after generation. |
| Database | Migration `20260824000007_add_byok_provider_metadata.sql` adds owner-scoped metadata, a sanitized view, Vault references, server-only RPCs, and default-provider failover. `supabase/setup.sql` mirrors it. |
| Edge Functions | `manage-ai-provider` and the rewritten `generate-lyrics` function resolve secrets only server-side and normalize provider errors without returning raw responses or credentials. |

## Security decisions

Raw keys are not stored in `public.users`, `generated_lyrics`, local storage, URLs, logs, or the browser-readable metadata view. The browser submits a key only through an authenticated HTTPS request to the provider-management function; after the request, the password input is cleared. The server stores the key through Supabase Vault and returns provider metadata only. Supabase documents Vault as encrypted secret storage with a decrypted view that must be protected by appropriate SQL privileges [1].

The secret resolver and write/remove RPCs are revoked from `anon` and `authenticated` and granted only to `service_role`. The client never queries `vault.decrypted_secrets`. The generation function verifies the user first, selects only that user’s enabled provider, resolves its secret server-side, and returns only content plus provider/model/usage provenance. Provider adapters enforce a timeout and translate failures to safe error codes.

The product remains rights-aware. Generation is constrained to original lyric content and must not be used to scrape, transform, or republish arbitrary third-party copyrighted lyrics. Future media, subtitle, timing, rendering, and publishing jobs require separate rights contracts and owner approval.

## Verification

| Check | Result |
|---|---|
| TypeScript | Passed: `npx tsc -p tsconfig.app.json --noEmit` |
| Production build | Passed: `npm run build` |
| Targeted frontend lint | Passed for changed BYOK and route files; only the existing TypeScript compatibility warning was emitted |
| E2E browser suite | Passed: 20 tests, including signed-out `/creator`, `/settings/ai`, and `/ai-lyrics` BYOK messaging |
| Diff hygiene | Passed: `git diff --check` |
| Supabase CLI migration validation | Not run because the CLI is unavailable in the sandbox |
| Live Supabase validation | Not run; no project credentials, service-role key, or authenticated test account was available |

## Remaining staging gates

Apply migrations through `20260824000007` in a disposable or staging Supabase project with Vault enabled. Validate provider connect, test, replace, remove, enable/disable, default failover, generation, safe provider errors, and user isolation with a dedicated test account. Confirm that the target Supabase project supports the Vault functions and privileges used by the migration.

The next creator phases require `creator_projects`, `ai_jobs`, `video_jobs`, private Storage buckets, a managed FFmpeg/Whisper/TTS worker, signed download URLs, asset rights metadata, preview/review states, and auditable publishing integrations. Do not run heavy rendering inside Supabase Edge Functions, and do not enable YouTube or social publishing until the review and authorization boundary is implemented.

No live key, provider secret, migration, authenticated session, rendered video, or publishing action was used in this workspace.

## References

[1]: https://supabase.com/docs/guides/database/vault "Supabase Vault documentation"
