// Additive observer contract: preserve engine state and residents' private knowledge.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Expanse} from '../server/src/expanse/engine.js';
import {frame,inspect} from '../server/src/expanse/view.js';
import {terrainHeight} from '../shared/relief.js';
test('relief is derived from authoritative terrain, with unchanged passability and RNG',()=>{
 const e=Expanse.create({initialCount:3},{seed:7});
 const c=e.creatures[0], before=structuredClone(c.mind),rng=e.rng.s;
 const f=frame(e,{x:-45,y:-55,w:60,h:60,creature:c.id});
 assert.equal(f.view.heights.length,f.view.tiles.length);
 for(let i=0;i<f.view.tiles.length;i++)assert.equal(f.view.heights[i],terrainHeight(f.view.tiles[i]));
 assert.ok(f.view.tiles.includes(7));
 assert.equal(e.rng.s,rng);assert.deepEqual(c.mind,before,'observer relief cannot give knowledge to agents');
 assert.equal(inspect(e,c.id).knownStores.length,0);
});
test('view carries exact working phase, helping target, food input and actual heat, without inventory invention',()=>{
 const e=Expanse.create({initialCount:2},{seed:5});const c=e.creatures[0];
 c.inventory={wood:1,hand_axe:1};c.act={prim:'repair',phase:'repair',work:2,x:c.x,y:c.y,item:'wood',help:e.creatures[1].id};
 const f=frame(e,{x:c.x-2,y:c.y-2,w:8,h:8,creature:c.id});
 const r=f.residents.find(r=>r.id===c.id);
 assert.equal(r.state,'repair');assert.equal(r.phase,'repair');assert.equal(r.helping,e.creatures[1].id);assert.equal(r.item,'wood');
 assert.deepEqual(r.tools,['hand_axe']);assert.deepEqual(r.carrying,{wood:1});
 assert.deepEqual(f.view.fireState,[]);assert.deepEqual(f.view.crops,[]);
 assert.ok(f.inspector.goals);assert.ok(f.inspector.communication);
});
