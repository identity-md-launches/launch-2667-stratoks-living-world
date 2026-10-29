// Multi-seed outcomes of the schema-4 living world. Usage: node tests/experiments/living-experiments.mjs <seed> <ticks>
// Prints one JSON report: population, births/deaths by cause, where residents live, fishing, stores, construction,
// repair, exploration and CPU/RSS. Nothing is forced: the world is created and stepped, never staged.
import { Expanse, STRUCTURES } from '../../server/src/expanse/engine.js';
import { BASE } from '../../server/src/expanse/terrain.js';
const seed = Number(process.argv[2] ?? 1), N = Number(process.argv[3] ?? 8000), every = 500;
const e = Expanse.create({ initialCount: 24 }, { seed });
const series = [], residentTicks = { temperate: 0, arid: 0, cold: 0, coast: 0 };
let cpu = 0, maxTick = 0;
for (let t = 1; t <= N; t++) {
  const a = process.hrtime.bigint(); e.step(); const d = Number(process.hrtime.bigint() - a) / 1e6; cpu += d; if (d > maxTick) maxTick = d;
  if (t % 50 === 0) for (const c of e.creatures) residentTicks[e.biome(c.x, c.y)] += 50;
  if (t % every === 0) { const s = e.summary(); series.push({ tick: s.tick, population: s.population, byBiome: s.byBiome, standing: s.standing, sites: s.sites, stored: s.stored, fishCaught: s.fishCaught, rssMB: Math.round(process.memoryUsage().rss / 1048576) }); }
}
const T = e.totals, kinds = {};
for (const s of e.shelters) { const k = `${s.kind}:${s.complete === false ? `stage${s.stage}` : s.integrity > 0 ? 'standing' : 'ruined'}`; kinds[k] = (kinds[k] ?? 0) + 1; }
const outside = e.shelters.filter((s) => s.x < 0 || s.y < 0 || s.x >= BASE || s.y >= BASE).length;
const learned = {}; for (const c of e.creatures) for (const [k, m] of Object.entries(c.mind.model)) if (/^(gather\|fish|build|repair|deposit|retrieve|combine\|bundle\+fiber)/.test(k)) { learned[k] ??= { creatures: 0, own: 0, meanReward: 0, meanSuccess: 0 }; const L = learned[k]; L.creatures++; L.own += m.own; L.meanReward += m.r; L.meanSuccess += m.ok; }
for (const L of Object.values(learned)) { L.meanReward = Math.round(L.meanReward / L.creatures * 1000) / 1000; L.meanSuccess = Math.round(L.meanSuccess / L.creatures * 1000) / 1000; }
console.log(JSON.stringify({ seed, ticks: N, final: e.summary(), births: T.births, deaths: T.deaths, deathsByCause: T.deathsByCause, residentTicksByBiome: residentTicks,
  gathered: T.gathered, eaten: T.eaten, crafted: T.crafted, wornOut: T.wornOut, built: T.built, repaired: T.repaired, deposited: T.deposited, retrieved: T.retrieved,
  shelters: kinds, sheltersOutsideSettlement: outside, settlementDiscoveries: e.discoveries.filter((d) => d.what.startsWith('settlement:')).length, chunksGenerated: e.chunks.size,
  learnedLivingKeys: learned, cpu: { msPerTickMean: Math.round(cpu / N * 1000) / 1000, msPerTickMax: Math.round(maxTick * 100) / 100 }, rssMB: Math.round(process.memoryUsage().rss / 1048576), series,
  platform: { node: process.version, arch: process.arch } }, null, 1));
