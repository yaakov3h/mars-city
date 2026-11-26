import {it,expect} from 'vitest';
import world from '../src/world.ts?raw';
import cafe from '../src/nov18-oxygen-cafe.ts?raw';
import state from '../data/city-state.json';
import events from '../data/events.json';
import {validateState,validateEvent,hex,random,districtPlots} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
import {OXYGEN_CAFE_ID,OXYGEN_CAFE_PLOT,OXYGEN_CAFE,OXYGEN_CAFE_SIGN,CAFE_ENAMEL} from '../src/nov18-oxygen-cafe';
import {CONNECTION_GATE_PLOT} from '../src/nov10-connection-gate';
const here=(b:any)=>b.id===OXYGEN_CAFE_ID;
const k=(p:any)=>p.q+','+p.r;
const dist=(a:{q:number,r:number},b:{q:number,r:number})=>(Math.abs(a.q-b.q)+Math.abs(a.r-b.r)+Math.abs(a.q-b.q+a.r-b.r))/2;
it('places the Oxygen Cafe on its own free full plot beside the gate and the tower, with a valid state',()=>{
 const b=state.buildings.find(here)!;expect(b.plot).toEqual({q:5,r:-1});expect(OXYGEN_CAFE_PLOT).toEqual({q:5,r:-1});
 expect(b.name.he).toBe('קפה חמצן');
 expect(validateState(state as any)).toEqual([]);
 const mine=k(OXYGEN_CAFE_PLOT);
 expect(state.buildings.filter(x=>x.plot&&k(x.plot)===mine)).toHaveLength(1);
 const others=new Map<string,string>();
 for(const d of state.districts)for(const p of districtPlots(d as any))if(!(d.id==='district-oxygen-cafe-20261118'&&k(p)===mine))others.set(k(p),'district');
 for(const l of state.landmarks)others.set(k(l),'landmark');
 for(const i of (state as any).installations??[])for(const p of i.plots)others.set(k(p),'installation');
 for(const p of (state as any).mosaic?.hexes??[])others.set(k(p),'mosaic');
 expect(others.has(mine)).toBe(false);
 for(const held of ['-3,6','0,2','0,-5','0,-4'])expect(mine).not.toBe(held);
 // Neighbour of both the Connection Gate and the Birthday Tower (axial distance 1): the family corner reads as one plaza.
 expect(dist(OXYGEN_CAFE_PLOT,CONNECTION_GATE_PLOT)).toBe(1);
 expect(dist(OXYGEN_CAFE_PLOT,{q:4,r:-1})).toBe(1);
 expect(state.districts.find(d=>d.id==='district-oxygen-cafe-20261118')!.plots!.filter(p=>k(p)===mine)).toHaveLength(1);
});
it('clears every one of the 360 model-random rocks and sits on buildable ground',()=>{
 expect(buildable(5,-1)).toBe(true);const [x,z]=hex(5,-1,10);
 for(let i=0;i<360;i++)expect(Math.hypot(x-(random('rx'+i)-.5)*230,z-(random('rz'+i)-.5)*230)).toBeGreaterThan(10+.16+random('rs'+i)*1.35);
});
it('is its own module, fully above ground, and world.ts only imports, dispatches and pads it',()=>{
 expect(cafe).not.toMatch(/underground|lift|shaft|elevator|cutRoofWindows|מעלית/i);
 expect(world).toContain("import {oxygenCafe,OXYGEN_CAFE_ID} from './nov18-oxygen-cafe'");
 expect(world).toContain('if(b.id===OXYGEN_CAFE_ID){oxygenCafe(part,group,this);return group;}');
 expect(world).toContain('kb.id===BIRTHDAY_TOWER_ID||kb.id===OXYGEN_CAFE_ID||kb.id===STORY_STARS_ID||kb.id===SHELF_TOWER_ID||kb.id===GRANNY_HOUSE_ID)&&kb.plot');
 expect(world.match(/OXYGEN_CAFE_ID/g)!.length).toBe(4);
});
it('keeps the cafe identity: geodesic glass dome, commander chair with the cat, stuck robot with iced coffee, roof cup, door sign',()=>{
 expect(OXYGEN_CAFE.domeRadius).toBeGreaterThan(4);expect(OXYGEN_CAFE.domeHeight).toBeGreaterThan(4);
 expect(OXYGEN_CAFE.floorY+OXYGEN_CAFE.domeHeight).toBeLessThan(OXYGEN_CAFE.maxHeight);
 for(const s of ['geodesicDome','steam','beacon','straw','crater','catMat','seatY','pulse=true','float:true','sign-hebrew.ttf',"direction='rtl'",'wallSign'])expect(cafe).toContain(s);
 expect(OXYGEN_CAFE_SIGN).toBe('נגמר החלב. החמצן בינתיים בסדר.');
 expect(cafe).toContain('נגמר החלב');
 // The cafe carries the shared Mars enamel palette.
 expect(Object.values(CAFE_ENAMEL)).toEqual(['#c8553d','#ff6f59','#ffc145','#2fb8a8']);
 // Noa's turquoise signature stays small: the entrance strip and the robot beacon only.
 expect(cafe.match(/#4fd8be/g)!.length).toBeLessThanOrEqual(2);
});
it('carries no private names, no workplace words or insignia',()=>{
 expect(cafe).not.toMatch(/יעקב|אלון|נועה|גפן|emblem|EMBLEM|להבים|כוכב כחול|logo/i);
 const ev=events.events.find(e=>e.id==='oxygen-cafe-20261118')!;
 expect(JSON.stringify(ev)).not.toMatch(/יעקב|אלון|נועה|גפן|להבים|כוכב כחול|emblem|logo|https?:\/\/|#\d/i);
});
it('ledger entry describes the above-ground cafe in the family corner, sign included',()=>{
 const ev=events.events.find(e=>e.id==='oxygen-cafe-20261118')!;
 expect(validateEvent(ev as any)).toEqual([]);
 expect(ev.occurredAt).toBe(state.buildings.find(here)!.createdAt);
 expect(ev.summary.he).toContain('קפה חמצן');expect(ev.summary.he).toContain('מעל הקרקע');expect(ev.summary.he).toContain('שער הקשר');
 expect(ev.summary.en).toContain('above ground');expect(ev.summary.he).toContain(OXYGEN_CAFE_SIGN);
 expect(state.revision).toBe(67);
 expect(state.buildings.at(-4)!.id).toBe(OXYGEN_CAFE_ID);expect(events.events.at(-4)!.id).toBe('oxygen-cafe-20261118');
});
