import {describe,expect,it} from 'vitest';
import state from '../data/city-state.json';
import {events,validateState,hex,type State} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
import {ANNEX,annexLiftAt,reviewWalkable,reviewFloorAt} from '../src/review-underground';
import {pilotOpening,NOV4_ACCORD_SHAFTS} from '../src/underground';
import {BUILDERS_ACCORD,BUILDERS_ACCORD_SHAFT_POINT,ACCORD_TABLE,VERSION_ATLAS} from '../src/world';
import source from '../src/world.ts?raw';
const accord=source.slice(source.indexOf('// Builders Accord (אמנת הבונים)'),source.indexOf('// Cat House (בית החתולים)'));
const ID='b-builders-accord-20261104';
describe('Builders Accord (אמנת הבונים)',()=>{
 it('adds one building on plot q=2 r=-4 as the newest building and event, and keeps the state valid',()=>{
  const b=state.buildings.find(b=>b.id===ID)!;expect(b).toBeTruthy();expect(b.plot).toEqual({q:2,r:-4});expect(b.name.he).toBe('אמנת הבונים');
  expect(state.buildings.some(b=>b.id===ID)).toBe(true);expect(events.some(e=>e.id==='builders-accord-20261104')).toBe(true);
  expect(validateState(state as State)).toEqual([]);
 });
 it('the plot is free on the surface and buildable outside craters',()=>{
  const taken=[...state.districts.flatMap(d=>(d.plots??[{q:d.q,r:d.r}]).map(p=>p.q+','+p.r)),...state.landmarks.map(l=>l.q+','+l.r),...(state.installations??[]).flatMap(i=>i.plots.map(p=>p.q+','+p.r))];
  expect(taken.filter(k=>k==='2,-4')).toHaveLength(1);expect(buildable(2,-4)).toBe(true);
  for(const o of state.buildings)if(o.id!==ID&&o.plot)expect([o.plot.q,o.plot.r]).not.toEqual([2,-4]);
 });
 it('clears the loose natural stones off its hex',()=>{expect(source).toContain('||Math.hypot(x,z+60)<10');const [x,z]=hex(2,-4,10);expect(x).toBeCloseTo(0,9);expect(z).toBe(-60);});
 it('one bridge deck between two stone abutments, two leaning leg pairs meeting in one beam, all inside the hex',()=>{
  expect(BUILDERS_ACCORD.pad).toEqual(VERSION_ATLAS.pad);
  const ap=BUILDERS_ACCORD.pad.radius*Math.cos(Math.PI/6),D=BUILDERS_ACCORD.deck,P=BUILDERS_ACCORD.pylon,S=BUILDERS_ACCORD.stair;
  expect(P.base).toBeGreaterThan(D.half);expect(P.base+.8).toBeLessThan(ap);expect(P.apex).toBeLessThan(P.base);
  expect(P.height).toBeGreaterThan(D.top*2);expect(P.rise).toBeCloseTo(P.height-(BUILDERS_ACCORD.pad.top+1.85),9);
  expect(D.z+D.width/2+S.steps*S.depth+.6).toBeLessThan(ap);
 });
 it('two leaning sides, one meeting beam, one lantern and one sign: two builders, one bridge',()=>{
  expect(accord).toContain('#ffad4d');expect(accord).toContain('#7fe3cf');expect(accord).toContain('אמנת הבונים');
  expect(accord).toMatch(/enclosed glass bridge/);expect(accord).toMatch(/parabolic arch/);expect(accord).not.toMatch(/cutRoofWindows|cutApertures/);
 });
 it('has its own accord hall directly below, the lift at the same shaft point as the surface well',()=>{
  const [cx,cz]=hex(2,-4,10);const i=ANNEX.findIndex(a=>a.theme==='accord');expect(i).toBeGreaterThan(0);expect(ANNEX.filter(a=>a.theme==='accord')).toHaveLength(1);
  const a=ANNEX[i];expect(a.x).toBeCloseTo(cx,9);expect(a.z).toBeCloseTo(cz,9);expect(a.fy).toBe(BUILDERS_ACCORD.room.fy);expect(a.name).not.toMatch(/יעקב|נועה|אלון|#\d/);
  const l=annexLiftAt(i);expect(l.x).toBeCloseTo(cx+BUILDERS_ACCORD_SHAFT_POINT.x,9);expect(l.z).toBeCloseTo(cz+BUILDERS_ACCORD_SHAFT_POINT.z,9);
  expect(NOV4_ACCORD_SHAFTS).toHaveLength(1);expect(NOV4_ACCORD_SHAFTS[0].x0).toBeCloseTo(l.x-1,9);expect(NOV4_ACCORD_SHAFTS[0].z1).toBeCloseTo(l.z+1,9);
  expect(pilotOpening(l.x,l.z)).toBe(true);expect(reviewWalkable(cx,cz)).toBe(true);expect(reviewFloorAt(cx,cz)).toBe(-8.6);
  expect(BUILDERS_ACCORD.lift.radius).toBeGreaterThan(BUILDERS_ACCORD.lift.well);expect(accord).toContain('padShape.holes.push(well)');
  for(const o of ANNEX.filter(o=>o!==a))expect(Math.hypot(o.x-a.x,o.z-a.z)).toBeGreaterThan(8.66);
 });
 it('connects by a level passage to the ramp lab west of it, and the ramp lab answers with one east door',()=>{
  const me=ANNEX.find(a=>a.theme==='accord')!,rm=ANNEX.find(a=>a.theme==='ramp')!;expect(me.doors).toEqual([180]);expect(rm.doors).toContain(0);
  expect(Math.hypot(me.x-rm.x,me.z-rm.z)).toBeCloseTo(10*Math.sqrt(3),9);expect(me.z).toBe(rm.z);expect(rm.fy).toBe(me.fy);
  for(let k=0;k<=100;k++){const t=k/100,x=me.x*(1-t)+rm.x*t;expect(reviewWalkable(x,me.z)).toBe(true);expect(reviewFloorAt(x,me.z)).toBeCloseTo(-8.6,6);}
 });
 it('lift centre is walkable with a free step all round, and the shared table stays off the door-to-lift route',()=>{
  const i=ANNEX.findIndex(a=>a.theme==='accord'),l=annexLiftAt(i),me=ANNEX[i];
  const clear=(x:number,z:number)=>reviewWalkable(x+.17,z)&&reviewWalkable(x-.17,z)&&reviewWalkable(x,z+.17)&&reviewWalkable(x,z-.17)&&reviewWalkable(x,z);
  expect(clear(l.x,l.z)).toBe(true);for(let k=0;k<720;k++){const a=k*Math.PI/360;expect(clear(l.x+Math.cos(a)*.1,l.z+Math.sin(a)*.1)).toBe(true);}
  const door={x:me.x-6.8*.8660254,z:me.z},T=ACCORD_TABLE;for(let k=0;k<=50;k++){const t=k/50,x=door.x*(1-t)+l.x*t,z=door.z*(1-t)+l.z*t;expect(Math.hypot(x-(me.x+T.x),z-(me.z+T.z))>T.r+.6).toBe(true);}
 });
 it('is reachable by walking from the standard entry over the real walkable network',()=>{
  const me=ANNEX.find(a=>a.theme==='accord')!,lift=annexLiftAt(ANNEX.indexOf(me));
  const step=.5,key=(i:number,j:number)=>i+','+j,ix=(x:number)=>Math.round(x/step);
  const near=(x:number,z:number)=>{for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++)if(reviewWalkable((ix(x)+a)*step,(ix(z)+b)*step))return [ix(x)+a,ix(z)+b];return null};
  const s=near(0,0)!,g=[ix(lift.x),ix(lift.z)];expect(s).toBeTruthy();expect(reviewWalkable(g[0]*step,g[1]*step)).toBe(true);
  const seen=new Set([key(s[0],s[1])]);const q=[s];
  while(q.length){const [i,j]=q.shift()!;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+di,nj=j+dj,k=key(ni,nj);if(seen.has(k))continue;if(Math.abs(ni*step)>110||Math.abs(nj*step)>130)continue;if(!reviewWalkable(ni*step,nj*step))continue;seen.add(k);q.push([ni,nj]);}}
  expect(seen.has(key(g[0],g[1]))).toBe(true);
 },60000);
 it('keeps public text abstract: no personal names or office numbers',()=>{
  const ev=events.find(e=>e.id==='builders-accord-20261104');expect(ev).toBeTruthy();
  expect(JSON.stringify(ev)).not.toMatch(/יעקב|נועה|אלון|Yaakov|Noa|Alon|#\d|we built/i);expect(accord).not.toMatch(/יעקב|נועה|אלון|Yaakov|Noa|Alon|office #/);
 });
});
