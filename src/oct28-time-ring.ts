import * as THREE from 'three';
// Time Ring (טבעת השעות): a slim copper ring that wraps the hub tower with four small dials. Each dial shows the real local time
// of one city (IANA zone) with its name.
export const TIME_RING_HOST_ID='b-travel-hub-20261006';
export const TIME_RING_PLACES=Object.freeze([
 {city:'תל אביב',tz:'Asia/Jerusalem'},
 {city:'מונטריי',tz:'America/Los_Angeles'},
 {city:'רייט-פטרסון',tz:'America/New_York'},
 {city:'סן אנטוניו',tz:'America/Chicago'}
]);
export const TIME_RING={dialW:1.5,dialH:1.8,tube:.1,tiltX:.1,tiltZ:.05,margin:1.2,topDrop:1.5};
export function dialAngles(hours:number,minutes:number){return {hour:((hours%12)+minutes/60)*Math.PI/6,minute:minutes*Math.PI/30};}
export function zoneClock(tz:string,now:Date){
 const p=new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
 return {h:+(p.find(x=>x.type==='hour')?.value??0),m:+(p.find(x=>x.type==='minute')?.value??0)};
}
function paint(c:HTMLCanvasElement,place:{city:string;tz:string},now:Date){
 const x=c.getContext('2d')!,t=zoneClock(place.tz,now),a=dialAngles(t.h,t.m);
 x.clearRect(0,0,256,310);x.fillStyle='#fff4dd';x.beginPath();x.arc(128,128,124,0,7);x.fill();x.strokeStyle='#5a3a22';x.lineWidth=8;x.stroke();
 for(let i=0;i<12;i++){const r=i*Math.PI/6;x.beginPath();x.moveTo(128+Math.sin(r)*105,128-Math.cos(r)*105);x.lineTo(128+Math.sin(r)*118,128-Math.cos(r)*118);x.lineWidth=i%3?4:8;x.stroke();}
 x.lineCap='round';const hand=(r:number,l:number,w:number)=>{x.beginPath();x.moveTo(128,128);x.lineTo(128+Math.sin(r)*l,128-Math.cos(r)*l);x.lineWidth=w;x.stroke();};
 hand(a.hour,62,11);hand(a.minute,92,6);
 x.fillStyle='#2a1a10';x.fillRect(8,262,240,44);x.fillStyle='#ffd9a8';x.font='bold 30px Heebo, Arial, sans-serif';x.textAlign='center';x.textBaseline='middle';x.direction='rtl';
 x.fillText(place.city,128,285,230);
}
export function timeRing(group:THREE.Group,animated:THREE.Object3D[]){
 const R=TIME_RING,copper=new THREE.MeshStandardMaterial({color:'#f8c08b',roughness:.4,metalness:.7,emissive:new THREE.Color('#ff9a45'),emissiveIntensity:.25});
 group.updateWorldMatrix(true,true);
 // Anchor on the hub's tallest part (its tower), not on the whole plot: wrap the ring around that tower near its top.
 const parts=group.children.filter(o=>o instanceof THREE.Mesh).map(o=>{const bx=new THREE.Box3().setFromObject(o);return {bx,c:bx.getCenter(new THREE.Vector3()),sz:bx.getSize(new THREE.Vector3())};});
 const top=parts.reduce((p,q)=>q.bx.max.y>p.bx.max.y?q:p),near=parts.filter(q=>Math.hypot(q.c.x-top.c.x,q.c.z-top.c.z)<.6);
 const half=Math.max(...near.map(q=>Math.max(q.sz.x,q.sz.z)/2)),radius=half+R.margin;
 const cl=group.worldToLocal(new THREE.Vector3(top.c.x,0,top.c.z)),yTop=group.worldToLocal(new THREE.Vector3(top.c.x,top.bx.max.y,top.c.z)).y;
 const ring=new THREE.Group();ring.position.set(cl.x,yTop-R.topDrop,cl.z);ring.rotation.x=R.tiltX;ring.rotation.z=R.tiltZ;ring.userData.timeRing=true;
 const spin=new THREE.Group();ring.add(spin);
 const tor=new THREE.Mesh(new THREE.TorusGeometry(radius,R.tube,12,72),copper);tor.rotation.x=Math.PI/2;tor.userData.noMerge=true;spin.add(tor);
 TIME_RING_PLACES.forEach((pl,i)=>{
  const a=i*Math.PI/2+Math.PI/4,cx=Math.cos(a),cz=Math.sin(a),cv=document.createElement('canvas');cv.width=256;cv.height=310;paint(cv,pl,new Date());
  const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;let last=Date.now();
  const dial=new THREE.Mesh(new THREE.PlaneGeometry(R.dialW,R.dialW*310/256),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,transparent:true}));
  dial.onBeforeRender=()=>{const n=Date.now();if(n-last>20000){last=n;paint(cv,pl,new Date(n));tex.needsUpdate=true;}};
  dial.position.set(cx*radius*1.02,-.35,cz*radius*1.02);dial.lookAt(cx*40,-.35,cz*40);dial.userData.noMerge=true;
  const back=new THREE.Mesh(new THREE.BoxGeometry(R.dialW+.16,R.dialW*310/256+.16,.1),copper);back.position.set(cx*radius,-.35,cz*radius);back.lookAt(cx*40,-.35,cz*40);back.userData.noMerge=true;
  const spoke=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,radius,6),copper);spoke.position.set(cx*radius/2,0,cz*radius/2);spoke.rotation.z=Math.PI/2;spoke.rotation.y=-a;spoke.userData.noMerge=true;
  spin.add(back,dial,spoke);
 });
 spin.userData.spin=true;animated.push(spin);group.add(ring);return ring;
}
