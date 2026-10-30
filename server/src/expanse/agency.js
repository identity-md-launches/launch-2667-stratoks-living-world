// Schema 5 agency: bounded persistent goals and limited learned local signalling.
// DESIGNED: goal triggers/satisfaction thresholds, the per-goal progress metric, bounds, signal range, attention
// and misperception rates, and the rule that signals carry no intrinsic reward.
// LEARNED (per resident, from its own experience): which first steps advance which goal (goalModel), when to give
// up on a strategy (avoid list from repeated failure), what each glyph co-occurs with (signal associations), how
// responding to a glyph pays off (outcome model key `respond|<glyph>|<trust>`), and whom to trust.
import { GLYPHS } from './capabilities.js';

export const AGENCY_VERSION = 1;
export const GOAL_LIMITS = Object.freeze({ goals: 4, avoid: 4, goalModel: 64, history: 8, maxAge: 1500, failsToAvoid: 2 });
export const SIGNAL = Object.freeze({ range: 6, attention: 0.85, distAttention: 0.08, misperceive: 0.06, distMisperceive: 0.03, heard: 6, ttl: 80, watch: 90, cooldown: 40, trust: 16, associations: 12, credit: 0.5, creditCap: 0.3, ring: 200 });

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// Designed metric whose increase means progress for a goal kind. Units are need points (0..100) / 20.
export function goalMetric(kind, c) {
  switch (kind) {
    case 'food': return -c.hunger / 20;
    case 'water': return -c.thirst / 20;
    case 'warmth': return c.warmth / 20;
    case 'rest': return c.energy / 20;
    case 'safety': return (c.health - c.injury / 10) / 20;
    case 'curiosity': return (c.mind.visited?.length ?? 0) / 4;
    case 'social': return Object.values(c.relationships ?? {}).reduce((s, v) => s + Math.max(0, v), 0);
    default: return 0;
  }
}
// Designed triggers. Returns {kind: urgency} for goals the resident's own state calls for right now.
function triggers(c, danger) {
  const t = {};
  if (c.hunger > 55) t.food = c.hunger / 100;
  if (c.thirst > 55) t.water = c.thirst / 100 + 0.05;
  if (c.warmth < 55) t.warmth = (100 - c.warmth) / 100;
  if (c.energy < 30) t.rest = (100 - c.energy) / 120;
  if (danger) t.safety = 1.5;
  const calm = c.hunger < 45 && c.thirst < 45 && c.energy > 40 && c.warmth > 60;
  if (calm && c.personality.curiosity > 0.45) t.curiosity = 0.2 + 0.2 * c.personality.curiosity;
  if (calm && c.personality.sociability > 0.55) t.social = 0.15 + 0.2 * c.personality.sociability;
  return t;
}
function satisfied(g, c, tick) {
  switch (g.kind) {
    case 'food': return c.hunger < 25;
    case 'water': return c.thirst < 25;
    case 'warmth': return c.warmth > 80;
    case 'rest': return c.energy > 75;
    case 'safety': return tick - (c.lastDanger ?? -1e9) > 60;
    case 'curiosity': return goalMetric('curiosity', c) - g.start >= 0.75;
    case 'social': return goalMetric('social', c) - g.start >= 0.08;
    default: return true;
  }
}
export function ensureAgency(c) {
  const m = c.mind;
  m.goals ??= []; m.goalModel ??= {}; m.goalHistory ??= []; m.goalSeq ??= 0;
  m.heard ??= []; m.signals ??= {}; m.sent ??= [];
  c.trust ??= {}; c.signalWatch ??= null;
  return c;
}
// Updates the goal list from the resident's state. Returns the active goal (or null) and records interruption /
// resumption. Bounded: at most GOAL_LIMITS.goals goals, oldest low-urgency goal dropped first.
export function updateGoals(c, tick, danger) {
  const m = c.mind, trig = triggers(c, danger);
  for (const g of m.goals) {
    if (satisfied(g, c, tick)) closeGoal(m, g, tick, 'achieved');
    else if (tick - g.since > GOAL_LIMITS.maxAge) closeGoal(m, g, tick, 'abandoned');
  }
  m.goals = m.goals.filter((g) => !g.closed);
  for (const [kind, u] of Object.entries(trig)) {
    const g = m.goals.find((q) => q.kind === kind);
    if (g) { g.urgency = Math.round(u * 1000) / 1000; continue; }
    m.goals.push({ id: ++m.goalSeq, kind, since: tick, urgency: Math.round(u * 1000) / 1000, status: 'pending', start: goalMetric(kind, c), steps: 0, fails: {}, avoid: [], interruptions: 0, resumed: 0 });
  }
  for (const g of m.goals) if (!trig[g.kind]) g.urgency = Math.round(g.urgency * 0.9 * 1000) / 1000; // fades but persists until met
  while (m.goals.length > GOAL_LIMITS.goals) { m.goals.sort((a, b) => b.urgency - a.urgency || a.id - b.id); closeGoal(m, m.goals.pop(), tick, 'displaced'); }
  m.goals.sort((a, b) => b.urgency - a.urgency || a.id - b.id);
  const top = m.goals[0] ?? null;
  for (const g of m.goals) {
    if (g === top) { if (g.status === 'suspended') { g.resumed++; g.status = 'active'; } else g.status = 'active'; }
    else if (g.status === 'active') { g.status = 'suspended'; g.interruptions++; g.suspendedBy = top?.kind ?? null; }
  }
  return top;
}
function closeGoal(m, g, tick, how) {
  g.closed = true;
  m.goalHistory.push({ id: g.id, kind: g.kind, since: g.since, ended: tick, how, steps: g.steps, interruptions: g.interruptions, resumed: g.resumed, avoided: g.avoid.slice() });
  if (m.goalHistory.length > GOAL_LIMITS.history) m.goalHistory.shift();
  m.goalStats ??= {}; const s = (m.goalStats[g.kind] ??= { achieved: 0, abandoned: 0, displaced: 0 }); s[how] = (s[how] ?? 0) + 1;
}
// Learned bias of a first step for the active goal: mean observed goal progress after that step while the goal was
// active; unknown steps get a small optimistic prior; strategies the resident gave up on are penalised.
export function goalBias(m, goal, key) {
  if (!goal) return 0;
  if (goal.avoid.includes(key)) return -1;
  const e = m.goalModel[`${goal.kind}|${key}`];
  if (!e) return 0.1;
  return clamp(e.gain, -1, 1.5) * Math.min(1, e.n / 3);
}
export function learnGoal(m, goal, key, gain, success, tick, learn) {
  if (!goal) return;
  goal.steps++;
  if (success && gain > 0) delete goal.fails[key];
  else { goal.fails[key] = (goal.fails[key] ?? 0) + 1; if (goal.fails[key] >= GOAL_LIMITS.failsToAvoid && !goal.avoid.includes(key)) { goal.avoid.push(key); if (goal.avoid.length > GOAL_LIMITS.avoid) goal.avoid.shift(); goal.switched = (goal.switched ?? 0) + 1; } }
  const fk = Object.keys(goal.fails); if (fk.length > 8) delete goal.fails[fk[0]];
  if (!learn) return;
  const k = `${goal.kind}|${key}`;
  let e = m.goalModel[k];
  if (!e) {
    const keys = Object.keys(m.goalModel);
    if (keys.length >= GOAL_LIMITS.goalModel) { let w = keys[0]; for (const q of keys) if (m.goalModel[q].n - m.goalModel[q].t * 1e-7 < m.goalModel[w].n - m.goalModel[w].t * 1e-7) w = q; delete m.goalModel[w]; }
    e = m.goalModel[k] = { n: 0, gain: 0, t: 0 };
  }
  e.n = Math.min(e.n + 1, 50); e.gain += (gain - e.gain) / e.n; e.t = tick; e.gain = Math.round(e.gain * 1e4) / 1e4;
}

// ---------------- limited learned signalling ----------------
// A neutral glyph is emitted at the sender's position. Receivers in range perceive it only if attending (lower
// when resting or far), and may misperceive it as another glyph. Nothing is translated: the receiver stores what
// it heard, then what it itself observed on responding, and the outcome.
export function perceiveSignal(rng, sender, receiver, glyph, dist, sig) {
  const resting = receiver.act?.prim === 'rest';
  const pAttend = clamp(SIGNAL.attention - SIGNAL.distAttention * dist - (resting ? 0.4 : 0), 0.05, 1);
  if (rng.next() >= pAttend) return null;
  let heard = glyph, mis = false;
  if (rng.next() < SIGNAL.misperceive + SIGNAL.distMisperceive * dist) { const others = GLYPHS.filter((g) => g !== glyph); heard = others[rng.int(others.length)]; mis = true; }
  const m = receiver.mind;
  m.heard.push({ sig: sig.id, from: sender.id, glyph: heard, x: sender.x, y: sender.y, tick: sig.tick, dist, conf: Math.round(clamp(1 - 0.1 * dist, 0.2, 1) * 100) / 100 });
  if (m.heard.length > SIGNAL.heard) m.heard.shift();
  const a = association(m, heard); a.heard++;
  return { heard, mis };
}
export function association(m, glyph) {
  let a = m.signals[glyph];
  if (!a) {
    const keys = Object.keys(m.signals);
    if (keys.length >= SIGNAL.associations) delete m.signals[keys[0]];
    a = m.signals[glyph] = { heard: 0, responded: 0, payoff: 0, n: 0, seen: {} };
  }
  return a;
}
// Co-occurrence: what the receiver itself perceived where it went after hearing the glyph (bounded categories).
export function noteCooccurrence(a, cats) {
  for (const k of cats) a.seen[k] = (a.seen[k] ?? 0) + 1;
  const keys = Object.keys(a.seen);
  if (keys.length > 6) { keys.sort((x, y) => a.seen[x] - a.seen[y]); delete a.seen[keys[0]]; }
}
export function confidence(a) { return Math.round((a.n / (a.n + 3)) * 100) / 100; }
export function trustBucket(c, from) { const t = c.trust[from] ?? 0; return t > 0.2 ? 'trusted' : t < -0.2 ? 'distrusted' : 'unknown'; }
export function updateTrust(c, from, good) {
  c.trust[from] = clamp((c.trust[from] ?? 0) + (good ? 0.1 : -0.06), -1, 1);
  const k = Object.keys(c.trust); if (k.length > SIGNAL.trust) delete c.trust[k[0]];
}
// Sender context: the coarse category of the most salient thing the sender itself perceives. It is an
// observation feature, not a meaning; which glyph a sender uses in which context is learned.
export function salientCategory(obs, c) {
  if (c.lastAttacker || c.threatenedBy) return 'threat';
  if (obs.fires.length) return 'fire';
  const crop = (obs.crops ?? []).find((q) => q.ripe); if (crop) return 'crop';
  const food = obs.nodes.find((n) => ['bush', 'cactus', 'shellfish', 'lichen', 'fish'].includes(n.kind) && n.units > 0);
  if (food) return `node:${food.kind}`;
  if (obs.water) return 'water';
  if (obs.shelters.length) return 'shelter';
  return 'none';
}
