# Star Lyrix Artist Publishing Plan

**Status:** Implementation slice in progress — authenticated submission foundation only

**Owner:** Star Lyrix product and review team

## Product promise

Star Lyrix can invite artists to submit a lyric video or visual story for consideration. A submission is **private by default**, remains owned by the submitting account, and enters a review workflow only after the artist provides explicit rights attestations. The site must not describe a submitted video as official, approved, or published until a human review process and a server-side publishing operation have completed.

> A public media record is metadata, not a rights grant. Artist-provided URLs, channel presence, and account ownership signals are evidence to review—not automatic permission to upload, re-use, or publish.

## Current implementation slice

The protected `/submit` portal provides an authenticated artist with an owner-scoped profile and a first submission form. The form collects the artist and release identity, a YouTube review URL or future hosted-upload selection, thumbnail and release metadata, rights holder, optional evidence URL, lyrics-rights status, and a license reference when lyrics are marked licensed. Three attestations are required before finalization:

1. The artist owns or controls the rights needed to submit the video and related song materials.
2. Star Lyrix may review the submission, edit metadata, and prepare it for publication if approved.
3. Star Lyrix may publish the approved video to the official `@starlyrix` channel.

The browser first creates a **draft** with all attestation flags false. It then calls the `submit_artist_video_submission` security-definer function with the three attestations. The function verifies the authenticated owner, locks the editable row, records the previous status, changes the row to `submitted`, writes an audit event, and returns the submitted record. The client has no update path that can set an approval, queue, YouTube ID, or publication timestamp.

The current portal intentionally accepts a review URL rather than performing a browser upload. `hosted_upload` is visible as a future option but is rejected by the current client-side URL rule until a reviewed storage pipeline exists. This avoids placing large media processing, storage authorization, or provider secrets in the Vite client.

## Lifecycle and state boundaries

| State | Meaning | Who can enter it | Public? |
| --- | --- | --- | --- |
| `draft` | Editable submission prepared by the artist; attestations are not stored as complete. | Authenticated owner through the insert policy. | No |
| `submitted` | Artist completed the three attestations and sent the record to the review queue. | Owner through the server-mediated RPC. | No |
| `rights_review` | A reviewer is checking ownership, licenses, permissions, and evidence. | Future reviewer-only server operation. | No |
| `content_review` | A reviewer is checking content, metadata, safety, and platform readiness. | Future reviewer-only server operation. | No |
| `changes_requested` | The artist must correct or supplement the submission. | Future reviewer-only server operation. | No |
| `approved` | Review is complete and the record is eligible for a publishing decision. | Future reviewer-only server operation. | No |
| `publish_queued` | An approved record has been explicitly handed to the server-only publisher. | Future reviewer-only server operation. | No |
| `published` | The external publishing operation returned a verified YouTube video identifier and timestamp. | Future server-only OAuth publisher. | Only after a separate public-display decision |
| `rejected` / `withdrawn` | The review team or artist closed the record. | Future reviewer/owner operations with audit events. | No |

The schema includes later states so the product can evolve without pretending that review or publishing already exists. No browser code may set `reviewed_by`, `reviewed_at`, `youtube_video_id`, `youtube_published_at`, `approved`, `publish_queued`, or `published`.

## Rights and lyrics rules

The review team must validate the actual rights basis supplied by the artist. Star Lyrix must not scrape lyrics, infer a license from a URL, or treat Spotify, YouTube, Musixmatch, or a public catalog record as proof of authorization. Lyrics should be displayed only through the project’s existing approved/verified rights gates, and audio playback must continue to require `audio_authorized = true`.

A licensed lyrics selection requires a license reference in the portal. That reference is a review input, not an automatic approval. If the supplied evidence is inaccessible, ambiguous, expired, or inconsistent with the artist’s submission, the reviewer should request changes or reject the record rather than guessing.

## Server-only publishing requirements

A future publishing service must run outside the browser and must use a dedicated OAuth credential owned by the official channel owner. Before enabling it, Star Lyrix needs all of the following:

| Requirement | Required control |
| --- | --- |
| Channel authority | A real OAuth authorization for the official channel owner with the minimum YouTube scope required for upload and metadata management. |
| Reviewer authority | A server-side reviewer role or allowlist; submitters must never approve their own content. |
| Transition integrity | An allowlisted state machine that accepts only reviewed transitions and writes an immutable audit event for each transition. |
| Idempotency | A unique job key and verified external video identifier so retries cannot create duplicate uploads. |
| Rights evidence | A stored review decision, reviewer note, evidence reference, and timestamp before `publish_queued`. |
| Safe failure | Jobs remain visible as failed or retryable; they never silently become `published`. |
| Secret handling | OAuth refresh tokens, service-role access, and provider keys are server-side secrets only. They must not be placed in Vite environment variables or browser bundles. |
| Public presentation | The UI must link to the official channel only after the external response is verified; a submission itself is never displayed in the public Shorts gallery. |

The first production publisher should be a dry-run or metadata-validation mode that creates no YouTube upload. A real upload should be enabled only after the channel owner supplies OAuth consent in the server environment and the review/audit path has been tested with non-public content.

## Background execution options

Publishing is an event-triggered workflow: a reviewer explicitly queues an approved record, then a worker performs a deterministic external operation and records the result. There are two viable implementation choices:

| Approach | Tradeoffs | Cost | Setup complexity |
| --- | --- | --- | --- |
| Managed server-side job handler with a database-backed queue and scheduled retry/heartbeat | Keeps secrets and state in the application backend, is easier to audit, and supports idempotent retries. It requires backend deployment, queue monitoring, and careful timeout handling for an external upload. | Usage-based hosting and external API usage; no dedicated machine required. | Medium |
| Dedicated always-on worker consuming the database queue | Gives tighter control over long uploads, retry timing, and observability. It adds operational ownership, health checks, secret rotation, and a persistent runtime that is unnecessary for the current submission-only slice. | Higher ongoing hosting cost than a request-scoped handler. | High |

The recommended first step is the managed server-side handler with a database-backed job record and explicit reviewer transition. It is lighter than a dedicated worker and sufficient for low-volume publishing. The recommendation is not an implementation approval: no publisher should be enabled until the reviewer role, OAuth ownership, and test channel are in place.

## Release gates

Before calling this workflow production-ready, the team should complete the following gates:

1. Apply migration `20260825000009_add_artist_video_submissions.sql` to a non-production Supabase project and run positive and negative RLS/RPC tests with separate artist accounts.
2. Add reviewer-only transition functions and role checks. Do not grant the browser generic update access to review or publishing columns.
3. Add a server-only publishing job table or equivalent durable queue with idempotency and retry state.
4. Configure the official channel owner’s OAuth consent and rotate the refresh token through the server secret manager; never collect it in the Star Lyrix browser.
5. Exercise a dry-run upload path with a test video and verify event history, failure handling, and no public gallery leakage.
6. Confirm that the official Shorts gallery remains sourced only from the configured `@starlyrix` catalog sync and does not include artist submissions before publication.
7. Add authenticated E2E coverage using a disposable test account in CI or a protected staging project. The current repository smoke suite intentionally tests only signed-out redirect behavior.

## Operational language

Use **“Submit for rights review”**, **“under review”**, **“approved for publishing”**, and **“published”** only when their corresponding server-side state exists. Do not use **“official artist upload”**, **“guaranteed placement”**, **“automatic approval”**, **“Vevo partnership”**, or **“published to @starlyrix”** for a form submission. Star Lyrix may describe the long-term direction as **Vevo-for-Lyrics-inspired** or **a rights-aware lyric-media platform**, but it must not imply affiliation with Vevo or YouTube.

## Internal references

- `docs/Star_Lyrix_Vevo_for_Lyrics_Product_Requirements.md` — long-term `/submit` and publishing requirements.
- `docs/STAR_LYrix_VEVO_IMPLEMENTATION_PLAN.md` — staged architecture decision record.
- `docs/STAR_LYrix_MARKETING_UIUX_SPEC.md` — public/protected information architecture and rights-first copy rules.
- `supabase/migrations/20260825000009_add_artist_video_submissions.sql` — current database foundation.
- `src/pages/ArtistSubmission.tsx` — current protected portal slice.
