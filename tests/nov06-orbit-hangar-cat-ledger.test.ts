import {describe,expect,it} from 'vitest';
import state from '../data/city-state.json';
import {events,validateState,hex,type State} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
import {ANNEX} from '../src/review-underground';
import {ORBIT_STAR_HANGAR,ORBIT_STAR_HANGAR_ID,ORBIT_STAR_HANGAR_PLOT,CAT_LEDGER,CAT_LEDGER_ID,CAT_LEDGER_PLOT,GALILEO_RAMP} from '../src/world';
import source from '../src/world.ts?raw';
const hangar=source.slice(source.indexOf('// Orbit Star Hangar (האנגר המסלול)'),source.indexOf('// Cat Ledger (קופת החתולים)'));
const ledger=source.slice(source.indexOf('// Cat Ledger (קופת החתולים)'),source.indexOf('// Version Atlas (אטלס הגרסאות)'));
const taken=()=>[...state.districts.flatMap(d=>(d.plots??[{q:d.q,r:d.r}]).map(p=>p.q+','+p.r)),...state.landmarks.map(l=>l.q+','+l.r),...(state.installations??[]).flatMap(i=>i.plots.map(p=>p.q+','+p.r))];
describe('Orbit Star Hangar and Cat Ledger (6.11 make-up build)',()=>{
 it('adds the two buildings and events, each on its own plot, and keeps the state valid',()=>{
  const a=state.buildings.find(b=>b.id===ORBIT_STAR_HANGAR_ID)!,c=state.buildings.find(b=>b.id===CAT_LEDGER_ID)!;
  expect(a.plot).toEqual(ORBIT_STAR_HANGAR_PLOT);expect(c.plot).toEqual(CAT_LEDGER_PLOT);expect(a.name.he).toBe('האנגר המסלול');expect(c.name.he).toBe('קופת החתולים');
  expect(state.buildings.slice(-2).map(b=>b.id)).toEqual([ORBIT_STAR_HANGAR_ID,CAT_LEDGER_ID]);expect(events.slice(-2).map(e=>e.id)).toEqual(['orbit-star-hangar-20261105','cat-ledger-20261105']);
  expect(validateState(state as State)).toEqual([]);
 });
 it('both plots are free on the surface, buildable outside craters and away from every underground room',()=>{
  const t=taken();for(const p of [ORBIT_STAR_HANGAR_PLOT,CAT_LEDGER_PLOT]){expect(t.filter(k=>k===p.q+','+p.r)).toHaveLength(1);expect(buildable(p.q,p.r)).toBe(true);
   for(const o of state.buildings)if(o.id!==ORBIT_STAR_HANGAR_ID&&o.id!==CAT_LEDGER_ID&&o.plot)expect([o.plot.q,o.plot.r]).not.toEqual([p.q,p.r]);
   const [x,z]=hex(p.q,p.r,10);for(const a of ANNEX)expect(Math.hypot(a.x-x,a.z-z)).toBeGreaterThan(8.66);}
 });
 it('clears the loose natural stones off both hexes',()=>{expect(source).toContain('||Math.hypot(x-17.320508075688775,z+60)<10');expect(source).toContain('||Math.hypot(x-8.660254037844386,z+45)<10');
  const [x1,z1]=hex(3,-4,10),[x2,z2]=hex(2,-3,10);expect(x1).toBeCloseTo(17.320508075688775,9);expect(z1).toBe(-60);expect(x2).toBeCloseTo(8.660254037844386,9);expect(z2).toBe(-45);});
 it('same base height as the neighbours: pad .35 and plinth .6, everything inside the hex',()=>{
  for(const B of [ORBIT_STAR_HANGAR,CAT_LEDGER]){expect(B.pad).toEqual(GALILEO_RAMP.pad);expect(B.plinth.height).toBe(GALILEO_RAMP.plinth.height);const ap=B.pad.radius*Math.cos(Math.PI/6);expect(Math.hypot(B.plinth.w/2,B.plinth.d/2)).toBeLessThan(B.pad.radius);expect(B.plinth.d/2+.5).toBeLessThan(ap);}
  const H=ORBIT_STAR_HANGAR,ap=H.pad.radius*Math.cos(Math.PI/6);expect(H.runway.z1).toBeLessThan(ap);expect(H.orbit.radius).toBeGreaterThan(H.rotor.length+.3);expect(H.rotor.y-H.orbit.radius-H.star.outer).toBeGreaterThan(H.pad.top+H.plinth.height+H.vault.radius);
 });
 it('the star orbits the rotor in a slow loop, only through the animation list (static under reduced motion)',()=>{
  expect(ORBIT_STAR_HANGAR.orbit.period).toBeGreaterThanOrEqual(12);expect(hangar).toContain('w.animated.push(pivot)');expect(hangar).toContain('pivot.userData.dreamTick');
  expect(source).toMatch(/if\(!this\.reduced\)for\(const o of this\.animated\)\{if\(o\.userData\.dreamTick\)/);expect(hangar).toContain(ORBIT_STAR_HANGAR.star.color);expect(hangar).toContain('#ffad4d');
 });
 it('two cat safes with ears, dial, handle and tail in front of the counting house',()=>{
  expect(CAT_LEDGER.safes).toHaveLength(2);expect(Math.abs(CAT_LEDGER.safes[0].x-CAT_LEDGER.safes[1].x)).toBeGreaterThan(CAT_LEDGER.safe.w+.5);
  for(const s of CAT_LEDGER.safes)expect(s.z-CAT_LEDGER.safe.d/2).toBeGreaterThan(CAT_LEDGER.house.z+CAT_LEDGER.house.d/2);
  for(const word of ['ConeGeometry','dial','TorusGeometry','#ffad4d','קופת החתולים'])expect(ledger).toContain(word);
 });
 it('public text stays abstract: no people, task numbers or links in the code or the events',()=>{
  const data=JSON.stringify(events.slice(-2))+JSON.stringify(state.buildings.slice(-2));
  expect(hangar+ledger+data).not.toMatch(/יעקב|נועה|אלון|Yaakov|Noa|Alon|https?:/);expect(data).not.toMatch(/#\d/);
 });
});
