import * as THREE from 'three';
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
 const garden=(x:number,z:number,ww:number,dd:number,y=.5)=>{box(ww,2.7,dd,x,y+1.35,z,glass);box(ww+.1,.1,dd+.1,x,y+2.73,z,copper);for(let i=0;i<3;i++){const xx=x+(i-1)*ww*.27;box(.6,.2,.6,xx,y+.1,z,dark);w.catalogTree(g,xx,y+.2,z,i,'evening-garden-'+x+'-'+i,.8);}for(const dx of [-ww/2,ww/2])for(const dz of [-dd/2,dd/2])rod(v(x+dx,y,z+dz),v(x+dx,y+2.7,z+dz),.045);};
 return {stone,copper,dark,glass,box,rod,v,lift,garden};
}
export function linksHouse(part:Part,g:THREE.Group,w:World){
 const{stone,copper,dark,glass,box,rod,v,lift,garden}=kit(part,g,w);
 // Three unequal reading volumes. The tall central drum has a real roof opening.
 const cx=-.8,cz=-.6,R=3.55;
 part(new THREE.CylinderGeometry(R,R,.2,48),stone,cx,.65,cz);
 for(let i=0;i<16;i++){const a=i*Math.PI/8,x=cx+Math.sin(a)*R,z=cz+Math.cos(a)*R;rod(v(x,.75,z),v(x,5.35,z),.065);const pane=part(new THREE.PlaneGeometry(1.32,4.2),i%4===0?stone:glass,x,2.95,z);pane.rotation.y=a;}
 const shape=new THREE.Shape();shape.absarc(0,0,3.9,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(.45,.1,1.65,0,Math.PI*2,true);shape.holes.push(hole);
 const roof=part(new THREE.ExtrudeGeometry(shape,{depth:.22,bevelEnabled:false,curveSegments:48}),copper,cx,5.42,cz);roof.rotation.x=-Math.PI/2;
 const dome=part(new THREE.SphereGeometry(1.65,32,16,0,Math.PI*2,0,Math.PI/2),glass,cx+.45,5.44,cz-.1);dome.scale.y=.45;dome.userData.skylight=true;
 for(let i=0;i<8;i++){const a=i*Math.PI/4;rod(v(cx+.45+Math.cos(a)*1.65,5.5,cz-.1+Math.sin(a)*1.65),v(cx+.45,6.2,cz-.1),.04);}
 // Daylight falls on the central reading table through the glazed oculus.
 const table=part(new THREE.CylinderGeometry(1.0,1,.16,24),dark,cx,.98,cz);for(let i=0;i<5;i++){const a=i*1.256;box(.65,.4,.65,cx+Math.cos(a)*1.8,.9,cz+Math.sin(a)*1.8,copper);}
 for(const[x,z,ww,dd,h,ang]of[[-4.7,2.6,3.2,3.5,3.2,-.3],[3.5,1.2,3.6,4,4.1,.2]]){const body=box(ww,h,dd,x,.6+h/2,z);body.rotation.y=ang;const cap=box(ww+.35,.18,dd+.35,x,h+.75,z,copper);cap.rotation.y=ang;const pane=box(ww-.35,1.7,.06,x,2,z+dd/2+.1,glass);pane.rotation.y=ang;}
 box(3.2,2.6,1.5,-.5,1.85,3.8,glass);box(3.6,.16,1.9,-.5,3.22,3.8,copper);box(3.1,.58,.13,-.5,3.05,4.78,dark);box(2.7,.12,1.6,-.5,.5,5.1,copper);
 // Small angled glazed links are structural, not floating labels.
 for(const[x,z,a]of[[-3.2,1.4,-.6],[2.1,.3,.3]]){const link=box(2.1,2.25,1.25,x,1.75,z,glass);link.rotation.y=a;const cap=box(2.3,.1,1.4,x,2.93,z,copper);cap.rotation.y=a;}
 garden(3.6,4.5,3.1,2);lift();
}
export function launchHouse(part:Part,g:THREE.Group,w:World){
 const{stone,copper,dark,glass,box,rod,v,lift,garden}=kit(part,g,w);
 // Unequal slender wings, folded sloping roofs, and an occupied skybridge.
 for(const[x,z,ww,dd,h,tilt]of[[-3.9,-.9,3.1,5.2,10.8,-.22],[3.6,-1.4,3,4.5,7.7,.28]]){
 box(ww,h,dd,x,.6+h/2,z);const cap=box(ww+.7,.22,dd+.6,x,h+.85,z,copper);cap.rotation.z=tilt;
 for(let f=0;f<Math.floor(h/1.8);f++){box(ww-.45,1.1,.08,x,1.6+f*1.8,z+dd/2+.06,glass);box(ww+.08,.045,.08,x,2.24+f*1.8,z+dd/2+.13,copper);}
 for(const dx of [-ww/2,ww/2])rod(v(x+dx,.65,z+dd/2+.15),v(x+dx,h+.5,z+dd/2+.15),.045);
 // Diagonal exterior ribs carry the folded roof without a plain-box silhouette.
 for(const side of [-1,1]){const xx=x+side*(ww/2+.12);rod(v(xx,.8,z-dd/2),v(xx,h*.5,z+dd/2),.09,copper);rod(v(xx,h*.5,z+dd/2),v(xx,h+.4,z-dd/2),.09,copper);}
 }
 box(4.8,.27,2.1,0,6.1,.1,copper);box(4.8,2,2.1,0,7.2,.1,glass);box(5.1,.18,2.35,0,8.28,.1,copper);
 for(const z of [-1.05,1.25]){rod(v(-2.4,6.25,z),v(2.4,8.15,z),.085,dark);rod(v(-2.4,8.15,z),v(2.4,6.25,z),.085,dark);}
 // Broad split stair and sheltered forecourt beneath the bridge.
 for(let i=0;i<5;i++)box(3.8-i*.15,.14,3.5-i*.5,0,.53+i*.14,3.6+i*.1,copper);
 box(3.3,3.1,1.6,0,2.8,2.5,glass);box(3.8,.18,1.9,0,4.47,2.5,copper);box(3.1,.58,.13,0,4.1,3.52,dark);
 // Lower terraces carry a shared glazed garden, not exterior vegetation.
 garden(-3.9,3.8,3.1,2.6);garden(3.8,3.7,2.7,2.5);lift();
}
export function eveningRoom(root:THREE.Group,cx:number,fy:number,cz:number,links:boolean){
 const mat=(c:string)=>new THREE.MeshStandardMaterial({color:c,roughness:.8});const bronze=mat('#a87955'),stone=mat('#cbb28c'),dark=mat('#343334');
 const box=(a:number,b:number,c:number,x:number,y:number,z:number,m:THREE.Material=stone)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(a,b,c),m);o.position.set(cx+x,fy+y,cz+z);root.add(o);return o;};
 const art=document.createElement('canvas');art.width=1200;art.height=600;const p=art.getContext('2d')!;p.fillStyle='#e5d4b5';p.fillRect(0,0,1200,600);
 if(links){p.strokeStyle='#657c75';p.lineWidth=12;const nodes=[[600,305],[250,150],[950,150],[260,440],[940,445],[600,80]];for(const[x,y]of nodes.slice(1)){p.beginPath();p.moveTo(600,305);p.bezierCurveTo(600,y,x,305,x,y);p.stroke();}for(let i=0;i<nodes.length;i++){const[x,y]=nodes[i];p.fillStyle=['#b67650','#647e79','#a88d62'][i%3];p.beginPath();p.arc(x,y,i===0?65:43,0,6.3);p.fill();}for(const x of [-2.2,2.2]){box(1.8,.42,.8,x,.45,1.3,bronze);box(1.8,.7,.2,x,.85,1.65,dark);}box(1.5,.12,1.1,0,.6,1.0,bronze);}
 else{p.strokeStyle='#778e89';p.lineWidth=10;p.beginPath();p.moveTo(210,295);p.lineTo(1000,295);p.stroke();for(let i=0;i<3;i++){const x=130+i*370;p.fillStyle=['#a87955','#7a8d89','#c0a475'][i];p.fillRect(x,185,250,210);p.fillRect(x,155,110,40);p.fillStyle='#f0e3c6';for(let j=0;j<3;j++)p.fillRect(x+30,220+j*46,190-j*30,12);}for(const x of [-2.6,0,2.6]){box(1.7,.15,1,x,.9,1.2,bronze);box(1.2,.75,.08,x,1.4,.8,dark);box(.15,.8,.7,x-.65,.4,1.2,stone);}}
 const t=new THREE.CanvasTexture(art);t.colorSpace=THREE.SRGBColorSpace;box(5.3,2.75,.12,0,2.2,5.52,bronze);const panel=new THREE.Mesh(new THREE.PlaneGeometry(5.05,2.52),new THREE.MeshBasicMaterial({map:t}));panel.rotation.y=Math.PI;panel.position.set(cx,fy+2.2,cz+5.43);root.add(panel);
 // Differentiated built-in furniture leaves the central cross route free.
 if(links){for(const x of [-4,4]){box(.65,2.7,2.4,x,1.35,-.4,dark);for(let j=0;j<4;j++)box(.8,.09,2.5,x,.5+j*.6,-.4,bronze);}}
 else{for(const x of [-4,4])for(let i=0;i<3;i++)box(.8,.8,.8,x,.45+i*.95,-1.4,bronze);}
}
