import {it,expect} from 'vitest';
import {buildable} from '../scripts/layout.mjs';
import {hex,random,validateState,validateEvent,districtPlots,events} from '../src/model';
import {pilotOpening} from '../src/underground';
import state from '../data/city-state.json';
import prior from './fixtures/revision48.json';
import source from '../src/world.ts?raw';
const ID='b-backup-vault-20261026';
const vault=source.slice(source.indexOf('// Backup Vault (ארכיון הגיבויים)'));
it('preserves every previous entity and adds only the Backup Vault',()=>{
  for(const b of prior.buildings)expect(state.buildings.find(n=>n.id===b.id)).toEqual(b);
  for(const k of ['landmarks','mosaic','creatures','installations']as const)expect(state[k]).toEqual(prior[k]);
  for(const d of prior.districts){const n=state.districts.find(n=>n.id===d.id)!;if(d.id==='district-genesis-20260930'){expect(n.plots!.slice(0,d.plots!.length)).toEqual(d.plots);expect(n.plots!.slice(d.plots!.length).map(p=>[p.q,p.r])).toEqual([[-3,6]]);}else expect(n).toEqual(d);}
  expect(state.buildings.length-prior.buildings.length).toBe(1);
  expect(state.buildings.at(-1)!.id).toBe(ID);
  expect(state.totalQuestions).toBe(prior.totalQuestions);
  expect(state.revision-prior.revision).toBe(1);
  expect(validateState(state)).toEqual([]);
});
it('sits on the claimed free plot q=-3 r=6 with a base height like the neighbouring houses',()=>{
  const b=state.buildings.find(b=>b.id===ID)!;
  expect(b.plot).toEqual({q:-3,r:6});expect(b.districtId).toBe('district-genesis-20260930');
  expect(b.complexity).toBe(3);expect(b.height).toBe(8);expect(b.questionCount).toBe(0);
  expect(buildable(-3,6)).toBe(true);
  const taken=[...prior.districts.flatMap(d=>districtPlots(d)),...prior.landmarks,...(prior.installations??[]).flatMap(i=>i.plots),...(prior.mosaic?.hexes??[])].map(p=>p.q+','+p.r);
  expect(taken).not.toContain('-3,6');
  const [x,z]=hex(-3,6,10);
  for(let i=0;i<360;i++)expect(Math.hypot(x-(random('rx'+i)-.5)*230,z-(random('rz'+i)-.5)*230)).toBeGreaterThan(10+.16+random('rs'+i)*1.35);
  // same storey band as the Explainer Studio next door (8.2) and the 7.5-8 houses
  const neighbours=state.buildings.filter(n=>['b-explainer-studio-20261024','b-civic-assembly-20261019','b-sounds-house-20261017'].includes(n.id)).map(n=>n.height);
  for(const h of neighbours)expect(Math.abs(h-b.height)).toBeLessThanOrEqual(.5);
});
it('logs one abstract expansion event',()=>{
  const mine=events.filter(e=>e.id==='backup-vault-20261026');
  expect(mine).toHaveLength(1);expect(mine[0].kind).toBe('expansion');expect(validateEvent(mine[0])).toEqual([]);
  expect(JSON.stringify(mine[0])).not.toMatch(/יעקב|נועה|אלון|קופת|וואטסאפ|OneDrive|Drive/);
});
it('models a copper vault with a round door, archive drums, an archive annex, a roof lock and a fixed name plate',()=>{
  expect(vault).toContain('export function backupVault');
  expect(vault).toContain('The round vault door');
  expect(vault).toMatch(/for\(let k=0;k<6;k\+\+\)\{const a=k\*Math\.PI\/3,b=/);
  expect(vault).toContain('Archive drums: six horizontal data drums');
  expect(vault).toContain('newest version stays in front');
  expect(vault).toContain('The lock emblem on the roof');
  expect(vault).toContain('physical bronze-framed plate fixed to the portal');
  expect(vault).toContain('ארכיון הגיבויים');
  expect(vault).not.toMatch(/fillText|CanvasTexture/);
  expect(source).toContain("if(b.id===BACKUP_VAULT_ID){backupVault(part,group,this);return group;}");
});
it('keeps plants only under the shared glass sleeve and carries Alon\'s amber signature at the entrance and the roof',()=>{
  expect(vault).toContain('only plants on the plot live under its shared glazing');
  expect(vault).toContain('Entrance strip in amber');
  expect(vault).toContain("amber point on top is Alon's roof signature");
});
it('leaves the ground sealed: the reserved shaft point is a hatch, not an opening, until a room is built below',()=>{
  const [x,z]=hex(-3,6,10);
  expect(vault).not.toMatch(/cutRoofWindows|ANNEX|review-underground/);
  expect(vault).toContain('BACKUP_VAULT_SHAFT_POINT=Object.freeze({x:-5,z:-3.2})');
  expect(pilotOpening(x,z)).toBe(false);
  expect(pilotOpening(x-5,z-3.2)).toBe(false);
});
