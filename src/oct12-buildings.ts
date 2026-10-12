import {cutRoofWindows} from './underground';
import * as THREE from 'three';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
const stone=new THREE.MeshStandardMaterial({color:'#cbb28c',roughness:.83}),copper=new THREE.MeshStandardMaterial({color:'#a87955',metalness:.42,roughness:.58}),dark=new THREE.MeshStandardMaterial({color:'#343334',roughness:.85}),cream=new THREE.MeshStandardMaterial({color:'#e5d0a3',roughness:.77}),glass=new THREE.MeshPhysicalMaterial({color:'#cfe1d6',transparent:true,opacity:.19,roughness:.1,side:THREE.DoubleSide,depthWrite:false}),teal=new THREE.MeshStandardMaterial({color:'#668e93',roughness:.68,metalness:.2}),green=new THREE.MeshStandardMaterial({color:'#73916b',roughness:.95});
function elements(part:Part){
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material=stone)=>part(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const garden=(x:number,y:number,z:number,w:number,d:number)=>{box(w,2.8,d,x,y+1.4,z,glass);box(w+.1,.12,d+.1,x,y+2.83,z,copper);for(let k=0;k<3;k++){const px=x+(k-1)*w*.28;box(.65,.22,.65,px,y+.15,z,dark);part(new THREE.CylinderGeometry(.05,.08,.8,5),copper,px,y+.65,z);part(new THREE.IcosahedronGeometry(.48,1),green,px,y+1.3,z);}};
 const lift=()=>{box(2.7,3,2.7,0,2,-5.4,glass);for(const x of [-1.35,1.35])box(.1,3.1,.1,x,2,-5.4,copper);};
 return {box,garden,lift};
}
export function viewHouse(part:Part){
 const{box,garden,lift}=elements(part);const base=part(new THREE.CylinderGeometry(8,8.2,.3,6),stone,0,.2,0);cutRoofWindows(base.geometry,[{x:0,z:-5.4,radius:1.4}]);
 // Two stepped solid wings frame the recessed glass information hall.
 for(const [x,z,w,d,h] of [[-3.8,-.4,3.1,6.7,6.8],[3.6,-1.1,3.5,5.3,4.7]]){
  box(w,h,d,x,.5+h/2,z);box(w+.22,.18,d+.22,x,.5+h,z,copper);
  for(let f=0;f<Math.floor(h/1.9);f++){box(w-.45,.95,.06,x,1.4+f*1.9,z+d/2+.035,glass);for(let k=-1;k<=1;k++)box(.075,1,.1,x+k*(w-.4)/3,1.4+f*1.9,z+d/2+.045,copper);}
  for(let f=1;f<h;f++)box(w+.025,.03,d+.025,x,.55+f,z,copper);
 }
 box(4.2,5.7,4.9,0,3.35,-.7,glass);box(4.5,.18,5.2,0,6.3,-.7,copper);
 for(const x of [-2.1,2.1])for(const z of [-3.15,1.75])box(.13,5.8,.13,x,3.35,z,copper);
 for(const yy of [2.4,4.3])box(4.25,.07,.08,0,yy,1.8,copper);
 box(2.4,2.5,.1,0,1.75,1.9,dark);box(1.6,2.2,.06,0,1.6,1.97,glass);box(2.5,.65,.12,0,4.1,1.87,dark);
 box(2.6,.13,3.3,0,.49,3.45,copper);garden(3.6,5,-1.1,3.2,4.2);lift();
 for(const x of [-3.5,3.5]){box(2,.15,.65,x,.9,4.2,cream);for(const dx of [-.6,.6])box(.12,.55,.4,x+dx,.6,4.2,copper);}
}
export function spatialLab(part:Part){
 const{box,garden,lift}=elements(part);const base=part(new THREE.CylinderGeometry(8,8.2,.3,6),stone,0,.2,0);cutRoofWindows(base.geometry,[{x:0,z:-5.4,radius:1.4}]);
 // Offset sloped wings around a transparent test chamber, not six repeated cells.
 for(const [x,z,w,d,h,angle] of [[-3.9,-1.1,2.8,5.6,6.6,.23],[3.7,-.7,3.2,4.4,4.5,-.2]]){
  const wall=box(w,h,d,x,.5+h/2,z);wall.rotation.y=angle;
  const roof=box(w+.3,.2,d+.3,x,h+.65,z,copper);roof.rotation.y=angle;roof.rotation.z=angle*.35;
  for(let f=0;f<3;f++){const win=box(w-.45,.8,.065,x,1.4+f*1.6,z+d/2+.1,glass);win.rotation.y=angle;}
  for(let k=0;k<6;k++){const rib=box(.08,h+.1,.08,x+(k-2.5)*w/6,.55+h/2,z+d/2+.12,copper);rib.rotation.y=angle;}
 }
 box(4.1,3.7,4.6,0,2.35,.3,glass);box(4.4,.16,4.8,0,4.28,.3,copper);
 for(const x of [-2,2])for(const z of [-2,2.6])box(.12,3.8,.12,x,2.35,z,copper);
 // Small geometric model on a physical pedestal; no private source image or model.
 part(new THREE.CylinderGeometry(1,1.2,.6,8),stone,0,.8,.3);part(new THREE.OctahedronGeometry(.85),teal,0,1.9,.3);
 box(2.6,.6,.12,0,3.3,2.69,dark);box(1.5,2.1,.05,0,1.6,2.72,glass);box(2,.13,2.8,0,.5,4.2,copper);
 garden(-4.5,.5,-4.7,2.8,2.4);lift();
 for(const x of [-3.1,3.1]){box(1.5,.16,.6,x,.9,4.1,cream);box(.13,.65,.5,x-.5,.55,4.1,copper);box(.13,.65,.5,x+.5,.55,4.1,copper);}
}
