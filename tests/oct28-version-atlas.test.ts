import {describe,expect,it} from 'vitest';
import state from '../data/city-state.json';
import {events,validateState,hex,type State} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
import {ANNEX,annexLiftAt,reviewWalkable,reviewFloorAt} from '../src/review-underground';
import {pilotOpening,OCT28_SHAFTS} from '../src/underground';
import {VERSION_ATLAS,VERSION_ATLAS_SHAFT_POINT,ATLAS_TABLE} from '../src/world';
import source from '../src/world.ts?raw';
const atlas=source.slice(source.indexOf('// Version Atlas (אטלס הגרסאות)'),source.indexOf('// Cat House (בית החתולים)'));
const ID='b-version-atlas-20261027';
const num=(name:string)=>{const m=atlas.match(new RegExp(name+':\\{[^}]*\\}'));return m?m[0]:'';};
describe('Version Atlas (אטלס הגרסאות)',()=>{
 it('adds one building on its reserved plot q=0 r=-4 and keeps the state valid',()=>{
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
  for(const a of ANNEX.filter(a=>a.theme!=='atlas'))expect(Math.hypot(a.x-x,a.z-z)).toBeGreaterThan(8.66);
 });
 it('stands at the same base height as the Backup Vault (pad .35 + plinth .6) and stays inside the hex',()=>{
  expect(num('pad')).toContain('radius:8.3');expect(num('pad')).toContain('top:.35');expect(num('plinth')).toContain('height:.6');
  expect(atlas).toMatch(/mast:\{top:9\.6\}/);
 });
 it('is amber-copper with the builder\'s amber entrance strip and roof beacon, and nobody steps outside',()=>{
  expect(atlas).toContain("#d08a4c");expect(atlas).toContain("#ffad4d");expect(atlas).toMatch(/beacon/);
  expect(atlas).toMatch(/enclosed glass bridges/);expect(atlas).not.toMatch(/cutRoofWindows|cutApertures/);
 });
 it('has its own map room directly below, with the lift at the same shaft point as the surface well, found by theme',()=>{
  const [cx,cz]=hex(0,-4,10);const i=ANNEX.findIndex(a=>a.theme==='atlas');expect(i).toBeGreaterThan(0);expect(ANNEX.filter(a=>a.theme==='atlas')).toHaveLength(1);
  const a=ANNEX[i];expect(a.x).toBeCloseTo(cx,9);expect(a.z).toBeCloseTo(cz,9);expect(a.fy).toBe(VERSION_ATLAS.room.fy);expect(a.name).not.toMatch(/יעקב|נועה|אלון|#\d/);
  const l=annexLiftAt(i);expect(l.x).toBeCloseTo(cx+VERSION_ATLAS_SHAFT_POINT.x,9);expect(l.z).toBeCloseTo(cz+VERSION_ATLAS_SHAFT_POINT.z,9);
  expect(OCT28_SHAFTS).toHaveLength(1);expect(OCT28_SHAFTS[0].x0).toBeCloseTo(l.x-1,9);expect(OCT28_SHAFTS[0].z1).toBeCloseTo(l.z+1,9);
  expect(pilotOpening(l.x,l.z)).toBe(true);expect(reviewWalkable(cx,cz)).toBe(true);expect(reviewFloorAt(cx,cz)).toBe(-8.6);
  // the pad well is wider than the 2x2 terrain opening's half-width and the glass tube sits on its rim
  expect(VERSION_ATLAS.lift.well).toBeGreaterThanOrEqual(1);expect(VERSION_ATLAS.lift.radius).toBeGreaterThan(VERSION_ATLAS.lift.well);
  expect(atlas).toContain('padShape.holes.push(well)');
 });
 it('connects only to the launch room west of it; the launch room gains only the door that faces it',()=>{
  const me=ANNEX.find(a=>a.theme==='atlas')!,la=ANNEX.find(a=>a.theme==='launch')!;
  expect(me.doors).toEqual([180]);expect(la.doors).toEqual([180,60,120,240,0]);
  expect(Math.hypot(me.x-la.x,me.z-la.z)).toBeCloseTo(10*Math.sqrt(3),9);expect(me.z).toBe(la.z);expect(me.x).toBeGreaterThan(la.x);
  expect(la.fy).toBe(me.fy);
  for(let k=0;k<=100;k++){const t=k/100,x=me.x*(1-t)+la.x*t,z=me.z;expect(reviewWalkable(x,z)).toBe(true);expect(reviewFloorAt(x,z)).toBeCloseTo(-8.6,6);}
  for(const o of ANNEX.filter(o=>o!==me&&o!==la))expect(Math.hypot(o.x-me.x,o.z-me.z)).toBeGreaterThan(17);
 });
 it('lift centre is walkable with a free step in every direction, and the table stays off the door-to-lift route',()=>{
  const i=ANNEX.findIndex(a=>a.theme==='atlas'),l=annexLiftAt(i),me=ANNEX[i];
  const clear=(x:number,z:number)=>reviewWalkable(x+.17,z)&&reviewWalkable(x-.17,z)&&reviewWalkable(x,z+.17)&&reviewWalkable(x,z-.17)&&reviewWalkable(x,z);
  expect(clear(l.x,l.z)).toBe(true);for(let k=0;k<720;k++){const a=k*Math.PI/360;expect(clear(l.x+Math.cos(a)*.1,l.z+Math.sin(a)*.1)).toBe(true);}
  const door={x:me.x-6.8*.8660254,z:me.z};for(let k=0;k<=50;k++){const t=k/50,x=door.x*(1-t)+l.x*t,z=door.z*(1-t)+l.z*t;expect(Math.hypot(x-(me.x+ATLAS_TABLE.x),z-(me.z+ATLAS_TABLE.z))).toBeGreaterThan(ATLAS_TABLE.radius+.6);}
 });
 it('is reachable by walking from the standard entry over the real walkable network, through the launch room',()=>{
  const me=ANNEX.find(a=>a.theme==='atlas')!,lift=annexLiftAt(ANNEX.indexOf(me));
  const step=.5,key=(i:number,j:number)=>i+','+j,ix=(x:number)=>Math.round(x/step);
  const near=(x:number,z:number)=>{for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++)if(reviewWalkable((ix(x)+a)*step,(ix(z)+b)*step))return [ix(x)+a,ix(z)+b];return null};
  const s=near(0,0)!,g=[ix(lift.x),ix(lift.z)];expect(s).toBeTruthy();expect(reviewWalkable(g[0]*step,g[1]*step)).toBe(true);
  const seen=new Set([key(s[0],s[1])]);const q=[s];
  while(q.length){const [i,j]=q.shift()!;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+di,nj=j+dj,k=key(ni,nj);if(seen.has(k))continue;if(Math.abs(ni*step)>110||Math.abs(nj*step)>130)continue;if(!reviewWalkable(ni*step,nj*step))continue;seen.add(k);q.push([ni,nj]);}}
  expect(seen.has(key(g[0],g[1]))).toBe(true);
 });
 it('keeps public text abstract: no personal names, office numbers or app list in the event, comments or test',()=>{
  const ev=events.find(e=>e.id==='version-atlas-20261027');expect(ev).toBeTruthy();
  expect(JSON.stringify(ev)).not.toMatch(/יעקב|נועה|אלון|Yaakov|Noa|Alon|#\d|we built/i);
  expect(atlas).not.toMatch(/יעקב|נועה|אלון|Yaakov|Noa|Alon|decision #|office #|VERSION_ATLAS_APPS/);
 });
});
