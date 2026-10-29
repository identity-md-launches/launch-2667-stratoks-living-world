// Writes a REAL engine frame (not hand-written) for renderer integration: seed 3, stepped until a resident is
// actually fishing, viewport centred on it. Usage: node tests/experiments/living-sample-frame.mjs <out.json>
import fs from 'node:fs';
import { Expanse } from '../../server/src/expanse/engine.js';
import { frame } from '../../server/src/expanse/view.js';
const e = Expanse.create({ initialCount: 24 }, { seed: 3 });
let who = null;
for (let t = 0; t < 20000 && !who; t++) { e.step(); if (t > 4000) who = e.creatures.find((c) => e.activity(c).state === 'fish' && e.activity(c).phase === 'reel') ?? null; }
const f = frame(e, { x: who.x - 24, y: who.y - 16, w: 48, h: 32, creature: who.id });
f.sample = { generatedBy: 'tests/experiments/living-sample-frame.mjs', seed: 3, note: 'Real engine output from an isolated test world; not the live world and not hand-edited.' };
fs.writeFileSync(process.argv[2], JSON.stringify(f, null, 1));
console.log(e.tick, who.id, e.activity(who), f.view.sites.length, f.view.piles.length, f.view.stores.length, f.view.shelters.length);
