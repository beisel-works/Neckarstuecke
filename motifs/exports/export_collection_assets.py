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
    source_art: Path


MOTIFS = [
    Motif(
        code="ns-01",
        slug="minneburg",
        title="Minneburg",
        source_art=ILLUSTRATIONS_DIR / "ns-01-minneburg.png",
    ),
    Motif(
        code="ns-02",
        slug="dilsberg",
        title="Dilsberg",
        source_art=ILLUSTRATIONS_DIR / "ns-02-dilsberg.png",
    ),
    Motif(
        code="ns-03",
        slug="hirschhorn",
        title="Hirschhorn",
        source_art=ILLUSTRATIONS_DIR / "ns-03-hirschhorn.svg",
    ),
    Motif(
        code="ns-04",
        slug="heidelberg",
        title="Heidelberg",
        source_art=ILLUSTRATIONS_DIR / "ns-04-heidelberg.png",
    ),
    Motif(
        code="ns-05",
        slug="guttenberg",
        title="Guttenberg",
        source_art=ILLUSTRATIONS_DIR / "ns-05-guttenberg.png",
    ),
    Motif(
        code="ns-06",
        slug="bad-wimpfen",
        title="Bad Wimpfen",
        source_art=ILLUSTRATIONS_DIR / "ns-06-bad-wimpfen.png",
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


def rasterize_image_cover(source_image: Image.Image, target_size: tuple[int, int]) -> Image.Image:
    width, height = target_size
    scale = max(width / source_image.width, height / source_image.height)
    render_width = int(round(source_image.width * scale))
    render_height = int(round(source_image.height * scale))
    image = source_image.resize((render_width, render_height), Image.Resampling.LANCZOS)
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


def rasterize_image_fit(
    source_image: Image.Image,
    target_size: tuple[int, int],
    background: str = PAPER,
    inset: int = 0,
) -> Image.Image:
    width, height = target_size
    inner_width = width - inset * 2
    inner_height = height - inset * 2
    scale = min(inner_width / source_image.width, inner_height / source_image.height)
    render_width = int(round(source_image.width * scale))
    render_height = int(round(source_image.height * scale))
    artwork = source_image.resize((render_width, render_height), Image.Resampling.LANCZOS)
    canvas_image = Image.new("RGB", (width, height), background)
    x = (width - render_width) // 2
    y = (height - render_height) // 2
    canvas_image.paste(artwork, (x, y))
    return canvas_image


def rasterize_source_cover(source_path: Path, target_size: tuple[int, int]) -> Image.Image:
    if source_path.suffix.lower() == ".svg":
        return rasterize_svg_cover(source_path, target_size)
    return rasterize_image_cover(Image.open(source_path).convert("RGB"), target_size)


def rasterize_source_fit(
    source_path: Path,
    target_size: tuple[int, int],
    background: str = PAPER,
    inset: int = 0,
) -> Image.Image:
    if source_path.suffix.lower() == ".svg":
        return rasterize_svg_fit(source_path, target_size, background=background, inset=inset)
    return rasterize_image_fit(Image.open(source_path).convert("RGB"), target_size, background=background, inset=inset)


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


def build_framed_mockup(preview: Image.Image, motif: Motif) -> Image.Image:
    canvas_image = Image.new("RGB", MOCKUP_RETINA, LOESS)
    draw = ImageDraw.Draw(canvas_image)

    for y in range(MOCKUP_RETINA[1]):
        blend = y / MOCKUP_RETINA[1]
        r0, g0, b0 = (245, 241, 233)
        r1, g1, b1 = (233, 228, 218)
        color = (
            int(r0 + (r1 - r0) * blend),
            int(g0 + (g1 - g0) * blend),
            int(b0 + (b1 - b0) * blend),
        )
        draw.line((0, y, MOCKUP_RETINA[0], y), fill=color)

    draw.rectangle((0, 1840, MOCKUP_RETINA[0], MOCKUP_RETINA[1]), fill="#C8C1B4")
    draw.rectangle((0, 1810, MOCKUP_RETINA[0], 1840), fill="#BEB5A8")

    shadow = Image.new("RGBA", MOCKUP_RETINA, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((760, 220, 2040, 1680), radius=36, fill=(0, 0, 0, 110))
    shadow = shadow.filter(ImageFilter.GaussianBlur(52))
    canvas_image.paste(shadow, (0, 0), shadow)

    frame_rect = (840, 260, 1960, 1620)
    draw.rectangle(frame_rect, fill="#D7CCBB", outline="#B9AA93", width=8)
    draw.rectangle((912, 332, 1888, 1548), fill=PAPER)

    artwork = preview.resize((760, 1064), Image.Resampling.LANCZOS)
    canvas_image.paste(artwork, (1020, 410))

    draw.text((MOCKUP_RETINA[0] // 2 - 240, 1710), f"{motif.title.upper()} · {motif.code.upper()}", fill=CHARCOAL)
    draw.text((MOCKUP_RETINA[0] // 2 - 430, 1770), "Giclee Feinkunstdruck · 50 × 70 cm · Hahnemuehle German Etching 310 g/m² (Giclée)", fill=STONE)
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
    canvas_image.paste(mockup_scaled.convert("RGB"), (810, 260))

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

    print_image = rasterize_source_cover(motif.source_art, PRINT_SIZE)
    preview_retina = rasterize_source_fit(motif.source_art, MAIN_RETINA, inset=140)
    thumb_retina = resize(preview_retina, THUMB_RETINA)
    detail_retina = build_detail_crop(rasterize_source_cover(motif.source_art, (2400, 3600)), DETAIL_RETINA)
    framed_retina = build_framed_mockup(preview_retina, motif)
    room_retina = build_room_context(framed_retina, motif)

    print_tiff = PRINT_DIR / f"{print_base}-print-300dpi.tiff"
    print_pdf = PRINT_DIR / f"{print_base}-print-300dpi.pdf"
    source_pdf = PRINT_DIR / f"{print_base}-source-master.pdf"

    save_tiff(print_image, print_tiff)
    save_pdf(print_image, print_pdf)
    if motif.source_art.suffix.lower() == ".svg":
        cairosvg.svg2pdf(url=str(motif.source_art), write_to=str(source_pdf))
    else:
        save_pdf(Image.open(motif.source_art).convert("RGB"), source_pdf)

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
            build_manifest_entry(source_pdf),
        ],
        "web": manifest_assets,
        "preflight": {
            "colorspace": "RGB / sRGB",
            "dpi": list(PRINT_DPI),
            "print_width": PRINT_SIZE[0],
            "print_height": PRINT_SIZE[1],
            "tiff_compression": "raw",
            "icc_profile_embedded": bool(SRGB_PROFILE),
            "source_format": motif.source_art.suffix.lower().removeprefix("."),
        },
    }


def write_preflight_report(manifest: list[dict[str, object]]) -> None:
    lines = [
        "# Collection 01 Preflight Report",
        "",
        "Generated by `motifs/exports/export_collection_assets.py`.",
        "",
        "| Motif | TIFF | PDF | Source PDF | Geometry | DPI | Colorspace | ICC | Source |",
        "|-------|------|-----|------------|----------|-----|------------|-----|--------|",
    ]

    for entry in manifest:
        motif = entry["motif"]
        preflight = entry["preflight"]
        print_files = entry["print"]
        tiff_path = Path(print_files[0]["path"]).name
        pdf_path = Path(print_files[1]["path"]).name
        source_path = Path(print_files[2]["path"]).name
        lines.append(
            f"| {motif} | {tiff_path} | {pdf_path} | {source_path} | "
            f"{preflight['print_width']}×{preflight['print_height']} px | "
            f"{preflight['dpi'][0]}×{preflight['dpi'][1]} | "
            f"{preflight['colorspace']} | "
            f"{'yes' if preflight['icc_profile_embedded'] else 'no'} | "
            f"{preflight['source_format']} |"
        )

    lines.extend(
        [
            "",
            "## Checks",
            "",
            "- Print TIFF exports are uncompressed and written at 300 DPI.",
            "- Supplier-ready PDF exports are generated at the same physical page size as the TIFF masters.",
            "- Source PDFs are exported from the active motif source art.",
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
