import {describe,it,expect} from 'vitest';
/// <reference types="vite/client" />
import world from '../src/world.ts?raw';
describe('visual contract',()=>{
 it('retains the approved Origin Ring composition',()=>{for(const token of ['originRing(group','16.2+Math.sin','SphereGeometry(3,40','CylinderGeometry(8.35','userData.pulse=true'])expect(world).toContain(token)});
 it('maps complexity to habitable geometry and bespoke level 5 detail',()=>{for(const token of ['rows=level+1','if(level>=2)','if(level>=3)','if(level>=4)','if(level===5)']){expect(world).toContain(token)}});
 it('provides settlement paths and reduced-motion-safe activity',()=>{expect(world).toContain('connectSettlement(state,centers)');expect(world).toContain('if(!this.reduced)for(const o of this.animated)');expect(world).toContain('userData.route')});
});
