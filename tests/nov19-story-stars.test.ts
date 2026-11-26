import {it,expect} from 'vitest';
import world from '../src/world.ts?raw';
import stars from '../src/nov19-story-stars.ts?raw';
import state from '../data/city-state.json';
import events from '../data/events.json';
import {validateState,validateEvent,hex,random,districtPlots} from '../src/model';
import {buildable} from '../scripts/layout.mjs';
import {STORY_STARS_ID,STORY_STARS_PLOT,STORY_STARS,STORY_STARS_NAME,STORY_ENAMEL} from '../src/nov19-story-stars';
import {OXYGEN_CAFE_PLOT} from '../src/nov18-oxygen-cafe';
import {CONNECTION_GATE_PLOT} from '../src/nov10-connection-gate';
const here=(b:any)=>b.id===STORY_STARS_ID;
const k=(p:any)=>p.q+','+p.r;
const dist=(a:{q:number,r:number},b:{q:number,r:number})=>(Math.abs(a.q-b.q)+Math.abs(a.r-b.r)+Math.abs(a.q-b.q+a.r-b.r))/2;
it('places the Story Stars rotunda on its own free full plot beside the gate and the cafe, with a valid state',()=>{
 const b=state.buildings.find(here)!;expect(b.plot).toEqual({q:5,r:0});expect(STORY_STARS_PLOT).toEqual({q:5,r:0});
 expect(b.name.he).toBe('כוכבי הסיפורים');
 expect(validateState(state as any)).toEqual([]);
 const mine=k(STORY_STARS_PLOT);
 expect(state.buildings.filter(x=>x.plot&&k(x.plot)===mine)).toHaveLength(1);
 const others=new Map<string,string>();
 for(const d of state.districts)for(const p of districtPlots(d as any))if(!(d.id==='district-story-stars-20261119'&&k(p)===mine))others.set(k(p),'district');
 for(const l of state.landmarks)others.set(k(l),'landmark');
 for(const i of (state as any).installations??[])for(const p of i.plots)others.set(k(p),'installation');
 for(const p of (state as any).mosaic?.hexes??[])others.set(k(p),'mosaic');
 expect(others.has(mine)).toBe(false);
 for(const held of ['-3,6','0,2','0,-5','0,-4'])expect(mine).not.toBe(held);
 // Neighbour of both the Connection Gate and the Oxygen Cafe (axial distance 1): the eastern plaza grows by one stop.
 expect(dist(STORY_STARS_PLOT,CONNECTION_GATE_PLOT)).toBe(1);
 expect(dist(STORY_STARS_PLOT,OXYGEN_CAFE_PLOT)).toBe(1);
 expect(state.districts.find(d=>d.id==='district-story-stars-20261119')!.plots!.filter(p=>k(p)===mine)).toHaveLength(1);
});
it('clears every one of the 360 model-random rocks and sits on buildable ground',()=>{
 expect(buildable(5,0)).toBe(true);const [x,z]=hex(5,0,10);
 for(let i=0;i<360;i++)expect(Math.hypot(x-(random('rx'+i)-.5)*230,z-(random('rz'+i)-.5)*230)).toBeGreaterThan(10+.16+random('rs'+i)*1.35);
});
it('is its own module, fully above ground, and world.ts only imports, dispatches, pads and taps it',()=>{
 expect(stars).not.toMatch(/underground|lift|shaft|elevator|cutRoofWindows|מעלית/i);
 expect(world).toContain("import {storyStars,STORY_STARS_ID} from './nov19-story-stars'");
 expect(world).toContain('if(b.id===STORY_STARS_ID){storyStars(part,group,this);return group;}');
 expect(world).toContain('kb.id===OXYGEN_CAFE_ID||kb.id===STORY_STARS_ID||kb.id===SHELF_TOWER_ID)&&kb.plot');
 expect(world).toContain('if(found.object.userData.storyBloom)found.object.userData.storyBloom();');
 expect(world.match(/STORY_STARS_ID/g)!.length).toBe(4);
});
it('keeps the rotunda identity: book-stack columns, indigo star canopy, three book constellations, tap bloom',()=>{
 expect(STORY_STARS.columnRing).toBeGreaterThan(3.5);expect(STORY_STARS.bookStack).toBe(4);
 expect(STORY_STARS.canopyBase+STORY_STARS.canopyHeight).toBeLessThan(STORY_STARS.maxHeight);
 for(const s of ['dreamTick','storyBloom',"'boat'","'key'","'fox'",'mobile','petals','halo','sign-hebrew.ttf',"direction='rtl'",'wallSign'])expect(stars).toContain(s);
 expect(STORY_STARS_NAME).toBe('כוכבי הסיפורים');
 expect(stars).toContain('כוכבי הסיפורים');
 // The rotunda carries the shared Mars enamel palette plus the indigo canopy.
 expect(Object.values(STORY_ENAMEL)).toEqual(['#c8553d','#ff6f59','#ffc145','#2fb8a8','#2c2a55']);
 // Noa's turquoise signature stays small: the entrance strip only.
 expect(stars.match(/#4fd8be/g)!.length).toBeLessThanOrEqual(1);
});
it('carries no private names, no workplace words or insignia',()=>{
 expect(stars).not.toMatch(/יעקב|אלון|נועה|גפן|emblem|EMBLEM|להבים|כוכב כחול|logo/i);
 const ev=events.events.find(e=>e.id==='story-stars-20261119')!;
 expect(JSON.stringify(ev)).not.toMatch(/יעקב|אלון|נועה|גפן|להבים|כוכב כחול|emblem|logo|https?:\/\/|#\d/i);
});
it('ledger entry describes the above-ground rotunda beside the cafe, abstract and waiting-to-take-form',()=>{
 const ev=events.events.find(e=>e.id==='story-stars-20261119')!;
 expect(validateEvent(ev as any)).toEqual([]);
 expect(ev.occurredAt).toBe(state.buildings.find(here)!.createdAt);
 expect(ev.summary.he).toContain('כוכבי הסיפורים');expect(ev.summary.he).toContain('מעל הקרקע');expect(ev.summary.he).toContain('קפה החמצן');
 expect(ev.summary.he).toContain('מחכים לקבל צורה');
 expect(ev.summary.en).toContain('above ground');expect(ev.summary.en).toContain('waiting to take form');
 expect(state.revision).toBe(66);
 expect(state.buildings.at(-2)!.id).toBe(STORY_STARS_ID);expect(events.events.at(-2)!.id).toBe('story-stars-20261119');
});
