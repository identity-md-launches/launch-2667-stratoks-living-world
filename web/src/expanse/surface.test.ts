import test from 'node:test';
import assert from 'node:assert/strict';
import { surfaceGeometry, projectSurface, pickSurface } from './surface';
import { terrainHeight, exposedFaces } from '../../../shared/relief.js';
import { clampCamera, DEFAULT_BOUNDS, viewportQuery } from './projection';
import type {WorldFrame} from './types';
function frame(x0:number,y0:number,w=12,h=12):WorldFrame{return {bounds:DEFAULT_BOUNDS,view:{x0,y0,w,h,tiles:Array(w*h).fill(0),biome:'temperate'}} as WorldFrame;}
test('defect 3: connected cliffs expose only drops; water banks and snow use real terrain kinds',()=>{
 assert.equal(exposedFaces(1.35,1.35,.18)[0],0);assert.ok(Math.abs(exposedFaces(1.35,1.35,.18)[1]-1.17)<1e-8);
 assert.ok(terrainHeight(5)>terrainHeight(4));assert.equal(terrainHeight(2),0);
 const f=frame(-32,-32),c={x:-28,y:-28,span:12},size={w:900,h:600};
 for(const [x,y] of [[-29,-29],[-28,-29],[-29,-28]])f.view.tiles[(y+32)*12+x+32]=7;
 const g=surfaceGeometry(f,-29,-29,c,size);
 assert.deepEqual(g.faces,[[],[]]);
 const e=surfaceGeometry(f,-28,-29,c,size);assert.equal(e.faces[0].length,4);
 assert.equal(g.top[1].x,e.top[0].x);assert.ok(Math.abs(g.top[1].y-e.top[0].y)<1e-8,'shared top edge');
 const face=e.faces[0],p={x:face.reduce((n,v)=>n+v.x,0)/4,y:face.reduce((n,v)=>n+v.y,0)/4};
 assert.deepEqual(pickSurface(p,f,c,size),{x:-28,y:-29},'picking the visible cliff face selects its authoritative tile');
});
test('terrain picking and query cover all four corners, negative chunks, raised ground, zoom and aspect',()=>{
 let count=0;
 for(const size of [{w:320,h:720},{w:390,h:722},{w:667,h:253},{w:844,h:268},{w:1440,h:760}])for(const span of [9,16,32])for(const [x,y] of [[-112,-112],[167,-112],[-112,167],[167,167],[-28,-28],[-1,-1],[0,0],[28,28]])for(const kind of [0,5,6,7,9,2]){
  const c=clampCamera({x:x+.5,y:y+.5,span},DEFAULT_BOUNDS,size.w/size.h),q=viewportQuery(c,size.w/size.h),f=frame(q.x,q.y,q.w,q.h);
  f.view.tiles.fill(kind);const p=projectSurface({x:x+.5,y:y+.5},f,c,size);
  assert.ok(p.x>=0&&p.x<=size.w&&p.y>=0&&p.y<=size.h);
  assert.deepEqual(pickSurface(p,f,c,size),{x,y},`${x},${y} kind=${kind}`);count++;
 }
 assert.equal(count,720);
});
test('off-world and unknown terrain cannot be picked or invented by relief',()=>{
 const f=frame(0,0),c={x:6,y:6,span:12},size={w:800,h:600};
 assert.equal(pickSurface({x:0,y:0},f,c,size),null);
 const before=JSON.stringify(f);surfaceGeometry(f,4,4,c,size);assert.equal(JSON.stringify(f),before);
});
