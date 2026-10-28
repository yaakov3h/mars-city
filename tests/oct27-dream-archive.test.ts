import {it,expect} from 'vitest';
import world from '../src/world.ts?raw';
import main from '../src/main.ts?raw';
import state from '../data/city-state.json';
import events from '../data/events.json';
import {validateState,hex,districtPlots,random} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
import {ANNEX,annexLiftAt,reviewWalkable} from '../src/review-underground';
import {pilotOpening,OCT27_SHAFTS} from '../src/underground';
import {DREAM_ARCHIVE_ID,DREAM_PLOT,DREAM_SHAFT_POINT,DREAM_DOME,DREAMS,DREAM_BOOKS,DREAM_MAX_BOOK_Y,DREAM_BOOK_SCALE,HOLO_SCALE,HOLO_RISE,DREAM_CYCLE,DREAM_SLOT,HOLOGRAMS,dreamPhase,nextDream} from '../src/oct27-dream-archive';
const here=(a:any)=>a.theme==='dreams';
it('places the Dream Archive on its own free full plot with a valid state',()=>{
 const b=state.buildings.find(b=>b.id===DREAM_ARCHIVE_ID)!;expect(b.plot).toEqual({q:-6,r:7});expect(DREAM_PLOT).toEqual({q:-6,r:7});
 expect(validateState(state as any)).toEqual([]);
 const k=(p:any)=>p.q+','+p.r,mine=k(DREAM_PLOT);
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
 expect(buildable(-6,7)).toBe(true);const [x,z]=hex(-6,7,10);
 for(let i=0;i<360;i++)expect(Math.hypot(x-(random('rx'+i)-.5)*230,z-(random('rz'+i)-.5)*230)).toBeGreaterThan(10+.16+random('rs'+i)*1.35);
});
it('has its own dream room and lift at the same shaft point as the surface head, found by theme and not by position',()=>{
 const [cx,cz]=hex(-6,7,10);const i=ANNEX.findIndex(here);expect(i).toBeGreaterThan(0);expect(ANNEX.filter(here)).toHaveLength(1);
 const a=ANNEX[i];expect(a.x).toBeCloseTo(cx,5);expect(a.z).toBeCloseTo(cz,5);expect(a.fy).toBe(-8.4);
 const l=annexLiftAt(i);expect(l.x).toBeCloseTo(cx+DREAM_SHAFT_POINT.x,5);expect(l.z).toBeCloseTo(cz+DREAM_SHAFT_POINT.z,5);
 expect(OCT27_SHAFTS).toHaveLength(1);expect(pilotOpening(l.x,l.z)).toBe(true);expect(reviewWalkable(cx,cz)).toBe(true);
});
it('connects only to the explainer archive; the explainer gains only the door that faces it and no other room changes',()=>{
 const me=ANNEX.find(here)!,ex=ANNEX.find(a=>a.theme==='explainer')!,kn=ANNEX.find(a=>a.theme==='knowledge')!,pr=ANNEX.find(a=>a.theme==='professions')!;
 expect(me.doors).toEqual([300]);expect(ex.doors).toEqual([300,180,120]);expect(kn.doors).toEqual([180,0]);expect(pr.doors).toEqual([240,300,120,60,180]);
 expect(Math.hypot(ex.x-me.x,ex.z-me.z)).toBeCloseTo(10*Math.sqrt(3),6);
 expect((Math.atan2(me.z-ex.z,me.x-ex.x)*180/Math.PI+360)%360).toBeCloseTo(120,6);
 for(const a of ANNEX.filter(a=>a!==me&&a!==ex)){expect(Math.hypot(a.x-me.x,a.z-me.z)).toBeGreaterThan(13.6);}
 for(const a of ANNEX.filter(a=>a!==me))expect([a.x,a.z]).not.toEqual([me.x,me.z]);
});
it('lift centre is walkable with a free step in every direction',()=>{
 const i=ANNEX.findIndex(here),l=annexLiftAt(i);
 const clear=(x:number,z:number)=>reviewWalkable(x+.17,z)&&reviewWalkable(x-.17,z)&&reviewWalkable(x,z+.17)&&reviewWalkable(x,z-.17)&&reviewWalkable(x,z);
 expect(clear(l.x,l.z)).toBe(true);
 for(let k=0;k<720;k++){const a=k*Math.PI/360;expect(clear(l.x+Math.cos(a)*.1,l.z+Math.sin(a)*.1)).toBe(true);}
 expect(OCT27_SHAFTS[0].x0).toBeCloseTo(l.x-1,6);expect(OCT27_SHAFTS[0].z1).toBeCloseTo(l.z+1,6);
});
it('is reachable by walking from the standard entry and back, over the real walkable network, through the explainer room',()=>{
 const me=ANNEX.find(here)!,lift=annexLiftAt(ANNEX.indexOf(me));
 const step=.5,key=(i:number,j:number)=>i+','+j,ix=(x:number)=>Math.round(x/step);
 const near=(x:number,z:number)=>{for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++)if(reviewWalkable((ix(x)+a)*step,(ix(z)+b)*step))return [ix(x)+a,ix(z)+b];return null};
 const s=near(0,0)!,g=[ix(lift.x),ix(lift.z)];expect(s).toBeTruthy();expect(reviewWalkable(g[0]*step,g[1]*step)).toBe(true);
 const seen=new Set([key(s[0],s[1])]);const q=[s];
 while(q.length){const [i,j]=q.shift()!;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+di,nj=j+dj,k=key(ni,nj);if(seen.has(k))continue;if(Math.abs(ni*step)>110||Math.abs(nj*step)>130)continue;if(!reviewWalkable(ni*step,nj*step))continue;seen.add(k);q.push([ni,nj]);}}
 expect(seen.has(key(g[0],g[1]))).toBe(true);expect(seen.has(key(s[0],s[1]))).toBe(true);
 // the room centre is reachable too, and so is the middle of the new passage
 const ex=ANNEX.find(a=>a.theme==='explainer')!,mx=(me.x+ex.x)/2,mz=(me.z+ex.z)/2;
 expect(seen.has(key(ix(mx),ix(mz)))||reviewWalkable(mx,mz)).toBe(true);expect(reviewWalkable(mx,mz)).toBe(true);
});
it('levels its own hex and passes its animated parts to the renderer so the city merge cannot freeze them',()=>{
 expect(world).toContain("(kb.id===KNOWLEDGE_TREE_ID||kb.id===DREAM_ARCHIVE_ID)&&kb.plot");
 expect(world).toContain("dreamArchive(part,group,this,this.animated)");
 expect(world).toContain("if(o.userData.dreamTick){o.userData.dreamTick(t)}else if(o.userData.dreamPart){}");
 expect(world).toContain("dist=(b.id==='b-knowledge-tree-20261026'||b.id===DREAM_ARCHIVE_ID||");
});
it('keeps the dome inside its hex, below the declared height cap, with the lift cut clear of the dome',()=>{
 const {x,z,radius,height,maxHeight,hologramApex}=DREAM_DOME;
 expect(Math.hypot(x,z)+radius).toBeLessThan(9.94*.8660254-.5);
 expect(height).toBeLessThanOrEqual(maxHeight);expect(maxHeight+.35).toBeLessThanOrEqual(16);
 expect(radius+.35).toBeLessThan(9.94*.8660254);expect(Math.hypot(DREAM_SHAFT_POINT.x-x,DREAM_SHAFT_POINT.z-z)+1.4+.3).toBeLessThan(radius*Math.sqrt(1-Math.pow(2.6/height,2)));expect(DREAM_DOME.door.halfWidth*2).toBeGreaterThanOrEqual(3);expect(Math.hypot(DREAM_SHAFT_POINT.x,DREAM_SHAFT_POINT.z)).toBeGreaterThan(DREAM_DOME.door.halfWidth+1.4+.5);
 expect(DREAM_MAX_BOOK_Y+.55+.25+HOLO_RISE+1.32*HOLO_SCALE).toBeLessThanOrEqual(hologramApex);expect(hologramApex).toBeLessThan(height);
});
it('keeps the lift cab, roof cut and terrain opening inside the room walls, clear of the wall faces',()=>{
 const [cx]=hex(-6,7,10),inner=cx-(6.8*.8660254-.11),l=annexLiftAt(ANNEX.findIndex(here));
 expect(l.x-.57).toBeGreaterThan(inner+.5);expect(l.x-1.4).toBeGreaterThanOrEqual(inner);expect(OCT27_SHAFTS[0].x0).toBeGreaterThan(inner);
});
it('books never overlap: same-ring books keep their spacing and rings keep a height gap',()=>{
 for(let t=0;t<300;t+=7){const pos=DREAM_BOOKS.map(b=>{const a=t*b.speed+b.phase;return [Math.cos(a)*b.ring,b.y,Math.sin(a)*b.ring];});
  for(let i=0;i<pos.length;i++)for(let j=i+1;j<pos.length;j++){const flat=Math.hypot(pos[i][0]-pos[j][0],pos[i][2]-pos[j][2]),dy=Math.abs(pos[i][1]-pos[j][1]);expect(flat>1.1*DREAM_BOOK_SCALE+.2||dy>.5).toBe(true);}}
});
it('opens one book at a time on a calm 48 second cycle that cycles through the cat, tree, ship and island',()=>{
 expect(HOLOGRAMS).toEqual(['cat','tree','ship','island']);expect(DREAM_CYCLE).toBe(48);expect(DREAM_SLOT).toBe(12);
 const seen=new Set<number>();let rests=0;
 for(let t=0;t<DREAM_CYCLE*2;t+=.1){const p=dreamPhase(t);expect(p.open).toBeGreaterThanOrEqual(0);expect(p.open).toBeLessThanOrEqual(1);expect(p.alpha).toBeLessThanOrEqual(1);if(p.alpha>.99)seen.add(p.slot);if(p.open===0&&p.alpha===0)rests++;}
 expect([...seen].sort()).toEqual([0,1,2,3]);expect(rests).toBeGreaterThan(100);
 expect(dreamPhase(0).open).toBe(0);expect(dreamPhase(5).open).toBe(1);expect(dreamPhase(5).alpha).toBe(1);expect(dreamPhase(11).alpha).toBe(0);
});
it('reads short invented dreams in both languages, with the requested first dream and no personal data',()=>{
 expect(DREAMS[0].he).toBe('הלילה חלמתי על גשם. הייתי צריך לחפש מה זה.');
 for(const d of DREAMS){expect(d.he.length).toBeLessThan(80);expect(d.en.length).toBeLessThan(90);expect(d.he+d.en).not.toMatch(/@|\d{3}|http/i);}
 const first=nextDream();const again=Array.from({length:DREAMS.length},()=>nextDream());expect(first).toBeTruthy();expect(new Set(again).size).toBe(DREAMS.length);
 expect(main).toContain("b.id===DREAM_ARCHIVE_ID?label(nextDream())");
});
it('adds one abstract event and no private details',()=>{
 const ev=events.events.find(e=>e.id==='dream-archive-20261027')!;expect(ev.kind).toBe('expansion');expect(ev.summary.he.length).toBeGreaterThan(20);expect(ev.summary.en).toMatch(/dome/);
 const text=JSON.stringify([ev,state.buildings.find(b=>b.id===DREAM_ARCHIVE_ID)]);expect(text).not.toMatch(/@|whatsapp|alon|yaakov|noa/i);
});
