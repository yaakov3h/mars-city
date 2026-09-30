import {describe,it,expect} from 'vitest';
/// <reference types="vite/client" />
import world from '../src/world.ts?raw';
describe('visual contract',()=>{
 it('retains the approved founding spire and animated signature',()=>{for(const token of ['this.foundingSpire(group,b,c.color,part)','foundingSign:true',"['MARS CITY','Yaakov Hameiri']",'j<9','beaconBeam=true'])expect(world).toContain(token)});
 it('registers monument pieces and accepts landmark picking',()=>{expect(world).toContain('o.userData.landmarkId=l.id;this.hit.push(o)');expect(world).toContain('buildingId??found.object.userData.landmarkId')});
 it('retains the approved Origin Ring composition',()=>{for(const token of ['originRing(group','16.2+Math.sin','SphereGeometry(3,40','CylinderGeometry(HEX_SIZE-.06','userData.pulse=true'])expect(world).toContain(token)});
 it('maps complexity to habitable geometry and bespoke level 5 detail',()=>{for(const token of ['rows=level+1','if(level>=2)','if(level>=3)','if(level>=4)','if(level===5)']){expect(world).toContain(token)}});
 it('keeps warm architectural bodies separate from category lighting and dark monuments',()=>{for(const token of ['WARM_PALETTE','warmBody(bodyColor,c.color)','warm=material(color','emissiveMap:accent?maps.glow:null','stone=basaltBody()'])expect(world).toContain(token)});
 it('wraps basalt copper around all monolith faces and lights inner gaps',()=>{for(const token of ['basaltSurface()','basaltBody()','front, back, left and right','fill.userData.dayIntensity=18','fill.userData.nightIntensity=32','m.userData.nightGlow=.75'])expect(world).toContain(token)});
 it('provides settlement paths and reduced-motion-safe activity',()=>{expect(world).toContain('connectSettlement(state,centers)');expect(world).toContain('if(!this.reduced)for(const o of this.animated)');expect(world).toContain('userData.route')});
});
