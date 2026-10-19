import * as THREE from 'three';
import {Text} from 'troika-three-text';
import {cutRoofWindows} from './underground';
import {detailedSurface,type World} from './world';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
function kit(part:Part,g:THREE.Group,w:World){
 const mat=(color:string,kind:'stone'|'metal'='stone')=>{const s=detailedSurface(kind);return new THREE.MeshStandardMaterial({color,map:s.color,normalMap:s.normal,roughnessMap:s.rough,normalScale:new THREE.Vector2(.12,.12),roughness:.75,metalness:kind==='metal'?.4:.06});};
 const stone=mat('#cbb28c'),copper=mat('#a87955','metal'),dark=mat('#343334'),glass=new THREE.MeshPhysicalMaterial({color:'#cfe1d6',transparent:true,opacity:.18,roughness:.12,side:THREE.DoubleSide,depthWrite:false});
 const box=(a:number,b:number,c:number,x:number,y:number,z:number,m:THREE.Material=stone)=>part(new THREE.BoxGeometry(a,b,c),m,x,y,z);
 const rod=(a:THREE.Vector3,b:THREE.Vector3,r=.065,m:THREE.Material=copper)=>{const d=b.clone().sub(a),o=part(new THREE.CylinderGeometry(r,r,d.length(),8),m,...a.clone().add(b).multiplyScalar(.5).toArray() as [number,number,number]);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;};
 const v=(x:number,y:number,z:number)=>new THREE.Vector3(x,y,z);
 const base=part(new THREE.CylinderGeometry(8.3,8.5,.3,6),stone,0,.2,0);cutRoofWindows(base.geometry,[{x:0,z:-5.4,radius:1.4}]);
 const lift=()=>{box(2.6,3,2.6,0,2,-5.4,glass);for(const x of [-1.3,1.3])box(.08,3.2,.08,x,2,-5.4,copper);};
 const garden=(x:number,z:number,ww:number,dd:number,y=.5)=>{box(ww,2.7,dd,x,y+1.35,z,glass);box(ww+.1,.1,dd+.1,x,y+2.73,z,copper);for(let i=0;i<3;i++){const xx=x+(i-1)*ww*.27;box(.6,.2,.6,xx,y+.1,z,dark);w.catalogTree(g,xx,y+.2,z,i,'oct19-garden-'+x+'-'+i,.8);}for(const dx of [-ww/2,ww/2])for(const dz of [-dd/2,dd/2])rod(v(x+dx,y,z+dz),v(x+dx,y+2.7,z+dz),.045);};
 return {stone,copper,dark,glass,box,rod,v,lift,garden};
}
function hebrew(g:THREE.Group,text:string,size:number,color:string,x:number,y:number,z:number,yaw=0){
 const t=new Text();t.text=text;t.direction='rtl';t.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';t.fontSize=size;t.anchorX='center';t.anchorY='middle';t.color=color;t.position.set(x,y,z);t.rotation.y=yaw;t.userData.noMerge=true;g.add(t);t.sync();return t;
}
export function civicAssembly(part:Part,g:THREE.Group,w:World){
 const{stone,copper,dark,glass,box,rod,v,lift,garden}=kit(part,g,w);
 const glow=new THREE.MeshBasicMaterial({color:'#fff3d6'});

  // Design A: a low stepped assembly rotunda with an open oculus and a ring of ballot lights.
  for(let i=0;i<3;i++)part(new THREE.CylinderGeometry(6.2-i*1.3,6.35-i*1.3,.56,28),stone,0,.56+i*.55,0);
  // Twelve slim columns carry the copper ring beam.
  for(let i=0;i<12;i++){const a=i*Math.PI/6;part(new THREE.CylinderGeometry(.14,.18,3.1,10),stone,Math.cos(a)*6.55,2.9,Math.sin(a)*6.55);}
  const beam=part(new THREE.TorusGeometry(6.55,.16,8,44),copper,0,4.52,0);beam.rotation.x=Math.PI/2;
  // A glazed dome ring rises from the beam and stops short, leaving the oculus open to the sky.
  const dome=part(new THREE.SphereGeometry(6.1,28,12,0,Math.PI*2,.42,Math.PI/2-.42),glass,0,4.55,0);
  const rim=part(new THREE.TorusGeometry(6.1*Math.sin(.42),.09,8,36),copper,0,4.55+6.1*Math.cos(.42),0);rim.rotation.x=Math.PI/2;
  // Sixteen ballot lights circle the frieze: every voice counted, none named.
  for(let i=0;i<16;i++){const a=i*Math.PI/8+Math.PI/16;part(new THREE.SphereGeometry(.12,10,8),glow,Math.cos(a)*6.55,4.28,Math.sin(a)*6.55);}
  // The central speaking dais under the open eye holds a single glowing ballot sphere.
  part(new THREE.CylinderGeometry(1.15,1.3,.42,18),stone,0,2.1,0);
  part(new THREE.CylinderGeometry(.16,.22,1.05,10),copper,0,2.8,0);
  part(new THREE.SphereGeometry(.3,16,12),glow,0,3.62,0);
  part(new THREE.TorusGeometry(.44,.04,8,24),copper,0,3.62,0).rotation.x=Math.PI/2;
  // A small engraved lectern faces the dais from the entrance side.
  box(.7,1.05,.5,0,2.15,2.2,stone);box(.78,.08,.58,0,2.72,2.2,copper);
  // Sign band sits on the front beam between the two entrance columns.
  box(3.4,.62,.14,0,3.95,6.62,dark);
  // Entrance steps and two glazed planters framing the walk.
  box(3.4,.18,1.2,0,.44,7.3,stone);box(2.8,.18,.8,0,.62,7,stone);
  garden(4.9,4.6,2.4,2);garden(-4.9,4.6,2.4,2);

 lift();
}
export function oct19Room(root:THREE.Group,cx:number,fy:number,cz:number){
 const mat=(c:string)=>new THREE.MeshStandardMaterial({color:c,roughness:.8});const bronze=mat('#a87955'),stone=mat('#cbb28c'),dark=mat('#343334');const glow=new THREE.MeshBasicMaterial({color:'#ffd899'});
 const glass=new THREE.MeshPhysicalMaterial({color:'#cfe1d6',transparent:true,opacity:.22,roughness:.12,side:THREE.DoubleSide,depthWrite:false});
 const box=(a:number,b:number,c:number,x:number,y:number,z:number,m:THREE.Material=stone)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(a,b,c),m);o.position.set(cx+x,fy+y,cz+z);root.add(o);return o;};
 const mesh=(geo:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number)=>{const o=new THREE.Mesh(geo,m);o.position.set(cx+x,fy+y,cz+z);root.add(o);return o;};
 const art=document.createElement('canvas');art.width=1200;art.height=600;const p=art.getContext('2d')!;p.fillStyle='#e5d4b5';p.fillRect(0,0,1200,600);
 p.strokeStyle='#5c5348';p.lineWidth=7;p.strokeRect(28,28,1144,544);

  // The archive mural: concentric voting rings with abstract tally marks, no names and no parties.
  for(let k=0;k<4;k++){p.strokeStyle=['#a87955','#647e79','#a88d62','#b67650'][k];p.lineWidth=8-k;p.beginPath();p.arc(600,300,60+k*58,0,7);p.stroke();}
  p.strokeStyle='#5c5348';p.lineWidth=9;for(let i=0;i<24;i++){const a=i*Math.PI/12,r=60+(i%4)*58;p.beginPath();p.moveTo(600+Math.cos(a)*r,300+Math.sin(a)*r);p.lineTo(600+Math.cos(a)*(r+26),300+Math.sin(a)*(r+26));p.stroke();}
  // A ring of twelve engraved decision tablets watches over the chamber.
  for(let i=0;i<12;i++){const a=i*Math.PI/6+.26,px=Math.cos(a)*4.35,pz=Math.sin(a)*4.35;
   box(.62,.92,.08,px,1.5,pz,dark).rotation.y=-a+Math.PI/2;box(.5,.08,.09,px,1.28,pz,glow).rotation.y=-a+Math.PI/2;}
  // The round table of the archive keeps one glowing ballot sphere at its heart.
  mesh(new THREE.CylinderGeometry(1.35,1.35,.12,20),bronze,0,.92,0);
  for(const a of [0,2.1,4.2])box(.14,.9,.14,Math.cos(a)*.85,.45,Math.sin(a)*.85,dark);
  mesh(new THREE.SphereGeometry(.19,12,10),glow,0,1.16,0);
  for(const dz of [-2.6,2.6]){box(1.7,.14,.6,-3.5,.45,dz,stone);box(.14,.4,.5,-4,.22,dz,stone);box(.14,.4,.5,-3,.22,dz,stone);}

 const t=new THREE.CanvasTexture(art);t.colorSpace=THREE.SRGBColorSpace;box(5.3,2.75,.12,0,2.2,5.52,bronze);const panel=new THREE.Mesh(new THREE.PlaneGeometry(5.05,2.52),new THREE.MeshBasicMaterial({map:t}));panel.rotation.y=Math.PI;panel.position.set(cx,fy+2.2,cz+5.43);root.add(panel);
 // The chamber creed, kept abstract: assembly, every voice counted, decisions engraved.
 const lines=['ארכיון ההכרעות','כל קול נספר ונשמר','החלטות העיר נחקקות כאן'];
 box(4.4,2.5,.1,0,2.2,-5.52,dark);
 lines.forEach((s,i)=>{const tx=new Text();tx.text=s;tx.direction='rtl';tx.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';tx.fontSize=i?0.26:0.3;tx.anchorX='center';tx.anchorY='middle';tx.color=i?'#f2ead8':'#ffd899';tx.position.set(cx,fy+3.1-i*.44,cz-5.43);tx.userData.noMerge=true;root.add(tx);tx.sync();});
}
