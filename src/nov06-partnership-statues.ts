import * as THREE from 'three';
import {Text} from 'troika-three-text';

// Rooftop restoration of the two partnership statues (the cat with turquoise glasses and the
// amber robot) that stood in the removed shared underground room. They now stand on the roof
// of the motif house that carries the monuments floor, visible again above ground.
export function partnerStatues(group:THREE.Group,x:number,y:number,z:number):void{
 const S=1.5;
 const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(S);group.add(g);
 const put=(geo:THREE.BufferGeometry,m:THREE.Material,px:number,py:number,pz:number,rotY=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(px,py,pz);if(rotY)o.rotation.y=rotY;o.userData.noMerge=true;g.add(o);return o};
 const ivory=new THREE.MeshStandardMaterial({color:'#e7dcc6',roughness:.7});
 const stage=new THREE.MeshStandardMaterial({color:'#8a7d6b',roughness:.8});
 put(new THREE.CylinderGeometry(1.65,1.78,.25,6),stage,0,.125,0);
 const half=(ts:number,col:string)=>{const h=new THREE.Mesh(new THREE.CircleGeometry(1.58,6,ts,Math.PI),new THREE.MeshBasicMaterial({color:col}));h.rotation.x=-Math.PI/2;h.position.y=.256;h.userData.noMerge=true;g.add(h)};
 half(Math.PI/2,'#2fb8aa');half(-Math.PI/2,'#d08a22');
 const baseH=.45,white=new THREE.MeshBasicMaterial({color:'#ffffff'}),ink=new THREE.MeshBasicMaterial({color:'#1d1612'});
 for(const s of [-1,1])put(new THREE.CylinderGeometry(.45,.49,baseH,6),ivory,s*.65,.25+baseH/2,0);
 const figure=(fx:number,yaw:number)=>{const f=new THREE.Group();f.position.set(fx,.25+baseH,0);f.rotation.y=yaw;g.add(f);return f};
 const pf=(f:THREE.Group,geo:THREE.BufferGeometry,m:THREE.Material,px:number,py:number,pz:number)=>{const o=new THREE.Mesh(geo,m);o.position.set(px,py,pz);o.userData.noMerge=true;f.add(o);return o};
 // cat with turquoise glasses (west)
 {const f=figure(-.65,Math.PI-.2),fur=new THREE.MeshStandardMaterial({color:'#ffe6d2',roughness:.6,emissive:'#ffd7bd',emissiveIntensity:.25}),ear=new THREE.MeshStandardMaterial({color:'#f7b3c2',emissive:'#f7b3c2',emissiveIntensity:.2}),rim=new THREE.MeshBasicMaterial({color:'#1f8f84'});
  pf(f,new THREE.CapsuleGeometry(.2,.3,4,12),fur,0,.3,0);
  pf(f,new THREE.SphereGeometry(.31,22,16),fur,0,.74,0).scale.set(1.12,.95,1);
  for(const e of [-1,1]){pf(f,new THREE.ConeGeometry(.12,.26,3),fur,e*.2,1.04,0).rotation.z=-e*.25;
   pf(f,new THREE.ConeGeometry(.06,.14,3),ear,e*.2,1.03,.03).rotation.z=-e*.25;
   pf(f,new THREE.CircleGeometry(.115,20),white,e*.135,.77,.305);
   pf(f,new THREE.TorusGeometry(.12,.025,8,24),rim,e*.135,.77,.31);
   pf(f,new THREE.CircleGeometry(.04,12),ink,e*.135,.77,.32);}
  pf(f,new THREE.BoxGeometry(.06,.025,.02),rim,0,.8,.315);
  pf(f,new THREE.ConeGeometry(.035,.04,3),ear,0,.68,.318).rotation.x=Math.PI;
  pf(f,new THREE.TorusGeometry(.2,.04,8,16,Math.PI*1.2),fur,0,.28,-.2).rotation.y=Math.PI/2;}
 // amber robot with white visor, dark eyes and antenna (east)
 {const f=figure(.65,Math.PI+.2),metal=new THREE.MeshStandardMaterial({color:'#E8A23A',roughness:.45,metalness:.15,emissive:'#E8A23A',emissiveIntensity:.3}),brown=new THREE.MeshBasicMaterial({color:'#805920'});
  pf(f,new THREE.BoxGeometry(.5,.46,.36),metal,0,.26,0);
  pf(f,new THREE.CylinderGeometry(.07,.07,.08,8),brown,0,.53,0);
  pf(f,new THREE.BoxGeometry(.54,.44,.4),metal,0,.8,0);
  pf(f,new THREE.BoxGeometry(.4,.2,.02),white,0,.82,.205);
  for(const e of [-1,1]){pf(f,new THREE.CircleGeometry(.05,14),ink,e*.1,.82,.217);pf(f,new THREE.BoxGeometry(.06,.14,.1),brown,e*.3,.8,0)}
  pf(f,new THREE.BoxGeometry(.2,.02,.02),white,0,.62,.205);
  pf(f,new THREE.CylinderGeometry(.015,.015,.14,6),brown,0,1.09,0);
  pf(f,new THREE.SphereGeometry(.06,12,10),metal,0,1.17,0);}
 // small sign at the stage front
 const sign=new Text();sign.text='פסלי השותפות';sign.direction='rtl';sign.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';sign.fontSize=.3;sign.anchorX='center';sign.anchorY='middle';sign.color='#2e2a26';sign.position.set(0,.62,-1.91);sign.rotation.y=Math.PI;sign.userData.noMerge=true;sign.userData.wallSign=true;sign.sync();g.add(sign);
 const plate=new THREE.Mesh(new THREE.BoxGeometry(2.1,.44,.06),new THREE.MeshStandardMaterial({color:'#f4e6cc',roughness:.8}));plate.position.set(0,.62,-1.78);plate.userData.noMerge=true;g.add(plate);
}
