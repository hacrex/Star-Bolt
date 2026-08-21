---
name: Star Lyrix
colors:
  surface: '#14130f'
  surface-dim: '#14130f'
  surface-bright: '#3b3934'
  surface-container-lowest: '#0f0e0a'
  surface-container-low: '#1d1c17'
  surface-container: '#21201b'
  surface-container-high: '#2b2a25'
  surface-container-highest: '#36352f'
  on-surface: '#e7e2da'
  on-surface-variant: '#d2c5b1'
  inverse-surface: '#e7e2da'
  inverse-on-surface: '#32302b'
  outline: '#9a8f7d'
  outline-variant: '#4e4636'
  surface-tint: '#eec058'
  primary: '#f2c35b'
  on-primary: '#402d00'
  primary-container: '#d4a843'
  on-primary-container: '#553e00'
  inverse-primary: '#795900'
  secondary: '#cfc5b6'
  on-secondary: '#353025'
  secondary-container: '#4f483d'
  on-secondary-container: '#c1b7a9'
  tertiary: '#ccc9c9'
  on-tertiary: '#313030'
  tertiary-container: '#b0aead'
  on-tertiary-container: '#424242'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdf9f'
  primary-fixed-dim: '#eec058'
  on-primary-fixed: '#261a00'
  on-primary-fixed-variant: '#5b4300'
  secondary-fixed: '#ece1d2'
  secondary-fixed-dim: '#cfc5b6'
  on-secondary-fixed: '#201b12'
  on-secondary-fixed-variant: '#4c463b'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474646'
  background: '#14130f'
  on-background: '#e7e2da'
  surface-variant: '#36352f'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  lyric-display:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: 0em
  lyric-body:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 40px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
  lyric-display-mobile:
    fontFamily: Source Serif 4
    fontSize: 22px
    fontWeight: '400'
    lineHeight: 44px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  bento-gap: 20px
  container-padding: 32px
---

## Brand & Style

The design system is centered on a "Cinema for your Ears" philosophy. It evokes a warm, immersive, and premium atmosphere that treats music and lyrics with the same reverence as film. The visual language is deeply rooted in high-end editorial and cinematic experiences, moving away from typical "tech" aesthetics in favor of a sophisticated, low-light environment.

The style is a blend of **Minimalism** and **Glassmorphism**, utilizing deep shadows, soft gold accents, and expansive negative space to create a focused, distraction-free environment. The emotional response should be one of calm, luxury, and intimacy.

**Key Principles:**
- **Atmospheric Depth:** Use layered transparency to suggest physical space.
- **Warmth over Clinicality:** Avoid pure whites and harsh blues; every color must feel "lit" by a warm tungsten source.
- **Typographic Hierarchy:** Lyrics are the hero, treated with the elegance of a classic novel.

## Colors

The palette is strictly curated to maintain a cinematic, high-contrast yet warm environment.

- **Primary (Gold):** Used for highlights, active states, and premium calls to action. It should feel metallic and rich, not neon.
- **Surface (Deep Gray):** Used for containers and cards to separate content from the deep black background.
- **Typography (Warm White & Muted Gold):** Primary text uses a soft off-white to reduce eye strain in low light. Secondary text uses a muted metallic tone to establish hierarchy.
- **Accents:** Subtle gold glows and gradients are permitted to indicate focus or "now playing" states.

## Typography

The typographic system utilizes three distinct families to manage different content types:

1.  **Inter (Sans):** Used for the UI framework, navigation, and metadata. It provides a clean, modern contrast to the lyrical content.
2.  **Source Serif 4 (Serif):** This is the heart of the system. Used for lyrics and long-form editorial content. The line-height is intentionally generous (2.0x) to allow the words to breathe, mimicking a premium poetry book.
3.  **JetBrains Mono (Monospaced):** Used sparingly for timestamps, technical data, and small labels to provide a "studio" or "archival" feel.

**Scaling Note:** For mobile devices, lyric line-height remains high to maintain the "immersion" factor, but font sizes drop significantly to prevent excessive scrolling.

## Layout & Spacing

This design system utilizes a **Bento Grid** model for home sections and discovery feeds. Elements are grouped into distinct, rounded containers of varying sizes that snap to a 12-column grid on desktop.

- **Grid:** 12-column fluid grid for desktop with 20px gutters. 4-column grid for mobile.
- **Rhythm:** An 8px linear scale drives most spacing, but the "Bento" gaps are fixed at 20px to maintain a distinct visual separation between content blocks.
- **Margins:** Large, generous margins (32px+) on desktop to reinforce the premium, "gallery" feel.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Glassmorphism**. 

- **Background:** The base layer is a solid #0A0A0A.
- **Containers:** Cards use #141414 with a subtle 1px stroke (Hex: #A89F91, Opacity: 10%) to define edges without harsh shadows.
- **Header:** The navigation header is a floating element using `rgba(10, 10, 10, 0.85)` with a `20px` backdrop-blur. This allows the album art and content to scroll beautifully beneath it.
- **Shadows:** Avoid heavy black shadows. Instead, use "Gold Glows" for active states—a soft, ultra-diffused outer glow using the Primary Gold color at 15% opacity.

## Shapes

The shape language is consistent and "soft-rounded."

- **Cards & Bento Boxes:** Fixed at 16px (`rounded-lg`) to create a modern, friendly feel that balances the serious color palette.
- **Buttons:** Use higher roundedness (24px+) or full pill shapes to distinguish them from structural containers.
- **Images:** Album art should always mirror the container's 16px radius when housed in a card.

## Components

### Buttons
- **Primary:** Solid Gold (#D4A843) with Dark Text (#0A0A0A). High-weight font.
- **Secondary:** Transparent background with a 1px Gold border.
- **Ghost:** No border, Warm White text, used for secondary navigation.

### Cards (Bento Boxes)
- Background: #141414.
- Border-radius: 16px.
- Hover State: Subtle scale up (1.02x) and a 10% increase in brightness of the Gold border-stroke.

### Input Fields
- Dark-filled (#0A0A0A) with a bottom-only border in Secondary Text color. 
- Focus state: Border transitions to Primary Gold with a 4px soft blur.

### Lyrics Display
- Centered alignment.
- Gradient mask at the top and bottom of the scroll container to "fade" lyrics in and out of view.
- Active line: Primary Gold color. Inactive lines: Secondary Text color at 40% opacity.

### Chips/Tags
- Small, pill-shaped, using JetBrains Mono for the label.
- Background: #141414; Border: 1px solid #A89F91.