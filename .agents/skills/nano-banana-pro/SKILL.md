---
name: nano-banana-pro
description: Generate/edit images with Nano Banana Pro (Gemini 3 Pro Image). Use for image create/modify requests incl. edits. Supports text-to-image + image-to-image; 1K/2K/4K; use --input-image.
---

# Nano Banana Pro Image Generation & Editing

Generate new images or edit existing ones using Google's Nano Banana Pro API (Gemini 3 Pro Image).

## Usage

Run the script using absolute path (do NOT cd to skill directory first):

**Generate new image:**
```bash
uv run .agents/skills/nano-banana-pro/scripts/generate_image.py --prompt "your image description" --filename "output-name.png" [--resolution 1K|2K|4K] [--api-key KEY]
```

**Edit existing image:**
```bash
uv run .agents/skills/nano-banana-pro/scripts/generate_image.py --prompt "editing instructions" --filename "output-name.png" --input-image "path/to/input.png" [--resolution 1K|2K|4K] [--api-key KEY]
```

Always run from the repository root or another working directory where you want the images saved.

## Default Workflow (draft -> iterate -> final)

- Draft (1K): quick feedback loop
  - `uv run .agents/skills/nano-banana-pro/scripts/generate_image.py --prompt "<draft prompt>" --filename "yyyy-mm-dd-hh-mm-ss-draft.png" --resolution 1K`
- Iterate: adjust prompt in small diffs; keep filename new per run
  - If editing: keep the same `--input-image` for every iteration until you're happy.
- Final (4K): only when prompt is locked
  - `uv run .agents/skills/nano-banana-pro/scripts/generate_image.py --prompt "<final prompt>" --filename "yyyy-mm-dd-hh-mm-ss-final.png" --resolution 4K`

## Resolution Options

- `1K` (default)
- `2K`
- `4K`

Map user requests to API parameters:
- No mention of resolution -> `1K`
- "low resolution", "1080", "1080p", "1K" -> `1K`
- "2K", "2048", "normal", "medium resolution" -> `2K`
- "high resolution", "high-res", "hi-res", "4K", "ultra" -> `4K`

## API Key

The script checks for API key in this order:
1. `--api-key`
2. `GEMINI_API_KEY` environment variable

## Preflight

- `command -v uv`
- `test -n "$GEMINI_API_KEY"` or pass `--api-key`
- If editing: `test -f "path/to/input.png"`

## Filename Generation

Use filenames like `yyyy-mm-dd-hh-mm-ss-description.png`.

Examples:
- `2026-04-16-01-04-30-japanese-garden.png`
- `2026-04-16-01-04-30-dramatic-sky.png`

## Image Editing

When editing an existing image:
1. Pass the source image with `--input-image`
2. Put the edit instruction in `--prompt`
3. Preserve the user's intent unless they ask for a broader change

## Output

- Saves a PNG to the current working directory or provided path
- Prints the full saved path

