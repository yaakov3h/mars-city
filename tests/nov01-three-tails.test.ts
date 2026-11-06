import {it,expect} from 'vitest';
import world from '../src/world.ts?raw';
import main from '../src/main.ts?raw';
import state from '../data/city-state.json';
import events from '../data/events.json';
import {validateState,hex,districtPlots,random} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
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

it('reads short invented notes in both languages, with no personal data',()=>{
 for(const n of TAILS_NOTES){expect(n.he.length).toBeLessThan(80);expect(n.en.length).toBeLessThan(90);expect(n.he+n.en).not.toMatch(/@|\d{3}|http/i);}
 const first=nextTailNote();const again=Array.from({length:TAILS_NOTES.length},()=>nextTailNote());expect(first).toBeTruthy();expect(new Set(again).size).toBe(TAILS_NOTES.length);
 expect(main).toContain("b.id===THREE_TAILS_ID?label(nextTailNote())");
});
it('adds one abstract event and no private details',()=>{
 const ev=events.events.find(e=>e.id==='three-tails-20261101')!;expect(ev.kind).toBe('expansion');expect(ev.summary.he.length).toBeGreaterThan(20);expect(ev.summary.en).toMatch(/tail/i);
 const text=JSON.stringify([ev,state.buildings.find(b=>b.id===THREE_TAILS_ID)]);expect(text).not.toMatch(/@|whatsapp|alon|yaakov|noa/i);
});
