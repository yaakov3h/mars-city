import {it,expect} from 'vitest';
import {buildable} from '../scripts/layout.mjs';
import {hex,random,validateState,validateEvent,districtPlots,events} from '../src/model';
import {pilotOpening} from '../src/underground';
import state from '../data/city-state.json';
import prior from './fixtures/revision48.json';
import source from '../src/world.ts?raw';
const ID='b-backup-vault-20261026';
const vault=source.slice(source.indexOf('// Backup Vault (ארכיון הגיבויים)'),source.indexOf('// Geodesic glass dome'));
it('preserves every previous entity and adds only the Backup Vault and the Cat House',()=>{
  for(const b of prior.buildings)expect(state.buildings.find(n=>n.id===b.id)).toEqual(b);
  expect(state.landmarks.slice(0,prior.landmarks.length)).toEqual(prior.landmarks);expect(state.landmarks.slice(prior.landmarks.length).map(l=>l.id)).toEqual(['l-birthday-monolith-20261106']);for(const k of ['creatures','installations']as const)expect(state[k]).toEqual(prior[k]);
  for(const d of prior.districts){const n=state.districts.find(n=>n.id===d.id)!;if(d.id==='district-genesis-20260930'){expect(n.plots!.slice(0,d.plots!.length)).toEqual(d.plots);expect(n.plots!.slice(d.plots!.length).map(p=>[p.q,p.r])).toEqual([[-1,7],[-5,5],[-6,7],[-5,7],[0,-4],[1,-4],[2,-4],[3,-4],[2,-3]]);}else if(d.id==='district-codesign-20260930'){expect(n.plots!.slice(0,d.plots!.length)).toEqual(d.plots);expect(n.plots!.slice(d.plots!.length).map(p=>[p.q,p.r])).toEqual([[-5,-2]]);}else if(d.id==='district-academic-recognition-20261001'){expect(n.plots!.slice(0,d.plots!.length)).toEqual(d.plots);expect(n.plots!.slice(d.plots!.length).map(p=>[p.q,p.r])).toEqual([[0,-7]]);}else expect(n).toEqual(d);}
  expect(state.buildings.length-prior.buildings.length).toBe(22);
  expect(state.buildings.slice(-21,-18).map(b=>b.id)).toEqual([ID,'b-cat-house-20261026','b-dream-archive-20261027']);
  expect(state.totalQuestions).toBe(prior.totalQuestions);
  expect(state.revision-prior.revision).toBe(15);
  expect(validateState(state)).toEqual([]);
});
