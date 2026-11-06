import {describe,expect,it} from 'vitest';
import state from '../data/city-state.json';
import {events,validateState,hex,type State} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
import {GALILEO_RAMP} from '../src/world';
import {ORBIT_STAR_HANGAR,ORBIT_STAR_HANGAR_ID,ORBIT_STAR_HANGAR_PLOT,CAT_LEDGER,CAT_LEDGER_ID,CAT_LEDGER_PLOT,MARS_ENAMEL} from '../src/nov07-orbit-hangar-cat-ledger';
import source from '../src/world.ts?raw';
import mine from '../src/nov07-orbit-hangar-cat-ledger.ts?raw';
const hangar=mine.slice(mine.indexOf('// Orbit Star Hangar (האנגר המסלול)'),mine.indexOf('// Cat Ledger (קופת החתולים)'));
const ledger=mine.slice(mine.indexOf('// Cat Ledger (קופת החתולים)'));
const taken=()=>[...state.districts.flatMap(d=>(d.plots??[{q:d.q,r:d.r}]).map(p=>p.q+','+p.r)),...state.landmarks.map(l=>l.q+','+l.r),...((state as any).installations??[]).flatMap((i:any)=>i.plots.map((p:any)=>p.q+','+p.r)),...((state as any).mosaic?.hexes??[]).map((p:any)=>p.q+','+p.r)];
describe('Orbit Star Hangar and Cat Ledger (6.11 build, ported onto the converted city 7.11)',()=>{
 it('adds the two buildings and events, each on its own plot, and keeps the state valid',()=>{
  const a=state.buildings.find(b=>b.id===ORBIT_STAR_HANGAR_ID)!,c=state.buildings.find(b=>b.id===CAT_LEDGER_ID)!;
  expect(a.plot).toEqual(ORBIT_STAR_HANGAR_PLOT);expect(c.plot).toEqual(CAT_LEDGER_PLOT);expect(a.name.he).toBe('האנגר המסלול');expect(c.name.he).toBe('קופת החתולים');
  expect(state.buildings.slice(-2).map(b=>b.id)).toEqual([ORBIT_STAR_HANGAR_ID,CAT_LEDGER_ID]);expect(events.slice(-2).map(e=>e.id)).toEqual(['orbit-star-hangar-20261105','cat-ledger-20261105']);
  expect(validateState(state as State)).toEqual([]);
 });
 it('both plots are free on the surface (no district, landmark, installation or mosaic hex) and buildable outside craters',()=>{
  const t=taken();for(const p of [ORBIT_STAR_HANGAR_PLOT,CAT_LEDGER_PLOT]){expect(t.filter(k=>k===p.q+','+p.r)).toHaveLength(1);expect(buildable(p.q,p.r)).toBe(true);
   for(const o of state.buildings)if(o.id!==ORBIT_STAR_HANGAR_ID&&o.id!==CAT_LEDGER_ID&&o.plot)expect([o.plot.q,o.plot.r]).not.toEqual([p.q,p.r]);}
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
 it('follows the converted city: fully above ground, no lift/shaft/underground, at most two storeys, Mars enamel colours',()=>{
  expect(mine).not.toMatch(/underground|lift|shaft|elevator|cutRoofWindows|מעלית|תת.קרקע/i);
  expect(source).toContain("import {orbitStarHangar,catLedger,ORBIT_STAR_HANGAR_ID,CAT_LEDGER_ID} from './nov07-orbit-hangar-cat-ledger'");
  expect(source).toContain('if(b.id===ORBIT_STAR_HANGAR_ID){orbitStarHangar(part,group,this);return group;}');
  expect(source).toContain('if(b.id===CAT_LEDGER_ID){catLedger(part,group,this);return group;}');
  for(const c of Object.values(MARS_ENAMEL))expect(mine).toContain('MARS_ENAMEL.'+Object.keys(MARS_ENAMEL).find(k=>(MARS_ENAMEL as any)[k]===c));
  expect(ORBIT_STAR_HANGAR.vault.radius*2).toBeLessThan(6);expect(CAT_LEDGER.house.h+CAT_LEDGER.house.ridge).toBeLessThan(6);
  for(const name of ['האנגר המסלול','קופת החתולים'])expect(mine).toContain("sign('"+name+"'");
 });
 it('public text stays neutral: no workplace or service wording',()=>{
  const data=JSON.stringify(events.slice(-2))+JSON.stringify(state.buildings.slice(-2));
  expect(mine+data).not.toMatch(/aviation|aircraft|air ?force|military|squadron|blades?\b|blue star|תעופה|חיל|צה.ל|להבים|כוכב כחול|טייסת/i);
 });
});
