/** Explicit, reviewable city event application. No conversation listener; an authorized assistant
 * writes an event JSON file and runs this command only after the owner approves the update.
 * Existing entities are never regenerated. Commit the state and events in a separate commit.
 */
import fs from 'node:fs';
import {nextHex,buildable} from './layout.mjs';
const path=process.argv[2];if(!path){console.error('Usage: node scripts/apply-event.mjs path/to/event.json');process.exit(1)}
const event=JSON.parse(fs.readFileSync(path,'utf8'));
const base='data/';const state=JSON.parse(fs.readFileSync(base+'city-state.json','utf8'));const log=JSON.parse(fs.readFileSync(base+'events.json','utf8'));const cats=JSON.parse(fs.readFileSync(base+'categories.json','utf8'));
if(!event.id||!event.occurredAt||!event.summary?.he||!event.summary?.en||!event.subcategory||!Number.isInteger(event.complexity)||event.complexity<1||event.complexity>5||!Number.isInteger(event.importance)||event.importance<1||event.importance>5||!cats.some(c=>c.id===event.category))throw Error('Invalid event fields/category');
if(log.events.some(e=>e.id===event.id))throw Error('Event already exists. No duplicate applied.');
if(event.kind!=='question'&&event.kind!=='concept_milestone')throw Error('Supported v1 event kinds: question, concept_milestone');
if(Date.parse(event.occurredAt)<Date.parse(state.lastUpdated))throw Error('Out-of-order event: inspect history manually');
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const oldCount=state.totalQuestions;
if(event.kind==='question'){
 state.totalQuestions++;
 let district=state.districts.find(d=>d.category===event.category);
 if(!district){const {q,r}=nextHex(state.districts,state.landmarks,event.id);district={id:`district-${event.id}`,category:event.category,q,r,demand:1,questionCount:0,foundedAt:event.occurredAt};state.districts.push(district);log.events.push({id:`${event.id}-district`,kind:'district_created',category:event.category,subcategory:event.subcategory,complexity:event.complexity,importance:event.importance,occurredAt:event.occurredAt,summary:event.summary})}
 if(!buildable(district.q,district.r))throw Error('District occupies a permanent crater reserve');
 district.questionCount++;district.demand++;let building=state.buildings.find(b=>b.districtId===district.id&&b.subcategory===event.subcategory);
 if(building){building.questionCount++;building.activity=Math.min(1,building.activity+.15);building.height=Math.round((building.height+.12*event.complexity)*10)/10;building.complexity=Math.max(building.complexity,event.complexity);building.lastUpdated=event.occurredAt}
 else {const n=state.buildings.filter(b=>b.districtId===district.id).length;const id=`b-${event.id}`;state.buildings.push({id,districtId:district.id,name:event.summary,subcategory:event.subcategory,q:n%3-1,r:Math.floor(n/3),height:Math.round((3+event.complexity*1.55+hash(id)%20/10)*10)/10,width:Math.round((1.3+event.importance*.17)*10)/10,complexity:event.complexity,activity:1,questionCount:1,createdAt:event.occurredAt,lastUpdated:event.occurredAt})}
 for(const milestone of [100,250,500,1000,2500,5000,10000,25000,50000])if(oldCount<milestone&&state.totalQuestions>=milestone&&!state.landmarks.some(l=>l.eventId===`${event.id}-milestone`))state.landmarks.push({id:`l-${milestone}`,kind:'question_milestone',name:{he:`${milestone} שאלות`,en:`${milestone} questions`},...nextHex(state.districts,state.landmarks,`${event.id}-milestone`),createdAt:event.occurredAt,eventId:`${event.id}-milestone`});
}
if(event.kind==='concept_milestone'){
 const d=state.districts.find(d=>d.category===event.category);if(!d)throw Error('Concept milestone requires existing district');
 state.landmarks.push({id:`l-${event.id}`,kind:'concept',name:event.summary,...nextHex(state.districts,state.landmarks,event.id),createdAt:event.occurredAt,eventId:event.id});
}
log.events.push(event);state.revision++;state.lastUpdated=event.occurredAt;
// Only write after every precondition succeeds. Existing historical data stays in place.
fs.writeFileSync(base+'events.json',JSON.stringify(log,null,2)+'\n');fs.writeFileSync(base+'city-state.json',JSON.stringify(state,null,2)+'\n');console.log(`Applied ${event.id}; revision ${state.revision}`);
