import {it,expect} from 'vitest';
import {buildable} from '../scripts/layout.mjs';
import {hex,random,validateEvent,districtPlots,events} from '../src/model';
import {pilotOpening} from '../src/underground';
import {ANNEX} from '../src/review-underground';
import state from '../data/city-state.json';
import prior from './fixtures/revision48.json';
import source from '../src/world.ts?raw';
const ID='b-cat-house-20261026';
const cat=source.slice(source.indexOf('// Cat House (בית החתולים)'));
it('stands on its own free hex q=-5 r=-2 (office claim #452), separate from the Backup Vault',()=>{
  const b=state.buildings.find(b=>b.id===ID)!;
  expect(b.plot).toEqual({q:-5,r:-2});expect(b.districtId).toBe('district-codesign-20260930');
  expect(b.name.he).toBe('בית החתולים');expect(b.questionCount).toBe(0);expect(b.complexity).toBe(2);
  const vault=state.buildings.find(b=>b.id==='b-backup-vault-20261026')!;
  expect(vault.plot).not.toEqual(b.plot);
  expect(buildable(-5,-2)).toBe(true);
  const taken=[...prior.districts.flatMap(d=>[{q:d.q,r:d.r},...districtPlots(d)]),...prior.landmarks,...(prior.installations??[]).flatMap(i=>i.plots),...(prior.mosaic?.hexes??[]),...prior.buildings.filter(n=>n.plot).map(n=>n.plot!)].map(p=>p.q+','+p.r);
  expect(taken).not.toContain('-5,-2');
  const [x,z]=hex(-5,-2,10);
  for(let i=0;i<360;i++)expect(Math.hypot(x-(random('rx'+i)-.5)*230,z-(random('rz'+i)-.5)*230)).toBeGreaterThan(10+.16+random('rs'+i)*1.35);
  // no underground room or lift opening under the plot: surface only
  for(const a of ANNEX)expect(Math.hypot(a.x-x,a.z-z)).toBeGreaterThan(14);
  for(let dx=-6.5;dx<=6.5;dx+=.5)for(let dz=-6.5;dz<=6.5;dz+=.5)if(Math.hypot(dx,dz)<=6.5)expect(pilotOpening(x+dx,z+dz)).toBe(false);
  // inside the ground plane
  expect(Math.abs(x)+6.7).toBeLessThan(130);expect(Math.abs(z)+6.7).toBeLessThan(130);
});
it('keeps a base and height in the band of the existing houses',()=>{
  const b=state.buildings.find(b=>b.id===ID)!;expect(b.height).toBe(7.5);
  for(const h of state.buildings.filter(n=>['b-explainer-studio-20261024','b-civic-assembly-20261019','b-sounds-house-20261017','b-backup-vault-20261026'].includes(n.id)).map(n=>n.height))expect(Math.abs(h-b.height)).toBeLessThanOrEqual(.75);
  expect(cat).toContain("CAT_HOUSE=Object.freeze({pad:{radius:6.5,top:.35},plinth:{radius:3.6,height:.6}");
  expect(cat).toContain('ears:{top:7.5}');
});
it('logs one abstract expansion event that only describes the house',()=>{
  const mine=events.filter(e=>e.id==='cat-house-20261026');
  expect(mine).toHaveLength(1);expect(mine[0].kind).toBe('expansion');expect(validateEvent(mine[0])).toEqual([]);
  expect(JSON.stringify(mine[0])).not.toMatch(/יעקב|נועה|אלון|משחק|game|level|שלב|Cat Town|עיר החתולים|http/i);
});
it('models a cozy cat house: cat-ear roof, round cat door, warm window, a cat asleep on the ridge, paw prints and a fixed name plate',()=>{
  expect(cat).toContain('export function catHouse');
  expect(cat).toContain('The two cat ears');
  expect(cat).toContain('The round cat door');
  expect(cat).toContain('One small window with warm light');
  expect(cat).toContain('A cat asleep on the ridge');
  expect(cat).toContain('paw prints on the path');
  expect(cat).toMatch(/for\(let i=0;i<6;i\+\+\)\{const z=/);
  expect(cat).toContain('physical bronze-framed plate fixed to the wall');
  expect(cat).toContain("t.text='בית החתולים'");
  expect(cat).not.toMatch(/fillText|CanvasTexture|https?:|level|score|cat-town/i);
  expect(source).toContain('if(b.id===CAT_HOUSE_ID){catHouse(part,group,this);return group;}');
});
it('has no exposed greenery, carries Alon\'s amber signature and stays above ground',()=>{
  expect(cat).not.toMatch(/leaf|grass|plant|#5f8f4e/i);
  expect(cat).toContain('Entrance strip in amber');
  expect(cat).toContain("amber point on the ridge end is Alon's roof signature");
  expect(cat).not.toMatch(/cutRoofWindows|cutApertures|ANNEX|SHAFT/);
});
