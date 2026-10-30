#!/usr/bin/env python3
"""Derive editable cell metadata from the recorded PNG validation report.

This writes JSON/JS only and never changes image bytes.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / 'docs/agency'

terrain = []
for biome in ('grass-slate', 'desert-sandstone', 'snow-slate'):
    terrain.append([f'{biome} cliff {variant}' for variant in
                    ('straight A', 'straight B', 'convex corner', 'concave corner', 'end A', 'end B')])
terrain += [
    ['forest transition edge', 'forest transition corner', 'rocky bank A', 'rocky bank B',
     'rocky bank convex', 'rocky bank concave'],
    ['sand-grass transition edge', 'sand-grass transition corner', 'snow-grass transition edge',
     'snow-grass transition corner', 'sand-coast transition edge', 'sand-coast transition corner'],
    ['tilled garden empty', 'garden seedlings', 'garden ripe grain', 'hearth unlit empty pot',
     'hearth lit stew pot', 'closed storage chest and basket']]

activities = [
    ['tend reach soil', 'tend place seed', 'tend pat soil', 'tend hold water vessel',
     'tend water seedling', 'tend lower vessel'],
    ['harvest approach grain', 'harvest grasp grain', 'harvest gather grain',
     'harvest lift grain', 'harvest fill basket', 'harvest hold basket'],
    ['cook carry fuel', 'cook place fuel', 'cook add berries', 'cook hold spoon',
     'cook stir', 'cook inspect spoon'],
    ['cooperative carry grasp', 'cooperative carry lift', 'cooperative carry step A',
     'cooperative carry step B', 'cooperative carry lower', 'cooperative carry set down'],
    ['cooperative repair position plank', 'cooperative repair raise mallet',
     'cooperative repair strike', 'cooperative repair adjust', 'cooperative repair low joint',
     'cooperative repair inspect'],
    ['repair hold plank', 'repair position plank', 'repair raise mallet', 'repair strike peg',
     'repair low joint', 'repair inspect joint']]

gates = [
    'Actual tending target, seeds or water matching the selected pose.',
    'Actual harvestable crop and observed transfer; basket state must match inventory.',
    'Actual food, fuel, vessel and heat matching visible props; no painted fire without active fire.',
    'Two actual participating residents carrying one shared timber at the depicted separation.',
    'Two actual participating residents repairing one target; tools/materials must exist.',
    'Actual repair phase, target, tool and available repair materials.']

report = json.loads((DOCS / 'validation.json').read_text())
manifest = {'schema': 'stratoks-supplementary-atlas-v1', 'version': 1,
            'scope': 'Artwork only; no runtime integration or simulation changes.',
            'coordinates': 'Top-left pixel origin; zero-based row/column; half-open rectangles.',
            'anchorConvention': 'Measured bottom-center of alpha>8 bounds, rounded down. '
                                'Approximate ground-registration pivot, not a collision point. '
                                'Composite frames use the shared group midpoint.',
            'lighting': 'Warm upper-left key light; softly painted isometric miniature style.',
            'atlases': {}}
for name, names, measured in zip(('terrain', 'activities'), (terrain, activities), report['atlases']):
    frames = []
    cw, ch = measured['cellDimensions']
    for cell in measured['cells']:
        row, col = cell['row'], cell['column']
        x0, y0, x1, y1 = cell['alphaBounds']
        frame = {'id': f'{name}-{row+1:02}-{col+1:02}', 'name': names[row][col],
                 'row': row, 'column': col, 'rect': [col*cw, row*ch, cw, ch],
                 'anchor': [(x0+x1)//2, y1-1], 'alphaBounds': cell['alphaBounds'],
                 'clearGutter': cell['exactAlphaGutter'],
                 'participants': 2 if name == 'activities' and row in (3, 4) else
                                 1 if name == 'activities' else 0,
                 'runtimeGate': gates[row] if name == 'activities' else
                                'Authoritative biome, elevation, adjacency and actual prop state.'}
        frames.append(frame)
    limits = [
        'Flattened raster; no layered source, depth map or skeletal rig.',
        'Single camera direction; frames are state illustrations, not a verified seamless animation rig.',
        'Anchors are derived from measured visible bounds and require integration review.'
    ]
    if name == 'terrain':
        limits += ['Cliff join geometry is illustrated, not a certified pixel-seamless autotile system.',
                   'Unmet: stray small fragments remain inside some cell margins.',
                   'Painted water and transitions require clipping to authoritative terrain.',
                   'No terrain collision, projection or picking implementation is supplied.']
    else:
        limits += ['Cooperative cells are composite two-resident sprites at fixed relative spacing.',
                   'Unmet: visible colored matte fringe remains around some silhouettes.',
                   'Body/prop scale may vary between single-resident and cooperative frames.',
                   'No engine bindings, timing or action recipes are supplied.']
    if not measured['cleanGutterCheck']:
        limits += ['Unmet: at least one cell has fewer than 8 fully transparent gutter pixels.']
    manifest['atlases'][name] = {
        'path': measured['path'], 'format': measured['format'],
        'width': measured['dimensions'][0], 'height': measured['dimensions'][1],
        'sha256': measured['sha256'], 'grid': [6,6], 'cellSize': [cw,ch],
        'minimumClearGutter': measured['exactAlphaGutter'],
        'limitations': limits, 'frames': frames}

encoded = json.dumps(manifest, indent=2) + '\n'
(DOCS / 'manifest.json').write_text(encoded)
(DOCS / 'manifest.js').write_text('window.STRATOKS_AGENCY = ' + encoded.rstrip() + ';\n')
print('Wrote docs/agency/manifest.json and manifest.js (72 cell mappings).')
