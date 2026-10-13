import {describe,it,expect} from 'vitest';
// @ts-ignore pure JS normalization shared with the daily job
import {latestWeather} from '../scripts/weather-data.mjs';
describe('weather samples',()=>{
 const s={terrestrial_date:'2026-08-25',sol:'4995',min_temp:'-71',max_temp:'-5',pressure:'777'};
 it('normalizes a dated outreach sample',()=>expect(latestWeather({soles:[s]})).toMatchObject({sol:4995,minC:-71,maxC:-5,pressurePa:777}));
 it('ignores missing values',()=>expect(latestWeather({soles:[s,{...s,sol:'4996',min_temp:'--'}]}).sol).toBe(4995));
 it('rejects empty feeds',()=>expect(()=>latestWeather({soles:[]})).toThrow());
 it('rejects impossible ranges',()=>expect(()=>latestWeather({soles:[{...s,min_temp:'60'}]})).toThrow());
});
