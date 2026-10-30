# STRATOKS engine — schema 5: correctness, persistent goals, capabilities, three new chains, learned signals

Scope of this contribution: the **authoritative engine** (`server/src/expanse/`), its migration, tests and
experiments. Nothing was deployed or published. The live VPS and live world were not accessed. The web client
(`web/`) and `dist/` were **not** changed by this work (they are outside this assignment's paths), so client-side
defects 1–5 are not resolved here. See the table below.

## Defect resolution table

"Resolved" below means a reproducing test exists in `tests/agency.test.js` and it passes. A review someone accepted does not count as resolved.

| # | Finding | Owner of fix | Status in this commit | Evidence |
|---|---|---|---|---|
| 1 | Tile-evidence HUD overlap / close button on small or landscape phones | web client | **Not resolved, outside this scope** | — |
| 2 | Camera clamping hides corner tiles / picking | web client | **Not resolved, outside this scope** | — |
| 3 | Terrain renders flat (cliff faces, banks, heights) | web client renderer | **Not resolved, outside this scope** | — |
| 4 | Repair pose expects phase `work`, engine emits `repair` | web client mapping | **Not resolved, outside this scope**. The engine contract is unchanged: `activity().state === 'repair'`, `phase === 'repair'`. | `server/src/expanse/engine.js` `performRepair` |
| 5 | Settlements navigator titled "Resident inspector" | web client | **Not resolved, outside this scope** | — |
| 6 | Exact store contents leak from distant sight | engine | **Resolved** | test `defect 6` |
| 7 | Ruins (integrity 0) work as stores / finished homes | engine + views | **Resolved** | test `defect 7` |
| 8 | Newly chosen build step reports `idle` | engine | **Resolved** | test `defect 8` |

## Revision findings (second independent review)

Each finding was reproduced first; only the ones that held were changed. Tests live in `tests/agency.test.js`.

| Finding | Verdict | What changed |
|---|---|---|
| Repeated place/carry earns acquisition reward (`carry` outcome) | **Fixed** | `carry` now ends with `{transfer:true}` like retrieve/salvage: no per-unit acquisition reward, no social-observation broadcast, produced map still recorded for planner predictions. Test `ground place/carry is a transfer`. |
| Sender learns receiver's private outcome at any distance (`settleWatch`) | **Fixed** | Sender credit moved behind a bounded acknowledgement signal: emitted by the responder only on a positive gain with a positive tie, only inside signal range, gated by the normal attention and misperception rules, attributed by heard glyph against the sender's bounded sent history, scaled by perceived confidence. The global gain accounting remains only as `signal.outcomes` observer telemetry. Test `sender credit is local`. |
| Frozen mode still wrote associations/co-occurrence/avoid lists | **Fixed** | `settleWatch` association `n`/`payoff`, `onRespond` co-occurrence and `learnGoal` fails/avoid/switched are now all inside the learning guard. Frozen runs keep `model`, `goalModel`, `trust`, `seen`, `n`, `payoff`, `avoid` empty. Test `frozen mode writes no learned structures`. |
| Curiosity goal unreachable once `visited` hits the 384 cap | **Fixed** | New persisted counter `mind.novelCells` (versioned default `visited.length`) counts every novel cell; `goalMetric('curiosity')` uses it. Test `curiosity survives the visited-cell memory cap`. |
| `share` overfills the recipient | **Fixed** | Recipient capacity checked at execution before the giver's item is removed; rejection is `inventory-full`. Offer is still made — the giver cannot see inside the recipient inventory. Test `share respects the recipient capacity`. |
| Social goal closed by a single interaction | **Fixed** | Satisfaction threshold raised 0.08 → 0.3 (~3+ exchanges). Test `a social goal persists`. |
| Cook/provision chains absent from engine-driven runs | **Disputed (disclosure already present)** | No code change: the "Known gaps" section below and the ablation table have always reported `cookedOut`/`helped.provision` as 0 and never counted them as demonstrated chains. |

### 6 — distant stock leakage
*Before:* `perceive()` copied `shelter.store` into every observation within 7 tiles, and `rememberShelter()` stored it as
`mind.shelters[].stock`. `livingAffordances()` then offered `retrieve` for goods the resident had only seen from a distance. This was a planner leak.
*Now:* observations of a shelter carry its appearance only: id, position, kind, stage, integrity, `ruined`. They never carry `store`.
`rememberShelter(mind, shelter, tick, visit)` copies contents only when `visit` is true. Only deposit, retrieve,
salvage, repair and completing the build pass `visit = true`, and all of these require reach 1. `visited` records the tick.
A memory stays stale until the next visit. A stale memory can still lead a resident to try a retrieve, which fails with `store-empty` on arrival
and corrects the memory. The inspector shows `knownStores[].stock / visited / staleTicks`, which is the resident's own knowledge.
The observer-only `view.stores` and `places` are not inputs to any agent.

### 7 — ruins
*Before:* `shelterAt()` already denied protection, but deposit/retrieve still worked at integrity 0. `nearestKnownShelter()`
offered ruins as homes, and `view.shelters` listed them as homes.
*Now:* deposit and retrieve at a ruin fail with `ruined`. Contents are kept untouched. Remembered ruins (`ruined: true`) are not
homes or store targets, and they do not count as "housed" for founding decisions. Recovery has two routes:
**repair** (the existing primitive, which restores normal use) or the new explicit **salvage** primitive. Salvage works on ruins only, at reach 1, takes 4 ticks and 0.6 energy, and moves up to 3 units into the inventory as a transfer that is counted in `totals.salvaged`.
Views: `view.shelters` lists standing shelters only. The new `view.ruins` is `{id,x,y,kind,stored,usable:false}`. `frame.places[].ruined` is new.

### 8 — starting state
*Before:* `activity()` overrode every build step whose phase was not deliver/construct/mark with `idle`, including a step
chosen on the current tick.
*Now:* any step without a phase reports `starting`, with progress 0. A build step reports `construct` only while it is marking, delivering
or doing labour. A test scans a whole 1,500-tick world: `idle` occurs if and only if `c.act === null`.

## New mechanisms

### Capabilities and actions (`capabilities.js`, designed)
`MATERIALS` gives per-item properties: `edible`, `thirst`, `fuel`, `plantable`, `heatable`, `building`, `storable`.
Affordances use only these properties to decide which generic primitive may be *attempted*. They never use them to decide what the primitive does.
`ACTIONS` lists reach, ticks, energy and preconditions for every primitive. `CROPS`, `COOKING` and `COOK` are the physical
rules, applied only at execution. Residents receive the rule results only as outcomes (success, reason, produced items, wellbeing change).
These go into their existing outcome model (`agent.js updateModel`) and mb-v1 reinforcement. **Capabilities do not reveal recipes.** Example: a
berry is `heatable`, but cooking it just scorches it. A resident learns which heatable items are worth cooking.

New primitives: `plant`, `tend`, `harvest`, `cook`, `salvage`, `signal`, plus `move` with purpose `respond`. Existing primitives
(`inspect, move, gather, carry, place, combine, use, share, deposit, retrieve, build, repair, rest, …`) are unchanged.

### Chain A — plant / tend / harvest (climate and water constraints)
* `plant` (3 ticks, 0.5 energy) puts one held `plantable` item into the current tile. The seed is consumed (`totals.planted`) only if
  the soil fits: berry needs grass or forest, cactus fruit needs sand or dune. Otherwise it fails with `barren-ground` and the seed is kept.
* Every 50 ticks: a crop is wet if it is raining or there is fresh water within 1 tile. Otherwise its moisture drops by 1.
  It grows only if moisture > 0 and the biome temperature is inside its window (berry 5–26 °C, cactus fruit 14–45 °C).
  Otherwise it is stressed, and berry withers after 4 stressed checks in a row (cactus after 8). Cold highlands (1 °C) cannot grow either crop.
* `tend` (4 ticks, 0.4 energy) adds 2 moisture (max 4), but only if fresh water exists within 4 tiles of the crop. Otherwise it fails with `no-water-near`.
* `harvest` (4 ticks, 0.6 energy) works only when the crop is ripe. It creates `yield` units (berry 3, cactus fruit 2). Anything that does not fit
  in the inventory is dropped as a pile (`totals.harvested` counts the full yield).

### Chain B — prepare and cook food with fuel and heat
`cook` (6 ticks, 0.4 energy, reach 1 to a lit fire): the fire needs ≥ 1.5 fuel and loses 1.5. Fish, shellfish and lichen turn 1:1 into
their cooked forms (hunger relief 44, 36 and 16, versus 30, 26 and 8 raw). Other heatable items scorch: the item is kept and the heat is still spent.
Ledger terms: `cookedIn`, `cookedOut` and `heatUsed`.

### Chain C — voluntary help with another resident's shelter
A resident learns whose home a shelter is **only by seeing that resident resting at it** (`mind.homes`, bounded to 8 entries).
* Provisioning: if it perceives that resident looking hungry (`thin`, hunger > 60, which is visible) and holds storable food, it may `deposit` that food
  at the remembered home shelter (≤ 12 tiles). The step key is `deposit|food|help:<kin|friend|other>`.
* Repair: a worn shelter (integrity < 70) that it knows to be someone else's home gets the key `repair|<item>|help:<bucket>`.
* Helping has **no designed drive**: `needBias` = 0 for help steps, and provisioning to someone else's home only earns the
  existing small provision term. Whether helping pays is learned per relationship bucket. Help acts are `social` events of type
  `help` (reputation +0.05 for observers) and are counted in `totals.helped`. Tending a crop planted by someone else is counted as `helped.tend`.

None of these sequences is forced. Each primitive is offered when its local preconditions are visible, and the
existing planner and mb-v1 choose among them.

### Persistent goals (`agency.js`, extends planner/mb-v1)
* Goal kinds: food, water, warmth, rest, safety, curiosity, social. Triggers and satisfaction thresholds are **designed**.
  Each resident has at most 4 goals. A goal persists until it is achieved, displaced (by bound) or abandoned (after 1,500 ticks).
* Curiosity is measured by `mind.novelCells`, a persisted lifetime count of newly explored 8×8 cells, not by the retained
  `visited` list (capped at 384). A resident whose cell memory is full still progresses on new ground; the counter migrates
  with the versioned default `visited.length`. A social goal needs ~0.3 of new positive relationship — about three or more
  exchanges — so it persists across several interactions instead of closing after one.
* The top-urgency goal is `active`. Goals that are outranked become `suspended` (`interruptions` counter), and resume later (`resumed`).
* Planner integration: each candidate's utility adds `goalWeight × urgency × goalBias`. `goalBias` is the **learned** mean
  change in the goal's metric after that first step while that goal was active (`mind.goalModel`, at most 64 entries). Unknown steps
  get a +0.1 optimism prior. A step that failed or made no progress twice in a row for a goal goes into that goal's `avoid` list (bias −1),
  so the resident switches to an alternative strategy.
* Interruption: every 5 ticks a running step is checked. It is interrupted (`interrupted:danger|thirst|hunger`) when the resident
  is standing in fire, an attacker or threatener is within 4 tiles, or thirst or hunger exceeds 85 and the current goal does not serve it.
* There are no professions and no colony director. Goals are per resident and come from that resident's own state.

### Limited learned signalling (`agency.js` + `engine.js`)
* Six neutral glyphs `◇ △ ○ □ ☆ ◁` with no built-in meaning. `signal` costs 0.05 energy, has a 40-tick cooldown, and is offered only
  when another resident is visible.
* Reception: within 6 tiles (Chebyshev). Attention is `0.85 − 0.08·dist` (−0.4 when resting), so the chance of hearing is 5–100 %.
  The glyph is misheard as another one with probability `0.06 + 0.03·dist`. The receiver stores only `{glyph, from, x, y, tick, dist, conf}`.
* Sender side: the step key is `signal|glyph|<own salient perception category>`. Which glyph a resident uses in which
  situation is therefore learned from credit. **Signalling earns no intrinsic reward.** The receiver's outcome is private to the
  receiver. A sender is credited **only through a bounded acknowledgement it actually perceives**: when a response settles with a
  positive wellbeing gain and the responder has a positive tie back, the responder emits the glyph it responded to. That
  acknowledgement reaches the sender only if the sender is still within signal range and attends to it, under the same distance,
  attention and misperception rules as any signal. The sender attributes it to the most recent matching glyph in its own bounded
  sent history; a misheard acknowledgement can credit a different glyph, and a forgotten send earns nothing. Credit is capped at
  0.3 per response, scaled by the perceived confidence, and applied at weight 0.5. The realised gain itself is never copied to the
  sender: it exists only as observer telemetry (`signal.outcomes`).
* Receiver side: a response is `move` to the source (key `respond|glyph|trust-bucket`). On arrival the receiver records what *it*
  perceives there (co-occurrence counts). After 90 ticks it compares its own wellbeing with its wellbeing at arrival. This change updates
  the association payoff, the outcome model and its trust in the sender.
* Inspector `communication`: heard, sent (with credit), trust, per-glyph associations (heard, responded, outcomes,
  mean payoff, confidence `n/(n+3)`, co-occurrence) and the sender's learned glyph values. It is labelled "limited learned signalling".
  It shows no invented thoughts or translations.

## Designed vs learned

| Designed (fixed tables/code) | Learned (per resident, from own or observed experience) |
|---|---|
| Physics: terrain, climate, crops, cooking, decay, ruins, salvage, fishing, recipes | Outcome model per `action|arg|ctx`: success, reward, duration, energy, produced |
| Material capabilities (which primitive may be attempted) | mb-v1 weights (existing) |
| Goal triggers, metrics, satisfaction thresholds, bounds | goalModel: which first steps advance which goal; avoid lists |
| Signal range, attention, misperception, credit cap; no dictionary | Glyph use per context, payoff of responding per glyph and trust, trust per sender |
| Reflexes, needBias, wellbeing reward (existing) | Whose home is which shelter (observed); store contents (visited) |
| Production vs transfer: only new material earns acquisition reward; carry/retrieve/salvage/share are transfers | — |

## Migration 4 → 5 (`persist.js MIGRATIONS[4]`)
Adds empty `crops` and `signals`, schema-5 totals, `nextId.crop` and `nextId.signal`, and per resident empty goals, goalModel, heard, signals, trust and homes.
It adds `children` derived from existing `parents`, and `ruined`/`visited` on remembered shelters. **Remembered stocks are kept exactly as they were.**
`identityDigest()` (world id, seed, tick, RNG, all residents' brains, models, episodes, knowledge, relationships, memories, graveyard,
history, terrain, nodes) is identical before and after. Before migrating, `load()` keeps the exact original bytes under
`pre-migration/schema-4-tick-<t>/`. The test uses a real schema-4 save: `tests/fixtures/expanse-v4`, made by the schema-4 engine at
commit c794a2a with `make-fixture.mjs`, seed 20261030, 3,000 ticks, 39 residents, 28 shelters. It is not the live world.

Owner upgrade, always on a copy first:
```sh
cp -a /path/to/expanse-data /tmp/expanse-copy
node server/bin/expanse-upgrade.js /tmp/expanse-copy          # dry run, writes nothing; prints identityUnchanged
node server/bin/expanse-upgrade.js /tmp/expanse-copy --write  # keeps original under pre-migration/
EXPANSE_DATA_DIR=/tmp/expanse-copy PORT=8799 HOST=127.0.0.1 node server/src/expanse/server.js
```
Rollback: stop the service, `restore()` `pre-migration/schema-4-tick-<t>/` into a fresh directory, and start the previous release.
Schema-4 code refuses schema-5 saves by design. Dry run on the v4 fixture: `results/upgrade-dry-run-v4.txt` (identityUnchanged: true).

## Checks run (this machine: x86_64, 8 vCPU, Node v22.23.1, not the ARM VPS)

* `cd server && npm test` → **202/202 pass** (`results/test-run.txt`). This includes 19 tests in `tests/agency.test.js`
  (6 added in this revision for the findings above) plus a restart-exactness fix in `settle()` that the revision exposed.
* Ablation: `node tests/experiments/agency-ablation.mjs 3000 3,5,9 docs/agency/results/ablation-3000.json`. Deterministic.
  It covers seeds 3, 5 and 9 × {learning, frozen} × {communication on, off}, plus seed 3 with bush food in the 3×3 starting chunks depleted. **Item ledger errors: 0 in all 14 runs.** Re-run for this revision; the numbers below are the current engine.
* Benchmark: `tests/load/living-bench.mjs <pop> 600` → `results/bench-schema5-*.json` (schema-5 numbers from the previous measurement; this revision adds one range check, one capacity check and one bounded feedback call per settled response).

### Results (raw numbers in `results/ablation-3000.json`, re-run after the revision fixes)

| Run (3000 ticks) | Pop | Deaths | Planted / harvested / withered | Help tend / provision / repair | Signals sent / heard / misheard / responses | Mean learned response payoff | Distinct first steps |
|---|---|---|---|---|---|---|---|
| s3 learn+comm | 39 | 0 | 30 / 57 / 11 | 56 / 0 / 0 | 902 / 1915 / 274 / 210 | −0.006 | 42 |
| s3 learn, no comm | 41 | 0 | 18 / 27 / 8 | 43 / 0 / 0 | 0 | — | 50 |
| s3 frozen+comm | 44 | 0 | 0 / 0 / 0 | 0 / 0 / 0 | 376 / 1070 / 133 / 122 | — | 48 |
| s3 frozen, no comm | 47 | 0 | 5 / 6 / 3 | 5 / 0 / 0 | 0 | — | 33 |
| s5 learn+comm | 41 | 0 | 11 / 15 / 5 | 46 / 0 / 0 | 1007 / 2869 / 399 / 217 | −0.023 | 45 |
| s5 learn, no comm | 49 | 0 | 17 / 12 / 13 | 27 / 0 / 0 | 0 | — | 25 |
| s5 frozen+comm | 41 | 0 | 0 / 0 / 0 | 0 / 0 / 0 | 376 / 1261 / 151 / 119 | — | 43 |
| s5 frozen, no comm | 41 | 0 | 3 / 3 / 2 | 0 / 0 / 0 | 0 | — | 27 |
| s9 learn+comm | 39 | 0 | 28 / 18 / 20 | 38 / 0 / 0 | 1071 / 2349 / 335 / 217 | +0.009 | 60 |
| s9 learn, no comm | 37 | 0 | 25 / 33 / 9 | 51 / 0 / 0 | 0 | — | 37 |
| s9 frozen+comm | 45 | 0 | 6 / 3 / 5 | 0 / 0 / 0 | 453 / 1341 / 184 / 162 | — | 42 |
| s9 frozen, no comm | 47 | 0 | 6 / 9 / 3 | 16 / 0 / 0 | 0 | — | 36 |
| s3 depleted, learn+comm | 31 | 0 | 20 / 30 / 6 | 48 / 0 / 0 | 832 / 1531 / 192 / 193 | +0.107 | 57 |
| s3 depleted, learn, no comm | 38 | 0 | 10 / 21 / 1 | 18 / 0 / 0 | 0 | — | 28 |

Longer single run (seed 2, 8,000 ticks): 84 residents (62 births, 2 deaths), residents in all four biomes, 43 standing shelters,
21 fish caught, 5 **voluntary repairs of another resident's shelter**, 211 tends of others' crops, 2 fires lit, **0 cooking**.

Interpretation, stated plainly:
* Learning enabled vs frozen: learning residents plant and harvest far more (e.g. 30/57 vs 0/0 on seed 3) and eat more.
  The frozen arm is now a true no-learning baseline: outcome model, goal model, signal associations, trust and avoid
  lists all stay empty (earlier numbers still had association and strategy learning inside it). Frozen populations grow
  somewhat larger in 3,000 ticks (41–47 vs 37–49). Learning is **not** better for population on this horizon.
* Communication on vs off: signalling multiplies the number of distinct first steps (42–60 vs 25–50) because signal/respond
  are new options. **No measurable benefit was found.** Learned mean response payoff is about 0 (−0.02 to +0.11), and populations
  without communication are similar or larger. On this evidence the signals are mostly noise. Signals are about 2× more frequent
  with learning than frozen. The credit-cap test shows this is bounded (credit ≤ 0.3 × responses; signal values ≤ 0.3; signals < 25 % of decisions).
  It is not a runaway loop. Sender credit is also much rarer now — `signalCredit` totals 0.3–1.8 across 3,000 ticks —
  because an acknowledgement only reaches a sender that stayed in range and attended; that is the intended locality, not a bug.
* Frozen mode shows `primitiveDiversityBits = 0` because frozen residents never write to their outcome model. That metric is
  computed from model entries, so it is meaningless for frozen runs. Use `strategyDiversityBits` / `distinctFirstSteps` instead.

### Resource budget (x86_64, 600 ticks; `results/bench-schema5-*.json` vs `tests/results/living/bench-*-600.json`)
| Pop | Schema 5 ms/tick p50 / p95 | Schema 4 p50 / p95 | RSS MB (5 vs 4) |
|---|---|---|---|
| 24 | 1.9 / 5.2 | — | 105 |
| 100 | 7.6 / 13.6 | 4.0 / 7.6 | 155 vs 232 |
| 250 | 21.6 / 31.8 | 11.5 / 22.0 | 276 vs 409 |

Schema 5 costs about **1.9× the CPU per tick** of schema 4 (signal reception, goal updates, an extra `perceive()` on respond
arrival). At 1 tick/s it stays far inside budget here. The ARM VPS was **not** benchmarked: no access. The owner should run
`node tests/load/living-bench.mjs 100 600` there before deploying.

## Known gaps and unresolved items (not advertised as complete)
* **Client defects 1–5 are unresolved here**, as are all WORLD PRESENTATION items (state-driven farming, cooking, helping and signal animations,
  inspector panels for goals and communication, biome art). The engine exposes the data: activity states `plant, tend, harvest,
  cook, salvage, signal, respond`, `activity.helping` and `activity.glyph`, `view.crops`, `view.ruins` and `view.signals`, and inspector `goals`,
  `communication` and `knownStores`. The shipped `dist/` demo still bundles the schema-4 engine and needs a rebuild by integration.
  Old clients still validate (`v` stays 1; `living` is now 2).
* **Cooking never happened** in natural runs: fires are rare (2 in 8,000 ticks), and no resident cooked. The chain is
  mechanically implemented and tested, but its emergence has not been demonstrated.
* **Provisioning help** did not occur naturally in any run (repair help did: 5 times in 8,000 ticks).
* **Signals show no causal benefit** in these runs (see above).
* No screenshots or recordings are in this contribution (no client changes). There is no static IMD review preview update from this component.
* The ARM VPS benchmark is missing. The live world migration has not been performed (owner step).
