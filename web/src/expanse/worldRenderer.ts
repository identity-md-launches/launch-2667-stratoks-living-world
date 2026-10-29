import { drawSprite, type Art } from "./art";
import { residentPose, residentSprite, carried, constructionStage } from "./appearance";
export { residentPose } from "./appearance";
import { project, scale, type Size } from "./projection";
import { GroundCache, WATER } from "./ground";
import { settlementWear, WornPaths, type WornSegment } from "./paths";
import type { Camera, Resident, WorldFrame } from "./types";
export const TILE_NAMES = [
  "Grass",
  "Freshwater lake",
  "Open sea",
  "Shallows",
  "Sand",
  "Rock",
  "Snow",
  "Cliff",
  "Forest floor",
  "Dune",
  "Freshwater stream",
];
export const hash = (x: number, y = 0) =>
  ((x * 374761393 + y * 668265263) ^ ((x + 19) * (y + 37) * 1274126177)) >>> 0;
export function biomeAt(f: WorldFrame, x: number, y: number) {
  const v=f.view;
  if(v.biomes && x>=v.x0 && y>=v.y0 && x<v.x0+v.w && y<v.y0+v.h) return v.biomes[(y-v.y0)*v.w+x-v.x0];
  const cx = Math.floor(x / 28),
    cy = Math.floor(y / 28);
  return (
    f.minimap.biomes.find(([bx, by]) => bx === cx && by === cy)?.[2] ??
    f.view.biome
  );
}
type Track = {
  from: { x: number; y: number };
  to: Resident;
  since: number;
  duration: number;
  direction: string;
  moving: boolean;
};
export class WorldRenderer {
  private ground: GroundCache;
  private paths: WornPaths;
  private travelled = new Map<string, WornSegment>();
  private wear: WornSegment[] = [];
  private tracks = new Map<number, Track>();
  private frame: WorldFrame | null = null;
  private received = 0;
  private tick: number | undefined;
  hits: { id: number; x: number; y: number; r: number }[] = [];
  stats = {
    drawn: 0,
    culled: 0,
    terrainBuilds: 0,
    terrainChunks: 0,
    frames: 0,
    drawTimes: [] as number[],
  };
  constructor(private art: Art) {
    this.ground = new GroundCache(art);
    this.paths = new WornPaths(art);
  }
  update(f: WorldFrame, now: number, recorded: boolean) {
    if (this.frame === f) return;
    if (
      this.frame?.worldId !== f.worldId ||
      this.frame?.seed !== f.seed ||
      f.tick < (this.tick ?? 0)
    ) {
      this.tracks.clear();
      this.travelled.clear();
    }
    const duration = Math.max(100, Math.min(1100, now - this.received || 500));
    if (f.tick !== this.tick) {
      for (const r of f.residents) {
        const old = this.tracks.get(r.id),
          dx = r.x - (old?.to.x ?? r.x),
          dy = r.y - (old?.to.y ?? r.y);
        const adjacent = Math.max(Math.abs(dx), Math.abs(dy)) <= 1;
        const moving = !!old && f.tick - (this.tick ?? f.tick) === 1 && (dx !== 0 || dy !== 0) && adjacent && !recorded;
        if (moving) {
          const from = { x: old!.to.x, y: old!.to.y }, to = { x: r.x, y: r.y };
          const key = [`${from.x},${from.y}`, `${to.x},${to.y}`].sort().join(":");
          this.travelled.delete(key);
          this.travelled.set(key, { from, to });
          if (this.travelled.size > 256) this.travelled.delete(this.travelled.keys().next().value!);
        }
        let direction =
          old?.direction ?? ["se", "sw", "ne", "nw"][hash(r.id) % 4];
        if (dx || dy) {
          const sx = dx - dy,
            sy = dx + dy;
          direction = sx >= 0 ? (sy >= 0 ? "se" : "ne") : sy >= 0 ? "sw" : "nw";
        }
        this.tracks.set(r.id, {
          from: moving ? { x: old!.to.x, y: old!.to.y } : { x: r.x, y: r.y },
          to: r,
          since: now,
          duration,
          direction,
          moving,
        });
      }
      const alive = new Set(f.residents.map((r) => r.id));
      for (const id of this.tracks.keys())
        if (!alive.has(id)) this.tracks.delete(id);
      this.received = now;
      this.tick = f.tick;
    }
    this.wear = settlementWear(f, this.travelled.values());
    this.frame = f;
  }
  draw(
    ctx: CanvasRenderingContext2D,
    f: WorldFrame,
    c: Camera,
    size: Size,
    now: number,
    opts: {
      selected: number | null;
      knowledge: boolean;
      borders: boolean;
      motion: boolean;
      recorded: boolean;
    },
    dpr: number,
  ) {
    const start = performance.now();
    this.update(f, now, opts.recorded);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);
    this.ground.draw(ctx, f, c, size, dpr);
    this.stats.terrainBuilds = this.ground.builds;
    this.stats.terrainChunks = this.ground.size;
    this.paths.draw(ctx, this.wear, c, size);
    const s = scale(c, size),
      v = f.view;
    if (opts.borders) {
      ctx.strokeStyle = "#304f5470";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      for (let x = f.bounds.x0; x <= f.bounds.x1; x += 28) {
        const a = project({ x, y: f.bounds.y0 }, c, size),
          b = project({ x, y: f.bounds.y1 }, c, size);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      for (let y = f.bounds.y0; y <= f.bounds.y1; y += 28) {
        const a = project({ x: f.bounds.x0, y }, c, size),
          b = project({ x: f.bounds.x1, y }, c, size);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    if (opts.motion) {
      ctx.strokeStyle = "#d9fff08a";
      ctx.lineWidth = 1;
      for (let j = 0; j < v.h; j++)
        for (let i = 0; i < v.w; i++)
          if (
            WATER.has(v.tiles[j * v.w + i]) &&
            hash(i + v.x0, j + v.y0) % 7 === 0
          ) {
            const p = project(
              { x: v.x0 + i + 0.5, y: v.y0 + j + 0.5 },
              c,
              size,
            );
            if (p.x < 0 || p.y < 0 || p.x > size.w || p.y > size.h) continue;
            const shift = Math.sin(now / 1800 + hash(i, j)) * s * 0.09;
            ctx.globalAlpha = 0.35 + 0.2 * Math.sin(now / 1500 + i);
            ctx.beginPath();
            ctx.ellipse(p.x + shift, p.y, s * 0.3, s * 0.06, 0, 0, Math.PI);
            ctx.stroke();
          }
      ctx.globalAlpha = 1;
    }
    const objects: { depth: number; draw: () => void }[] = [];
    let drawn = 0,
      culled = 0;
    this.hits = [];
    const visible = (p: { x: number; y: number }, r: number) =>
      p.x > -r && p.x < size.w + r && p.y > -r && p.y < size.h + r;
    for (const [node, kind, x, y, units] of v.nodes) {
      if (units < 0) continue;
      const p = project({ x: x + 0.5, y: y + 0.5 }, c, size);
      if (!visible(p, s * 4)) {
        culled++;
        continue;
      }
      const biome = biomeAt(f, x, y);
      const prefix = biome === 'temperate' ? 'forest' : biome === 'arid' ? 'desert' : biome;
      let sprite: string | null = null, width = 3.2;
      if (kind === 'tree' && units > 0) { sprite = `${prefix}.tree.${{forest:'oak',desert:'palm',cold:'spruce',coast:'pine'}[prefix] ?? 'oak'}`; width = 4.4; }
      else if (kind === 'bush') { sprite = `${prefix}.${prefix==='cold'?'berries.frost':prefix==='desert'?'cactus':prefix==='coast'?'reeds':units>0?'berries.full':'berries.depleted'}`; width = 2.9; }
      else if (kind === 'stone' || kind === 'flint') { if (!units) continue; sprite = `${prefix}.stone.${prefix==='desert'?'sandstone':prefix==='cold'?'granite':prefix==='coast'?'coastal':'sandstone'}`; if(prefix==='forest') sprite='coast.stone.coastal'; width=2.7; }
      else if (['deadfall','driftwood'].includes(kind) && units>0) { sprite='forest.stock.wood'; width=2.4; }
      else if (kind === 'cactus' && units>0) { sprite='desert.cactus'; width=2.5; }
      else if (['scrub','lichen'].includes(kind) && units>0) { sprite=prefix==='cold'?'cold.berries.frost':'coast.reeds'; width=1.8; }
      else if(kind==='fish') {
        // A quiet underwater stock marker, never a resident fishing animation.
        if(units>0) objects.push({depth:p.y,draw:()=>{
          ctx.strokeStyle='#174d5d99';ctx.lineWidth=Math.max(1,s*.035);
          ctx.beginPath();ctx.ellipse(p.x,p.y,s*.18,s*.07,-.2,0,Math.PI*2);ctx.stroke();
          ctx.beginPath();ctx.moveTo(p.x-s*.17,p.y);ctx.lineTo(p.x-s*.28,p.y-s*.09);ctx.lineTo(p.x-s*.28,p.y+s*.08);ctx.closePath();ctx.stroke();
        }});
      } else if(kind==='shellfish'&&units>0) {
        objects.push({depth:p.y,draw:()=>{ctx.fillStyle='#e1d1b9';for(let n=0;n<Math.min(3,units);n++){ctx.beginPath();ctx.ellipse(p.x+s*(n-1)*.16,p.y,s*.11,s*.07,-.5,0,Math.PI*2);ctx.fill();}}});
      }
      if (!sprite) continue;
      drawn++;
      objects.push({
        depth: p.y,
        draw: () => {
          const sway =
            opts.motion && kind === "tree"
              ? Math.sin(now / 2400 + hash(x, y)) * s * 0.012
              : 0;
          drawSprite(ctx, this.art, sprite, p.x + sway, p.y, width * s);
        },
      });
    }
    const prefixAt = (x:number,y:number) => { const b=biomeAt(f,x,y);return b==='temperate'?'forest':b==='arid'?'desert':b; };
    const structure = (x:number,y:number,stage:string,integrity=100) => {
      const p=project({x:x+.5,y:y+.5},c,size);
      if(!visible(p,s*5)){culled++;return;}
      drawn++;
      objects.push({depth:p.y,draw:()=>{
        drawSprite(ctx,this.art,`${prefixAt(x,y)}.shelter.${stage}`,p.x,p.y,s*5.6,integrity<=0?.35:1);
        if(integrity<40){ctx.strokeStyle='#c49d63';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x-s*.6,p.y-s);ctx.lineTo(p.x-s*.3,p.y-s*.6);ctx.lineTo(p.x-s*.4,p.y);ctx.stroke();}
      }});
    };
    for (const [,x,y,,integrity] of v.shelters) structure(x,y,integrity===0?'foundation':'complete',integrity);
    for (const site of v.sites ?? []) {
      const p=project({x:site.x+.5,y:site.y+.5},c,size);
      const stage=constructionStage(site);
      if(stage!=='marker') structure(site.x,site.y,stage);
      else objects.push({depth:p.y,draw:()=>{ctx.strokeStyle='#e8c36e99';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(p.x,p.y-s*.45);ctx.lineTo(p.x+s*.9,p.y);ctx.lineTo(p.x,p.y+s*.45);ctx.lineTo(p.x-s*.9,p.y);ctx.closePath();ctx.stroke();ctx.setLineDash([]);}});
      const n=Object.values(site.need).reduce((a,b)=>a+b,0), delivered=Object.values(site.materials).reduce((a,b)=>a+b,0);
      if(delivered>0) objects.push({depth:p.y+.2,draw:()=>{ctx.fillStyle='#25332d';ctx.fillRect(p.x-s*.65,p.y+s*.2,s*1.3,Math.max(3,s*.1));ctx.fillStyle='#e8c36e';ctx.fillRect(p.x-s*.65,p.y+s*.2,s*1.3*Math.min(delivered/n,site.work/site.workNeed),Math.max(3,s*.1));}});
    }
    for(const stock of [...(v.piles ?? []),...(v.stores ?? [])]) {
      const p=project({x:stock.x+.85,y:stock.y+1},c,size);
      if(!visible(p,s*3))continue;
      const items=Object.entries(stock.items).filter(([,n])=>n>0);
      if(!items.length)continue;
      drawn++;
      objects.push({depth:p.y+.1,draw:()=>{
        if(stock.items.wood>0) drawSprite(ctx,this.art,'forest.stock.wood',p.x-s*.4,p.y,s*(1.3+.15*Math.min(6,stock.items.wood)));
        if(stock.items.stone>0) drawSprite(ctx,this.art,'desert.stock.stone-reeds',p.x+s*.4,p.y,s*(1.2+.1*Math.min(6,stock.items.stone)));
        // Food/material containers are generic; exact item quantities stay in evidence.
        const other=items.filter(([k])=>!['wood','stone'].includes(k)).reduce((n,[,q])=>n+q,0);
        if(other>0){const volume=.16+.01*Math.min(12,other);ctx.fillStyle='#846247';ctx.strokeStyle='#b29b6c';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p.x+s*.4,p.y-s*.12,s*volume,s*volume*.6,0,0,Math.PI*2);ctx.fill();ctx.stroke();}
      }});
    }
    for (const [,x,y] of v.fires) {
      const p=project({x:x+.5,y:y+.5},c,size);if(!visible(p,s*3))continue;
      drawn++;
      objects.push({depth:p.y,draw:()=>{
        const flicker=opts.motion?1+.1*Math.sin(now/160+x):1;
        const glow=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,s*1.3);glow.addColorStop(0,'#ffd46e55');glow.addColorStop(1,'#ffd46e00');ctx.fillStyle=glow;ctx.fillRect(p.x-s*1.3,p.y-s*1.3,s*2.6,s*2.6);
        ctx.strokeStyle='#725344';ctx.lineWidth=s*.16;ctx.beginPath();ctx.moveTo(p.x-s*.3,p.y);ctx.lineTo(p.x+s*.3,p.y-s*.15);ctx.moveTo(p.x-s*.3,p.y-s*.15);ctx.lineTo(p.x+s*.3,p.y);ctx.stroke();
        ctx.fillStyle='#e97e39';ctx.beginPath();ctx.moveTo(p.x-s*.25,p.y-s*.1);ctx.quadraticCurveTo(p.x-s*.3,p.y-s*.5*flicker,p.x+s*.08,p.y-s*.9*flicker);ctx.quadraticCurveTo(p.x+s*.5,p.y-s*.2,p.x+s*.15,p.y);ctx.fill();
        ctx.fillStyle='#ffe39b';ctx.beginPath();ctx.ellipse(p.x,p.y-s*.25,s*.1,s*.25,0,0,Math.PI*2);ctx.fill();
      }});
    }
    for (const r of f.residents) {
      const tr = this.tracks.get(r.id)!;
      if (!tr) continue;
      const t =
        opts.motion && !opts.recorded
          ? Math.max(0, Math.min(1, (now - tr.since) / tr.duration))
          : 1;
      const x = tr.from.x + (tr.to.x - tr.from.x) * t,
        y = tr.from.y + (tr.to.y - tr.from.y) * t,
        p = project({ x: x + 0.5, y: y + 0.5 }, c, size);
      // Global roster is for navigation. Only residents in the confirmed viewport are rendered.
      if (
        r.x < v.x0 ||
        r.y < v.y0 ||
        r.x >= v.x0 + v.w ||
        r.y >= v.y0 + v.h ||
        !visible(p, s * 3)
      ) {
        culled++;
        continue;
      }
      drawn++;
      const pose = residentPose(r, f, tr.moving && t < 1);
      const phase = opts.motion && !opts.recorded ? Math.floor(now/(pose==='walk'||pose==='carry'?145:pose==='sleep'?900:300)) : 0;
      const sprite = residentSprite(r,f,tr.moving && t<1,tr.direction,phase);
      const h = s * 3.2;
      this.hits.push({
        id: r.id,
        x: p.x,
        y: p.y - h * 0.28,
        r: Math.max(12, h * 0.28),
      });
      objects.push({
        depth: p.y + 0.1,
        draw: () => {
          ctx.fillStyle = "#243d2b2e";
          ctx.beginPath();
          ctx.ellipse(p.x, p.y + 1, s * 0.56, s * 0.24, 0, 0, 7);
          ctx.fill();
          if (r.id === opts.selected || r.health < 30) {
            ctx.strokeStyle = r.id === opts.selected ? "#fff1b0" : "#943e2d";
            ctx.lineWidth = r.id === opts.selected ? 2.5 : 2;
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, s * 0.8, s * 0.4, 0, 0, 7);
            ctx.stroke();
          }
          const mirror = (pose==='fish' && r.target ? r.target.x-r.target.y < r.x-r.y : tr.direction === 'sw') && !sprite.startsWith('idle.');
          ctx.save();
          if(mirror) {ctx.translate(p.x*2,0);ctx.scale(-1,1);}
          drawSprite(ctx,this.art,sprite,p.x,p.y,h);
          ctx.restore();
          const load=carried(r,f);
          if(Object.values(load).some(n=>n>0)&&!sprite.startsWith('carry.')&&!sprite.startsWith('gather.')){
            // Small neutral pouch for loads without a matching supplied pose; no false wood/fish.
            ctx.fillStyle='#9b7750';ctx.beginPath();ctx.ellipse(p.x+s*.38,p.y-s*.48,s*.14,s*.19,-.3,0,Math.PI*2);ctx.fill();
          }
          if(pose==='fish'&&r.target){
            const q=project({x:r.target.x+.5,y:r.target.y+.5},c,size);
            ctx.strokeStyle='#e8d9abbb';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(p.x+s*.48*(mirror?-1:1),p.y-s*.8);ctx.quadraticCurveTo((p.x+q.x)/2,Math.min(p.y,q.y)-s*.6,q.x,q.y);ctx.stroke();
            ctx.fillStyle='#db7954';ctx.beginPath();ctx.arc(q.x,q.y,Math.max(1.4,s*.06),0,Math.PI*2);ctx.fill();
          }
          if (r.id === opts.selected) {
            ctx.fillStyle = "#fff3c3";
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - h * 0.58 - 8);
            ctx.lineTo(p.x - 4, p.y - h * 0.58 - 14);
            ctx.lineTo(p.x + 4, p.y - h * 0.58 - 14);
            ctx.fill();
          }
        },
      });
    }
    objects.sort((a, b) => a.depth - b.depth);
    for (const o of objects) o.draw();
    if (opts.knowledge && f.inspector?.observation) {
      const o = f.inspector.observation,
        pts = [
          { x: o.self.x - o.radius, y: o.self.y - o.radius },
          { x: o.self.x + o.radius + 1, y: o.self.y - o.radius },
          { x: o.self.x + o.radius + 1, y: o.self.y + o.radius + 1 },
          { x: o.self.x - o.radius, y: o.self.y + o.radius + 1 },
        ].map((p) => project(p, c, size));
      ctx.fillStyle = "#112c3866";
      ctx.beginPath();
      ctx.rect(0, 0, size.w, size.h);
      ctx.moveTo(pts[0].x, pts[0].y);
      for (const p of pts.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.closePath();
      ctx.fill("evenodd");
      ctx.strokeStyle = "#fff1b0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (const p of pts.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.closePath();
      ctx.stroke();
    }
    this.stats.drawn = drawn;
    this.stats.culled = culled;
    this.stats.frames++;
    this.stats.drawTimes.push(performance.now() - start);
    if (this.stats.drawTimes.length > 300) this.stats.drawTimes.shift();
  }
  pick(x: number, y: number): number | null {
    let best: number | null = null,
      dist = Infinity;
    for (const hit of this.hits) {
      const d = Math.hypot(hit.x - x, hit.y - y);
      if (d < hit.r && d < dist) {
        dist = d;
        best = hit.id;
      }
    }
    return best;
  }
}
