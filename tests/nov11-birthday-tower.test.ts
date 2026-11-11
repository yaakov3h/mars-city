import {it,expect} from 'vitest';
import world from '../src/world.ts?raw';
import tower from '../src/nov11-birthday-tower.ts?raw';
import state from '../data/city-state.json';
import events from '../data/events.json';
import {validateState,validateEvent,hex,random,districtPlots} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
import {BIRTHDAY_TOWER_ID,BIRTHDAY_TOWER_PLOT,BIRTHDAY_TOWER,BIRTHDAY_TOWER_GREETING,TOWER_ENAMEL,TOWER_SECTIONS} from '../src/nov11-birthday-tower';
import {BIRTHDAY_MONOLITH_PLOT} from '../src/nov06-birthday-monolith';
const here=(b:any)=>b.id===BIRTHDAY_TOWER_ID;
const k=(p:any)=>p.q+','+p.r;
it('places the Birthday Tower on its own free full plot beside the Birthday Monolith, with a valid state',()=>{
 const b=state.buildings.find(here)!;expect(b.plot).toEqual({q:4,r:-1});expect(BIRTHDAY_TOWER_PLOT).toEqual({q:4,r:-1});
 expect(b.name.he).toBe('מגדל יום ההולדת');
 expect(validateState(state as any)).toEqual([]);
 const mine=k(BIRTHDAY_TOWER_PLOT);
 expect(state.buildings.filter(x=>x.plot&&k(x.plot)===mine)).toHaveLength(1);
 const others=new Map<string,string>();
 for(const d of state.districts)for(const p of districtPlots(d as any))if(!(d.id==='district-birthday-tower-20261111'&&k(p)===mine))others.set(k(p),'district');
 for(const l of state.landmarks)others.set(k(l),'landmark');
 for(const i of (state as any).installations??[])for(const p of i.plots)others.set(k(p),'installation');
 for(const p of (state as any).mosaic?.hexes??[])others.set(k(p),'mosaic');
 expect(others.has(mine)).toBe(false);
 for(const held of ['-3,6','0,2','0,-5','0,-4'])expect(mine).not.toBe(held);
 // Neighbour of the monolith hex (axial distance 1), so the two read as one birthday corner.
 const dq=BIRTHDAY_TOWER_PLOT.q-BIRTHDAY_MONOLITH_PLOT.q,dr=BIRTHDAY_TOWER_PLOT.r-BIRTHDAY_MONOLITH_PLOT.r;
 expect((Math.abs(dq)+Math.abs(dr)+Math.abs(dq+dr))/2).toBe(1);
 expect(state.districts.find(d=>d.id==='district-birthday-tower-20261111')!.plots!.filter(p=>k(p)===mine)).toHaveLength(1);
});
it('clears every one of the 360 model-random rocks and sits on buildable ground',()=>{
 expect(buildable(4,-1)).toBe(true);const [x,z]=hex(4,-1,10);
 for(let i=0;i<360;i++)expect(Math.hypot(x-(random('rx'+i)-.5)*230,z-(random('rz'+i)-.5)*230)).toBeGreaterThan(10+.16+random('rs'+i)*1.35);
});
it('is its own module, fully above ground, and world.ts only imports, dispatches and pads it',()=>{
 expect(tower).not.toMatch(/underground|lift|shaft|elevator|cutRoofWindows|מעלית/i);
 expect(world).toContain("import {birthdayTower,BIRTHDAY_TOWER_ID} from './nov11-birthday-tower'");
 expect(world).toContain('if(b.id===BIRTHDAY_TOWER_ID){birthdayTower(part,group,this);return group;}');
 expect(world).toContain('kb.id===CONNECTION_GATE_ID||kb.id===BIRTHDAY_TOWER_ID)&&kb.plot');
 expect(world.match(/BIRTHDAY_TOWER_ID/g)!.length).toBe(4);
});
it('keeps the tower identity: four Mars-enamel sections, frosting cornices, candle and flame, balloon ring, confetti ring, greeting sign',()=>{
 expect(TOWER_SECTIONS.map(s=>s.color)).toEqual([TOWER_ENAMEL.coral,TOWER_ENAMEL.saffron,TOWER_ENAMEL.teal,TOWER_ENAMEL.terracotta]);
 for(let i=1;i<TOWER_SECTIONS.length;i++)expect(TOWER_SECTIONS[i].w).toBeLessThan(TOWER_SECTIONS[i-1].w);
 const body=BIRTHDAY_TOWER.padTop+BIRTHDAY_TOWER.plinthH+TOWER_SECTIONS.reduce((a,s)=>a+s.h+BIRTHDAY_TOWER.cornice,0);
 expect(body).toBeGreaterThan(20);expect(body+BIRTHDAY_TOWER.candleH+1.5).toBeLessThan(BIRTHDAY_TOWER.maxHeight);
 expect(BIRTHDAY_TOWER.balloonCount).toBeGreaterThanOrEqual(10);expect(BIRTHDAY_TOWER.confettiCount).toBeGreaterThanOrEqual(30);
 for(const s of ['balloon','confetti','flame','spin:true','float:true','sign-hebrew.ttf',"direction='rtl'",'wallSign'])expect(tower).toContain(s);
 expect(BIRTHDAY_TOWER_GREETING).toBe('יום הולדת שמח יעקב · 6.11');
 // Noa's turquoise signature stays small: the entrance strip, the flame's tip and one confetti colour.
 expect(tower.match(/#4fd8be/g)!.length).toBeLessThanOrEqual(3);
});
it('carries no walking cat, no workplace words or insignia',()=>{
 expect(tower).not.toMatch(/cat|חתול|emblem|EMBLEM|להבים|כוכב כחול|logo/i);
 const ev=events.events.find(e=>e.id==='birthday-tower-20261111')!;
 expect(JSON.stringify(ev)).not.toMatch(/להבים|כוכב כחול|emblem|logo|https?:\/\/|#\d/i);
});
it('ledger entry describes the above-ground birthday tower beside the monolith, with no age',()=>{
 const ev=events.events.find(e=>e.id==='birthday-tower-20261111')!;
 expect(validateEvent(ev as any)).toEqual([]);
 expect(ev.occurredAt).toBe(state.buildings.find(here)!.createdAt);
 expect(ev.summary.he).toContain('מגדל יום ההולדת');expect(ev.summary.he).toContain('מעל הקרקע');expect(ev.summary.he).toContain('מונולית יום ההולדת');
 expect(ev.summary.en).toContain('above ground');expect(ev.summary.he).toContain(BIRTHDAY_TOWER_GREETING);
 expect(ev.summary.he+ev.summary.en).not.toMatch(/\bגיל\b|years old|\b\d{2}(th| שנה)/);
 expect(state.revision).toBe(63);
 expect(state.buildings.at(-1)!.id).toBe(BIRTHDAY_TOWER_ID);expect(events.events.at(-1)!.id).toBe('birthday-tower-20261111');
});
