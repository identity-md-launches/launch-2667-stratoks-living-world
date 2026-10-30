// CPU/RSS bench for the current Expanse engine (schema 5). Usage: node tests/load/living-bench.mjs <population> <ticks> [seed]
// Population is the initial count; the world then evolves freely (births/deaths). Reports per-tick timing.
import { Expanse } from '../../server/src/expanse/engine.js';
import { frame } from '../../server/src/expanse/view.js';
const pop = Number(process.argv[2] ?? 24), N = Number(process.argv[3] ?? 600), seed = Number(process.argv[4] ?? 20260101);
const e = Expanse.create({ initialCount: pop }, { seed });
const times = []; const c0 = process.cpuUsage();
for (let i = 0; i < N; i++) { const a = process.hrtime.bigint(); e.step(); times.push(Number(process.hrtime.bigint() - a) / 1e6); }
const cpu = process.cpuUsage(c0); times.sort((a, b) => a - b);
const fa = process.hrtime.bigint(); const f = JSON.stringify(frame(e, { x: 0, y: 0, w: 80, h: 80, creature: e.creatures[0]?.id ?? null })); const frameMs = Number(process.hrtime.bigint() - fa) / 1e6;
const q = (p) => Math.round(times[Math.min(times.length - 1, Math.floor(p * times.length))] * 1000) / 1000;
console.log(JSON.stringify({ initialPopulation: pop, finalPopulation: e.creatures.length, ticks: N, msPerTick: { p50: q(0.5), p95: q(0.95), max: q(1) }, cpuUserMs: Math.round(cpu.user / 1000), cpuSystemMs: Math.round(cpu.system / 1000),
  rssMB: Math.round(process.memoryUsage().rss / 1048576), heapMB: Math.round(process.memoryUsage().heapUsed / 1048576), frameMs: Math.round(frameMs * 100) / 100, frameBytes: f.length, budgetAt1000msTick: q(0.95) < 250 ? 'within (p95 < 25% of a 1 s tick)' : 'over', node: process.version, arch: process.arch }));
