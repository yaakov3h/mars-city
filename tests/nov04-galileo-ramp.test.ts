import {describe,expect,it} from 'vitest';
import state from '../data/city-state.json';
import {events,validateState,hex,type State} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
import {ANNEX,annexLiftAt,reviewWalkable,reviewFloorAt} from '../src/review-underground';
import {pilotOpening,NOV4_SHAFTS} from '../src/underground';
import {GALILEO_RAMP,GALILEO_RAMP_SHAFT_POINT,RAMP_BENCH,VERSION_ATLAS} from '../src/world';
import source from '../src/world.ts?raw';
const ramp=source.slice(source.indexOf('// Galileo Ramp Observatory (מצפה המדרון)'),source.indexOf('// Cat House (בית החתולים)'));
const ID='b-galileo-ramp-20261103';
describe('Galileo Ramp Observatory (מצפה המדרון)',()=>{
 it('adds one building on plot q=1 r=-4 as the newest building and event, and keeps the state valid',()=>{
  const b=state.buildings.find(b=>b.id===ID)!;expect(b).toBeTruthy();expect(b.plot).toEqual({q:1,r:-4});expect(b.name.he).toBe('מצפה המדרון');
  expect(state.buildings.at(-1)!.id).toBe(ID);expect(events.at(-1)!.id).toBe('galileo-ramp-20261103');
  expect(validateState(state as State)).toEqual([]);
 });
 it('the plot is free on the surface and buildable outside craters',()=>{
  const taken=[...state.districts.flatMap(d=>(d.plots??[{q:d.q,r:d.r}]).map(p=>p.q+','+p.r)),...state.landmarks.map(l=>l.q+','+l.r),...(state.installations??[]).flatMap(i=>i.plots.map(p=>p.q+','+p.r))];
  expect(taken.filter(k=>k==='1,-4')).toHaveLength(1);expect(buildable(1,-4)).toBe(true);
  for(const o of state.buildings)if(o.id!==ID&&o.plot)expect([o.plot.q,o.plot.r]).not.toEqual([1,-4]);
 });
 it('clears the loose natural stones off its hex',()=>{expect(source).toContain('||Math.hypot(x+17.320508075688775,z+60)<10');const [x,z]=hex(1,-4,10);expect(x).toBeCloseTo(-17.320508075688775,9);expect(z).toBe(-60);});
 it('stands at the same base height as the Atlas next door (pad .35 + plinth .6) and stays inside its hex',()=>{
  expect(GALILEO_RAMP.pad).toEqual(VERSION_ATLAS.pad);expect(GALILEO_RAMP.plinth.height).toBe(VERSION_ATLAS.plinth.height);
  const ap=GALILEO_RAMP.pad.radius*Math.cos(Math.PI/6);expect(GALILEO_RAMP.ramp.x+.4).toBeLessThan(ap);expect(Math.abs(GALILEO_RAMP.tower.x)+.6+GALILEO_RAMP.tower.height*GALILEO_RAMP.tower.lean).toBeLessThan(ap);
 });
 it('rings the bells at equal time steps: bell n sits at n squared parts of the ramp',()=>{
  expect(GALILEO_RAMP.bells).toEqual([1,4,9,16,25]);const g=GALILEO_RAMP.bells.map((d,i)=>d-(i?GALILEO_RAMP.bells[i-1]:0));expect(g).toEqual([1,3,5,7,9]);
 });
 it('is amber-copper with the builder\'s amber entrance strip, and nobody steps outside',()=>{
  expect(ramp).toContain('#d08a4c');expect(ramp).toContain('#ffad4d');expect(ramp).toMatch(/enclosed glass bridges/);expect(ramp).not.toMatch(/cutRoofWindows|cutApertures/);
 });
 it('has its own lab room directly below, the lift at the same shaft point as the surface well',()=>{
  const [cx,cz]=hex(1,-4,10);const i=ANNEX.findIndex(a=>a.theme==='ramp');expect(i).toBeGreaterThan(0);expect(ANNEX.filter(a=>a.theme==='ramp')).toHaveLength(1);
  const a=ANNEX[i];expect(a.x).toBeCloseTo(cx,9);expect(a.z).toBeCloseTo(cz,9);expect(a.fy).toBe(GALILEO_RAMP.room.fy);expect(a.name).not.toMatch(/יעקב|נועה|אלון|#\d/);
  const l=annexLiftAt(i);expect(l.x).toBeCloseTo(cx+GALILEO_RAMP_SHAFT_POINT.x,9);expect(l.z).toBeCloseTo(cz+GALILEO_RAMP_SHAFT_POINT.z,9);
  expect(NOV4_SHAFTS).toHaveLength(1);expect(NOV4_SHAFTS[0].x0).toBeCloseTo(l.x-1,9);expect(NOV4_SHAFTS[0].z1).toBeCloseTo(l.z+1,9);
  expect(pilotOpening(l.x,l.z)).toBe(true);expect(reviewWalkable(cx,cz)).toBe(true);expect(reviewFloorAt(cx,cz)).toBe(-8.6);
  expect(GALILEO_RAMP.lift.radius).toBeGreaterThan(GALILEO_RAMP.lift.well);expect(ramp).toContain('padShape.holes.push(well)');
  for(const o of ANNEX.filter(o=>o!==a))expect(Math.hypot(o.x-a.x,o.z-a.z)).toBeGreaterThan(8.66);
 });
 it('connects by a level passage to the Atlas map room west of it',()=>{
  const me=ANNEX.find(a=>a.theme==='ramp')!,at=ANNEX.find(a=>a.theme==='atlas')!;expect(me.doors).toEqual([180]);expect(at.doors).toContain(0);
  expect(Math.hypot(me.x-at.x,me.z-at.z)).toBeCloseTo(10*Math.sqrt(3),9);expect(me.z).toBe(at.z);expect(at.fy).toBe(me.fy);
  for(let k=0;k<=100;k++){const t=k/100,x=me.x*(1-t)+at.x*t;expect(reviewWalkable(x,me.z)).toBe(true);expect(reviewFloorAt(x,me.z)).toBeCloseTo(-8.6,6);}
 });
 it('lift centre is walkable with a free step all round, and the bench stays off the door-to-lift route',()=>{
  const i=ANNEX.findIndex(a=>a.theme==='ramp'),l=annexLiftAt(i),me=ANNEX[i];
  const clear=(x:number,z:number)=>reviewWalkable(x+.17,z)&&reviewWalkable(x-.17,z)&&reviewWalkable(x,z+.17)&&reviewWalkable(x,z-.17)&&reviewWalkable(x,z);
  expect(clear(l.x,l.z)).toBe(true);for(let k=0;k<720;k++){const a=k*Math.PI/360;expect(clear(l.x+Math.cos(a)*.1,l.z+Math.sin(a)*.1)).toBe(true);}
  const door={x:me.x-6.8*.8660254,z:me.z},B=RAMP_BENCH;for(let k=0;k<=50;k++){const t=k/50,x=door.x*(1-t)+l.x*t,z=door.z*(1-t)+l.z*t;expect(Math.abs(z-(me.z+B.z))>B.d/2+.6||Math.abs(x-(me.x+B.x))>B.w/2+.6).toBe(true);}
 });
 it('is reachable by walking from the standard entry over the real walkable network',()=>{
  const me=ANNEX.find(a=>a.theme==='ramp')!,lift=annexLiftAt(ANNEX.indexOf(me));
  const step=.5,key=(i:number,j:number)=>i+','+j,ix=(x:number)=>Math.round(x/step);
  const near=(x:number,z:number)=>{for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++)if(reviewWalkable((ix(x)+a)*step,(ix(z)+b)*step))return [ix(x)+a,ix(z)+b];return null};
  const s=near(0,0)!,g=[ix(lift.x),ix(lift.z)];expect(s).toBeTruthy();expect(reviewWalkable(g[0]*step,g[1]*step)).toBe(true);
  const seen=new Set([key(s[0],s[1])]);const q=[s];
  while(q.length){const [i,j]=q.shift()!;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+di,nj=j+dj,k=key(ni,nj);if(seen.has(k))continue;if(Math.abs(ni*step)>110||Math.abs(nj*step)>130)continue;if(!reviewWalkable(ni*step,nj*step))continue;seen.add(k);q.push([ni,nj]);}}
  expect(seen.has(key(g[0],g[1]))).toBe(true);
 });
 it('keeps public text abstract: no personal names or office numbers',()=>{
  const ev=events.find(e=>e.id==='galileo-ramp-20261103');expect(ev).toBeTruthy();
  expect(JSON.stringify(ev)).not.toMatch(/יעקב|נועה|אלון|Yaakov|Noa|Alon|#\d|we built/i);expect(ramp).not.toMatch(/יעקב|נועה|אלון|Yaakov|Noa|Alon|office #/);
 });
});
