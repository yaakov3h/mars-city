import {it,expect} from 'vitest';
import {buildable} from '../scripts/layout.mjs';
import {hex,random,validateState,validateEvent,districtPlots,events} from '../src/model';
import {pilotOpening} from '../src/underground';
import {EXPLAINER_SHAFT_POINT} from '../src/oct24-explainer';
import state from '../data/city-state.json';
import prior from './fixtures/revision46.json';
import source from '../src/oct24-explainer.ts?raw';
const ID='b-explainer-studio-20261024';
it('preserves every previous entity and adds only the Explainer Studio',()=>{
  for(const b of prior.buildings)expect(state.buildings.find(n=>n.id===b.id)).toEqual(b);
  for(const k of ['landmarks','mosaic','creatures','installations']as const)k==='landmarks'?expect(state.landmarks.slice(0,prior.landmarks.length)).toEqual(prior.landmarks):expect(state[k]).toEqual(prior[k]);
  for(const d of prior.districts){const n=state.districts.find(n=>n.id===d.id)!;if(d.id==='district-genesis-20260930'){expect(n.plots!.slice(0,d.plots!.length)).toEqual(d.plots);expect(n.plots!.slice(d.plots!.length,d.plots!.length+1).map(p=>[p.q,p.r])).toEqual([[-5,6]]);}else expect(n).toEqual(d);}
  expect(state.buildings.length-prior.buildings.length).toBe(2);
  expect(state.totalQuestions).toBe(prior.totalQuestions);
  expect(state.revision-prior.revision).toBe(3);
  expect(validateState(state)).toEqual([]);
});
it('sits on the locked tech plot q=-5 r=6 with the guide height and width',()=>{
  const b=state.buildings.find(b=>b.id===ID)!;
  expect(b.plot).toEqual({q:-5,r:6});expect(b.districtId).toBe('district-genesis-20260930');
  expect(b.complexity).toBe(3);expect(b.height).toBe(8.2);expect(b.width).toBe(1.8);
  expect(buildable(-5,6)).toBe(true);
  const taken=[...prior.districts.flatMap(d=>districtPlots(d)),...prior.landmarks,...(prior.installations??[]).flatMap(i=>i.plots)].map(p=>p.q+','+p.r);
  expect(taken).not.toContain('-5,6');
  const [x,z]=hex(-5,6,10);
  for(let i=0;i<360;i++)expect(Math.hypot(x-(random('rx'+i)-.5)*230,z-(random('rz'+i)-.5)*230)).toBeGreaterThan(10+.16+random('rs'+i)*1.35);
});
it('logs one abstract expansion event',()=>{
  const mine=events.filter(e=>e.id==='explainer-studio-20261024');
  expect(mine).toHaveLength(1);expect(mine[0].kind).toBe('expansion');expect(validateEvent(mine[0])).toEqual([]);
  expect(JSON.stringify(mine[0])).not.toMatch(/יעקב|נועה|VLOOKUP|וואטסאפ/);
});
it('models three sequenced blank panels, an open stair, a small roof dome and a fixed name plate',()=>{
  expect(source.match(/stepPanel=i\+1/g)).toHaveLength(1);
  expect(source).toContain('for(let i=0;i<3;i++)');
  expect(source).toContain('open exterior stair');
  expect(source).toContain('small glass dome inside the roof footprint');
  expect(source).toContain('physical bronze-framed plate fixed to the façade');
  expect(source).toContain('סטודיו ההסבר');
  expect(source).not.toMatch(/fillText|CanvasTexture/);
});
it('connects the reserved shaft point to the archive room below (Noa piece, built after this file)',()=>{
  // Noa: the surface now opens at the reserved point - pad cut, ground aperture registered.
  // The underground room itself lives in review-underground.ts (ANNEX), never in this surface file.
  expect(source).toContain('cutRoofWindows');
  expect(source).not.toMatch(/ANNEX|review-underground|SEGS2/);
  const [x,z]=hex(-5,6,10);
  expect(pilotOpening(x+EXPLAINER_SHAFT_POINT.x,z+EXPLAINER_SHAFT_POINT.z)).toBe(true);
});
