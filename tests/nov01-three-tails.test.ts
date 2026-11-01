import {it,expect} from 'vitest';
import world from '../src/world.ts?raw';
import main from '../src/main.ts?raw';
import state from '../data/city-state.json';
import events from '../data/events.json';
import {validateState,hex,districtPlots,random} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
import {ANNEX,annexLiftAt,reviewWalkable,TAILS_BLOCKS} from '../src/review-underground';
import {pilotOpening,NOV1_SHAFTS} from '../src/underground';
import {THREE_TAILS_ID,TAILS_PLOT,TAILS_SHAFT_POINT,TAILS,TAIL_RING,TAIL_RADIUS,TAIL_ORB,TAILS_MAX_HEIGHT,TAILS_PODS,TAILS_NOTES,nextTailNote,tailBase} from '../src/nov01-three-tails';
const here=(a:any)=>a.theme==='tails';
it('places Three Tails on its own free full plot with a valid state',()=>{
 const b=state.buildings.find(b=>b.id===THREE_TAILS_ID)!;expect(b.plot).toEqual({q:-5,r:7});expect(TAILS_PLOT).toEqual({q:-5,r:7});
 expect(validateState(state as any)).toEqual([]);
 const k=(p:any)=>p.q+','+p.r,mine=k(TAILS_PLOT);
 expect(state.buildings.filter(x=>x.plot&&k(x.plot)===mine)).toHaveLength(1);
 const others=new Map<string,string>();
 for(const d of state.districts)for(const p of districtPlots(d as any))if(!(d.id==='district-genesis-20260930'&&k(p)===mine))others.set(k(p),'district');
 for(const l of state.landmarks)others.set(k(l),'landmark');
 for(const i of (state as any).installations??[])for(const p of i.plots)others.set(k(p),'installation');
 for(const p of (state as any).mosaic?.hexes??[])others.set(k(p),'mosaic');
 expect(others.has(mine)).toBe(false);
 for(const held of ['-3,6','0,2','0,-5','0,-4'])expect(mine).not.toBe(held);
 expect(state.buildings.some(x=>x.plot&&x.plot.q===-3&&x.plot.r===6)).toBe(false);
 expect(state.districts.find(d=>d.id==='district-genesis-20260930')!.plots!.filter(p=>k(p)===mine)).toHaveLength(1);
});
it('clears every one of the 360 model-random rocks and sits on buildable ground',()=>{
 expect(buildable(-5,7)).toBe(true);const [x,z]=hex(-5,7,10);
 for(let i=0;i<360;i++)expect(Math.hypot(x-(random('rx'+i)-.5)*230,z-(random('rz'+i)-.5)*230)).toBeGreaterThan(10+.16+random('rs'+i)*1.35);
});
it('has its own rest room and lift at the same shaft point as the surface head, found by theme and not by position',()=>{
 const [cx,cz]=hex(-5,7,10);const i=ANNEX.findIndex(here);expect(i).toBeGreaterThan(0);expect(ANNEX.filter(here)).toHaveLength(1);
 const a=ANNEX[i];expect(a.x).toBeCloseTo(cx,5);expect(a.z).toBeCloseTo(cz,5);expect(a.fy).toBe(-8.4);
 const l=annexLiftAt(i);expect(l.x).toBeCloseTo(cx+TAILS_SHAFT_POINT.x,5);expect(l.z).toBeCloseTo(cz+TAILS_SHAFT_POINT.z,5);
 expect(NOV1_SHAFTS).toHaveLength(1);expect(pilotOpening(l.x,l.z)).toBe(true);expect(reviewWalkable(cx,cz)).toBe(true);
});
it('connects only to the dream room; the dream room gains only the door that faces it and no other room changes',()=>{
 const me=ANNEX.find(here)!,dr=ANNEX.find(a=>a.theme==='dreams')!,ex=ANNEX.find(a=>a.theme==='explainer')!,kn=ANNEX.find(a=>a.theme==='knowledge')!,pr=ANNEX.find(a=>a.theme==='partnership')!;
 expect(me.doors).toEqual([180]);expect(dr.doors).toEqual([300,0]);expect(ex.doors).toEqual([300,180,120]);expect(kn.doors).toEqual([180,0]);expect(pr.doors).toEqual([240]);
 expect(Math.hypot(dr.x-me.x,dr.z-me.z)).toBeCloseTo(10*Math.sqrt(3),6);
 for(const a of ANNEX.filter(a=>a!==me&&a!==dr)){expect(Math.hypot(a.x-me.x,a.z-me.z)).toBeGreaterThan(13.6);}
 for(const a of ANNEX.filter(a=>a!==me))expect([a.x,a.z]).not.toEqual([me.x,me.z]);
});
it('lift centre is walkable with a free step in every direction',()=>{
 const i=ANNEX.findIndex(here),l=annexLiftAt(i);
 const clear=(x:number,z:number)=>reviewWalkable(x+.17,z)&&reviewWalkable(x-.17,z)&&reviewWalkable(x,z+.17)&&reviewWalkable(x,z-.17)&&reviewWalkable(x,z);
 expect(clear(l.x,l.z)).toBe(true);
 for(let k=0;k<720;k++){const a=k*Math.PI/360;expect(clear(l.x+Math.cos(a)*.1,l.z+Math.sin(a)*.1)).toBe(true);}
 expect(NOV1_SHAFTS[0].x0).toBeCloseTo(l.x-1,6);expect(NOV1_SHAFTS[0].z1).toBeCloseTo(l.z+1,6);
});
it('is reachable by walking from the standard entry and back, over the real walkable network, through the dream room',()=>{
 const me=ANNEX.find(here)!,lift=annexLiftAt(ANNEX.indexOf(me));
 const step=.5,key=(i:number,j:number)=>i+','+j,ix=(x:number)=>Math.round(x/step);
 const near=(x:number,z:number)=>{for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++)if(reviewWalkable((ix(x)+a)*step,(ix(z)+b)*step))return [ix(x)+a,ix(z)+b];return null};
 const s=near(0,0)!,g=[ix(lift.x),ix(lift.z)];expect(s).toBeTruthy();expect(reviewWalkable(g[0]*step,g[1]*step)).toBe(true);
 const seen=new Set([key(s[0],s[1])]);const q=[s];
 while(q.length){const [i,j]=q.shift()!;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+di,nj=j+dj,k=key(ni,nj);if(seen.has(k))continue;if(Math.abs(ni*step)>110||Math.abs(nj*step)>130)continue;if(!reviewWalkable(ni*step,nj*step))continue;seen.add(k);q.push([ni,nj]);}}
 expect(seen.has(key(g[0],g[1]))).toBe(true);expect(seen.has(key(s[0],s[1]))).toBe(true);
 const dr=ANNEX.find(a=>a.theme==='dreams')!,mx=(me.x+dr.x)/2,mz=(me.z+dr.z)/2;
 expect(seen.has(key(ix(mx),ix(mz)))||reviewWalkable(mx,mz)).toBe(true);expect(reviewWalkable(mx,mz)).toBe(true);
});
it('blocks its three nest pods in the walkable map while the centre, door lane and lift stay clear',()=>{
 const [cx,cz]=hex(-5,7,10);
 expect(TAILS_BLOCKS).toHaveLength(3);
 for(const p of TAILS_PODS){expect(reviewWalkable(cx+p.x,cz+p.z)).toBe(false);expect(Math.hypot(p.x,p.z)+p.block).toBeLessThan(6.8*.8660254-.11);}
 expect(reviewWalkable(cx,cz)).toBe(true);
 for(const p of TAILS_PODS){const dx=p.x-TAILS_SHAFT_POINT.x,dz=p.z-TAILS_SHAFT_POINT.z;expect(Math.hypot(dx,dz)).toBeGreaterThan(p.block+.3);}
 // door lane at 180 degrees (toward the dream room) stays open from centre to the wall
 for(let d=0;d<=5;d+=.25)expect(reviewWalkable(cx-d,cz)).toBe(true);
});
it('levels its own hex and passes its animated parts to the renderer so the city merge cannot freeze them',()=>{
 expect(world).toContain("kb.id===THREE_TAILS_ID&&kb.plot");
 expect(world).toContain("threeTails(part,group,this,this.animated)");
 expect(world).toContain("b.id===DREAM_ARCHIVE_ID||b.id===THREE_TAILS_ID||b.id===BACKUP_VAULT_ID");
 expect(world).toContain("else if(o.userData.pulse)");
});
it('keeps the tails inside the hex, below the height cap, with the lift and the name strip clear of every tail',()=>{
 expect(TAIL_RING+TAIL_RADIUS).toBeLessThan(9.94*.8660254-.5);
 expect(TAILS_MAX_HEIGHT).toBeLessThanOrEqual(16);
 for(const t of TAILS){const b=tailBase(t.angle);
  expect(Math.hypot(b.x-TAILS_SHAFT_POINT.x,b.z-TAILS_SHAFT_POINT.z)).toBeGreaterThan(TAIL_RADIUS+.74+.3);
  expect(Math.hypot(b.x-0,b.z-6.2)).toBeGreaterThan(TAIL_RADIUS+1.6+.2);}
 expect(TAILS).toHaveLength(3);expect(new Set(TAILS.map(t=>t.angle)).size).toBe(3);
 expect(Math.max(...TAILS.map(t=>t.height))+TAIL_ORB).toBe(TAILS_MAX_HEIGHT);
});
it('keeps the lift shaft and terrain opening inside the room walls, clear of the wall faces',()=>{
 const [cx]=hex(-5,7,10),inner=cx-(6.8*.8660254-.11),l=annexLiftAt(ANNEX.findIndex(here));
 expect(l.x-.57).toBeGreaterThan(inner+.5);expect(l.x-1.4).toBeGreaterThanOrEqual(inner);expect(NOV1_SHAFTS[0].x0).toBeGreaterThan(inner);
});
it('reads short invented notes in both languages, with no personal data',()=>{
 for(const n of TAILS_NOTES){expect(n.he.length).toBeLessThan(80);expect(n.en.length).toBeLessThan(90);expect(n.he+n.en).not.toMatch(/@|\d{3}|http/i);}
 const first=nextTailNote();const again=Array.from({length:TAILS_NOTES.length},()=>nextTailNote());expect(first).toBeTruthy();expect(new Set(again).size).toBe(TAILS_NOTES.length);
 expect(main).toContain("b.id===THREE_TAILS_ID?label(nextTailNote())");
});
it('adds one abstract event and no private details',()=>{
 const ev=events.events.find(e=>e.id==='three-tails-20261101')!;expect(ev.kind).toBe('expansion');expect(ev.summary.he.length).toBeGreaterThan(20);expect(ev.summary.en).toMatch(/tail/i);
 const text=JSON.stringify([ev,state.buildings.find(b=>b.id===THREE_TAILS_ID)]);expect(text).not.toMatch(/@|whatsapp|alon|yaakov|noa/i);
});
