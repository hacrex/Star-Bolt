# Star Lyrix Marketing Website — UI/UX Specification

**Status:** Design direction approved for implementation  
**Product:** Star Lyrix — Creator Studio and the Vevo for Lyrics  
**Primary public routes:** `/`, `/lyrics`, `/shorts`, `/search`, `/creators`, and legal pages
**Protected routes:** `/auth`, `/creator`, `/ai-lyrics`, `/settings/ai`, `/generated-lyrics`, `/playlists`, `/profile`, and contribution/workspace routes  
**Source of truth:** Stitch design system, prior Star Lyrix implementation history, product memory, build specification, BYOK requirements, and Vevo-for-Lyrics requirements.

## 1. Design objective

The current marketing implementation is structurally correct but visually underpowered. It communicates the product through a sequence of similarly weighted text cards, which makes the page feel like a product brief rather than a destination for music and creators. The redesign restores the stronger qualities of the earlier Stitch Bento build: an asymmetric editorial composition, cinematic depth, a visible content stage, richer contrast, and a deliberate sense of arrival.

The marketing site must feel like **opening a record sleeve in a dark room**, not opening a generic SaaS dashboard. It should make a visitor understand three things within the first screen:

1. Star Lyrix is a premium home for lyrics, lyric videos, and Shorts.
2. Creators can turn original lyrics into visual stories in Creator Studio.
3. Public lyric content is rights-aware; creator tools and AI providers begin after sign-in.

> **Brand promise:** Star Lyrix is cinema for your ears: a warm, editorial destination where lyrics become visual worlds and creators stay in control of their work.

The site may use **“The Vevo for Lyrics”** as strategic positioning, but it must not imply affiliation with Vevo. “Official,” “Verified,” “Authorized,” and “Star Lyrix Original” remain controlled labels that require a documented basis.

## 2. Experience principles

| Principle | Design implication | Anti-pattern to avoid |
|---|---|---|
| **Editorial before operational** | Lead with a hero story, media, lyric excerpt treatment, and strong visual rhythm. | Starting with a dashboard-like grid of feature cards. |
| **Warmth over neon** | Use charcoal, tungsten gold, warm white, muted beige, and restrained mood washes. | Purple-blue gradients, electric cyan, or rainbow AI effects. |
| **Depth over decoration** | Use layered surfaces, large tonal fields, soft glows, image crops, grain, and a few orbit lines. | Floating particles everywhere or glassmorphism on every element. |
| **Content is the proof** | Show Shorts, a Lyrics Reader preview, and creator workflow evidence. | Explaining the whole product with abstract icons only. |
| **Authentic motion** | Use short, purposeful hover, reveal, and progress transitions. | Autoplay audio, looping background video, or attention-seeking animation. |
| **Rights are visible** | Use plain-language source and authorization notes near public lyrics/media. | Hiding rights status or using “official” as a decorative badge. |
| **Login has a reason** | Public visitors can browse and understand the product; creators sign in to create, save, connect BYOK providers, and submit. | Exposing private creator screens as empty public pages. |

## 3. Visual direction: “Midnight Editorial / Gold Light”

The default theme is dark. The visual field begins at `#0A0A0A`, moves through deep charcoal surfaces, and uses gold as a focused source of light. The gold should feel like a tungsten lamp or an illuminated record label—not neon. Light mode remains supported for the wider application, but the public marketing homepage should open in the cinematic dark presentation unless the user has explicitly chosen another theme.

### Core palette

| Token | Value | Use |
|---|---:|---|
| `--marketing-void` | `#080807` | Outer page field and hero edges |
| `--marketing-deep` | `#0A0A0A` | Main page background |
| `--marketing-surface` | `#14130F` | Bento cards and reading panels |
| `--marketing-elevated` | `#211E18` | Raised content stages and hover states |
| `--marketing-gold` | `#D4A843` | Primary actions, active states, rules, highlights |
| `--marketing-gold-light` | `#F2C35B` | Headline punctuation, hover, active lyric line |
| `--marketing-cream` | `#F4EFE5` | Main display text |
| `--marketing-sand` | `#CFC2AD` | Supporting copy and metadata |
| `--marketing-muted` | `#8E8578` | Captions and inactive labels |
| `--marketing-rose` | `#B86C6C` | Optional emotional mood wash, used sparingly |
| `--marketing-sage` | `#758F7C` | Optional calm mood wash, used sparingly |

Gradients may contain no more than two color stops. The preferred treatments are a gold radial glow over charcoal, a low-opacity warm image wash, and a linear fade that protects text contrast. Pure white, pure black, electric blue, hot pink, and neon green are not part of the marketing palette.

## 4. Typography

Use **Inter** for interface, metadata, buttons, and navigation; **Source Serif 4** for lyric excerpts, editorial lines, and emotional statements; and **JetBrains Mono** for small labels, timestamps, content types, and production metadata. The contrast between sans-serif system text and serif lyric text is a core part of the Star Lyrix identity.

| Role | Desktop | Mobile | Treatment |
|---|---:|---:|---|
| Hero display | `clamp(4rem, 8vw, 8.5rem)` | `3.25rem` | Tight tracking, 0.88–0.94 line height |
| Section display | `clamp(2.25rem, 4vw, 4.5rem)` | `2.3rem` | Editorial, short line lengths |
| Eyebrow | `0.68–0.74rem` | Same | Mono, uppercase, gold, high tracking |
| Body | `1rem–1.15rem` | `0.96–1rem` | Warm secondary color, line height 1.65–1.8 |
| Lyric excerpt | `2–3.2rem` | `1.55–2rem` | Source Serif 4, generous line height |
| Card title | `1.05–1.25rem` | `1rem–1.1rem` | Strong but not oversized |
| Metadata | `0.72–0.82rem` | Same | Mono or compact Inter |

The homepage hero should use a short, memorable line—not a multi-sentence headline. Preferred message direction: **“Turn a lyric into a world.”** Supporting copy should make the creator/media connection explicit without becoming a feature inventory.

## 5. Homepage information architecture

The homepage is a **cinematic scroll**, not a dashboard. Each section has a distinct visual job and a different composition. The sequence is intentionally varied so the user does not encounter five repeated card rows.

### 5.1 Floating header

The header is a 64–72px floating bar with a dark translucent background, a subtle gold bottom rule, and backdrop blur. The logo uses the wordmark plus a small music-mark symbol. Public navigation is:

`Discover` · `Lyrics Reader` · `Shorts` · `Search`

The right side contains a compact **For creators** link and one gold **Sign in** action. When authenticated, creator/library actions may appear, but the public IA remains understandable. The header must never rely on transparency for text contrast; it must remain legible over both the hero and scrolled content.

### 5.2 Hero: “The visual record sleeve”

The hero occupies the first 680–820px on desktop. It uses an asymmetric 7/5 split:

- **Left:** eyebrow, oversized headline, one-sentence promise, primary and secondary actions, and a small rights-aware note.
- **Right:** a large visual stage containing a cropped Shorts/lyric artwork treatment, a floating lyric excerpt card, a small “Creator Studio” label, and restrained orbit/ring geometry.
- **Bottom edge:** a narrow horizontal content ticker or metadata rail with neutral labels such as `ORIGINAL LYRICS`, `AUTHORIZED READING`, `SHORTS`, and `BYOK STUDIO`. It is informational, not a fake popularity metric.

The right stage should feel like a poster or album sleeve. It may use an approved Star Lyrix image, a cached YouTube thumbnail, or a CSS-built typographic composition when media is unavailable. If no public media is configured, the stage must remain visually intentional with an authored lyric excerpt and an explicit warm-up state; it must not look like a broken blank card.

Hero actions:

| Action | Destination | Visual weight |
|---|---|---|
| **Start creating** | `/auth` | Gold pill; primary |
| **Enter the Reading Room** | `/lyrics` | Transparent gold-outline; secondary |
| **Watch Shorts** | `/shorts` | Text link or quiet ghost action |

### 5.3 Proof strip: “Three ways in”

Immediately after the hero, show three compact but visually differentiated entry points, not three identical principle cards:

1. **Write** — original lyric drafts with BYOK control.
2. **See** — lyric-led visual stories and authorized reading.
3. **Share** — YouTube Shorts and distribution when rights are clear.

Each item uses a large mono number, a short title, one sentence, and a small graphic cue. On hover, the active item receives a gold rule and subtle vertical translation. The cards should vary in height or internal alignment to retain the Bento character.

### 5.4 Content stage: “From the Star Lyrix channel”

This section is the visual anchor of the public media network. It uses a wide 2/3 feature tile and a narrow stacked column:

- **Feature tile:** the first cached Shorts item or a deliberate channel warm-up visual, with a large thumbnail, play affordance, title, content type, and `Watch on YouTube` link.
- **Side rail:** two or three smaller Shorts cards with portrait-safe crops, numbered `01`, `02`, `03` labels, and a channel CTA.
- **Section title:** a strong editorial line such as **“Short stories. Bright hooks.”**

The component must use cached metadata first. It must not show views, likes, follower counts, or “trending” claims without real trusted event data. The channel link is always visible: `https://www.youtube.com/@starlyrix`.

### 5.5 Lyrics feature: “The words are the interface”

Use a wide dark section with a large serif lyric excerpt on the left and a compact Reading Room preview on the right. The preview includes:

- song/artist identity when available;
- three or four lyric lines with one gold active line;
- a small progress rail;
- source language and rights note;
- `Open Lyrics Reader` action.

If no approved lyric source is available, show the catalog/rights boundary clearly: Spotify can identify a track, but lyrics appear only from an approved licensed source. Never use a scraped excerpt as visual filler.

### 5.6 Creator story: “One line. Many worlds.”

Use a three-panel editorial composition that explains the creator flywheel:

`Original lyric` → `Visual concept` → `Short / lyric video`

The center panel should be visually dominant. The panels can use soft gold number markers, a serif phrase, and a short production note. The purpose is to make Creator Studio feel like a creative instrument rather than a list of AI features.

The CTA is **Build your first world** and routes to `/auth`. A smaller link routes to the protected Creator Studio after authentication. The page must state that creator projects, AI providers, and saved drafts begin after sign-in.

### 5.7 Trust and rights section

End the public storytelling before the footer with a restrained trust band:

> **Beautiful words need a responsible home.**

Show four short statements: original-first AI, licensed lyrics when available, authorized playback only, and no scraped lyric pages. This is a compact trust signal, not legal copy. Link to Copyright & DMCA and Community Guidelines in the footer.

### 5.8 Footer

The footer is darker than the content field and has a strong wordmark lockup, a one-sentence brand statement, public navigation, creator sign-in, legal routes, and the official YouTube channel. It should feel like a closing title card rather than an unstyled list of links.

## 6. Public secondary routes

### `/shorts`

This should feel like a channel landing page, not a utility list. Use a title block with a large serif or display line, a channel plaque with `@starlyrix`, and the same feature-plus-rail gallery composition as the homepage. Include a clear note that the gallery contains curated YouTube metadata and links to YouTube. Do not embed or download content without an approved playback path.

### `/lyrics`

This is the public Reading Room entry. Above the search form, show a quiet editorial promise: **“Find the song. Keep the words in the right room.”** The search panel should feel like an instrument, with a large field and a short source legend for Spotify catalog matching and licensed Musixmatch lyrics. Results should use strong album-art/metadata composition, while the selected track uses a centered serif reading panel. Unavailable or unconfigured states must remain designed, not collapsed into plain error text.

### `/search`

Keep search utility-focused but visually consistent: a large search field, language/mood chips, curated context, and result cards. Avoid turning this page into a second homepage.

### `/creators`

This is the public artist and creator landing page. It should introduce the Artist/Stars audience to the current creator toolkit—original lyric studio, BYOK provider control, rights-aware Reading Room, and submission for review—then distinguish future production stages such as lyric-video direction, Shorts packaging, voiceover, and the server-only official-channel publishing pathway. Use a cinematic artist hero, a varied feature matrix, a five-step release path, a visible rights promise, and protected CTAs. The page may invite artists to submit, but must not promise approval, official status, or automatic YouTube publication.

## 7. Creator boundary

Public marketing should sell the possibility of creation but never expose private creator dashboards or empty production queues as if they were public features. `/creator`, `/ai-lyrics`, `/settings/ai`, projects, drafts, playlists, and profile surfaces stay protected. Public CTAs route to `/auth` when no session exists.

The marketing site may preview the workflow, but it must not claim that rendering, YouTube publishing, artist submissions, analytics, or batch Shorts generation are live until the corresponding backend worker, review state, and integration have been implemented.

## 8. Motion and interaction

Motion is used to give the page a pulse without competing with reading. The preferred motion language is a 180–260ms ease-out transition, with occasional 320ms editorial reveals. Animate only transform and opacity where possible.

| Interaction | Treatment |
|---|---|
| Hero stage | Very slow ambient glow shift only when reduced motion is not requested; no looping video/audio. |
| Bento card hover | Translate `-2px`, brighten border, add a soft gold glow. |
| Shorts card hover | Image scale `1.03`, play affordance fades in, metadata remains readable. |
| Primary button | Gold lift and `scale(0.97)` on press. |
| Section reveal | Opacity plus `translateY(10px)` once per section; stagger 40–60ms. |
| Lyrics preview | Gold active-line underline/progress transition; no forced auto-scroll on marketing page. |
| Navigation | Instant keyboard open/focus for command palette; no decorative delay. |

All non-essential motion is disabled under `prefers-reduced-motion: reduce`. No autoplay audio, no unexpected video playback, and no flashing highlights.

## 9. Responsive behavior

| Viewport | Composition |
|---|---|
| 1280px+ | 12-column layout; asymmetric hero, feature-plus-rail Shorts stage, generous margins. |
| 768–1279px | 8-column layout; hero remains two-column until space becomes constrained; content rail stacks below feature. |
| 320–767px | 4-column/single-column layout; hero stage follows copy, large touch targets, horizontal Shorts rail, bottom navigation preserved. |

On mobile, the first screen should still show the headline, one visible creator CTA, one visible public Reading Room CTA, and a compact visual stage. Keep the visual density, but reduce simultaneous elements rather than simply shrinking desktop content. Primary controls must remain reachable in the lower thumb zone and meet a 48px touch target.

## 10. Accessibility and content integrity

The redesigned public site must preserve WCAG 2.1 AA intent from `UIUX.md`: semantic headings, landmarks, keyboard navigation, visible gold focus rings, descriptive alt text, reduced-motion handling, sufficient contrast, and no color-only status communication. Image and thumbnail containers must reserve space to avoid layout shift.

Public media cards must expose content type and source. Rights notes should be plain-language and adjacent to the relevant lyric/media action. The UI must distinguish these labels:

| Label | Meaning |
|---|---|
| **Original** | Created by Star Lyrix or a creator with an eligible original-content basis. |
| **Authorized** | Permission is recorded for the specified use. |
| **Licensed** | A license reference exists for the specified use. |
| **Community** | User-contributed and not presented as official until reviewed. |
| **Verified** | A defined review or rights process has confirmed the applicable claim. |

## 11. Performance and implementation rules

Keep route-level lazy loading. Use lazy image loading below the fold, explicit dimensions/aspect ratios, and a high-priority treatment only for the hero visual. Do not restore the previous broad Vite manual chunk split that caused a React runtime hook failure; correctness comes before speculative vendor partitioning. If a new split is explored, it must be validated with a production preview and browser hydration test.

The homepage should remain modular through components such as `MarketingHero`, `ShortsGallery`, `LyricsPreview`, `CreatorFlywheel`, `TrustBand`, and `MarketingFooter`. Existing rights-aware data clients and protected route logic should be reused rather than duplicated.

## 12. Acceptance checklist

| Gate | Acceptance condition |
|---|---|
| First impression | The first viewport feels cinematic and visually layered, not like a plain SaaS card grid. |
| Message clarity | A new visitor understands lyrics, Shorts, and Creator Studio within one scroll. |
| Public boundary | Public `/`, `/lyrics`, `/shorts`, and `/search` work without login; creator tools remain protected. |
| Content honesty | Missing YouTube/Musixmatch configuration is shown as an intentional warm-up state; no fake metrics or rights claims. |
| Stitch fidelity | Charcoal/gold palette, Inter + Source Serif 4 + JetBrains Mono, Bento/asymmetric composition, soft gold glows, and editorial spacing are evident. |
| Mobile | Hero, CTA, gallery, and public reader remain legible and thumb-friendly at 320px+. |
| Accessibility | Headings, landmarks, focus, alt text, contrast, and reduced motion remain intact. |
| Runtime safety | Production preview hydrates without React hook errors and route smoke tests pass. |

## References

[1]: ../UIUX.md "Star Lyrix UI/UX Design System"

[2]: ../stitch_star_lyrix_design_system/star_lyrix/DESIGN.md "Star Lyrix Stitch Design System"

[3]: ../stitch_star_lyrix_design_system/star_lyrix/IMPLEMENTATION.md "Star Lyrix Stitch Implementation History"

[4]: ./STAR_LYrix_PROJECT_MEMORY.md "Star Lyrix Project Memory"

[5]: ./STAR_LYrix_BUILD_SPEC.md "Star Lyrix Build Specification"

[6]: ./Star_Lyrix_Vevo_for_Lyrics_Product_Requirements.md "Star Lyrix Vevo-for-Lyrics Product Requirements"

[7]: ./STAR_LYrix_BYOK_IMPLEMENTATION_PLAN.md "Star Lyrix AI Creator Studio and BYOK Implementation Plan"
