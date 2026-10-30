import type { Inspector } from './types';
const label=(v:string)=>v.replaceAll('_',' ');
const n=(v:number)=>Number.isFinite(v)?v.toFixed(2):'Unavailable';
export function AgencyEvidence({detail,tick}:{detail:Inspector;tick:number}){
 return <>
 {detail.goals&&<details className="exp-science exp-details" open>
  <summary>Goals<span>Persistent · bounded to four</span></summary>
  <div className="exp-science-body">
   <p className="exp-small exp-muted">Needs set the goal. Experience updates which steps help. Suspended goals can resume; repeated failures discourage a strategy.</p>
   {detail.goals.active.length?<ol className="exp-goals">{detail.goals.active.map(g=><li key={g.id}>
    <div className="exp-evidence-heading"><strong>{label(g.kind)}</strong><span>{g.status}</span></div>
    <p className="exp-small">Urgency {n(g.urgency)} · {tick-g.since} ticks retained · {g.steps} steps</p>
    <p className="exp-small exp-muted">Interrupted {g.interruptions} · resumed {g.resumed}</p>
    {g.avoiding.length>0&&<p className="exp-small">Avoiding after outcomes: {g.avoiding.map(label).join(', ')}</p>}
   </li>)}</ol>:<p className="exp-empty-note">No active goal at this tick.</p>}
   <details className="exp-details"><summary>Goal history & learned strategies</summary>
    {detail.goals.history.length?<ul className="exp-episodes">{detail.goals.history.slice().reverse().map(g=><li key={g.id}><b>{g.kind} · {g.how}</b><span>Ticks {g.since}–{g.ended} · {g.steps} steps · resumed {g.resumed}</span></li>)}</ul>:<p className="exp-small">No completed goal retained yet.</p>}
    <ul className="exp-episodes">{detail.goals.learned.map(g=><li key={g.goalStep}><b>{label(g.goalStep)}</b><span>{g.n} observations · mean progress {n(g.meanProgress)}</span></li>)}</ul>
   </details>
  </div>
 </details>}
 {detail.communication&&<details className="exp-science exp-details">
  <summary>Signals<span>Limited learned signaling</span></summary>
  <div className="exp-science-body">
   <p className="exp-small exp-muted">Neutral glyphs have no shared dictionary. Each resident learns local associations and response outcomes. Hearing can fail or be mistaken.</p>
   {detail.communication.associations.length?<ul className="exp-signal-associations">{detail.communication.associations.map(a=><li key={a.glyph}>
    <div className="exp-evidence-heading"><strong className="exp-glyph" aria-label={`Glyph ${a.glyph}`}>{a.glyph}</strong><span>{Math.round(a.confidence*100)}% outcome confidence</span></div>
    <p className="exp-small">Heard {a.heard} · responded {a.responded} · measured outcomes {a.outcomes}</p>
    <p className="exp-small">Mean response payoff {n(a.meanPayoff)}</p>
    <p className="exp-small exp-muted">{Object.keys(a.cooccurred).length?`Observed together: ${Object.entries(a.cooccurred).map(([key,count])=>`${label(key)} (${count})`).join(', ')}`:'No co-occurrence observed on arrival.'} These are associations, not meanings.</p>
   </li>)}</ul>:<p className="exp-empty-note">No local signal associations yet.</p>}
   <details className="exp-details"><summary>Heard & sent history</summary>
    <h3>Perceived signals · latest {detail.communication.heard.length}</h3>
    {detail.communication.heard.length?<ul className="exp-episodes">{detail.communication.heard.slice().reverse().map((g,i)=><li key={`${g.sig}:${i}`}><b>{g.glyph} from #{g.from} · tick {g.tick}</b><span>{g.dist} tiles away · {Math.round(g.conf*100)}% perceptual confidence · source {g.x}, {g.y}</span></li>)}</ul>:<p className="exp-small">Nothing heard in retained memory.</p>}
    <h3>Sent signals · latest {detail.communication.sent.length}</h3>
    {detail.communication.sent.length?<ul className="exp-episodes">{detail.communication.sent.slice().reverse().map((g,i)=><li key={`${g.sig}:${i}`}><b>{g.glyph} · tick {g.tick}</b><span>Simulator logged {g.heardBy} receptions · own context {label(g.ctx)} · observed response credit {n(g.credit??0)}</span></li>)}</ul>:<p className="exp-small">No emissions retained.</p>}
   </details>
   <details className="exp-details"><summary>Recent response steps</summary>
    <p className="exp-small exp-muted">These are movement outcomes from the last twelve episodes. Delayed wellbeing payoff is aggregated above.</p>
    {detail.episodes.some(e=>e.key.startsWith('respond|'))?<ul className="exp-episodes">{detail.episodes.filter(e=>e.key.startsWith('respond|')).slice().reverse().map((e,i)=><li key={i}><b>{e.key} · tick {e.tick}</b><span>{e.success?'Reached source':'Failed'} · {e.duration} ticks · movement reward {n(e.reward)}{e.reason?` · ${label(e.reason)}`:''}</span></li>)}</ul>:<p className="exp-small">No response step in the retained episodes. Associations can include older outcomes.</p>}
   </details>
   <details className="exp-details"><summary>Individual trust & sender learning</summary>
    <ul className="exp-data-list">{Object.entries(detail.communication.trust).map(([id,value])=><li key={id}><span>Trust in #{id}</span><b>{n(value)}</b></li>)}</ul>
    {!Object.keys(detail.communication.trust).length&&<p className="exp-small">No trust updates yet.</p>}
    <ul className="exp-episodes">{detail.communication.senderValues.map(v=><li key={v.key}><b>{label(v.key)}</b><span>{v.n} weighted observations · learned reward {n(v.reward)}</span></li>)}</ul>
   </details>
   <p className="exp-small exp-muted">Confidence = measured outcomes / (outcomes + 3), not correctness. Sending alone earns no reward.</p>
  </div>
 </details>}
 </>;
}
export function StoreKnowledge({detail}:{detail:Inspector}){
 if(!detail.knownStores)return null;
 return <details className="exp-details"><summary>Remembered stores · visit evidence</summary>
  <p className="exp-small exp-muted">Appearance can be seen at a distance. Exact stock is learned through a nearby interaction and stays stale until another visit.</p>
  {detail.knownStores.length?<ul className="exp-episodes">{detail.knownStores.map(s=><li key={s.id}>
   <b>#{s.id} · {s.x}, {s.y}{s.ruined?' · remembered ruin':''}</b>
   <span>{s.visited===null?'No visit recorded; contents unverified.':`Visited tick ${s.visited} · ${s.staleTicks??0} ticks old`}</span>
   {s.stock!==null&&<span>{s.visited===null?'Inherited memory (not reverified)':'Last known stock'}: {Object.entries(s.stock).filter(([,q])=>q>0).map(([k,q])=>`${q} ${label(k)}`).join(', ')||'empty'}</span>}
  </li>)}</ul>:<p className="exp-small">No shelters remembered.</p>}
 </details>;
}
