import {it,expect} from 'vitest';
import {buildable} from '../scripts/layout.mjs';
import {hex,random,validateState,validateEvent,districtPlots,events} from '../src/model';
import * as THREE from 'three';
import {JOINT_MONUMENT_ID,MONUMENT,MONUMENT_SHAFT_POINT,MONUMENT_LIFT,MONUMENT_LIFT_CAB,MONUMENT_SYMBOL,MONUMENT_GROUND_PAD,apothem,stairWallClearance,cupolaCapGeometry,plinthCorner,gridHexDistance,monumentGroundPad} from '../src/oct24-monument';
import world from '../src/world.ts?raw';
import state from '../data/city-state.json';
import prior from './fixtures/revision47.json';
import source from '../src/oct24-monument.ts?raw';
it('preserves every previous entity and adds only the joint monument landmark',()=>{
  for(const b of prior.buildings)expect(state.buildings.find(n=>n.id===b.id)).toEqual(b);
  for(const d of prior.districts){const n=state.districts.find(n=>n.id===d.id)!;if(d.id==='district-genesis-20260930'||d.id==='district-codesign-20260930')expect(n.plots!.slice(0,d.plots!.length)).toEqual(d.plots);else expect(n).toEqual(d);}
  for(const k of ['mosaic','creatures','installations']as const)expect(state[k]).toEqual(prior[k]);
  expect(state.landmarks.slice(0,prior.landmarks.length)).toEqual(prior.landmarks);
  expect(state.landmarks.slice(prior.landmarks.length).map(l=>l.id)).toEqual([JOINT_MONUMENT_ID]);
  expect(state.buildings.length).toBe(prior.buildings.length+3);
  expect(state.totalQuestions).toBe(prior.totalQuestions);
  expect(state.revision-prior.revision).toBe(4);
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
it('keeps the agreed measurements',()=>{
  const{plinth,body,shaft,stair,crown,cupola,symbol}=MONUMENT;
  expect(plinth).toEqual({radius:8.6,height:3});
  expect([body.radius,body.x,body.y0,body.y1,body.wall]).toEqual([5.6,1.8,3,46,.3]);
  expect([shaft.radius,shaft.x,shaft.y0,shaft.y1]).toEqual([1.5,3.6,0,52]);
  expect([stair.inner,stair.outer,stair.y0,stair.y1]).toEqual([1.6,2.8,0,46]);
  expect([crown.y0,crown.y1,cupola.radius,cupola.x,cupola.y0,cupola.wall,cupola.y1]).toEqual([46,52,2.4,3.6,52,54.42,54.52]);
  expect([symbol.y0,symbol.y1]).toEqual([cupola.y1,55]);
  // the two-half hex really ends at or under the 55 envelope (stem + flat-top hexagon of height 2*apothem)
  const symbolTop=symbol.y0+MONUMENT_SYMBOL.stem+2*MONUMENT_SYMBOL.apothem;
  expect(symbolTop).toBeLessThanOrEqual(55);expect(symbolTop).toBeGreaterThan(54.95);
  // everything fits: plinth inside the hex shell (9.94), tower inside the plinth, cupola inside the tower roof
  expect(plinth.radius).toBeLessThanOrEqual(apothem(9.94)+.01);
  // the plinth has a flat face on +x now (grid-aligned), so the tower's +x vertex is measured against the plinth apothem
  expect(body.x+body.radius).toBeLessThan(apothem(plinth.radius));
  expect(shaft.x-body.x+cupola.radius*Math.cos(Math.PI/6)).toBeLessThan(apothem(body.radius));
  expect(stair.inner).toBeGreaterThan(shaft.radius);
  expect(stairWallClearance()).toBeCloseTo(.19,2);
});
it('puts the lift head pad on the agreed world point for the underground connection',()=>{
  const [x,z]=hex(-4,6,10);
  expect(x+MONUMENT_SHAFT_POINT.x).toBeCloseTo(-13.72,2);expect(z+MONUMENT_SHAFT_POINT.z).toBeCloseTo(90,6);
  expect(MONUMENT_SHAFT_POINT.y).toBe(0);
});
it('is sealed above ground and leaves the underground to its own builder',()=>{
  expect(source).toContain('no door, no stair outside');
  expect(source).toContain('no railing, no balcony');
  expect(source).toMatch(/turquoise[^\n]*amber/);
  expect(source).not.toMatch(/ANNEX|review-underground|cutRoofWindows|SEGS2/);
  expect(source).not.toMatch(/fillText|CanvasTexture/);
});
it('holds the shared lift contract and owns the surface pad and ground opening in world.ts',()=>{
  expect(MONUMENT_LIFT).toEqual({cage:1.9,headPad:2.4,opening:2.0,door:'+z',undergroundFloor:-8.4,stops:[0,46,52]});
  expect(MONUMENT_LIFT.cage*Math.SQRT1_2).toBeLessThan(MONUMENT.shaft.radius);
  expect(MONUMENT_LIFT.opening).toBeGreaterThan(MONUMENT_LIFT.cage);
  expect(MONUMENT_LIFT.opening*Math.SQRT1_2).toBeLessThan(MONUMENT.shaft.radius);
  expect(MONUMENT_LIFT.headPad*Math.SQRT1_2).toBeLessThan(2*Math.cos(Math.PI/6));
  expect(MONUMENT_LIFT.stops.at(-1)).toBe(MONUMENT.cupola.y0);
  expect(world).toMatch(/l\.id===JOINT_MONUMENT_ID\)\{const \[x,z\]=hex\(l\.q,l\.r,10\);leveledPads\.push/);
  expect(world).toContain('this.roofWindows.push({x:x+MONUMENT_SHAFT_POINT.x,z:z+MONUMENT_SHAFT_POINT.z,radius:2,angle:0})');
  expect(source).not.toMatch(/undergroundFloor\s*[,}][^\n]*add\(/);
});
it('leaves the moving cab to the underground builder and gives it head room in the cupola',()=>{
  // no static/parked cab is drawn here any more
  expect(source).not.toMatch(/cabY|parked/);
  const C=MONUMENT_LIFT_CAB;
  expect([C.width,C.depth,C.height,C.door]).toEqual([1.9,1.9,2.2,'+z']);
  expect(C.width).toBe(MONUMENT_LIFT.cage);
  expect(C.stations.map(s=>s.y)).toEqual([...MONUMENT_LIFT.stops]);
  expect(C.undergroundFloor).toBe(MONUMENT_LIFT.undergroundFloor);
  expect(C.axisLocal).toEqual({x:MONUMENT_SHAFT_POINT.x,z:MONUMENT_SHAFT_POINT.z});
  const [x,z]=hex(-4,6,10);
  expect(C.axisWorld.x).toBeCloseTo(x+MONUMENT_SHAFT_POINT.x,4);expect(C.axisWorld.z).toBeCloseTo(z+MONUMENT_SHAFT_POINT.z,6);
  // cab standing at the top stop: its roof vs the inside of the cupola glass, at the axis and over the whole roof
  const{cupola}=MONUMENT,top=MONUMENT_LIFT.stops.at(-1)!+C.height,cap=new THREE.Mesh(cupolaCapGeometry(),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
  const up=(px:number,pz:number)=>{const r=new THREE.Raycaster(new THREE.Vector3(px,top,pz),new THREE.Vector3(0,1,0));const h=r.intersectObject(cap);return h.length?h[0].point.y-top:cupola.wall-top;};
  expect(up(0,0)).toBeCloseTo(cupola.y1-top,3);expect(up(0,0)).toBeGreaterThanOrEqual(.2);
  let min=Infinity;for(let i=0;i<=8;i++)for(let j=0;j<=8;j++)min=Math.min(min,up(-C.width/2+i*C.width/8,-C.depth/2+j*C.depth/8));
  expect(min).toBeGreaterThanOrEqual(.2);
  expect(cupola.wall-top).toBeGreaterThanOrEqual(.2);
  // the cab fits inside the hex wall in plan
  expect(Math.hypot(C.width/2,C.depth/2)).toBeLessThan(apothem(cupola.radius));
});
it('attributes the identity colours: turquoise is Noa, amber is Alon',()=>{
  expect(source).toMatch(/turq\);bandA\.userData\.spiral='noa'/);
  expect(source).toMatch(/amber\);bandB\.userData\.spiral='alon'/);
  expect(source).toContain("halves={turquoise:'noa',amber:'alon'}");
  expect(source).toMatch(/turquoise \(Noa\)/);expect(source).toMatch(/amber[^\n]*\(Alon\)/);
  expect(source).not.toMatch(/turquoise[^\n]{0,12}\(Alon\)|amber[^\n]{0,12}\(Noa\)/);
  expect(source).not.toMatch(/spiral='alon'[^\n]*turq|turq\);bandA\.userData\.spiral='alon'/);
});

const plinthHex=(px:number,pz:number)=>gridHexDistance(px,pz)<=apothem(MONUMENT.plinth.radius)+1e-6;
it('sits centred and grid-aligned on its hex ground pad, like the neighbouring plots',()=>{
  const{plinth,body,shaft,stair}=MONUMENT,R=MONUMENT_GROUND_PAD.radius;
  // the plot grid: hex() is pointy-top, so the neighbour centres lie at 0, 60, 120... degrees from +x and every plot hex
  // (district tile, bespoke pad CylinderGeometry thetaStart 0, leveled terrain padDistance) has its vertices on ±z
  const [x0,z0]=hex(-4,6,10),[xs,zs]=hex(-5,6,10),[xt,zt]=hex(-3,6,10);
  expect([x0-xs,z0-zs]).toEqual([expect.closeTo(10*Math.sqrt(3),9),0]);expect([xt-x0,zt-z0]).toEqual([expect.closeTo(10*Math.sqrt(3),9),0]);
  expect(world).toContain('const padDistance=(x:number,z:number)=>Math.max(Math.abs(x),Math.abs(.5*x+.8660254*z),Math.abs(.5*x-.8660254*z));');
  for(const [px,pz] of [[0,1],[Math.sqrt(3)/2,.5],[Math.sqrt(3)/2,-.5]])expect(gridHexDistance(px*9.94,pz*9.94)).toBeCloseTo(apothem(9.94),4);
  // the plinth's six corners point the same way as the plot's (±z, ±60°) and sit at its radius: centred, not rotated
  for(let k=0;k<6;k++){const[cx,cz]=plinthCorner(plinth.radius,k),a=Math.atan2(cz,cx);
    expect(Math.hypot(cx,cz)).toBeCloseTo(plinth.radius,9);
    expect(Math.abs(Math.sin(3*(a-Math.PI/2)))).toBeLessThan(1e-9);
    expect(gridHexDistance(cx,cz)).toBeCloseTo(apothem(plinth.radius),6);}
  expect(plinthCorner(plinth.radius,1)[0]).toBeCloseTo(0,9);expect(plinthCorner(plinth.radius,1)[1]).toBeCloseTo(plinth.radius,9);
  // so the margin to the pad edge is the same all round: 1.34 at every corner, 1.16 on every face
  expect(R-plinth.radius).toBeCloseTo(1.34,9);expect(apothem(R)-apothem(plinth.radius)).toBeCloseTo(1.1605,3);
  // the plinth wall uses CylinderGeometry thetaStart 0 (first vertex on +z), the same as the neighbours' pads
  expect(source).toContain('new THREE.CylinderGeometry(plinth.radius,plinth.radius,H0+skirt,6,1,true,0)');
  expect(source).toContain('hexShape(plinth.radius,0,plinthCorner)');expect(source).toContain('hexShape(plinth.radius-.01,0,plinthCorner)');
  // only the plinth and its pad turned: the tower, lift and stair keep their places and the tower keeps a vertex on +x
  expect(stairWallClearance()).toBeCloseTo(.19,2);expect(stairWallClearance()).toBeGreaterThan(0);
  // and the plinth still contains the tower foot, the lift sleeve and the stair, with margin
  const margin=(pts:[number,number][])=>Math.min(...pts.map(([px,pz])=>apothem(plinth.radius)-gridHexDistance(px,pz)));
  const bodyPts=Array.from({length:6},(_,k)=>[body.x+body.radius*Math.cos(k*Math.PI/3),body.radius*Math.sin(k*Math.PI/3)] as [number,number]);
  const circle=(cx:number,r:number)=>Array.from({length:360},(_,i)=>[cx+r*Math.cos(i*Math.PI/180),r*Math.sin(i*Math.PI/180)] as [number,number]);
  expect(margin(bodyPts)).toBeGreaterThan(.04);expect(margin(bodyPts)).toBeCloseTo(.0478,3);
  expect(margin(circle(shaft.x,shaft.radius))).toBeGreaterThan(2.3);
  expect(margin(circle(shaft.x,stair.outer))).toBeGreaterThan(1);
  expect(bodyPts.every(([px,pz])=>plinthHex(px,pz))).toBe(true);
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
  expect(MONUMENT_LIFT_CAB.axisWorld).toEqual({x:-13.7205,z:90});
});
it('documents the underground floor as an absolute world height, only the stations are local',()=>{
  expect(MONUMENT_LIFT.undergroundFloor).toBe(-8.4);
  expect((MONUMENT_LIFT_CAB as unknown as Record<string,unknown>).undergroundFloorFrame).toBe('absolute world y');
  expect(source).toContain('ABSOLUTE world y (NOT podiumY-8.4)');
  expect(source).not.toMatch(/-8\.4 is local|floor -8\.4 is local|local in the same frame/);
  expect(source).toContain('view from the cab');
  expect(source).not.toMatch(/\/\/[^\n]*[Oo]bservation cupola/);
});
