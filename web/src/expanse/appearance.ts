import type { Resident, WorldFrame } from './types';
export function constructionStage(site: NonNullable<WorldFrame['view']['sites']>[number]) {
  if (!Object.values(site.materials).some(n=>n>0)) return 'marker';
  return site.stage>=1 ? 'frame' : 'foundation';
}
export type Pose = 'idle' | 'walk' | 'rest' | 'sleep' | 'gather' | 'carry' | 'build' | 'fish';
export function carried(r: Resident, f: WorldFrame) {
  return r.carrying ?? (f.inspector?.id === r.id ? f.inspector.inventory : {});
}
// The living extension is authoritative. A legacy primitive names an intention,
// not evidence of arrival/work; legacy frames therefore use a neutral pose.
export function residentPose(r: Resident, f: WorldFrame, moving: boolean): Pose {
  const load=carried(r,f);
  if (moving || r.state === 'travel') return Object.values(load).some(n=>n>0) ? 'carry' : moving ? 'walk' : 'idle';
  if (r.state === 'fish' && r.tools?.includes('fish_line') && ['cast','wait','reel'].includes(r.phase ?? '')) return 'fish';
  if (r.state === 'sleep') return 'sleep';
  if (r.state === 'rest') return 'rest';
  const workTool=r.tools?.some(t=>t==='hand_axe'||t==='stone_club');
  if (workTool && ((r.state === 'construct' && r.phase === 'construct' && (f.view.sites ?? []).some(s=>s.x===r.target?.x && s.y===r.target?.y && Object.values(s.materials).some(n=>n>0))) || (r.state === 'repair' && r.phase === 'work' && Object.values(load).some(n=>n>0)))) return 'build';
  // Gathering art contains berries: don't show a harvested berry before one exists.
  if (r.state === 'gather' && (load.berry ?? 0)>0) return 'gather';
  if ((load.wood ?? 0)>0 || (load.berry ?? 0)>0) return 'carry';
  return 'idle';
}
export function residentSprite(r: Resident, f: WorldFrame, moving: boolean, direction: string, phase: number): string {
  const pose=residentPose(r,f,moving), load=carried(r,f);
  const backward = direction === 'ne' || direction === 'nw';
  if (pose==='fish') return r.phase==='cast' ? `fish.cast.${phase%2}` : r.phase==='wait' ? 'fish.wait' : 'fish.reel';
  if(pose==='sleep') return `rest.sleep.${phase%2}`;
  if(pose==='rest') return 'rest.settle';
  if(pose==='build') return phase%2 ? 'build.raise.0' : 'build.strike.0';
  if(pose==='gather') return ['gather.reach','gather.crouch','gather.lift'][phase%3];
  if(pose==='carry') {
    if ((load.wood ?? 0)>0) return `carry.wood.${phase%2}`;
    if ((load.berry ?? 0)>0) return 'carry.berries';
    // No fabricated material substitute. The generic pouch is drawn separately.
  }
  // Supplied work/walk poses face SE only. Mirroring for SW is done at draw time;
  // backward travel retains its real rear view rather than pretending new frames exist.
  if((pose==='walk'||pose==='carry')&&!backward) return `walk.southeast.${phase%6}`;
  return backward ? (direction==='ne'?'idle.northeast':'idle.back') : direction==='sw'?'idle.southwest':'idle.southeast';
}
