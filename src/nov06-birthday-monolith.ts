import * as THREE from 'three';
import {Text} from 'troika-three-text';
import type {World} from './world';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
// Birthday Monolith (מונולית יום ההולדת): a tall, colorful monolith raised in the city's permanent daylight to mark
// the birthday of someone dear - no number, no age, only color and light. Six enamel bands climb the stone, a spiral
// of small lights rises around it, and colored glass pillars ring the base like candles. It stands on its own plot
// beside the city core, fully above ground.
export const BIRTHDAY_MONOLITH_ID='l-birthday-monolith-20261106';
export const BIRTHDAY_MONOLITH_PLOT=Object.freeze({q:3,r:0});
export const BIRTHDAY_MONOLITH=Object.freeze({padRadius:7.2,bodyHeight:10.5,baseR:2.1,topR:1.45,bandCount:6,maxHeight:12.6});
export const MONOLITH_COLORS=['#ff6f61','#4fd8be','#ae9af4','#f2b950','#f48fb1','#7ec8f2'] as const;
const stone=(c='#e8d9c0')=>new THREE.MeshStandardMaterial({color:c,roughness:.85,metalness:.06});
const copper=(e=.25)=>new THREE.MeshStandardMaterial({color:'#f0b074',roughness:.42,metalness:.72,emissive:new THREE.Color('#ff9a45'),emissiveIntensity:e});
const enamel=(c:string,e=.55)=>new THREE.MeshStandardMaterial({color:c,roughness:.32,metalness:.15,emissive:new THREE.Color(c),emissiveIntensity:e});
const glass=(c:string)=>new THREE.MeshStandardMaterial({color:c,roughness:.18,metalness:.2,emissive:new THREE.Color(c),emissiveIntensity:.6,transparent:true,opacity:.9});
export function birthdayMonolith(part:Part,group:THREE.Group,world:World){
 const M=BIRTHDAY_MONOLITH;
 // Round pad with a ring of confetti-colored inlay tiles.
 part(new THREE.CylinderGeometry(M.padRadius,M.padRadius+.15,.5,24),stone('#c9b393'),0,.25);
 MONOLITH_COLORS.forEach((c,k)=>{
  const a=k*Math.PI/3+.4;
  const tile=part(new THREE.BoxGeometry(.9,.06,.9),enamel(c,.3),Math.cos(a)*5.6,.53,Math.sin(a)*5.6);
  tile.rotation.y=a;
 });
 // The monolith itself: a warm pale stone prism, gently tapering, tall enough to read from across the city.
 part(new THREE.CylinderGeometry(M.topR,M.baseR,M.bodyHeight,6),stone(),0,.5+M.bodyHeight/2);
 // Six enamel bands, one per face, running from base to tip.
 for(let k=0;k<M.bandCount;k++){
  const a=k*Math.PI/3;
  const band=part(new THREE.BoxGeometry(.3,M.bodyHeight-.7,.12),enamel(MONOLITH_COLORS[k]),Math.cos(a)*1.72,.5+M.bodyHeight/2,Math.sin(a)*1.72);
  band.rotation.y=-a+Math.PI/2;
  band.rotation.x=0;
 }
 // A copper collar where the bands meet the crown.
 const collar=part(new THREE.TorusGeometry(M.topR+.12,.09,8,6),copper(.35),0,.5+M.bodyHeight+.05);
 collar.rotation.x=Math.PI/2;
 // The crown: a warm gold star that catches the daylight, turning slowly.
 const starShape=new THREE.Shape();
 for(let k=0;k<10;k++){const a=k*Math.PI/5-Math.PI/2,rr=k%2?.3:.72;const px=Math.cos(a)*rr,py=Math.sin(a)*rr;if(k===0)starShape.moveTo(px,py);else starShape.lineTo(px,py);}
 starShape.closePath();
 const starGeo=new THREE.ExtrudeGeometry(starShape,{depth:.22,bevelEnabled:false});
 starGeo.translate(0,0,-.11);
 const starMat=new THREE.MeshStandardMaterial({color:'#ffd98a',roughness:.25,metalness:.4,emissive:new THREE.Color('#ffbe55'),emissiveIntensity:.9});
 for(const yaw of [0,Math.PI/2]){
  const star=new THREE.Mesh(starGeo,starMat);
  star.position.set(0,.5+M.bodyHeight+1.15,0);star.rotation.y=yaw;star.castShadow=true;
  star.userData={landmarkId:BIRTHDAY_MONOLITH_ID,float:true,originY:.5+M.bodyHeight+1.15,phase:.7};
  group.add(star);world.animated.push(star);world.hit.push(star);
 }
 // A rising spiral of small celebration lights around the body.
 for(let k=0;k<12;k++){
  const a=k*Math.PI/4, r=3.1, y=1.1+k*.78;
  const orb=new THREE.Mesh(new THREE.SphereGeometry(.17,10,8),new THREE.MeshBasicMaterial({color:MONOLITH_COLORS[k%6]}));
  orb.position.set(Math.cos(a)*r,y,Math.sin(a)*r);
  orb.userData={landmarkId:BIRTHDAY_MONOLITH_ID,float:true,originY:y,phase:k*.55};
  group.add(orb);world.animated.push(orb);world.hit.push(orb);
 }
 // Colored glass pillars around the base, like candles - color and light, no number.
 MONOLITH_COLORS.forEach((c,k)=>{
  const a=k*Math.PI/3+Math.PI/6, h=1.1+(k%3)*.5;
  part(new THREE.CylinderGeometry(.2,.26,h,8),glass(c),Math.cos(a)*4.2,.5+h/2,Math.sin(a)*4.2);
  part(new THREE.CylinderGeometry(.3,.34,.18,8),copper(.2),Math.cos(a)*4.2,.59,Math.sin(a)*4.2);
 });
 // A festive Hebrew sign at the pad edge facing the city core, in the motif-quarter signage style.
 for(const pz of [-1.05,1.05])part(new THREE.CylinderGeometry(.05,.06,1.05,8),copper(.2),-5.9,1.0,pz);
 const plate=part(new THREE.BoxGeometry(2.5,.68,.07),stone('#e8d9c0'),-5.9,1.8,0);
 plate.rotation.y=Math.PI/2;
 const name=new Text();
 name.text='מונולית יום ההולדת';name.direction='rtl';name.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';
 name.fontSize=.32;name.anchorX='center';name.anchorY='middle';name.color='#4a3418';
 name.position.set(-5.97,1.8,0);name.rotation.y=-Math.PI/2;name.userData.noMerge=true;name.userData.wallSign=true;
 group.add(name);name.sync();
}
