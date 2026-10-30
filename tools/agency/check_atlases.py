#!/usr/bin/env python3
"""Check the delivered atlases using only Python's standard library.

No image dependencies, network, or runtime world state are required.
Supports the non-interlaced 8-bit RGB/RGBA PNGs used by this delivery.
"""
import argparse
import hashlib
import json
from pathlib import Path
import struct
import zlib


def read_png(path):
    data = path.read_bytes()
    assert data[:8] == b'\x89PNG\r\n\x1a\n', f'{path}: PNG signature'
    offset, compressed = 8, bytearray()
    while offset < len(data):
        length = struct.unpack_from('>I', data, offset)[0]
        kind = data[offset + 4:offset + 8]
        payload = data[offset + 8:offset + 8 + length]
        crc = struct.unpack_from('>I', data, offset + 8 + length)[0]
        assert zlib.crc32(kind + payload) & 0xffffffff == crc, 'PNG CRC'
        offset += length + 12
        if kind == b'IHDR':
            width, height, depth, color, comp, filt, interlace = struct.unpack('>IIBBBBB', payload)
            assert depth == 8 and color in (2, 6) and not interlace
            channels = 4 if color == 6 else 3
        elif kind == b'IDAT':
            compressed.extend(payload)
        elif kind == b'IEND':
            break
    raw = zlib.decompress(compressed)
    stride = width * channels
    assert len(raw) == height * (stride + 1)
    pixels, previous, pos = bytearray(), bytearray(stride), 0
    for _ in range(height):
        mode = raw[pos]
        row = bytearray(raw[pos + 1:pos + 1 + stride])
        pos += stride + 1
        assert mode in range(5)
        for i in range(stride):
            a = row[i - channels] if i >= channels else 0
            b = previous[i]
            c = previous[i - channels] if i >= channels else 0
            if mode == 1:
                predict = a
            elif mode == 2:
                predict = b
            elif mode == 3:
                predict = (a + b) // 2
            elif mode == 4:
                p = a + b - c
                distances = (abs(p-a), abs(p-b), abs(p-c))
                predict = (a, b, c)[distances.index(min(distances))]
            else:
                predict = 0
            row[i] = (row[i] + predict) & 255
        pixels.extend(row)
        previous = row
    return width, height, channels, pixels, data


def inspect(path):
    width, height, channels, pixels, data = read_png(path)
    assert channels == 4, f'{path}: expected real alpha channel'
    assert width % 6 == height % 6 == 0, 'expected an evenly divisible 6x6 grid'
    cw, ch = width // 6, height // 6
    alpha = pixels[3::4]
    assert 0 in alpha and 255 in alpha, 'transparent and solid pixels required'
    cells = []
    for r in range(6):
        for c in range(6):
            points = [(x, y) for y in range(ch) for x in range(cw)
                      if alpha[(r*ch+y)*width+c*cw+x] > 8]
            assert points, f'empty cell {r},{c}'
            xs, ys = zip(*points)
            bounds = [min(xs), min(ys), max(xs)+1, max(ys)+1]
            gutter = min(bounds[0], bounds[1], cw-bounds[2], ch-bounds[3])
            nonzero = [(x, y) for y in range(ch) for x in range(cw)
                       if alpha[(r*ch+y)*width+c*cw+x] > 0]
            nx, ny = zip(*nonzero)
            exact_gutter = min(min(nx), min(ny), cw-1-max(nx), ch-1-max(ny))
            cells.append({'row': r, 'column': c, 'alphaBounds': bounds,
                          'minimumGutter': gutter, 'exactAlphaGutter': exact_gutter})
    return {'path': str(path), 'format': 'PNG RGBA8', 'dimensions': [width, height],
            'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
            'grid': [6, 6], 'cellDimensions': [cw, ch],
            'transparentPixelFraction': round(alpha.count(0)/len(alpha), 5),
            'minimumGutter': min(c['minimumGutter'] for c in cells),
            'exactAlphaGutter': min(c['exactAlphaGutter'] for c in cells),
            'cleanGutterCheck': all(c['exactAlphaGutter'] >= 8 for c in cells),
            'cells': cells}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    report = {'checks': 'PNG bytes, CRCs, dimensions, alpha, occupied cells, measured gutters',
              'visualApproval': 'not certified by these checks',
              'atlases': [inspect(Path(f'artifacts/agency/{name}.png'))
                          for name in ('terrain', 'activities')]}
    result = json.dumps(report, indent=2) + '\n'
    if args.output:
        args.output.write_text(result)
    print(result)
    raise SystemExit(0 if all(a['cleanGutterCheck'] for a in report['atlases']) else 1)
