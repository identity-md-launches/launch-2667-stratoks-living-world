// Sequential render timings: camera movement vs settled terrain. Local emulation only.
import {chromium} from '../node_modules/playwright/index.mjs';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
const server=spawn(process.execPath,['web/scripts/preview.mjs','0'],{stdio:['ignore','pipe','pipe']});
const url=await new Promise(resolve=>server.stdout.on('data',v=>{const m=String(v).match(/http:\/\/127\.0\.0\.1:\d+\/preview\//);if(m)resolve(m[0]);}));
const b=await chromium.launch();const results=[];
try{
 const page=await b.newPage();await page.goto(url+'?demo=1');await page.waitForFunction(()=>document.querySelector('.exp-app')?.dataset.connection==='connected');
 await page.getByRole('button',{name:'Pause demo',exact:true}).click();
 for(const [w,h] of [[1440,900],[390,844]]){
  await page.setViewportSize({width:w,height:h});
  await page.waitForTimeout(4400);
  const read=async()=>{const a=await page.locator('.exp-canvas').evaluate(e=>({times:JSON.parse(e.dataset.drawTimes??'[]'),surfaces:Number(e.dataset.terrainChunks)}));const v=a.times.sort((a,b)=>a-b);return{n:v.length,p50:v[Math.floor(v.length*.5)],p95:v[Math.floor(v.length*.95)],max:v.at(-1),viewportSurfaces:a.surfaces};};
  const settled=await read();
  await page.locator('.exp-canvas').focus();
  for(let i=0;i<15;i++){await page.keyboard.press(i<8?'ArrowRight':'ArrowLeft');await page.waitForTimeout(70);}
  await page.waitForTimeout(500);
  results.push({viewport:{w,h},settled,withCameraChanges:await read()});
 }
}finally{await b.close();server.kill('SIGTERM');}
await fs.writeFile('artifacts/agency-interface/render-bench.json',JSON.stringify({engine:'Chromium; local headless; software rendering; no CPU throttle',results,limit:'Emulated viewports on x64. Not a physical phone or ARM VPS benchmark.'},null,2)+'\n');
console.log(JSON.stringify(results));
