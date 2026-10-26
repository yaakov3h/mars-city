import {it,expect} from 'vitest';
import {buildable} from '../scripts/layout.mjs';
import {hex,random,validateEvent,districtPlots,events} from '../src/model';
import {pilotOpening} from '../src/underground';
import {ANNEX} from '../src/review-underground';
import state from '../data/city-state.json';
import prior from './fixtures/revision48.json';
import source from '../src/world.ts?raw';
import {CAT_HOUSE,CAT_TOWER_APEX} from '../src/world';
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
it('keeps the standard base plinth height and stands as a giant tower (Yaakov, approval of PR 27)',()=>{
  const b=state.buildings.find(b=>b.id===ID)!;
  expect(b.name.en).toBe('Cat Scratching Tower');
  // the same pad and plinth as the vault and the other houses: base height stays standard
  expect(cat).toContain("CAT_HOUSE=Object.freeze({pad:{radius:6.5,top:.35},plinth:{radius:3.6,height:.6}");
  expect(source).toMatch(/BACKUP_VAULT=Object\.freeze\(\{pad:\{radius:[\d.]+,top:\.35\}/);
  // tall: the top deck sits far above the plinth and the data height matches the real apex (ear tips)
  expect(CAT_HOUSE.tower.deck).toBeGreaterThan(10);
  expect(CAT_TOWER_APEX).toBeCloseTo(15.92,2);
  expect(Math.abs(b.height-CAT_TOWER_APEX)).toBeLessThan(.5);
  // still lower than the tallest spire of the colony
  expect(b.height).toBeLessThan(Math.max(...state.buildings.map(n=>n.height)));
  // the house on top fits the top deck (hex, inscribed radius 2.75*cos30) inside its own hex footprint
  const S=CAT_HOUSE.tower.scale,half=(CAT_HOUSE.walls.width+.6)/2*S;
  expect(half).toBeLessThan(2.75*Math.cos(Math.PI/6));
  expect(CAT_HOUSE.tower.base).toBeLessThan(CAT_HOUSE.pad.radius);
});
it('logs one abstract expansion event that only describes the house',()=>{
  const mine=events.filter(e=>e.id==='cat-house-20261026');
  expect(mine).toHaveLength(1);expect(mine[0].kind).toBe('expansion');expect(validateEvent(mine[0])).toEqual([]);
  expect(JSON.stringify(mine[0])).not.toMatch(/יעקב|נועה|אלון|משחק|game|level|שלב|Cat Town|עיר החתולים|http/i);
});
it('is a giant scratching tower: sisal-rope posts, staggered carpeted perches, a ladder, dangling toys, and the cat house on top',()=>{
  expect(cat).toContain('GIANT CAT SCRATCHING TOWER');
  expect(cat).toContain('class SisalWrap extends THREE.Curve');
  expect(cat).toContain('new THREE.TubeGeometry(new SisalWrap(');
  expect(cat).toContain('darker rope bands');
  expect(cat).toContain('sisalPost(0,0,tower.post,B0,DECK-.3)');
  expect(cat).toMatch(/const PA=\{x:[^}]+\},PB=\{x:[^}]+\},PC=\{x:[^}]+\}/);
  expect(cat).toContain('for(const p of [PA,PB,PC]){sisalPost(p.x,p.z,.3,B0,p.y-.22);perch(p.x,p.y,p.z,p.r);}');
  expect(cat).toContain('A little ladder from the ground up to the first perch');
  expect(cat).toContain('Two toy balls dangling on strings');
  expect(cat).toContain('The top deck: a big carpeted hex platform');
  expect(cat).toContain('The cat house at the top of the tower');
  expect(cat).toContain('return part(geo,m,x*S,DECK+y*S,z*S)');
});
it('keeps the cozy cat house details: cat-ear roof, round cat door, warm window, a cat asleep on the ridge, paw prints and a fixed name plate',()=>{
  expect(cat).toContain('export function catHouse');
  expect(cat).toContain('The two cat ears');
  expect(cat).toContain('The round cat door');
  expect(cat).toContain('One small window with warm light');
  expect(cat).toContain('A cat asleep on the ridge');
  expect(cat).toContain('Paw prints on the path');
  expect(cat).toMatch(/for\(let i=0;i<6;i\+\+\)\{const k=i\/5/);
  expect(cat).toContain('physical bronze-framed plate strapped to the main post');
  expect(cat).toContain("t.text='בית החתולים'");
  expect(cat).not.toMatch(/fillText|CanvasTexture|https?:|level|score|cat-town/i);
  expect(source).toContain('if(b.id===CAT_HOUSE_ID){catHouse(part,group,this);return group;}');
});
it('has no exposed greenery, carries Alon\'s amber signature and stays above ground',()=>{
  expect(cat).not.toMatch(/leaf|grass|plant|#5f8f4e/i);
  expect(cat).toContain('Entrance strip in amber');
  expect(cat).toContain("amber point on the ridge end is Alon's roof signature");
  expect(cat).not.toMatch(/geodesicDome/);
  expect(cat).not.toMatch(/cutRoofWindows|cutApertures|ANNEX|SHAFT/);
});
