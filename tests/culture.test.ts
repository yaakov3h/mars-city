import {it,expect} from 'vitest';
import {gallery} from '../src/culture';
it('uses local NASA assets with image-level credits',()=>{expect(gallery).toHaveLength(2);expect(gallery[0].credit).toBe('NASA/JPL-Caltech/ASU/MSSS');expect(gallery[1].credit).toBe('NASA/JPL-Caltech');expect(gallery.every(i=>i.file.endsWith('.webp'))).toBe(true)});
