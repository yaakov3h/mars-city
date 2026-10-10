import * as THREE from 'three';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
const stone=new THREE.MeshStandardMaterial({color:'#cbb28c',roughness:.83}),copper=new THREE.MeshStandardMaterial({color:'#a87955',metalness:.42,roughness:.58}),dark=new THREE.MeshStandardMaterial({color:'#343334',roughness:.85}),warm=new THREE.MeshBasicMaterial({color:'#e5d0a3'}),glass=new THREE.MeshPhysicalMaterial({color:'#cfe1d6',transparent:true,opacity:.14,roughness:.1,side:THREE.DoubleSide,depthWrite:false});
export function preparationHouse(part:Part){
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material=stone)=>part(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 part(new THREE.CylinderGeometry(7.9,8.2,.4,6),stone,0,.25,0);
 // Three stepped working halls, with one clear central approach and a side lift court.
 for(const [x,z,w,d,h] of [[-3.8,-.3,3,6.7,7.8],[0,-.7,3.4,7,10.2],[3.8,-1.4,3,5.9,6.1]]){
  box(w,h,d,x,.5+h/2,z);box(w+.18,.18,d+.18,x,.5+h,z,copper);
  for(let f=0;f<Math.floor(h/2.3);f++){
   box(w-.5,1.05,.06,x,1.5+f*2.3,z+d/2+.035,glass);
   for(let k=-1;k<=1;k++)box(.08,1.16,.1,x+k*(w-.5)/3,1.5+f*2.3,z+d/2+.045,copper);
   box(w-.45,.06,.06,x,1.02+f*2.3,z+d/2+.07,warm);
  }
  for(let f=1;f<h/1.1;f++)box(w+.035,.035,d+.035,x,.55+f*1.1,z,copper);
 }
 box(2.8,2.65,.1,0,1.83,2.85,dark);box(1.7,2.25,.07,0,1.61,2.93,glass);
 box(2.8,.12,2.8,0,.49,4.2,copper);
 // Enclosed side garden, not open vegetation.
 box(2.2,2.8,3.6,-5.9,1.9,-1.8,glass);box(2.3,.1,3.7,-5.9,3.35,-1.8,copper);
 for(const z of [-2.8,-1.6,-.4]){box(.6,.25,.6,-5.9,.62,z,dark);part(new THREE.CylinderGeometry(.045,.075,.75,5),copper,-5.9,1.11,z);part(new THREE.IcosahedronGeometry(.42,1),new THREE.MeshStandardMaterial({color:'#73916b',roughness:.95}),-5.9,1.65,z);}
 // Side elevator sits inside its own entrance court, leaving the front doors free.
 box(2.7,3,2.7,0,2.1,-5.4,glass);for(const x of [-1.35,1.35])box(.09,3.1,.1,x,2.05,-5.4,copper);
}
export function imageStudioAddition(part:Part){
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material=stone)=>part(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 // Original pavilion remains below. New roof studio is smaller than its existing protected garden.
 box(3.45,.18,2.55,0,2.18,0,copper);box(3.2,1.8,.1,0,3.14,-1.13,dark);
 for(const x of [-1.55,1.55])box(.1,1.8,2.4,x,3.14,0,glass);
 box(3.2,1.8,.06,0,3.14,1.18,glass);box(3.5,.15,2.65,0,4.08,0,copper);
 for(const x of [-1.6,1.6])for(const z of [-1.2,1.2])box(.09,1.9,.09,x,3.13,z,copper);
 box(1.8,1.1,.035,0,3.1,-1.06,warm);
 for(const x of [-.8,.8]){box(.05,1.1,.06,x,2.83,.3,copper);const panel=box(.6,.9,.05,x,3.32,.3,warm);panel.rotation.y=x*.2;}
 box(.9,.12,.5,0,2.8,.62,dark);
}
export function presenceHouse(part:Part,group:THREE.Group){
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material=stone)=>part(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 part(new THREE.CylinderGeometry(7.8,8.1,.4,6),stone,0,.25,0);
 for(const [x,z,r,h] of [[-3,-1,2.4,9],[1.3,-1.5,2.4,13],[3.1,2.1,2.3,6.5]]){
  part(new THREE.CylinderGeometry(r,r,h,12),stone,x,.5+h/2,z);
  for(let f=0;f<h/2;f++){part(new THREE.CylinderGeometry(r+.08,r+.08,.13,12),copper,x,.7+f*2,z);for(let k=0;k<7;k++){const a=k*.7;const win=box(.65,1.1,.06,x+Math.cos(a)*r,.5+f*2+1,z+Math.sin(a)*r,glass);win.rotation.y=-a+Math.PI/2;}}
  part(new THREE.CylinderGeometry(r+.13,r+.13,.2,12),copper,x,.6+h,z);
 }
 box(3.5,6.5,3.3,-.4,3.7,1.8,glass);for(const x of [-2.1,1.3])box(.12,6.7,.12,x,3.7,3.45,copper);
 box(2.7,2.9,2.7,0,2,-5.4,glass);
 // Requested Instagram image is a framed detail on the gallery, not an implied endorsement.
 const frame=box(1.65,1.65,.12,-3,5.9,1.43,dark);
 const logo=new THREE.Mesh(new THREE.PlaneGeometry(1.45,1.45),new THREE.MeshBasicMaterial({color:0xffffff}));logo.position.set(-3,5.9,1.5);group.add(logo);logo.userData.noMerge=true;
 new THREE.TextureLoader().load(import.meta.env.BASE_URL+'brand/instagram.png',t=>{t.colorSpace=THREE.SRGBColorSpace;(logo.material as THREE.MeshBasicMaterial).map=t;(logo.material as THREE.MeshBasicMaterial).needsUpdate=true});
 // Planting under a single glass-covered garden court.
 box(3.6,3.2,3.2,-4.7,2.1,-4.6,glass);box(3.7,.1,3.3,-4.7,3.75,-4.6,copper);
 for(const x of [-5.6,-4.6,-3.7]){box(.6,.25,.6,x,.65,-4.6,dark);part(new THREE.CylinderGeometry(.045,.07,.8,5),copper,x,1.15,-4.6);part(new THREE.IcosahedronGeometry(.4,1),new THREE.MeshStandardMaterial({color:'#79986e'}),x,1.75,-4.6);}
}
