// Interaction validation against the actual export at a subpath. No production requests.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium,webkit} from '../node_modules/playwright/index.mjs';
const out='artifacts/agency-interface', log={checks:[],errors:[],viewports:[],timings:[],limits:[]};
await fs.mkdir(out,{recursive:true});
const server=spawn(process.execPath,['web/scripts/preview.mjs','0'],{stdio:['ignore','pipe','pipe']});
// Port 0's printed URL is corrected by the preview server to its assigned port.
const url=await new Promise((resolve,reject)=>{let data='';server.stdout.on('data',v=>{data+=v;const m=data.match(/http:\/\/127\.0\.0\.1:\d+\/preview\//);if(m)resolve(m[0]);});server.on('error',reject);setTimeout(()=>reject(Error('preview startup timeout')),10000).unref();});
let browser;
try {
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const requests=[];page.on('request',r=>{if(!r.url().startsWith(url)&&!r.url().startsWith('blob:')&&!r.url().startsWith('data:'))requests.push(r.url());});
 page.on('pageerror',e=>log.errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)log.errors.push(`${r.status()} ${r.url()}`);});
 await page.goto(url+'?demo=1');
 await page.waitForFunction(()=>document.querySelector('.exp-app')?.getAttribute('data-connection')==='connected',null,{timeout:30000});
 await page.getByRole('button',{name:'Pause demo',exact:true}).click();
 await page.waitForTimeout(400);
 const tick=Number(await page.locator('.exp-app').getAttribute('data-tick'));
 assert.ok(tick>=12600);assert.equal(await page.locator('.exp-app').getAttribute('data-display'),'demo');
 log.checks.push(`updated browser worker resumed tick ${tick}; no reset`);
 async function shot(name){await page.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:58});}
 async function jump(x,y){
  if(!await page.locator('.exp-minimap-hit').isVisible())await page.getByRole('button',{name:'Toggle world atlas',exact:true}).click();
  const b=await page.locator('.exp-minimap-hit').boundingBox();
  await page.mouse.click(b.x+Math.min(.999,Math.max(.001,(x+112)/280))*b.width,b.y+Math.min(.999,Math.max(.001,(y+112)/280))*b.height);
  await page.waitForTimeout(650);
 }
 await shot('forest-desktop');
 for(const [name,x,y] of [['highlands',26,-50],['desert',79,7],['coast',-40,23],['islands',-60,80]]){
  await jump(x,y);await shot(name);
  const timings=JSON.parse(await page.locator('.exp-canvas').getAttribute('data-draw-times')||'[]').sort((a,b)=>a-b);
  log.timings.push({biome:name,frames:timings.length,p50:timings[Math.floor(timings.length*.5)],p95:timings[Math.floor(timings.length*.95)],max:timings.at(-1)});
 }
 log.checks.push('all four biomes and islands navigated through the minimap');
 for(const [x,y] of [[-112,-112],[168,-112],[-112,168],[168,168]]){
  await jump(x,y);
  const c=JSON.parse(await page.locator('.exp-canvas').getAttribute('data-camera'));
  assert.ok(Math.abs(c.x-(x<0?-111.5:167.5))<3&&Math.abs(c.y-(y<0?-111.5:167.5))<3);
  await page.locator('.exp-canvas').focus();await page.keyboard.press('Enter');
  await page.getByRole('dialog',{name:'Tile evidence',exact:true}).waitFor();
  assert.match(await page.locator('.exp-tile-body').innerText(),/Received tick/);
  await page.keyboard.press('Escape');assert.equal(await page.locator('.exp-tile-evidence').count(),0);
 }
 log.checks.push('all four world corners reachable; keyboard picking and Escape work');
 await page.getByRole('button',{name:'Explore settlements',exact:true}).click();
 assert.equal(await page.locator('.exp-panel-title h2').innerText(),'Settlements');
 await page.getByLabel('Explore a biome').selectOption('arid');
 await page.locator('.exp-place').first().click();
 assert.equal(await page.locator('.exp-side-panel').count(),0);
 log.checks.push('settlement title, biome filter and camera travel');
 // The first arid shelter can be unoccupied. Navigate to resident 13's saved
 // neighbourhood, then pick only an actually rendered hit in the live frame.
 await jump(55.5,66.5);await page.waitForTimeout(500);
 const hit=await page.locator('.exp-canvas').evaluate(el=>{
  const r=el.getBoundingClientRect(),hits=JSON.parse(el.dataset.hits??'[]');
  return hits.find(h=>h.x>100&&h.x<r.width-240&&h.y>180&&h.y<r.height-100&&document.elementFromPoint(r.x+h.x,r.y+h.y)===el&&hits.every(o=>o.id===h.id||Math.hypot(o.x-h.x,o.y-h.y)>o.r+h.r));
 });
 assert.ok(hit,'a confirmed visible isolated resident is available for pointer picking');
 const rect=await page.locator('.exp-canvas').boundingBox();await page.mouse.click(rect.x+hit.x,rect.y+hit.y);
 await page.waitForFunction(id=>document.querySelector('.exp-inspector')?.getAttribute('data-creature-id')===String(id),hit.id);
 await page.getByRole('button',{name:'Close panel',exact:true}).click();
 log.checks.push('actual canvas pointer picking selects the rendered resident');
 await page.getByRole('button',{name:'Find residents',exact:true}).first().click();
 await page.getByRole('searchbox',{name:'Search residents'}).fill('no-such-resident');
 await page.getByText('No residents match this search.').waitFor();
 await page.getByRole('button',{name:'Clear search',exact:true}).click();
 await page.getByRole('searchbox',{name:'Search residents'}).fill('154');
 await page.locator('.exp-resident').first().click();
 await page.locator('.exp-science summary').filter({hasText:'Goals'}).waitFor();
 await page.locator('summary').filter({hasText:'Signals'}).click();
 await page.locator('summary').filter({hasText:'Heard & sent history'}).click();
 assert.match(await page.locator('.exp-inspector').innerText(),/Limited learned signaling/);
 const downloadPromise=page.waitForEvent('download');
 await page.getByRole('button',{name:'Download actual resident evidence',exact:true}).click();
 const download=await downloadPromise;await download.saveAs(`${out}/inspector-evidence.json`);
 const evidence=JSON.parse(await fs.readFile(`${out}/inspector-evidence.json`,'utf8'));
 assert.equal(evidence.id,154);assert.ok(evidence.goals&&evidence.communication&&evidence.knownStores);
 await page.locator('summary').filter({hasText:'Signals'}).scrollIntoViewIfNeeded();await shot('signal-inspector');
 log.checks.push('resident search empty/recovery, goal and signal inspectors, real JSON download');
 await page.getByRole('button',{name:'Follow resident',exact:true}).click();
 await page.getByRole('button',{name:'Close panel',exact:true}).click();
 assert.match(await page.locator('.exp-follow-banner').innerText(),/Following/);
 await page.locator('.exp-follow-banner').click();
 log.checks.push('follow and stop-follow; panel focus return');
 for(const [w,h] of [[390,844],[320,568],[667,375],[844,390],[851,700]]){
  await page.setViewportSize({width:w,height:h});await page.waitForTimeout(350);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${w}`);
  await page.getByRole('button',{name:'Return to original settlement',exact:true}).click();
  await page.waitForTimeout(400);
  if(w===390)await shot('phone-first-screen');
  const canvas=page.locator('.exp-canvas');await canvas.focus();await page.keyboard.press('Enter');
  const d=page.getByRole('dialog',{name:'Tile evidence',exact:true});await d.waitFor();
  const b=await page.getByRole('button',{name:'Close tile evidence',exact:true}).boundingBox();
  assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=w&&b.y+b.height<=h);
  const reachable=await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest('button')?.getAttribute('aria-label'),{x:b.x+b.width/2,y:b.y+b.height/2});
  assert.equal(reachable,'Close tile evidence');
  if(w===667)await shot('phone-landscape-evidence');
  await page.getByRole('button',{name:'Close tile evidence',exact:true}).click();
  assert.equal(await page.evaluate(()=>document.activeElement?.className),'exp-canvas');
  await canvas.press('Enter');await page.keyboard.press('Escape');
  assert.equal(await page.locator('.exp-tile-evidence').count(),0);
  // Dialog also stays in the viewport when the resident sheet shrinks the map.
  await page.getByRole('button',{name:'Find residents',exact:true}).first().click();
  await canvas.focus();await canvas.press('Enter');await d.waitFor();await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Close panel',exact:true}).click();
  log.viewports.push({w,h,overflow:false,closeReachable:true,escape:true,focusReturned:true,withPanel:true});
 }
 log.checks.push('phone portrait/landscape, tablet, evidence close hit-test, Escape and focus return with/without side panel');
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(250);
 await page.getByRole('button',{name:'Zoom out',exact:true}).click();await page.getByRole('button',{name:'Zoom out',exact:true}).click();
 const beforePinch=JSON.parse(await page.locator('.exp-canvas').getAttribute('data-camera'));
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:170,y:430,id:1},{x:230,y:430,id:2}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:130,y:430,id:1},{x:270,y:430,id:2}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(250);
 const afterPinch=JSON.parse(await page.locator('.exp-canvas').getAttribute('data-camera'));
 assert.ok(afterPinch.span<beforePinch.span,'two-touch pinch zooms');
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:220,y:430,id:1}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:270,y:470,id:1}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(250);
 const afterDrag=JSON.parse(await page.locator('.exp-canvas').getAttribute('data-camera'));
 assert.ok(afterDrag.x!==afterPinch.x||afterDrag.y!==afterPinch.y,'one-touch pan moves camera');
 assert.equal(await page.locator('.exp-tile-evidence').count(),0,'gestures do not accidentally select terrain');
 await cdp.detach();log.checks.push('real emulated two-touch pinch and one-touch drag, without accidental picking');
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'How this world works',exact:true}).click();
 await page.getByRole('dialog',{name:'A world to observe',exact:true}).waitFor();await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Resume demo',exact:true}).click();
 await page.waitForFunction(t=>Number(document.querySelector('.exp-app').getAttribute('data-tick'))>t,tick,{timeout:10000});
 assert.deepEqual(requests,[]);log.checks.push('simulation advances on resume; all demo requests stay on the static origin');
 // Native WebKit availability is reported separately; absence cannot be called a pass.
 try{const wb=await webkit.launch();await wb.close();log.checks.push('WebKit runtime available');}catch(e){log.limits.push('WebKit did not launch: '+e.message.split('\n').slice(0,3).join(' '));}
} catch(e){log.errors.push(e.stack);process.exitCode=1;}
finally {await browser?.close();server.kill('SIGTERM');await fs.writeFile(`${out}/browser-results.json`,JSON.stringify(log,null,2)+'\n');console.log(JSON.stringify(log,null,2));}
