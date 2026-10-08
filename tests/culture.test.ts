import {it,expect} from 'vitest';
import {gallery,orbitalSpace} from '../src/culture';
it('uses local NASA assets with image-level credits',()=>{expect(gallery).toHaveLength(2);expect(gallery[0].credit).toBe('NASA/JPL-Caltech/ASU/MSSS');expect(gallery[1].credit).toBe('NASA/JPL-Caltech');expect(gallery.every(i=>i.file.endsWith('.webp'))).toBe(true)});
it('identifies the public licensed orbital experiment',()=>{expect(orbitalSpace.license).toBe('MIT');expect(orbitalSpace.embed).toMatch(/^https:/);expect(orbitalSpace.page).toContain('/spaces/')});
