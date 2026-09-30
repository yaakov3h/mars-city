// NASA GISS Mars24 / Allison & McEwen formulas, evaluated locally.
// Sources: https://www.giss.nasa.gov/tools/mars24/help/algorithm.html
// Ares anchor: https://nssdc.gsfc.nasa.gov/planetary/marsland.html
export const ARES={latitude:19.33,longitudeWest:33.55};
export const SOL_DAYS=1.0274912517;
export const SOL_MS=SOL_DAYS*86400000;
export const FOUNDING_UTC='2026-09-30T01:22:49+03:00';
// IERS Bulletin C 72: TAI-UTC remains 37 s through December 2026.
export const TT_MINUS_UTC=69.184;
const mod=(x:number,n:number)=>((x%n)+n)%n;
const rad=Math.PI/180;
const sin=(x:number)=>Math.sin(x*rad),cos=(x:number)=>Math.cos(x*rad);
export function marsOrbit(utcMs:number,ttMinusUtc=TT_MINUS_UTC){
 const jdTT=utcMs/86400000+2440587.5+ttMinusUtc/86400,d=jdTT-2451545;
 const msd=(jdTT-2451549.5)/SOL_DAYS+44796-.0009626;
 const m=19.3871+.52402073*d,fms=270.3871+.524038496*d;
 const perturbers=[[.0071,2.2353,49.409],[.0057,2.7543,168.173],[.0039,1.1177,191.837],[.0037,15.7866,21.736],[.0021,2.1354,15.704],[.002,2.4694,95.528],[.0018,32.8493,49.095]];
 const pbs=perturbers.reduce((sum,[a,t,p])=>sum+a*cos(.985626*d/t+p),0);
 const center=(10.691+3e-7*d)*sin(m)+.623*sin(2*m)+.05*sin(3*m)+.005*sin(4*m)+.0005*sin(5*m)+pbs;
 const ls=mod(fms+center,360),eot=2.861*sin(2*ls)-.071*sin(4*ls)+.002*sin(6*ls)-center;
 const declination=Math.asin(.42565*sin(ls))/rad+.25*sin(ls);
 return {jdTT,msd,ls,eot,declination,mtc:mod(msd*24,24)};
}
const foundingLocalDay=Math.floor(marsOrbit(Date.parse(FOUNDING_UTC)).msd-ARES.longitudeWest/360);
export function marsTime(utcMs=Date.now(),manualLMST?:number){
 const orbit=marsOrbit(utcMs),localDay=orbit.msd-ARES.longitudeWest/360;
 const lmst=manualLMST===undefined?mod(localDay*24,24):mod(manualLMST,24),ltst=mod(lmst+orbit.eot/15,24);
 const hourAngle=(ltst-12)*15,lat=ARES.latitude,dec=orbit.declination;
 const up=sin(lat)*sin(dec)+cos(lat)*cos(dec)*cos(hourAngle);
 const east=-cos(dec)*sin(hourAngle),north=cos(lat)*sin(dec)-sin(lat)*cos(dec)*cos(hourAngle);
 const elevation=Math.asin(Math.max(-1,Math.min(1,up)))/rad;
 const sunsetTrue=12+Math.acos(-Math.tan(lat*rad)*Math.tan(dec*rad))/rad/15;
 const sunsetLMST=mod(sunsetTrue-orbit.eot/15,24),sunriseLMST=mod(24-sunsetTrue-orbit.eot/15,24);
 const dusk=ltst>12?Math.exp(-((elevation/7)**2)):0;
 return {...orbit,lmst,ltst,elevation,direction:{east,north,up},dusk,sunsetLMST,sunriseLMST,sol:Math.max(1,Math.floor(localDay)-foundingLocalDay+1),manual:manualLMST!==undefined};
}
export type MarsTime=ReturnType<typeof marsTime>;
export function clockText(hours:number){const seconds=Math.floor(mod(hours,24)*3600);return [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':');}

// Lighting follows the viewer's device-local wall clock, without geolocation.
// The scientific Ares clock above remains independent.
export function viewerLocalHours(date=new Date()){return date.getHours()+date.getMinutes()/60+date.getSeconds()/3600+date.getMilliseconds()/3600000;}
export function viewerLightTime(date=new Date()){const hours=viewerLocalHours(date),orbit=marsOrbit(date.getTime());return marsTime(date.getTime(),hours-orbit.eot/15);}
