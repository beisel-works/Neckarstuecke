# Web-Assets · Collection 01

Dieses Verzeichnis nimmt die optimierten Web-Vorschaubilder für den Storefront auf.

## Erwartete Dateien (pro Motiv)

```
ns-01-minneburg-web-1200.webp      — Hauptbild Produktseite (1200 × 1680 px)
ns-01-minneburg-web-2400.webp      — Retina-Variante Hauptbild
ns-01-minneburg-thumb-600.webp     — Thumbnail Listenansicht (600 × 840 px)
ns-01-minneburg-thumb-1200.webp    — Retina-Variante Thumbnail
ns-01-minneburg-detail-800.webp    — Detail-Crop quadrat (800 × 800 px)
ns-01-minneburg-detail-1600.webp   — Retina-Variante Detail-Crop
ns-01-minneburg-og-1200.jpg        — OG-Image Social Sharing (1200 × 630 px)

ns-01-minneburg-mockup-framed-1400.webp   — Gerahmtes Lifestyle-Mockup
ns-01-minneburg-mockup-framed-2800.webp   — Retina-Variante gerahmt
ns-01-minneburg-mockup-room-1400.webp     — Room-Context-Mockup
ns-01-minneburg-mockup-room-2800.webp     — Retina-Variante Room-Context

(je 11 Dateien × 4 Motive = 44 Dateien gesamt)
```

## Export ausführen

```bash
python3 ../export_collection_assets.py
```

Siehe `../manifest.json` fuer die vollständige Inventarliste.

## Werkzeuge

- **Inkscape** (CLI) — SVG → PNG bei Zielauflösung
- **cwebp** (libwebp) — PNG → WebP mit Qualitätsstufe 90/85
- **ImageMagick** (`convert`) — Cropping, Resizing, OG-Format
- **Mockup-Export:** SVG in `../mockups/` als Basis, gleicher Inkscape+cwebp-Workflow

## Spezifikation

- Alle WebP-Dateien liegen als Standard- und Retina-Variante vor
- Kein progressives JPEG — nur die OG-Images als JPEG, Qualität 90
- **Status:** Generiert — siehe `../manifest.json`
