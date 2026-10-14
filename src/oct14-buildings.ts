import * as THREE from 'three';
import {cutRoofWindows} from './underground';
import {detailedSurface,type World} from './world';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
function kit(part:Part,group:THREE.Group,world:World){
 const material=(color:string,metal=false)=>{const m=detailedSurface(metal?'metal':'stone');return new THREE.MeshStandardMaterial({color,map:m.color,normalMap:m.normal,roughnessMap:m.rough,normalScale:new THREE.Vector2(.12,.12),metalness:metal?.4:.08,roughness:metal?.6:.85});};
 const stone=material('#cbb28c'),copper=material('#a87955',true),dark=material('#343334'),glass=new THREE.MeshPhysicalMaterial({color:'#cfe1d6',transparent:true,opacity:.2,roughness:.1,side:THREE.DoubleSide,depthWrite:false});
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material=stone)=>part(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const base=part(new THREE.CylinderGeometry(8.3,8.5,.3,6),stone,0,.2,0);cutRoofWindows(base.geometry,[{x:0,z:-5.4,radius:1.4}]);
 const garden=(x:number,z:number,w:number,d:number)=>{box(w,2.7,d,x,1.8,z,glass);box(w+.1,.12,d+.1,x,3.17,z,copper);for(let k=0;k<3;k++){const px=x+(k-1)*w*.26;box(.65,.25,.65,px,.6,z,dark);world.catalogTree(group,px,.74,z,k,'oct14-garden-'+x+'-'+k,.85);}for(const sx of [-1,1])for(const sz of [-1,1])box(.07,2.8,.07,x+sx*w/2,1.8,z+sz*d/2,copper);};
 const lift=()=>{box(2.6,3.1,2.6,0,2,-5.4,glass);for(const x of [-1.3,1.3])box(.09,3.2,.09,x,2,-5.4,copper);};
 return {box,garden,lift,stone,copper,dark,glass};
}
export function scaleHouse(part:Part,group:THREE.Group,world:World){
 const{box,garden,lift,stone,copper,dark,glass}=kit(part,group,world);
 for(const[x,z,w,d,h]of[[-3.9,-.8,3,5.5,10.2],[0,-.3,4,5.6,7.5],[3.9,-1,3,4.8,5.2]]){box(w,h,d,x,.5+h/2,z);box(w+.3,.2,d+.3,x,.6+h,z,copper);for(let f=0;f<Math.floor(h/1.7);f++){box(w-.4,.9,.07,x,1.5+f*1.7,z+d/2+.05,glass);box(w+.02,.035,d+.02,x,2+f*1.7,z,copper);}for(const dx of [-w/2+.15,w/2-.15])box(.07,h,.07,x+dx,.5+h/2,z+d/2+.06,copper);}
 // A fixed measuring spine, part of the wall, without numbers or a floating ruler.
 box(.55,11.1,.28,-5.48,6.05,2.05,copper);for(let k=0;k<18;k++)box(k%3===0?.42:.22,.04,.08,-5.48,1+k*.55,2.23,dark);
 box(3.7,4.3,2.4,0,2.65,3.7,glass);box(4,.16,2.7,0,4.88,3.7,copper);for(const x of [-1.85,1.85])box(.09,4.4,.09,x,2.65,4.9,copper);box(2.9,.6,.13,0,3.9,4.9,dark);box(1.7,2.2,.06,0,1.6,4.94,glass);box(2.6,.13,1.8,0,.5,6,copper);garden(3.9,3.8,3.2,2.4);lift();
 // Different-size display blocks, not reproductions of real monuments.
 for(const[x,h]of[[-1.1,.7],[0,1.3],[1.1,2]])box(.6,h,.6,x,.5+h/2,3.5,stone);
}
export function tutorialWorkshop(part:Part,group:THREE.Group,world:World){
 const{box,garden,lift,copper,dark,glass}=kit(part,group,world);
 box(8.9,3.6,5.4,0,2.3,-.6);for(let i=0;i<4;i++){const x=-3.4+i*2.2;const roof=box(2.35,.16,5.7,x,4.35,-.6,glass);roof.rotation.z=.28;box(.09,.75,5.65,x+1.1,4.55,-.6,copper);}
 box(2.4,5.1,3.3,-4.3,3.05,-2.1);box(2.7,.17,3.5,-4.3,5.65,-2.1,copper);box(2.9,2.8,3.1,4.3,1.9,-1.8);box(3.1,.17,3.3,4.3,3.4,-1.8,copper);
 for(let k=0;k<7;k++){box(.9,1.2,.07,-3.3+k*1.1,2.1,2.14,glass);box(.05,3.6,.08,-3.8+k*1.25,2.3,2.15,copper);}
 box(2.9,.6,.13,0,3.35,2.18,dark);box(1.6,2.1,.06,0,1.55,2.23,glass);box(2.5,.13,2.2,0,.49,3.4,copper);garden(-3.6,4.2,3.2,2.2);lift();
 for(const x of [-2.5,2.5]){box(1.6,.14,1,x,1.05,.8,copper);box(1.1,.7,.08,x,1.5,.4,dark);}
}
