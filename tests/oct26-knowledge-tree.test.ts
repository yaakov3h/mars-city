import {it,expect} from 'vitest';
import state from '../data/city-state.json';
import {validateState,hex} from '../src/model';
import {ANNEX,annexLiftAt,reviewWalkable} from '../src/review-underground';
import {pilotOpening,OCT26_SHAFTS} from '../src/underground';
import {KNOWLEDGE_SHAFT_POINT} from '../src/oct26-knowledge-tree';
const id='b-knowledge-tree-20261026';
it('places the Knowledge Tree on its own full plot with a valid state',()=>{
 const b=state.buildings.find(b=>b.id===id)!;expect(b.plot).toEqual({q:-5,r:5});
 expect(validateState(state as any)).toEqual([]);
 expect(state.buildings.filter(x=>x.plot&&x.plot.q===-5&&x.plot.r===5)).toHaveLength(1);
 expect(state.buildings.some(x=>x.plot&&x.plot.q===-3&&x.plot.r===6)).toBe(false);
});
it('has its own reading room and lift at the same shaft point as the surface head',()=>{
 const [cx,cz]=hex(-5,5,10);const i=ANNEX.findIndex(a=>a.theme==='knowledge');expect(i).toBeGreaterThan(0);
 const a=ANNEX[i];expect(a.x).toBeCloseTo(cx,5);expect(a.z).toBeCloseTo(cz,5);expect(a.fy).toBe(-8.4);
 const l=annexLiftAt(i);expect(l.x).toBeCloseTo(cx+KNOWLEDGE_SHAFT_POINT.x,5);expect(l.z).toBeCloseTo(cz+KNOWLEDGE_SHAFT_POINT.z,5);
 expect(OCT26_SHAFTS).toHaveLength(1);expect(pilotOpening(l.x,l.z)).toBe(true);
 expect(reviewWalkable(cx,cz)).toBe(true);
});
it('connects only to the professions analysis room and changes no other room',()=>{
 const me=ANNEX.find(a=>a.theme==='knowledge')!,pr=ANNEX.find(a=>a.theme==='professions')!,view=ANNEX.find(a=>a.theme==='view')!,ex=ANNEX.find(a=>a.theme==='explainer')!;
 expect(me.doors).toEqual([180,0]);expect(pr.doors).toEqual([240,300,120,60,180]);
 expect(view.doors).toEqual([0,300,60]);expect(ex.doors).toEqual([300,180]);
 expect(pr.x-me.x).toBeCloseTo(10*Math.sqrt(3),6);expect(pr.z).toBe(me.z);expect(pr.fy).toBe(me.fy);
 for(const a of ANNEX.filter(a=>a!==me&&a!==pr)){expect(Math.hypot(a.x-me.x,a.z-me.z)).toBeGreaterThan(13.6);}
});
it('lift centre is itself walkable, with a free step in every direction (no snap into a dead spot)',()=>{
 const i=ANNEX.findIndex(a=>a.theme==='knowledge'),l=annexLiftAt(i);
 expect(reviewWalkable(l.x,l.z)).toBe(true);
 // the tour moves only when the target AND the four 0.17 probes are walkable, max step 0.1
 const clear=(x:number,z:number)=>reviewWalkable(x+.17,z)&&reviewWalkable(x-.17,z)&&reviewWalkable(x,z+.17)&&reviewWalkable(x,z-.17)&&reviewWalkable(x,z);
 expect(clear(l.x,l.z)).toBe(true);
 for(let k=0;k<720;k++){const a=k*Math.PI/360;expect(clear(l.x+Math.cos(a)*.1,l.z+Math.sin(a)*.1)).toBe(true);}
 expect(OCT26_SHAFTS[0].x0).toBeCloseTo(l.x-1,6);expect(OCT26_SHAFTS[0].z1).toBeCloseTo(l.z+1,6);
});
it('is reachable by walking from the standard entry and back, over the real walkable network',()=>{
 const me=ANNEX.find(a=>a.theme==='knowledge')!;
 const lift=annexLiftAt(ANNEX.indexOf(me));
 const step=.5,key=(i:number,j:number)=>i+','+j,ix=(x:number)=>Math.round(x/step);
 const start=[ix(0),ix(0)];const goal=[ix(lift.x),ix(lift.z)];
 const near=(x:number,z:number)=>{for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++)if(reviewWalkable((ix(x)+a)*step,(ix(z)+b)*step))return [ix(x)+a,ix(z)+b];return null};
 const s=near(0,0)!,g=[ix(lift.x),ix(lift.z)];expect(reviewWalkable(g[0]*step,g[1]*step)).toBe(true);expect(s).toBeTruthy();expect(g).toBeTruthy();void start;void goal;
 const seen=new Set([key(s[0],s[1])]);const q=[s];
 while(q.length){const [i,j]=q.shift()!;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+di,nj=j+dj,k=key(ni,nj);if(seen.has(k))continue;if(Math.abs(ni*step)>80||Math.abs(nj*step)>120)continue;if(!reviewWalkable(ni*step,nj*step))continue;seen.add(k);q.push([ni,nj]);}}
 expect(seen.has(key(g[0],g[1]))).toBe(true);
 // undirected grid: the return trip is the same connected set
 expect(seen.has(key(s[0],s[1]))).toBe(true);
});
