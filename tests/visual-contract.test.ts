import {describe,it,expect} from 'vitest';
/// <reference types="vite/client" />
import world from '../src/world.ts?raw';
describe('visual contract',()=>{
 it('retains the founding spire while removing floating signature signage',()=>{for(const token of ['this.foundingSpire(group,b,c.color,part)','j<9','beaconBeam=true'])expect(world).toContain(token);expect(world).not.toContain('new THREE.Sprite(new THREE.SpriteMaterial({map:signMaps')});
 it('registers monument pieces and accepts landmark picking',()=>{expect(world).toContain('o.userData.landmarkId=l.id;this.hit.push(o)');expect(world).toContain('buildingId??found.object.userData.landmarkId')});
 it('retains the approved Origin Ring composition',()=>{for(const token of ['originRing(group','16.2+Math.sin','SphereGeometry(3,40','CylinderGeometry(HEX_SIZE-.06','userData.pulse=true'])expect(world).toContain(token)});
 it('maps complexity to habitable geometry and bespoke level 5 detail',()=>{for(const token of ['rows=level+1','if(level>=2)','if(level>=3)','if(level>=4)','if(level===5)']){expect(world).toContain(token)}});
 it('keeps warm architectural bodies separate from category lighting and dark monuments',()=>{for(const token of ['WARM_PALETTE','warmBody(bodyColor,c.color)','warm=material(color','emissiveMap:accent?maps.glow:null','stone=basaltBody()'])expect(world).toContain(token)});
 it('wraps basalt copper around all monolith faces and lights inner gaps',()=>{for(const token of ['basaltSurface()','basaltBody()','front, back, left and right','fill.userData.dayIntensity=18','fill.userData.nightIntensity=32','m.userData.nightGlow=.75'])expect(world).toContain(token)});
 it('provides settlement paths and reduced-motion-safe activity',()=>{expect(world).toContain('connectSettlement(state,centers)');expect(world).toContain('if(!this.reduced)for(const o of this.animated)');expect(world).toContain('userData.route')});
});

describe('independent full-size hexes',()=>{
 it('places studio at its own hex center with a broad glazed garden',()=>{expect(world).toContain("'district-images-20260930'");expect(world).toContain('SphereGeometry(8.6,48,24');expect(world).not.toContain("b.id==='b-images-20260930'?7.7");});
 it('uses full city zone geometry for mosaic floors and seven slots',()=>{expect(world).toContain("id:'mosaic-'+seg");expect(world).toContain('for(let t=0;t<7;t++)');expect(world).toContain('this.mosaicCells(state)');});
});

describe('compact district visibility controls',()=>{
 it('keeps independent hidden districts alongside legacy highlights',()=>{expect(world).toContain('setHiddenDistricts(ids:Set<string>)');expect(world).toContain('!this.hiddenDistricts.has(d)')});
});

it('keeps live realism permanent and catalog comparison reversible',()=>{expect(world).toContain("this.applyCatalogRealism(state.mode==='demo')");expect(world).toContain('const active=!demo||this.catalogRealism');expect(world).toContain('this.terrainMaterial.map=maps?.ground??null')});

it('avoids renderer resizing when the quality is unchanged',()=>{expect(world).toContain('setQuality(q:Quality){if(this.quality===q)return')});

it('adds physical seams, instanced fasteners and merged branched trees',()=>{for(const token of ['catalogJoints(group','catalogPlateJoints:true','catalogFasteners:true','catalogTree(group','mergeGeometries(parts)','if(this.catalogRealism){this.catalogTree'])expect(world).toContain(token)});

it('preserves basalt monuments, foliage and creature surfaces while adding live garden trees',()=>{for(const token of ['preserveRealismSurface=true','m.userData.foliage=true',"b.id+'-atelier-'","b.id+'-studio-'","b.id+'-citadel-'",'if(group.userData.buildingId)this.hit.push(mesh)'])expect(world).toContain(token)});

it('extends the same cached mineral surfaces and varied trees underground',()=>{expect(world).toContain('export function detailedSurface');});
