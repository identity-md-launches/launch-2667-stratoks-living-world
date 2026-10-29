# Living-world observer integration

The active observer is `web/src/expanse/`. Its production export is `dist/`. It uses the preceding schema-4 engine, the supplied leaf-crowned Stratok artwork and the original camera/projection/inspector UI. It has no wallet/payment UI, shared write API, paid inference, deployment or automatic world tour.

## Real isolated demo

The default source is a **separate seed-2 demo**, resumed at tick 12,000 and continued by the exact `server/src/expanse/engine.js` inside a module worker. The checkpoint is an unedited ordinary run from 24 founders. Only its isolated world ID is assigned. No resident, tool, material, action or shelter is placed for the frontend. The old owner capture is still explicitly **Recorded preview**; a live connection is **Live world** only after a successful owner API read.

The checkpoint, provenance and SHA-256 are in `web/public/demo/`; both are copied into the export. The client verifies the compressed checkpoint in secure contexts, decompresses with `DecompressionStream`, and restores schema 4 without a Node Buffer shim. The worker steps at most once per scheduled callback, at 250 ms intervals, slowing further if a tick consumes more than one fifth of that budget. There is no burst catch-up. Closing/reopening the demo discards its private progress and resumes the shipped checkpoint. This is **not** a migration or reset of the owner world. The complete checkpoint retains brains, weights, relationships, families, memories, discoveries, modified chunks, inventories, shelters, stores and history.

Reproduce it locally (writes a separate directory):

```sh
node tools/living/demo-checkpoint.mjs 2 12000 test/scratch/reproduced
```

The task's copy reproduced the shipped gzip byte for byte. Engine timing is documented separately from renderer timing. A demo outcome is not a promise of population stability.

## Authoritative visual contract

`view.living:1` names the accepted schema-4 observer extension. `residents[].state`, `phase`, `progress`, `carrying`, `tools` and `target` drive presentation. The primitive `action` alone is a plan intention, so legacy frames use neutral poses. In particular:

| Visual | Required evidence |
| --- | --- |
| Walking interpolation | Adjacent confirmed endpoints in consecutive engine ticks. Omitted paths snap; no movement across a guessed path. |
| Load | A positive matching `carrying` item, or selected resident inventory. Other loads use a neutral pouch, never fake wood or fish. |
| Casting / waiting / reeling | `state:fish`, a held `fish_line`, and the corresponding `cast`, `wait` or `reel` phase. |
| Berry gathering | Gathering state and an already carried berry; supplied poses include berries, so they are withheld before success. |
| Construction | `construct/construct`, the actual site target, delivered materials and a held supported work tool for the supplied tool pose. Repair needs `repair/work` and held material. |
| Sleeping | `state:sleep`; daytime rest uses the seated rest sprite. |
| Finished home | A reported finished shelter. Integrity zero renders a faded foundation; sites use actual stage/material/labour fields. |
| Resource / stock area | A reported resource node, pile or nonempty store. Empty loose resources disappear. Berry bushes deplete. |
| Fire | An existing `view.fires` entry. A restrained procedural flame is original art, not an invented engine event. |

The catch-with-fish pose is delivered but deliberately unused: no API catch-result phase exists. Standing supply footprints grow/shrink with actual stock units and disappear at zero. The painted logs/baskets illustrate item categories, not an exact physical unit count; inspect the tile or resident for quantities. No speech, thoughts or inferred social emotion is drawn. Observable social outcomes remain in World records.

The additive API fields in this integration are `view.biomes` (one actual biome per tile), `view.climate` (actual ambient temperature/rain/daylight), `places` (actual structure navigation records), and activity `capacity`. They do not enter agent perception or mutate saved state. No new persistent field or schema migration is introduced by the frontend. The existing schema-3→4 migration is retained and tested on copied worlds.

## World and interaction

The original 280×280 chunked world and 56×56 settlement coordinate system remain intact. The renderer draws actual received tiles and resource records, depth-sorts objects, and shares `projection.ts` with pointer picking, touch pan/pinch, keyboard pan/zoom and the minimap. Connected shorelines follow real tile neighbours, with textured earth, snow, dune, rock and water treatments; no decorative bridge or traversable cliff is invented.

The atlas shows **materialized** chunks; observer requests may materialize pristine terrain. This is not a claim that agents discovered those chunks. Agents' knowledge remains individual; the Perception panel and its last-decision radius show the evidence. The Settlements panel derives all locations and counts from the current world, groups nearby structures for navigation, and only moves the observer camera. There are no hardcoded village locations or activity scenes in the product.

Current live access depends on HTTPS and owner CORS configuration. The static export cannot allow its own origin on another server. Failed live reads retain a clearly marked last received frame or the recorded capture, with a reconnect action. No live VPS was contacted or changed for this integration.

## Limits

The supplied work and walk poses face southeast. Southwest work/walk and leftward fishing are mirrored; backward travel uses the supplied rear view rather than invented rear animation frames. Generated body shape varies slightly between poses. No growth-specific body art, unlit-house atlas, eight-direction work cycles, catch-result animation or material-specific carrying art for every item was supplied. The model sheet is a high-quality WebP derivative of the supplied original. These limits are visible and do not change the engine's rules.

The bounded terrain cache trades some high-zoom sharpness for predictable memory. Population has no artificial cull, so total engine memory/CPU can still grow with the population; per-resident learning histories and the per-tick decision budget remain bounded. ARM VPS performance and native phone/screen-reader behaviour require owner/device validation; local x64/headless-browser timings are not those measurements.
