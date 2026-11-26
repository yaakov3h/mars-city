import {it,expect} from 'vitest';
import world from '../src/world.ts?raw';
// The phone-only merge step builds a bucket key with JSON.stringify of each mesh's userData.
// A focusAnchor points back at the building group, so it must be skipped or the stringify throws.
const key=(u:any)=>JSON.stringify([u],(k,v)=>k==='focusAnchor'?undefined:v);
it('merge key tolerates a circular focusAnchor',()=>{
 const group:any={userData:{}};const mesh:any={userData:{focusAnchor:group}};group.userData.anchor={object:group,list:[mesh]};
 expect(()=>JSON.stringify([mesh.userData])).toThrow();
 expect(()=>key(mesh.userData)).not.toThrow();
});
it('world.ts merge key skips focusAnchor',()=>{
 expect(world).toContain("(k,v)=>k==='focusAnchor'?undefined:v);const b=buckets.get(key)");
});
