#!/usr/bin/env python3
"""Split generated Astrologer contact sheets into transparent tactical frames."""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets/iso-arena/units/generated/astrologer/source"
UNIT_DIR = ROOT / "assets/iso-arena/units/generated/astrologer/animated"
VFX_DIR = ROOT / "assets/iso-arena/vfx/astrologer/frames"
FRAME_SIZE = 314

SHEETS = {
    "idle": ("astrologer-idle-sheet.png", UNIT_DIR, "astrologer-idle"),
    "walk": ("astrologer-walk-sheet.png", UNIT_DIR, "astrologer-walk"),
    "guard": ("astrologer-guard-sheet.png", UNIT_DIR, "astrologer-guard"),
    "drain": ("astrologer-drain-sheet.png", UNIT_DIR, "astrologer-drain"),
    "predict": ("astrologer-predict-sheet.png", UNIT_DIR, "astrologer-predict"),
    "prediction-ring": ("astrologer-prediction-ring-sheet.png", VFX_DIR, "astrologer-prediction-ring"),
    "prediction-meteor": ("astrologer-prediction-meteor-sheet.png", VFX_DIR, "astrologer-prediction-meteor"),
}


def remove_magenta(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            distance = ((red - 255) ** 2 + green**2 + (blue - 255) ** 2) ** 0.5
            if distance <= 18:
                pixels[x, y] = (red, green, blue, 0)
            elif distance < 120:
                pixels[x, y] = (red, green, blue, round(alpha * (distance - 18) / 102))
    return image


def split_sheet(source_name: str, output_dir: Path, prefix: str) -> None:
    source = Image.open(SOURCE_DIR / source_name).convert("RGBA")
    output_dir.mkdir(parents=True, exist_ok=True)
    width, height = source.size
    for index in range(4):
        left = round(width * index / 4)
        right = round(width * (index + 1) / 4)
        frame = remove_magenta(source.crop((left, 0, right, height)))
        canvas = Image.new("RGBA", (height, height), (0, 0, 0, 0))
        canvas.alpha_composite(frame, ((height - frame.width) // 2, 0))
        canvas.resize((FRAME_SIZE, FRAME_SIZE), Image.Resampling.LANCZOS).save(
            output_dir / f"{prefix}-{index + 1}.png"
        )


for _, (source_name, output_dir, prefix) in SHEETS.items():
    split_sheet(source_name, output_dir, prefix)
