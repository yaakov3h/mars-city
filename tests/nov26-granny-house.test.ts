import {it,expect} from 'vitest';
import world from '../src/world.ts?raw';
import tower from '../src/nov26-granny-house.ts?raw';
import state from '../data/city-state.json';
import events from '../data/events.json';
import {validateState,validateEvent,hex,random,districtPlots} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
import {GRANNY_HOUSE_ID,GRANNY_HOUSE_PLOT,GRANNY_HOUSE_NAME} from '../src/nov26-granny-house';
const here=(b:any)=>b.id===GRANNY_HOUSE_ID;
const k=(p:any)=>p.q+','+p.r;
it('places the Granny House on its own free plot as part of the Story Stars district, with a valid state',()=>{
 const b=state.buildings.find(here)!;expect(b.plot).toEqual({q:6,r:0});expect(GRANNY_HOUSE_PLOT).toEqual({q:6,r:0});
 expect(b.districtId).toBe('district-story-stars-20261119');expect(b.name.he).toBe('בית סבתא');
 expect(validateState(state as any)).toEqual([]);
 const mine=k(GRANNY_HOUSE_PLOT);
 expect(state.buildings.filter(x=>x.plot&&k(x.plot)===mine)).toHaveLength(1);
 const others=new Map<string,string>();
 for(const d of state.districts)for(const p of districtPlots(d as any))if(!(d.id==='district-story-stars-20261119'&&k(p)===mine))others.set(k(p),'district');
 for(const l of state.landmarks)others.set(k(l),'landmark');
 for(const i of (state as any).installations??[])for(const p of i.plots)others.set(k(p),'installation');
 for(const p of (state as any).mosaic?.hexes??[])others.set(k(p),'mosaic');
 expect(others.has(mine)).toBe(false);
 for(const held of ['-3,6','0,2','0,-5','0,-4'])expect(mine).not.toBe(held);
 const sd=state.districts.find(d=>d.id==='district-story-stars-20261119')!;
 expect(sd.plots!.map(p=>k(p))).toEqual(['5,0','5,1','6,0']);
 expect(state.districts.filter(d=>d.id.includes('story-stars'))).toHaveLength(1);
});
it('sits on buildable ground and clears the model-random rocks',()=>{
 expect(buildable(6,0)).toBe(true);const [x,z]=hex(6,0,10);
 for(let i=0;i<360;i++)expect(Math.hypot(x-(random('rx'+i)-.5)*230,z-(random('rz'+i)-.5)*230)).toBeGreaterThan(10+.16+random('rs'+i)*1.35);
});
it('is its own module, fully above ground, and world.ts only imports, dispatches and pads it',()=>{
 expect(tower).not.toMatch(/underground|lift|shaft|elevator|cutRoofWindows|מעלית/i);
 expect(world).toContain("grannyHouse");
 expect(world).toContain('if(b.id===GRANNY_HOUSE_ID){grannyHouse(part,group,this);return group;}');
 expect(world).toContain('kb.id===SHELF_TOWER_ID||kb.id===GRANNY_HOUSE_ID)&&kb.plot');
 expect(GRANNY_HOUSE_NAME).toBe('בית סבתא');
});
it('keeps the identity: aircraft wallpaper, lace, embroidery hoops, yarn ball',()=>{
 for(const s of ['preserveRealismSurface','hoopTexture','lace','yarn','CanvasTexture'])expect(tower.toLowerCase()).toContain(s.toLowerCase());
});
it('carries no private names, workplace words or insignia',()=>{
 expect(tower).not.toMatch(/יעקב|אלון|נועה|גפן|Noa|emblem|EMBLEM|להבים|כוכב כחול|logo/i);
 const ev=events.events.find(e=>e.id==='granny-house-20261126')!;
 expect(JSON.stringify(ev)).not.toMatch(/יעקב|אלון|נועה|גפן|להבים|כוכב כחול|emblem|logo|https?:\/\/|#\d/i);
});
it('ledger entry is one Story Stars building, above ground, abstract',()=>{
 const ev=events.events.find(e=>e.id==='granny-house-20261126')!;
 expect(validateEvent(ev as any)).toEqual([]);
 expect(ev.occurredAt).toBe(state.buildings.find(here)!.createdAt);
 expect(ev.summary.he).toContain('בית סבתא');expect(ev.summary.he).toContain('מעל הקרקע');
 expect(ev.summary.en).toContain('above ground');expect(ev.summary.en).toContain('Granny House');
 expect(events.events.filter(e=>e.id==='granny-house-20261126')).toHaveLength(1);
 expect(state.revision).toBe(67);
 expect(state.buildings.at(-1)!.id).toBe(GRANNY_HOUSE_ID);expect(events.events.at(-1)!.id).toBe('granny-house-20261126');
});
