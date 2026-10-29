# Living-world integration: worker validation

Complete for the stated integration scope, with the limits below. These are contributor observations, not independent network certification. No owner VPS request, deployment, public-world write, paid inference, publishing command or save reset was performed. IMD publication is after submission; no new URL is claimed.

## Delivered scope and assumptions

The existing schema-4 production engine and supplied leaf-crowned species are integrated into the original full-world isometric observer. A fresh visitor gets a clearly labeled, isolated seed-2 browser worker resumed after 12,000 ordinary engine ticks. Its complete snapshot preserves the demo's individual weights, families, relationships, memories, supplies, modified terrain and RNG. It is never installed as an owner save. The original recorded owner world and live transport remain separate modes. The earlier physics, learning, social outcomes, births, ageing and deaths remain intact.

The default demo history has 156 residents, 145 births, 13 deaths (8 old age, 4 exposure, 1 starvation), 68 completed shelters, 26 sites, 1,285 stored units and 93 fish caught. Completed shelters: 45 temperate, 7 arid, 11 cold, 5 coast. These are measured checkpoint totals, not promises of future survival or viewer-created scenes. New API biome/climate/structure-navigation/capacity fields are read-only; there is no new persistent schema in this frontend contribution.

## Brief coverage

| Requirement | Status / evidence |
| --- | --- |
| Usable full-screen website, primary action at 390px | Met. `first-screen-390.jpg`; search, follow, atlas, zoom, selection and responsive sheet exercised. |
| Original species, no rabbit artwork/icons/share cards | Met by contributor inspection of the supplied model/atlases and rendered export. Old rejected visual media and compiled viewer retired. Independent owner art approval pending. |
| Full 280×280 world, original settlement/coordinates | Met. Existing projection/engine retained; backend preservation tests and positive/negative chunk picking. |
| Functioning biomes and wilderness | Met. Actual forest/desert/cold/coast settlements and uninhabited island terrain captured at desktop/mobile sizes. No activity or inhabitant is injected. |
| State-driven loads, work, rest, fishing, sites/stores | Met with supplied-art limits. Unit gates plus actual API/frame evidence. Empty sites are markers; stock footprints track units; no catch is fabricated. |
| Local knowledge, survival, economy and social evidence | Retained and tested. Plans/Perception/Learning and bounded social records remain; observer navigation never enters agent observations. |
| Static export, relative URLs, metadata, local runtime assets | Met. `dist/` tested at `/preview/`; title/favicon/description/OG image; complete checkpoint and atlases included. |
| Source, existing lockfile, backend installation, design docs | Met. Protected manifests/build configuration unchanged. See root README/DESIGN and `deploy/INSTALL-LIVING.md`. |
| Production build, typecheck, meaningful interactions | Met by the commands/results below. |
| Independent review / live publication / ARM deployment | After review or unperformed, explicitly outside this local integration. No independent approval is claimed. |

## Actual check results

| Command / check | Observed result |
| --- | --- |
| `node web/scripts/task.mjs typecheck` | Exit 0, TypeScript no-emit check. |
| `node web/scripts/task.mjs test` | 28 passed, 0 failed. Projection/chunk coverage, state/prop gates, cache/path rules, transport coherence and retained client tests. |
| `node web/scripts/task.mjs build` | Exit 0; complete `dist/` copied from Vite. Existing config imports produce a Node-fs externalization warning; the production browser worker executed successfully without filesystem calls. |
| `node --test --test-concurrency=2 tests/expanse.test.js tests/living.test.js tests/living-interface.test.js` | 41 passed, 0 failed. Raw `backend-tests.tap`. Includes conservation, reachable fish/tool/time/energy/stock/regrowth/wear, storage, climate, exploration, family/life events and copied-world migration/restart/rollback. |
| `node tools/living/demo-checkpoint.mjs 2 12000 test/scratch/reproduced` | Gzip SHA-256 matches the shipped checkpoint byte for byte: `cf2dcd95a83ffa1cc50975b40f9c6cb5829637ae0b3b9ff3f07846be12a5d716`. |
| `node tools/living/validate-integration.mjs` | 68 RGBA sprites, identical manifest copies, consistent [160,280] anchors, minimum transparent gutter 32px. Geometry/alpha checks do not independently approve aesthetics. |
| `node web/scripts/living-check.mjs` | Exit 0. 12 layouts (Chromium 156.0.8078.4, WebKit 27.2), 0 unexpected page/console/resource failures, 0 axe violations in the audited base views; 17 additional checks/recordings. |
| Pinned `taste.mjs --out test/scratch/taste` | 16/16 checks passed; `taste-checks.json`. 18 canvas/image/gradient text boxes were not contrast-measured by the probe; 12 controls were below the comfortable 44px target but passed the 24px/spacing bar. |
| `git diff --check` and delivery audit | No whitespace errors or protected-path changes. Final byte/path budget result is `delivery-audit.json`. |

Browser tests use the real production export under a subpath and the actual worker, not synthetic job scenes. Width×height pairs in **both** engines: 320×568, 390×600, 390×844, 667×390, 851×650 and 1440×900. Keyboard tests cover search/empty/clear, selection, follow, Escape/focus return, pan, zoom, minimap arrows and non-pointer activation, settlement filters and camera navigation, actual inspector download, invalid URL recovery, recorded/demo switching and an intentionally unavailable local live endpoint. The expected test-only 404/aborted read is separately recorded, not hidden as a successful live connection. The owner endpoint was not contacted.

The first browser connector could not find its Chrome executable. Real checks used locally installed Playwright Chromium and WebKit; Linux WebKit libraries/Mesa were extracted under /tmp and software rendering enabled. No dependency/browser/cache directory is submitted. This is emulation, not a physical iPhone or Safari certification.

## Better Interface: all six domains

Pinned Better Interface/Impeccable guidance was read and applied during construction, then consolidated into this review. Existing MIT/Apache guidance notices remain in `docs/licenses/better-interface.txt`.

| Domain | Coverage | Findings/fixes and limits |
| --- | --- | --- |
| Accessibility | Checked | Native buttons/dialog/disclosures, names/labels, keyboard paths, focus return, reduced-motion preference and visible source text. Base-view axe checks passed at all 12 layouts. Native screen readers and every focus/background pair were not tested. |
| Layout | Checked | Initial 390px product/action, 320px reflow, desktop side panel, phone sheet, short landscape and expanded atlas. Fixed atlas interception and preserved resident size when the inspector changes map width. Native 200% zoom and RTL/localization were not tested. |
| Writing | Checked | Verb actions, actual source/tick/scope, uncertainty and missing-data copy. Fixed misleading recorded-evidence loading copy. No invented event or thought language. |
| Typography | Checked | Existing local Manrope + system serif; six-size scale, wrapping names/IDs, tabular changing numbers, 16px phone inputs. Loaded font evidence is in browser JSON. Native text-enlargement/device font fallback coverage is limited. |
| Colors | Checked | Opaque moss HUD and semantic gold/focus/error tokens; measured pairs below. Canvas/alpha/image combinations not covered by solid-pair measurements remain unverified. |
| UI | Checked | Hover/focus/pressed/disabled and real empty/error/pending flows, restrained animation, model/art inspection, real worker state and camera/picking. Animation-panel replay at 10% speed and complete temporal cleanup of generated poses were not performed. |

## Resolved findings

Each source location identifies the current fix; prior behaviour is described as the reproduced finding.

1. **High · species/identity:** `web/src/expanse/art.tsx:12`, `atlas.json:1`. Before: rejected rabbit atlases/avatars/share images. Changed to supplied golden scalloped, leaf-crowned species across world, portrait, model, SVG logo, favicon and share card. Why: mandatory character identity. Recheck: actual model and all biome renders inspected; 68-sprite alpha/anchor checks pass. Independent approval is still pending.
2. **High · false activity:** `web/src/expanse/appearance.ts:12`. Before: primitive intentions selected resting/building/gathering while travelling, and the living fields were ignored. Changed to confirmed state/phase, tools, matching inventory and actual site materials; omitted paths snap; missing catch-result phase never shows the fish-on-hook pose. Recheck: meaningful state/prop unit tests and actual fishing cast/wait/reel capture.
3. **High · frozen review:** `web/src/expanse/demo.worker.ts:25`, `App.tsx:20`. Before: first screen used a static owner recording and a new-founder demo. Changed to a complete natural-history checkpoint resumed by the production engine, explicitly isolated. Recheck: ticks, births, stores and actual activities advance; reopening restores only that demo, never owner state; deterministic checksum reproduced.
4. **Medium · covered short-phone navigation:** `web/src/expanse/living.css:59`, `Map.tsx:467`. Before: the expanded atlas intercepted the settlement rail at 320×568. Changed atlas placement in short maps and close-on-location selection. Recheck: keyboard/pointer navigation and exposed controls pass both browser engines at all six sizes.
5. **Medium · shrinking residents:** `web/src/expanse/App.tsx:210`, `Map.tsx:118`. Before: the inspector reduced map width without adjusting camera span, shrinking residents in a rendered fishing view. Changed width/span together; phone height-only sheets retain zoom. Recheck: browser JSON records equal pre/post-inspector half-tile scale for every layout, plus correct picking after the resize.
6. **Medium · unsupported construction/stock appearance:** `appearance.ts:2`, `worldRenderer.ts:239`. Before: an empty site could draw physical construction, and stores/sites were ignored by the old renderer. Changed empty sites to outlines, staged sprites to actual materials/progress, stocks to real item counts with changing footprints and zero removal. Work-tool pose requires a held supported tool. Recheck: gates/empty-site unit checks and real construction/store fields in captured frames.
7. **Medium · assumed capacity:** `server/src/expanse/engine.js:721`, `Inspector.tsx:276`. Replaced a fixed UI capacity with the engine's actual configured capacity. This is a derived observer field, not persistent save state. Recheck: portable restore/read-only view tests and rendered activity evidence.
8. **High · owner startup configuration:** `web/src/expanse/App.tsx:90`. The former recording-only auto-connect condition ignored `startMode:live` once the new default became demo. Configuration now switches through the same clear-frame source transition, honors live/recorded startup and preserves explicit query/remembered preferences. Recheck: local owner-config regression; a failed configured live read stays labeled recorded, never private-as-live.
9. **Low · loading scope:** `Inspector.tsx:221`. Replaced “Loading recorded evidence” in the running demo with “Loading resident evidence” and “Waiting for the next engine frame.” Recheck: source and browser selection/loading flow.

## Measured contrast

Computed solid HUD token pairs, measured in the production page:

| Foreground/background | Ratio |
| --- | --- |
| #f5efd9 on #28362d | 11.01:1 |
| #bdc8b6 on #28362d | 7.31:1 |
| #bdc8b6 on #425546 | 4.62:1 |
| #202a24 on #e8c36e | 8.79:1 |
| #e8c36e on #202a24 | 8.79:1 |
| #ffe1a0 on #28362d | 9.98:1 |

No ratio is claimed for unmeasured canvas, translucent caption or bitmap-paint combinations. Status also has text and an icon/state cue.

## Outcomes, cost and failures

| Natural run | Final population | Births / deaths | Fish | Stored | Mean step ms | RSS MB |
| --- | --- | --- | --- | --- | --- | --- |
| Seed 2 · 12,000 ticks (checkpoint) | 156 | 145 / 13 | 93 | 1,285 | See reproduction trace | 212 in reproduction |
| Seed 3 · 8,000 ticks | 109 | 86 / 1 | 34 | 734 | 5.488 | 187 |
| Seed 5 · 8,000 ticks | 78 | 55 / 1 | 32 | 622 | 4.031 | 151 |

Seed 3's death was old age; seed 5's was dehydration. At the final sampled tick seed 3 had no cold residents and seed 5 had no coast residents, despite earlier visits; these are failures/variation, not edited-away outcomes. There are unfinished construction sites, unsuccessful fishing/ignition attempts and sparse desert groups. All final living residents are retained; no artificial cull or forced migration is introduced. Detailed per-biome resident-time, learned outcomes, repair/deposit/retrieval totals and CPU/RSS are in the seed JSONs. Runs overlapped other local work; timings include contention.

The reproduction took 104.36s elapsed with median/p95/max step 7.01/21.71/50.08ms and 211.88MB RSS on Node 22.23.3 x64. The 600-tick benchmarks measured p50/p95/max 2.337/6.818/43.925ms at 24 founders (102MB RSS), and 8.44/14.831/71.471ms at 100 founders (142MB RSS). Frame times were 6.65/8.42ms respectively. These are local measurements, not ARM VPS claims.

### Browser timing

Fresh load to connected engine plus rendered canvas ranged 1583–2092ms in Chromium and 5368–6666ms in WebKit on this machine. Renderer samples (not whole-browser FPS):

| Phase | Median ms | p95 ms | Max ms | Cached rasters |
| --- | --- | --- | --- | --- |
| actual island wilderness after biome navigation · 1280px | 1.20 | 2.50 | 107.40 | 96 |
| actual island wilderness after biome navigation · 390px | 1.10 | 2.30 | 113.70 | 96 |
| desktop idle with real 156-resident worker · 1440px | 1.80 | 3.00 | 58.30 | 96 |
| desktop keyboard pan · 1440px | 2.10 | 28.30 | 42.10 | 96 |

Newly exposed terrain caused visible rasterization spikes; fixed-raster LRU is capped at 96 chunks (~52MB RGBA) plus the viewport composition, and cosmetic updates at 30Hz. No 60fps claim is made. Total engine cost can still rise with a naturally growing population; per-resident history and per-tick decision work remain bounded. The live ARM VPS and physical mobile memory/thermal behaviour were not measured.

## Media and remaining work

Actual screenshots: `first-screen-390.jpg`, `first-screen-1440.jpg`, `inspector-390x844.jpg`, `temperate/arid/cold/coast-{1280,390}.jpg`, `islands-{1280,390}.jpg`, `actual-fishing.jpg`. All are captured from the real export. Biome screenshots pause the private engine briefly so their sidecar state and tick match. Videos resume it and record real movement/actions; fishing follows actual resident #116 (Yeru), with a held line and real cast/wait/reel phases. See `browser-results.json` for targets, inventories, structures and phase evidence. The recorded attempt completed at tick 12,063 and produced one fish (episode duration 13 ticks, reward 0.052); the unexposed catch pose is still not fabricated.

`biomes-1280.webm` and `biomes-390.webm` cover all four biomes plus island wilderness; `actual-fishing.webm` retains the actual attempt. Recordings are VP9, sampled at 6fps (runtime visuals cap at 30Hz); desktop biome video is packaged at 768×480 and mobile at 390×844. Large real JPEG captures are additionally compressed for the 8MiB budget; `evidence-encoding.json` records it. No required capture, runtime atlas, complete checkpoint, source or lockfile is dropped. The redundant 390×600 inspector image is omitted; its interaction/layout results remain in JSON.

Remaining art limits: southeast work/walk, mirrored southwest work/leftward fishing, rear idle view during backward travel, modest generated-frame shape variation, no growth-specific/eight-direction rig, no unlit completed-home variant, no exact-unit pile painting and no catch-result API phase. Warm windows are baked illustration in standing finished homes, not an engine fire record. Co-located residents can occlude one another; search/follow and the inspector preserve the actual evidence. Shores follow engine tiles; painted shore modules are reusable assets, not false routes.

Unperformed checks: independent owner art approval, real screen readers, physical phones, native 200% zoom, RTL/localization, all canvas/alpha contrast pairs, live cross-origin owner access, VPS installation and ARM benchmarking. No robot/animal stand-in, invented speech, guessed live result, schema reset or production deployment is used to cover those limits.
