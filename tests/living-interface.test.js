import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { Expanse } from '../server/src/expanse/engine.js';
import { frame } from '../server/src/expanse/view.js';
import { identityDigest, migrateExpanse } from '../server/src/expanse/persist.js';

test('portable browser restore preserves the exact owner save representation and deterministic continuation',()=>{
 const e=Expanse.create({initialCount:8},{seed:17}); e.id='portable-restore-test';for(let i=0;i<120;i++)e.step();
 const saved=e.toState(),node=Expanse.fromState(saved);let portable;
 const NativeBuffer=globalThis.Buffer;
 try{globalThis.Buffer=undefined;portable=Expanse.fromState(saved);}finally{globalThis.Buffer=NativeBuffer;}
 assert.deepEqual(portable.toState(),node.toState());
 assert.equal(identityDigest(portable.toState()),identityDigest(saved));
 for(let i=0;i<60;i++){node.step();portable.step();}
 assert.deepEqual(portable.toState(),node.toState());
});
test('living viewport biome, climate, construction and store fields describe the same engine without exposing knowledge to agents',()=>{
 const e=Expanse.create({initialCount:6},{seed:2});for(let i=0;i<400;i++)e.step();
 const before=JSON.stringify(e.toState()),f=frame(e,{x:20,y:-4,w:20,h:20,creature:e.creatures[0].id});
 assert.equal(f.view.biomes.length,400);
 for(let j=0;j<20;j++)for(let i=0;i<20;i++)assert.equal(f.view.biomes[j*20+i],e.biome(20+i,-4+j));
 assert.equal(f.view.tick,f.tick);assert.equal(f.view.climate.rain,e.weather.rain);
 assert.equal(f.places.length,e.shelters.length);
 for(const p of f.places){const s=e.shelters.find(s=>s.id===p.id);assert.equal(p.stored,Object.values(s.store??{}).reduce((a,b)=>a+b,0));}
 assert.equal(JSON.stringify(e.toState()),before,'observer-only fields must not edit the persistent state');
 assert.equal(e.creatures[0].lastObs.places,undefined,'world navigation must not enter individual perceptions');
});
test('shipped demo (schema-4 checkpoint, migrated in memory to 5) is a complete world with natural histories and functional shelters across all biomes',()=>{
 const manifest=JSON.parse(fs.readFileSync(new URL('../web/public/demo/manifest.json',import.meta.url)));
 const saved=JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('../web/public/demo/checkpoint.json.gz',import.meta.url))));
 const e=Expanse.fromState(migrateExpanse(structuredClone(saved)).state);
 assert.equal(e.id,'isolated-demo-seed-2');assert.equal(e.tick,12000);
 assert.equal(e.creatures.length,manifest.summary.population);
 assert.equal(e.totals.births-e.totals.deaths+24,e.creatures.length);
 for(const biome of ['temperate','arid','cold','coast'])assert.ok(e.shelters.some(s=>s.biome===biome&&s.complete));
 assert.ok(e.creatures.some(c=>c.mind.episodes.length&&c.brain.mb.updates));
 assert.ok(e.creatures.some(c=>c.parents?.length));assert.ok(e.graveyard.length);
 for(const c of e.creatures)assert.ok(e.invWeight(c)<=e.cfg.invCapacity);
 const id=identityDigest(saved);e.step();assert.equal(saved.tick,12000);assert.equal(identityDigest(saved),id);
});
