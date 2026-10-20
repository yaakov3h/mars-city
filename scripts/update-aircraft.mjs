// Refresh the published Israel-skies aircraft snapshot from adsb.lol (ODbL). Free, no account needed.
// On source failure the last-good file is preserved (the city keeps showing dated data).
import fs from 'node:fs';
const SOURCE='https://api.adsb.lol/v2/point/31.4/35.1/120'; // one query covering all of Israel
const path='public/aircraft/israel-latest.json';
try{
  const response=await fetch(SOURCE,{signal:AbortSignal.timeout(20000),headers:{accept:'application/json','user-agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'}});
  if(!response.ok)throw Error(`HTTP ${response.status}`);
  const raw=await response.json();
  const ac=(Array.isArray(raw?.ac)?raw.ac:[]).filter(a=>typeof a?.lat==='number'&&typeof a?.lon==='number')
    .map(a=>({hex:a.hex,flight:typeof a.flight==='string'?a.flight.trim():undefined,lat:a.lat,lon:a.lon,alt_baro:a.alt_baro,gs:a.gs,track:a.track}));
  const value={fetchedAt:new Date().toISOString(),source:'adsb.lol',license:'ODbL',airborne:ac.filter(a=>typeof a.alt_baro==='number'&&a.alt_baro>0).length,ac};
  const output=JSON.stringify(value)+'\n';
  const old=fs.existsSync(path)?fs.readFileSync(path,'utf8'):null;
  if(old!==output){fs.mkdirSync('public/aircraft',{recursive:true});fs.writeFileSync(path,output);console.log(`Updated ${ac.length} aircraft (${value.airborne} airborne)`)}
  else console.log('Snapshot unchanged');
}catch(e){console.error(`adsb.lol unavailable; preserving dated last-good file: ${e.message}`);if(!fs.existsSync(path))process.exitCode=1}
