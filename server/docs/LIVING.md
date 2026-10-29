# Living world — Expanse schema 4

This extends the persistent 280×280 chunked Expanse (`server/src/expanse/`) with a full resource-to-life loop. Residents explore, find resources, gather or fish, carry a finite inventory, deposit and retrieve at shared stores, eat, build and repair biome-specific shelters, rest and carry on. The world, the original 56×56 settlement, its coordinates and IDs, and every existing resident are unchanged. Nothing here was deployed. The live VPS was not accessed.

The rules below are **designed** physics and recipes. Residents are not given these tables. They choose among generic affordances (gather a remembered node, combine two held items, deposit/retrieve at a known shelter, build, repair, rest, move, social acts) through the existing learned outcome model, planner and mb-v1 circuit, then learn from what happens. There is no scripted job scene and no unrestricted invention.

## Rules (schema 4)

### Fishing (`engine.js: performFish`, `terrain.js: fishNodes`)

| Rule | Value |
| --- | --- |
| Where | `fish` nodes on lake, stream, shallow or sea tiles that have a walkable non-water neighbour **inside the same chunk**. Open sea away from land has none. Density per shoreline water tile: temperate 0.07, arid oases 0.05, cold streams 0.09, coast 0.035. |
| Reach | From an adjacent tile (reach 1), using the ordinary A* path finder. Nobody walks on lake/sea tiles or teleports. |
| Perception | A fish stock is seen only within `fishSight` = 3 tiles (from the shore), not across the 7-tile perception radius. |
| Tool | `fish_line`, from the designed recipe `bundle + fiber`. `bundle` is `fiber + stick`, so a line costs 2 fiber and 1 stick. |
| Without a line | 3 ticks of looking, 0.3 energy, failure `needs-fishing-line`, stock untouched. Shown as state `inspect`, never as casting. |
| With a line | 12 ticks: `cast` (1–4), `wait` (5–9), `reel` (10–12). Then 1.5 energy. Each attempt adds one wear, and the line is used up after 6 attempts (`totals.wornOut`). |
| Bite | probability `0.6 × (0.4 + 0.6 × units/6)`, ×1.15 in rain. Misses return `no-bite`; an empty stock returns `no-fish`. |
| Stock | max 6, one fish regrows per 450 ticks. Regrowth uses the same exact lazy integer rule as all other nodes (`settleNode`). |
| Food | `fish` −30 hunger. |

### Shelters and construction (`STRUCTURES`, `performBuild`, `performRepair`, `stepShelters`)

| Biome | Kind | Materials | Labour (ticks) | Decay / tick |
| --- | --- | --- | --- | --- |
| temperate | `timber_home` | wood 4, stone 2 (same as the old single-step build) | 30 | 0.005 |
| arid | `desert_shade` | fiber 3, stick 2, stone 1 | 24 | 0.006 |
| cold | `snow_refuge` | stone 4, wood 2 | 36 | 0.010 |
| coast | `coast_hut` | wood 3, fiber 2 | 28 | 0.008 |

* **Found** (`build|found|<kind>:<water|dry>`). The creature must hold at least one needed material and know no standing shelter within 10 tiles. There must be no structure within 4 tiles and no fire on the tile, and the tile cannot be a stream or shallows. Marking the site takes 4 ticks and 1 energy.
* **Contribute** (`build|contribute|<kind>`). A creature contributes to a site it currently perceives. It delivers one needed held material every 3 ticks (0.5 energy each; counted in `totals.built`). Labour costs 0.15 energy per tick and is capped at `workNeed × delivered/needed`, so labour cannot outrun materials. `stage` = `min(2, ⌊3 × min(material share, labour share)⌋)`. The site is finished (`stage 3`) only when every material is delivered and the labour is complete.
* Unfinished sites give **no** warmth, rest or birth benefit. Ruins (integrity 0) give none either.
* **Decay** runs every 50 ticks at the rate in the table, ×1.5 in rain. **Repair** takes 6 ticks and consumes one of that biome's building materials (+30 integrity, `totals.repaired`). Repairing with the wrong material fails with `wrong-material`.
* **Climate effect.** A finished shelter raises cold air toward 17 °C and shades heat above 26 °C by 60 %. Both effects weaken linearly once integrity drops below 40.
* **Household rule.** A birth at a shelter needs fewer than `cap × 2` (8) residents whose home is that shelter. This limits conception only; nobody is removed. Births at a fire keep the existing rule.

### Shared stores (`performDeposit`, `performRetrieve`)

* Each finished shelter has a `store` holding at most 40 units of food or materials (`STORABLE`).
* `deposit` (2 ticks) moves all held units of one item into the nearest known shelter. `retrieve` (2 ticks) takes up to 3 units, within inventory capacity.
* Residents only know a store's contents from their **own last visit**, kept in `mind.shelters[].stock`, where `null` means never seen. Stale memories are corrected on arrival (`store-empty`), never looked up remotely.
* Materials are only offered for retrieval when the creature perceives an unfinished site lacking them or a worn shelter. Food can always be fetched.
* Designed drives (documented, not learned):
  * construction progress: +0.3 × progress share, +0.6 on completion;
  * provision: +0.03 per unit deposited at one's own home shelter, or +0.015 elsewhere — only for goods the creature did **not** itself take out of a store, so cycling goods earns nothing;
  * retrieved goods do not count as "production" in the reward.

### Climate costs

These rules existed before schema 4: arid heat raises thirst (+1/8 per °C above 26), cold below 10 °C drains warmth (exposure damages health below 25 warmth), and cold raises hunger by 30 %. Schema 4 adds **heat exertion**: walking where the ambient temperature is above 30 °C costs 50 % more energy. Desert scarcity comes from the existing sparse arid nodes and rare oasis lakes.

### Learning integration

All new actions go through `affordances → plan() → mb-v1 pickMushroom`. Outcomes update the per-creature outcome model, mb-v1 weights and episodes, and nearby observers update their own models at low weight (existing social observation). Two changes to how designed drives combine with learning:

1. The homeostatic `needBias` of a step is multiplied by the creature's learned success rate once it has at least 1 experience of that step.
2. The positive part of the label's innate drive is multiplied by learned success (floor 0.05) after 3 or more experiences.

Without (2), hungry residents repeated bare-handed fishing about 115 times each (seed 3: 12,692 attempts by 110 residents). With it, about 20 (2,300). Residents still pay to learn that a line is needed; newborns start with empty models, as before.

## Truthful render state (for the renderer contributor)

`engine.activity(c)` is derived only from the current engine step, its `phase` and the inventory:

| `state` | When |
| --- | --- |
| `travel` | walking a confirmed path toward the step's target |
| `starting` | step chosen this tick, no work yet |
| `fish` | `gather` on a fish stock **with a line**; `phase` = `cast` / `wait` / `reel` |
| `inspect` | looking (includes "fishing" without a line — no cast/reel art) |
| `gather` | gathering a land node or carrying from a pile |
| `construct` | `build` with phase `mark`, `deliver` or `construct` (actual material/labour change) |
| `repair`, `store`, `craft`, `eat`, `drink`, `make-fire`, `tend-fire`, `place`, `social`, `fight` | the corresponding step |
| `rest` / `sleep` | `rest` step (`sleep` at night: daylight < −0.3) |
| `idle` / `follow` | no step / voluntary following |

`progress` is work/duration of the step. For construction it is the site's share of materials and labour. `load` is the carried weight, `carrying` the storable goods held, and `tools` the held tools. Loads must only be drawn when `load > 0`.

Frame changes are additive, and `v` stays `1` so the shipped client still validates:

* `view.creatures[i]`: elements 0–5 unchanged, then `6 state, 7 phase, 8 progress, 9 load`.
* `view.shelters[i]`: **finished shelters only** (old clients draw every entry as a home) — `[id, x, y, kind, integrity, storedUnits]`.
* `view.sites`: `{id, x, y, kind, stage, materials, need, work, workNeed}` — unfinished construction.
* `view.piles`: `{id, x, y, items}` — ground stock piles. `view.stores`: `{shelter, x, y, items}` — non-empty shelter stores.
* `view.living: 1`.
* `residents[i]` adds `state, phase, progress, load, carrying, tools, target`. The inspector adds `activity, toolWear, home`.
* `summary` adds `sites, standing, stored, fishCaught`. `shelters` now counts finished shelters only.

A real sample frame (seed 3, viewport centred on a resident who is actually reeling) is at `shared/fixtures/living-frame.json`. It was generated by `tests/experiments/living-sample-frame.mjs`. It is real engine output for an isolated test world, not a mock and not the live world.

**Integration note:** the web client (`web/`, outside this assignment) has not been updated to draw `sites`, `piles`, `stores` or the new states. The prebuilt `dist/` demo worker still bundles the schema-3 engine and must be rebuilt by the integration step.

## Migration 3 → 4 and preservation

`MIGRATIONS[3]` in `persist.js`:

* Existing shelters become finished (`stage 3`, `complete`, `prebuilt: true`) with their biome's kind. Their materials are recorded as delivered without touching item totals, because the old rules already consumed them. Each gets an empty store. Id, position and integrity are unchanged.
* Creatures get `toolWear {}` and `fromStore {}`. Each remembered shelter gets `stock: null` (unknown until visited). `memoryVersion` becomes 3.
* Saved (modified) chunks get the fish stocks a pristine v4 chunk would generate, at full stock, timed from the migration tick. Pristine chunks regenerate identically. Every schema-3 node keeps its id, position and units; fish are a separate seeded pass appended after them.
* New totals (`repaired, wornOut, deposited, retrieved`) start at `{}`. A `migrations[]` record is appended.
* World id, seed, tick, RNG state, residents, brains and mb-v1 weights, outcome models, episodes, map knowledge, plans, discoveries, relationships, reputation, graveyard and history are untouched. `identityDigest()` hashes all of these, and the upgrade and tests require it to be identical before and after migration.

Before any in-memory migration, `load()` writes the original bytes and manifest to `<dir>/pre-migration/schema-<n>-tick-<t>/`. `save()` and `rollback()` never rotate this copy.

### Owner upgrade (on a copy, never the live directory first)

```sh
# 1. Stop nothing yet. Copy the data directory while the service runs (its writes are atomic).
cp -a /path/to/expanse-data /tmp/expanse-copy
# 2. Dry run: migrate in memory, verify identity, simulate 300 ticks on a throwaway copy. Writes nothing.
node server/bin/expanse-upgrade.js /tmp/expanse-copy
# 3. Optional: write the upgraded copy (original kept under pre-migration/) and run it in an isolated port.
node server/bin/expanse-upgrade.js /tmp/expanse-copy --write
EXPANSE_DATA_DIR=/tmp/expanse-copy PORT=8799 HOST=127.0.0.1 node server/src/expanse/server.js
```

Only after review, the owner can stop the live service, take `node server/bin/backup.js`-style backups, deploy this source and start it. `load()` performs the same migration and keeps the original under `pre-migration/`.

**Rollback:** stop the service, restore `<dir>/pre-migration/schema-3-tick-<t>/` into a fresh directory with `restore()` (`server/bin/restore.js`), and start the previous release on it. Schema-4 saves are refused by schema-3 code by design (`requires migration` / `newer schema`). The tests prove the preserved copy is byte-identical to the original after several later saves.

## Checks run (this machine: x86_64, 4 vCPU, Node v24.21.0)

`cd server && npm test` → **180/180 pass** (`tests/results/living/backend.tap`), including 13 new tests in `tests/living.test.js`:

* fish placement and reachability in all four biomes; schema-3 node lists unchanged by the fish pass;
* fishing prerequisites (line, 12 ticks, energy), cast/wait/reel phases, depletion to 0, exact regrowth to the cap, line wear;
* fish perceived only from the shore;
* construction materials per biome; stages bounded by materials; sites give no shelter; completion needs all materials and labour;
* decay, ruin, repair with right/wrong material;
* store conservation, capacity, stale memory correction, no reward for recycled deposits;
* climate: desert thirst and walking cost, cold warmth drain, insulation and shade;
* **conservation** for 3 seeds × 3,000 ticks (items: gathered + crafted − craftUsed − eaten − burned − built − repaired − wornOut = holdings incl. stores; nodes: initial + regrown − gathered − burned = current; all nodes within limits);
* render state truthfulness every 25 ticks for 2,500 ticks;
* exploration beyond the settlement, new shelters and births;
* determinism and exact restart;
* **real schema-3 save** (`tests/fixtures/expanse-v3`, produced by the pinned v3 engine) migrated on a copy. Identity digest, brains, models, episodes, relationships and memories are kept; the original is preserved byte-for-byte; migration is idempotent; restart equals uninterrupted; rollback restores the exact v3 bytes; 2,000 further ticks run.

The fixture's single shelter was built by the v3 engine's own build primitive after granting one resident 4 wood and 2 stone. The grant is recorded in `totals.gathered`, and the steps are in `make-fixture.mjs`. The fixture is not the live world: no live data was available or accessed.

### Multi-seed outcomes (`tests/results/living/summary.json`, raw per-seed JSON alongside)

| Seed / ticks | Pop. end | Births | Deaths (causes) | Fish caught | Lines | Bare-fishing attempts | Shelters standing / unfinished | Outside settlement | Deposited / retrieved | ms/tick | RSS MB |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 / 8k | 100 | 77 | 1 (old age) | 47 | 20 | 1,477 | 49 / 9 | 41 | 1,663 / 688 | 3.4 | 282 |
| 2 / 8k | 92 | 70 | 2 (exposure, old age) | 25 | 13 | 1,822 | 42 / 14 | 37 | 1,374 / 563 | 2.5 | 257 |
| 3 / 8k | 109 | 86 | 1 (old age) | 34 | 19 | 2,300 | 43 / 23 | 48 | 1,435 / 701 | 2.5 | 254 |
| 4 / 8k | 121 | 99 | 2 | 60 | 21 | 1,312 | 47 / 18 | 47 | 1,614 / 793 | 3.2 | 290 |
| 5 / 8k | 78 | 55 | 1 (dehydration) | 32 | 13 | 1,825 | 34 / 22 | 39 | 1,051 / 429 | 1.9 | 255 |
| 6 / 8k | 135 | 112 | 1 (dehydration) | 63 | 33 | 2,012 | 55 / 24 | 57 | 1,927 / 861 | 3.4 | 284 |
| 2 / 24k | 351 | 471 | 144 (exposure 79, old age 37, starvation 13, injury 11, burns 3, dehydration 1) | 538 | 219 | 20,974 | 147 / 26 | 145 | 6,096 / 2,489 | 11.1 | 534 |
| 3 / 24k | 602 | 777 | 199 (exposure 104, old age 49, starvation 25, injury 13, burns 8) | 831 | 376 | 26,752 | 171 / 41 | 183 | 7,893 / 3,452 | 16.8 | 655 |

Resident-ticks by biome over 24k ticks:

* seed 2: temperate 3.0M, cold 0.58M, arid 0.33M, coast 0.30M;
* seed 3: temperate 4.9M, cold 0.66M, coast 0.57M, arid 0.43M.

Residents do migrate into and settle in every biome. Cold exposure is the main cause of death in long runs.

### CPU / RSS (`bench-*.json`, 600 ticks from creation, single process)

| Initial pop. | Schema 4 p50 / p95 ms per tick | RSS MB | Frame build ms | Pinned v3 p50 / p95 | v3 RSS |
| --- | --- | --- | --- | --- | --- |
| 24 | 1.06 / 3.27 | 109 | 2.5 | 0.78 / 2.70 | 113 |
| 100 | 3.99 / 7.58 | 232 | 3.0 | — | — |
| 250 | 11.5 / 22.0 | 409 | 4.0 | 7.5 / 13.7 | 337 |

At the service's 1 s tick, even 250 residents use about 2 % of one core. Both engines grow freely (the pinned v3 engine also reached 380 residents on seed 3 by 24k ticks, at 521 MB RSS). Schema 4 grows faster: 602 residents and 655 MB RSS by 24k ticks on seed 3, until food limits it (starvation appears). **Memory, not CPU, is the constraint on a small VPS.** These numbers are x86_64. **The owner's ARM VPS was not measured.**

## Unfinished / known limits

* The renderer, art and website for these states belong to other assignments. The shipped `web/` and `dist/` do not yet draw sites, piles, stores, fishing or loads, and `dist/` bundles the schema-3 engine.
* Population is food-limited, not memory-limited. Long runs can exceed 600 residents and ~650 MB RSS. No cap was added, because the brief forbids arbitrary culling. The owner should check VPS memory or choose a documented limit.
* About 20 failed bare-handed fishing attempts per resident remain while they learn; newborns relearn.
* Unfinished sites are never demolished; abandoned sites stay as visible partial construction.
* `view.piles` can be dense near busy shelters (75 piles in one 48×32 view in the sample). This reflects the existing `place` primitive.
* Multi-seed CPU timings were taken with 2–3 runs in parallel and include contention. Bench numbers are single-process.
* No browser, screenshot or recording work was part of this assignment.
