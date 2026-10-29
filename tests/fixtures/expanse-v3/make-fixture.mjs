import { Expanse } from '<pinned-v3>/server/src/expanse/engine.js';
import { save } from '<pinned-v3>/server/src/expanse/persist.js';
const e = Expanse.create({ initialCount: 24 }, { seed: 20260101 });
e.id = 'world-fixture-v3';
e.run(2500);
// One resident builds a shelter through the v3 engine's own build primitive (materials from its inventory).
const c = e.creatures[0];
c.inventory.wood = (c.inventory.wood ?? 0) + 4; c.inventory.stone = (c.inventory.stone ?? 0) + 2;
e.totals.gathered.wood = (e.totals.gathered.wood ?? 0) + 4; e.totals.gathered.stone = (e.totals.gathered.stone ?? 0) + 2;
c.plan = { id: 0, tick: e.tick, source: 'fixture', steps: [], predicted: [], actual: [], raw: [{ prim: 'build', key: 'build|shelter|', label: 'BUILD' }], idx: 0 };
e.startStep(c); for (let i = 0; i < 40 && c.act; i++) { e.tick++; e.rebuildIndex(); e.stepAct(c); }
e.run(1500);
console.log('pop', e.creatures.length, 'shelters', JSON.stringify(e.shelters), 'built', e.totals.built, 'crafted', e.totals.crafted, 'tick', e.tick);
save(process.argv[2], e);
