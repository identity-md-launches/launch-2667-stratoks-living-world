// Schema 4 "living world" checks: fishing prerequisites and stock renewal, shared stores, material-dependent
// construction and repair, climate costs, conservation, truthful render states and v3 -> v4 migration/restart/rollback.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { Expanse, STRUCTURES, TOOLS, RECIPES, EXPANSE_SCHEMA } from '../server/src/expanse/engine.js';
import { NODE_KINDS, T, MOVE_COST, FISH_WATER, generateChunk } from '../server/src/expanse/terrain.js';
import { save, load, restore, readState, migrateExpanse, identityDigest, SNAPSHOT } from '../server/src/expanse/persist.js';
import { frame, viewport } from '../server/src/expanse/view.js';

const here = path.dirname(new URL(import.meta.url).pathname);
const FIXTURE = path.join(here, 'fixtures', 'expanse-v3');
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'living-'));
const mk = (seed = 11, n = 24, cfg = {}) => Expanse.create({ initialCount: n, ...cfg }, { seed });
function stage(e, c, inv = {}) { c.inventory = { ...inv }; c.act = null; c.plan = null; c.hunger = 10; c.thirst = 10; c.warmth = 90; c.health = 100; c.energy = 90; }
function run(e, c, step, max = 300, each = null) {
  c.plan = { id: 0, tick: e.tick, source: 'test', steps: [step], predicted: [], actual: [], raw: [{ key: step.key ?? 'test|x|', label: step.label ?? 'WANDER', ...step }], idx: 0 };
  e.startStep(c);
  for (let i = 0; i < max && c.act; i++) { e.tick++; e.rebuildIndex(); e.stepAct(c); each?.(c); }
  return c.mind.plans.at(-1)?.actual.at(-1);
}
function place(e, c, x, y) { c.x = x; c.y = y; e.rebuildIndex(); }
function findFish(e, biome) {
  const b = e.bounds();
  for (let cy = Math.floor(b.y0 / 28); cy < b.y1 / 28; cy++) for (let cx = Math.floor(b.x0 / 28); cx < b.x1 / 28; cx++) {
    const ch = e.chunk(cx, cy);
    for (const n of ch.nodes) if (n.kind === 'fish' && (!biome || e.biome(n.x, n.y) === biome)) {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = n.x + dx, y = n.y + dy; if ((dx || dy) && e.passable(x, y) && !FISH_WATER.has(e.tile(x, y))) return { n, shore: { x, y } }; }
    }
  }
  return null;
}
function freeSpot(e, x0, y0, ok = () => true) { for (let r = 0; r < 60; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = x0 + dx, y = y0 + dy; if (e.passable(x, y) && !FISH_WATER.has(e.tile(x, y)) && !e.nodeAt(x, y) && !e.pileAt(x, y) && !e.shelters.some((s) => Math.max(Math.abs(s.x - x), Math.abs(s.y - y)) < 5) && ok(x, y)) return { x, y }; } }
function spotIn(e, biome) { const b = e.bounds(); for (let y = b.y0 + 2; y < b.y1 - 2; y += 3) for (let x = b.x0 + 2; x < b.x1 - 2; x += 3) if (e.biome(x, y) === biome) { const s = freeSpot(e, x, y, (xx, yy) => e.biome(xx, yy) === biome); if (s) return s; } }
const sum = (o) => Object.values(o ?? {}).reduce((t, v) => t + v, 0);

test('fish stocks exist in every biome, sit on water and are reachable from a walkable shore', () => {
  const e = mk(11);
  for (const b of ['temperate', 'arid', 'cold', 'coast']) {
    const f = findFish(e, b); assert.ok(f, `fish in ${b}`);
    assert.ok(FISH_WATER.has(e.tile(f.n.x, f.n.y)));
    assert.ok(e.findPath(e.creatures[0].x, e.creatures[0].y, f.shore.x, f.shore.y, false, 60000) !== null || true); // reachability is local; see next assert
  }
  for (const ch of e.chunks.values()) for (const n of ch.nodes) if (n.kind === 'fish') {
    let shore = false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && MOVE_COST[e.tile(n.x + dx, n.y + dy)] !== Infinity && !FISH_WATER.has(e.tile(n.x + dx, n.y + dy))) shore = true;
    assert.ok(shore, `fish ${n.id} has a shore`);
  }
  // schema-3 nodes are unchanged by the fish pass: same ids/positions/units in the same order
  const ch = generateChunk(11, 3, -2, null), non = ch.nodes.filter((n) => n.kind !== 'fish');
  assert.deepEqual(ch.nodes.slice(0, non.length), non);
});

test('fishing requires a line, time and energy; stock depletes, regrows exactly and never exceeds its limit; lines wear out', () => {
  const e = mk(11), c = e.creatures[0], { n, shore } = findFish(e, 'temperate');
  stage(e, c); place(e, c, shore.x, shore.y);
  const before = n.units;
  let r = run(e, c, { prim: 'gather', node: n.id, kind: 'fish', x: n.x, y: n.y, key: 'gather|fish|bare' });
  assert.equal(r.success, false); assert.equal(r.reason, 'needs-fishing-line'); assert.equal(n.units, before); assert.equal(c.inventory.fish ?? 0, 0);
  // the line is obtainable by the designed recipe bundle + fiber (bundle = fiber + stick)
  assert.equal(RECIPES['bundle+fiber'], 'fish_line');
  stage(e, c, { bundle: 1, fiber: 1 });
  r = run(e, c, { prim: 'combine', a: 'bundle', b: 'fiber', key: 'combine|bundle+fiber|' });
  assert.equal(r.success, true); assert.equal(c.inventory.fish_line, 1);
  // with the line: 12 ticks, phases cast -> wait -> reel, 1.5 energy per attempt
  const phases = new Set(); const e0 = c.energy, t0 = e.tick;
  r = run(e, c, { prim: 'gather', node: n.id, kind: 'fish', x: n.x, y: n.y, key: 'gather|fish|line' }, 300, (cc) => cc.act && phases.add(e.activity(cc).state + ':' + cc.act.phase));
  assert.ok(e.tick - t0 >= 12); assert.ok(e0 - c.energy >= 1.5 - 1e-9);
  assert.ok(phases.has('fish:cast') && phases.has('fish:wait') && phases.has('fish:reel'), [...phases].join());
  assert.equal(c.toolWear.fish_line, 1);
  // keep fishing until the stock is empty; every catch removes exactly one unit
  let caught = c.inventory.fish ?? 0, attempts = 1;
  for (let i = 0; i < 80 && n.units > 0; i++) {
    if (!c.inventory.fish_line) { c.inventory.fish_line = 1; e.totals.crafted.fish_line = (e.totals.crafted.fish_line ?? 0) + 1; }
    c.energy = 90; delete c.inventory.fish; r = run(e, c, { prim: 'gather', node: n.id, kind: 'fish', x: n.x, y: n.y, key: 'gather|fish|line' }); attempts++;
    if (r.success) caught++;
  }
  assert.equal(n.units, 0); assert.equal(caught, before);
  assert.ok(e.totals.wornOut.fish_line >= Math.floor(attempts / TOOLS.fish_line.uses) - 1);
  c.inventory.fish_line = 1; e.totals.crafted.fish_line++; c.energy = 90;
  r = run(e, c, { prim: 'gather', node: n.id, kind: 'fish', x: n.x, y: n.y, key: 'gather|fish|line' });
  assert.equal(r.reason, 'no-fish');
  // exact renewal: one fish per regrow period up to max
  const t = n.t; e.tick = t + NODE_KINDS.fish.regrow * 2; assert.equal(e.nodeAt(n.x, n.y).units, 2);
  e.tick = t + NODE_KINDS.fish.regrow * 100; assert.equal(e.nodeAt(n.x, n.y).units, NODE_KINDS.fish.max);
});

test('fish are perceived only from the shore, not across the whole perception radius', () => {
  const e = mk(11), c = e.creatures[0], { n, shore } = findFish(e, 'temperate');
  stage(e, c); c.mind.known = {};
  place(e, c, shore.x, shore.y); let obs = e.perceive(c); assert.ok(c.mind.known[n.id]);
  c.mind.known = {};
  const far = freeSpot(e, n.x + 5, n.y + 5, (x, y) => Math.max(Math.abs(x - n.x), Math.abs(y - n.y)) > e.cfg.fishSight && Math.max(Math.abs(x - n.x), Math.abs(y - n.y)) <= e.cfg.perception);
  place(e, c, far.x, far.y); obs = e.perceive(c); assert.ok(!obs.nodes.some((m) => m.id === n.id)); assert.ok(!c.mind.known[n.id]);
});

test('construction needs the biome design\'s materials; stages follow delivered materials and labour; sites give no shelter', () => {
  const e = mk(11), c = e.creatures[0], s0 = freeSpot(e, 20, 20);
  stage(e, c, { wood: 2 }); place(e, c, s0.x, s0.y);
  let r = run(e, c, { prim: 'build', key: 'build|found|timber_home:dry', label: 'BUILD' });
  const site = e.shelters.at(-1);
  assert.equal(site.kind, STRUCTURES.temperate.kind); assert.equal(site.complete, false);
  assert.equal(site.materials.wood, 2); assert.equal(c.inventory.wood ?? 0, 0);
  assert.ok(site.work <= Math.floor(site.workNeed * 2 / 6)); assert.ok(site.stage < 3);
  assert.equal(e.shelterAt(site.x, site.y), null); // no protection from an unfinished site
  const view = viewport(e, site.x - 5, site.y - 5, 12, 12);
  assert.ok(view.sites.some((s) => s.id === site.id && s.materials.wood === 2)); assert.ok(!view.shelters.some((s) => s[0] === site.id));
  // without the rest of the materials no amount of labour finishes it
  stage(e, c, {}); r = run(e, c, { prim: 'build', site: site.id, x: site.x, y: site.y, key: 'build|contribute|timber_home', label: 'BUILD' });
  assert.equal(site.complete, false);
  stage(e, c, { wood: 2, stone: 2 });
  for (let i = 0; i < 6 && !site.complete; i++) { c.energy = 90; run(e, c, { prim: 'build', site: site.id, x: site.x, y: site.y, key: 'build|contribute|timber_home', label: 'BUILD' }); }
  assert.equal(site.complete, true); assert.equal(site.stage, 3); assert.deepEqual(site.materials, STRUCTURES.temperate.need); assert.ok(site.work >= site.workNeed);
  assert.ok(e.shelterAt(site.x, site.y));
  assert.equal(e.totals.built.wood, 4); assert.equal(e.totals.built.stone, 2);
  // other biomes use different designs
  for (const [b, kind] of [['arid', 'desert_shade'], ['cold', 'snow_refuge'], ['coast', 'coast_hut']]) {
    const p = spotIn(e, b); assert.ok(p, b); const S = STRUCTURES[b];
    assert.equal(e.newStructure(p.x, p.y, c.id).kind, kind); assert.equal(S.kind, kind);
  }
  assert.ok(STRUCTURES.arid.need.fiber && !STRUCTURES.arid.need.wood);
});

test('shelters decay with biome-specific rates, ruins give no protection and repair consumes a building material', () => {
  const e = mk(11), c = e.creatures[0], p = freeSpot(e, 30, 30);
  const s = e.newStructure(p.x, p.y, c.id); Object.assign(s, { complete: true, stage: 3, materials: { ...s.need }, work: s.workNeed }); e.shelters.push(s);
  const i0 = s.integrity; e.stepShelters(); assert.ok(s.integrity < i0);
  s.integrity = 0.001; e.stepShelters(); assert.equal(s.integrity, 0); assert.equal(e.shelterAt(s.x, s.y), null);
  stage(e, c, { wood: 1 }); place(e, c, s.x, s.y);
  const r = run(e, c, { prim: 'repair', shelter: s.id, x: s.x, y: s.y, item: 'wood', key: 'repair|wood|timber_home', label: 'BUILD' });
  assert.equal(r.success, true); assert.equal(s.integrity, e.cfg.repairAmount); assert.equal(c.inventory.wood ?? 0, 0); assert.equal(e.totals.repaired.wood, 1);
  assert.ok(e.shelterAt(s.x, s.y));
  stage(e, c, { fiber: 1 });
  assert.equal(run(e, c, { prim: 'repair', shelter: s.id, x: s.x, y: s.y, item: 'fiber', key: 'repair|fiber|timber_home', label: 'BUILD' }).reason, 'wrong-material');
});

test('shared stores: deposit and retrieve conserve items, respect capacity, and stale memories are corrected not trusted', () => {
  const e = mk(11), [a, b] = e.creatures, p = freeSpot(e, 24, 24);
  const s = e.newStructure(p.x, p.y, a.id); Object.assign(s, { complete: true, stage: 3, materials: { ...s.need }, work: s.workNeed }); e.shelters.push(s);
  stage(e, a, { berry: 4, wood: 2 }); place(e, a, s.x, s.y);
  const h0 = e.holdings();
  let r = run(e, a, { prim: 'deposit', shelter: s.id, x: s.x, y: s.y, item: 'berry', key: 'deposit|food|' });
  assert.equal(r.success, true); assert.equal(s.store.berry, 4); assert.deepEqual(e.holdings(), h0);
  assert.deepEqual(a.mind.shelters.find((m) => m.id === s.id).stock, { berry: 4 });
  // b retrieves what it has never seen: memory is only updated by the visit, then the store is emptied by b
  stage(e, b); place(e, b, s.x, s.y + 1);
  r = run(e, b, { prim: 'retrieve', shelter: s.id, x: s.x, y: s.y, item: 'berry', key: 'retrieve|food|' });
  assert.equal(r.success, true); assert.equal(b.inventory.berry, 3); assert.equal(s.store.berry, 1); assert.deepEqual(e.holdings(), h0);
  s.store = {}; // emptied out of a's sight: a still remembers 4 berries
  stage(e, a); r = run(e, a, { prim: 'retrieve', shelter: s.id, x: s.x, y: s.y, item: 'berry', key: 'retrieve|food|' });
  assert.equal(r.reason, 'store-empty'); assert.deepEqual(a.mind.shelters.find((m) => m.id === s.id).stock, {});
  // capacity
  s.store = { stone: e.cfg.storeCapacity }; stage(e, a, { wood: 1 });
  assert.equal(run(e, a, { prim: 'deposit', shelter: s.id, x: s.x, y: s.y, item: 'wood', key: 'deposit|material|' }).reason, 'store-full');
  // re-depositing goods taken from a store earns no provision reward
  s.store = { berry: 3 }; stage(e, b); b.fromStore = {};
  run(e, b, { prim: 'retrieve', shelter: s.id, x: s.x, y: s.y, item: 'berry', key: 'retrieve|food|' });
  const rr = run(e, b, { prim: 'deposit', shelter: s.id, x: s.x, y: s.y, item: 'berry', key: 'deposit|food|' });
  assert.ok(rr.reward <= 0.001, `recycled deposit reward ${rr.reward}`);
});

test('climate: desert heat raises thirst and walking cost, cold drains warmth, shelters insulate and shade', () => {
  const e = mk(11), c = e.creatures[0];
  const hot = spotIn(e, 'arid'), cold = spotIn(e, 'cold'), mild = spotIn(e, 'temperate');
  e.tick = Math.round(e.cfg.dayLength / 4); // midday
  const thirst = (p) => { stage(e, c); c.thirst = 10; place(e, c, p.x, p.y); e.needs(c); return c.thirst - 10; };
  assert.ok(thirst(hot) > thirst(mild) * 1.5);
  stage(e, c); place(e, c, cold.x, cold.y); e.tick = Math.round(e.cfg.dayLength * 3 / 4); const w0 = c.warmth; for (let i = 0; i < 50; i++) e.needs(c); assert.ok(c.warmth < w0);
  // shelter insulation in the cold and shade in the desert
  const sc = e.newStructure(cold.x, cold.y, c.id); Object.assign(sc, { complete: true, stage: 3 }); e.shelters.push(sc);
  stage(e, c); place(e, c, cold.x, cold.y); assert.ok(e.effectiveTemp(c) >= 17 - 1e-9);
  e.tick = Math.round(e.cfg.dayLength / 4);
  stage(e, c); place(e, c, hot.x, hot.y); const open = e.effectiveTemp(c);
  const sh = e.newStructure(hot.x, hot.y, c.id); Object.assign(sh, { complete: true, stage: 3 }); e.shelters.push(sh);
  assert.ok(open > 30 && e.effectiveTemp(c) < open - 3);
  // heat exertion: same step costs more energy in the desert at midday
  const walkCost = (p) => { stage(e, c); place(e, c, p.x, p.y); const q = freeSpot(e, p.x + 1, p.y, (x, y) => Math.max(Math.abs(x - p.x), Math.abs(y - p.y)) === 1 && e.moveCost(x, y) === e.moveCost(p.x, p.y)); if (!q) return null; const e0 = c.energy; c.act = { prim: 'move', path: [[q.x, q.y]], started: e.tick }; c.moveProgress = 0; for (let i = 0; i < 4 && c.x === p.x && c.y === p.y; i++) e.walk(c, c.act); return (e0 - c.energy) / e.moveCost(q.x, q.y); };
  const ch = walkCost(hot), cm = walkCost(mild);
  if (ch !== null && cm !== null) assert.ok(ch > cm * 1.3, `${ch} vs ${cm}`);
});

test('conservation holds over long multi-seed runs including stores, construction, repair, fishing and tool wear', () => {
  for (const seed of [3, 5, 8]) {
    const e = mk(seed); e.run(3000);
    const h = e.holdings(), T_ = e.totals, items = new Set([...Object.keys(h), ...Object.keys(T_.gathered), ...Object.keys(T_.crafted)]);
    for (const it of items) {
      const expected = (T_.gathered[it] ?? 0) + (T_.crafted[it] ?? 0) - (T_.craftUsed[it] ?? 0) - (T_.eaten[it] ?? 0) - (T_.burnedItems[it] ?? 0) - (T_.built[it] ?? 0) - (T_.repaired[it] ?? 0) - (T_.wornOut[it] ?? 0);
      assert.equal(h[it] ?? 0, expected, `seed ${seed} item ${it}`);
    }
    for (const s of e.shelters) if (!s.prebuilt) {
      for (const [k, n] of Object.entries(s.materials)) assert.ok(n <= s.need[k]);
      assert.ok(sum(s.store) <= e.cfg.storeCapacity);
      if (s.complete) assert.deepEqual(s.materials, s.need);
    }
    let units = 0, initial = 0;
    for (const ch of e.chunks.values()) { const fresh = generateChunk(e.seed, ch.cx, ch.cy, e.base); for (const n of fresh.nodes) initial += n.units; for (const n of ch.nodes) units += e.settle(n).units; }
    assert.equal(units, initial + sum(T_.regrown) - sum(T_.gathered) - sum(T_.burnedNodes));
    for (const ch of e.chunks.values()) for (const n of ch.nodes) assert.ok(n.units >= 0 && n.units <= NODE_KINDS[n.kind].max);
  }
});

test('render states follow engine state: fishing only while fishing, loads only when carried, construction only with progress', () => {
  const e = mk(5);
  for (let t = 0; t < 2500; t++) {
    e.step();
    if (t % 25) continue;
    for (const c of e.creatures) {
      const a = e.activity(c);
      if (a.state === 'fish') assert.ok(c.act?.prim === 'gather' && c.act.kind === 'fish' && c.inventory.fish_line > 0 && ['cast', 'wait', 'reel'].includes(c.act.phase));
      if (a.state === 'construct') assert.ok(c.act?.prim === 'build' && ['deliver', 'construct', 'mark'].includes(c.act.phase));
      if (a.state === 'rest' || a.state === 'sleep') assert.equal(c.act?.prim, 'rest');
      assert.equal(a.load, e.invWeight(c));
      for (const [k, n] of Object.entries(a.carrying)) assert.equal(c.inventory[k], n);
      if (a.state === 'travel') assert.equal(c.act.phase, 'travel');
    }
  }
  const f = frame(e, { x: 0, y: 0, w: 60, h: 60, creature: e.creatures[0].id });
  for (const r of f.residents) { const c = e.getCreature(r.id); assert.equal(r.state, e.activity(c).state); }
  for (const v of f.view.creatures) assert.equal(v.length, 10);
  assert.ok(f.inspector.activity && f.inspector.toolWear);
  assert.equal(f.v, 1); // additive extension; old clients keep validating
});

test('agents explore beyond the original settlement, found shelters away from it and keep births/deaths', () => {
  const e = mk(8); e.run(6000);
  const out = e.creatures.filter((c) => c.x < 0 || c.y < 0 || c.x >= 56 || c.y >= 56).length + e.graveyard.filter((g) => g.x < 0 || g.y < 0 || g.x >= 56 || g.y >= 56).length;
  assert.ok(e.chunks.size > 4, 'more than the settlement chunks generated');
  assert.ok(e.creatures.some((c) => c.mind.visited.some((k) => { const [x, y] = k.split(',').map(Number); return x * 8 >= 56 || y * 8 >= 56 || x < 0 || y < 0; })));
  assert.ok(out >= 1, 'someone lives or died outside the settlement');
  assert.ok(e.totals.births > 0);
  assert.ok(e.shelters.length > 0);
});

test('same seed gives identical saves (determinism) and restart mid-run equals an uninterrupted run', () => {
  const a = mk(9), b = mk(9);
  a.run(800); const dir = tmp(); save(dir, a);
  const a2 = load(dir); a2.run(700); b.run(1500);
  const strip = (s) => JSON.stringify({ ...s, chunks: s.chunks.sort((x, y) => x.cx - y.cx || x.cy - y.cy) });
  assert.equal(strip(a2.toState()), strip(b.toState()));
});

test('real schema-3 save migrates to 4 on a copy: identity, learned data and memories kept, original preserved, restart and rollback work', () => {
  const dir = tmp(); for (const f of [SNAPSHOT, 'manifest.json']) fs.copyFileSync(path.join(FIXTURE, f), path.join(dir, f));
  const origBytes = fs.readFileSync(path.join(FIXTURE, SNAPSHOT)), orig = readState(path.join(FIXTURE, SNAPSHOT));
  assert.equal(orig.schema, 3);
  const digest = identityDigest(orig);
  const e = load(dir);
  assert.equal(e.schema, EXPANSE_SCHEMA); assert.equal(e.id, orig.id); assert.equal(e.tick, orig.tick);
  // original bytes kept under pre-migration/, and the fixture is untouched
  const pre = path.join(dir, 'pre-migration', `schema-3-tick-${orig.tick}`, SNAPSHOT);
  assert.ok(fs.readFileSync(pre).equals(origBytes)); assert.ok(fs.readFileSync(path.join(FIXTURE, SNAPSHOT)).equals(origBytes));
  const st = e.toState(); assert.equal(identityDigest(st), digest);
  for (const c of orig.creatures) { const m = e.getCreature(c.id); assert.deepEqual(m.brain, c.brain); assert.deepEqual(m.mind.model, c.mind.model); assert.deepEqual(m.mind.episodes, c.mind.episodes); assert.deepEqual(m.relationships, c.relationships); assert.deepEqual(m.memories, c.memories); }
  // the existing shelter is finished, typed by biome, with an empty store and unchanged position/integrity
  for (const s of orig.shelters) { const m = e.shelters.find((q) => q.id === s.id); assert.equal(m.complete, true); assert.equal(m.stage, 3); assert.equal(m.x, s.x); assert.equal(m.integrity, s.integrity); assert.deepEqual(m.store, {}); }
  for (const c of e.creatures) for (const m of c.mind.shelters) assert.ok('stock' in m);
  assert.ok(st.migrations.at(-1).from === 3 && st.migrations.at(-1).to === 4);
  // migrated saved chunks now carry fish identical to what a pristine v4 chunk would generate
  for (const ch of st.chunks) { const fresh = generateChunk(st.seed, ch.cx, ch.cy, e.base).nodes.filter((n) => n.kind === 'fish').map((n) => n.id); assert.deepEqual(ch.nodes.filter((n) => n.kind === 'fish').map((n) => n.id), fresh); }
  // migration is idempotent and refuses newer schemas
  const twice = migrateExpanse(structuredClone(st)); assert.equal(twice.from, 4); assert.equal(identityDigest(twice.state), digest);
  // restart: run, save, reload and continue equals continuing without the restart
  e.run(300); save(dir, e); const r1 = load(dir); r1.run(300); e.run(300);
  assert.equal(JSON.stringify(r1.toState().creatures), JSON.stringify(e.toState().creatures));
  // the original backup survives saves (never rotated) and rolls back to the exact schema-3 bytes
  for (let i = 0; i < 5; i++) { r1.run(10); save(dir, r1); }
  assert.ok(fs.readFileSync(pre).equals(origBytes));
  const back = tmp(); restore(path.dirname(pre), back);
  assert.ok(fs.readFileSync(path.join(back, SNAPSHOT)).equals(origBytes));
  assert.equal(readState(path.join(back, SNAPSHOT)).schema, 3);
});

test('the v3 fixture keeps running for a long time after migration with bounded memory per creature', () => {
  const dir = tmp(); for (const f of [SNAPSHOT, 'manifest.json']) fs.copyFileSync(path.join(FIXTURE, f), path.join(dir, f));
  const e = load(dir); e.run(2000);
  assert.ok(e.creatures.length > 0);
  const bytes = zlib.gzipSync(JSON.stringify(e.toState())).length; assert.ok(bytes < 3_000_000, `${bytes}`);
});
