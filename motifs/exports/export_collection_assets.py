#!/usr/bin/env python3

from __future__ import annotations

import json
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path

import cairosvg
from PIL import Image, ImageCms, ImageDraw, ImageFilter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[2]
ILLUSTRATIONS_DIR = ROOT / "motifs" / "illustrations"
EXPORTS_DIR = ROOT / "motifs" / "exports"
PRINT_DIR = EXPORTS_DIR / "print"
WEB_DIR = EXPORTS_DIR / "web"
MOCKUPS_DIR = EXPORTS_DIR / "mockups"
MANIFEST_PATH = EXPORTS_DIR / "manifest.json"
PREFLIGHT_PATH = EXPORTS_DIR / "preflight-report.md"

PRINT_SIZE = (6378, 8740)
PRINT_DPI = (300, 300)
MAIN_STANDARD = (1200, 1680)
MAIN_RETINA = (2400, 3360)
THUMB_STANDARD = (600, 840)
THUMB_RETINA = (1200, 1680)
DETAIL_STANDARD = (800, 800)
DETAIL_RETINA = (1600, 1600)
OG_SIZE = (1200, 630)
MOCKUP_STANDARD = (1400, 1050)
MOCKUP_RETINA = (2800, 2100)

PAPER = "#FAFAF5"
CHARCOAL = "#1C2826"
STONE = "#6E7B77"
SAGE = "#3D6154"
LOESS = "#EDE9DC"
OCHRE = "#8B5A14"


@dataclass(frozen=True)
class Motif:
    code: str
    slug: str
    title: str
    illustration: Path
    framed_mockup: Path


MOTIFS = [
    Motif(
        code="ns-01",
        slug="minneburg",
        title="Minneburg",
        illustration=ILLUSTRATIONS_DIR / "ns-01-minneburg.svg",
        framed_mockup=MOCKUPS_DIR / "ns-01-minneburg-mockup-framed.svg",
    ),
    Motif(
        code="ns-02",
        slug="dilsberg",
        title="Dilsberg",
        illustration=ILLUSTRATIONS_DIR / "ns-02-dilsberg.svg",
        framed_mockup=MOCKUPS_DIR / "ns-02-dilsberg-mockup-framed.svg",
    ),
    Motif(
        code="ns-03",
        slug="hirschhorn",
        title="Hirschhorn",
        illustration=ILLUSTRATIONS_DIR / "ns-03-hirschhorn.svg",
        framed_mockup=MOCKUPS_DIR / "ns-03-hirschhorn-mockup-framed.svg",
    ),
    Motif(
        code="ns-04",
        slug="heidelberg",
        title="Heidelberg",
        illustration=ILLUSTRATIONS_DIR / "ns-04-heidelberg.svg",
        framed_mockup=MOCKUPS_DIR / "ns-04-heidelberg-mockup-framed.svg",
    ),
]


def srgb_profile_bytes() -> bytes | None:
    try:
        return ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
    except Exception:
        return None


SRGB_PROFILE = srgb_profile_bytes()


def ensure_dirs() -> None:
    PRINT_DIR.mkdir(parents=True, exist_ok=True)
    WEB_DIR.mkdir(parents=True, exist_ok=True)


def rasterize_svg_cover(svg_path: Path, target_size: tuple[int, int]) -> Image.Image:
    width, height = target_size
    source_width, source_height = 500, 750
    scale = max(width / source_width, height / source_height)
    render_width = int(round(source_width * scale))
    render_height = int(round(source_height * scale))
    png_bytes = cairosvg.svg2png(
        url=str(svg_path),
        output_width=render_width,
        output_height=render_height,
    )
    image = Image.open(BytesIO(png_bytes)).convert("RGB")
    left = max((image.width - width) // 2, 0)
    top = max((image.height - height) // 2, 0)
    return image.crop((left, top, left + width, top + height))


def rasterize_svg_fit(
    svg_path: Path,
    target_size: tuple[int, int],
    background: str = PAPER,
    inset: int = 0,
) -> Image.Image:
    width, height = target_size
    inner_width = width - inset * 2
    inner_height = height - inset * 2
    source_width, source_height = 500, 750
    scale = min(inner_width / source_width, inner_height / source_height)
    render_width = int(round(source_width * scale))
    render_height = int(round(source_height * scale))
    png_bytes = cairosvg.svg2png(
        url=str(svg_path),
        output_width=render_width,
        output_height=render_height,
    )
    artwork = Image.open(BytesIO(png_bytes)).convert("RGB")
    canvas_image = Image.new("RGB", (width, height), background)
    x = (width - render_width) // 2
    y = (height - render_height) // 2
    canvas_image.paste(artwork, (x, y))
    return canvas_image


def rasterize_mockup(svg_path: Path, target_size: tuple[int, int]) -> Image.Image:
    width, height = target_size
    png_bytes = cairosvg.svg2png(
        url=str(svg_path),
        output_width=width,
        output_height=height,
    )
    return Image.open(BytesIO(png_bytes)).convert("RGBA")


def save_tiff(image: Image.Image, path: Path) -> None:
    kwargs = {"dpi": PRINT_DPI, "compression": "raw"}
    if SRGB_PROFILE:
        kwargs["icc_profile"] = SRGB_PROFILE
    image.save(path, format="TIFF", **kwargs)


def save_pdf(image: Image.Image, path: Path) -> None:
    page_width = image.width / PRINT_DPI[0] * 72
    page_height = image.height / PRINT_DPI[1] * 72
    png_buffer = BytesIO()
    kwargs = {"dpi": PRINT_DPI}
    if SRGB_PROFILE:
        kwargs["icc_profile"] = SRGB_PROFILE
    image.save(png_buffer, format="PNG", **kwargs)
    png_buffer.seek(0)

    pdf = canvas.Canvas(str(path), pagesize=(page_width, page_height))
    pdf.setTitle(path.stem)
    pdf.drawImage(ImageReader(png_buffer), 0, 0, width=page_width, height=page_height)
    pdf.showPage()
    pdf.save()


def save_webp(image: Image.Image, path: Path, quality: int) -> None:
    image.save(path, format="WEBP", quality=quality, method=6)


def save_jpeg(image: Image.Image, path: Path, quality: int) -> None:
    kwargs = {"quality": quality, "optimize": True}
    if SRGB_PROFILE:
        kwargs["icc_profile"] = SRGB_PROFILE
    image.save(path, format="JPEG", **kwargs)


def resize(image: Image.Image, target: tuple[int, int]) -> Image.Image:
    return image.resize(target, Image.Resampling.LANCZOS)


def build_detail_crop(render: Image.Image, target: tuple[int, int]) -> Image.Image:
    crop_size = min(render.width, int(render.height * 0.66))
    crop = render.crop((0, 0, crop_size, crop_size))
    return resize(crop, target)


def build_og_image(preview: Image.Image, motif: Motif) -> Image.Image:
    canvas_image = Image.new("RGB", OG_SIZE, CHARCOAL)
    draw = ImageDraw.Draw(canvas_image)
    for index, color in enumerate([SAGE, STONE, LOESS]):
        draw.rounded_rectangle(
            (80 + index * 18, 72 + index * 18, 1120 - index * 18, 558 - index * 18),
            radius=36,
            outline=color,
            width=2,
        )

    preview_resized = preview.copy()
    preview_resized.thumbnail((420, 560), Image.Resampling.LANCZOS)
    shadow = Image.new("RGBA", (preview_resized.width + 60, preview_resized.height + 60), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle(
        (24, 24, shadow.width - 24, shadow.height - 24),
        radius=28,
        fill=(0, 0, 0, 120),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    canvas_image.paste(shadow, (86, 86), shadow)

    card = Image.new("RGB", (preview_resized.width + 50, preview_resized.height + 50), PAPER)
    card.paste(preview_resized, (25, 25))
    canvas_image.paste(card, (110, 90))

    draw.text((650, 180), motif.title.upper(), fill=PAPER)
    draw.text((650, 240), "NECKARSTUECKE · COLLECTION 01", fill=LOESS)
    draw.text((650, 330), "Museum-quality Giclee print", fill=PAPER)
    draw.text((650, 376), "50 × 70 cm · Signed and numbered", fill=LOESS)
    return canvas_image


def build_room_context(mockup: Image.Image, motif: Motif) -> Image.Image:
    canvas_image = Image.new("RGB", MOCKUP_RETINA, PAPER)
    draw = ImageDraw.Draw(canvas_image)

    for y in range(MOCKUP_RETINA[1]):
        blend = y / MOCKUP_RETINA[1]
        if y < 1550:
            r0, g0, b0 = (244, 240, 232)
            r1, g1, b1 = (231, 226, 216)
        else:
            r0, g0, b0 = (179, 155, 129)
            r1, g1, b1 = (143, 118, 93)
        color = (
            int(r0 + (r1 - r0) * blend),
            int(g0 + (g1 - g0) * blend),
            int(b0 + (b1 - b0) * blend),
        )
        draw.line((0, y, MOCKUP_RETINA[0], y), fill=color)

    draw.rectangle((0, 1500, MOCKUP_RETINA[0], MOCKUP_RETINA[1]), fill="#B79973")
    draw.polygon([(0, 1500), (MOCKUP_RETINA[0], 1350), (MOCKUP_RETINA[0], 2100), (0, 2100)], fill="#C8AE8A")
    draw.rounded_rectangle((420, 1660, 1450, 1840), radius=24, fill="#7D644A")
    draw.rectangle((500, 1810, 560, 2050), fill="#6A533D")
    draw.rectangle((1310, 1810, 1370, 2050), fill="#6A533D")
    draw.ellipse((1760, 1550, 2360, 1890), fill="#DCC7A8")
    draw.ellipse((1860, 1620, 2260, 1830), fill="#C5A67E")
    draw.rectangle((2060, 1240, 2088, 1600), fill="#7A6247")
    for leaf in [
        (1940, 1180, 2160, 1500),
        (1860, 1040, 2080, 1380),
        (2080, 1040, 2280, 1400),
        (1980, 920, 2200, 1250),
    ]:
        draw.ellipse(leaf, fill=SAGE)

    room_shadow = Image.new("RGBA", MOCKUP_RETINA, (0, 0, 0, 0))
    room_shadow_draw = ImageDraw.Draw(room_shadow)
    room_shadow_draw.rounded_rectangle((760, 220, 2140, 1600), radius=40, fill=(0, 0, 0, 95))
    room_shadow = room_shadow.filter(ImageFilter.GaussianBlur(48))
    canvas_image.paste(room_shadow, (0, 0), room_shadow)

    mockup_scaled = mockup.resize((1180, 885), Image.Resampling.LANCZOS)
    canvas_image.paste(mockup_scaled.convert("RGB"), (810, 260), mockup_scaled)

    draw.text((150, 130), f"{motif.title.upper()} · ROOM CONTEXT", fill=CHARCOAL)
    draw.text((150, 185), "NECKARSTUECKE · EXPORT PREVIEW", fill=STONE)
    return canvas_image


def build_manifest_entry(path: Path, image: Image.Image | None = None) -> dict[str, object]:
    entry: dict[str, object] = {
        "path": str(path.relative_to(ROOT)),
        "bytes": path.stat().st_size,
    }
    if image:
        entry["width"] = image.width
        entry["height"] = image.height
    return entry


def export_motif(motif: Motif) -> dict[str, object]:
    print_base = f"{motif.code}-{motif.slug}"

    print_image = rasterize_svg_cover(motif.illustration, PRINT_SIZE)
    preview_retina = rasterize_svg_fit(motif.illustration, MAIN_RETINA, inset=140)
    thumb_retina = resize(preview_retina, THUMB_RETINA)
    detail_retina = build_detail_crop(rasterize_svg_cover(motif.illustration, (2400, 3600)), DETAIL_RETINA)
    framed_retina = rasterize_mockup(motif.framed_mockup, MOCKUP_RETINA)
    room_retina = build_room_context(framed_retina, motif)

    print_tiff = PRINT_DIR / f"{print_base}-print-300dpi.tiff"
    print_pdf = PRINT_DIR / f"{print_base}-print-300dpi.pdf"
    vector_pdf = PRINT_DIR / f"{print_base}-vector-master.pdf"

    save_tiff(print_image, print_tiff)
    save_pdf(print_image, print_pdf)
    cairosvg.svg2pdf(url=str(motif.illustration), write_to=str(vector_pdf))

    web_outputs = {
        WEB_DIR / f"{print_base}-web-2400.webp": (preview_retina, 92),
        WEB_DIR / f"{print_base}-web-1200.webp": (resize(preview_retina, MAIN_STANDARD), 90),
        WEB_DIR / f"{print_base}-thumb-1200.webp": (thumb_retina, 88),
        WEB_DIR / f"{print_base}-thumb-600.webp": (resize(thumb_retina, THUMB_STANDARD), 85),
        WEB_DIR / f"{print_base}-detail-1600.webp": (detail_retina, 92),
        WEB_DIR / f"{print_base}-detail-800.webp": (resize(detail_retina, DETAIL_STANDARD), 90),
        WEB_DIR / f"{print_base}-mockup-framed-2800.webp": (framed_retina.convert("RGB"), 92),
        WEB_DIR / f"{print_base}-mockup-framed-1400.webp": (resize(framed_retina.convert("RGB"), MOCKUP_STANDARD), 90),
        WEB_DIR / f"{print_base}-mockup-room-2800.webp": (room_retina, 92),
        WEB_DIR / f"{print_base}-mockup-room-1400.webp": (resize(room_retina, MOCKUP_STANDARD), 90),
    }

    manifest_assets: list[dict[str, object]] = []
    for output_path, (image, quality) in web_outputs.items():
        save_webp(image, output_path, quality)
        manifest_assets.append(build_manifest_entry(output_path, image))

    og_image = build_og_image(preview_retina.copy(), motif)
    og_path = WEB_DIR / f"{print_base}-og-1200.jpg"
    save_jpeg(og_image, og_path, 90)
    manifest_assets.append(build_manifest_entry(og_path, og_image))

    return {
        "motif": motif.slug,
        "title": motif.title,
        "print": [
            build_manifest_entry(print_tiff, print_image),
            build_manifest_entry(print_pdf),
            build_manifest_entry(vector_pdf),
        ],
        "web": manifest_assets,
        "preflight": {
            "colorspace": "RGB / sRGB",
            "dpi": list(PRINT_DPI),
            "print_width": PRINT_SIZE[0],
            "print_height": PRINT_SIZE[1],
            "tiff_compression": "raw",
            "icc_profile_embedded": bool(SRGB_PROFILE),
        },
    }


def write_preflight_report(manifest: list[dict[str, object]]) -> None:
    lines = [
        "# Collection 01 Preflight Report",
        "",
        "Generated by `motifs/exports/export_collection_assets.py`.",
        "",
        "| Motif | TIFF | PDF | Vector PDF | Geometry | DPI | Colorspace | ICC |",
        "|-------|------|-----|------------|----------|-----|------------|-----|",
    ]

    for entry in manifest:
        motif = entry["motif"]
        preflight = entry["preflight"]
        print_files = entry["print"]
        tiff_path = Path(print_files[0]["path"]).name
        pdf_path = Path(print_files[1]["path"]).name
        vector_path = Path(print_files[2]["path"]).name
        lines.append(
            f"| {motif} | {tiff_path} | {pdf_path} | {vector_path} | "
            f"{preflight['print_width']}×{preflight['print_height']} px | "
            f"{preflight['dpi'][0]}×{preflight['dpi'][1]} | "
            f"{preflight['colorspace']} | "
            f"{'yes' if preflight['icc_profile_embedded'] else 'no'} |"
        )

    lines.extend(
        [
            "",
            "## Checks",
            "",
            "- Print TIFF exports are uncompressed and written at 300 DPI.",
            "- Supplier-ready PDF exports are generated at the same physical page size as the TIFF masters.",
            "- Vector master PDFs are exported directly from the SVG originals.",
            "- Web assets include standard and retina variants, plus framed and room-context mockups.",
        ]
    )

    PREFLIGHT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    ensure_dirs()
    manifest: list[dict[str, object]] = []
    for motif in MOTIFS:
        manifest.append(export_motif(motif))

    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    write_preflight_report(manifest)


if __name__ == "__main__":
    main()
