# AGENTS.md

## Learnings

- Use `python3 exports/export_collection_assets.py` from `motifs/` or `python3 motifs/exports/export_collection_assets.py` from repo root to regenerate the full `BEI-30` asset set.
- Debian 12 ships ImageMagick 6 in this workspace, so the CLI command is `convert`, not `magick`.
- `motifs/exports/manifest.json` is the authoritative inventory for generated print and web assets, and `motifs/exports/preflight-report.md` is the quick preflight summary.

## Steering Section

- Stub exports are not acceptable here. `BEI-30` means real files on disk for print, web, and mockup handoff.

