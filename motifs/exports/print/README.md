# Print-Exports · Collection 01

Dieses Verzeichnis nimmt die druckfertigen Produktionsdateien auf.

## Erwartete Dateien

```
ns-01-minneburg-print-300dpi.pdf
ns-01-minneburg-print-300dpi.tiff
ns-01-minneburg-vector-master.pdf
ns-02-dilsberg-print-300dpi.pdf
ns-02-dilsberg-print-300dpi.tiff
ns-02-dilsberg-vector-master.pdf
ns-03-hirschhorn-print-300dpi.pdf
ns-03-hirschhorn-print-300dpi.tiff
ns-03-hirschhorn-vector-master.pdf
ns-04-heidelberg-print-300dpi.pdf
ns-04-heidelberg-print-300dpi.tiff
ns-04-heidelberg-vector-master.pdf
```

## Export ausführen

```bash
python3 ../export_collection_assets.py
```

Siehe `../export-guide.md` fuer die Spezifikation und `../preflight-report.md` fuer die generierten Checks.

## Spezifikation

- **Auflösung:** 300 dpi bei 50×70 cm Druckgröße
- **Pixel:** 6378 × 8740 px (Export mit Beschnitt gemäß Repo-Spezifikation)
- **Format:** PDF + TIFF unkomprimiert, zusätzlich Vektor-Master-PDF
- **Farbraum:** sRGB IEC 61966-2.1 eingebettet
- **Status:** Generiert — siehe `../manifest.json`

> Pre-Flight-Ergebnisse stehen in `../preflight-report.md`.
