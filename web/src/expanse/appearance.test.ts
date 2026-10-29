import test from 'node:test';
import assert from 'node:assert/strict';
import { residentPose,residentSprite,constructionStage } from './appearance';
import type {WorldFrame,Resident} from './types';
const r:Resident={id:42,name:'Test resident',x:28,y:-1,health:80,action:null};
const f={inspector:null,view:{sites:[]}} as unknown as WorldFrame;
test('primitive intentions cannot make a false work/rest/fishing pose',()=>{
 for(const action of ['gather','rest','build','repair','carry','fish'])assert.equal(residentPose({...r,action},f,false),'idle');
 assert.equal(residentPose({...r,action:'rest',state:'travel'},f,true),'walk');
 assert.equal(residentPose({...r,state:'sleep'},f,false),'sleep');
 assert.equal(residentPose({...r,state:'rest'},f,false),'rest');
});
test('fishing casts only with actual phase and obtainable line; no catch frame is invented',()=>{
 const fishing={...r,action:'gather',state:'fish',phase:'cast',tools:['fish_line']};
 assert.equal(residentPose(fishing,f,false),'fish');
 for(const phase of ['cast','wait','reel'])for(let n=0;n<12;n++)assert.ok(!residentSprite({...fishing,phase},f,false,'se',n).includes('catch'));
 assert.equal(residentPose({...fishing,tools:[]},f,false),'idle');
 assert.equal(residentPose({...fishing,state:'inspect',phase:'inspect'},f,false),'idle');
 assert.equal(residentPose({...fishing,state:'travel',phase:'travel'},f,true),'walk');
});
test('loads and construction follow confirmed inventory/materials instead of destination plans',()=>{
 const loaded={...r,carrying:{wood:1},load:2};
 assert.equal(residentPose(loaded,f,true),'carry');
 assert.equal(residentPose({...r,carrying:{stone:2}},f,true),'carry');
 assert.equal(residentPose({...r,state:'gather',carrying:{}},f,false),'idle','berry art requires a berry');
 const builder={...r,state:'construct',phase:'construct',target:{x:28,y:-1},tools:['hand_axe']};
 assert.equal(residentPose(builder,f,false),'idle');
 const site={id:1,x:28,y:-1,kind:'timber_home',stage:0,materials:{wood:1},need:{wood:4,stone:2},work:1,workNeed:30};
 const building={...f,view:{...f.view,sites:[site]}};
 assert.equal(residentPose(builder,building,false),'build');
 assert.equal(constructionStage(site),'foundation');
 assert.equal(constructionStage({...site,stage:1}),'frame');
 assert.equal(constructionStage({...site,materials:{}}),'marker','an empty site is a ground mark, not a free building');
 assert.equal(residentPose({...builder,tools:[]},building,false),'idle','the supplied tool pose requires a held work tool');
 assert.equal(residentPose(builder,building,true),'walk','confirmed motion always wins');
 assert.equal(residentPose(builder,{...building,view:{...building.view,sites:[{...site,materials:{}}]}},false),'idle');
});
