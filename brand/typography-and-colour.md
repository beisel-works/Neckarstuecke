# Neckarstücke — Typography & Colour System

> Version 1.0 · April 2026  
> Status: Foundation — referenced by all digital and print touchpoints

---

## 1. Typography

### 1.1 Typeface Selection

#### Display typeface — EB Garamond

| Attribute | Value |
|-----------|-------|
| Foundry / origin | Georg Mayr-Duffner (revival of Claude Garamont, c. 1530) |
| Source | Google Fonts |
| License | SIL Open Font License 1.1 — confirmed for commercial web use |
| Weights used | Regular 400, Italic 400 |
| Primary use | Display/hero text, H1–H2 headings, print titles, pull-quotes |

**Rationale:** EB Garamond is already embedded in the logo wordmark, making it the natural display face. Its renaissance origins lend the brand a sense of permanence and craft without period-costume pastiche. At large sizes the optically uneven stroke contrast and open apertures read beautifully on screen and in print. The free web license means no FOUT or external CDN dependency beyond Google Fonts.

#### Body typeface — Inter

| Attribute | Value |
|-----------|-------|
| Foundry / origin | Rasmus Andersson |
| Source | Google Fonts (also available as a variable font) |
| License | SIL Open Font License 1.1 — confirmed for commercial web use |
| Weights used | Regular 400, Medium 500 |
| Primary use | Body copy, UI labels, captions, navigation, metadata |

**Rationale:** Inter was designed specifically for screen legibility at small sizes. Its neutral humanist geometry provides a clean counterweight to Garamond's warmth — the pairing follows a classic editorial convention (expressive serif for voice, neutral sans for information). As a variable font it reduces web page weight. Inter's wide x-height makes it readable at caption size on low-density screens and on fine art paper reproduction captions alike.

---

### 1.2 Typographic Scale

All sizes are expressed in `rem` relative to a 16px root. Line-height values are unitless. Tracking values are in `em`.

| Level | Role | Size | rem | Weight | Line-height | Tracking | Typeface |
|-------|------|------|-----|--------|-------------|----------|----------|
| Display | Hero, exhibition title | 72px | 4.5rem | EB Garamond 400 | 1.05 | −0.02em | EB Garamond |
| H1 | Page title | 48px | 3rem | EB Garamond 400 | 1.1 | −0.01em | EB Garamond |
| H2 | Section heading | 36px | 2.25rem | EB Garamond 400 | 1.15 | −0.005em | EB Garamond |
| H3 | Sub-heading | 24px | 1.5rem | EB Garamond 400 | 1.25 | 0em | EB Garamond |
| H4 | Article heading | 20px | 1.25rem | Inter 500 | 1.3 | 0.005em | Inter |
| Body | Running copy | 16px | 1rem | Inter 400 | 1.65 | 0em | Inter |
| Caption | Image captions, edition notes | 14px | 0.875rem | Inter 400 | 1.5 | 0.01em | Inter |
| Label | UI labels, tags, navigation | 12px | 0.75rem | Inter 500 | 1.4 | 0.08em | Inter |
| Label (uppercase) | Overlines, category marks | 11px | 0.6875rem | Inter 500 | 1.4 | 0.12em | Inter |

**Notes:**
- Display and H1–H3 in EB Garamond Italic are permitted for pull-quotes and editorial accent — use sparingly.
- H4 switches to Inter to prevent Garamond from becoming congested at weights below 20px on screen.
- The Label (uppercase) style references the small-caps register used in the wordmark and WPA catalogue labels.

---

### 1.3 Type Pairing Rules

1. **Never combine two display-level Garamond elements on the same visual line.** Headlines and sub-headlines in the same Garamond weight read as typographic noise. Separate with an Inter caption or use weight hierarchy.
2. **Body text is always Inter, never Garamond.** Reading comfort over 4+ lines demands Inter's screen-optimised metrics.
3. **EB Garamond Italic** is reserved for editorial accent (pull-quotes, artwork edition notes, dates). Do not use italic for UI states.
4. **Headings do not use bold weights.** The brand is assured, not assertive. `font-weight: 400` for all Garamond headings. Inter Medium (500) is the heaviest weight used in the system.
5. **Minimum body text size: 14px (0.875rem).** Below this, switch to a UI label style rather than scaling down body text.

---

## 2. Colour Palette

### 2.1 Core Palette

| Name | Hex | RGB | CMYK | Role |
|------|-----|-----|------|------|
| **Neckar-Charcoal** | `#1C2826` | 28, 40, 38 | C30 M0 Y5 K84 | Primary brand colour — ink, logo, primary text |
| **Paper** | `#FAFAF5` | 250, 250, 245 | C0 M0 Y2 K2 | Primary background — all light-mode surfaces |
| **Valley Sage** | `#3D6154` | 61, 97, 84 | C37 M0 Y13 K62 | Primary accent — interactive elements, CTAs, highlights |
| **Loess** | `#EDE9DC` | 237, 233, 220 | C0 M2 Y7 K7 | Surface — cards, panels, hover backgrounds |
| **River Stone** | `#6E7B77` | 110, 123, 119 | C11 M0 Y3 K52 | Muted UI — secondary text, dividers, placeholders |
| **Ochre** | `#8B5A14` | 139, 90, 20 | C0 M35 Y86 K45 | Warm accent — price highlights, limited editions, seasonal use |

### 2.2 Colour Roles

| Role | Colour | Hex | Notes |
|------|--------|-----|-------|
| Primary text | Neckar-Charcoal | `#1C2826` | All body copy, headings, labels on light backgrounds |
| Primary background | Paper | `#FAFAF5` | Page background, default surface |
| Reversed text | Paper | `#FAFAF5` | Text on dark backgrounds (Neckar-Charcoal surface) |
| Reversed background | Neckar-Charcoal | `#1C2826` | Dark surface, footer, hero overlays |
| Primary accent | Valley Sage | `#3D6154` | Links, primary buttons, focus rings, active states |
| Accent text on light | Valley Sage | `#3D6154` | Sage used as foreground on Paper — passes AA |
| Surface / card | Loess | `#EDE9DC` | Card backgrounds, input backgrounds, hover state |
| Secondary / muted | River Stone | `#6E7B77` | Captions, placeholder text, metadata — decorative only, not primary body text |
| Warm accent | Ochre | `#8B5A14` | Edition badges, price display, seasonal highlights — not for body text on Paper |

### 2.3 Colour Rationale

**Neckar-Charcoal `#1C2826`** is the founding colour — established in the logo. The slight green-cool undertone reads as fine art ink rather than printer black, referencing intaglio and letterpress heritage.

**Paper `#FAFAF5`** is a barely-warm off-white, referencing 220gsm cotton-rag printing paper rather than digital white. The 5-unit yellow shift prevents clinical coldness on screen.

**Valley Sage `#3D6154`** is the colour of the Neckar valley in late summer — not the bright green of new growth but the weathered, slightly dusty sage of the valley slopes in August. As a mid-dark accent it sits visually between charcoal and the neutrals. Directly derived from the WPA palette convention of using one natural regional colour as the accent.

**Loess `#EDE9DC`** references the loess-limestone geology of the Neckar valley — the pale, warm-cream soil and rock characteristic of the region. Used for surfaces that need to feel physically tactile without competing with Paper.

**River Stone `#6E7B77`** is the grey-green of wet limestone cobbles in the Neckar riverbed. A neutral supporting colour; its slight green-cool undertone ties it to the Charcoal family.

**Ochre `#8B5A14`** references the amber of autumn oak leaves and the iron-oxide earth pigments used in regional fresco painting. Used sparingly as a warm counter-accent for commercial moments (pricing, edition counts, seasonal campaigns). Its deliberate restraint means it retains impact when it appears.

---

## 3. Accessibility — WCAG Contrast Ratios

Contrast ratios calculated using the WCAG 2.1 relative luminance formula.

### 3.1 Primary Pairings

| Foreground | Background | Hex values | Contrast ratio | WCAG AA (4.5:1) | WCAG AAA (7:1) |
|------------|------------|------------|----------------|-----------------|----------------|
| Neckar-Charcoal | Paper | `#1C2826` / `#FAFAF5` | **14.5 : 1** | ✓ Pass | ✓ Pass |
| Paper | Neckar-Charcoal | `#FAFAF5` / `#1C2826` | **14.5 : 1** | ✓ Pass | ✓ Pass |
| Neckar-Charcoal | Loess | `#1C2826` / `#EDE9DC` | **12.5 : 1** | ✓ Pass | ✓ Pass |
| Valley Sage | Paper | `#3D6154` / `#FAFAF5` | **6.6 : 1** | ✓ Pass | ✓ Pass |
| Paper | Valley Sage | `#FAFAF5` / `#3D6154` | **6.6 : 1** | ✓ Pass | ✓ Pass |
| Ochre | Paper | `#8B5A14` / `#FAFAF5` | **5.6 : 1** | ✓ Pass (normal text) | — |
| Ochre | Loess | `#8B5A14` / `#EDE9DC` | **4.6 : 1** | ✓ Pass (normal text) | — |

### 3.2 Non-primary / Decorative Pairings (informational — not for body text)

| Foreground | Background | Contrast ratio | Note |
|------------|------------|----------------|------|
| River Stone | Paper | `#6E7B77` / `#FAFAF5` | 4.2 : 1 | Below AA for normal text — use only for captions ≥18px (AA large text) or decorative |
| River Stone | Loess | `#6E7B77` / `#EDE9DC` | 3.5 : 1 | Decorative only |

**Design note on River Stone:** River Stone sits below the AA threshold for small body text by design. It is a support colour for secondary, non-essential information (placeholder text, dividers, icons). All essential text must use Neckar-Charcoal or Valley Sage as foreground.

---

## 4. Tailwind CSS v4 Implementation Notes

This section is a preview reference for the storefront implementation task. Actual configuration belongs to the Next.js / Tailwind setup task.

```css
/* @theme block in global CSS */
@theme {
  --font-display: "EB Garamond", Garamond, "Cormorant Garamond", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;

  /* Colour tokens */
  --color-charcoal: #1C2826;
  --color-paper: #FAFAF5;
  --color-sage: #3D6154;
  --color-loess: #EDE9DC;
  --color-stone: #6E7B77;
  --color-ochre: #8B5A14;
}
```

Font loading (via Next.js `next/font/google`):
```ts
import { EB_Garamond, Inter } from 'next/font/google'

const garamond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
})
```

---

## 5. Print Implementation Notes

- All colour values above are given as both hex/RGB (screen) and CMYK (print).
- The CMYK values are **reference starting points** — verify against the specific paper stock and printing process. Fine art giclée on cotton-rag may require ICC profile adjustment.
- **EB Garamond in print:** embed as OTF outlines or use a high-resolution rasterisation (≥2400 dpi) for fine art printing. The Regular weight at ≤8pt in CMYK should use only the K channel (pure black) to avoid mis-registration on small type.
- **Neckar-Charcoal in print:** the C30 M0 Y5 K84 mix is the recommended reference. For premium offset printing, consider a spot colour match (Pantone equivalent: approximately **Pantone 433 C** or **Pantone Black 7 C** — verify with press proof).

---

*This document is the source of truth for all typographic and chromatic decisions. Changes must be reflected here and in the logo-spec.md before being applied downstream.*
