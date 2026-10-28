import {describe,expect,it} from 'vitest';
import state from '../data/city-state.json';
import {events,validateState,hex,type State} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
import {ANNEX} from '../src/review-underground';
import source from '../src/world.ts?raw';
const atlas=source.slice(source.indexOf('// Version Atlas (אטלס הגרסאות)'),source.indexOf('// Cat House (בית החתולים)'));
const ID='b-version-atlas-20261027';
const num=(name:string)=>{const m=atlas.match(new RegExp(name+':\\{[^}]*\\}'));return m?m[0]:'';};
describe('Version Atlas (אטלס הגרסאות)',()=>{
 it('adds one building on its reserved plot q=0 r=-4 (office #501/#504) and keeps the state valid',()=>{
  const b=state.buildings.find(b=>b.id===ID)!;expect(b).toBeTruthy();expect(b.plot).toEqual({q:0,r:-4});expect(b.name.he).toBe('אטלס הגרסאות');
  expect(state.buildings.at(-1)!.id).toBe(ID);expect(events.at(-1)!.id).toBe('version-atlas-20261027');
  expect(validateState(state as State)).toEqual([]);
 });
 it('the plot is free on the surface and buildable outside craters and rocks',()=>{
  const taken=[...state.districts.flatMap(d=>(d.plots??[{q:d.q,r:d.r}]).map(p=>p.q+','+p.r)),...state.landmarks.map(l=>l.q+','+l.r),...(state.installations??[]).flatMap(i=>i.plots.map(p=>p.q+','+p.r))];
  expect(taken.filter(k=>k==='0,-4')).toHaveLength(1);
  expect(buildable(0,-4)).toBe(true);
  for(const o of state.buildings)if(o.id!==ID&&o.plot)expect([o.plot.q,o.plot.r]).not.toEqual([0,-4]);
 });
 it('clears the loose natural stones off its hex so none sits on the pad',()=>{expect(source).toContain('||Math.hypot(x+34.641016151377546,z+60)<10;');const [x,z]=hex(0,-4,10);expect(x).toBeCloseTo(-34.641016151377546,9);expect(z).toBe(-60);});
 it('keeps clear of the Dream Archive plot and of every underground room below its hex',()=>{
  const [x,z]=hex(0,-4,10),[dx,dz]=hex(-6,7,10);expect(Math.hypot(x-dx,z-dz)).toBeGreaterThan(17.3);
  for(const a of ANNEX)expect(Math.hypot(a.x-x,a.z-z)).toBeGreaterThan(8.66);
 });
 it('stands at the same base height as the Backup Vault (pad .35 + plinth .6) and stays inside the hex',()=>{
  expect(num('pad')).toContain('radius:8.3');expect(num('pad')).toContain('top:.35');expect(num('plinth')).toContain('height:.6');
  expect(atlas).toMatch(/mast:\{top:9\.6\}/);
 });
 it('is amber-copper with Alon\'s amber entrance strip and roof beacon, and nobody steps outside',()=>{
  expect(atlas).toContain("#d08a4c");expect(atlas).toContain("#ffad4d");expect(atlas).toMatch(/beacon/);
  expect(atlas).toMatch(/enclosed glass bridges/);expect(atlas).not.toMatch(/cutRoofWindows|cutApertures/);
 });
});
