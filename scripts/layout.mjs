// Permanent terrain reserves and deterministic random edge growth. Never relocate old entities.
export const HEX_SIZE=10;
export const CRATERS=Object.freeze([
 Object.freeze({id:'crater-east',x:29,z:-25,radius:13}),
 Object.freeze({id:'crater-west',x:-42,z:24,radius:10}),
 Object.freeze({id:'crater-south',x:58,z:35,radius:18})
]);
export const EDGES=[[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]];
export const hexCenter=(q,r)=>[HEX_SIZE*Math.sqrt(3)*(q+r/2),HEX_SIZE*1.5*r];
export function buildable(q,r){const [x,z]=hexCenter(q,r);return CRATERS.every(c=>Math.hypot(x-c.x,z-c.z)>c.radius*1.22+HEX_SIZE+.8)}
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
export function nextHex(districts,landmarks,seed){
 const all=[...districts.flatMap(d=>d.plots??[d]),...landmarks],occupied=new Set(all.map(d=>`${d.q},${d.r}`)),candidates=new Map();
 if(!all.length){if(!buildable(0,0))throw Error('Origin is protected terrain');return {q:0,r:0}}
 for(const d of all)for(const [dq,dr] of EDGES){const q=d.q+dq,r=d.r+dr,key=`${q},${r}`;if(!occupied.has(key)&&buildable(q,r))candidates.set(key,{q,r})}
 const free=[...candidates.values()].sort((a,b)=>a.q-b.q||a.r-b.r);
 if(!free.length)throw Error('No free buildable edge; do not create disconnected islands');
 return free[hash(seed)%free.length];
}
