import type { Art } from './art';
import { scale, type Size, type Point } from './projection';
import { tileAt, surfaceGeometry } from './surface';
import type { Camera, WorldFrame } from './types';
export { tileAt } from './surface';
export const WATER=new Set([1,2,3,10]);
const COLORS=['#7d9b57','#4c9b9e','#307c90','#80b7af','#d8bf87','#9c9f8b','#e2e8df','#727e7a','#668750','#cdb17a','#5ca6a1'];
const noise=(x:number,y:number)=>((x*374761393+y*668265263)^((x+19)*(y+37)*1274126177))>>>0;
export function polygon(ctx:CanvasRenderingContext2D,points:Point[]) {
 ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(const p of points.slice(1))ctx.lineTo(p.x,p.y);ctx.closePath();
}
export function diamond(ctx:CanvasRenderingContext2D,x:number,y:number,s:number){polygon(ctx,[{x,y:y-s/2},{x:x+s,y},{x,y:y+s/2},{x:x-s,y}]);}
function dropForTexture(face:Point[]){return face[3].y-face[0].y;}
export function drawTerrainTile(ctx:CanvasRenderingContext2D,art:Art,f:WorldFrame,x:number,y:number,c:Camera,size:Size) {
 const t=tileAt(f,x,y);if(t<0)return;
 const g=surfaceGeometry(f,x,y,c,size),p=g.p,s=scale(c,size),seed=noise(x,y);
 const biome=f.view.biomes?.[(y-f.view.y0)*f.view.w+x-f.view.x0]??f.view.biome;
 const faces=biome==='arid'?['#b88c58','#946b46']:biome==='cold'?['#8d9a99','#64787c']:biome==='coast'?['#879186','#586e6b']:['#89917c','#626e5c'];
 for(let side=0;side<2;side++){
  const face=g.faces[side];if(!face.length)continue;
  polygon(ctx,face);ctx.fillStyle=faces[side];ctx.fill();
  // The supplemental rock paint is clipped INSIDE the authoritative edge mesh.
  // Its illustrated grass/water, disconnected fragments and false routes never render.
  if(art.agencyTerrain && dropForTexture(face)>s*.1){
   ctx.save();polygon(ctx,face);ctx.clip();ctx.globalAlpha=t===7?.22:.12;
   const row=biome==='arid'?1:biome==='cold'?2:biome==='coast'?3:0;
   const left=Math.min(...face.map(q=>q.x)),top=Math.min(...face.map(q=>q.y)),bottom=Math.max(...face.map(q=>q.y));
   ctx.drawImage(art.agencyTerrain,row*40,0,40,64,left,top,s,bottom-top);ctx.restore();
  }
  const drop=face[3].y-face[0].y;
  ctx.strokeStyle=side?'#293d3c50':'#e8d8ad66';ctx.lineWidth=Math.max(.7,s*.025);
  for(let lift=s*.22;lift<drop;lift+=s*.22){ctx.beginPath();ctx.moveTo(face[0].x,face[0].y+lift);ctx.lineTo(face[1].x,face[1].y+lift);ctx.stroke();}
  // The real shoreline has a rock bank, not a painted ribbon across water.
  if(t!==7&&drop>0){ctx.strokeStyle='#efe3b680';ctx.lineWidth=Math.max(.8,s*.025);ctx.beginPath();ctx.moveTo(face[0].x,face[0].y);ctx.lineTo(face[1].x,face[1].y);ctx.stroke();}
 }
 polygon(ctx,g.top);ctx.fillStyle=COLORS[t]??COLORS[0];ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.65;ctx.stroke();
 ctx.save();polygon(ctx,g.top);ctx.clip();
 if(WATER.has(t)){
  ctx.fillStyle=t===2?'#164b6330':'#b4e4ce20';ctx.beginPath();ctx.ellipse(p.x,p.y,s*.6,s*.12,-.18,0,Math.PI*2);ctx.fill();
 }else{
  ctx.fillStyle=biome==='arid'?'#f5dcb118':biome==='cold'?'#ffffff20':'#b2bc7b20';ctx.fillRect(p.x-s,p.y-s/2,s*2,s);
  for(let n=0;n<8;n++){
   const h=noise(x*23+n,y*17-n),xx=p.x+((h%1000)/500-1)*s,yy=p.y+(((h>>>10)%1000)/1000-.5)*s;
   ctx.fillStyle=n%3?'#f5ebbb35':'#29452b25';ctx.beginPath();ctx.ellipse(xx,yy,s*.025+(h%3)*s*.012,s*.016,-.4,0,7);ctx.fill();
  }
  if((t===0||t===8)&&seed%3!==0){
   const xx=p.x+((seed%13)-6)*s*.05,yy=p.y+((seed%7)-3)*s*.04;
   ctx.strokeStyle='#354f3170';ctx.lineWidth=Math.max(.6,s*.018);ctx.beginPath();ctx.moveTo(xx-2,yy);ctx.lineTo(xx-4,yy-s*.12);ctx.moveTo(xx,yy);ctx.lineTo(xx+1,yy-s*.17);ctx.stroke();
  }
  if((t===4||t===9)&&seed%3===0){ctx.strokeStyle='#9f794d30';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p.x,p.y+s*.15,s*.85,s*.23,-.2,Math.PI,Math.PI*2);ctx.stroke();}
  if(t===6&&seed%4===0){ctx.strokeStyle='#f7fcf1aa';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(p.x-s*.6,p.y+s*.1);ctx.quadraticCurveTo(p.x,p.y-s*.12,p.x+s*.6,p.y-s*.06);ctx.stroke();}
  if((t===5||t===7)&&seed%5===0){ctx.strokeStyle='#45595666';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x-s*.5,p.y-s*.15);ctx.lineTo(p.x-s*.1,p.y+s*.08);ctx.lineTo(p.x+s*.15,p.y-s*.05);ctx.stroke();}
  // Blend only the seam between two walkable top surfaces; never draw a bridge.
  const neighbors=[[x,y-1],[x+1,y],[x,y+1],[x-1,y]];
  for(let i=0;i<4;i++){
   const nt=tileAt(f,...neighbors[i] as [number,number]);
   if(nt<0||nt===t||nt===7||t===7||WATER.has(nt))continue;
   ctx.strokeStyle=COLORS[nt]+'66';ctx.lineWidth=s*.13;ctx.beginPath();ctx.moveTo(g.top[i].x,g.top[i].y);ctx.lineTo(g.top[(i+1)%4].x,g.top[(i+1)%4].y);ctx.stroke();
  }
 }
 ctx.restore();
}
// One DPR-capped viewport surface, no unbounded world/chunk cache. The signature
// excludes tick: unchanged terrain is reused while residents and signals animate.
export class GroundCache {
 private surface=document.createElement('canvas');
 private tiles=new Map<string,HTMLCanvasElement>();
 private key='';private frame:WorldFrame|null=null;private signature='';
 builds=0;get size(){return this.key?1:0;}
 constructor(private art:Art){}
 private tile(f:WorldFrame,x:number,y:number){
  const kind=tileAt(f,x,y),biome=f.view.biomes?.[(y-f.view.y0)*f.view.w+x-f.view.x0]??f.view.biome;
  const g=surfaceGeometry(f,x,y,{x:x+.5,y:y+.5,span:1},{w:2,h:2});
  const key=`${kind}:${biome}:${g.h}:${g.faces.map(face=>face.length?face[3].y-face[0].y:0)}:${[tileAt(f,x,y-1),tileAt(f,x+1,y),tileAt(f,x,y+1),tileAt(f,x-1,y)]}:${noise(x,y)%8}`;
  let tile=this.tiles.get(key);
  if(!tile){
   tile=document.createElement('canvas');tile.width=68;tile.height=128;
   const paint=tile.getContext('2d')!;
   // 32px per half tile, top at y=64-height*32. Faces fit below.
   drawTerrainTile(paint,this.art,f,x,y,{x:x+.5,y:y+.5,span:68/64},{w:68,h:128});
   this.tiles.set(key,tile);
   if(this.tiles.size>384){const old=this.tiles.keys().next().value!;const canvas=this.tiles.get(old)!;canvas.width=canvas.height=0;this.tiles.delete(old);}
  }
  return tile;
 }
 draw(ctx:CanvasRenderingContext2D,f:WorldFrame,c:Camera,size:Size,dpr=1){
  if(this.frame!==f){const v=f.view;this.signature=`${f.worldId}:${f.seed}:${v.x0}:${v.y0}:${v.w}:${v.h}:${v.tiles.join('')}:${v.heights?.join(',')}:${v.biomes?.join(',')}`;this.frame=f;}
  const key=`${c.x},${c.y},${c.span},${size.w},${size.h},${dpr}:${this.signature}`;
  if(key!==this.key){
   this.surface.width=Math.ceil(size.w*dpr);this.surface.height=Math.ceil(size.h*dpr);
   const paint=this.surface.getContext('2d')!;paint.setTransform(dpr,0,0,dpr,0,0);
   paint.fillStyle='#8fa9a4';paint.fillRect(0,0,size.w,size.h);
   const v=f.view,s=scale(c,size);
   // Diagonal painter order, including at negative chunk boundaries.
   for(let sum=v.x0+v.y0;sum<=v.x0+v.w+v.y0+v.h-2;sum++)for(let y=Math.max(v.y0,sum-v.x0-v.w+1);y<=Math.min(v.y0+v.h-1,sum-v.x0);y++){
    const x=sum-y,g=surfaceGeometry(f,x,y,c,size);
    if(g.p.x+s<0||g.p.x-s>size.w||g.p.y+s*2<0||g.p.y-s/2>size.h)continue;
    const tile=this.tile(f,x,y),ratio=s/32;paint.drawImage(tile,g.p.x-34*ratio,g.p.depth-64*ratio,68*ratio,128*ratio);
   }
   this.key=key;this.builds++;
  }
  ctx.drawImage(this.surface,0,0,this.surface.width,this.surface.height,0,0,size.w,size.h);
 }
}
