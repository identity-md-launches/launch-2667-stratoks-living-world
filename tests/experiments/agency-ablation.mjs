// Schema 5 ablation experiment: fixed seeds x {learning on/frozen} x {communication on/off}, plus a depleted-food run.
// Usage: node tests/experiments/agency-ablation.mjs [ticks=3000] [seeds=3,5,9] [out.json]
// Reports raw per-run numbers; no smoothing, no selection. Deterministic: rerunning gives identical output.
import fs from 'node:fs';
import { Expanse, expectedHoldings } from '../../server/src/expanse/engine.js';
import { NODE_KINDS } from '../../server/src/expanse/terrain.js';

const ticks = Number(process.argv[2] ?? 3000);
const seeds = (process.argv[3] ?? '3,5,9').split(',').map(Number);
const out = process.argv[4] ?? null;
const sum = (o) => Object.values(o ?? {}).reduce((t, v) => t + v, 0);
const entropy = (counts) => { const n = sum(counts); return n ? -Object.values(counts).reduce((h, v) => h + (v / n) * Math.log2(v / n), 0) : 0; };

function deplete(e) { // remove every bush/deadfall unit in the starting chunks, booked as burned so the ledger stays exact
  for (let cy = 0; cy < 3; cy++) for (let cx = 0; cx < 3; cx++) for (const n of e.chunk(cx, cy).nodes) if (n.kind === 'bush') {
    const it = NODE_KINDS[n.kind].item; e.totals.burnedNodes[it] = (e.totals.burnedNodes[it] ?? 0) + e.settle(n).units; n.units = 0; n.t = e.tick; e.chunk(cx, cy).dirty = true;
  }
}

function one(seed, cfg, label, depleted = false) {
  const e = Expanse.create({ initialCount: 24, ...cfg }, { seed });
  if (depleted) deplete(e);
  const t0 = process.hrtime.bigint(); e.run(ticks); const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  const T_ = e.totals, prims = {}, firstKeys = {}, goals = {};
  for (const c of e.creatures) {
    for (const [k, m] of Object.entries(c.mind.model)) { const p = k.split('|')[0]; prims[p] = (prims[p] ?? 0) + m.n; }
    for (const pl of c.mind.plans) { const k = pl.steps?.[0]?.key; if (k) firstKeys[k] = (firstKeys[k] ?? 0) + 1; }
    for (const h of c.mind.goalHistory) goals[`${h.kind}:${h.how}`] = (goals[`${h.kind}:${h.how}`] ?? 0) + 1;
  }
  const h = e.holdings(), exp = expectedHoldings(T_);
  const ledgerErrors = [...new Set([...Object.keys(h), ...Object.keys(exp)])].filter((k) => (h[k] ?? 0) !== (exp[k] ?? 0));
  const responders = e.creatures.filter((c) => Object.values(c.mind.signals).some((a) => a.n > 0));
  const conf = responders.flatMap((c) => Object.values(c.mind.signals).filter((a) => a.n > 0).map((a) => a.payoff));
  const s = e.summary();
  return {
    label, seed, depleted, ticks, msPerTick: +(ms / ticks).toFixed(3), heapMB: +(process.memoryUsage().heapUsed / 1048576).toFixed(1),
    population: s.population, births: s.births, deaths: s.deaths, deathsByCause: T_.deathsByCause,
    meanHunger: +(e.creatures.reduce((t, c) => t + c.hunger, 0) / Math.max(1, e.creatures.length)).toFixed(1),
    food: { gathered: (T_.gathered.berry ?? 0) + (T_.gathered.fish ?? 0) + (T_.gathered.cactus_fruit ?? 0), eaten: sum(T_.eaten), fish: T_.gathered.fish ?? 0 },
    farming: { planted: sum(T_.planted), harvested: sum(T_.harvested), withered: sum(T_.withered), standingCrops: e.crops.length },
    cooking: { cooked: sum(T_.cookedOut), heatUsed: T_.heatUsed },
    help: T_.helped, salvaged: sum(T_.salvaged), shelters: s.standing, sites: s.sites, ruins: s.ruins,
    signals: { sent: T_.signals, heard: T_.signalsHeard, misheard: T_.signalsMisheard, responses: T_.responses, credit: +T_.signalCredit.toFixed(3), residentsWithAssociations: responders.length, meanLearnedPayoff: conf.length ? +(conf.reduce((a, b) => a + b, 0) / conf.length).toFixed(3) : null },
    goals, primitiveDiversityBits: +entropy(prims).toFixed(3), strategyDiversityBits: +entropy(firstKeys).toFixed(3), distinctFirstSteps: Object.keys(firstKeys).length,
    ledgerErrors,
  };
}

const conds = [['learn+comm', {}], ['frozen+comm', { mode: 'frozen' }], ['learn-nocomm', { communication: false }], ['frozen-nocomm', { mode: 'frozen', communication: false }]];
const rows = [];
for (const seed of seeds) for (const [label, cfg] of conds) { rows.push(one(seed, cfg, label)); console.error(JSON.stringify(rows.at(-1))); }
for (const seed of seeds.slice(0, 1)) for (const [label, cfg] of conds.slice(0, 1).concat(conds.slice(2, 3))) { rows.push(one(seed, cfg, label + '+depleted', true)); console.error(JSON.stringify(rows.at(-1))); }
const result = { generated: 'deterministic; rerun with the same arguments to reproduce', node: process.version, arch: process.arch, ticks, seeds, rows };
if (out) fs.writeFileSync(out, JSON.stringify(result, null, 1));
else console.log(JSON.stringify(result, null, 1));
