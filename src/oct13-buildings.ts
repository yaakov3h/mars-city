import * as THREE from 'three';
import {cutRoofWindows} from './underground';
import {detailedSurface,type World} from './world';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
function kit(part:Part,group:THREE.Group,world:World){
 const material=(color:string,metal=false)=>{const m=detailedSurface(metal?'metal':'stone');return new THREE.MeshStandardMaterial({color,map:m.color,normalMap:m.normal,roughnessMap:m.rough,normalScale:new THREE.Vector2(.12,.12),metalness:metal?.4:.08,roughness:metal?.6:.85});};
 const stone=material('#cbb28c'),copper=material('#a87955',true),dark=material('#343334'),cream=material('#e5d0a3'),glass=new THREE.MeshPhysicalMaterial({color:'#cfe1d6',transparent:true,opacity:.2,roughness:.1,side:THREE.DoubleSide,depthWrite:false});
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material=stone)=>part(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const base=part(new THREE.CylinderGeometry(8.3,8.5,.3,6),stone,0,.2,0);cutRoofWindows(base.geometry,[{x:0,z:-5.4,radius:1.4}]);
 const garden=(x:number,z:number,w:number,d:number)=>{box(w,2.7,d,x,1.8,z,glass);box(w+.1,.12,d+.1,x,3.17,z,copper);for(let k=0;k<3;k++){const px=x+(k-1)*w*.26;box(.65,.25,.65,px,.6,z,dark);world.catalogTree(group,px,.74,z,k,'oct13-garden-'+x+'-'+k,.85);}for(const sx of [-1,1])for(const sz of [-1,1])box(.07,2.8,.07,x+sx*w/2,1.8,z+sz*d/2,copper);};
 const lift=()=>{box(2.6,3.1,2.6,0,2,-5.4,glass);for(const x of [-1.3,1.3])box(.09,3.2,.09,x,2,-5.4,copper);};
 const bench=(x:number,z:number)=>{box(1.8,.14,.6,x,.9,z,cream);for(const dx of [-.65,.65])box(.1,.5,.4,x+dx,.6,z,copper);};
 return {box,garden,lift,bench,stone,copper,dark,cream,glass};
}
export function professionsObservatory(part:Part,group:THREE.Group,world:World){
 const {box,garden,lift,bench,stone,copper,dark,cream,glass}=kit(part,group,world);
 // Two unequal fan-shaped wings with radial wall seams, framing a recessed analysis hall.
 for(const [x,z,h,rot] of [[-3.7,-.3,5.8,-.25],[3.7,-1,4.6,.22]]){
  const body=part(new THREE.CylinderGeometry(3.25,3.4,h,24,1,false,0,Math.PI*1.32),stone,x,.5+h/2,z);body.rotation.y=rot;
  const roof=part(new THREE.CylinderGeometry(3.45,3.45,.17,24,1,false,0,Math.PI*1.32),copper,x,.58+h,z);roof.rotation.y=rot;
  for(let k=0;k<8;k++){const a=.16+k*.48+rot,wx=x+Math.sin(a)*3.32,wz=z+Math.cos(a)*3.32;const seam=box(.065,h,.08,wx,.55+h/2,wz,copper);seam.rotation.y=a;for(let f=0;f<2;f++){const win=box(.95,.85,.06,wx,1.65+f*1.85,wz,glass);win.rotation.y=a;}}
 }
 box(3.8,4.5,4.8,0,2.75,0,glass);box(4.1,.16,5,0,5.08,0,copper);for(const x of [-1.9,1.9])for(const z of [-2.4,2.4])box(.12,4.6,.12,x,2.75,z,copper);
 for(const x of [-1.4,-.7,0,.7,1.4])box(.06,.16,4.9,x,5.2,0,copper);
 box(2.7,.66,.12,0,3.8,2.38,dark);box(1.6,2.1,.08,0,1.65,2.42,glass);box(2.5,.12,3,0,.49,4,copper);
 // Abstract physical chart panes, not numeric report data.
 for(let k=0;k<4;k++)box(.42,.55+k*.3,.08,-1+k*.65,1.1+k*.15,-.2,cream);
 garden(3.8,4.35,3.2,2.8);bench(-3.9,4.2);lift();
}
export function frequencyIsland(part:Part,group:THREE.Group,world:World){
 const {box,garden,lift,bench,stone,copper,dark,cream,glass}=kit(part,group,world);
 // Three offset rounded rooms. Unequal roof levels, quiet listening courtyard and actual antenna.
 for(const [x,z,r,h] of [[-4,-.2,2.5,3.8],[3.9,-1.5,2.4,4.7],[0,1,3,3.4]]){
  part(new THREE.CylinderGeometry(r,r+.12,h,24),stone,x,.5+h/2,z);part(new THREE.CylinderGeometry(r+.2,r+.2,.17,24),x===0?glass:copper,x,.58+h,z);if(x===0)for(const dx of [-2,-1,0,1,2])box(.06,.14,2*Math.sqrt(r*r-dx*dx),x+dx,.7+h,z,copper);
  for(let k=0;k<12;k++){const a=k*Math.PI/6,wx=x+Math.sin(a)*(r+.02),wz=z+Math.cos(a)*(r+.02);box(.05,h,.05,wx,.5+h/2,wz,copper);const win=box(.75,.95,.07,wx,2,wz,glass);win.rotation.y=a;}
 }
 box(2.7,.64,.15,0,2.8,4.02,dark);box(1.7,2.1,.08,0,1.65,4.08,glass);box(2.6,.12,2.4,0,.49,4.5,copper);
 garden(-3.8,3.6,3.1,2.6);bench(3.9,3.7);lift();
 part(new THREE.CylinderGeometry(.07,.12,2.5,8),copper,3.9,6.6,-1.5);for(const yy of [6.5,7.2])box(1.25,.06,.06,3.9,yy,-1.5,copper);
 // Inhabited bays behind the glazing; no streams, playback controls or credentials.
 for(const x of [-4,3.9]){box(1.25,.14,.8,x,1.05,.5,copper);box(.75,.5,.08,x,1.4,.2,dark);box(.9,.35,.5,x,.75,1.3,cream);}
                       }
