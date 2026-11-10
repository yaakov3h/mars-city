import {describe,expect,it} from 'vitest';
import state from '../data/city-state.json';
import {events,validateState,hex,type State} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
import {GALILEO_RAMP} from '../src/world';
import {ORBIT_TOWER,ORBIT_TOWER_ID,ORBIT_TOWER_PLOT,CAT_TREASURY,CAT_TREASURY_ID,CAT_TREASURY_PLOT,MARS_ENAMEL,FLOOR_HEIGHT} from '../src/nov07-orbit-tower-cat-treasury';
import {EMBLEM_SVG,EMBLEM_NAVY} from '../src/nov07-emblem-art';
import source from '../src/world.ts?raw';
import mine from '../src/nov07-orbit-tower-cat-treasury.ts?raw';
import art from '../src/nov07-emblem-art.ts?raw';
const tower=mine.slice(mine.indexOf('// Orbit Tower (מגדל המסלול)'),mine.indexOf('// Cat Treasury (קופת החתולים)'));
const treasury=mine.slice(mine.indexOf('// Cat Treasury (קופת החתולים)'));
const taken=()=>[...state.districts.flatMap(d=>(d.plots??[{q:d.q,r:d.r}]).map(p=>p.q+','+p.r)),...state.landmarks.map(l=>l.q+','+l.r),...((state as any).installations??[]).flatMap((i:any)=>i.plots.map((p:any)=>p.q+','+p.r)),...((state as any).mosaic?.hexes??[]).map((p:any)=>p.q+','+p.r)];
const insideHex=(R:number,x:number,z:number)=>Math.abs(x)<=R*Math.cos(Math.PI/6)&&Math.abs(x)*Math.tan(Math.PI/6)+Math.abs(z)<=R;
const towerHeight=()=>{const T=ORBIT_TOWER;return T.pad.top+T.plinth.height+(T.podium.floors+T.shaft.floors+T.setback.floors)*FLOOR_HEIGHT+.38+.36+.24+T.crown.height+.22+T.tiers.reduce((n,t)=>n+t.h,0)+T.spire.height+T.star.outer*1.6;};
describe('Orbit Tower and Cat Treasury (7.11 build, rebuilt bigger)',()=>{
 it('adds the two buildings and events, each on its own plot, and keeps the state valid',()=>{
  const a=state.buildings.find(b=>b.id===ORBIT_TOWER_ID)!,c=state.buildings.find(b=>b.id===CAT_TREASURY_ID)!;
  expect(a.plot).toEqual(ORBIT_TOWER_PLOT);expect(c.plot).toEqual(CAT_TREASURY_PLOT);expect(a.name.he).toBe('מגדל המסלול');expect(c.name.he).toBe('קופת החתולים');
  expect(state.buildings.slice(-4,-2).map(b=>b.id)).toEqual([ORBIT_TOWER_ID,CAT_TREASURY_ID]);expect(events.slice(-4,-2).map(e=>e.id)).toEqual(['orbit-tower-20261107','cat-treasury-20261107']);
  expect(validateState(state as State)).toEqual([]);
 });
 it('both plots are free on the surface (no district, landmark, installation or mosaic hex) and buildable outside craters',()=>{
  const t=taken();for(const p of [ORBIT_TOWER_PLOT,CAT_TREASURY_PLOT]){expect(t.filter(k=>k===p.q+','+p.r)).toHaveLength(1);expect(buildable(p.q,p.r)).toBe(true);
   for(const o of state.buildings)if(o.id!==ORBIT_TOWER_ID&&o.id!==CAT_TREASURY_ID&&o.plot)expect([o.plot.q,o.plot.r]).not.toEqual([p.q,p.r]);}
 });
 it('clears the loose natural stones off both hexes',()=>{expect(source).toContain('||Math.hypot(x-17.320508075688775,z+60)<10');expect(source).toContain('||Math.hypot(x-8.660254037844386,z+45)<10');
  const [x1,z1]=hex(3,-4,10),[x2,z2]=hex(2,-3,10);expect(x1).toBeCloseTo(17.320508075688775,9);expect(z1).toBe(-60);expect(x2).toBeCloseTo(8.660254037844386,9);expect(z2).toBe(-45);});
 it('same base height as the neighbours (pad .35 + plinth .6) and every footprint corner inside its own hex pad',()=>{
  for(const B of [ORBIT_TOWER,CAT_TREASURY]){expect(B.pad).toEqual(GALILEO_RAMP.pad);expect(B.plinth.height).toBe(GALILEO_RAMP.plinth.height);for(const sx of [-1,1])for(const sz of [-1,1])expect(insideHex(B.pad.radius,sx*B.plinth.w/2,sz*B.plinth.d/2)).toBe(true);}
  const T=CAT_TREASURY;for(const s of T.safes)for(const sx of [-1,1])for(const sz of [-1,1])expect(insideHex(T.pad.radius,s.x+sx*(T.safe.w+.5)/2,s.z+sz*(T.safe.d+.4)/2)).toBe(true);
  expect(T.plinth.d/2+1.15).toBeLessThan(T.pad.radius-2.5*Math.tan(Math.PI/6));
 });
 it('much bigger than the 6.11 versions: full-hex footprints, an eight-storey stepped tower and a three-storey domed hall',()=>{
  const T=ORBIT_TOWER,C=CAT_TREASURY;expect(T.plinth.w*T.plinth.d).toBeGreaterThan(2*7.6*6);expect(C.plinth.w*C.plinth.d).toBeGreaterThan(2*6.6*6.2);
  expect(T.podium.floors+T.shaft.floors+T.setback.floors+1).toBe(T.floors);expect(T.floors).toBe(8);expect(towerHeight()).toBeGreaterThan(25);expect(towerHeight()).toBeLessThan(31);
  expect(T.podium.w).toBeGreaterThan(T.shaft.w);expect(T.shaft.w).toBeGreaterThan(T.setback.w);expect(T.setback.w).toBeGreaterThan(T.crown.w);for(let i=1;i<T.tiers.length;i++)expect(T.tiers[i].w).toBeLessThan(T.tiers[i-1].w);
  expect(C.hall.floors).toBe(3);expect(C.portico.columns).toBe(6);expect(C.dome.radius).toBeGreaterThan(2);
 });
 it('the crown carries the emblem artwork as a picture on all four faces, from the exact vector drawing, in its navy',()=>{
  expect(EMBLEM_NAVY).toBe('#14284D');expect(EMBLEM_SVG.startsWith('<svg')).toBe(true);expect(EMBLEM_SVG).toContain('viewBox="-2 -6 560 560"');expect((EMBLEM_SVG.match(/<path /g)??[]).length).toBeGreaterThan(15);
  expect(mine).toContain("img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(EMBLEM_SVG)");expect(tower).toContain('m.userData.emblem=true');expect(tower).toContain('[[0,1,0],[0,-1,Math.PI],[1,0,Math.PI/2],[-1,0,-Math.PI/2]]');
  expect(ORBIT_TOWER.emblem.size).toBeLessThan(ORBIT_TOWER.crown.w);expect(ORBIT_TOWER.emblem.size).toBeLessThan(ORBIT_TOWER.crown.height);
 });
 it('the spire star turns slowly, only through the animation list (static under reduced motion)',()=>{
  expect(ORBIT_TOWER.star.period).toBeGreaterThanOrEqual(12);expect(tower).toContain('w.animated.push(pivot)');expect(tower).toContain('pivot.userData.dreamTick');
  expect(source).toMatch(/if\(!this\.reduced\)for\(const o of this\.animated\)\{if\(o\.userData\.dreamTick\)/);
 });
 it('two big cat safes with ears, dial, handle and tail guard the steps in front of the portico',()=>{
  const T=CAT_TREASURY;expect(T.safes).toHaveLength(2);expect(Math.abs(T.safes[0].x-T.safes[1].x)).toBeGreaterThan(T.portico.span);expect(T.safe.h).toBeGreaterThan(1.25*1.4);
  for(const s of T.safes)expect(s.z-T.safe.d/2-.2).toBeGreaterThan(T.portico.z+T.portico.radius);
  for(const word of ['ConeGeometry','dial','TorusGeometry','#ffad4d','קופת החתולים','catEmblem'])expect(treasury).toContain(word);
 });
 it('public text stays abstract: no people, task numbers or links in the code, the art or the events',()=>{
  const data=JSON.stringify(events.slice(-4,-2))+JSON.stringify(state.buildings.slice(-4,-2));
  expect(mine+art+data).not.toMatch(/יעקב|נועה|אלון|Yaakov|Noa|Alon|https?:\/\/(?!www\.w3\.org)/);expect(data).not.toMatch(/#\d/);
 });
 it('follows the converted city: fully above ground, no lift/shaft wells/underground, Mars enamel colours',()=>{
  expect(mine+art).not.toMatch(/underground|lift|elevator|cutRoofWindows|מעלית|תת.קרקע/i);
  expect(source).toContain("import {orbitTower,catTreasury,ORBIT_TOWER_ID,CAT_TREASURY_ID} from './nov07-orbit-tower-cat-treasury'");
  expect(source).toContain('if(b.id===ORBIT_TOWER_ID){orbitTower(part,group,this);return group;}');
  expect(source).toContain('if(b.id===CAT_TREASURY_ID){catTreasury(part,group,this);return group;}');
  for(const k of Object.keys(MARS_ENAMEL))expect(mine).toContain('MARS_ENAMEL.'+k);
  for(const name of ['מגדל המסלול','קופת החתולים'])expect(mine).toContain("sign('"+name+"'");
 });
 it('public text stays neutral: no workplace or service wording anywhere in the build',()=>{
  const data=JSON.stringify(events.slice(-4,-2))+JSON.stringify(state.buildings.slice(-4,-2));
  expect(mine+art+data).not.toMatch(/aviation|aircraft|air ?force|military|squadron|helicopter|rotor|blades?\b|blue star|lahav|תעופה|חיל|צה.ל|להבים|כוכב כחול|טייסת|מסוק/i);
 });
});
