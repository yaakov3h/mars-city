import {it,expect} from 'vitest';
import world from '../src/world.ts?raw';
import state from '../data/city-state.json';
import {validateState,hex} from '../src/model';
import {pilotOpening,OCT26_SHAFTS} from '../src/underground';
import {KNOWLEDGE_SHAFT_POINT} from '../src/oct26-knowledge-tree';
const id='b-knowledge-tree-20261026';
it('places the Knowledge Tree on its own full plot with a valid state',()=>{
 const b=state.buildings.find(b=>b.id===id)!;expect(b.plot).toEqual({q:-5,r:5});
 expect(validateState(state as any)).toEqual([]);
 expect(state.buildings.filter(x=>x.plot&&x.plot.q===-5&&x.plot.r===5)).toHaveLength(1);
 expect(state.buildings.some(x=>x.plot&&x.plot.q===-3&&x.plot.r===6)).toBe(false);
});




it('levels its own hex like the other plots, so district paving cannot rise over the pad, seats and nameplate on a slope',()=>{
  expect(world).toContain("for(const kb of state.buildings)if((kb.id===KNOWLEDGE_TREE_ID||kb.id===DREAM_ARCHIVE_ID)&&kb.plot){const [x,z]=hex(kb.plot.q,kb.plot.r,10);leveledPads.push({x,z,y:naturalGroundY(x,z)+.08});}");
  expect(world).toMatch(/leveledPads=state\.districts[\s\S]*for\(const kb of state\.buildings\)/);
});
