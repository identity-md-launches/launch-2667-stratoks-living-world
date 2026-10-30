# Owner installation: living observer and schema-5 service

Nothing in this contribution was deployed to the VPS. Run all review/migration/restart work on a **copy** first. Never install either `web/public/demo/checkpoint.json.gz` or `web/public/demo/agency-checkpoint.json.gz` as an owner save: it is a separate seed-2 demo world.

## Static frontend

Install Node 22.12+, use the existing `web/package-lock.json`, run `npm ci`, typecheck/test/build, then serve the complete `dist/` directory. Gateway subpaths require no rewrite: asset URLs are relative. Keep `dist/demo/` for the isolated browser mode and all `dist/art/` runtime assets. Serve `.js` as JavaScript and `.wasm` if future assets require it; the current checkpoint is a plain gzip **file**, not an HTTP `Content-Encoding:gzip` response. Disable automatic decompression for that file or preserve its compressed bytes, since its checksum is verified by the browser.

For a same-origin service, set `dist/expanse-config.json` to the owner HTTPS base URL, `startMode:"live"`, `legacyAvailable:false`. Mirror that choice in `web/public/expanse-config.json` before the next rebuild. To host the observer on a different origin, the backend must explicitly allow that exact origin. There are no credentials in the frontend and no writable viewer endpoints.

## Copy, back up, migrate

1. Stop the existing owner service through the owner's normal process manager so its final atomic save completes.
2. Copy the **whole** data directory, including `expanse.json.gz`, `manifest.json`, previous generations and any original/pre-migration backups, to separate storage. Keep the original tree unchanged.
3. Review the copy with `node server/bin/expanse-upgrade.js /absolute/path/to/copied-world` (dry run). It reports schema/identity and refuses unknown/newer snapshots.
4. On the copy only, use the same command with `--write`. The versioned migrations through schema 5 preserve the exact original snapshot+manifest under `pre-migration/`. Schema 4→5 adds empty crops/signals and bounded per-resident goals, trust, associations and observed-home defaults. Existing remembered stocks are preserved as unverified historical memory until interaction. Earlier 3→4 defaults apply only if needed. It keeps the world ID, seed/tick/RNG, residents, brains, weights, families, relationships, memories and modified terrain. The identity digest must remain unchanged.
5. Start the copied world on an unused local port; inspect `/healthz` and `/api/expanse/frame`, stop it cleanly, restart it and verify the ID and advancing tick. Run the included tests before planning an owner rollout.

Legacy Phase-2A saves require the existing `server/bin/expanse-migrate.js` path first; read its dry-run documentation in `server/docs/LIVING.md`. It refuses lossy conversions, including unsupported active legacy fires/storms and unfinished legacy shelters. Never convert by creating fresh founders or by importing this demo.

## Local service on a review copy

The backend uses only Node built-ins. No server dependency installation, inference service or paid API is needed.

```sh
EXPANSE_DATA_DIR=/absolute/path/to/copied-world PORT=8789 HOST=127.0.0.1 TICK_MS=1000 node server/src/expanse/server.js
```

These are task-specific environment settings; set their values for the owner installation. `ALLOWED_ORIGINS` is a comma-separated list of exact allowed viewer origins. Leave it empty for same-origin access. For a deliberately **new isolated** world in an empty directory, `WORLD_SEED` and `INITIAL_SEED_COUNT` choose its founders; these never replace an existing saved world's seed or population. Do not use an empty/new directory when upgrading an existing world.

The service saves at its existing interval and on SIGINT/SIGTERM. Its public routes are read-only GET/HEAD; writes return 405. `/api/expanse/frame?x=0&y=0&w=48&h=32` contains one coherent tick, roster, view, minimap and optional `creature=<id>` inspector. Viewer disconnection does not stop the world. The scheduler slows under load rather than removing residents or bursting catch-up ticks.

## Rollback and restart

Stop the copied test service before replacing files. Restore the matching pre-migration snapshot **and** manifest from the preserved backup with the matching older backend version. The existing persistence helpers also offer checksummed backup/restore and previous-generation rollback. Do not restore only one file, mix schema versions, or delete the preserved original. A schema-5 binary refuses newer snapshots and migrates supported older ones. For a full rollback, restore the matching pre-migration pair into a fresh directory and use the exact previous binary. A schema-4 binary must never read a schema-5 save.

Tests `tests/living.test.js` and `tests/expanse.test.js` exercise checksum refusal, copied-world migration, byte-preserved originals, identity digests, deterministic continuation, backup/restore and rollback. `tests/living-interface.test.js` verifies portable browser decode against the same save representation. The preceding schema-5 migration is tested in `tests/agency.test.js`. This integration adds observer-only `heights`, fire fuel, crop water reach and complete activity data. `tests/agency-demo.test.js` also verifies the original gzip hash, deterministic upgraded copy and exact restart. No owner world was available or accessed here.

## Capacity and limits

Use the actual x64 CPU/RSS reports in `artifacts/agency-interface/` as local measurements only. The ARM VPS was neither accessed nor benchmarked. Learning histories, spatial caches and per-tick decision work are bounded, but a naturally growing population can still increase total CPU/RSS. Monitor the owner service and storage through the owner's normal process manager; there is no arbitrary population cull. Keep backups before any eventual owner-approved rollout.

Before any owner rollout, run `node tests/load/living-bench.mjs 100 600` and the 250-resident variant on the actual ARM host, on copies only. Review p95/max tick time, RSS, save size, retained backups and gradual population growth. Browser demo success is not a live-backend capacity or migration approval.
