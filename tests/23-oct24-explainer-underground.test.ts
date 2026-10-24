import {it,expect} from 'vitest';import * as THREE from 'three';
import {ANNEX,reviewWalkable,reviewFloorAt} from '../src/review-underground';
import {OCT24_SHAFTS,pilotOpening,cutApertures} from '../src/underground';
import {hex} from '../src/model';
import roomSource from '../src/oct24-explainer.ts?raw';

it('registers the explainer archive room directly below the studio hex',()=>{
  const room=ANNEX[44];
  expect(room.theme).toBe('explainer');
  expect(room.name).toBe('סטודיו ההסבר · ארכיון הצעדים');
  const [x,z]=hex(-5,6,10);
  expect(room.x).toBeCloseTo(x,6);expect(room.z).toBeCloseTo(z,6);
  expect(room.fy).toBe(-8.4);
  expect(room.doors).toContain(300); // passage toward the professions analysis room
  expect(room.doors).toContain(180); // lift alcove under Alon's reserved shaft point
  expect(ANNEX[27].doors).toContain(120); // the professions room answers back
});
it('connects the archive to the professions room through a flat walkable passage',()=>{
  for(const[a,b]of[[44,27]])for(let i=0;i<=100;i++){const t=i/100,x=ANNEX[a].x*(1-t)+ANNEX[b].x*t,z=ANNEX[a].z*(1-t)+ANNEX[b].z*t;
    expect(reviewWalkable(x,z)).toBe(true);expect(reviewFloorAt(x,z)).toBeCloseTo(-8.4,5);}
});
it('opens the ground exactly under the reserved shaft point Alon sealed',()=>{
  expect(OCT24_SHAFTS).toHaveLength(1);
  const r=OCT24_SHAFTS[0],x=(r.x0+r.x1)/2,z=(r.z0+r.z1)/2;
  const [bx,bz]=hex(-5,6,10);
  expect(x).toBeCloseTo(bx-5.7,6);expect(z).toBeCloseTo(bz-1.2,6);
  expect(pilotOpening(x,z)).toBe(true);
  const g=new THREE.PlaneGeometry(4,4);g.rotateX(-Math.PI/2);cutApertures(g,true,x,z);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));m.position.set(x,0,z);m.updateMatrixWorld();
  expect(new THREE.Raycaster(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0)).intersectObject(m)).toHaveLength(0);
});
it('keeps the archive abstract: no names, no private content, no floating text',()=>{
  expect(roomSource).not.toMatch(/יעקב|נועה|אלון|VLOOKUP|וואטסאפ/);
  expect(ANNEX[44].name).not.toMatch(/יעקב|נועה|אלון|VLOOKUP|וואטסאפ/);
  expect(roomSource).toContain('ארכיון הצעדים');expect(roomSource).not.toMatch(/fillText|CanvasTexture/);
});
