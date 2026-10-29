# STRATOKS living-world art

Original generated art for the bounded **art assignment**, replacing the rejected animal design. The new species has a compact golden-yellow scalloped body, short limbs, large eyes and a small botanical green crown sprout. There are no long ears, animal muzzles or tails. No lettering, speech bubbles or emoji appear in the images.

## Delivered images

The three PNGs are separate named outputs, intentionally untracked. Keep their relative paths when assembling the review bundle.

| Output | Actual dimensions | Format | Layout |
| --- | --- | --- | --- |
| `artifacts/living/model.png` | 1536 × 1024 | PNG, 8-bit RGB, opaque ivory | Five turnaround studies, five expressions, six action studies |
| `artifacts/living/characters.png` | 1920 × 1920 | PNG, 8-bit RGBA, transparent | 6 × 6 cells; 36 sprites |
| `artifacts/living/world.png` | 2560 × 1280 | PNG, 8-bit RGBA, transparent | 8 × 4 cells; 32 modular sprites |

Both atlases use **320 × 320 cells** and the same **(160, 280) cell-local ground anchor**, origin top-left. Draw a cell at `projectedGround - anchor`; scale both cell and anchor together. The smallest checked per-cell transparent margin is 32 pixels for characters and 40 pixels for environment props. Artwork is copied at native pixel scale, without interpolation or enlargement. The character's upright height is roughly 170–190 pixels; shelter footprint widths roughly 170–210 pixels. The homes are intentionally stylized compact game props, not architectural scale models. Sort props and residents by their actual engine ground positions, not the top of their image rectangles. Pixels do not define collision or picking geometry.

`manifest.json` supplies exact rectangles, anchors, alpha bounds, source extraction regions, byte counts and SHA-256 hashes. The model sheet is not a runtime atlas.

## Atlas order

Character rows, left to right:

1. Front, southeast, east/profile, northeast, back, southwest neutral views.
2. Six southeast walking poses.
3. Fishing ready, two cast poses, wait, reel, successful catch.
4. Gather reach, crouch, berry lift; carrying berry basket; two wood carrying poses.
5. Construction ready, raise, strike, raise, strike, lower, with a mallet.
6. Rest settle, drowsy, two sleeping poses, wake, stretch.

World rows: temperate forest/river, desert/oasis, cold highlands, coast/islands. Each row has vegetation, resource/material props, a shore module, and foundation → partial frame/walls → completed biome-specific shelter in the final three columns. Forest has a full and depleted berry bush. Desert has palm, cactus, sandstone and bundled reeds/stone; cold has spruce, frosted berries, granite and covered firewood; coast has windswept pine, reeds, rock and fishing equipment. These are separate reusable props, not one flattened world scene. Shared light comes from the upper left.

## Intended state bindings

These describe integration requirements, **not implemented mechanics**. Select frames only from confirmed engine state. A selected plan is not evidence an action started.

- Walk only along confirmed traversable movement; interpolate only between confirmed positions. Stop on interruption. No art grants a water crossing.
- Cast/reel only during actual fishing with obtainable rod, reachable fish-bearing water, energy and elapsed action time. `fish.wait` is a hold pose; `fish.catch` requires a confirmed successful catch and appropriate inventory result. Do not loop catches to imply production.
- Gather poses require an actual gathering action at a reachable observed resource. The visible berry in `gather.lift` requires a confirmed berry yield. Use reach/crouch until then.
- Berries and logs appear only when present in the carried inventory. Carrying frames are never empty-hand idle substitutes. Quantity variants are not supplied; these are qualitative load indicators, not exact inventory counts.
- Mallet poses require actual building/repair and a supported tool. Shelter foundation/frame/completed variants must follow materials and progress. Lit windows are baked into completed shelters; use only when lighting is state-supported, otherwise a separate unlit variant is needed.
- Sleep only during actual rest. Drowsy and wake poses are transitions, not claims about thoughts. No invented encounters, speech or feelings should be inferred from expression studies.
- Resource piles represent existing stock. Remove the sprite when empty; intermediate pile quantities require additional assets. Show depleted forest shrub only when depleted.

## Provenance and reproducibility

Generated on 2026-10-29 with the installed authenticated OpenAI image tools, without external reference art, stock textures or existing character references. `mcp__image__generate` produced the model and initial character/environment sheets. The model prompt specified five turnaround views, expression studies and six action studies on ivory. The character prompt specified the earless scalloped golden species, six-by-six ordered actions and transparency. The environment prompt specified eight-by-four isolated biome props and construction stages. All prompts explicitly excluded rabbits, animal substitutes, text and speech bubbles.

`image_gen.imagegen` then refined the two atlases using their generated first passes as references, requesting preservation of all cells, removal of colored matte residue and more transparent padding. Generation was nondeterministic and no seed or exact underlying model version was exposed. The revised raster sources are preserved in `source/`; no rig, layered painting, vector original or authored 3D model exists.

`python3 tools/living/pack.py` reproducibly registers the revised raster sources into the final atlases. It uses only Python's standard library, integer translation and alpha extraction. It drops alpha ≤16 matte residue and detached character components smaller than 24 pixels; it does not paint replacement pixels, resize, mirror or synthesize frames. This removes most colored low-alpha edge noise. The model is the unchanged generated original. `python3 tools/living/check.py` validates the delivered bytes and atlas geometry without network or installed packages. The named model output is required to rerun its checks; it is distributed separately.

Original generated artwork and accompanying new scripts/docs are offered under the MIT terms in `LICENSE.txt`. Provenance does not certify copyright eligibility or global uniqueness.

## Review and unfinished visual work

Contributor inspection used the image viewing tool on all three outputs, then again on the packed atlases. It found the new silhouette visibly distinct from the rejected rabbit design, all four biome families present, and no text or bubbles. Automated results are in `validation.json`; they cannot certify visual quality or mechanics. `reproducibility.json` records a second packing run that reproduced both PNGs and the manifest byte-for-byte.

**Chosen independent review step:** before runtime adoption, a separate reviewer must inspect the actual PNGs at 100% and at intended game scale, reject any rabbit-like silhouette, and scrub the action sequences in cell order. Confirm tools, loads and sleep occur only in the corresponding states after integration. No independent approval is claimed here.

Known limitations requiring further art/integration work:

- Action animation is chiefly southeast-facing. Full action coverage in every travel direction is absent; do not mirror asymmetric fishing tools and claim it is authored coverage.
- These are discrete generated poses with some contour, foot and body-scale drift. Registration aligns anchors but does not make a polished skeletal animation. Sleep breathing differences are slight; the six walk poses need temporal cleanup for a perfectly smooth loop.
- Fine fishing lines are thin, partly discontinuous, and the reel pose retains a small detached line segment. They need hand cleanup at intended display size. A strict profile model study is slightly three-quarter; the botanical crown is stylized larger than a tiny bud.
- Shores are illustrative isolated diamond modules, **not a verified seamless shoreline/autotile set**. Only one shore orientation per biome is provided. Ground fills, corners, full islands, navigable coast layouts and additional relief pieces remain integration/asset work.
- No water/foliage/fire animation strips, unlit completed homes, damaged shelter states, fine-grained stockpile quantities, eating sequence or complete depleted-resource family are supplied.
- Shelter footprints/perspective are approximately consistent through stages but not pixel-identical; transition review is needed. Cold finished refuge includes timber and stone rather than exclusively stone.
- No engine, saved world, website, preview publication, deployment, simulation tests, gameplay screenshots or recordings were changed or claimed by this art-only assignment. Existing runtime assets remain separate; these new files need deliberate state-bound integration.
