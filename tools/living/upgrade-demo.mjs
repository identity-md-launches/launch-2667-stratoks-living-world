// Upgrade the existing isolated demo on a copy, retaining its exact original gzip.
// No production state, accounts, external service or injected activities are used.
import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { Expanse } from '../../server/src/expanse/engine.js';
import { migrateExpanse, identityDigest } from '../../server/src/expanse/persist.js';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const dir='web/public/demo', original=fs.readFileSync(`${dir}/checkpoint.json.gz`);
const before=JSON.parse(zlib.gunzipSync(original));
const migrated=migrateExpanse(structuredClone(before)).state;
if(identityDigest(before)!==identityDigest(migrated))throw Error('Migration changed identity');
const world=Expanse.fromState(migrated), timings=[], start=performance.now();
// Ordinary steps only, giving the new mechanisms time to accumulate evidence.
for(let i=0;i<600;i++){const t=performance.now();world.step();timings.push(performance.now()-t);}
const body=zlib.gzipSync(JSON.stringify(world.toState()),{level:9});
const manifest={version:2,schema:5,seed:world.seed,tick:world.tick,worldId:world.id,file:'agency-checkpoint.json.gz',sha256:hash(body),bytes:body.length,
 original:{file:'checkpoint.json.gz',sha256:hash(original),schema:before.schema,tick:before.tick,residents:before.creatures.length},
 migrationIdentityUnchanged:true,stepsAfterMigration:600,summary:world.summary(),
 recipe:'migrateExpanse(structuredClone(original)), Expanse.fromState, 600 ordinary steps. No positions, materials, residents or actions injected.',
 measurements:{elapsedMs:performance.now()-start,p50:timings.sort((a,b)=>a-b)[300],p95:timings[570],max:timings.at(-1),rssMB:process.memoryUsage().rss/1048576,arch:process.arch,node:process.version},
 warning:'Isolated browser demo. The original schema-4 checkpoint remains byte-identical for rollback; this is not the live owner world.'};
fs.writeFileSync(`${dir}/${manifest.file}`,body);
fs.writeFileSync(`${dir}/agency-manifest.json`,JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync('web/src/expanse/demoManifest.json',JSON.stringify({sha256:manifest.sha256,seed:manifest.seed,tick:manifest.tick,schema:5,file:manifest.file})+'\n');
console.log(JSON.stringify(manifest,null,2));
