# Print-Exports · Collection 01

Dieses Verzeichnis nimmt die druckfertigen Produktionsdateien auf.

Die 300-dpi-TIFFs bleiben absichtlich lokal und werden nicht mehr in Git
versioniert. Vercel braucht sie nicht fuer den Build, und Git LFS blockiert
sonst Preview-Deployments fuer das gesamte Repository.

## Erwartete Dateien

```
ns-01-minneburg-print-300dpi.pdf
ns-01-minneburg-print-300dpi.tiff
ns-01-minneburg-source-master.pdf
ns-02-dilsberg-print-300dpi.pdf
ns-02-dilsberg-print-300dpi.tiff
ns-02-dilsberg-source-master.pdf
ns-03-hirschhorn-print-300dpi.pdf
ns-03-hirschhorn-print-300dpi.tiff
ns-03-hirschhorn-source-master.pdf
ns-04-heidelberg-print-300dpi.pdf
ns-04-heidelberg-print-300dpi.tiff
ns-04-heidelberg-source-master.pdf
ns-05-guttenberg-print-300dpi.pdf
ns-05-guttenberg-print-300dpi.tiff
ns-05-guttenberg-source-master.pdf
ns-06-bad-wimpfen-print-300dpi.pdf
ns-06-bad-wimpfen-print-300dpi.tiff
ns-06-bad-wimpfen-source-master.pdf
```

## Export ausführen

```bash
python3 ../export_collection_assets.py
```

Siehe `../export-guide.md` fuer die Spezifikation und `../preflight-report.md` fuer die generierten Checks.

## Spezifikation

- **Auflösung:** 300 dpi bei 50×70 cm Druckgröße
- **Pixel:** 6378 × 8740 px (Export mit Beschnitt gemäß Repo-Spezifikation)
- **Format:** PDF + TIFF unkomprimiert, zusaetzlich Source-Master-PDF aus der aktiven SVG- oder PNG-Quelle
- **Farbraum:** sRGB IEC 61966-2.1 eingebettet
- **Status:** Generiert — siehe `../manifest.json`
- **Git:** PDFs und Metadaten koennen versioniert werden, TIFFs bleiben lokale Exportartefakte

> Pre-Flight-Ergebnisse stehen in `../preflight-report.md`.
