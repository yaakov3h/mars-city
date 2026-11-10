import {it,expect} from 'vitest';
import {buildable} from '../scripts/layout.mjs';
import {hex,random} from '../src/model';
import {OCT15_SHAFTS,pilotOpening,cutApertures} from '../src/underground';
import * as THREE from 'three';
import state from '../data/city-state.json';
import prior from './fixtures/revision37.json';
it('adds exactly one provisional topic and preserves prior entities',()=>{for(const b of prior.buildings)expect(state.buildings.find(n=>n.id===b.id)).toEqual(b);for(const k of ['landmarks','creatures'] as const)k==='landmarks'?expect(state.landmarks.slice(0,prior.landmarks.length)).toEqual(prior.landmarks):expect(state[k]).toEqual(prior[k]);expect(state.mosaic?.hexes).toEqual(prior.mosaic?.hexes);expect(state.mosaic?.segmentCapacity).toBe(prior.mosaic?.segmentCapacity);expect(state.mosaic?.tiles).toBeGreaterThanOrEqual(prior.mosaic?.tiles??0);expect(state.buildings.length-prior.buildings.length).toBe(30);expect(state.totalQuestions-prior.totalQuestions).toBe(8)});
it('reserves a full hex outside craters and every permanent rock',()=>{const b=state.buildings.find(b=>b.id==='b-premiere-cinema-20261015')!;expect(b.complexity).toBe(3);expect(buildable(b.plot!.q,b.plot!.r)).toBe(true);const[x,z]=hex(b.plot!.q,b.plot!.r,10);for(let i=0;i<360;i++)expect(Math.hypot(x-(random('rx'+i)-.5)*230,z-(random('rz'+i)-.5)*230)).toBeGreaterThan(10+.16+random('rs'+i)*1.35)});

it('opens the dedicated cinema lift through the surface',()=>{for(const r of OCT15_SHAFTS){const x=(r.x0+r.x1)/2,z=(r.z0+r.z1)/2;expect(pilotOpening(x,z)).toBe(true);const g=new THREE.PlaneGeometry(4,4);g.rotateX(-Math.PI/2);cutApertures(g,true,x,z);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));m.position.set(x,0,z);m.updateMatrixWorld();expect(new THREE.Raycaster(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0)).intersectObject(m)).toHaveLength(0)}});
