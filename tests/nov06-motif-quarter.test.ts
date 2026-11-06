import {it,expect} from 'vitest';
import state from '../data/city-state.json';
import {validateState,hex,districtPlots,random} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
import {MOTIF_QUARTER,PILOT_GALLERY} from '../src/nov06-motif-quarter';
import source from '../src/nov06-motif-quarter.ts?raw';
import world from '../src/world.ts?raw';
import main from '../src/main.ts?raw';
it('registers nine motif houses with five floors each on free rock-free plots',()=>{
 expect(MOTIF_QUARTER).toHaveLength(9);
 expect(MOTIF_QUARTER.flatMap(m=>m.floors)).toHaveLength(45);
 expect(validateState(state as any)).toEqual([]);
 const mine=new Set(MOTIF_QUARTER.map(m=>m.id));
 for(const m of MOTIF_QUARTER){
  const b=state.buildings.find(b=>b.id===m.id)!;expect(b.plot).toEqual(m.plot);expect(buildable(m.plot.q,m.plot.r)).toBe(true);
  const [x,z]=hex(m.plot.q,m.plot.r,10);
  for(let i=0;i<360;i++)expect(Math.hypot(x-(random('rx'+i)-.5)*230,z-(random('rz'+i)-.5)*230)).toBeGreaterThan(10+.16+random('rs'+i)*1.35);
 }
 expect(state.buildings.filter(b=>mine.has(b.id))).toHaveLength(9);
 expect(state.districts.find(d=>d.id==='district-motif-quarter-20261106')!.plots).toHaveLength(9);
 const reserved=[[-3,6],[0,2],[0,-5],[0,-4]];
 for(const [q,r] of reserved)expect(MOTIF_QUARTER.some(m=>m.plot.q===q&&m.plot.r===r)).toBe(false);
});
it('keeps every migrated motif name and house name on a floor sign',()=>{
 for(const m of MOTIF_QUARTER){expect(source).toContain(m.he);for(const f of m.floors)expect(source).toContain(f.he);}
});
it('preserves the pilot identities and the personal gallery contents above ground',()=>{
 for(const t of ['TRANSIT / ROAD RESERVE','CAFE / ATELIER','ATELIER 01','כיכר הכניסה'])expect(source).toContain(t);
 expect(PILOT_GALLERY.map(p=>p.file)).toEqual(['cat-suitcase.jpg','couple-palms.jpg','family-overhead.jpg','cat-window.jpg','cat-aircon.jpg']);
 for(const p of PILOT_GALLERY)expect(source).toContain(p.file);
 expect(source).toContain('personalGallery');
});
it('keeps the surface mosaic tiles and permanent daylight',()=>{
 expect(state.mosaic?.tiles).toBeGreaterThanOrEqual(4);
 expect(main).not.toContain('sol-slider');
 expect(world).not.toContain('ReviewUnderground');
 expect(world).not.toContain('MosaicChamber');
});
