import * as THREE from 'three';
import {Text} from 'troika-three-text';
import type {World} from './world';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
// Second Lookout (מצפה המבט השני): a small copper pavilion whose two lenses face each other across a tiny plaza and
// look back toward the city. It marks the value of a second, fresh look at work that was already approved: the fresh-eyes
// review caught a real mismatch between the approved words and the published ones. The whole structure stands above
// ground in the city's permanent daylight: beside the pavilion a quiet lookout corner keeps the bench, the periscope
// column and the framed viewing panel that used to sit in a room below.
export const SECOND_LOOKOUT_ID='b-second-lookout-20261106';
export const LOOKOUT2_PLOT=Object.freeze({q:0,r:-7});
// Pavilion footprint relative to the hex centre; heights are above the pad top.
export const LOOKOUT2=Object.freeze({padRadius:8.3,lensHeight:4.6,lensTilt:.62,lensSep:4.4,barrelLen:2.1,barrelR:.34,maxHeight:6.2});
const copper=(e=.25)=>new THREE.MeshStandardMaterial({color:'#f0b074',roughness:.42,metalness:.72,emissive:new THREE.Color('#ff9a45'),emissiveIntensity:e});
const stone=()=>new THREE.MeshStandardMaterial({color:'#bca07b',roughness:.9,metalness:.05});
const lensGlass=()=>new THREE.MeshStandardMaterial({color:'#cfe8ff',roughness:.15,metalness:.2,emissive:new THREE.Color('#ae9af4'),emissiveIntensity:.55,transparent:true,opacity:.92});
const tealGlass=()=>new THREE.MeshStandardMaterial({color:'#d6fff2',roughness:.15,metalness:.2,emissive:new THREE.Color('#4fd8be'),emissiveIntensity:.55,transparent:true,opacity:.92});
const enamel=(c:string,e=.5)=>new THREE.MeshStandardMaterial({color:c,roughness:.35,metalness:.15,emissive:new THREE.Color(c),emissiveIntensity:e});
const silhouette=()=>new THREE.MeshStandardMaterial({color:'#3b2f4a',roughness:.8,metalness:.1});
export function secondLookout(part:Part,group:THREE.Group,world:World){
 const L=LOOKOUT2;
 part(new THREE.CylinderGeometry(L.padRadius,L.padRadius+.15,.5,6),stone(),0,.25);
 // Low hexagonal copper plinth at the centre of the pad.
 part(new THREE.CylinderGeometry(2.6,2.9,1.1,6),copper(.18),0,1.05);
 const inlay=part(new THREE.TorusGeometry(2.72,.045,8,6),enamel('#4fd8be',.45),0,1.32);
 inlay.rotation.x=Math.PI/2;
 // Two slim masts facing each other across the plinth, each carrying a lens barrel aimed at its twin and, past it,
 // back toward the city. Both are tilted up slightly, like someone raising their eyes for another look.
 const glow=new THREE.MeshBasicMaterial({color:'#ffd9a8'});
 for(const side of [-1,1]){
  const mx=side*L.lensSep/2;
  const mast=part(new THREE.CylinderGeometry(.16,.22,L.lensHeight,8),copper(),mx,.5+L.lensHeight/2);
  mast.rotation.z=-side*.12;
  const barrel=new THREE.Group();
  const tube=new THREE.Mesh(new THREE.CylinderGeometry(L.barrelR,L.barrelR,L.barrelLen,12),copper(.32));
  const glass=new THREE.Mesh(new THREE.CylinderGeometry(L.barrelR*.82,L.barrelR*.82,.12,12),side<0?tealGlass():lensGlass());
  glass.position.y=L.barrelLen/2+.06;
  const rim=new THREE.Mesh(new THREE.TorusGeometry(L.barrelR,.06,8,20),copper(.4));
  rim.rotation.x=Math.PI/2;rim.position.y=L.barrelLen/2+.13;
  barrel.add(tube,glass,rim);
  barrel.position.set(mx-side*.35,.5+L.lensHeight-.35,0);
  // Aim the barrel across at the other lens and slightly upward, toward the city behind it.
  barrel.rotation.z=side*(Math.PI/2-L.lensTilt);
  barrel.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.userData={buildingId:SECOND_LOOKOUT_ID,districtId:group.userData.districtId};}});
  group.add(barrel);
  world.hit.push(tube,glass,rim);
 }
 // A small warm lamp between the two lenses: the moment of looking again.
 part(new THREE.SphereGeometry(.3,12,10),glow,0,2.1);
 part(new THREE.CylinderGeometry(.05,.05,1.5,6),copper(.2),0,1.3);
 // A short rail marking the lookout edge facing the city.
 for(const k of [-1,0,1])part(new THREE.CylinderGeometry(.05,.05,.9,6),copper(.15),k*1.6,.95,3.4);
 const rail=part(new THREE.CylinderGeometry(.04,.04,3.4,6),copper(.15),0,1.35,3.4);
 rail.rotation.z=Math.PI/2;
 // The quiet lookout corner, rehomed onto the pad: a round bench around a low table, the slim periscope column,
 // and the copper-framed viewing panel - the second look, kept in the daylight.
 part(new THREE.CylinderGeometry(1.5,1.6,.45,18),stone(),-4.6,.68,1.2);
 part(new THREE.CylinderGeometry(.5,.6,.95,10),copper(.15),-4.6,1.18,1.2);
 part(new THREE.CylinderGeometry(1.05,1.05,.08,18),stone(),-4.6,1.68,1.2);
 // Periscope column: a slim copper post with a ring collar and an angled viewing head.
 part(new THREE.CylinderGeometry(.16,.2,3.4,10),copper(.18),5.6,2.2,.8);
 const collar=part(new THREE.TorusGeometry(.24,.05,8,18),copper(.3),5.6,2.4,.8);
 collar.rotation.x=Math.PI/2;
 const head=part(new THREE.CylinderGeometry(.14,.14,.9,10),copper(.32),5.6,3.95,.8);
 head.rotation.z=Math.PI/2.6;
 const eye=part(new THREE.CylinderGeometry(.11,.11,.06,10),lensGlass(),5.28,4.17,.8);
 eye.rotation.z=Math.PI/2.6;
 // The viewing panel: a copper frame standing on two posts, softly glowing, facing the bench and the lenses.
 for(const px of [4.1,5.5])part(new THREE.CylinderGeometry(.07,.09,2.2,8),copper(.2),px,1.6,-2.2);
 part(new THREE.BoxGeometry(3.2,2,.18),copper(.25),4.8,2.6,-2.2);
 const panel=new THREE.Mesh(new THREE.PlaneGeometry(2.7,1.55),lensGlass());
 panel.position.set(4.8,2.6,-2.09);
 panel.userData={buildingId:SECOND_LOOKOUT_ID,districtId:group.userData.districtId};
 group.add(panel);
 world.hit.push(panel);
 // What the panel shows: a miniature skyline of the city the lenses look back at, kept as a dark silhouette
 // against the soft glow - the second look, framed.
 const skyH=[.42,.68,.3,.86,.55,.38,.72,.26,.6];
 skyH.forEach((h,i)=>{
  const bld=new THREE.Mesh(new THREE.BoxGeometry(.2,h,.02),silhouette());
  bld.position.set(3.75+i*.26,1.86+h/2,-2.07);
  bld.userData={buildingId:SECOND_LOOKOUT_ID,districtId:group.userData.districtId};
  group.add(bld);world.hit.push(bld);
 });
 const sun=new THREE.Mesh(new THREE.CircleGeometry(.16,16),new THREE.MeshBasicMaterial({color:'#ffd9a8'}));
 sun.position.set(5.7,3.1,-2.07);group.add(sun);
 // Two small lights marking the corner.
 for(const [dx,dz] of [[-3.2,3.2],[3.2,3.2]])part(new THREE.SphereGeometry(.12,8,8),glow,dx,.58,dz);
 // Building sign at the lookout edge facing the city, in the same Hebrew signage style as the motif quarter.
 for(const px of [-1.15,1.15])part(new THREE.CylinderGeometry(.05,.06,1.1,8),copper(.2),px,1.05,4.4);
 part(new THREE.BoxGeometry(2.7,.72,.07),stone(),0,1.9,4.4);
 const name=new Text();
 name.text='מצפה המבט השני';name.direction='rtl';name.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';
 name.fontSize=.34;name.anchorX='center';name.anchorY='middle';name.color='#4a3418';
 name.position.set(0,1.9,4.45);name.userData.noMerge=true;name.userData.wallSign=true;
 group.add(name);name.sync();
}
