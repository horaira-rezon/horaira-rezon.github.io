#!/usr/bin/env python3
"""Make light copies of the gallery photos used in index.html.

For every gallery image (data-type="image" data-src="assets/images/...") two
JPEG copies are written next to the originals' folder structure:

  assets/images/thumbs/...  small (max 640 px) - shown in the gallery tiles
  assets/images/large/...   medium (max 2000 px) - shown in the image viewer

The originals are never changed. Copies that are already newer than their
original are skipped, so it is safe to run this again after adding photos:

  python3 tools/make-images.py

Needs Pillow (pip install Pillow).
"""
import os
import re
import sys

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIZES = {
    'thumbs': (640, 72),
    'large': (2000, 82),
}


def variant_path(original, kind):
    # Mirrors imageVariant() in assets/js/main.js.
    rel = original[len('assets/images/'):]
    return os.path.join('assets', 'images', kind, os.path.splitext(rel)[0] + '.jpg')


def make(original, kind, max_side, quality):
    target = variant_path(original, kind)
    src = os.path.join(ROOT, original)
    dst = os.path.join(ROOT, target)
    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
        return None
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode in ('RGBA', 'LA', 'P'):
            im = im.convert('RGBA')
            flat = Image.new('RGB', im.size, (0, 0, 0))
            flat.paste(im, mask=im.getchannel('A'))
            im = flat
        else:
            im = im.convert('RGB')
        im.thumbnail((max_side, max_side), Image.LANCZOS)
        im.save(dst, 'JPEG', quality=quality, optimize=True, progressive=True)
    return target


def main():
    html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    originals = sorted(set(re.findall(r'data-type="image"\s+data-src="(assets/images/[^"]+)"', html)))
    if not originals:
        print('No gallery images found in index.html')
        return 1
    made = 0
    for original in originals:
        if not os.path.exists(os.path.join(ROOT, original)):
            print('missing original, skipped:', original)
            continue
        for kind, (max_side, quality) in SIZES.items():
            target = make(original, kind, max_side, quality)
            if target:
                made += 1
                print(f'{os.path.getsize(os.path.join(ROOT, target)) // 1024:6d} KB  {target}')
    print(f'{len(originals)} gallery images checked, {made} copies written')
    return 0


if __name__ == '__main__':
    sys.exit(main())
