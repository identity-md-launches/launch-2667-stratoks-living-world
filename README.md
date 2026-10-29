# STRATOKS · A world taking root

A full-screen isometric observer for the persistent 280×280 Expanse. Golden, leaf-crowned Stratoks explore, gather, fish, carry finite inventories, use shared stores, construct/repair biome-specific shelters, rest, form families, age and die in the existing learning engine. The original settlement coordinate system, owner world identity and saved-data migration tools are retained. This contribution integrates the preceding living-world art and schema-4 engine; it does not deploy or reset the live VPS.

The review **opens a real isolated browser demo**, naturally simulated from 24 seed-2 founders to tick 12,000 and then continued in a worker with the production engine. Its 156 residents, families, memories, learned weights, supplies, 68 completed shelters and 26 sites come from that history. No job, tool, resource or settlement is injected for a scene. The owner capture remains available as **Recorded preview**. **Live world** is shown only after a successful owner API read. Cross-origin access needs the owner's allowed-origin configuration.

## Install, preview and rebuild

Use Node 22.12+ (this task used Node 22.23.3). The existing frontend manifest, lockfile and Vite configuration are preserved.

```sh
cd web
npm ci
npm run typecheck
npm test
npm run build
cd ..
node web/scripts/preview.mjs 4173
```

Open `http://127.0.0.1:4173/preview/`. Stop the server with Ctrl+C. The production export is **`dist/index.html` and its complete local assets**. Vite uses `base: './'`; assets, workers, checkpoint and metadata work at a static gateway subpath. Use HTTP rather than `file://`, because the demo uses module workers and runtime asset requests. No credentials or backend are bundled into the export. The site is submitted for IMD's static preview publication; no publishing or deployment command was run here.

Dependencies can instead stay entirely outside the repository:

```sh
node web/scripts/task.mjs install
node web/scripts/task.mjs typecheck
node web/scripts/task.mjs test
node web/scripts/task.mjs build
```

Run those commands sequentially: the helper copies source into a shared temporary build tree. `node web/scripts/task.mjs path` prints that tree for external browser tools. Package caches, dependencies and unnecessary archives are excluded at every nesting level. The submission includes source, the existing lockfile, reusable atlases, model sheet, demo checkpoint, export, installation instructions and actual evidence. No submodule is created, and `.git/` remains untouched.

## Explore and inspect

Drag or use arrow keys to pan. Scroll, pinch, use +/−, or use the zoom controls. Select a Stratok on the map, or use **Find residents** and search by name/ID. **Follow resident** tracks its confirmed position; manual pan stops following. Escape closes the resident sheet and returns focus to the map.

Click empty terrain to inspect its actual coordinates, resources, construction progress, shelter integrity and stores. **Explore settlements** lists real structures by biome; choosing one moves your camera. The atlas supports pointer and arrow navigation, and closes after choosing a location. Observer travel never moves residents. Water crossings remain subject to the engine's original movement rules.

Plans retains predictions, uncertainty, candidates and measured outcomes. Perception is the resident's last decision observation, not current global truth. Learning retains its actual model/episode/mb-v1 evidence. JSON downloads contain the actual inspector. World records expose bounded discovery/social history and real population, births, deaths, stores, sites and fish totals. No speech, thoughts, invented events, wallet/payment UI or fake IMD control is added. The archived `#settlement` route stays unavailable with `legacyAvailable:false`.

## Mode and owner installation

The shipped runtime file, `web/public/expanse-config.json` (copied to `dist/`), is:

```json
{"httpUrl":"https://stratoks.2-29-11-211.sslip.io","legacyAvailable":false,"startMode":"demo"}
```

For an owner same-origin installation, serve `dist/` with the existing read-only Expanse API and set `startMode` to `live` in that runtime file. Keep `legacyAvailable:false`. The source offers **Choose world** for an owner HTTPS endpoint, `?server=<URL-encoded HTTPS base>`, `?demo=1` and `?recorded=1`. An explicitly remembered source choice takes precedence. Local HTTP is accepted only from a local HTTP preview. A static export cannot change a different server's CORS policy. Failed connections retain a labeled recorded capture or last confirmed frame and provide reconnect.

The owner-run backend has zero runtime dependencies:

```sh
node server/src/expanse/server.js
```

Use an explicit data directory for a new local installation. For an existing owner world, first stop its process cleanly and copy its complete data directory to a separate review location. On that **copy**, run:

```sh
node server/bin/expanse-upgrade.js /absolute/path/to/copied-world
node server/bin/expanse-upgrade.js /absolute/path/to/copied-world --write
```

The first command is a dry run. The second preserves original pre-migration bytes before applying schema 3→4; do not point either command at the only copy of a world. See [owner installation and rollback](deploy/INSTALL-LIVING.md) for concrete backup, startup, API and rollback steps, including environment settings. The frontend adds only observer fields and portable save decoding; it introduces no new persisted schema beyond the preceding schema 4. Existing IDs, brains, learned weights, family/relationship records, memories, discoveries and modified terrain are never replaced by the demo checkpoint.

## Art, physics and provenance

[Art integration](docs/art/INTEGRATION.md) describes the 36 character and 32 environmental sprites, transparent gutters, common foot anchors, supplied input hashes, animation gates, mirroring and licenses. The model sheet is at `web/public/art/model.webp` and is linked from Help. The runtime uses the API's actual per-tile biomes, connected water neighbours, material-progress sites and resource/store contents. It does not stamp resource-bearing decorative islands or bridges into walkable tiles.

[Living rules](server/docs/LIVING.md) document the designed recipes, tool wear, fish stock limits/regrowth, storage, construction, exposure and survival rules. [Frontend contract](docs/living/FRONTEND.md) explains the demo history, engine integration and state-to-animation mapping. [DESIGN.md](DESIGN.md) documents the final implemented interface system.

The rejected rabbit media, old share cards and compiled archived observer have been removed, including historical screenshot binaries. Their old numerical JSON/TAP measurements remain historical data, not evidence for this revision. Current media and worker observations are in `artifacts/living-interface/`; [MEDIA.md](MEDIA.md) identifies them. Existing original art sources under `docs/living/source/` remain intact.

## Validation

The actual commands, browser results, six-domain Better Interface review, fixes and limitations are in [validation](artifacts/living-interface/VALIDATION.md), with raw JSON/TAP, desktop/mobile screenshots and recordings. These are contributor observations, not independent certification.

Reproduce meaningful checks after building:

```sh
node --test --test-concurrency=2 tests/expanse.test.js tests/living.test.js tests/living-interface.test.js
node tools/living/demo-checkpoint.mjs 2 12000 test/scratch/reproduced
node web/scripts/living-check.mjs
node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste
```

`living-check.mjs` owns and closes a local subpath preview, tests the real export, and never contacts the owner VPS. Browser dependencies come from the existing frontend lockfile; install Chromium/WebKit with Playwright outside the submission. `IMD_PLAYWRIGHT` may name an external Playwright `index.mjs`. `STRATOKS_FFMPEG` may name a VP9 encoder. Atlas validation uses externally installed `sharp`, as described in the art integration document. Missing platform/browser tools are reported explicitly; no recording, timing or test result is inferred.

## Remaining limits

The supplied work/walk poses face southeast. Southwest work/walk uses mirroring; backward travel uses the supplied rear view. Some generated poses vary slightly in shape. There is no eight-direction work rig, growth-specific body art, exact-unit load depiction, unlit-house variant or catch-result API phase. The fish-on-hook catch pose is delivered but unused. Work-tool art is withheld if a resident has no held supported tool; engine construction can still proceed according to its designed rules.

Only adjacent positions in consecutive engine ticks interpolate; skipped paths snap. A 96-chunk terrain cache and a 30 Hz visual cap bound rendering work, but newly exposed terrain can cause spikes and high zoom can soften cached paint. Learning histories and per-tick decisions are bounded; total simulation cost still grows with naturally growing populations. Local x64 CPU/RSS and emulated-browser results do not establish ARM VPS or physical-device performance. Native screen readers, physical phones, native 200% browser zoom and owner installation require further validation. No paid inference, live deployment or public-world write occurred.
