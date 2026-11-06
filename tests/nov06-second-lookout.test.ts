import {it,expect} from 'vitest';
import world from '../src/world.ts?raw';
import lookout from '../src/nov06-second-lookout.ts?raw';
import state from '../data/city-state.json';
import events from '../data/events.json';
import {validateState,hex,random,districtPlots} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
import {SECOND_LOOKOUT_ID,LOOKOUT2_PLOT,LOOKOUT2} from '../src/nov06-second-lookout';
const here=(b:any)=>b.id===SECOND_LOOKOUT_ID;
it('places the Second Lookout on its own free full plot with a valid state',()=>{
 const b=state.buildings.find(here)!;expect(b.plot).toEqual({q:0,r:-7});expect(LOOKOUT2_PLOT).toEqual({q:0,r:-7});
 expect(validateState(state as any)).toEqual([]);
 const k=(p:any)=>p.q+','+p.r,mine=k(LOOKOUT2_PLOT);
 expect(state.buildings.filter(x=>x.plot&&k(x.plot)===mine)).toHaveLength(1);
 const others=new Map<string,string>();
 for(const d of state.districts)for(const p of districtPlots(d as any))if(!(d.id==='district-academic-recognition-20261001'&&k(p)===mine))others.set(k(p),'district');
 for(const l of state.landmarks)others.set(k(l),'landmark');
 for(const i of (state as any).installations??[])for(const p of i.plots)others.set(k(p),'installation');
 for(const p of (state as any).mosaic?.hexes??[])others.set(k(p),'mosaic');
 expect(others.has(mine)).toBe(false);
 for(const held of ['-3,6','0,2','0,-5','0,-4'])expect(mine).not.toBe(held);
 expect(state.buildings.some(x=>x.plot&&x.plot.q===-3&&x.plot.r===6)).toBe(false);
 expect(state.districts.find(d=>d.id==='district-academic-recognition-20261001')!.plots!.filter(p=>k(p)===mine)).toHaveLength(1);
});
it('clears every one of the 360 model-random rocks and sits on buildable ground',()=>{
 expect(buildable(0,-7)).toBe(true);const [x,z]=hex(0,-7,10);
 for(let i=0;i<360;i++)expect(Math.hypot(x-(random('rx'+i)-.5)*230,z-(random('rz'+i)-.5)*230)).toBeGreaterThan(10+.16+random('rs'+i)*1.35);
});
it('is fully above ground: no lift, shaft or underground wiring, and the world renders it from the building dispatch',()=>{
 expect(lookout).not.toMatch(/underground|lift|shaft|cutRoofWindows/i);
 expect(world).toContain("import {secondLookout,SECOND_LOOKOUT_ID} from './nov06-second-lookout'");
 expect(world).toContain('if(b.id===SECOND_LOOKOUT_ID){secondLookout(part,group,this);return group;}');
 expect(world.match(/SECOND_LOOKOUT_ID/g)!.length).toBeGreaterThanOrEqual(4);
});
it('keeps the pavilion identity and the rehomed lookout corner: facing lenses, lamp, rail, bench, periscope column, framed panel',()=>{
 for(const s of ['lensSep','lensTilt','barrelLen','TorusGeometry','SphereGeometry'])expect(lookout).toContain(s);
 expect(lookout).toContain('CylinderGeometry(1.5,1.6,.45,18)');
 expect(lookout).toContain('CylinderGeometry(.16,.2,3.4,10)');
 expect(lookout).toContain('BoxGeometry(3.2,2,.18)');
 expect(lookout).toContain('PlaneGeometry(2.7,1.55)');
});
it('ledger entry describes the above-ground lookout with the corner beside it',()=>{
 const ev=events.events.find(e=>e.id==='second-lookout-20261106')!;
 expect(ev.summary.he).toContain('מצפה המבט השני');
 expect(ev.summary.he).toContain('מעל הקרקע');
 expect(ev.summary.he).not.toContain('מתחתיו');
 expect(ev.summary.en).toContain('above ground');
});
