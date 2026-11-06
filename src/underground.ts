import * as THREE from 'three';
import {detailedSurface,type World} from './world';
// Pilot v2: edge-centered skylight and camera-relative input.
// Explicit pilot bounds, independent of decorative rendering geometry.
export const PILOT={street:{x0:-39,x1:-13,z0:1,z1:7},room:{x0:-38,x1:-31,z0:7,z1:12},glass:{x0:-27.480762,x1:-24.480762,z0:2,z1:6},shaft:{x0:-20,x1:-18,z0:5,z1:7},floor:-9};
export function inRect(x:number,z:number,r:{x0:number;x1:number;z0:number;z1:number},margin=0){return x>=r.x0+margin&&x<=r.x1-margin&&z>=r.z0+margin&&z<=r.z1-margin;}
export const OCT10_SHAFTS=[{x:-15*Math.sqrt(3),z:39.6},{x:-35*Math.sqrt(3),z:-50.4},{x:-25*Math.sqrt(3),z:-18.6}].map(p=>({x0:p.x-1,x1:p.x+1,z0:p.z-1,z1:p.z+1}));
export const REVIEW_SHAFTS=[{x:-20*Math.sqrt(3),z:2.7},{x:-10*Math.sqrt(3),z:1.8}].map(p=>({x0:p.x-1,x1:p.x+1,z0:p.z-1,z1:p.z+1}));
export const OCT11_SHAFTS=[{x0:-25*Math.sqrt(3)-1,x1:-25*Math.sqrt(3)+1,z0:-51.4,z1:-49.4}];
export const OCT12_SHAFTS=[{x:-20*Math.sqrt(3),z:54.6},{x:-5*Math.sqrt(3),z:-50.4}].map(p=>({x0:p.x-1,x1:p.x+1,z0:p.z-1,z1:p.z+1}));
export const OCT13_SHAFTS=[{x:-15*Math.sqrt(3),z:69.6},{x:0,z:-35.4}].map(p=>({x0:p.x-1,x1:p.x+1,z0:p.z-1,z1:p.z+1}));
export const OCT14_SHAFTS=[{x:5*Math.sqrt(3),z:69.6},{x:-45*Math.sqrt(3),z:-50.4}].map(p=>({x0:p.x-1,x1:p.x+1,z0:p.z-1,z1:p.z+1}));
export const OCT15_SHAFTS=[{x:-50*Math.sqrt(3),z:-35.4}].map(p=>({x0:p.x-1,x1:p.x+1,z0:p.z-1,z1:p.z+1}));
export const OCT15_EVENING_SHAFTS=[{x:-40*Math.sqrt(3),z:-65.4},{x:-30*Math.sqrt(3),z:-65.4}].map(p=>({x0:p.x-1,x1:p.x+1,z0:p.z-1,z1:p.z+1}));
export const OCT17_SHAFTS=[{x:-45*Math.sqrt(3),z:-80.4},{x:-35*Math.sqrt(3),z:-80.4}].map(p=>({x0:p.x-1,x1:p.x+1,z0:p.z-1,z1:p.z+1}));
export const OCT18_SHAFTS=[{x:-40*Math.sqrt(3),z:-95.4},{x:-30*Math.sqrt(3),z:-95.4}].map(p=>({x0:p.x-1,x1:p.x+1,z0:p.z-1,z1:p.z+1}));
export const OCT19_SHAFTS=[{x:-20*Math.sqrt(3),z:-95.4}].map(p=>({x0:p.x-1,x1:p.x+1,z0:p.z-1,z1:p.z+1}));
// Explainer Studio lift: the reserved shaft point Alon sealed on the surface pad, opened by Noa with the archive room below.
export const OCT24_SHAFTS=[{x:-20*Math.sqrt(3)-5.7,z:90-1.2}].map(p=>({x0:p.x-1,x1:p.x+1,z0:p.z-1,z1:p.z+1}));
// Knowledge Tree lift: the shaft point on the surface pad, opened to the reading room below.
export const OCT26_SHAFTS=[{x:-25*Math.sqrt(3)-5.2,z:75-1.2}].map(p=>({x0:p.x-1,x1:p.x+1,z0:p.z-1,z1:p.z+1}));
// Dream Archive lift: the shaft point on the surface pad, opened to the dream room below.
export const OCT27_SHAFTS=[{x:-25*Math.sqrt(3)-4.3,z:105-1.2}].map(p=>({x0:p.x-1,x1:p.x+1,z0:p.z-1,z1:p.z+1}));
// Three Tails lift: the shaft point on the surface pad, opened to the rest room below.
export const NOV1_SHAFTS=[{x:-15*Math.sqrt(3)-4.3,z:105-1.2}].map(p=>({x0:p.x-1,x1:p.x+1,z0:p.z-1,z1:p.z+1}));
// Version Atlas lift: the open well in the Atlas pad (plot q=0 r=-4, pad local x=0 z=-5.4), down to the atlas map room.
export const OCT28_SHAFTS=[{x:-20*Math.sqrt(3),z:-60-5.4}].map(p=>({x0:p.x-1,x1:p.x+1,z0:p.z-1,z1:p.z+1}));
// Galileo Ramp lift: the open well in the observatory pad (plot q=1 r=-4, pad local x=0 z=-5.4), down to the ramp lab room.
export const NOV4_SHAFTS=[{x:-10*Math.sqrt(3),z:-60-5.4}].map(p=>({x0:p.x-1,x1:p.x+1,z0:p.z-1,z1:p.z+1}));
export const NOV4_ACCORD_SHAFTS=[{x:0,z:-60-5.4}].map(p=>({x0:p.x-1,x1:p.x+1,z0:p.z-1,z1:p.z+1}));
export function pilotOpening(x:number,z:number){return inRect(x,z+4,PILOT.glass)||inRect(x,z+4,PILOT.shaft)||OCT10_SHAFTS.some(r=>inRect(x,z,r))||OCT11_SHAFTS.some(r=>inRect(x,z,r))||OCT12_SHAFTS.some(r=>inRect(x,z,r))||OCT13_SHAFTS.some(r=>inRect(x,z,r))||OCT14_SHAFTS.some(r=>inRect(x,z,r))||OCT15_SHAFTS.some(r=>inRect(x,z,r))||OCT15_EVENING_SHAFTS.some(r=>inRect(x,z,r))||OCT17_SHAFTS.some(r=>inRect(x,z,r))||OCT18_SHAFTS.some(r=>inRect(x,z,r))||OCT19_SHAFTS.some(r=>inRect(x,z,r))||OCT24_SHAFTS.some(r=>inRect(x,z,r))||OCT26_SHAFTS.some(r=>inRect(x,z,r))||OCT27_SHAFTS.some(r=>inRect(x,z,r))||NOV1_SHAFTS.some(r=>inRect(x,z,r))||OCT28_SHAFTS.some(r=>inRect(x,z,r))||NOV4_SHAFTS.some(r=>inRect(x,z,r))||NOV4_ACCORD_SHAFTS.some(r=>inRect(x,z,r))||REVIEW_SHAFTS.some(r=>inRect(x,z,r))||inRect(x,z,{x0:-15*Math.sqrt(3)-1.5,x1:-15*Math.sqrt(3)+1.5,z0:-2,z1:2});}
export function movementVector(yaw:number,right:number,forward:number){return {x:-Math.sin(yaw)*forward+Math.cos(yaw)*right,z:-Math.cos(yaw)*forward-Math.sin(yaw)*right};}
// Clip triangles at exact rectangular aperture edges, interpolating all vertex attributes.
export function cutApertures(g:THREE.BufferGeometry,cut:boolean,ox=0,oz=0){
 if(!g.userData.apertureOriginal){g.userData.apertureOriginal={index:Array.from(g.index!.array),attributes:Object.fromEntries(Object.entries(g.attributes).map(([k,a])=>[k,{size:a.itemSize,values:Array.from(a.array)}]))};}
 const original=g.userData.apertureOriginal as {index:number[];attributes:Record<string,{size:number;values:number[]}>};if(!cut){g.setIndex(original.index);for(const [k,a] of Object.entries(original.attributes))g.setAttribute(k,new THREE.Float32BufferAttribute(a.values,a.size));return;}
 const names=Object.keys(original.attributes),sizes=names.map(k=>original.attributes[k].size),offsets:number[]=[];let length=0;for(const n of sizes){offsets.push(length);length+=n;}const pOffset=offsets[names.indexOf('position')];const vertex=(id:number)=>names.flatMap(k=>{const a=original.attributes[k];return a.values.slice(id*a.size,(id+1)*a.size)});const values:Record<string,number[]>=Object.fromEntries(names.map(k=>[k,[]]));const indices:number[]=[];let count=0;
 const split=(poly:number[][],axis:number,bound:number)=>{const lo:number[][]=[],hi:number[][]=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],va=a[pOffset+axis],vb=b[pOffset+axis];(va<=bound?lo:hi).push(a);if((va<bound&&vb>bound)||(va>bound&&vb<bound)){const t=(bound-va)/(vb-va),v=a.map((n,k)=>n+(b[k]-n)*t);lo.push(v);hi.push(v);}}return [lo,hi];};
 const rects=[...[PILOT.glass,PILOT.shaft].map(r=>({...r,z0:r.z0-4,z1:r.z1-4})),...REVIEW_SHAFTS,...OCT10_SHAFTS,...OCT11_SHAFTS,...OCT12_SHAFTS,...OCT13_SHAFTS,...OCT14_SHAFTS,...OCT15_SHAFTS,...OCT15_EVENING_SHAFTS,...OCT17_SHAFTS,...OCT18_SHAFTS,...OCT19_SHAFTS,...OCT24_SHAFTS,...OCT26_SHAFTS,...OCT27_SHAFTS,...NOV1_SHAFTS,...OCT28_SHAFTS,...NOV4_SHAFTS,...NOV4_ACCORD_SHAFTS,{x0:-15*Math.sqrt(3)-1.5,x1:-15*Math.sqrt(3)+1.5,z0:-2,z1:2}];for(let i=0;i<original.index.length;i+=3){let polys=[original.index.slice(i,i+3).map(vertex)];for(const r of rects){const out:number[][][]=[];for(const poly of polys){const xs=poly.map(v=>v[pOffset]+ox),zs=poly.map(v=>v[pOffset+2]+oz);if(Math.max(...xs)<=r.x0||Math.min(...xs)>=r.x1||Math.max(...zs)<=r.z0||Math.min(...zs)>=r.z1){out.push(poly);continue;}let candidates=[poly];for(const [axis,bound,keepLow] of [[0,r.x0-ox,true],[0,r.x1-ox,false],[2,r.z0-oz,true],[2,r.z1-oz,false]] as [number,number,boolean][]){const next:number[][][]=[];for(const p of candidates){const [lo,hi]=split(p,axis,bound),outside=keepLow?lo:hi,inside=keepLow?hi:lo;if(outside.length>=3)out.push(outside);if(inside.length>=3)next.push(inside);}candidates=next;}}polys=out;}for(const poly of polys){const start=count;for(const v of poly){names.forEach((k,j)=>values[k].push(...v.slice(offsets[j],offsets[j]+sizes[j])));count++;}for(let j=1;j<poly.length-1;j++)indices.push(start,start+j,start+j+1);}}
 for(const k of names)g.setAttribute(k,new THREE.Float32BufferAttribute(values[k],original.attributes[k].size));g.setIndex(indices);g.computeVertexNormals();
}


export type RoofWindow={x:number;z:number;radius:number;angle?:number};
// Subtract convex hex windows from surfaces while preserving interpolated vertex attributes.
export function cutRoofWindows(g:THREE.BufferGeometry,windows:RoofWindow[],ox=0,oz=0){
 const attrs=Object.entries(g.attributes),sizes=attrs.map(([,a])=>a.itemSize),offsets:number[]=[];let len=0;for(const n of sizes){offsets.push(len);len+=n;}const pi=offsets[attrs.findIndex(([k])=>k==='position')],values=attrs.map(()=>[] as number[]),indices:number[]=[];let count=0;const original=Array.from(g.index!.array);
 const vertex=(i:number)=>attrs.flatMap(([,a])=>Array.from({length:a.itemSize},(_,j)=>a.array[i*a.itemSize+j] as number));
 for(let i=0;i<original.length;i+=3){let polys=[original.slice(i,i+3).map(vertex)];for(const w of windows){const points=Array.from({length:6},(_,j)=>({x:w.x-ox+Math.cos(j*Math.PI/3+(w.angle??0))*w.radius,z:w.z-oz+Math.sin(j*Math.PI/3+(w.angle??0))*w.radius}));const out:number[][][]=[];for(const poly of polys){let inside=[poly];for(let j=0;j<6;j++){const a=points[j],b=points[(j+1)%6],cross=(v:number[])=> (b.x-a.x)*(v[pi+2]-a.z)-(b.z-a.z)*(v[pi]-a.x),next:number[][][]=[];for(const part of inside){const keep:number[][]=[],outside:number[][]=[];for(let k=0;k<part.length;k++){const u=part[k],v=part[(k+1)%part.length],cu=cross(u),cv=cross(v);(cu>=0?keep:outside).push(u);if(cu*cv<0){const t=cu/(cu-cv),p=u.map((n,k)=>n+(v[k]-n)*t);keep.push(p);outside.push(p);}}if(outside.length>=3)out.push(outside);if(keep.length>=3)next.push(keep);}inside=next;} }polys=out;}for(const poly of polys){const start=count;for(const v of poly){attrs.forEach((_,j)=>values[j].push(...v.slice(offsets[j],offsets[j]+sizes[j])));count++;}for(let j=1;j<poly.length-1;j++)indices.push(start,start+j,start+j+1);}}
 attrs.forEach(([k,a],j)=>g.setAttribute(k,new THREE.Float32BufferAttribute(values[j],a.itemSize)));g.setIndex(indices);g.computeVertexNormals();
}
