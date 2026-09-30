import stateJson from '../data/city-state.json';
import eventsJson from '../data/events.json';
import categoryJson from '../data/categories.json';
import demoStateJson from '../data/demo-city-state.json';
import demoEventsJson from '../data/demo-events.json';
export type Locale = 'he' | 'en';
export type Text = {he:string;en:string};
export type Category = {id:string;he:string;en:string;color:string;icon:string;styleHe:string;styleEn:string;form:string};
export type Plot = {q:number;r:number;foundedAt?:string};
export type District = {plots?:Plot[];id:string;category:string;q:number;r:number;demand:number;questionCount:number;foundedAt:string};
export type Building = {plot?:Plot;id:string;districtId:string;name:Text;subcategory:string;q:number;r:number;height:number;width:number;complexity:number;activity:number;questionCount:number;createdAt:string;lastUpdated:string;sourceChannel?:'voice'|'text';catalogStyle?:Text};
export type Creature = {id:string;species:Text;rarity:string;districtId:string;size:number;habitat:string;movement:string;seed:number};
export type Landmark = {id:string;kind:string;name:Text;q:number;r:number;createdAt:string;eventId:string};
export type Mosaic = {tiles:number;segmentCapacity:number;hexes?:Array<{q:number;r:number}>};
export type State = {schemaVersion:number;mode:string;revision:number;foundedAt:string;lastUpdated:string;totalQuestions:number;districts:District[];buildings:Building[];creatures:Creature[];landmarks:Landmark[];mosaic?:Mosaic};
export type CityEvent = {id:string;kind:string;category:string;subcategory:string;complexity:number;importance:number;occurredAt:string;summary:Text;demo?:boolean;sourceChannel?:'voice'|'text'};
export const state:State=stateJson;
export const events:CityEvent[]=eventsJson.events;
export const demoState:State=demoStateJson as State;
export const demoEvents:CityEvent[]=demoEventsJson.events as CityEvent[];
export const categories:Category[]=categoryJson;
export const milestones=[100,250,500,1000,2500,5000,10000,25000,50000];
export const category=(id:string)=>categories.find(c=>c.id===id) ?? categories[categories.length-1];
export function hash(s:string):number {let h=2166136261; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
export const random=(seed:string)=>hash(seed)/4294967296;
export function hex(q:number,r:number,size=1):[number,number] {return [size*Math.sqrt(3)*(q+r/2),size*1.5*r]}
export function mosaicSegments(m:Mosaic){return Math.floor(m.tiles/m.segmentCapacity)+1}
export function mosaicTilesInSegment(m:Mosaic,segment:number){const done=segment*m.segmentCapacity;return Math.max(0,Math.min(m.segmentCapacity,m.tiles-done))}
export const districtPlots=(d:District)=>d.plots??[{q:d.q,r:d.r,foundedAt:d.foundedAt}];
export function population(s:State){return s.buildings.reduce((n,b)=>n+Math.round((b.width*b.height)*(2+b.complexity/3)),0)+s.districts.reduce((n,d)=>n+districtPlots(d).length*12,0)}
export function districtPopulation(s:State,id:string){return s.buildings.filter(b=>b.districtId===id).reduce((n,b)=>n+Math.round((b.width*b.height)*(2+b.complexity/3)),12*districtPlots(s.districts.find(d=>d.id===id)!).length)}
export function nextMilestone(count:number){return milestones.find(m=>m>count)}
export function shouldCount(text:string){let t=text.trim().toLowerCase();return t.length>4&&!/^(hi|hello|hey|thanks|thank you|ok|okay|yes|no|great|שלום|תודה|כן|לא|סבבה|מעולה|בסדר)[!?.\s]*$/u.test(t)}
export function buildingDNA(event:CityEvent, districtId:string, ordinal:number):Building {
 const id=`b-${event.id}-${ordinal}`; const seed=random(id);
 return {id,districtId,name:event.summary,subcategory:event.subcategory,q:ordinal%3-1,r:Math.floor(ordinal/3),height:Math.round((3+event.complexity*1.55+seed*2)*10)/10,width:Math.round((1.3+event.importance*.17)*10)/10,complexity:event.complexity,activity:1,questionCount:1,createdAt:event.occurredAt,lastUpdated:event.occurredAt};
}
export function validateEvent(e:CityEvent):string[]{const errors:string[]=[];if(!e.id||!e.kind||!e.occurredAt||!e.summary?.he||!e.summary?.en)errors.push('missing event fields');if(!categories.some(c=>c.id===e.category))errors.push('unknown category');if(!Number.isInteger(e.complexity)||e.complexity<1||e.complexity>5)errors.push('complexity must be 1-5');if(!Number.isInteger(e.importance)||e.importance<1||e.importance>5)errors.push('importance must be 1-5');if(Number.isNaN(Date.parse(e.occurredAt)))errors.push('invalid date');return errors}
export function validateState(s:State):string[]{const errors:string[]=[];if(s.schemaVersion!==1)errors.push('unsupported schema');if(!Number.isInteger(s.totalQuestions)||s.totalQuestions<0)errors.push('invalid question count');const ids=new Set<string>();for(const item of [...s.districts,...s.buildings,...s.creatures,...s.landmarks]){if(!item.id||ids.has(item.id))errors.push('duplicate/empty id: '+item.id);ids.add(item.id)}const districts=new Set(s.districts.map(d=>d.id)),occupied=new Set<string>();for(const d of s.districts){if(!categories.some(c=>c.id===d.category))errors.push('invalid district category');if(d.demand<1||!Number.isFinite(d.q)||!Number.isFinite(d.r))errors.push('invalid district geometry');for(const p of districtPlots(d)){const key=p.q+','+p.r;if(!Number.isInteger(p.q)||!Number.isInteger(p.r)||occupied.has(key))errors.push('invalid/duplicate district plot');occupied.add(key)}}for(const b of s.buildings){if(!districts.has(b.districtId))errors.push('orphan building');if(b.plot){const d=s.districts.find(d=>d.id===b.districtId);if(!d||!districtPlots(d).some(p=>p.q===b.plot!.q&&p.r===b.plot!.r))errors.push('building plot outside district')}if(b.height<=0||b.width<=0||b.complexity<1||b.complexity>5)errors.push('invalid building geometry')}for(const c of s.creatures)if(!districts.has(c.districtId))errors.push('orphan creature');return errors}
export function snapshot(s:State,date:string):State {const districts=s.districts.filter(d=>d.foundedAt<=date).map(d=>({...d,plots:d.plots?.filter(p=>!p.foundedAt||p.foundedAt<=date)}));const permitted=new Set(districts.map(d=>d.id));return {...s,districts,buildings:s.buildings.filter(b=>permitted.has(b.districtId)&&b.createdAt<=date),creatures:s.creatures.filter(c=>permitted.has(c.districtId)),landmarks:s.landmarks.filter(l=>l.createdAt<=date),totalQuestions:Math.min(s.totalQuestions,s.buildings.filter(b=>b.createdAt<=date).reduce((n,b)=>n+b.questionCount,0))}}
