// Short recording of real browser-engine states and primary phone interactions.
import fs from 'node:fs/promises';
import {chromium} from '../node_modules/playwright/index.mjs';
import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['web/scripts/preview.mjs','0'],{stdio:['ignore','pipe','pipe']});
const url=await new Promise(resolve=>server.stdout.on('data',v=>{const m=String(v).match(/http:\/\/127\.0\.0\.1:\d+\/preview\//);if(m)resolve(m[0]);}));
const b=await chromium.launch();
try {
 const ctx=await b.newContext({viewport:{width:390,height:844},recordVideo:{dir:'test/scratch/video',size:{width:312,height:676}}});
 const p=await ctx.newPage();
 await p.goto(url+'?demo=1');await p.waitForFunction(()=>document.querySelector('.exp-app')?.dataset.connection==='connected');
 await p.getByRole('button',{name:'Find residents',exact:true}).first().click();
 await p.getByRole('searchbox',{name:'Search residents'}).fill('154');await p.locator('.exp-resident').first().click();
 await p.locator('summary').filter({hasText:'Goals'}).waitFor();
 await p.waitForTimeout(1200);
 await p.locator('summary').filter({hasText:'Signals'}).click();await p.locator('summary').filter({hasText:'Signals'}).scrollIntoViewIfNeeded();
 await p.waitForTimeout(1200);
 await p.getByRole('button',{name:'Close panel',exact:true}).click();
 await p.locator('.exp-canvas').focus();await p.keyboard.press('Enter');await p.waitForTimeout(1000);await p.keyboard.press('Escape');
 for(const [x,y] of [[26,-50],[79,7],[-40,23]]){
  if(!await p.locator('.exp-minimap-hit').isVisible())await p.getByRole('button',{name:'Toggle world atlas'}).click();
  const r=await p.locator('.exp-minimap-hit').boundingBox();await p.mouse.click(r.x+(x+112)/280*r.width,r.y+(y+112)/280*r.height);await p.waitForTimeout(1300);
 }
 const video=p.video();await ctx.close();await video.saveAs('test/scratch/phone-tour.webm');
 console.log('Raw recording: test/scratch/phone-tour.webm. Recorded real evolving demo and phone inspection/biome navigation; no forced agent actions.');
}finally{await b.close();server.kill('SIGTERM');}
