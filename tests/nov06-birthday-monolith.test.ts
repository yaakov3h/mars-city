import {it,expect} from 'vitest';
import world from '../src/world.ts?raw';
import monolith from '../src/nov06-birthday-monolith.ts?raw';
import state from '../data/city-state.json';
import events from '../data/events.json';
import {validateState,hex,random} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
import {BIRTHDAY_MONOLITH_ID,BIRTHDAY_MONOLITH_PLOT,BIRTHDAY_MONOLITH,MONOLITH_COLORS} from '../src/nov06-birthday-monolith';
it('stands on its own free buildable plot beside the city core, with a valid state',()=>{
 const l=state.landmarks.find(x=>x.id===BIRTHDAY_MONOLITH_ID)!;
 expect([l.q,l.r]).toEqual([BIRTHDAY_MONOLITH_PLOT.q,BIRTHDAY_MONOLITH_PLOT.r]);
 expect(validateState(state as any)).toEqual([]);
 const k=BIRTHDAY_MONOLITH_PLOT.q+','+BIRTHDAY_MONOLITH_PLOT.r;
 for(const b of state.buildings)if(b.plot)expect(b.plot.q+','+b.plot.r).not.toBe(k);
 for(const o of state.landmarks.filter(x=>x.id!==BIRTHDAY_MONOLITH_ID))expect(o.q+','+o.r).not.toBe(k);
 for(const held of ['-3,6','0,2','0,-5','0,-4'])expect(k).not.toBe(held);
 expect(buildable(BIRTHDAY_MONOLITH_PLOT.q,BIRTHDAY_MONOLITH_PLOT.r)).toBe(true);
});
it('clears the deterministic rocks from its pad',()=>{
 const [x,z]=hex(BIRTHDAY_MONOLITH_PLOT.q,BIRTHDAY_MONOLITH_PLOT.r,10);
 for(let i=0;i<360;i++){const rx=(random('rx'+i)-.5)*230,rz=(random('rz'+i)-.5)*230;expect(Math.hypot(x-rx,z-rz)).toBeGreaterThan(8+.16+random('rs'+i)*1.35);}
});
it('is fully above ground and rendered from the landmark dispatch',()=>{
 expect(monolith).not.toMatch(/underground|lift|shaft|cutRoofWindows/i);
 expect(world).toContain("import {birthdayMonolith,BIRTHDAY_MONOLITH_ID} from './nov06-birthday-monolith'");
 expect(world).toContain('else if(l.id===BIRTHDAY_MONOLITH_ID)');
});
it('is a tall colorful monolith: six enamel bands, light spiral, gold star, candle-like glass pillars, festive sign',()=>{
 expect(MONOLITH_COLORS).toHaveLength(6);
 for(const s of ['bodyHeight','ExtrudeGeometry','Spiral'.toLowerCase()==='x'?'':'SphereGeometry','מונולית יום ההולדת'])expect(monolith).toContain(s);
 expect(monolith).toContain('CylinderGeometry(M.topR,M.baseR,M.bodyHeight,6)');expect(monolith).toContain('ExtrudeGeometry');
 expect(BIRTHDAY_MONOLITH.maxHeight).toBeGreaterThan(10);
});
it('ledger entry marks the birthday with color and light, above ground, with no age',()=>{
 const ev=events.events.find(e=>e.id==='birthday-monolith-20261106')!;
 expect(ev.category).toBe('FAMILY');
 expect(ev.summary.he).toContain('מונולית יום ההולדת');
 expect(ev.summary.he).toContain('מעל הקרקע');
 expect(ev.summary.he).not.toMatch(/\d/);
 expect(ev.summary.en).toContain('above ground');
 expect(ev.summary.en).not.toMatch(/\d/);
});
