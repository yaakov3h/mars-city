import {it,expect} from 'vitest';
import {buildable} from '../scripts/layout.mjs';
import {hex,random,validateState,validateEvent,districtPlots,events} from '../src/model';
import * as THREE from 'three';
import {JOINT_MONUMENT_ID,MONUMENT,MONUMENT_SHAFT_POINT,MONUMENT_SYMBOL,MONUMENT_GROUND_PAD,apothem,stairWallClearance,cupolaCapGeometry,plinthCorner,gridHexDistance,monumentGroundPad} from '../src/oct24-monument';
import world from '../src/world.ts?raw';
import state from '../data/city-state.json';
import prior from './fixtures/revision47.json';
import source from '../src/oct24-monument.ts?raw';
it('preserves every previous entity and adds only the joint monument landmark',()=>{
  for(const b of prior.buildings)expect(state.buildings.find(n=>n.id===b.id)).toEqual(b);
  for(const d of prior.districts){const n=state.districts.find(n=>n.id===d.id)!;if(d.id==='district-genesis-20260930'||d.id==='district-codesign-20260930')expect(n.plots!.slice(0,d.plots!.length)).toEqual(d.plots);else if(d.id==='district-academic-recognition-20261001'){expect(n.plots!.slice(0,d.plots!.length)).toEqual(d.plots);expect(n.plots!.slice(d.plots!.length).map(p=>[p.q,p.r])).toEqual([[0,-7]]);}else expect(n).toEqual(d);}
  for(const k of ['creatures','installations']as const)expect(state[k]).toEqual(prior[k]);
  expect(state.landmarks.slice(0,prior.landmarks.length)).toEqual(prior.landmarks);
  expect(state.landmarks.slice(prior.landmarks.length).map(l=>l.id)).toEqual([JOINT_MONUMENT_ID,'l-birthday-monolith-20261106']);
  expect(state.buildings.length).toBe(prior.buildings.length+18);
  expect(state.totalQuestions).toBe(prior.totalQuestions);
  expect(state.revision-prior.revision).toBe(13);
  expect(validateState(state)).toEqual([]);
});
it('stands on the free, rock-clear plot q=-4 r=6, mirroring the Genesis Core data shape',()=>{
  const l=state.landmarks.find(l=>l.id===JOINT_MONUMENT_ID)!;
  expect([l.q,l.r]).toEqual([-4,6]);expect(l.kind).toBe('monument');
  expect(Object.keys(l).sort()).toEqual(Object.keys(state.landmarks[0]).sort());
  expect(l.surfaceTreatment?.material).toBe('dark basalt with copper edge glow');
  expect(buildable(-4,6)).toBe(true);
  const taken=[...prior.districts.flatMap(d=>districtPlots(d)),...prior.landmarks,...(prior.installations??[]).flatMap(i=>i.plots)].map(p=>p.q+','+p.r);
  expect(taken).not.toContain('-4,6');
  const [x,z]=hex(-4,6,10);
  for(let i=0;i<360;i++)expect(Math.hypot(x-(random('rx'+i)-.5)*230,z-(random('rz'+i)-.5)*230)).toBeGreaterThan(10+.16+random('rs'+i)*1.35);
});
it('logs one abstract milestone event',()=>{
  const mine=events.filter(e=>e.id==='joint-monument-20261024');
  expect(mine).toHaveLength(1);expect(validateEvent(mine[0])).toEqual([]);
  expect(JSON.stringify(mine[0])).not.toMatch(/יעקב|נועה|וואטסאפ/);
});

it('draws the ground pad flush with the plinth floor without moving podiumY or the lift axis',()=>{
  const g=new THREE.Group(),m=new THREE.MeshBasicMaterial();
  monumentGroundPad(g,()=>-.3,{tile:m,wall:m,glow:m,post:m});
  const tile=g.children.find(o=>o.userData.groundTile) as THREE.Mesh,rim=g.children.find(o=>o.userData.groundRim) as THREE.Mesh;
  tile.geometry.computeBoundingBox();const bb=tile.geometry.boundingBox!;
  // tile top = plinth floor (local y 0): flush, no gap, no float, no sink
  expect(bb.max.y).toBeCloseTo(0,9);expect(bb.min.y).toBeCloseTo(0,9);
  // same footprint as a district tile: radius 9.94, vertices on ±z, centred on the plot
  expect(bb.max.z).toBeCloseTo(MONUMENT_GROUND_PAD.radius,6);expect(bb.min.z).toBeCloseTo(-MONUMENT_GROUND_PAD.radius,6);
  expect(bb.max.x).toBeCloseTo(apothem(MONUMENT_GROUND_PAD.radius),6);expect(bb.min.x).toBeCloseTo(-apothem(MONUMENT_GROUND_PAD.radius),6);
  // the tile is a ring round the plinth (no surface coplanar with the plinth floor inside it)
  const pos=tile.geometry.attributes.position;let inner=Infinity;for(let i=0;i<pos.count;i++)inner=Math.min(inner,gridHexDistance(pos.getX(i),pos.getZ(i)));
  expect(inner).toBeCloseTo(apothem(MONUMENT.plinth.radius-.1),6);expect(inner).toBeLessThan(apothem(MONUMENT.plinth.radius));
  // the rim wall runs from the tile top down past the lowered terrain, the way zone() draws a district tile's wall
  rim.geometry.computeBoundingBox();expect(rim.geometry.boundingBox!.max.y).toBeCloseTo(0,9);expect(rim.geometry.boundingBox!.min.y).toBeLessThanOrEqual(-MONUMENT_GROUND_PAD.drop-.12+1e-6);
  // world.ts: the group (podiumY) stays at natural ground +.08 at the plot centre, the terrain under the tile drops by MONUMENT_GROUND_PAD.drop
  expect(world).toContain('leveledPads.push({x,z,y:naturalGroundY(x,z)+.08-MONUMENT_GROUND_PAD.drop})');
  expect(world).toContain('else if(l.id===JOINT_MONUMENT_ID){const y0=naturalGroundY(x,z)+.08;');
  expect(world).toMatch(/monumentGroundPad\(group,\(px,pz\)=>naturalGroundY\(x\+px,z\+pz\)-y0,/);
});
