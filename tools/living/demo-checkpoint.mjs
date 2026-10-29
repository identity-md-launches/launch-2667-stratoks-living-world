// Reproducible isolated demo history. No agent positions, jobs, items or homes are injected.
import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { Expanse } from '../../server/src/expanse/engine.js';
const seed=Number(process.argv[2] ?? 2), ticks=Number(process.argv[3] ?? 12000), dest=process.argv[4] ?? 'test/scratch/demo';
fs.mkdirSync(dest,{recursive:true});
const world=Expanse.create({initialCount:24},{seed});world.id=`isolated-demo-seed-${seed}`;
const start=performance.now(),cpu=process.cpuUsage(),timings=[];
for(let t=0;t<ticks;t++){const a=performance.now();world.step();timings.push(performance.now()-a);}
const body=zlib.gzipSync(JSON.stringify(world.toState()),{level:9});timings.sort((a,b)=>a-b);
const manifest={version:1,kind:'isolated demo checkpoint',seed,tick:world.tick,worldId:world.id,sha256:crypto.createHash('sha256').update(body).digest('hex'),bytes:body.length,
 recipe:`Expanse.create({initialCount:24},{seed:${seed}}), then ${ticks} ordinary step() calls. Only the isolated world ID is assigned. No forced actions, supplies, relocated residents or prebuilt structures.`,
 summary:world.summary(),sheltersByBiome:Object.fromEntries(['temperate','arid','cold','coast'].map(k=>[k,world.shelters.filter(s=>s.biome===k&&s.complete).length])),
 measurements:{elapsedMs:performance.now()-start,cpu:process.cpuUsage(cpu),rssMB:process.memoryUsage().rss/1048576,medianTickMs:timings[Math.floor(timings.length*.5)],p95TickMs:timings[Math.floor(timings.length*.95)],maxTickMs:timings.at(-1),node:process.version,arch:process.arch},
 warning:'This is not the owner world. Original settlement coordinates for this seed remain intact. Agents only know their own observations. Future outcomes are not guaranteed.'};
fs.writeFileSync(`${dest}/checkpoint.json.gz`,body);fs.writeFileSync(`${dest}/manifest.json`,JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(manifest,null,2));
