# STRATOKS agency integration: worker validation

This contribution fixes the five remaining presentation defects and integrates the already-applied schema-5 engine into a real isolated demo and static export. Findings 6–8 were already fixed in the supplied engine; they were revalidated, not represented as new fixes. No production service was accessed, modified or deployed. This report records local worker evidence, **not independent structural acceptance**. The broader emergence/research limits below remain open.

## Eight-finding resolution table

| Finding | Reproduction / supplied baseline | Resolution and evidence |
| --- | --- | --- |
| 1. Phone evidence overlaps / Close unreachable | At 667×375, the old panel began at y≈26 and Close at y≈36; hit-testing found the header above it. `before-landscape.png` records the overlap. | `web/src/expanse/Map.tsx:506` uses a native top-layer dialog, Escape handling and focus return. `living.css:54` constrains it by viewport and safe-area insets, with a nonshrinking header and scrolling body. Actual Close hit-test, Escape and focus-return pass at five sizes, with/without an inspector. `phone-landscape-evidence.jpg`, `browser-results.json`. |
| 2. Corners inaccessible / wrong picking | The old inscribed-viewport clamp projected a valid corner above a 390px-wide screen (y≈−87); the regression failed. `before-tests.tap`. A later browser check also found a global button press transform shifting minimap coordinates. | `projection.ts:37` clamps camera focus to valid tile centers, allowing off-world margin. Four-tile query halo, floor at negative coordinates, bounded API queries. Minimap presses no longer transform their hit surface. Projection tests + 720 terrain-picking combinations cover all four corners, negative chunks, six terrain kinds, three zooms and five aspect ratios. Browser navigation reaches all four corners and opens their actual evidence. |
| 3. Flat terrain / no connected relief | Original `ground.ts` drew all top diamonds on one plane, and `worldRenderer.ts` imported flat `project`; no shared top/face height geometry existed. | `shared/relief.js:6`, `surface.ts:12` and `ground.ts` derive display lift from authoritative tile IDs, join equal-height tops, draw exposed bank/cliff polygons and use exactly those polygons for picking. Foreground cliffs join depth sorting. Tests verify joined edges, face picking, unknown/off-world rejection, unchanged terrain/RNG/passability and query coverage. `highlands.jpg` visibly records connected cliff and water-bank faces. Heights are visual units, not a new physical elevation simulation. |
| 4. Repair expects `work` | The old pose returned carry rather than work for the real `repair` phase; regression failed in `before-tests.tap`. Engine emits `repair` at `engine.js:760`. | `appearance.ts:26` maps actual `repair` with a supported held tool and building material. Negative tests reject wrong phase, missing tool and food-only loads; observer contract preserves exact phase/item/help target. |
| 5. Wrong settlement heading | Baseline `App.tsx` had correct aside label but visible h2 fell through to “Resident inspector” for `side === "places"`. | Both heading and accessible name now say “Settlements” (`App.tsx:563`, `:572`). Browser verifies title, biome filter and selecting a place moves the camera. |
| 6. Distant stock knowledge leak | Supplied schema-5 engine already passes the distant-sight regression. It was not reproducible in this starting engine. | Re-ran `tests/agency.test.js:38`: sight omits quantities; visiting learns them; distant changes leave stale memory; planner cannot retrieve from an unvisited stock; stale retrieval can fail. `AgencyEvidence.tsx:52` labels last visit, stale age and inherited-unverified stock. Tile quantities are explicitly observer evidence, never a resident query. |
| 7. Ruins usable as homes/stores | Supplied schema-5 engine already passes its ruin regression. | `tests/agency.test.js:65` verifies no ordinary deposit/retrieve/home protection at integrity 0, preserved holdings, explicit nearby salvage, repair recovery and truthful API ruin records. Renderer uses foundations; tile panel labels unusable ruins and preserved contents. No ruin was present in the natural demo checkpoint, so its functional test is not claimed as a natural screenshot. |
| 8. New build step reports idle | Supplied schema-5 engine already passes its starting-state regression. | `tests/agency.test.js:98` verifies starting → construct/progress rather than idle. Inspector distinguishes starting/in-progress/current step from pending steps. The real upgraded checkpoint includes 17 starting residents and one constructing resident (`checkpoint-evidence.json`). |

The before-tests were deliberately failing reproduction tests under `test/scratch/`; the maintained regression tests are in source. No review approval is counted as defect resolution. No known unresolved high presentation defect remains from these eight within the tested Chromium configurations; other devices and longer-lived states remain verification limits.

## Build and useful interaction checks

Commands were actually run against this source/export; logs retain output with only the absolute workspace prefix normalized to `<repo>`.

| Check | Actual result | Raw evidence |
| --- | --- | --- |
| `node --test --test-concurrency=2 tests/*.test.js` before adding the two new suites | 196/196, 141.137 s, no skips | `server-tests.tap` |
| `node --test tests/agency-view.test.js` | 2/2 observer-contract tests | `view-tests.tap` |
| `node --test tests/agency-demo.test.js` | 2/2 exact migration/replay/restart tests, 21.7 s | `demo-replay.tap` |
| `cd web && npm test` | 34/34 client tests, 5.977 s | `client-tests.tap` |
| `cd web && npm run typecheck` | Exit 0, `tsc --noEmit` | `typecheck.txt` |
| `cd web && npm run build` | Exit 0, Vite production export, 332 ms | `build.txt` |
| `PLAYWRIGHT_BROWSERS_PATH=/tmp/stratoks-browsers node web/scripts/agency-check.mjs` | All 10 interaction groups passed; zero page/resource errors; zero off-origin demo requests | `browser-results.json` |
| Pinned design probe on final `dist/` | 16/16 checks passed | `taste.json` |
| `git diff --check`, protected path/dependency/export-byte audit | See final audit | `delivery-audit.json` |

The existing Vite warning externalizes `node:fs` imported by server configuration. The browser engine uses portable save decoding; its real worker started, paused, resumed and served inspector data without a runtime error. The manifests, lockfiles and existing Vite build configuration were not changed.

Browser coverage: 1440×900 desktop; 851×700; 390×844 and 320×568 portrait; 667×375 and 844×390 landscape. Checked all biome/minimap navigation, actual canvas resident selection, search empty/recovery, goals/signals, actual inspector JSON download, follow/stop-follow, settlement filter/travel, evidence hit-testing/Escape/focus return with and without the side panel, help dialog, pause/resume, two-touch pinch and one-touch pan without accidental selection. The pointer test selects a real visible resident after navigating to a saved resident neighborhood; it does not inject entities or invoke a selection handler directly. A previous test attempt chose an unoccupied shelter and found no resident; the test navigation was corrected. Final errors are empty.

The pinned probe was run with:

```sh
IMD_PLAYWRIGHT="$PWD/web/node_modules/playwright/index.mjs" PLAYWRIGHT_BROWSERS_PATH=/tmp/stratoks-browsers node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste --offline
```

The probe input and scratch screenshots are not shipped. Its final JSON and our final screenshots are shipped. `phone-first-screen.jpg` visibly shows STRATOKS, the world and **Find residents** at 390 wide. `dist/index.html` has title, description, favicon, og:title and og:image. Static assets and the module worker were loaded successfully under `/preview/` with relative URLs and without an API server.

## Better Interface: six-domain review

Applied the pinned guide while building, then reviewed final source and rendered Chromium output. `DESIGN.md` documents implemented tokens, typography, spacing, components and responsive behavior; the source is authoritative.

| Domain | Coverage, finding and fix | Limits |
| --- | --- | --- |
| Accessibility | Native dialog + reachable named Close, inert background, Escape/focus return (`Map.tsx:506`); named canvas/controls and roster keyboard alternative; visible focus, native disclosure elements, reduced-motion text evidence. Browser tested keyboard and actual hit targets. | No native screen reader, physical safe-area or OS 200% zoom test. Probe reports all 17 first-screen targets ≥24px or adequately spaced, but 12 below comfortable 44px size. Compact landscape controls remain intentionally small/spaced. |
| Layout | First-screen product/action, responsive side sheet, independently scrolling evidence body (`living.css:54`), corrected minimap hit surface; no horizontal overflow at tested widths. Checked actual screenshots, not only source. | Actual cutouts and browser chrome differ from emulation. |
| Writing | Corrected settlement title (`App.tsx:572`); clear source/isolated/recorded labels; limited learned signaling and stale stock wording (`AgencyEvidence.tsx:23`, `:52`); goals/predictions/outcomes remain measured records. “Simulator logged … receptions” identifies observer bookkeeping. | No claims of consciousness, thoughts or semantic understanding; debug strategy keys remain technical evidence inside disclosures. |
| Typography | Local Manrope + Georgia, inherited six-size token scale, natural body tracking, wrapping names/keys, ≥16px mobile form inputs. Probe found no tracked capitals/kickers and no excessive first-screen sizes. Actual local font loaded. | First-screen probe does not assess every long inspector combination or non-Latin fallback. |
| Colors | Opaque moss HUD, warm gold action/focus, written source states; measured pairs below; no status conveyed by color alone. | Probe skipped 18 text boxes on image/canvas/gradient backgrounds. Those and all possible terrain conditions are not certified by the text-token measurements. |
| UI | Main Find action visible, empty-search recovery, current engine goals/signals only, observer JSON download, actual activity gates, connected relief and matching picking. `appearance.ts:26` fixed repair phase; minimap press transform corrected after browser finding. | Native WebKit cannot run on this machine; exact tool/cooking/help animations are contract-tested, not all naturally visible in the short recording. |

Measured from final computed token colors with the sRGB contrast formula: text `#f5efd9` / HUD `#28362d` **11.01:1**; muted `#bdc8b6` / HUD **7.31:1**; deep `#202a24` / gold `#e8c36e` **8.79:1**; focus `#ffe1a0` / HUD **9.98:1**. These are specific color pairs, not a whole-canvas accessibility claim. Probe first-screen copy: 13 prose words at 390, 24 at 1440; no observed repeated lines, clipped text, overlapping text boxes, all-caps content or endless reduced-motion animation.

## Real demo, preservation and deterministic evidence

Original schema-4 seed-2 tick-12000 checkpoint, 156 residents, is byte-identical in both source and export:

`cf2dcd95a83ffa1cc50975b40f9c6cb5829637ae0b3b9ff3f07846be12a5d716`

`tools/living/upgrade-demo.mjs` migrates a structured copy, verifies the identity digest, then runs 600 ordinary engine ticks. New schema-5 tick-12600 checkpoint hash:

`dfd1876c94afe40505583ed4f6094891bd8f5195439238e039bc44892ef907ab` (revision 2, regenerated after engine commit b702f51; see the revision section. The resident/activity counts in the next paragraph describe the previous checkpoint `9861c466…`; the regenerated summary is in `demo-upgrade.json`.)

`agency-demo.test.js` reproduces that exact compressed hash, checks both source/export copies, and compares exact state after save/restart continuation. Existing schema-5 tests additionally preserve original pre-migration bytes/manifest and verify rollback. World ID, residents, brains/weights, memories, relationships, terrain and RNG survive migration; subsequent births/deaths are ordinary simulation, not reset/culling. No actual owner save was available or accessed; preservation on the production owner world is therefore not claimed. Owner copy/migration/restart/rollback steps are in `deploy/INSTALL-LIVING.md`.

Checkpoint evidence: 166 residents (122 forest, 17 arid, 20 cold, 7 coast), 73 standing shelters, 21 construction sites, five berry crops including one ripe, no current fires or ruins. The 600-tick continuation records six plantings, 118 tending-help actions, one repair-help action, 1,001 signals, 7,174 receptions, 983 mishearings and 506 responses. There was no harvested or cooked output in this short continuation. Resident #154 is actually tending, with local signal/goal evidence; `inspector-evidence.json` is a browser download of its actual inspector.

The static export's default worker uses this updated engine. It does **not** imply the older remote backend supports agency. Unsupported goal/signal features disappear if those fields are absent. The frozen owner capture stays explicitly Recorded preview.

## Fixed seeds, ablation and unsuccessful outcomes

Ran `node tests/experiments/agency-ablation.mjs 3000 3,5,9 artifacts/agency-interface/ablation-3000.json`: 12 matched seed/condition runs plus two seed-3 runs with starting bushes depleted and the removed units booked to the ledger. Every run has `ledgerErrors: []`. All 14 behavioral rows exactly match the preceding deterministic experiment when elapsed-time/heap fields are excluded (`ablation-replay.json`). Exact new-demo replay is also independently tested above.

Below, population/hunger/diversity are means across seeds 3, 5, 9; farming/help counts are totals across those three runs. Lower hunger is better, but population is not a sufficient welfare or intelligence score.

| Condition | End population | Mean hunger | Planted / harvested | Tending help | Distinct retained first steps | Strategy entropy (bits) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Learning + communication | 37.33 | 5.40 | 75 / 90 | 267 | 58.33 | 5.00 |
| Frozen + communication | 43.67 | 7.90 | 13 / 15 | 32 | 37.00 | 4.05 |
| Learning, no communication | 40.00 | 6.20 | 44 / 66 | 163 | 37.33 | 4.04 |
| Frozen, no communication | 47.33 | 9.93 | 11 / 18 | 16 | 27.67 | 4.03 |

Learning changes farming and retained strategy use in these interventions, but does not uniformly improve survival/population. Communication adds signal/response actions, so greater action diversity partly reflects a larger available action set. Its learned mean payoffs vary by seed and sign. No general causal communication benefit is established. Retained histories are bounded and exclude dead residents; they are not complete lifetime action counts. Frozen primitive-model entropy is zero because that model is not updated, so it is not a valid learned-vs-frozen behavioral diversity comparison; use retained strategy data instead.

In depleted seed 3, learning+communication produced 11 plantings/21 harvest units and population 37; without communication it produced 25/39 and population 36. **Cooking and provisioning help were zero in all 14 natural runs.** Repair help was also absent in those short runs, although one occurred in the separate upgraded demo continuation. Mechanism tests cover actual cooking inputs/fuel/heat/conversion and voluntary provisioning/repair preconditions; they do not establish reliable spontaneous emergence. These are explicit unresolved parent-task research limits.

`tests/agency.test.js:119`, `:154`, `:175` exercise the three functional chains and conservation; `:203` tests bounded goals, danger interruption/resumption and alternatives; `:240` tests local range/attention/misperception/no dictionary; `:272` tests bounded signal credit, actual positive gain, relationship requirement and no designed help reward; `:286` runs multiseed/depleted conservation. The existing learned planner and mb-v1 are retained, without a colony director or permanent professions. Passing finite tests does not prove absence of every possible long-run reward loop.

## Timing and capacity

These are **local x64, Node 24.21.0 / headless Chromium** measurements, not ARM or physical-phone results. Engine benches overlapped other checks and are not controlled isolated-host benchmarks. Each engine bench ran 600 ticks.

| Initial → final population | Tick p50 / p95 / max, ms | RSS | Frame time / bytes |
| --- | --- | --- | --- |
| 100 → 100 | 8.594 / 20.042 / 61.239 | 227 MB | 9.23 ms / 202,242 |
| 250 → 251 | 26.182 / 78.478 / 103.715 | 353 MB | 23.53 ms / 250,590 |

Raw: `bench-100.json`, `bench-250.json`. The older-world 600-tick demo upgrade measured p50 25.466 / p95 41.785 / max 95.790 ms, RSS 394 MB (`demo-upgrade.json`). The configured 1-second engine interval has local headroom; that is not an ARM capacity guarantee. Natural population growth can increase total memory/CPU even with bounded per-resident histories.

Sequential render test (`agency-performance.mjs`, 120 retained frame samples each): desktop settled p50/p95 1.7/2.5 ms, camera-change p95/max 56.6/67.2; phone settled 1.0/1.9 ms, camera-change p95/max 18.6/25.0. The broader final biome tour retains initial/camera spikes up to 87.2 ms; these are in `browser-results.json`. Cache work is bounded to one DPR≤2 viewport surface plus 384 68×128 tile rasters (~12.75 MiB RGBA). The 30 Hz rendering cap does not eliminate camera recomposition stalls. Actual ARM monitoring and capacity checks are owner follow-up work, not silently marked complete.

## Delivered media and remaining limits

`forest-desktop.jpg`, `desert.jpg`, `highlands.jpg`, `coast.jpg`, `islands.jpg`, `signal-inspector.jpg`, `phone-first-screen.jpg`, `phone-landscape-evidence.jpg` are real final export screenshots. `phone-tour.webm` is a compact 8 fps / 90 kbit VP9 recording of actual worker/navigation/inspector interactions; no agent actions were forced. The recorder writes its uncompressed intermediate under scratch. Unsupported wheat/cookware/vessels/paired-actor illustrations are not rendered. The actual kneeling actor is extracted without the nominal grid's clipped feet. Direction coverage and source matte fringe remain art limits.

WebKit installation was attempted; launching returned **“Host system is missing dependencies to run browsers.”** Safari, physical phones/cutouts, native screen readers, native 200% zoom and ARM VPS behavior remain unperformed checks. No paid service, wallet, payment flow, inference, live-world writes or production publication was used. The delivery is source plus the working static export for the IMD preview publisher. This local design review and its passing checks are separate from structural acceptance and do not resolve the explicitly listed emergence/performance/device limits.

## Revision 2 (2026-10-30): reopened findings

| Finding | Reproduced | Verdict | Change | Evidence |
| --- | --- | --- | --- | --- |
| `26cec351…` medium: opening a resident keeps the roster's scroll and clips the name | Yes, on the committed export. 844×390: `.exp-panel-scroll` scrollTop 47, panel top 166, name 124.9–153.7 (completely above the visible panel). 320×568: scrollTop 75, name hidden. 390×844 and 1440×900 were unaffected. | fixed | `web/src/expanse/App.tsx`: a `useLayoutEffect` keyed on `[side, selected]` sets the shared scroll container's `scrollTop` to 0 before `select()` focuses the heading (`preventScroll`), so changing panel mode or resident opens at the top. Refreshes of the same inspector keep the reader's place. | `web/scripts/check-inspector-scroll.mjs` → `inspector-scroll.json`: 844×390, 320×568, 667×375, 390×844 and 1440×900 all show scrollTop 0, the whole name inside the panel, the heading focused, and a 120 px refresh scroll kept with no console errors. `inspector-open-844x390.jpg` and `inspector-open-320x568.jpg` are screenshots. |
| `d3e8c3f0…` low/advisory: notices and `web/package.json` declare wallet libraries absent from the hosted bundle | Yes: `wagmi`, `viem`, `coinbase`, `QueryClient` and `tanstack` each occur 0 times in `dist/assets/*.js`. | disputed (notice clarified) | `web/package.json` is protected build configuration in this assignment, so editing it gets a submission rejected automatically. `web/src/Legacy.tsx` and `web/src/wallet.tsx` still import these packages and are in `tsconfig` `include`, so removing them would also break `tsc --noEmit`. `web/scripts/licenses.mjs` now writes a header line saying these packages are declared for the legacy wallet client source and that none of their code is in `assets/`. The regenerated notices are in `web/public/licenses/` and `dist/licenses/`. | `node web/scripts/licenses.mjs`: 33 locked packages. `dependencies.json` is unchanged (it is a conservative superset). |

Also found and fixed while rebuilding:

- **The staged build could not run from a clean machine.** `web/scripts/task.mjs` copied `web/` and `server/src` into its temporary build tree but not `shared/`, which `web/src/expanse/surface.ts` imports (`shared/relief.js`). Vite failed with `UNRESOLVED_IMPORT` and tsc failed with two TS7006 errors. The helper now copies `shared/`.
- **The committed export was older than its source.** Engine job a5bbae27 (commit b702f51, merged after this job's previous round) changed `server/src/expanse/{engine,agency,agent}.js`, and the committed `demo.worker` predated that. Rebuilding put that engine into the worker. With it, `tests/agency-demo.test.js` failed (1 of 206 server tests): 600 ticks now hash to `dfd1876c…`, not the committed `9861c466…`. My diff left `server/`, `shared/`, `tests/` and the demo data untouched; the failure came from the engine change. I re-ran the documented recipe, `node tools/living/upgrade-demo.mjs` (exact original `cf2dcd95…` → migrate a copy → 600 ordinary ticks, nothing injected). It produced `dfd1876c…`, the value the test had computed independently. The original checkpoint is byte-identical. New continuation: 168 residents (127 forest, 12 arid, 26 cold, 3 coast), 73 standing shelters, 21 sites, 7 crops (0 ripe), 0 ruins, 965 signals. 600-tick timing on local x64: p50 23.7 / p95 42.9 / max 132.0 ms, RSS 388 MB (`demo-upgrade.json`). Resident #154 (Ziye) is still alive.

Commands and actual results after the final source change:

```text
node web/scripts/task.mjs build          ✓ built (index 392.32 kB / gzip 113.48 kB; demo.worker 133.03 kB)
node web/scripts/task.mjs typecheck      exit 0
node web/scripts/task.mjs test           34/34 pass
node --test --test-concurrency=2 tests/*.test.js   206/206 pass (205/206 before the demo regeneration)
node web/scripts/check-inspector-scroll.mjs        5/5 viewports pass
agency-check.mjs (scratch copy, output to test/scratch)   10/10 checks pass, 0 errors
taste.mjs --offline (pinned probe)       16/16 pass
```

These are worker observations, not independent acceptance. WebKit, physical phones and the ARM VPS remain unverified, as above.

