# Star Lyrix marketing UI/UX local QA

Date: 2026-08-25

The local `/shorts` page now renders as a cinematic channel landing surface: the headline uses the display/serif contrast, the official `@starlyrix` plaque is visible, the primary YouTube CTA and Reading Room link are present, and the gallery is framed as cached YouTube metadata with an intentional warm-up state when the server catalog is empty.

The local homepage retains the Stitch-inspired first viewport and now exposes three clear entry actions: Start creating, Enter the Reading Room, and Watch Shorts. The creator flywheel panels render as navigable links to `/auth`, `/lyrics`, and `/shorts`, respectively. The hero remained visually layered and readable after the added CTA.

The public media states remain honest: no fake views or popularity metrics were added, and the official channel link remains `https://www.youtube.com/@starlyrix`.

The first post-redesign Playwright run exposed a stale accessibility assertion for the CTA label; the UI label was made explicit as `Open @starlyrix on YouTube`, matching the existing public-route contract. The corrected run passed all **24 tests**, including the Shorts route, the new homepage CTA, creator-story panel links, public pages, mobile navigation, and protected-route redirects.

The local `/lyrics` route now renders the previous Stitch-style Reading Room hero: large `Find the song. Read the line.` typography, a bordered instrument-like search bar with keyboard hint and gold Search catalog action, explicit `PUBLIC / RIGHTS-AWARE` metadata, an atmospheric Reading Room visual stage, and the preserved Spotify/Musixmatch source note. The catalog workspace remains below the hero with an intentional empty state.

The Lyrics Reader search now uses a debounced public catalog lookup for live song suggestions after two characters, with stale-request cancellation, loading and empty-result handling, keyboard navigation, Enter selection, Escape dismissal, and combobox/listbox semantics. Selecting a suggestion reuses the existing rights-aware reader path rather than bypassing the authorized lyrics boundary.

The global header now provides a full-height hamburger drawer on mobile across public and protected routes. It includes Explore and Your studio sections, protected destinations when authenticated, Sign in when signed out, the official channel link, backdrop dismissal, Escape dismissal, route-change close behavior, body scroll locking, and reduced-motion-safe animation. The bottom navigation remains available as a complementary mobile shell.
