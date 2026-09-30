import {describe,it,expect} from 'vitest';
import {nextHex,buildable,EDGES,CRATERS,hexCenter} from '../scripts/layout.mjs';
describe('permanent reserves and contiguous random-edge growth',()=>{
 it('grows 150 adjacent districts without islands or overlaps',()=>{const ds=[{q:-1,r:0}],landmarks=[{q:0,r:-1}];for(let i=0;i<150;i++){const p=nextHex(ds,landmarks,'event'+i);expect(buildable(p.q,p.r)).toBe(true);expect([...ds,...landmarks].some(d=>d.q===p.q&&d.r===p.r)).toBe(false);expect([...ds,...landmarks].some(d=>EDGES.some(([q,r])=>d.q+q===p.q&&d.r+r===p.r))).toBe(true);ds.push(p)}});
 it('replays the same event but uses varied free edges across seeds',()=>{const ds=[{q:-1,r:0}];expect(nextHex(ds,[],'same')).toEqual(nextHex(ds,[],'same'));expect(new Set(Array.from({length:40},(_,i)=>JSON.stringify(nextHex(ds,[],'seed'+i)))).size).toBeGreaterThan(2)});
 it('excludes the full hex footprint around every crater',()=>{for(let q=-9;q<9;q++)for(let r=-9;r<9;r++){const [x,z]=hexCenter(q,r);if(CRATERS.some(c=>Math.hypot(x-c.x,z-c.z)<=c.radius*1.22+10.8))expect(buildable(q,r)).toBe(false)}});
});
