import {it,expect} from 'vitest';
import world from '../src/world.ts?raw';
import gate from '../src/nov10-connection-gate.ts?raw';
import state from '../data/city-state.json';
import events from '../data/events.json';
import {validateState,validateEvent,hex,random,districtPlots} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
import {CONNECTION_GATE_ID,CONNECTION_GATE_PLOT,CONNECTION_GATE,GATE_BANDS} from '../src/nov10-connection-gate';
const here=(b:any)=>b.id===CONNECTION_GATE_ID;
it('places the Connection Gate on its own free full plot with a valid state',()=>{
 const b=state.buildings.find(here)!;expect(b.plot).toEqual({q:4,r:0});expect(CONNECTION_GATE_PLOT).toEqual({q:4,r:0});
 expect(validateState(state as any)).toEqual([]);
 const k=(p:any)=>p.q+','+p.r,mine=k(CONNECTION_GATE_PLOT);
 expect(state.buildings.filter(x=>x.plot&&k(x.plot)===mine)).toHaveLength(1);
 const others=new Map<string,string>();
 for(const d of state.districts)for(const p of districtPlots(d as any))if(!(d.id==='district-connection-gate-20261110'&&k(p)===mine))others.set(k(p),'district');
 for(const l of state.landmarks)others.set(k(l),'landmark');
 for(const i of (state as any).installations??[])for(const p of i.plots)others.set(k(p),'installation');
 for(const p of (state as any).mosaic?.hexes??[])others.set(k(p),'mosaic');
 expect(others.has(mine)).toBe(false);
 for(const held of ['-3,6','0,2','0,-5','0,-4'])expect(mine).not.toBe(held);
 expect(state.buildings.some(x=>x.plot&&x.plot.q===-3&&x.plot.r===6)).toBe(false);
 expect(state.districts.find(d=>d.id==='district-connection-gate-20261110')!.plots!.filter(p=>k(p)===mine)).toHaveLength(1);
});
it('clears every one of the 360 model-random rocks and sits on buildable ground',()=>{
 expect(buildable(4,0)).toBe(true);const [x,z]=hex(4,0,10);
 for(let i=0;i<360;i++)expect(Math.hypot(x-(random('rx'+i)-.5)*230,z-(random('rz'+i)-.5)*230)).toBeGreaterThan(10+.16+random('rs'+i)*1.35);
});
it('is fully above ground: no lift, shaft or underground wiring, and the world renders it from the building dispatch',()=>{
 expect(gate).not.toMatch(/underground|lift|shaft|cutRoofWindows/i);
 expect(world).toContain("import {connectionGate,CONNECTION_GATE_ID} from './nov10-connection-gate'");
 expect(world).toContain('if(b.id===CONNECTION_GATE_ID){connectionGate(part,group,this);return group;}');
 expect(world.match(/CONNECTION_GATE_ID/g)!.length).toBeGreaterThanOrEqual(4);
});
it('keeps the gate identity: two banded light paths meeting in one tall arch, crown orb, turning rings, turquoise signatures, facing benches',()=>{
 for(const s of ['QuadraticBezierCurve3','TubeGeometry','TorusGeometry','SphereGeometry','archTop','GATE_BANDS'])expect(gate).toContain(s);
 expect(gate).toContain("userData.spin=true");
 expect(CONNECTION_GATE.maxHeight).toBeGreaterThan(27);
 expect(GATE_BANDS.length).toBeGreaterThanOrEqual(5);
 // Both sides use the same height-banded palette, so the colours meet.
 expect(gate).toContain('GATE_BANDS[bandIndex]');
 // Turquoise kept small: entrance strip plus roof light point, not whole-building colour.
 expect(gate.match(/#4fd8be/g)!.length).toBeLessThanOrEqual(6);
});
it('ledger entry describes the above-ground gate and stays abstract',()=>{
 const ev=events.events.find(e=>e.id==='connection-gate-20261110')!;
 expect(validateEvent(ev as any)).toEqual([]);
 expect(ev.summary.he).toContain('שער הקשר');
 expect(ev.summary.he).toContain('מעל הקרקע');
 expect(ev.summary.en).toContain('above ground');
 expect(ev.summary.he).not.toContain('גפן');
 expect(ev.summary.en).not.toContain('Gefen');
 expect(ev.summary.he).not.toContain('מתחתיו');
});
