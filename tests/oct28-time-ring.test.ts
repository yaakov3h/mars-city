import {describe,expect,it} from 'vitest';
import {dialAngles,zoneClock,TIME_RING_PLACES,TIME_RING_HOST_ID} from '../src/oct28-time-ring';
import state from '../data/city-state.json';
describe('time ring',()=>{
 it('hour and minute hands',()=>{const a=dialAngles(3,0);expect(a.hour).toBeCloseTo(Math.PI/2);expect(a.minute).toBe(0);expect(dialAngles(6,30).minute).toBeCloseTo(Math.PI);});
 it('four places with valid IANA zones show their own local time',()=>{expect(TIME_RING_PLACES).toHaveLength(4);const t=new Date('2026-10-28T12:00:00Z');expect(zoneClock('Asia/Jerusalem',t)).toEqual({h:14,m:0});expect(zoneClock('America/Los_Angeles',t)).toEqual({h:5,m:0});expect(zoneClock('America/New_York',t)).toEqual({h:8,m:0});expect(zoneClock('America/Chicago',t)).toEqual({h:7,m:0});for(const p of TIME_RING_PLACES)expect(()=>zoneClock(p.tz,t)).not.toThrow();});
 it('host is an existing building',()=>{expect((state as any).buildings.some((b:any)=>b.id===TIME_RING_HOST_ID)).toBe(true);});
});
