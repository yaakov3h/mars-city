import {it,expect} from 'vitest';
import {buildable} from '../scripts/layout.mjs';
import {hex,random,validateState,validateEvent,districtPlots,events} from '../src/model';
import state from '../data/city-state.json';
import prior from './fixtures/revision45.json';
import aircraft from '../public/aircraft/israel-latest.json';
import source from '../src/israel-map.ts?raw';
import {PLOTS,ISRAEL_MAP_ID} from '../src/israel-map';

it('preserves all previous entities and adds the installation with no new questions',()=>{
  for(const b of prior.buildings)expect(state.buildings.find(n=>n.id===b.id)).toEqual(b);
  for(const d of prior.districts){const n=state.districts.find(n=>n.id===d.id)!;if(d.id==='district-genesis-20260930')expect(n.plots!.slice(0,d.plots!.length)).toEqual(d.plots);else expect(n).toEqual(d);}
  for(const k of ['landmarks','mosaic','creatures']as const)expect(state[k]).toEqual(prior[k]);
  expect(state.buildings.length-prior.buildings.length).toBe(1);
  expect(state.totalQuestions-prior.totalQuestions).toBe(0);
  expect(state.revision-prior.revision).toBe(2);
  expect(validateState(state)).toEqual([]);
});
it('reserves five free plots beyond all craters and rocks, hugging the city edge',()=>{
  const inst=state.installations!.find(i=>i.id===ISRAEL_MAP_ID)!;
  expect(inst.plots.map(p=>[p.q,p.r])).toEqual(PLOTS);
  const occupied=new Set([...state.districts.flatMap(d=>districtPlots(d)).map(p=>p.q+','+p.r),...state.landmarks.map(l=>l.q+','+l.r),...(state.mosaic?.hexes??[]).map(h=>h.q+','+h.r)]);
  for(const [q,r] of PLOTS){
    expect(occupied.has(q+','+r)).toBe(false);
    expect(buildable(q,r)).toBe(true);
    const [x,z]=hex(q,r,10);
    for(let i=0;i<360;i++)expect(Math.hypot(x-(random('rx'+i)-.5)*230,z-(random('rz'+i)-.5)*230)).toBeGreaterThan(10+.16+random('rs'+i)*1.35);
  }
});
it('logs exactly one abstract expansion event and keeps question history intact',()=>{
  const mine=events.filter(e=>e.id===ISRAEL_MAP_ID);
  expect(mine).toHaveLength(1);
  expect(mine[0].kind).toBe('expansion');
  expect(validateEvent(mine[0])).toEqual([]);
  expect(events.filter(e=>e.kind==='question')).toHaveLength(40);
  expect(JSON.stringify(mine[0])).not.toMatch(/יעקב|נועה|וואטסאפ/);
});
it('publishes a fresh credited aircraft snapshot covering Israel',()=>{
  expect(Number.isFinite(Date.parse(aircraft.fetchedAt))).toBe(true);
  expect(aircraft.license).toBe('ODbL');
  expect(aircraft.source).toBe('adsb.lol');
  expect(aircraft.ac.length).toBeGreaterThan(0);
  for(const a of aircraft.ac){expect(a.lat).toBeGreaterThan(28);expect(a.lat).toBeLessThan(34.5);expect(a.lon).toBeGreaterThan(33);expect(a.lon).toBeLessThan(37)}
});
it('renders the credited Hebrew panel without demo leftovers',()=>{
  expect(source).toContain('adsb.lol (ODbL)');
  expect(source).toContain('שמי ישראל');
  expect(source).toContain('עודכן');
  expect(source).not.toContain('ISOLATED DEMO ONLY');
  expect(source).not.toContain('הדגמה בלבד');
});
