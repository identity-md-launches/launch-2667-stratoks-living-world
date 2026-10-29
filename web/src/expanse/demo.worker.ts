/// <reference lib="webworker" />
// Exact production Expanse engine, resumed from an unedited, naturally simulated
// checkpoint. All future decisions occur here; no scene scheduler or shared writes.
import { Expanse } from '../../../server/src/expanse/engine.js';
import { frame } from '../../../server/src/expanse/view.js';
let world: any, starting: Promise<void>, timer: ReturnType<typeof setTimeout>;
let paused=false, measuredTickMs=0, stepMs=250, checkpointTick=0;
function run(){
 clearTimeout(timer);
 if(paused||!world)return;
 timer=setTimeout(()=>{const a=performance.now();world.step();measuredTickMs=performance.now()-a;stepMs=Math.max(250,Math.ceil(measuredTickMs*5));run();},stepMs);
}
async function start(data:any){
 clearTimeout(timer);world=null;paused=false;
 const response=await fetch(data.checkpointUrl,{credentials:'omit'});
 if(!response.ok)throw new Error('The demo checkpoint could not load. Reopen the demo to retry.');
 const compressed=new Uint8Array(await response.arrayBuffer());
 if(crypto.subtle){
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',compressed))).map(n=>n.toString(16).padStart(2,'0')).join('');
   if(hash!==data.sha256)throw new Error('The demo checkpoint checksum differs. Rebuild or reload the complete export.');
 }
 const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
 const saved=JSON.parse(await new Response(stream).text());
 if(saved.kind!=='stratoks-expanse'||saved.schema!==4||saved.seed!==data.seed)throw new Error('Incompatible demo checkpoint.');
 world=Expanse.fromState(saved);checkpointTick=world.tick;run();
}
self.onmessage=async ({data})=>{
 try{
  if(data.type==='start'){starting=start(data);await starting;}
  else if(data.type==='pause'){paused=data.paused;run();}
  else if(data.type==='frame'){
    await starting;
    const f:any=frame(world,data.query);
    f.demo={seed:world.seed,checkpointTick,stepMs,measuredTickMs:Math.round(measuredTickMs*100)/100,paused,description:'Isolated browser engine. Seed 2, naturally simulated from 24 founders; resets on exit.'};
    postMessage({id:data.id,frame:f});
  }
 }catch(e){postMessage({id:data.id,error:e instanceof Error?e.message:String(e)});}
};
