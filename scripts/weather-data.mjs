export const WEATHER_SOURCE='https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json';
export function latestWeather(feed){
 const valid=(feed.soles??[]).filter(s=>/^\d{4}-\d{2}-\d{2}$/.test(s.terrestrial_date)&&Number.isInteger(Number(s.sol))&&s.min_temp!=='--'&&s.max_temp!=='--'&&s.pressure!=='--'&&[s.min_temp,s.max_temp,s.pressure].every(v=>v!==null&&v!==''&&Number.isFinite(Number(v))));
 valid.sort((a,b)=>Number(b.sol)-Number(a.sol));const s=valid[0];if(!s)throw Error('No valid weather sample');
 const low=Number(s.min_temp),high=Number(s.max_temp),pressure=Number(s.pressure);if(low<-160||high>50||low>high||pressure<0||pressure>2000)throw Error('Invalid physical values');
 return {schemaVersion:1,rover:'Curiosity',location:'Gale Crater',date:s.terrestrial_date,sol:Number(s.sol),minC:low,maxC:high,pressurePa:pressure,source:WEATHER_SOURCE,credit:'CAB / REMS',use:'Outreach only; delayed published observation, not a forecast'};
}
