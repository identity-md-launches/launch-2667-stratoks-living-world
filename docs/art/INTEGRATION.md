# Living Stratok artwork

The previously rejected rabbit artwork, icons, share images, compiled archive viewer and screenshots have been removed. Historical numerical JSON/TAP reports and owner engine/recovery source remain. The active source is `web/src/expanse/`; its final runtime manifest is `web/public/art/manifest.json`, identical to `web/src/expanse/atlas.json`.

## Delivered assets

| File in `web/public/art/` and `dist/art/` | Geometry | Purpose |
| --- | --- | --- |
| `living-characters.webp` | 1920×1920, 6×6 cells, 320 px | 36 transparent registered poses |
| `living-world.webp` | 2560×1280, 8×4 cells, 320 px | 32 transparent biome/resource/shelter sprites |
| `model.webp` | 1536×1024 | Supplied species model sheet, quality-86 derivative |
| `manifest.json` | Rectangles, foot pivots, bounds, hashes | Reusable atlas contract |

The original species is a compact, upright, golden-yellow scalloped body with short limbs, expressive eyes and a leaf crown. There are no long ears, animal muzzle or rabbit tail. The contributor inspected the supplied model/atlases and rendered result. This is contributor review; independent owner art approval remains pending.

The source manifests in `docs/living/manifest.json` retain the supplied PNG SHA-256s: model `88ac8df…e6f0e`, characters `4c37695…cf130`, world `dbeeabaa…ff55c`. Registered PNG inputs were encoded as WebP at quality 88 with alpha quality 100, retaining full cell dimensions and `[160,280]` foot pivots. Geometry and transparent gutters are checked by `tools/living/validate-integration.mjs`. Source registration removed matte alpha ≤16 and detached character dust below 24 pixels; its accepted editable generated sources remain in `docs/living/source/`. WebP compression is a documented derivative, not a claim of lossless colour identity.

Runtime builds need only the committed WebP files. Re-extraction uses `tools/living/pack.py` on the retained generated sources; `tools/living/integrate.mjs` packages the supplied registered PNGs (or regenerates missing character/world PNGs). It uses `sharp`, installed outside this repository, and never installs or archives dependencies in the submission. The model WebP remains bundled when the original task-only PNG is unavailable.

```sh
npm install --prefix /tmp/stratoks-art sharp@0.35.5
STRATOKS_SHARP=/tmp/stratoks-art/node_modules/sharp node tools/living/integrate.mjs
STRATOKS_SHARP=/tmp/stratoks-art/node_modules/sharp node tools/living/validate-integration.mjs
```

All characters use the same cell-local foot pivot. The canvas scales a full cell to 3.2 tile half-widths; visible body width is roughly half that. Trees use 4.4 half-widths, homes 5.6, resource nodes 1.8–2.9. The map uses the API's exact per-tile biome field, with a representative-chunk fallback for older recordings. Vegetation maps to real nodes; piles and supplies map to real inventories/stores. Their footprints scale with actual item counts and disappear at zero; painted units remain qualitative. Transparent art is depth-sorted by ground contact. The renderer never changes the projection to fit the painting.

The new SVG wordmark, favicon, share image and archived vector fallback follow the same leaf-crowned species. HUD portraits crop the same character atlas. All assets load locally with relative URLs. There are no emoji stand-ins, remote image URLs, wallet icons or animal substitutes in the static export.

## State-to-animation mapping

See [the authoritative visual contract](../living/FRONTEND.md#authoritative-visual-contract). Fishing uses only actual `fish` phases with a held line. The fish-on-hook catch pose is intentionally unused because the API has no catch-result phase. Loads require actual items. Construction requires the actual target site and materials. Rest and sleep are separate engine states. Backward travel keeps the real rear pose; southwest work/walk uses mirrored southeast art. Original PNG work sequences are reusable but are not a fabricated eight-direction rig.

Water ripples, small foliage sway and procedural fire motion are restrained. Fire requires an engine fire record. Animation and interpolation stop under reduced motion or the visual pause control, while the simulation remains independent. Recorded poses are frozen. Missing consecutive movement frames snap rather than creating a path.

Actual terrain neighbours produce continuous shorelines. The four supplied shore block sprites remain reusable atlas art; they are not stamped into the map, since their painted water/rocks could misrepresent traversable tiles or resource locations. Ground texture is original procedural brush work clipped to engine diamonds, with no false resource nodes or bridges. Worn ground follows clear approaches to reported shelters and up to 256 adjacent travel segments observed in the viewer, excludes water/cliffs/blocking nodes/corner cuts, and has no mechanical effect.

## License and limits

Original generated art and extraction: STRATOKS contributors, 2026, MIT; the full notice is `docs/living/LICENSE.txt` and `web/public/licenses/living-art.txt`. New integration/procedural/SVG work follows the repository's client/art MIT notice. Local Manrope retains its OFL notice. No third-party art was intentionally added. A license notice does not independently certify copyright eligibility or uniqueness.

Generated shapes vary subtly between frames. There is no rig, layered painting, eight-direction work cycle, growth-specific body art, exact-count inventory drawing or supplied unlit-house variant. Warm windows are baked illustration in completed, standing homes; actual insulation follows shelter integrity, and windows are not a fire record. These limitations are disclosed rather than filled with invented activity.
