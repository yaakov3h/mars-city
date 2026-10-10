import {describe,it,expect} from 'vitest';
import specs from '../src/sign-specs.json';
import outlines from '../src/sign-outlines.json';
import gallery from '../src/personal-gallery.ts?raw';
import world from '../src/world.ts?raw';
describe('wall signs and personal gallery',()=>{
 it('covers all 23 buildings and both monuments once',()=>{expect(specs.length).toBe(25);expect(new Set(specs.map(s=>s.id)).size).toBe(25);expect(specs.filter(s=>s.id.startsWith('b-')).length).toBe(23);expect(specs.filter(s=>s.id.startsWith('l-')).length).toBe(2)});
 it('has one extrudable outline for every sign',()=>{expect(outlines.length).toBe(specs.length);for(const o of outlines){expect(o.width).toBeGreaterThan(0);expect(o.height).toBeGreaterThan(0);expect(o.svg).toContain('<svg')}});
 it('has nine palettes and positive plaque bounds',()=>{expect(new Set(specs.map(s=>s.family)).size).toBe(9);for(const s of specs){expect(s.width).toBeGreaterThan(.2);expect(s.height).toBeGreaterThan(.1);for(const k of ['x','y','z','yaw','tilt'] as const)expect(Number.isFinite(s[k])).toBe(true)}});
 it('keeps originals in five wall frames and preserves aspect ratios',()=>{for(const f of ['cat-suitcase.jpg','couple-palms.jpg','family-overhead.jpg','cat-window.jpg','cat-aircon.jpg'])expect(gallery).toContain(f);expect(gallery).toContain('1427/805');expect(gallery).toContain('1238/928');expect(gallery).toContain('MeshBasicMaterial')});
 it('does not export debug scene handles',()=>{for(const key of ['__w=','__mc=','__rw='])expect(world).not.toContain(key)});
});
