# Collection 01 — Export Guide
## Produktionsexport · April 2026

> Scope: BEI-30 — Alle vier Motive (NS-01–NS-04) in Druckproduktionsdateien und Storefront-Präsentationsassets überführen.

---

## 1 · Quellformat

Alle Motive liegen als **SVG (Scalable Vector Graphics)** vor — reines Vektorformat, auflösungsunabhängig.

| Motiv | Quelldatei | viewBox | Seitenverhältnis |
|-------|-----------|---------|------------------|
| NS-01 Minneburg | `illustrations/ns-01-minneburg.svg` | 500 × 750 | 2:3 |
| NS-02 Dilsberg | `illustrations/ns-02-dilsberg.svg` | 500 × 750 | 2:3 |
| NS-03 Hirschhorn | `illustrations/ns-03-hirschhorn.svg` | 500 × 750 | 2:3 |
| NS-04 Heidelberg | `illustrations/ns-04-heidelberg.svg` | 500 × 750 | 2:3 |

SVG enthält keine Rasterdaten — jeder Export bei 300 dpi ist verlustfrei.

---

## 2 · POD-Druckproduktion

### 2.1 Zielformat (Standardspezifikation)

Bis zur Bestätigung des POD-Suppliers gilt folgende Standardspezifikation, die von allen gängigen Giclée-Anbietern (WHCC, Printful, Prodigi, Helloprint) akzeptiert wird:

| Parameter | Spezifikation | Notiz |
|-----------|--------------|-------|
| Format | PDF/X-4 (bevorzugt) oder TIFF | PDF/X-4 = drucksicherer Standard, kein Color-Management nötig |
| Auflösung | 300 dpi bei Zielgröße | Für 50×70 cm: 5905 × 8268 px |
| Farbraum | sRGB IEC 61966-2.1 | Primär; nach Supplier-Angabe auf Adobe RGB 1998 anpassen |
| Farbmodus | RGB (für Giclée-Druck) | CMYK nur wenn Supplier explizit fordert |
| Beschnitt | 5 mm umlaufend | Gesamtgröße mit Beschnitt: 60 × 80 cm ≙ 7087 × 9449 px |
| Kompression | Keine (TIFF uncompressed) / PDF/X-4 Flate | Keine JPEG-Artefakte |
| ICC-Profil | sRGB IEC 61966-2.1 eingebettet | |

### 2.2 Zieldruckgrößen

| Größe | Pixel bei 300 dpi (ohne Beschnitt) | Pixel bei 300 dpi (mit 5 mm Beschnitt) |
|-------|-------------------------------------|----------------------------------------|
| 50×70 cm (A2+) | 5905 × 8268 px | 6378 × 8740 px |
| 30×42 cm (A3) | 3543 × 4961 px | 4016 × 5433 px |
| 70×100 cm (B1) | 8268 × 11811 px | 8740 × 12283 px |

### 2.3 Export-Workflow (Inkscape CLI)

```bash
# Voraussetzung: Inkscape ≥ 1.2 installiert
# Export als PNG bei 300 dpi, Zielbreite 50 cm (≙ Basis für PDF-Erstellung)

# Schritt 1 — PNG bei 300 dpi (6378 px Breite mit 5 mm Beschnitt)
inkscape \
  --export-type=png \
  --export-filename="print/ns-01-minneburg-print-300dpi.png" \
  --export-width=6378 \
  --export-height=8740 \
  illustrations/ns-01-minneburg.svg

# Schritt 2 — PNG → PDF/X-4 via Ghostscript
gs \
  -dBATCH -dNOPAUSE \
  -sDEVICE=pdfwrite \
  -dPDFX=true \
  -dPDFA=0 \
  -sOutputFile="print/ns-01-minneburg-print.pdf" \
  -dCompatibilityLevel=1.6 \
  print/ns-01-minneburg-print-300dpi.png

# Alternative: direkt SVG → PDF via Inkscape (ohne Rasterisierung)
inkscape \
  --export-type=pdf \
  --export-filename="print/ns-01-minneburg-vector.pdf" \
  illustrations/ns-01-minneburg.svg
```

### 2.4 Dateinamen-Konvention (Print)

```
print/
├── ns-01-minneburg-print-300dpi.pdf
├── ns-02-dilsberg-print-300dpi.pdf
├── ns-03-hirschhorn-print-300dpi.pdf
└── ns-04-heidelberg-print-300dpi.pdf
```

---

## 3 · Storefront Web-Assets

### 3.1 Asset-Typen pro Motiv

| Asset-Typ | Auflösung | Format | Dateiname-Suffix |
|-----------|-----------|--------|-----------------|
| Hauptbild (Produktseite) | 1200 × 1680 px | WebP (Qualität 90) | `-web-1200.webp` |
| Thumbnail (Listenansicht) | 600 × 840 px | WebP (Qualität 85) | `-thumb-600.webp` |
| Detail-Crop (Textur/Himmel) | 800 × 800 px (quadrat) | WebP (Qualität 90) | `-detail-800.webp` |
| OG-Image (Social Sharing) | 1200 × 630 px | JPEG (Qualität 90) | `-og-1200.jpg` |

### 3.2 Dateinamen-Konvention (Web)

```
web/
├── ns-01-minneburg-web-1200.webp
├── ns-01-minneburg-thumb-600.webp
├── ns-01-minneburg-detail-800.webp
├── ns-01-minneburg-og-1200.jpg
├── ns-02-dilsberg-web-1200.webp
├── ...
```

### 3.3 Export-Workflow (Web-Assets)

```bash
# PNG-Zwischenstufe bei 1200 px Breite (2× für Retina)
inkscape \
  --export-type=png \
  --export-filename="web/ns-01-minneburg-web-2400.png" \
  --export-width=2400 \
  --export-height=3360 \
  illustrations/ns-01-minneburg.svg

# WebP-Komprimierung via cwebp (libwebp)
cwebp -q 90 web/ns-01-minneburg-web-2400.png -o web/ns-01-minneburg-web-1200.webp

# Thumbnail via ImageMagick
magick web/ns-01-minneburg-web-2400.png \
  -resize 1200x1680 \
  -quality 85 \
  web/ns-01-minneburg-thumb-600.webp

# Detail-Crop (obere 60% = Himmels-/Burgzone; quadratischer Ausschnitt Mitte oben)
magick web/ns-01-minneburg-web-2400.png \
  -crop 2400x2400+0+0 \
  -resize 800x800 \
  -quality 90 \
  web/ns-01-minneburg-detail-800.webp

# OG-Image (letterboxed 1200×630, Hintergrund #1C2826)
magick web/ns-01-minneburg-web-2400.png \
  -resize 1200x630^ \
  -gravity Center \
  -extent 1200x630 \
  -quality 90 \
  web/ns-01-minneburg-og-1200.jpg
```

---

## 4 · Lifestyle-Mockups

Lifestyle-Mockups liegen als SVG unter `mockups/` — ein Motiv pro Datei, Darstellung als gerahmter Druck an weißer Wand. Diese SVGs können direkt in Storefront-HTML eingebettet oder als WebP exportiert werden.

| Datei | Inhalt |
|-------|--------|
| `mockups/ns-01-minneburg-mockup-framed.svg` | Minneburg, gerahmt, Wand-Kontext |
| `mockups/ns-02-dilsberg-mockup-framed.svg` | Dilsberg, gerahmt, Wand-Kontext |
| `mockups/ns-03-hirschhorn-mockup-framed.svg` | Hirschhorn, gerahmt, Wand-Kontext |
| `mockups/ns-04-heidelberg-mockup-framed.svg` | Heidelberg, gerahmt, Wand-Kontext |

### Mockup-Export für Storefront

```bash
# Mockup als WebP für Produktseite (1400×1050 px, Querformat für Lifestyle-Kontext)
inkscape \
  --export-type=png \
  --export-filename="web/ns-01-minneburg-mockup-2800.png" \
  --export-width=2800 \
  --export-height=2100 \
  mockups/ns-01-minneburg-mockup-framed.svg

cwebp -q 90 web/ns-01-minneburg-mockup-2800.png \
  -o web/ns-01-minneburg-mockup-1400.webp
```

---

## 5 · Pre-Flight-Checkliste

Vor Übergabe an den POD-Supplier jedes Print-File prüfen:

### 5.1 Auflösungs-Check

```bash
# Pixelmaße prüfen (ImageMagick)
magick identify -verbose print/ns-01-minneburg-print-300dpi.pdf | grep -E "Geometry|Resolution|Colorspace"
```

Erwartete Ausgabe für 50×70 cm @ 300 dpi:
- Geometry: `5905x8268` (ohne Beschnitt) oder `6378x8740` (mit Beschnitt)
- Resolution: `300x300`
- Colorspace: `sRGB`

### 5.2 Farbraum-Check

```bash
# ICC-Profil prüfen
magick identify -verbose print/ns-01-minneburg-print-300dpi.pdf | grep "ICC"
# Erwartung: sRGB IEC 61966-2.1 eingebettet
```

### 5.3 Artifact-Inspektion

- [ ] SVG-Quelldatei in Browser öffnen → kein Rendering-Fehler
- [ ] Exportiertes PNG bei 100% Zoom öffnen → keine Treppeneffekte an Schrift, keine Aliasing-Artefakte
- [ ] Farben vergleichen (Eyedropper) gegen Brand-Tokens: #1C2826, #3D6154, #6E7B77, #EDE9DC, #FAFAF5, #8B5A14

### 5.4 Checkliste pro Motiv (vor Übergabe abhaken)

| Prüfpunkt | NS-01 | NS-02 | NS-03 | NS-04 |
|-----------|-------|-------|-------|-------|
| Auflösung ≥ 300 dpi bei Zielgröße | ☐ | ☐ | ☐ | ☐ |
| Farbraum sRGB eingebettet | ☐ | ☐ | ☐ | ☐ |
| Keine Kompressionsartefakte | ☐ | ☐ | ☐ | ☐ |
| Farbwerte gegen Brand-Tokens geprüft | ☐ | ☐ | ☐ | ☐ |
| Dateiname nach Konvention | ☐ | ☐ | ☐ | ☐ |
| Web-Vorschau WebP vorhanden | ☐ | ☐ | ☐ | ☐ |
| Thumbnail WebP vorhanden | ☐ | ☐ | ☐ | ☐ |
| Mockup SVG vorhanden | ☐ | ☐ | ☐ | ☐ |

---

## 6 · Supplier-Anpassung (ausstehend)

Sobald der POD-Supplier feststeht, folgende Parameter anpassen:

| Supplier | Format | Farbraum | Beschnitt | Besonderheit |
|----------|--------|---------|-----------|-------------|
| Prodigi | TIFF / PDF | sRGB | 3 mm | API-Upload möglich |
| WHCC | TIFF | Adobe RGB 1998 | 1/8 Zoll ≈ 3,2 mm | US-Maße bevorzugt |
| Printful | PNG / JPG | sRGB | 2,5 cm | Max. 200 MB |
| Helloprint | PDF/X-1a | CMYK | 3 mm | Vectorpfad für Outline-Text |

Für Giclée-Qualität (Hahnemühle-Papier): Prodigi oder spezialisierte EU-Giclée-Druckereien bevorzugen.

---

## 7 · Asset-Übergabe-Status

| Asset | Status |
|-------|--------|
| SVG-Quelldateien (4×) | ✓ Vorhanden |
| Mockup-SVGs (4×) | ✓ Vorhanden |
| Export-Guide | ✓ Vorhanden |
| Print-PDFs (4×) | ○ Ausstehend — Inkscape/Ghostscript-Export |
| Web-WebPs (4×, 3 Varianten) | ○ Ausstehend — Inkscape/cwebp-Export |
| Mockup-WebPs (4×) | ○ Ausstehend — nach Mockup-SVG-Export |
| Supplier-Specs bestätigt | ○ Ausstehend — Fulfillment-Task |
| Pre-Flight-Check abgezeichnet | ○ Ausstehend — nach Export |
