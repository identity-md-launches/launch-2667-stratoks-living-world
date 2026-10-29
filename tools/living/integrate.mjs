// Package the supplied registered PNGs; source art is never synthesized.
// Requires sharp in an external tools directory: STRATOKS_SHARP=/tmp/.../node_modules/sharp
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../..');
const sharp=createRequire(import.meta.url)(process.env.STRATOKS_SHARP ?? '/tmp/stratoks-art/node_modules/sharp');
const source=JSON.parse(await fs.readFile(path.join(root,'docs/living/manifest.json'),'utf8'));
const out=path.join(root,'web/public/art');await fs.mkdir(out,{recursive:true});
const sprites={};const sheets={};const provenance=[];
for(const kind of ['characters','world']){
 const asset=source.assets.find(a=>a.path===`artifacts/living/${kind}.png`);
 let input;try{input=await fs.readFile(path.join(root,asset.path));}catch{
   const packed=spawnSync('python3',['-B','-c',`from tools.living.pack import pack; pack('${kind}')`],{cwd:root,encoding:'utf8'});if(packed.status!==0)throw Error(packed.stderr);input=await fs.readFile(path.join(root,asset.path));
 }
 if(createHash('sha256').update(input).digest('hex')!==asset.sha256) throw Error(`Input hash mismatch: ${kind}`);
 // Keep the 320px cell and pivot geometry. WebP encodes transparent gutters without matte.
 const file=`living-${kind}.webp`;await sharp(input).webp({quality:88,alphaQuality:100,effort:6}).toFile(path.join(out,file));
 sheets[kind]={file,width:asset.width,height:asset.height};
 for(const s of asset.sprites){
  // Clipped to the registered cell. No adjoining sprite can enter a runtime frame.
  const b=s.visibleBounds;
  sprites[s.id]={sheet:kind,rect:s.rect,anchor:s.anchor,widthInHalfTiles:kind==='characters'?3.2:4.6,visibleBounds:b};
 }
 provenance.push({file,input:asset.path,inputSHA256:asset.sha256,bytes:(await fs.stat(path.join(out,file))).size,processing:'Registered source cells, unchanged geometry. WebP quality 88; alpha quality 100.'});
}
// Front view is also the source of the product icon. No legacy rabbit silhouette is retained.
const character=sharp(path.join(root,'artifacts/living/characters.png'));
await character.clone().extract({left:72,top:92,width:172,height:194}).resize(96,108).png().toFile(path.join(root,'web/public/favicon.png'));
try{await fs.access(path.join(root,'artifacts/living/model.png'));await sharp(path.join(root,'artifacts/living/model.png')).webp({quality:86,effort:6}).toFile(path.join(out,'model.webp'));}catch{await fs.access(path.join(out,'model.webp'));}
const stateContract={"version":"living:1","source":"web/src/expanse/appearance.ts","movement":"Only adjacent confirmed endpoints in consecutive engine ticks; skipped paths snap.","fish":{"state":"fish","tool":"fish_line","phases":{"cast":["fish.cast.0","fish.cast.1"],"wait":["fish.wait"],"reel":["fish.reel"]},"catchPose":"Unused; no catch-result API phase."},"sleep":{"state":"sleep","frames":["rest.sleep.0","rest.sleep.1"]},"loads":"Positive matching carrying item; other materials use a neutral pouch.","construction":"Actual site target + delivered materials + construct phase. Empty sites are outline markers. Tool-work art additionally requires held hand_axe or stone_club."};
const manifest={runtimeIntegrated:true,stateContract,version:2,species:'Original golden scalloped Stratok with a leaf crown; no animal substitute.',sheets,sprites,provenance,license:'licenses/living-art.txt',anchors:'Cell-local foot contact [160,280], unchanged from the supplied registration. Rectangles are half-open x,y,w,h.'};
await fs.writeFile(path.join(root,'web/src/expanse/atlas.json'),JSON.stringify(manifest,null,2)+'\n');
await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await fs.copyFile(path.join(root,'docs/living/LICENSE.txt'),path.join(root,'web/public/licenses/living-art.txt'));
console.log(JSON.stringify(provenance));
