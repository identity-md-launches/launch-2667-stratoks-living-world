// Runtime atlas extraction and format conversion; source pixels are not repainted.
// Renderer source rectangles deliberately exclude unsupported wheat, pots and paired actors.
import fs from 'node:fs';
import { chromium } from '../../web/node_modules/playwright/index.mjs';
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage();
 for(const name of ['terrain','activities']) {
  const bytes=fs.readFileSync(`artifacts/agency/${name}.png`);
  const url=await page.evaluate(async ({data,name})=>{
   const im=new Image();im.src=data;await im.decode();
   const c=document.createElement('canvas');
   if(name==='activities'){
    c.width=209;c.height=250;c.getContext('2d').drawImage(im,0,30,209,250,0,0,209,250);
   }else{
    c.width=160;c.height=64;
    // Solid rock face paint from forest, sandstone, snow and coastal bank cells.
    [[96,112],[96,368],[96,624],[608,880]].forEach(([x,y],i)=>c.getContext('2d').drawImage(im,x,y,40,64,i*40,0,40,64));
   }
   return c.toDataURL('image/webp',.88);
  },{data:`data:image/png;base64,${bytes.toString('base64')}`,name});
  const out=Buffer.from(url.split(',')[1],'base64');
  fs.writeFileSync(`web/public/art/agency-${name}.webp`,out);
  console.log(`${name}: ${out.length} bytes`);
 }
} finally {await browser.close();}
