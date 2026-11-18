import * as THREE from 'three';
import {Text} from 'troika-three-text';
import type {World} from './world';
import {geodesicDome} from './oct27-dream-archive';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
// Oxygen Cafe (קפה חמצן): a small cafe in a geodesic glass dome at the city's eastern edge, on its own plot beside
// the Connection Gate and the Birthday Tower, so the family corner becomes a little plaza. The dome's open glass
// faces the red landscape to the east; inside are tiny tables and the commander's chair, which a cat has taken
// over. By the entrance a delivery robot is stuck in the sand with an iced coffee still upright on its tray, and
// the door sign reads: 'נגמר החלב. החמצן בינתיים בסדר.' A big coffee cup on the kitchen roof steams gently.
// Fully above ground, in the city's permanent daylight; Noa's small turquoise signature is the entrance light
// strip and the robot's beacon.
export const OXYGEN_CAFE_ID='b-oxygen-cafe-20261118';
export const OXYGEN_CAFE_PLOT=Object.freeze({q:5,r:-1});
export const OXYGEN_CAFE_SIGN='נגמר החלב. החמצן בינתיים בסדר.';
// Footprint relative to the hex centre; heights are above the pad top.
export const OXYGEN_CAFE=Object.freeze({padRadius:8.3,padTop:.5,floorY:1.1,domeRadius:4.6,domeHeight:4.6,doorHalfWidth:1.1,doorHeight:2.6,maxHeight:6.6});
export const CAFE_ENAMEL=Object.freeze({terracotta:'#c8553d',coral:'#ff6f59',saffron:'#ffc145',teal:'#2fb8a8'});
const enamel=(c:string,e=.12)=>new THREE.MeshStandardMaterial({color:c,roughness:.38,metalness:.22,emissive:new THREE.Color(c),emissiveIntensity:e});
const cream=()=>new THREE.MeshStandardMaterial({color:'#f6efe2',roughness:.6,metalness:.05});
const stone=()=>new THREE.MeshStandardMaterial({color:'#bca07b',roughness:.9,metalness:.05});
const copper=(e=.2)=>new THREE.MeshStandardMaterial({color:'#f0b074',roughness:.42,metalness:.72,emissive:new THREE.Color('#ff9a45'),emissiveIntensity:e});
const glow=(c:string)=>new THREE.MeshBasicMaterial({color:c});
function signText(text:string,size:number){
 const t=new Text();t.text=text;t.direction='rtl';t.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';t.fontSize=size;
 t.anchorX='center';t.anchorY='middle';t.color='#4a3418';t.userData.noMerge=true;t.userData.wallSign=true;t.sync();return t;
}
export function oxygenCafe(part:Part,group:THREE.Group,world:World){
 const C=OXYGEN_CAFE,P=C.padTop,FY=C.floorY;
 // Hex pad and Noa's small turquoise entrance strip on the city-facing (west) edge.
 part(new THREE.CylinderGeometry(C.padRadius,C.padRadius+.15,P,6),stone(),0,P/2);
 const strip=part(new THREE.BoxGeometry(.5,.07,3.4),glow('#4fd8be'),-C.padRadius+.5,P+.04);
 strip.userData.noSignature=true;
 // Warm ground-light slabs leading from the pad edge to the door step.
 for(let k=0;k<3;k++)part(new THREE.BoxGeometry(.6,.06,.5),glow('#ffd166'),-7.5+k*1.1,P+.03,0);
 // Cafe floor: a low round stone plinth.
 part(new THREE.CylinderGeometry(4.9,5.05,.6,32),stone(),0,P+.3);
 // The geodesic glass dome (same shell language as the Dream Archive), rotated so its door faces west, to the city.
 const domeG=new THREE.Group();domeG.position.set(0,FY,0);domeG.rotation.y=-Math.PI/2;group.add(domeG);
 const {faces,struts}=geodesicDome(C.domeRadius,C.domeHeight,{halfWidth:C.doorHalfWidth,height:C.doorHeight});
 const shell=new THREE.Mesh(faces,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false}));
 shell.castShadow=false;shell.receiveShadow=false;
 const frame=new THREE.Mesh(struts,copper(.12));
 for(const m of [shell,frame]){m.userData={buildingId:OXYGEN_CAFE_ID,districtId:group.userData.districtId};domeG.add(m);world.hit.push(m);}
 const rim=new THREE.Mesh(new THREE.TorusGeometry(C.domeRadius+.05,.14,8,64),copper(.2));
 rim.rotation.x=Math.PI/2;rim.position.set(0,FY,0);rim.userData={buildingId:OXYGEN_CAFE_ID,districtId:group.userData.districtId};
 group.add(rim);world.hit.push(rim);
 // Door frame on the west shell edge, a lit doorway and a stone step down to the pad.
 const dx=-Math.sqrt(C.domeRadius*C.domeRadius-C.doorHalfWidth*C.doorHalfWidth)*.995;
 for(const sz of [-1,1])part(new THREE.BoxGeometry(.24,C.doorHeight,.24),copper(.18),dx,FY+C.doorHeight/2,sz*C.doorHalfWidth);
 part(new THREE.BoxGeometry(.24,.24,C.doorHalfWidth*2+.24),copper(.18),dx,FY+C.doorHeight,0);
 part(new THREE.BoxGeometry(.08,2.2,1.6),glow('#ffe3b0'),dx+.08,FY+1.1,0);
 part(new THREE.BoxGeometry(.95,.3,C.doorHalfWidth*2+.6),stone(),dx-.45,P+.45,0);
 // The door sign, held proud of the lintel on two copper brackets: 'נגמר החלב. החמצן בינתיים בסדר.'
 const signY=FY+3.55;
 for(const sz of [-1.5,1.5])part(new THREE.BoxGeometry(.1,.75,.1),copper(.15),dx,signY-.6,sz);
 part(new THREE.BoxGeometry(.1,1.0,4.4),copper(.22),dx,signY,0);
 part(new THREE.BoxGeometry(.08,.86,4.24),new THREE.MeshStandardMaterial({color:'#e8d9c0',roughness:.85,metalness:.05}),dx-.05,signY,0);
 const sign=signText(OXYGEN_CAFE_SIGN,.2);
 sign.position.set(dx-.11,signY,0);sign.rotation.y=-Math.PI/2;group.add(sign);
 // Kitchen core along the south inner wall, with a cream counter facing the room.
 part(new THREE.BoxGeometry(3.6,2.4,1.6),enamel(CAFE_ENAMEL.terracotta,.08),-.5,FY+1.2,-2.9);
 part(new THREE.BoxGeometry(3.0,.9,.14),cream(),-.5,FY+.45,-2.05);
 part(new THREE.BoxGeometry(3.2,.14,.6),cream(),-.5,FY+.95,-2.1);
 // Mugs hanging on the counter face.
 for(let k=0;k<3;k++)part(new THREE.CylinderGeometry(.09,.07,.16,10),enamel([CAFE_ENAMEL.saffron,CAFE_ENAMEL.teal,CAFE_ENAMEL.coral][k],.18),-1.5+k,FY+.6,-1.95);
 // A big coffee cup on the kitchen roof, steaming gently: how the cafe reads from across the city.
 part(new THREE.CylinderGeometry(.78,.62,1.0,20),cream(),-.5,FY+2.9,-2.9);
 part(new THREE.CylinderGeometry(.8,.8,.22,20),enamel(CAFE_ENAMEL.coral,.2),-.5,FY+2.62,-2.9);
 const handle=part(new THREE.TorusGeometry(.42,.09,8,20),cream(),-.5,FY+2.9,-2.08);handle.rotation.y=Math.PI/2;
 for(let k=0;k<3;k++){
  const steam=new THREE.Mesh(new THREE.SphereGeometry(.13+k*.05,10,8),new THREE.MeshBasicMaterial({color:'#fff6e6',transparent:true,opacity:.5}));
  const sy=FY+3.75+k*.55;
  steam.position.set(-.5+(k%2?.18:-.14),sy,-2.9+(k-1)*.18);
  steam.userData={buildingId:OXYGEN_CAFE_ID,float:true,originY:sy,phase:k*.9};
  group.add(steam);world.animated.push(steam);
 }
 // A small warm lamp hanging above the room's centre.
 part(new THREE.CylinderGeometry(.02,.02,1.1,6),copper(.1),.4,FY+3.95,.3);
 part(new THREE.SphereGeometry(.18,12,10),glow('#ffe3b0'),.4,FY+3.35,.3);
 // The commander's chair on its dais, facing the door - and the cat who has taken it over.
 part(new THREE.CylinderGeometry(1.15,1.3,.24,20),stone(),.6,FY+.12,.4);
 part(new THREE.CylinderGeometry(.16,.22,.5,10),copper(.15),.6,FY+.49,.4);
 const seatY=FY+.74;
 part(new THREE.BoxGeometry(.85,.14,.85),enamel(CAFE_ENAMEL.coral,.15),.6,seatY+.07,.4);
 part(new THREE.BoxGeometry(.14,1.5,.85),enamel(CAFE_ENAMEL.coral,.15),1.02,seatY+.8,.4);
 part(new THREE.BoxGeometry(.18,.3,.5),enamel(CAFE_ENAMEL.coral,.15),1.02,seatY+1.55,.4);
 for(const sz of [-1,1])part(new THREE.BoxGeometry(.6,.08,.12),copper(.2),.62,seatY+.5,.4+sz*.46);
 const star=part(new THREE.CylinderGeometry(.12,.12,.05,5),glow('#ffd166'),1.11,seatY+.95,.4);star.rotation.z=Math.PI/2;
 const catMat=new THREE.MeshStandardMaterial({color:'#4a4443',roughness:.8,metalness:.02});
 const catY=seatY+.14;
 const catBody=part(new THREE.SphereGeometry(.3,14,10),catMat,.52,catY+.27,.4);catBody.scale.set(.95,1.15,.85);
 part(new THREE.SphereGeometry(.21,14,10),catMat,.38,catY+.68,.4);
 for(const sz of [-1,1]){const ear=part(new THREE.ConeGeometry(.09,.2,4),catMat,.38,catY+.88,.4+sz*.11);ear.rotation.y=Math.PI/4;}
 for(const sz of [-1,1])part(new THREE.SphereGeometry(.03,8,6),glow('#2fb8a8'),.19,catY+.7,.4+sz*.08);
 part(new THREE.SphereGeometry(.07,10,8),cream(),.2,catY+.6,.4);
 const tail=part(new THREE.TorusGeometry(.22,.05,8,16,Math.PI*1.3),catMat,.68,catY+.1,.62);tail.rotation.set(Math.PI/2,0,.6);
 // Two tiny tables with stools and cups, on the view side.
 for(const tz of [-1.5,1.9]){
  part(new THREE.CylinderGeometry(.55,.6,.08,16),cream(),2.5,FY+.62,tz);
  part(new THREE.CylinderGeometry(.06,.08,.6,8),copper(.15),2.5,FY+.31,tz);
  for(const sx of [-1,1])part(new THREE.CylinderGeometry(.2,.24,.3,10),enamel(tz<0?CAFE_ENAMEL.saffron:CAFE_ENAMEL.teal,.1),2.5,FY+.15,tz+sx*.95);
  part(new THREE.CylinderGeometry(.07,.055,.1,10),cream(),2.3,FY+.71,tz+.2);
 }
 // Two small benches on the east pad edge, facing the open red landscape.
 for(const bz of [-2,2]){
  part(new THREE.BoxGeometry(.5,.12,1.6),cream(),7.0,P+.45,bz);
  for(const sx of [-.18,.18])part(new THREE.BoxGeometry(.08,.35,1.5),stone(),7.0+sx,P+.22,bz);
 }
 // The delivery robot, stuck in the sand beside the entrance path - iced coffee still upright on its tray.
 part(new THREE.CylinderGeometry(.62,.72,.12,14),new THREE.MeshStandardMaterial({color:'#8a5a40',roughness:1}),-6.3,P+.04,2.4);
 const craterRim=part(new THREE.TorusGeometry(.62,.12,8,18),new THREE.MeshStandardMaterial({color:'#c9a37e',roughness:1}),-6.3,P+.1,2.4);craterRim.rotation.x=Math.PI/2;
 const bot=new THREE.Group();bot.position.set(-6.3,P+.16,2.4);bot.rotation.x=.16;bot.rotation.y=Math.PI/2;group.add(bot);
 const bpart=(geo:THREE.BufferGeometry,mat:THREE.Material,x=0,y=0,z=0)=>{
  const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;
  m.userData={buildingId:OXYGEN_CAFE_ID,districtId:group.userData.districtId};bot.add(m);world.hit.push(m);return m;
 };
 const botDark=new THREE.MeshStandardMaterial({color:'#3a3535',roughness:.9});
 // One wheel is sunk in the little crater; the lean tells the story.
 bpart(new THREE.CylinderGeometry(.24,.24,.14,14),botDark,0,.1,-.34).rotation.x=Math.PI/2;
 bpart(new THREE.CylinderGeometry(.24,.24,.14,14),botDark,0,.42,.34).rotation.x=Math.PI/2;
 bpart(new THREE.BoxGeometry(.7,.55,.5),enamel(CAFE_ENAMEL.teal,.1),0,.62,0);
 bpart(new THREE.BoxGeometry(.5,.3,.4),cream(),0,1.05,0);
 for(const s of [-1,1])bpart(new THREE.SphereGeometry(.05,8,6),glow('#2fb8a8'),.26,1.08,s*.12);
 // The tray and the iced coffee it refuses to spill.
 bpart(new THREE.BoxGeometry(.3,.05,.44),copper(.2),.44,.66,0);
 const cupGlass=new THREE.MeshStandardMaterial({color:'#dff3f5',transparent:true,opacity:.45,roughness:.15,metalness:.05});
 bpart(new THREE.CylinderGeometry(.09,.075,.26,12),cupGlass,.44,.82,0);
 bpart(new THREE.CylinderGeometry(.075,.06,.13,12),new THREE.MeshStandardMaterial({color:'#5a3a22',roughness:.4}),.44,.77,0);
 bpart(new THREE.CylinderGeometry(.09,.09,.04,12),cupGlass,.44,.96,0);
 for(const [ix,iz] of [[.42,-.03],[.46,.04]])bpart(new THREE.BoxGeometry(.045,.045,.045),new THREE.MeshBasicMaterial({color:'#f4fbff'}),ix,.88,iz);
 const straw=bpart(new THREE.CylinderGeometry(.015,.015,.3,6),enamel(CAFE_ENAMEL.coral,.3),.46,1.05,.02);straw.rotation.z=.22;
 // The patient beacon on top: Noa's second small turquoise note.
 const beacon=bpart(new THREE.SphereGeometry(.07,10,8),glow('#4fd8be'),0,1.3,0);
 beacon.userData.pulse=true;world.animated.push(beacon);
 // Two little sand puffs behind the wheels, where it tried to reverse.
 part(new THREE.SphereGeometry(.22,8,6),new THREE.MeshStandardMaterial({color:'#c9a37e',roughness:1}),-6.75,P+.14,2.75);
 part(new THREE.SphereGeometry(.16,8,6),new THREE.MeshStandardMaterial({color:'#c9a37e',roughness:1}),-6.9,P+.1,2.1);
}
