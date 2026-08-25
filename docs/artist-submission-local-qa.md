# Artist submission local QA notes

Date: 2026-08-25

The local homepage at `http://127.0.0.1:5173/` rendered with the cinematic Star Lyrix hero, visible `Submit a video` navigation and homepage CTA, public Lyrics Reader/Shorts destinations, and no console-visible runtime failure in the browser extraction. The Shorts gallery correctly showed its honest empty/configuration state and linked only to `https://www.youtube.com/@starlyrix`.

Opening `http://127.0.0.1:5173/submit` while signed out redirected to `http://127.0.0.1:5173/auth`, where the Sign in heading and form were visible. The protected Artist Submission Portal was not exposed to signed-out visitors.

This QA pass did not authenticate or submit a real video. No Supabase staging migration, account, storage upload, reviewer identity, or YouTube OAuth publisher was available in the session.

The local `/lyrics` route retained the `Lyrics Reader — Star Lyrix` title and explicitly stated Spotify is for catalog identity while Musixmatch is the separate licensed lyrics source. The local `/shorts` route retained `Star Lyrix Shorts — YouTube gallery`, described a focused gallery from the official channel, and exposed the expected `https://www.youtube.com/@starlyrix` links. Both public pages kept the new `Submit a video` navigation link.

Feature-scoped ESLint passed for the modified application files. The repository-wide `npm run lint` command still exits non-zero because of unrelated legacy issues in the duplicate `home/project` tree and existing files such as `src/pages/Toast.tsx`/`src/context/ThemeContext.tsx`; this was not introduced by the artist submission slice. The production TypeScript build, `git diff --check`, and the full 23-test Playwright smoke suite passed.

The pushed commit is `0ad5849bd54f4d058268aaaf882eb11101548f28` on `feat/star-lyrix-ui-foundation`. The connected Vercel team returned no visible projects, and a production deployment retry was rejected with HTTP 403: the current Vercel identity does not have permission to create a Production Deployment for the `starlyrix` project. The previously generated preview hostname also returned deployment-not-found through the team-scoped lookup. This means Vercel deployment and authenticated live submission testing remain unverified; the existing `https://starlyrix.vercel.app` project was not overwritten.
