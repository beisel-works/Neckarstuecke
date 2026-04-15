# Web-Assets · Collection 01

Dieses Verzeichnis nimmt die optimierten Web-Vorschaubilder für den Storefront auf.

## Erwartete Dateien (pro Motiv, 4 Varianten)

```
ns-01-minneburg-web-1200.webp      — Hauptbild Produktseite (1200 × 1680 px)
ns-01-minneburg-thumb-600.webp     — Thumbnail Listenansicht (600 × 840 px)
ns-01-minneburg-detail-800.webp    — Detail-Crop quadrat (800 × 800 px)
ns-01-minneburg-og-1200.jpg        — OG-Image Social Sharing (1200 × 630 px)

ns-01-minneburg-mockup-1400.webp   — Lifestyle-Mockup Produktseite (1400 × 1050 px)

(je 5 Dateien × 4 Motive = 20 Dateien gesamt)
```

## Export ausführen

Siehe `../export-guide.md` — Abschnitte 3.3 und 4 für die vollständigen Workflows.

## Werkzeuge

- **Inkscape** (CLI) — SVG → PNG bei Zielauflösung
- **cwebp** (libwebp) — PNG → WebP mit Qualitätsstufe 90/85
- **ImageMagick** — Cropping, Resizing, OG-Format
- **Mockup-Export:** SVG in `../mockups/` als Basis, gleicher Inkscape+cwebp-Workflow

## Spezifikation

- Alle WebP-Dateien sind 2× Retina-optimiert (Ausgabe in halber CSS-Pixelgröße)
- Kein progressives JPEG — nur die OG-Images als JPEG, Qualität 90
- **Status:** Ausstehend — Inkscape und cwebp müssen installiert sein
