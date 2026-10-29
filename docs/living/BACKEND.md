# Living-world backend (Expanse schema 4)

The simulation side of the living world: fishing with an obtainable line and renewable stocks, shared shelter stores, material-dependent staged construction and repair across the four existing biomes, climate costs, truthful action/progress states for the renderer, and a tested 3→4 migration that preserves the world's identity and learned data.

* Rules, render-state contract, migration, owner upgrade and rollback, check results and limits: [`server/docs/LIVING.md`](../../server/docs/LIVING.md)
* Frame contract additions: [`shared/protocol.md`](../../shared/protocol.md) (last section); real sample frame: `shared/fixtures/living-frame.json`
* Tests: `tests/living.test.js` (run all with `cd server && npm test`); raw results: `tests/results/living/`
* Upgrade tool (dry run by default): `node server/bin/expanse-upgrade.js <copied-data-dir> [--write]`
* Experiments/bench: `node tests/experiments/living-experiments.mjs <seed> <ticks>`, `node tests/load/living-bench.mjs <population> <ticks>`

Not deployed. The live VPS was not accessed. The ARM VPS was not measured (x86_64 numbers only).
