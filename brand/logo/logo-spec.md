# Neckarstücke — Logo Specification

> Version 1.0 · April 2026  
> Status: Foundation asset — all brand touchpoints reference this spec

---

## Files in this directory

| File | Description | Use |
|------|-------------|-----|
| `logo-primary.svg` | Mark + wordmark, charcoal on transparent | Default, light backgrounds |
| `logo-reversed.svg` | Mark + wordmark, warm white on dark background | Dark backgrounds, packaging, night-mode |
| `logo-mono.svg` | Mark + wordmark, pure black on transparent | Single-colour print, embossing, laser engraving |
| `logo-wordmark.svg` | Wordmark only (no mark), charcoal | When mark has already appeared, space-constrained layouts |
| `logo-mark.svg` | Standalone symbol only | Watermark, favicon base, stamp, packaging emblem |

---

## Design Rationale

### The Mark — Valley Symbol

Three nested arcs, open at the bottom, read simultaneously as:

- A **valley cross-section** — the two slopes of the Neckar valley meeting at the river
- A **topographic echo** of WPA National Park poster landscapes (flat, layered, graphic)
- A **river trace** — the innermost arc is the river itself; the outer arcs are the valley walls

The three-arc structure creates visual weight without mass. At small scales (favicon, stamp) it reads as a clean abstract mark. At large scales it is recognisably a landscape.

The arcs are drawn with `stroke-linecap="round"` to ensure softness at the terminal points — never harsh or mechanical.

### The Wordmark

**"NECKARSTÜCKE"** in small caps / tracked uppercase.

- **Typeface**: EB Garamond (primary), Garamond, Cormorant Garamond, Georgia (fallbacks)
- **Weight**: Regular (400) — the brand is assured, not bold
- **Tracking**: 6px letter-spacing with `textLength="300"` for layout precision
- **Sub-label**: "NECKARTAL" in a smaller tracked caption below the lower rule — optional; omit where space is tight

The two hairline rules (above and below the wordmark) are a direct reference to the register-lines found on WPA print series and museum print labels. They frame the wordmark as an imprint, not a logotype.

---

## Colour Specification

| Role | Value | Usage |
|------|-------|-------|
| **Ink** (primary) | `#1C2826` | Mark + wordmark on all light backgrounds |
| **Paper** (reverse) | `#FAFAF5` | Mark + wordmark on dark backgrounds |
| **Mono** | `#000000` | Single-colour print applications only |
| **Dark ground** | `#1C2826` | Background in reversed version |

`#1C2826` is a deep forest charcoal with a slight green-cool undertone — not pure black. It reads as ink on paper, referencing the warmth of fine art printing without being brown or sepia.

---

## Clear Space

Minimum clear space around the full logo lockup: **equal to the height of the valley mark** (approximately 50px at the default 400px-wide render).

Minimum clear space around the standalone mark: **25% of the mark's width** on all sides.

---

## Minimum Size

| Context | Minimum width |
|---------|--------------|
| Full lockup (mark + wordmark) | 160px screen / 42mm print |
| Wordmark only | 120px screen / 32mm print |
| Standalone mark | 24px screen / 8mm print |

At the minimum standalone mark size, the three arcs should remain distinct. Below 24px screen, use a single arc only (the outer valley arc).

---

## Usage Rules

**Do:**
- Use the primary (charcoal) version on cream, white, light grey, and warm-toned backgrounds
- Use the reversed version on backgrounds equal to or darker than `#1C2826`
- Use the wordmark-only version within editorial layouts where the mark has already appeared
- Allow the mark to appear alone as a watermark at low opacity (≥ 15%) on print preview images

**Do not:**
- Stretch, skew, or distort any element
- Reproduce the wordmark in weights other than Regular (400)
- Apply drop shadows, outlines, or effects
- Combine the wordmark with a different symbol
- Place the primary version on coloured or photographic backgrounds without a white/cream panel behind it

---

## Export Notes

The SVG files are the source of truth. For raster exports:

- **PNG** at 2× (`800 × 280px`) for screen use (transparent background)
- **PNG** at 300 dpi for print (at 42mm width = ~496px wide)
- Export from a vector tool (Figma, Inkscape, Illustrator) with EB Garamond embedded or converted to outlines

When converting text to outlines, use the `textLength`-constrained layout in these SVGs as the reference for letterform width and spacing.
