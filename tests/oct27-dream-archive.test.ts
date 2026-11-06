import {it,expect} from 'vitest';
import world from '../src/world.ts?raw';
import main from '../src/main.ts?raw';
import state from '../data/city-state.json';
import events from '../data/events.json';
import {validateState,hex,districtPlots,random} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
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
