# Neckarstücke — Brand Guidelines

> Version 1.0 · April 2026  
> Status: Source of truth — governs all brand and design decisions  
> Audience: developers, designers, copywriters, collaborators

This document consolidates the complete Neckarstücke identity system. It assembles and presents the outputs of the founding brand identity work: verbal identity, logo, colour palette, typography, and visual art direction. It is the single reference for anyone building or extending the brand.

**Source documents** (for deeper specification detail):
- `brand/verbal-identity.md`
- `brand/logo/logo-spec.md`
- `brand/typography-and-colour.md`
- `brand/visual-art-direction.md`
- `brand/logo/` (SVG files)

---

## Quick-Start Reference

> For anyone who needs the essentials immediately. The full sections below expand on each point.

| What | Use |
|------|-----|
| **Logo — light backgrounds** | `brand/logo/logo-primary.svg` (charcoal on transparent) |
| **Logo — dark backgrounds** | `brand/logo/logo-reversed.svg` (paper on `#1C2826`) |
| **Primary typeface** | EB Garamond Regular 400 — headings, display, print titles |
| **Body typeface** | Inter Regular 400 / Medium 500 — all body copy, UI, labels |
| **Primary text colour** | `#1C2826` Neckar-Charcoal on `#FAFAF5` Paper |
| **Accent colour** | `#3D6154` Valley Sage |
| **Tagline** | *Das Neckartal. Unvergänglich.* |
| **Voice in one word** | Spezifisch — specific, never generic |
| **Illustration style** | Flat vector, WPA-influenced, portrait 2:3, max 6 colours |
| **Tone to avoid** | Tourism-board enthusiasm; sentimentality; urgency marketing |

---

## 1. Brand Overview

### Who we are

Neckarstücke is a collection of fine art prints for people who know the Neckar valley — those who stayed, and those who left and still carry it with them.

The name operates on two levels: *Stücke* means pieces or fragments ("pieces of the Neckar"), and *Stück* also means a work — a musical composition, something crafted with intention. The name says, at once, *selected fragments of a place* and *artistic works about that place*. It contains no generic tourism vocabulary. It trusts the audience to bring their own meaning.

### What we make

Digital vector illustrations printed as fine art giclée on Hahnemühle Fine Art paper. Each print is made to order. The first collection begins with four locations from the Neckar valley — Hirschhorn, Dilsberg, Minneburg, and a fourth site to be confirmed.

### Core values

- **Curation over quantity** — a small, considered collection earns more trust than a wide catalogue
- **Specificity over adjectives** — "280 Meter über dem Neckar" says more than "beeindruckend"
- **Objects, not products** — a fine art print has weight, texture, presence; the language reflects this
- **The region, not the tourism board** — write about places the way a local writes in a letter

---

## 2. Logo

### 2.1 The Mark

Three nested arcs, open at the bottom, read simultaneously as:
- A **valley cross-section** — the two slopes of the Neckar valley meeting at the river
- A **topographic reference** to WPA landscape illustration
- A **river trace** — the innermost arc is the river; the outer arcs are the valley walls

The arcs are drawn with rounded terminals — never harsh or mechanical.

### 2.2 The Wordmark

**NECKARSTÜCKE** in tracked uppercase EB Garamond Regular (400), framed by hairline rules above and below. The rules reference the register-lines of WPA print series and museum print labels — the wordmark reads as an imprint, not a logotype.

### 2.3 Logo Files

| File | Use |
|------|-----|
| `logo-primary.svg` | Default — charcoal on transparent, light backgrounds |
| `logo-reversed.svg` | Dark backgrounds, packaging, dark-mode |
| `logo-mono.svg` | Single-colour print, embossing, laser engraving |
| `logo-wordmark.svg` | Wordmark only — when mark has already appeared elsewhere on the page |
| `logo-mark.svg` | Standalone symbol — watermark, favicon base, stamp, packaging emblem |

### 2.4 Colours

| Context | Mark + wordmark | Background |
|---------|----------------|------------|
| Light backgrounds | `#1C2826` Neckar-Charcoal | Transparent |
| Dark backgrounds | `#FAFAF5` Paper | `#1C2826` Neckar-Charcoal |
| Single-colour print | `#000000` pure black | — |

### 2.5 Clear Space and Minimum Size

**Clear space:** equal to the height of the valley mark on all sides (≈ 50px at 400px render width). Standalone mark: 25% of mark width on all sides.

| Version | Screen minimum | Print minimum |
|---------|---------------|---------------|
| Full lockup | 160px | 42mm |
| Wordmark only | 120px | 32mm |
| Standalone mark | 24px | 8mm |

Below 24px screen, use a single arc (the outer valley arc only).

### 2.6 Do and Don't

**Do:**
- Use the primary version on cream, white, light grey, and warm-toned backgrounds
- Use the reversed version on dark backgrounds
- Use the wordmark-only version when the mark has already appeared on the same spread or page
- Use the standalone mark as a watermark (≥ 15% opacity) on print preview images

**Do not:**
- Stretch, skew, or distort any element
- Apply drop shadows, outlines, gradients, or effects
- Reproduce the wordmark in any weight other than Regular (400)
- Place the primary (charcoal) version directly on a coloured or photographic background without a light panel behind it
- Combine the wordmark with any symbol other than the valley mark

---

## 3. Colour Palette

### 3.1 Core Palette

| Name | Hex | RGB | CMYK | Role |
|------|-----|-----|------|------|
| **Neckar-Charcoal** | `#1C2826` | 28, 40, 38 | C30 M0 Y5 K84 | Primary brand colour — ink, logo, primary text |
| **Paper** | `#FAFAF5` | 250, 250, 245 | C0 M0 Y2 K2 | Primary background — all light-mode surfaces |
| **Valley Sage** | `#3D6154` | 61, 97, 84 | C37 M0 Y13 K62 | Primary accent — interactive elements, CTAs, highlights |
| **Loess** | `#EDE9DC` | 237, 233, 220 | C0 M2 Y7 K7 | Surface — cards, panels, hover backgrounds |
| **River Stone** | `#6E7B77` | 110, 123, 119 | C11 M0 Y3 K52 | Muted UI — secondary text, dividers, placeholders |
| **Ochre** | `#8B5A14` | 139, 90, 20 | C0 M35 Y86 K45 | Warm accent — pricing, limited editions, seasonal |

Each colour is grounded in the physical landscape: Charcoal is fine art ink, Paper is cotton-rag stock, Sage is the valley slopes in late summer, Loess is the limestone geology, River Stone is wet cobble in the Neckar bed, Ochre is autumn oak and iron-earth pigment.

### 3.2 Colour Roles

| Role | Colour | Hex |
|------|--------|-----|
| Primary text | Neckar-Charcoal | `#1C2826` |
| Primary background | Paper | `#FAFAF5` |
| Reversed text | Paper | `#FAFAF5` |
| Reversed background | Neckar-Charcoal | `#1C2826` |
| Primary accent (links, buttons, focus) | Valley Sage | `#3D6154` |
| Surface / card background | Loess | `#EDE9DC` |
| Secondary / muted (captions, metadata) | River Stone | `#6E7B77` |
| Warm accent (pricing, editions) | Ochre | `#8B5A14` |

### 3.3 Contrast Ratios (WCAG 2.1)

| Pairing | Ratio | AA | AAA |
|---------|-------|----|-----|
| Charcoal on Paper | 14.5 : 1 | ✓ | ✓ |
| Paper on Charcoal | 14.5 : 1 | ✓ | ✓ |
| Charcoal on Loess | 12.5 : 1 | ✓ | ✓ |
| Sage on Paper | 6.6 : 1 | ✓ | ✓ |
| Paper on Sage | 6.6 : 1 | ✓ | ✓ |
| Ochre on Paper | 5.6 : 1 | ✓ normal text | — |
| River Stone on Paper | 4.2 : 1 | Large text / decorative only | — |

**River Stone** must not be used for body text under 18px — it is a support colour for decorative and secondary-information contexts only.

### 3.4 What Not to Do

- Do not use Ochre for body copy — it fails AAA and should appear only in accent contexts (pricing, edition badges)
- Do not use River Stone as primary text colour — contrast is insufficient for small type
- Do not introduce saturated digital colours or pure primaries — the palette is deliberate and landscape-derived
- Do not combine Ochre and Sage in the same interface element — the two accents should not compete

---

## 4. Typography

### 4.1 Typefaces

**Display — EB Garamond Regular 400**
- Source: Google Fonts (SIL OFL 1.1 — confirmed for commercial web use)
- Use: display/hero text, H1–H3 headings, print titles, pull-quotes
- The same face as the logo wordmark — it is the brand voice in text form

**Body — Inter Regular 400 / Medium 500**
- Source: Google Fonts (SIL OFL 1.1 — confirmed for commercial web use)
- Use: all body copy, UI labels, captions, navigation, metadata
- Designed for screen legibility; neutral humanist geometry balances Garamond's warmth

### 4.2 Type Scale

| Level | Size | Weight | Typeface | Line-height | Tracking |
|-------|------|--------|----------|-------------|----------|
| Display | 72px / 4.5rem | EB Garamond 400 | EB Garamond | 1.05 | −0.02em |
| H1 | 48px / 3rem | EB Garamond 400 | EB Garamond | 1.1 | −0.01em |
| H2 | 36px / 2.25rem | EB Garamond 400 | EB Garamond | 1.15 | −0.005em |
| H3 | 24px / 1.5rem | EB Garamond 400 | EB Garamond | 1.25 | 0em |
| H4 | 20px / 1.25rem | Inter 500 | Inter | 1.3 | +0.005em |
| Body | 16px / 1rem | Inter 400 | Inter | 1.65 | 0em |
| Caption | 14px / 0.875rem | Inter 400 | Inter | 1.5 | +0.01em |
| Label | 12px / 0.75rem | Inter 500 | Inter | 1.4 | +0.08em |
| Label (uppercase) | 11px / 0.6875rem | Inter 500 | Inter | 1.4 | +0.12em |

*H4 switches to Inter — Garamond becomes congested below 20px on screen. The Label (uppercase) style references the small-caps register used in the wordmark and WPA catalogue labels.*

### 4.3 Pairing Rules

1. **Never place two display-level Garamond elements on the same visual line** — separate with Inter caption or use weight hierarchy
2. **Body text is always Inter** — four or more lines of Garamond body text is a reading-comfort problem
3. **EB Garamond Italic** is reserved for pull-quotes and edition notes — not UI states
4. **No bold weights** — the heaviest weight in the system is Inter Medium 500; all Garamond headings use Regular 400
5. **Minimum text size: 14px** — below this, switch to a label style; do not scale body type down

### 4.4 Mock Print Title Card

A correctly set print title card uses:
```
[Label uppercase — EB Garamond tracked +0.12em]
HIRSCHHORN

[Body — Inter 400, 16px, line-height 1.65]
Fine Art Druck · 50 × 70 cm
Hahnemühle Photo Rag 310g
Druck auf Bestellung
```
The location name in the uppercase label style references the motif's internal typographic treatment.

### 4.5 Wrong: What to Avoid

- Garamond Bold or Semibold in any context — these weights are not part of the system
- Inter for headings above H4 — Garamond is the heading voice
- Mixing both typefaces at the same visual hierarchy level
- Italic Inter — it is not part of the brand system

---

## 5. Verbal Identity and Voice

### 5.1 Taglines

**Primary:**
> Das Neckartal. Unvergänglich.
> *(The Neckar Valley. Timeless.)*

Declarative, not promotional. Use in brand statements, footers, stationery, packaging.

**Secondary (use sparingly):**
> Für die, die bleiben. Und die, die gegangen sind.
> *(For those who stay. And those who left.)*

Reserve for about pages, direct brand introductions, moments of audience address.

### 5.2 Four Voice Attributes

**1. Spezifisch — Specific**
Name things precisely. "Die Ruine der Minneburg thront 280 Meter über dem Neckar" — not "eine beeindruckende Burgruine mit toller Aussicht."

**2. Ruhig und sicher — Calm and confident**
Never shout. No superlatives in place of substance. The work is good — let it speak. "Jedes Motiv entsteht als Einzeldruck auf Bestellung" — not "Bestellen Sie jetzt und erleben Sie unvergleichliche Qualität!"

**3. Vertraut ohne Kitsch — Familiar without sentimentality**
Write with insider knowledge of the region, not performed nostalgia. "Ein Ort, den man kennt, bevor man ihn erklärt" — not "Atmen Sie die Sehnsucht nach Heimat in jedem Bild."

**4. Respektvoll — Reverent**
The places are the subject. The brand is the medium. "Dilsberg braucht keine Worte. Es braucht Zeit." — not "Dilsberg — so schön, dass man es kaum glauben kann!"

### 5.3 Vocabulary

**Use:**
- Motiv (not Bild, not Poster)
- Kunstdruck / Fine Art Druck
- Sammlung (not Sortiment, not Auswahl)
- Ort (not Sehenswürdigkeit, not Destination)
- Druck auf Bestellung
- Hahnemühle / Fine Art Papier (specific paper references signal craft)

**Avoid:**
- Poster, Souvenir, Mitbringsel, Wanddeko
- Romantisch, Idyllisch, Einzigartig, Unvergesslich
- Bestellen Sie jetzt (urgency marketing)
- Produkt (in customer-facing copy)

### 5.4 Example Copy

**Brand statement:**
> Neckarstücke ist eine Sammlung von Orten, die man kennt — aber noch nie so gesehen hat.

**Product description opener:**
> Die Minneburg braucht keine Erklärung. Sie thront — und wer einmal dort war, weiß, was das bedeutet. Dieser Druck versucht nicht, das nachzuerzählen. Er zeigt es.

**Quality statement:**
> Jeder Druck entsteht auf Bestellung, auf Fine Art Papier, mit archivfesten Tinten. Kein Lager, kein Kompromiss.

---

## 6. Visual Art Direction

### 6.1 Illustration Style

**Digital vector illustration in a restricted painterly mode.** The production tool is Illustrator or equivalent; the appearance references hand-cut gouache or silkscreen — flat shapes, intentional edge quality, no photographic textures, no depth-of-field blur.

Reference lineage: WPA / NPS National Park posters (1930s–40s), NASA Exoplanet Travel Posters (2016), German regional and transport posters (1920s–40s). Absorb the principles; do not reproduce the period.

### 6.2 Core Principles

| Principle | Rule |
|-----------|------|
| **Abstraction** | A hillside is 2–4 tonal planes, not individual trees. Architecture is its geometric silhouette. |
| **Shapes, not lines** | Closed shapes are the primary vocabulary — not pen-and-ink outlines |
| **No gradients (except sky)** | Every colour field except the sky is flat. This rule has no exceptions. |
| **Light** | Light = lighter value plane; shadow = darker value plane or Neckar-Charcoal. No gradient within a shadow. |
| **Colour count** | 4–6 colours per motif maximum |

### 6.3 Composition

- **Orientation:** portrait, approximately 2:3 (A3 proportions)
- **One dominant element** occupying ≥ 40% of the picture plane
- Dominant element sits within the middle half of the frame — not centred, but offset deliberately
- **Negative space is designed**, not leftover — sky fields and open areas are compositional masses
- Elements may be cropped; bleed is intentional

### 6.4 Colour Allocation per Motif

| Role | Allocation |
|------|------------|
| Sky / dominant background | 1 colour — lightest value |
| Land / middle ground | 1–2 colours — mid values |
| Subject (building, water, dominant form) | 1 colour — highest contrast with background |
| Shadow / depth | 1 colour — darkest value (Neckar-Charcoal or equivalent) |
| Accent (optional) | 1 colour — Ochre or location-specific; ≤ 15% of picture plane |

Location-specific accent colours must be natural, muted, and pigment-adjacent — derived from WPA palette convention. No saturated digital colours, no neon, no pure RGB primaries.

### 6.5 Typography in the Motif

The **location name appears within the artwork as an integrated compositional element**, not as a label applied on top.

- **Placement:** lower third, flush left or right; or lower quarter centred for symmetric compositions
- **Typeface:** EB Garamond Regular, uppercase, tracked +0.12em — matching the wordmark register
- **Colour:** Paper (`#FAFAF5`) on dark fields; Neckar-Charcoal (`#1C2826`) on light fields; Valley Sage permitted as alternative on Paper
- **No bounding box, background block, or drop shadow** — text sits directly in the colour field
- A hairline rule above the name is permitted as a compositional anchor
- The brand name (NECKARSTÜCKE), edition number, and URL do **not** appear in the motif

**Text integration test:** Remove the location name from the composition. Does the remaining image feel incomplete — as if something was removed? If yes: the text is compositionally integrated. If it feels fine without it: start over on placement.

### 6.6 Quality Checklist (Production Gate)

A motif is not ready for production until it passes all eight:

1. **The essential is present, the incidental is absent** — can you describe it in one noun phrase?
2. **Colour count ≤ 6** — consolidate if above; check tonal range if below 4
3. **Reads at 5 × 7 cm thumbnail** — dominant element, horizon, and text all legible
4. **No gradients outside the sky** — check every land, architecture, water, and foreground field
5. **Text is compositionally integrated** — passes the text-removal test above
6. **Palette is consistent with the brand system** — no saturated digital colours
7. **No period anachronisms** — no 1930s props, no faux-distress textures, no deliberate ageing effects
8. **Holds at 50 × 70 cm fine art giclée** — 300 dpi, edges clean, large colour fields resolve

### 6.7 First Collection — Directional Notes

**Hirschhorn:** Dominant element — castle keep silhouette on the promontory against the sky. Supporting — town roofline below. Background — sky above, river below as a secondary horizontal band.

**Dilsberg:** Dominant element — silhouetted village ring on the isolated hilltop plateau. Supporting — valley floor and river below, sky above. The roundness of the plateau edge is the defining form.

**Minneburg:** Pure silhouette subject. Ruin against the sky, forest ridge as lower horizon. No inhabitants; the fragmentary ruin is an asset — this is geological and historical time, not a day trip.

---

## 7. Implementation Reference

### Tailwind v4 / CSS Design Tokens

```css
@theme {
  --font-display: "EB Garamond", Garamond, "Cormorant Garamond", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;

  --color-charcoal: #1C2826;
  --color-paper:    #FAFAF5;
  --color-sage:     #3D6154;
  --color-loess:    #EDE9DC;
  --color-stone:    #6E7B77;
  --color-ochre:    #8B5A14;
}
```

### Next.js Font Loading

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

### Print Colour Notes

- CMYK values in section 3.1 are starting-point references — verify against paper stock and ICC profile for fine art giclée
- Neckar-Charcoal in premium offset: consider Pantone 433 C or Pantone Black 7 C (verify with press proof)
- EB Garamond in print: embed as OTF outlines or rasterise at ≥ 2400 dpi; at ≤ 8pt use K-only channel to avoid mis-registration

---

*Document owner: beisel.works*  
*Changes to any section must be reflected in the relevant source document before being applied downstream.*  
*Cross-references: `brand/verbal-identity.md` · `brand/logo/logo-spec.md` · `brand/typography-and-colour.md` · `brand/visual-art-direction.md`*
