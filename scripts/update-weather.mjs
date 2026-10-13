import fs from 'node:fs';
import {latestWeather,WEATHER_SOURCE} from './weather-data.mjs';
const path='public/weather/latest.json';
try{const response=await fetch(WEATHER_SOURCE,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error(`HTTP ${response.status}`);const value=latestWeather(await response.json());const old=fs.existsSync(path)?JSON.parse(fs.readFileSync(path,'utf8')):null;if(old&&old.sol>value.sol)throw Error('Source regressed; preserving last-good sample');const output=JSON.stringify(value)+'\n';if(!old||fs.readFileSync(path,'utf8')!==output){fs.mkdirSync('public/weather',{recursive:true});fs.writeFileSync(path,output);console.log(`Updated sol ${value.sol}`)}else console.log('Sample unchanged');}
catch(e){console.error(`Weather unavailable; preserving dated last-good file: ${e.message}`);if(!fs.existsSync(path))process.exitCode=1;}
