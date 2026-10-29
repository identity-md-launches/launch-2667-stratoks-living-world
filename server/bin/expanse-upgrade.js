#!/usr/bin/env node
// Upgrade a COPY of an Expanse data directory to the current schema (4: living world) and prove that identity,
// learned data and memories are unchanged. Default is a dry run that writes nothing.
//
//   node server/bin/expanse-upgrade.js <copied-data-dir>                 # dry run: migrate in memory, verify, simulate
//   node server/bin/expanse-upgrade.js <copied-data-dir> --write         # also keep the original under pre-migration/ and save v4
//   node server/bin/expanse-upgrade.js <copied-data-dir> --ticks 600     # simulated ticks for the dry-run check (default 300)
//
// Rollback: stop the service, then `node server/bin/restore.js`-style restore of <dir>/pre-migration/schema-<n>-tick-<t>/
// into a fresh directory and run the previous server release on it (see server/docs/LIVING.md).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { migrateExpanse, identityDigest, preserveOriginal, save, SNAPSHOT } from '../src/expanse/persist.js';
import { Expanse, EXPANSE_SCHEMA } from '../src/expanse/engine.js';

const args = process.argv.slice(2), dir = args.find((a) => !a.startsWith('--')), write = args.includes('--write');
const ticks = Number(args[args.indexOf('--ticks') + 1]) || 300;
if (!dir) { console.error('usage: expanse-upgrade.js <copied-data-dir> [--write] [--ticks N]'); process.exit(2); }
const file = path.join(dir, SNAPSHOT), man = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
const body = fs.readFileSync(file);
if (crypto.createHash('sha256').update(body).digest('hex') !== man.sha256) { console.error('snapshot checksum mismatch; refusing'); process.exit(1); }
const raw = JSON.parse(zlib.gunzipSync(body).toString('utf8')), from = raw.schema ?? 1;
const before = identityDigest(raw);
const { state } = migrateExpanse(structuredClone(raw));
const after = identityDigest(state);
if (before !== after) { console.error('identity digest changed during migration; refusing'); process.exit(1); }
const world = Expanse.fromState(state);
// Simulate on a separate copy so the check cannot alter what is written.
const probe = Expanse.fromState(JSON.parse(JSON.stringify(world.toState())));
const t0 = process.hrtime.bigint(); probe.run(ticks); const ms = Number(process.hrtime.bigint() - t0) / 1e6;
const report = { dir, worldId: raw.id ?? null, tick: raw.tick, from, to: EXPANSE_SCHEMA, creatures: raw.creatures.length, identityDigest: after, identityUnchanged: true,
  shelters: world.shelters.length, fishStocksAdded: state.migrations?.at(-1)?.fishStocksAddedToSavedChunks ?? 0,
  dryRun: { ticks, msPerTick: Math.round(ms / ticks * 1000) / 1000, populationAfter: probe.creatures.length, rssMB: Math.round(process.memoryUsage().rss / 1048576) }, wrote: false };
if (write && from < EXPANSE_SCHEMA) {
  report.originalKeptAt = preserveOriginal(dir, body, man, from);
  report.saved = save(dir, world); report.wrote = true;
}
console.log(JSON.stringify(report, null, 1));
