# Star Lyrix — UI/UX Design System

## 1. Design Philosophy

### Core Principle
"Cinema for your ears." Every screen should feel like opening a vinyl record — warm, immersive, premium. Users are content creators who scroll lyrics for 10-30 minutes. The UI must hold attention without eye strain.

### Design Pillars
1. **Warmth over neon** — Golden tones, not electric blues or purples
2. **Depth over flat** — Subtle layering, not material design cubes
3. **Content over chrome** — Lyrics are the hero, UI disappears
4. **Calm over chaos** — No flashing, no jitter, no cognitive overload
5. **Mobile-first thumb zone** — Every primary action reachable with one thumb

### What We Are NOT
- NOT a neon/AI-gradient portal
- NOT a cluttered dashboard
- NOT a generic Tailwind template
- NOT another purple-pink-blue music app

---

## 2. Color System

### Primary Palette — "Vinyl & Gold"

| Token | Hex | Usage |
|---|---|---|
| bg-deep | #0A0A0A | True dark background |
| bg-surface | #141414 | Cards, panels |
| bg-elevated | #1C1C1C | Hover states, modals |
| bg-subtle | #242424 | Input fields, borders |
| gold-primary | #D4A843 | Primary accent, CTAs |
| gold-light | #E8C675 | Hover states, highlights |
| gold-muted | #A68B3C | Secondary text accents |
| text-primary | #F5F0E8 | Main body text (warm white) |
| text-secondary | #A89F91 | Metadata, labels |
| text-muted | #6B6560 | Timestamps, disabled |

### Accent Palette — "Mood Wash"

Used sparingly for category tags, mood indicators, genre chips.

| Token | Hex | Usage |
|---|---|---|
| mood-rose | #C4616A | Romantic, sad moods |
| mood-amber | #D4A843 | Happy, energetic |
| mood-sage | #7A9E7E | Peaceful, indie |
| mood-lavender | #8B7EB8 | Dreamy, ethereal |
| mood-coral | #D4826A | Warm, passionate |
| mood-sky | #6B9AC4 | Calm, reflective |

### Gradient Rules

```css
/* Hero gradient — warm, not electric */
background: linear-gradient(135deg, #0A0A0A 0%, #1C1510 50%, #0A0A0A 100%);

/* Card hover — subtle gold glow */
background: radial-gradient(ellipse at center, rgba(212, 168, 67, 0.06) 0%, transparent 70%);

/* Lyrics highlight — current line */
background: linear-gradient(90deg, rgba(212, 168, 67, 0.12) 0%, transparent 100%);
```

### NEVER Use
- Electric blue #00D4FF
- Neon green #00FF88
- Hot pink #FF0080
- Pure black #000000 (use #0A0A0A instead)
- Pure white #FFFFFF (use #F5F0E8 instead)
- Purple-to-pink gradients
- Any gradient with more than 2 color stops

---

## 3. Typography

### Font Stack

```css
--font-display: 'Inter', 'SF Pro Display', -apple-system, sans-serif;
--font-lyrics: 'Georgia', 'Cambria', 'Times New Roman', serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Why Serif for Lyrics
- Serif fonts reduce eye fatigue during long reading sessions
- Georgia/Cambria have excellent screen rendering at body sizes
- Creates visual distinction between UI text and lyrics content
- Feels editorial, premium, like reading a music magazine

### Type Scale

| Element | Size | Weight | Line Height | Color |
|---|---|---|---|---|
| Hero Title | 48px / 3rem | 700 | 1.1 | text-primary |
| Page Title | 32px / 2rem | 700 | 1.2 | text-primary |
| Section Title | 24px / 1.5rem | 600 | 1.3 | text-primary |
| Card Title | 18px / 1.125rem | 600 | 1.4 | text-primary |
| Body | 16px / 1rem | 400 | 1.6 | text-primary |
| Lyrics (reading) | 20px / 1.25rem | 400 | 2.0 | text-primary |
| Lyrics (current) | 22px / 1.375rem | 600 | 2.0 | gold-primary |
| Metadata | 14px / 0.875rem | 400 | 1.5 | text-secondary |
| Caption | 12px / 0.75rem | 400 | 1.4 | text-muted |

### Lyrics Typography Rules
- **Line height: 2.0** — Critical for readability during long sessions
- **Letter spacing: 0.01em** — Slightly open for screen reading
- **Max width: 600px** — Prevents long line fatigue
- **Font size: 20px minimum** — Never smaller for lyrics body
- **Current line: gold accent + slightly larger** — Spatial anchoring
- **Non-current lines: 60% opacity** — Depth-of-field effect (Apple Music pattern)

---

## 4. Layout System

### Grid

```css
/* Desktop: 12-column grid */
max-width: 1280px;
gap: 24px;
padding: 0 32px;

/* Tablet: 8-column */
max-width: 768px;
gap: 16px;
padding: 0 24px;

/* Mobile: 4-column */
max-width: 100%;
gap: 12px;
padding: 0 16px;
```

### Card System — "Bento Blocks"

Use **Bento grid** layout for homepage sections (2026 trend). Modular, asymmetric cards that feel editorial.

```
+-------------------------+-----------+
|                         |           |
|   Featured Video        |  Trending |
|   (2:1 aspect)          |  Song 1   |
|                         |           |
+-----------+-------------+-----------+
|           |             |           |
|  Trending |  Trending   |  Trending |
|  Song 2   |  Song 3     |  Song 4   |
|           |             |           |
+-----------+-------------+-----------+
```

### Card Specs
| Property | Value |
|---|---|
| Border radius | 16px (cards), 12px (buttons), 8px (inputs) |
| Padding | 24px (desktop), 16px (mobile) |
| Background | bg-surface with 1px border bg-subtle |
| Shadow | 0 4px 24px rgba(0, 0, 0, 0.3) |
| Hover | Translate Y -2px, shadow intensifies |
| Transition | 200ms ease-out |

---

## 5. Component Patterns

### Header — "Floating Bar"
- **Sticky top, backdrop-blur** — Glassmorphism, not solid
- **Height: 64px** — Compact, content-first
- **Background: rgba(10, 10, 10, 0.85)** with backdrop-filter: blur(20px)
- **Border-bottom: 1px rgba(212, 168, 67, 0.1)** — Subtle gold line
- Nav items: Discover, AI Lyrics, Videos, My Lyrics, Playlists, Search
- Right side: Dark/Light toggle, Profile/Sign In

### Lyrics Page — "The Reading Room"
Layout: Album art (left) + Song info + Lyrics (right) on desktop. Stacked on mobile.

Key elements:
- Album artwork 1:1 ratio, 200px on desktop
- Song title, artist, album, year, genre chips
- Verified badge if applicable
- Lyrics in serif font, line-height 2.0
- Current line highlighted with gold left border
- Verse/Chorus headers as section markers
- Action bar: Favorite, Add to Playlist, Share
- Translations section with language chips
- Comments section below

### Video Card — "Cinema Thumbnail"
- 16:9 thumbnail with play button overlay on hover
- Duration badge bottom-right
- Song title + artist below
- View count + publish date
- Share + Save actions

### Search — "Infinite Field"
- Full-width, no border, bg-subtle background
- Expands on focus with gold ring
- Recent searches as chips below
- Popular searches as chips
- Results as card list

---

## 6. Micro-Interactions

### Interaction Principles
- **Duration: 200-400ms** — Fast enough to feel instant, slow enough to register
- **Easing: cubic-bezier(0.4, 0, 0.2, 1)** — Natural deceleration
- **GPU-only: transform and opacity** — Never animate layout properties
- **Purposeful: Every animation communicates state** — No decorative motion

### Key Micro-Interactions

| Action | Animation | Duration |
|---|---|---|
| Card hover | translateY(-2px) + shadow expand | 200ms |
| Button press | scale(0.97) | 100ms |
| Page transition | Fade + subtle slide up | 300ms |
| Toast appear | Slide in from right | 300ms |
| Toast dismiss | Fade out | 200ms |
| Favorite toggle | Heart scale bounce (1 to 1.2 to 1) | 300ms |
| Lyrics line highlight | Gold underline wipe left-to-right | 400ms |
| Loading skeleton | Shimmer gradient animation | 1.5s loop |
| Star rating | Scale + color fill on hover | 150ms |
| Share button | Icon rotation 360 degrees | 400ms |

### Lyrics Reading Animations

```css
/* Current line highlight */
.lyric-line.active {
  opacity: 1;
  transform: translateX(4px);
  border-left: 3px solid var(--gold-primary);
  padding-left: 16px;
  transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Non-current lines */
.lyric-line {
  opacity: 0.5;
  transition: opacity 400ms ease;
}

/* Scroll snap for lyrics sections */
.lyrics-container {
  scroll-snap-type: y proximity;
}
.lyrics-section {
  scroll-snap-align: start;
}
```

---

## 7. Engagement Patterns for Long Sessions

### Problem
Content creators read lyrics for 10-30 minutes. Poor UX causes:
- Eye strain leading to abandonment
- Cognitive fatigue leading to boredom
- No spatial anchoring leading to "where was I?"

### Solutions

#### 7.1 Reading Comfort
- **Line height 2.0** — Generous breathing room
- **Max-width 600px** — Optimal reading width (50-75 characters per line)
- **Font size 20px minimum** — Never strain to read
- **Warm white #F5F0E8** — Softer than pure white, reduces blue light
- **No pure black background** — Use #0A0A0A to reduce contrast harshness

#### 7.2 Spatial Anchoring
- **Current line gold highlight** — Always know where you are
- **Verse/Chorus headers** — Section markers every 8-12 lines
- **Progress indicator** — Subtle scroll progress bar on right edge
- **"Jump to" pills** — Quick navigation to Verse 1, Chorus, Bridge

#### 7.3 Progressive Disclosure
- **Fold long lyrics** — Show first 20 lines, "Read more" button
- **Collapsible sections** — Verse, Chorus, Bridge collapsible
- **Translation toggle** — Side-by-side or overlay mode

#### 7.4 Ambient Features
- **Auto-scroll mode** — For karaoke/sing-along use case
- **Font size controls** — User can adjust 16-28px
- **Reading mode** — Full-screen lyrics, hide all UI
- **Night reading** — Even warmer color temp at night

#### 7.5 Break Patterns
- **Section dividers** — Visual breathing room between verses
- **Related songs** — After lyrics end, show 3-4 related songs
- **"You might also like"** — Discovery without leaving the page

---

## 8. Mobile-First Design

### Thumb Zone Map

```
+---------------------------+
|  O Hard to reach          |
|  Navigation, Search       |
+---------------------------+
|  @ Medium reach           |
|  Secondary actions        |
+---------------------------+
|  * Easy reach (thumb)     |
|  Play, Favorite, Share    |
|  Primary CTA buttons      |
+---------------------------+
```

### Mobile Breakpoints
| Breakpoint | Width | Layout |
|---|---|---|
| Mobile S | 320px | Single column, stacked |
| Mobile L | 425px | Single column, larger touch targets |
| Tablet | 768px | 2-column grid |
| Desktop | 1024px | 3-column grid |
| Desktop L | 1280px | 4-column grid, max-width container |

### Mobile-Specific Rules
- **Minimum touch target: 48x48px** — Never smaller
- **Bottom sheet for actions** — Share, add to playlist, etc.
- **Swipe gestures** — Left/right for related songs
- **Pull-to-refresh** — On lists and search results
- **Sticky bottom bar** — Play controls always accessible
- **Haptic feedback** — On favorite toggle, rating submit

---

## 9. Content Creator Focus

### Who Are Content Creators?
- Lyric video makers who need to read/verify lyrics
- Music bloggers who share lyric quotes
- Translators who work line-by-line
- Community contributors who submit corrections

### Creator-Specific UX

#### Quick Actions Bar
- Copy Lyrics (full song)
- Share Quote (selected lines)
- Copy Link
- Download as TXT
- Report Issue

#### Lyrics Quote Card Generator
Auto-generate shareable image cards:
- Spotify-style lyrics card with album art
- Custom background colors
- Song attribution
- Star Lyrix watermark
- Export as PNG/JPG for Instagram stories

#### Side-by-Side Translation

```
+------------------+------------------+
| Original (EN)    | Translation (HI) |
|                  |                  |
| These are the    | Ye woh lafz     |
| words that light | hain jo roshni  |
| up the world...  | duniya mein...  |
+------------------+------------------+
```

#### Line-by-Line Mode
For translators and contributors:
- Click any line to edit
- Inline translation input
- Diff view for corrections
- Version history

---

## 10. Anti-Patterns to Avoid

### Visual Anti-Patterns
- Neon glow effects (feels cheap, not premium)
- Rainbow gradients (distracting, not calming)
- Animated backgrounds (nauseating during long sessions)
- Glassmorphism overload (lose readability)
- Too many accent colors (max 2 per screen)
- Floating particles/stars (decorative, not functional)

### UX Anti-Patterns
- Autoplay audio (never, unless user-initiated)
- Pop-ups on every page (destroys flow)
- Infinite scroll without anchors (loses spatial context)
- Hidden navigation (Gen Z expects discoverable nav)
- Small touch targets on mobile (frustrating)
- No loading states (feels broken)
- Wall of text without visual breaks (eye fatigue)

### Content Anti-Patterns
- Fake engagement metrics (Gen Z detects inauthenticity)
- Overly corporate tone (Gen Z wants authentic voice)
- Copying other apps exactly (Gen Z values originality)
- Ignoring accessibility (15% of population has disability)
- No dark mode option (82% of mobile users prefer dark mode)

---

## 11. Gen Z Engagement Hooks

### Why Gen Z Stays
1. **Personalization** — "This feels like it was made for me"
2. **Authenticity** — "This brand isn't trying too hard"
3. **Speed** — "It loads in under 3 seconds"
4. **Visual satisfaction** — "This looks premium on my phone"
5. **Social proof** — "Other people like me use this"

### Retention Mechanics
- **Contribution badges** — "Lyric Expert", "Translation Master"
- **Streak system** — "7-day contribution streak"
- **Leaderboard** — Top contributors this week
- **Shareable stats** — "You contributed 29 lyrics this month"
- **Community recognition** — Featured contributor of the week

### Content Hooks
- **Lyrics of the day** — Daily featured lyric card
- **Mood-based discovery** — "Show me sad songs right now"
- **Time-based recommendations** — "Late night vibes"
- **Genre exploration** — "Discover something new in K-Pop"
- **Artist deep dives** — "Everything by Arijit Singh"

---

## 12. Performance Requirements

### Speed Targets
- **First Contentful Paint: < 1.5s** — Users see content immediately
- **Largest Contentful Paint: < 2.5s** — Main content visible
- **Time to Interactive: < 3.0s** — Page is usable
- **Cumulative Layout Shift: < 0.1** — No jarring shifts
- **First Input Delay: < 100ms** — Instant response to taps

### Image Optimization
- Album art: WebP, 400x400 (cards), 800x800 (detail)
- Thumbnails: WebP, 320x180 (16:9), quality 80
- Hero images: AVIF preferred, fallback WebP
- Lazy loading: All images below the fold
- Placeholder: Blurred low-res preview (LQIP)

### Code Splitting
- Route-based splitting (React.lazy)
- Component-based splitting for heavy components
- Shared chunks for common utilities
- Preload critical routes on hover

---

## 13. Accessibility

### Requirements
- **WCAG 2.1 AA compliance** — Minimum standard
- **Contrast ratio: 4.5:1** for normal text, 3:1 for large text
- **Focus indicators** — Visible gold outline on all interactive elements
- **Screen reader support** — Proper ARIA labels on all components
- **Keyboard navigation** — Full functionality without mouse
- **Reduced motion** — Respect prefers-reduced-motion
- **Alt text** — All images have descriptive alt text
- **Semantic HTML** — Proper heading hierarchy, landmarks

### Color Contrast on Dark Background
| Element | Foreground | Background | Ratio |
|---|---|---|---|
| Body text | #F5F0E8 | #0A0A0A | 15.8:1 |
| Secondary text | #A89F91 | #0A0A0A | 8.2:1 |
| Muted text | #6B6560 | #0A0A0A | 4.1:1 |
| Gold accent | #D4A843 | #0A0A0A | 8.5:1 |
| Gold on surface | #D4A843 | #141414 | 7.2:1 |

---

## 14. Dark/Light Mode Implementation

### Dark Mode (Default)
- Background: #0A0A0A (not pure black)
- Surface: #141414
- Text: #F5F0E8 (warm white, not pure white)
- Accent: #D4A843 (gold)

### Light Mode
- Background: #FAF8F5 (warm off-white)
- Surface: #FFFFFF
- Text: #1A1A1A
- Accent: #B8922E (darker gold for contrast)
- Border: #E8E4DE

### Toggle Behavior
- Persist preference in localStorage
- Default to dark mode
- System preference detection as fallback
- Smooth 300ms transition between modes
- No flash of wrong theme on load

---

## 15. Reference Implementations

### Study These
- **Apple Music** — Lyrics display, color extraction from album art, depth-of-field effect
- **Spotify** — Card layouts, playlist UX, search experience, Wrapped shareable cards
- **Genius** — Annotation system, community contributions, verification badges
- **Musixmatch** — Synced lyrics, translation UI, contributor profiles
- **Pinterest** — Masonry grid, visual discovery, save/share mechanics
- **Notion** — Clean typography, content hierarchy, reading experience

### Key Takeaways from Research
1. **Apple Music**: Album art tinting entire UI creates emotional context
2. **Spotify**: Personalization drives 30% higher engagement
3. **Genius**: Community contribution + verification = trust + retention
4. **Dark mode**: 82% of mobile users prefer it, reduces eye strain 30%
5. **Typography**: Serif for reading, sans-serif for UI — creates hierarchy
6. **Loading speed**: Every 1s delay = 32% increase in bounce rate
