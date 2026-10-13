import * as THREE from 'three';
const metal=(color:string)=>new THREE.MeshStandardMaterial({color,roughness:.65,metalness:.25});
function board(lines:string[],w:number,h:number){const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const g=c.getContext('2d')!;g.fillStyle='#35403d';g.fillRect(0,0,c.width,c.height);g.strokeStyle='#b79871';g.lineWidth=16;g.strokeRect(10,10,c.width-20,c.height-20);g.fillStyle='#eee1c8';g.textAlign='center';g.textBaseline='middle';g.direction='rtl';g.font=`600 ${Math.floor(c.height/(lines.length+1)*(lines.length===1?1.08:.62))}px sans-serif`;lines.forEach((s,i)=>g.fillText(s,c.width/2,c.height*(i+.7)/lines.length,c.width*.91));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshBasicMaterial({map:t});}
/** Tethered observation and weather concept. Values are illustrative, not telemetry. */
export function addAirship(root:THREE.Group){
 let tower:THREE.Object3D|undefined,highest=-Infinity;
 for(const g of root.children.filter(o=>o.userData.buildingId)){const b=new THREE.Box3().setFromObject(g);if(b.max.y>highest){highest=b.max.y;tower=g;}}
 if(!tower)return;
 const g=new THREE.Group();g.userData={airship:true,noMerge:true};root.add(g);const x=tower.position.x,z=tower.position.z,Y=highest+22;
 const bronze=metal('#9b7552'),steel=metal('#62746e'),fabric=metal('#c8b799'),dark=metal('#333e3d');
 const add=(geo:THREE.BufferGeometry,mat:THREE.Material,px:number,py:number,pz:number)=>{const m=new THREE.Mesh(geo,mat);m.position.set(px,py,pz);m.userData.noMerge=true;m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
 const rod=(a:THREE.Vector3,b:THREE.Vector3,r=.06,mat:THREE.Material=bronze)=>{const d=b.clone().sub(a),m=add(new THREE.CylinderGeometry(r,r,d.length(),6),mat,0,0,0);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());};
 const cx=x+8,cz=z+1;
 const skin=add(new THREE.SphereGeometry(1,48,24),fabric,cx,Y,cz);skin.scale.set(19,5.8,5.8);
 // Subtle longitudinal seams and reinforcing hoops.
 for(let i=-3;i<=3;i++){const xx=i*4.3,rr=6.02*Math.sqrt(1-xx*xx/(19*19));const hoop=add(new THREE.TorusGeometry(rr,.032,4,48),bronze,cx+xx,Y,cz);hoop.rotation.y=Math.PI/2;}
 for(let i=0;i<8;i++){const a=i*Math.PI/4,pts=[];for(let j=0;j<=40;j++){const p=-Math.PI/2+j/40*Math.PI;pts.push(new THREE.Vector3(cx+19*Math.sin(p),Y+6.02*Math.cos(p)*Math.sin(a),cz+6.02*Math.cos(p)*Math.cos(a)));}add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,.025,3,false),bronze,0,0,0);}
 // Tail fins and compact unmanned instrument pod.
 add(new THREE.BoxGeometry(5,.16,7.5),steel,cx-15.5,Y,cz);add(new THREE.BoxGeometry(5,7.5,.16),steel,cx-15.5,Y,cz);
 add(new THREE.BoxGeometry(4.8,1.6,2.3),bronze,cx+1,Y-7.1,cz);
 for(const xx of [-1,1,3])add(new THREE.BoxGeometry(.9,.65,.08),new THREE.MeshBasicMaterial({color:'#738f91'}),cx+xx,Y-7,cz+1.18);
 for(const dx of [-1.7,3.7])for(const dz of [-.8,.8])rod(new THREE.Vector3(cx+dx,Y-5,cz+dz),new THREE.Vector3(cx+dx,Y-6.3,cz+dz),.045);
 add(new THREE.SphereGeometry(.6,16,10),dark,cx+2.6,Y-8.25,cz);
 add(new THREE.CylinderGeometry(.12,.12,3.5,8),steel,cx+4,Y-6.7,cz);
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3;rod(new THREE.Vector3(cx+4,Y-5,cz),new THREE.Vector3(cx+4+Math.cos(a)*.8,Y-5,cz+Math.sin(a)*.8),.035);add(new THREE.SphereGeometry(.18,8,6),bronze,cx+4+Math.cos(a)*.8,Y-5,cz+Math.sin(a)*.8);}
 const dish=add(new THREE.SphereGeometry(.7,16,8,0,Math.PI*2,0,Math.PI/2),steel,cx-1.1,Y-7.9,cz);dish.rotation.z=Math.PI*.7;
 // Signs fixed to the envelope on opposite sides, with proper outward orientation.
 for(const side of [-1,1]){add(new THREE.BoxGeometry(side===1?12:4.9,side===1?3.1:4.9,.18),bronze,cx,Y,cz+side*6.13);const m=add(new THREE.PlaneGeometry(11.7,2.8),side===1?board(['עף על עצמי'],11.7,2.8):dark,cx,Y,cz+side*6.24);if(side===-1){m.rotation.y=Math.PI;const mat=new THREE.MeshBasicMaterial({color:'#ffffff'});m.material=mat;new THREE.TextureLoader().load(import.meta.env.BASE_URL+'airship/1-earth.jpg',t=>{t.colorSpace=THREE.SRGBColorSpace;mat.map=t;mat.needsUpdate=true});m.scale.set(4.6/11.7,4.6/2.8,1);}}
 // Roof winch fixed beside the existing crown, with two bridle cables.
 const anchor=new THREE.Vector3(x+1.2,highest-10,z+1.2);add(new THREE.BoxGeometry(1.4,.6,1.4),steel,anchor.x,anchor.y,anchor.z);rod(anchor,new THREE.Vector3(anchor.x,anchor.y+2,anchor.z),.16);const tip=anchor.clone().add(new THREE.Vector3(0,2,0));
 for(const dx of [-2,4])rod(tip,new THREE.Vector3(cx+dx,Y-8,cz),.075,dark);
 // Weather readout bolted to the tower facade at pedestrian level.
 add(new THREE.BoxGeometry(5.1,2.55,.18),bronze,x, tower.position.y+6.1,z+4.4);
 add(new THREE.PlaneGeometry(4.9,2.35),board(['מצפה רוח ואבק','הדמיה בלבד · לא נתוני אמת','רוח: 8 מ׳/ש׳ · אבק: קל'],4.9,2.35),x,tower.position.y+6.1,z+4.51);
 g.userData.center=[cx,Y,cz];g.userData.anchorBuilding=tower.userData.buildingId;
}
