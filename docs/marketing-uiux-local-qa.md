# Star Lyrix marketing UI/UX local QA

Date: 2026-08-25

The local `/shorts` page now renders as a cinematic channel landing surface: the headline uses the display/serif contrast, the official `@starlyrix` plaque is visible, the primary YouTube CTA and Reading Room link are present, and the gallery is framed as cached YouTube metadata with an intentional warm-up state when the server catalog is empty.

The local homepage retains the Stitch-inspired first viewport and now exposes three clear entry actions: Start creating, Enter the Reading Room, and Watch Shorts. The creator flywheel panels render as navigable links to `/auth`, `/lyrics`, and `/shorts`, respectively. The hero remained visually layered and readable after the added CTA.

The public media states remain honest: no fake views or popularity metrics were added, and the official channel link remains `https://www.youtube.com/@starlyrix`.

The first post-redesign Playwright run exposed a stale accessibility assertion for the CTA label; the UI label was made explicit as `Open @starlyrix on YouTube`, matching the existing public-route contract. The corrected run passed all **24 tests**, including the Shorts route, the new homepage CTA, creator-story panel links, public pages, mobile navigation, and protected-route redirects.

The local `/lyrics` route now renders the previous Stitch-style Reading Room hero: large `Find the song. Read the line.` typography, a bordered instrument-like search bar with keyboard hint and gold Search catalog action, explicit `PUBLIC / RIGHTS-AWARE` metadata, an atmospheric Reading Room visual stage, and the preserved Spotify/Musixmatch source note. The catalog workspace remains below the hero with an intentional empty state.
