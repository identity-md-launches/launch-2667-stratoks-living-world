# STRATOKS supplementary art

This delivery is limited to reusable terrain/prop and activity atlases. It does not change the engine, live world, resident data, dependencies, renderer, or deployment. The eight engine/UI defects and the larger society mechanisms in the parent brief are outside this art assignment and are not represented as fixed.

## Output contract

| Output | Format | Dimensions | Grid |
| --- | --- | --- | --- |
| `artifacts/agency/terrain.png` | transparent PNG, RGBA8 | 1536 × 1536 | 6 × 6, 256 px cells |
| `artifacts/agency/activities.png` | transparent PNG, RGBA8 | 1254 × 1254 | 6 × 6, 209 px cells |

The two named PNGs are separate deliverables, intentionally untracked for the upload daemon. Documentation, cell manifest, and checks live in this repository. Keep the PNGs at these paths when using the review page. No other artifact path is needed.

**Unresolved visual requirements:** activity matte fringe and zero-width gutters, stray terrain fragments, scale/prop variation, and unverified seamless joins. Both cleanup image-tool calls returned timeouts after 300 seconds, but wrote revised files afterward. These saved revisions were inspected and measured; the timeout does not certify their completion. These are review assets, not a finished production pack. See [the resolution table](VISUAL-REVIEW.md).

See `manifest.json` for cell names, rectangles, placement anchors, visual gates, limitations and source hashes. `manifest.js` contains the same data for the offline review page. Anchor coordinates are cell-local pixels; positions and collisions must still come from the engine. Anchors describe compositing placement, not traversability or a collision mesh.

## Review and checks

Open `docs/agency/review.html` in a browser, or serve the repository with `python3 -m http.server 8080` and visit `/docs/agency/review.html`. Select each sheet and inspect its cells against all three backgrounds. Toggle anchor markers. The page works without external libraries, fonts, network requests or an engine process.

Run from the repository root:

```sh
python3 tools/agency/check_atlases.py --output docs/agency/validation.json
```

The standard-library checker validates PNG signatures, chunk CRCs, decompression, real alpha, dimensions, nonempty cells, and measured alpha bounds/gutters. Visible bounds use alpha >8; exact transparent gutters count every nonzero alpha pixel. It returns a failure when any cell has less than 8 px of fully transparent gutter. These checks do not certify art quality or physical connectivity. The recorded report is evidence from this machine, not an independent acceptance review.

After replacing artwork, rebuild the text manifests with `python3 tools/agency/make_manifest.py`. This only reads the validation report and writes JSON/JavaScript; it does not edit or resample images.

Before runtime use, an owner/art reviewer should inspect biome adjacency, seams, phone-size readability, task-prop consistency and the golden leaf-crowned species. Structural acceptance of paths and PNG bytes is separate from that visual approval.

## Integration rules

Terrain is illustration driven by authoritative biome, elevation and adjacency. Do not infer a bridge, slope, crossing, water availability, vegetation resource, collision surface or passable path from painted pixels. Rocky banks and transitions require clipping to real terrain. Never scatter the sheet into the world as a static scene.

Activity frames are visual options, not an action sequence the planner must follow. Use a pose only when its held object, target, fuel, materials and action phase exist. Harvest must not create free crops, a full basket must not assert exact inventory, and a painted fire must not imply heat without an actual active fire. Cooperative cells contain two residents and must replace both corresponding sprites, rather than adding duplicate residents. Match both participants' local action state. The `repair` engine activity must be mapped explicitly; do not test only for a nonexistent `work` phase.

For composite poses, use the documented shared-object midpoint anchor and treat both actors as one rendering group for ordering. The atlas is not a skeletal rig and does not support arbitrary participant separation. Do not mirror upper-left lighting to manufacture missing directions without visual review. Frame choices should follow state evidence; do not cycle the whole row regardless of inventory or progress.

## Editing and provenance

The authenticated installed image-generation tool produced the PNGs for this assignment. Reference artwork was inspected locally: model SHA-256 `88ac8dfbf2b51b3f54323673db795c73985582f3b4892eee6b7eb97fe5ae6f0e`; characters `4c37695a5a4fc2f2fde45b82d867068965adb4f506c40ac96d8d470717dcf130`; world `dbeeabaaee768a89ce868b1abba996a9d39e53ea3f54c6c18e7565094efff55c`. The tool was directed to those repository paths as references; internal reference ingestion is not independently verifiable. No third-party asset pack was introduced.

`generation-notes.md` records the art direction and refinement requests. These are flattened raster originals, not layered paintings, 3D meshes or editable rigs. Import each PNG into an RGBA editor without a matte, use its manifest cell grid, and edit cells on separate layers. Preserve the manifest anchor while repainting. To change a cell's footprint, update its bounds and anchor in both manifests and rerun the checker. The manifest and review page are editable text. Generative replay is not byte deterministic; the PNG hashes identify the delivered result.

The original reference images are task inputs and are not silently repackaged as new work. No claim is made about consciousness, learned agency, a working simulation demo, deployment or resolution of parent-task defects.
