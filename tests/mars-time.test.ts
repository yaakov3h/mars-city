import {describe,it,expect} from 'vitest';
import {marsOrbit,marsTime,clockText,SOL_MS,FOUNDING_UTC,ARES,viewerLocalHours,viewerLightTime} from '../src/mars-time';
describe('Mars24 time and Ares solar geometry',()=>{
 it('matches NASA worked Airy midnight benchmark with the historical TT offset',()=>{const t=marsOrbit(Date.parse('2000-01-06T00:00:00Z'),64.184);expect(t.mtc).toBeCloseTo(23+59/60+39/3600,3)});
 it('advances one mean solar day in 24h39m35.244s',()=>{expect(SOL_MS/1000).toBeCloseTo(88775.244,2);const t=Date.parse('2026-09-30T06:00:00Z');expect(marsOrbit(t+SOL_MS).msd-marsOrbit(t).msd).toBeCloseTo(1,8)});
 it('anchors SOL 001 to the founding local solar day and changes at local midnight',()=>{const start=Date.parse(FOUNDING_UTC),t=marsTime(start);expect(t.sol).toBe(1);expect(marsTime(start+SOL_MS).sol).toBe(2);const nextMidnight=start+(24-t.lmst)/24*SOL_MS;expect(marsTime(nextMidnight-1000).sol).toBe(1);expect(marsTime(nextMidnight+1000).sol).toBe(2)});
 it('uses west longitude offset, with noon lit and midnight dark',()=>{const t=Date.parse('2026-09-30T06:00:00Z'),m=marsTime(t);expect((m.mtc-m.lmst+24)%24).toBeCloseTo(ARES.longitudeWest/15,7);expect(marsTime(t,12).elevation).toBeGreaterThan(35);expect(marsTime(t,0).elevation).toBeLessThan(-35)});
 it('puts seasonal sunrise and blue sunset at the computed horizon, not fixed 18:00',()=>{const utc=Date.parse('2026-09-30T06:00:00Z'),t=marsTime(utc);expect(marsTime(utc,t.sunsetLMST).elevation).toBeCloseTo(0,6);expect(marsTime(utc,t.sunsetLMST).dusk).toBeCloseTo(1,6);expect(marsTime(utc,t.sunriseLMST).elevation).toBeCloseTo(0,6);expect(marsTime(utc,t.sunriseLMST).dusk).toBe(0)});
 it('formats a 24-Mars-hour clock and keeps manual time separate',()=>{expect(clockText(0)).toBe('00:00:00');expect(clockText(12.5)).toBe('12:30:00');expect(marsTime(Date.now(),12).manual).toBe(true)});
});

describe('viewer local-time lighting',()=>{
 it('reads the device-local wall clock rather than UTC or Mars hour',()=>{const d=new Date(2026,8,30,11,30,0);expect(viewerLocalHours(d)).toBe(11.5);expect(viewerLightTime(d).ltst).toBeCloseTo(11.5,8)});
 it('lights local noon and darkens local midnight, without changing the Ares clock',()=>{expect(viewerLightTime(new Date(2026,8,30,12)).elevation).toBeGreaterThan(35);expect(viewerLightTime(new Date(2026,8,30,0)).elevation).toBeLessThan(-35);const d=new Date(2026,8,30,12);expect(marsTime(d.getTime()).manual).toBe(false)});
});
