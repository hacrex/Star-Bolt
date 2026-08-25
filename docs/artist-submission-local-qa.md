# Artist submission local QA notes

Date: 2026-08-25

This record covers the rights-aware artist submission foundation and the final public navigation state. The local homepage and creator surfaces render the cinematic Star Lyrix marketing shell. The global header exposes `For Creators`; the submission portal remains a protected `/submit` route and is not presented as an automatic publishing path.

Opening `http://127.0.0.1:5173/submit` while signed out redirected to `/auth`, where the Sign in heading and form were visible. The protected Artist Submission Portal was not exposed to signed-out visitors.

The local `/lyrics` route presents the Stitch-style Reading Room hero and states that Spotify is used for catalog identity while Musixmatch is the separate licensed lyrics source. The local `/shorts` route presents the official `@starlyrix` channel landing surface and does not copy or imply ownership of third-party media.

This QA pass did not authenticate or submit a real video. No Supabase staging migration, account, storage upload, reviewer identity, or YouTube OAuth publisher was available in the session. Consequently, authenticated submission, review transitions, and YouTube publication remain unverified and intentionally server-only.

The repository’s stale duplicate `home/project` tree, unused `src/pages/Videos.tsx` implementation, root activity log, obsolete SVG mockups, and unused legacy `public/metaimage.png` asset were removed after confirming they had no active imports or runtime references. Historical QA notes were updated to avoid treating those paths as current code.

The final cleanup validation record is maintained in the current project memory and release handoff. Deployment status remains unchanged: the connected Vercel identity could not access or create the existing `starlyrix` Production Deployment, and the existing `https://starlyrix.vercel.app` project was not overwritten.
