import * as THREE from 'three';
import {Text} from 'troika-three-text';
import type {World} from './world';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
// Birthday Tower (מגדל יום ההולדת): a tall, slim enamel tower raised for the owner's birthday on 6.11, on its own plot
// beside the Birthday Monolith so the two make a small birthday corner east of the core. Four stacked sections in
// Mars enamel colours (coral, saffron, teal, terracotta) step inward as they climb, each crowned by a cream frosting
// cornice, with a candle and a warm flame at the very top. A ring of balloons and a slow-turning ring of confetti
// float around the crown. The greeting sign on the city-facing face is in Noa's sign style. Fully above ground, in
// the city's permanent daylight; Noa's small turquoise signature is an entrance strip and the flame's light point.
export const BIRTHDAY_TOWER_ID='b-birthday-tower-20261111';
export const BIRTHDAY_TOWER_PLOT=Object.freeze({q:4,r:-1});
export const BIRTHDAY_TOWER_GREETING='יום הולדת שמח יעקב · 6.11';
export const TOWER_ENAMEL=Object.freeze({coral:'#ff6f59',saffron:'#ffc145',teal:'#2fb8a8',terracotta:'#c8553d'});
// Sections bottom to top: width, height, enamel colour. Heights are above the pad top.
export const TOWER_SECTIONS=Object.freeze([
 Object.freeze({w:4.4,h:5.6,color:TOWER_ENAMEL.coral}),
 Object.freeze({w:3.8,h:5.2,color:TOWER_ENAMEL.saffron}),
 Object.freeze({w:3.2,h:4.8,color:TOWER_ENAMEL.teal}),
 Object.freeze({w:2.6,h:4.4,color:TOWER_ENAMEL.terracotta})
]);
export const BIRTHDAY_TOWER=Object.freeze({padRadius:8.3,padTop:.5,plinthH:.6,cornice:.36,candleH:2.6,balloonCount:14,balloonRing:3.7,confettiCount:40,maxHeight:27.5});
const BALLOON_COLORS=[TOWER_ENAMEL.coral,TOWER_ENAMEL.saffron,TOWER_ENAMEL.teal,TOWER_ENAMEL.terracotta];
const enamel=(c:string,e=.12)=>new THREE.MeshStandardMaterial({color:c,roughness:.38,metalness:.22,emissive:new THREE.Color(c),emissiveIntensity:e});
const cream=()=>new THREE.MeshStandardMaterial({color:'#f6efe2',roughness:.6,metalness:.05});
const stone=()=>new THREE.MeshStandardMaterial({color:'#bca07b',roughness:.9,metalness:.05});
const copper=(e=.2)=>new THREE.MeshStandardMaterial({color:'#f0b074',roughness:.42,metalness:.72,emissive:new THREE.Color('#ff9a45'),emissiveIntensity:e});
const glow=(c:string)=>new THREE.MeshBasicMaterial({color:c});
// Deterministic jitter so the confetti lands the same way on every load.
const jitter=(k:number,s:number)=>{const v=Math.sin(k*12.9898+s*78.233)*43758.5453;return v-Math.floor(v)};
function signText(text:string,size:number){
 const t=new Text();t.text=text;t.direction='rtl';t.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';t.fontSize=size;
 t.anchorX='center';t.anchorY='middle';t.color='#4a3418';t.userData.noMerge=true;t.userData.wallSign=true;t.sync();return t;
}
export function birthdayTower(part:Part,group:THREE.Group,world:World){
 const T=BIRTHDAY_TOWER;
 // Hex pad and a low terracotta plinth.
 part(new THREE.CylinderGeometry(T.padRadius,T.padRadius+.15,T.padTop,6),stone(),0,T.padTop/2);
 const plinth=part(new THREE.BoxGeometry(5.4,T.plinthH,5.4),enamel(TOWER_ENAMEL.terracotta,.05),0,T.padTop+T.plinthH/2);
 // Entrance light strip on the city-facing (west) edge: Noa's small turquoise signature.
 part(new THREE.BoxGeometry(.5,.07,3.4),glow('#4fd8be'),-T.padRadius+.5,T.padTop+.04);
 // The tower: four enamel sections stepping inward, each with cream corner ribs, porthole lights and a frosting cornice.
 let y=T.padTop+T.plinthH;
 TOWER_SECTIONS.forEach((s,i)=>{
  part(new THREE.BoxGeometry(s.w,s.h,s.w),enamel(s.color),0,y+s.h/2);
  for(const [cx,cz] of [[1,1],[1,-1],[-1,1],[-1,-1]])part(new THREE.BoxGeometry(.24,s.h,.24),cream(),cx*s.w/2,y+s.h/2,cz*s.w/2);
  // Two slim warm window slits per face, upper half of the section.
  for(let f=0;f<4;f++){
   const a=f*Math.PI/2,nx=Math.cos(a),nz=Math.sin(a);
   for(const off of [-.26,.26]){
    if(i===0&&f===2)continue; // the door face of the base stays clear
    const px=nx*(s.w/2+.02)+(-nz)*off*s.w,pz=nz*(s.w/2+.02)+nx*off*s.w;
    const win=part(new THREE.BoxGeometry(.06,s.h*.42,.34),glow('#ffe3b0'),px,y+s.h*.6,pz);
    win.rotation.y=-a;
   }
  }
  // Frosting cornice: a cream slab with a row of little drips along each edge.
  const top=y+s.h;
  part(new THREE.BoxGeometry(s.w+.5,T.cornice,s.w+.5),cream(),0,top+T.cornice/2);
  for(let f=0;f<4;f++){
   const a=f*Math.PI/2,nx=Math.cos(a),nz=Math.sin(a);
   for(let k=0;k<5;k++){
    const along=(k-2)/2.5*(s.w/2);
    part(new THREE.SphereGeometry(.13,8,6),cream(),nx*(s.w/2+.25)+(-nz)*along,top-.02,nz*(s.w/2+.25)+nx*along);
   }
  }
  y=top+T.cornice;
 });
 const crownY=y;
 // The candle: a cream column with coral rings, a copper cup and a warm flame that floats gently.
 part(new THREE.CylinderGeometry(.85,.95,.3,16),copper(.25),0,crownY+.15);
 part(new THREE.CylinderGeometry(.42,.42,T.candleH,16),cream(),0,crownY+.3+T.candleH/2);
 for(let k=0;k<3;k++){const ring=part(new THREE.TorusGeometry(.43,.06,8,24),enamel(TOWER_ENAMEL.coral,.2),0,crownY+.8+k*.75);ring.rotation.x=Math.PI/2;}
 const flameY=crownY+.3+T.candleH+.55;
 const flame=new THREE.Mesh(new THREE.SphereGeometry(.36,14,10),glow('#ffcf6e'));
 flame.scale.set(1,1.55,1);flame.position.set(0,flameY,0);
 flame.userData={buildingId:BIRTHDAY_TOWER_ID,float:true,originY:flameY,phase:.4};
 group.add(flame);world.animated.push(flame);world.hit.push(flame);
 // A tiny turquoise light point at the flame's tip (Noa's roof-light signature).
 const tip=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),glow('#4fd8be'));
 tip.position.set(0,flameY+.72,0);tip.userData={buildingId:BIRTHDAY_TOWER_ID,float:true,originY:flameY+.72,phase:.4};
 group.add(tip);world.animated.push(tip);
 // Ring of balloons around the crown, each tied to the top cornice with a thin string.
 for(let k=0;k<T.balloonCount;k++){
  const a=k*Math.PI*2/T.balloonCount+.2,r=T.balloonRing+(k%2)*.35,by=crownY+1.1+(k%3)*.6;
  const bx=Math.cos(a)*r,bz=Math.sin(a)*r,c=BALLOON_COLORS[k%BALLOON_COLORS.length];
  const balloon=new THREE.Mesh(new THREE.SphereGeometry(.6,16,12),new THREE.MeshStandardMaterial({color:c,roughness:.22,metalness:.1,emissive:new THREE.Color(c),emissiveIntensity:.18}));
  balloon.scale.set(1,1.2,1);balloon.position.set(bx,by,bz);balloon.castShadow=true;
  balloon.userData={buildingId:BIRTHDAY_TOWER_ID,float:true,originY:by,phase:k*.7};
  group.add(balloon);world.animated.push(balloon);world.hit.push(balloon);
  // Knot and string down to the last cornice edge.
  const knot=new THREE.Mesh(new THREE.ConeGeometry(.09,.16,8),balloon.material);
  knot.position.set(bx,by-.76,bz);knot.rotation.x=Math.PI;
  knot.userData={buildingId:BIRTHDAY_TOWER_ID,float:true,originY:by-.76,phase:k*.7};
  group.add(knot);world.animated.push(knot);
  const last=TOWER_SECTIONS[TOWER_SECTIONS.length-1].w/2+.2,ax=Math.cos(a)*last,az=Math.sin(a)*last,ay=crownY;
  const from=new THREE.Vector3(ax,ay,az),to=new THREE.Vector3(bx,by-.86,bz),len=from.distanceTo(to);
  const string=part(new THREE.CylinderGeometry(.018,.018,len,4),new THREE.MeshBasicMaterial({color:'#fff6e6'}));
  string.position.copy(from.clone().add(to).multiplyScalar(.5));
  string.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),to.clone().sub(from).normalize());
 }
 // A slow-turning ring of confetti just above the balloons.
 const confetti=new THREE.Group();confetti.position.set(0,crownY+2.4,0);confetti.userData={buildingId:BIRTHDAY_TOWER_ID,spin:true};
 const confettiColors=[...BALLOON_COLORS,'#f6efe2','#4fd8be'];
 for(let k=0;k<T.confettiCount;k++){
  const a=k*Math.PI*2/T.confettiCount,r=4.4+jitter(k,1)*1.1,h=(jitter(k,2)-.5)*1.8;
  const bit=new THREE.Mesh(new THREE.BoxGeometry(.26,.03,.14),new THREE.MeshBasicMaterial({color:confettiColors[k%confettiColors.length],side:THREE.DoubleSide}));
  bit.position.set(Math.cos(a)*r,h,Math.sin(a)*r);bit.rotation.set(jitter(k,3)*Math.PI,jitter(k,4)*Math.PI,jitter(k,5)*Math.PI);
  bit.userData={buildingId:BIRTHDAY_TOWER_ID};confetti.add(bit);
 }
 group.add(confetti);world.animated.push(confetti);
 const base=TOWER_SECTIONS[0],fx=-(base.w/2);
 // The greeting sign on the city-facing (west) face of the coral base, in Noa's sign style: a stone plate in a copper
 // frame, dark brown text, held just proud of the corner ribs on two copper brackets, above the door.
 const sx=fx-.42,signY=T.padTop+T.plinthH+4.5;
 for(const bz of [-1.6,1.6])part(new THREE.BoxGeometry(.42,.12,.12),copper(.15),fx-.2,signY,bz);
 part(new THREE.BoxGeometry(.08,.96,5.1),copper(.22),sx+.04,signY,0);
 part(new THREE.BoxGeometry(.08,.82,4.94),new THREE.MeshStandardMaterial({color:'#e8d9c0',roughness:.85,metalness:.05}),sx,signY,0);
 const greeting=signText(BIRTHDAY_TOWER_GREETING,.31);
 greeting.position.set(sx-.06,signY,0);greeting.rotation.y=-Math.PI/2;
 group.add(greeting);
 // A cream door on the west face, lit from inside.
 part(new THREE.BoxGeometry(.1,1.7,1.2),cream(),fx-.03,T.padTop+T.plinthH+.85,0);
 part(new THREE.BoxGeometry(.06,1.5,1.0),glow('#ffe3b0'),fx-.08,T.padTop+T.plinthH+.78,0);
}
