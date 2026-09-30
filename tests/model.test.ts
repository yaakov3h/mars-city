import {describe,it,expect} from 'vitest';
import {state,events,demoState,demoEvents,categories,validateState,validateEvent,hash,random,hex,population,districtPopulation,nextMilestone,buildingDNA,shouldCount,snapshot} from '../src/model';
describe('city-state and events',()=>{
 it('validates live and separate demo state with category references',()=>{expect(validateState(state)).toEqual([]);expect(events.flatMap(validateEvent)).toEqual([]);expect(validateState(demoState)).toEqual([]);expect(demoEvents.flatMap(validateEvent)).toEqual([]);expect(categories).toHaveLength(15)});
 it('commits the approved Genesis and co-design events with one preserved landmark, with abstract public metadata only',()=>{expect(state.mode).toBe('live');expect(state.totalQuestions).toBe(3);expect(state.districts[0].category).toBe('TECHNOLOGY');expect(state.buildings[0].subcategory).toBe('AI_AGENTS');expect(state.buildings[0].complexity).toBe(5);expect(state.landmarks[0].name.en).toBe('The Genesis Core');expect(events.filter(e=>e.kind==='question')).toHaveLength(3);expect(JSON.stringify(state)).not.toContain('נועה, עבודה')});
 it('adds one complexity-5 creative building without duplicating Genesis Core',()=>{expect(state.buildings.filter(b=>b.subcategory==='LIVING_3D_WORLD_DESIGN')).toHaveLength(1);expect(state.districts.filter(d=>d.category==='CREATIVE')).toHaveLength(1);expect(state.landmarks).toHaveLength(1);expect(events.filter(e=>e.id==='codesign-20260930')).toHaveLength(1)});
 it('adds one independent banking-regulation building at complexity 3',()=>{const bank=state.buildings.filter(b=>b.subcategory==='BANKING_REGULATION');expect(bank).toHaveLength(1);expect(bank[0].complexity).toBe(3);expect(state.districts.filter(d=>d.category==='FINANCE')).toHaveLength(1);expect(state.landmarks).toHaveLength(1)});
 it('rejects duplicate buildings and bad events',()=>{expect(validateState({...state,buildings:[...state.buildings,state.buildings[0]]})).toContain('duplicate/empty id: b-genesis-20260930');expect(validateEvent({...events[1],complexity:6})).toContain('complexity must be 1-5')});
 it('assigns categories from fixed taxonomy',()=>{expect(categories.find(c=>c.id==='TECHNOLOGY')?.form).toBe('crystal');expect(categories.find(c=>c.id==='LEARNING')?.form).toBe('observatory')});
 it('keeps deterministic DNA and coordinates',()=>{expect(hash('mars')).toBe(hash('mars'));expect(random('mars')).toBe(random('mars'));expect(hex(2,-1)).toEqual(hex(2,-1));expect(buildingDNA(events[1],'district-genesis-20260930',1)).toEqual(buildingDNA(events[1],'district-genesis-20260930',1))});
 it('counts population reproducibly',()=>{expect(population(state)).toBeGreaterThan(0);expect(districtPopulation(state,state.districts[0].id)).toBeGreaterThan(0)});
 it('detects future milestones',()=>{expect(nextMilestone(99)).toBe(100);expect(nextMilestone(100)).toBe(250)});
 it('avoids trivial acknowledgements',()=>{expect(shouldCount('תודה')).toBe(false);expect(shouldCount('I want to understand AI agents')).toBe(true)});
 it('preserves live history and separate demo history',()=>{const old=snapshot(state,events[0].occurredAt);expect(old.buildings.length).toBe(1);expect(old.landmarks.length).toBe(0);expect(demoState.buildings).toHaveLength(15);expect(state.buildings).toHaveLength(3)})
});

describe('living category catalog',()=>{
 it('contains one fictional example per category and keeps live data separate',()=>{expect(demoState.districts).toHaveLength(15);expect(new Set(demoState.districts.map(d=>d.category)).size).toBe(15);expect(demoState.totalQuestions).toBe(15);expect(demoEvents.every(e=>e.demo)).toBe(true);expect(state.buildings).toHaveLength(3)});
 it('includes a marked voice-conversation example',()=>{expect(demoState.buildings.filter(b=>b.sourceChannel==='voice')).toHaveLength(2);expect(demoEvents.filter(e=>e.sourceChannel==='voice')).toHaveLength(2)});
});
