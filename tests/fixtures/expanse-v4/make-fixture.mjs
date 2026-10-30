// Produced with the schema-4 engine at commit c794a2a (before schema 5). Run from the repo root at that commit:
//   node tests/fixtures/expanse-v4/make-fixture.mjs tests/fixtures/expanse-v4
import { Expanse } from '../../../server/src/expanse/engine.js';
import { save } from '../../../server/src/expanse/persist.js';
const e = Expanse.create({ initialCount: 24 }, { seed: 20261030 });
e.id = 'world-fixture-v4';
e.run(3000);
console.log('pop', e.creatures.length, 'shelters', e.shelters.length, 'tick', e.tick);
save(process.argv[2], e);
