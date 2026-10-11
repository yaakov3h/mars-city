import * as THREE from 'three';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
export function openingHouse(part:Part,animated:THREE.Object3D[]){
 const stone=new THREE.MeshStandardMaterial({color:'#c9b28f',roughness:.83}),copper=new THREE.MeshStandardMaterial({color:'#a87554',roughness:.57,metalness:.4}),cream=new THREE.MeshStandardMaterial({color:'#e3d3b5',roughness:.75}),rose=new THREE.MeshStandardMaterial({color:'#af7d80',roughness:.74}),glass=new THREE.MeshPhysicalMaterial({color:'#d5e4de',transparent:true,opacity:.19,roughness:.12,side:THREE.DoubleSide,depthWrite:false}),dark=new THREE.MeshStandardMaterial({color:'#37312e',roughness:.8});
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,m=stone)=>part(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 part(new THREE.CylinderGeometry(8,8.2,.3,6),stone,0,.2,0);
 // Unequal curved wings, divided into real window bays rather than solid symbols.
 for(const [cx,cz,rx,rz,h,start,end] of [[-2.7,-.6,3.3,3.9,5.6,.6,4.8],[2.7,-1.4,2.7,3.4,7.1,-1.4,2.8]]){
  for(let k=0;k<18;k++){const a=start+(end-start)*k/18,b=start+(end-start)*(k+1)/18,m=(a+b)/2,x=cx+Math.cos(m)*rx,z=cz+Math.sin(m)*rz,dx=(Math.cos(b)-Math.cos(a))*rx,dz=(Math.sin(b)-Math.sin(a))*rz,len=Math.hypot(dx,dz),yaw=-Math.atan2(dz,dx);
   box(len+.04,.4,.28,x,.55,z,copper).rotation.y=yaw;
   box(len-.06,h-.7,.07,x,.8+(h-.7)/2,z,glass).rotation.y=yaw;
   box(.075,h,.12,cx+Math.cos(a)*rx,.4+h/2,cz+Math.sin(a)*rz,copper).rotation.y=yaw;
   box(len+.1,.28,.72,x,h+.5,z,copper).rotation.y=yaw;
   for(const yy of [2.3,4.1])box(len+.02,.065,.09,x,yy,z,cream).rotation.y=yaw;
  }
  // Roof blades reach towards the shared court; asymmetric heights keep it readable.
  const roof=part(new THREE.CylinderGeometry(1,1,.16,32),copper,cx,h+.65,cz);roof.scale.set(rx+.22,1,rz+.22);
 }
 box(3.9,4.4,.1,0,2.65,3.65,glass);for(const x of [-1.95,1.95])box(.15,4.6,.2,x,2.7,3.65,copper);
 // Two folded wall screens leave the actual doorway open. These are architectural shutters.
 for(const side of [-1,1]){const g=box(1.05,3.6,.16,side*1.65,2.4,3.92,side<0?cream:rose);g.rotation.y=side*.44;g.userData={openingScreen:true,originX:g.position.x,side,noMerge:true};animated.push(g);}
 box(1.9,.16,3.2,0,.5,5.2,copper);box(2.2,.14,2.2,0,.51,-5.4,stone);
 // Independent elevator court and one shared glass-covered garden.
 box(2.7,3,2.7,0,2,-5.4,glass);for(const x of [-1.35,1.35])box(.1,3.1,.1,x,2,-5.4,copper);
 box(3.1,3,2.7,-4.3,1.95,-4.4,glass);box(3.2,.1,2.8,-4.3,3.5,-4.4,copper);
 const green=new THREE.MeshStandardMaterial({color:'#819574',roughness:.95});for(const x of [-5.2,-4.3,-3.4]){box(.58,.2,.58,x,.55,-4.4,dark);part(new THREE.CylinderGeometry(.04,.07,.8,5),copper,x,1.05,-4.4);part(new THREE.IcosahedronGeometry(.43,1),green,x,1.64,-4.4);}
 // Low benches and panel joints make the courtyard inhabited without extra lighting load.
 for(const x of [-2.5,2.5]){box(1.6,.16,.65,x,.9,5.1,cream);for(const dx of [-.55,.55])box(.12,.55,.45,x+dx,.6,5.1,copper);}
 box(3.2,.65,.12,0,4.35,3.73,dark);
}
