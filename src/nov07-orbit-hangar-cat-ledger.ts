import * as THREE from 'three';
import {Text} from 'troika-three-text';
import {detailedSurface,type World} from './world';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
// Two above-ground buildings from the 6.11 build, ported onto the converted city (7.11): both stand fully on the surface
// in the permanent daylight with nothing below the surface, and each is at most two storeys tall. They keep the
// warm amber-copper bodies of their neighbours and add bright Mars enamel accents (coral, saffron, teal, terracotta).
export const MARS_ENAMEL=Object.freeze({coral:'#ff6f59',saffron:'#ffc145',teal:'#2fb8a8',terracotta:'#c8553d'});
const enamel=(color:string)=>new THREE.MeshStandardMaterial({color,roughness:.45,metalness:.25});
const signPlate=()=>new THREE.MeshStandardMaterial({color:'#bca07b',roughness:.9,metalness:.05});
function sign(text:string,x:number,y:number,z:number){
 const t=new Text();t.text=text;t.direction='rtl';t.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';t.fontSize=.34;
 t.anchorX='center';t.anchorY='middle';t.color='#4a3418';t.position.set(x,y,z);t.userData.noMerge=true;t.userData.wallSign=true;t.sync();return t;
}
// Orbit Star Hangar (האנגר המסלול): a small amber-copper hangar with bright Mars enamel
// accents, for a day of work on an emblem design.
// Plot q=3 r=-4, east of the Builders Accord. Abstract symbol only: a four-arm rotor on a mast above the hangar, and a
// small cobalt star that travels a slow circle around the rotor tips (one lap about every 18 s). With reduced motion the
// star simply rests at its starting point on the orbit ring. The vaulted hangar sits on the shared pad and plinth
// (pad .35 + plinth .6, the same base height as the neighbouring houses), with a short runway strip and a windsock.
// The loose natural stones on this hex are cleared in terrain() (radius 10 around the plot centre).
// Local frame: origin = plot centre, y=0 = the group's ground. The hangar door faces +z.
export const ORBIT_STAR_HANGAR_ID='b-orbit-star-hangar-20261105';
export const ORBIT_STAR_HANGAR_PLOT=Object.freeze({q:3,r:-4});
export const ORBIT_STAR_HANGAR=Object.freeze({pad:{radius:8.3,top:.35},plinth:{w:7.6,d:6,height:.6},vault:{radius:2.7,length:5.2},mast:{z:-2.2,top:7.6},rotor:{y:8.2,z:-1.95,arms:4,length:2.1},orbit:{radius:2.75,period:18},star:{outer:.55,inner:.24,color:'#2f6bff'},runway:{z0:3.2,z1:6.7,width:1.7}});
export function orbitStarHangar(part:Part,g:THREE.Group,w:World){
 const mat=(color:string,kind:'stone'|'metal'='stone',metal=.06,rough=.75)=>{const s=detailedSurface(kind);return new THREE.MeshStandardMaterial({color,map:s.color,normalMap:s.normal,roughnessMap:s.rough,normalScale:new THREE.Vector2(.12,.12),roughness:rough,metalness:metal});};
 const stone=mat('#c7ab86'),dark=mat('#2f2d2f'),copper=mat('#d08a4c','metal',.6,.38),brass=mat('#d9a35a','metal',.7,.3),patina=mat('#8a5a3a','metal',.55,.5);
 const glow=new THREE.MeshBasicMaterial({color:'#fff1d2'}),amber=new THREE.MeshBasicMaterial({color:'#ffad4d'}),tar=new THREE.MeshBasicMaterial({color:'#3b302b'});
 const box=(a:number,b:number,c:number,x:number,y:number,z:number,m:THREE.Material=stone)=>part(new THREE.BoxGeometry(a,b,c),m,x,y,z);
 const rod=(a:THREE.Vector3,b:THREE.Vector3,r:number,m:THREE.Material)=>{const d=b.clone().sub(a),o=part(new THREE.CylinderGeometry(r,r,d.length(),8),m,...a.clone().add(b).multiplyScalar(.5).toArray() as [number,number,number]);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());return o;};
 const {pad,plinth,vault,mast,rotor,orbit,star,runway}=ORBIT_STAR_HANGAR,P0=pad.top,B0=P0+plinth.height,R=vault.radius,L=vault.length;
 // Shared hex pad and plinth: base height = pad .35 + plinth .6, level with the Atlas, the Ramp Observatory and the Accord.
 const padShape=new THREE.Shape();for(let k=0;k<6;k++){const a=k*Math.PI/3,px=Math.sin(a)*pad.radius,py=-Math.cos(a)*pad.radius;k?padShape.lineTo(px,py):padShape.moveTo(px,py);}padShape.closePath();
 const padGeo=new THREE.ExtrudeGeometry(padShape,{depth:.3,bevelEnabled:false});padGeo.rotateX(-Math.PI/2);part(padGeo,stone,0,P0-.3,0);
 box(plinth.w,plinth.height,plinth.d,0,P0+plinth.height/2,-.4);
 // The vaulted hangar: a half-cylinder of amber-copper plates along z, brass ribs at every bay, patina end bands.
 const shell=mat('#d08a4c','metal',.6,.38);shell.side=THREE.DoubleSide;
 const v=part(new THREE.CylinderGeometry(R,R,L,32,1,true,-Math.PI/2,Math.PI),shell,0,B0,-.4);v.rotation.x=-Math.PI/2;
 const ribColors=[MARS_ENAMEL.coral,MARS_ENAMEL.saffron,MARS_ENAMEL.teal,MARS_ENAMEL.saffron,MARS_ENAMEL.coral];
 for(let k=0;k<=5;k++){const rib=part(new THREE.TorusGeometry(R+.03,.07,6,24,Math.PI),k===0||k===5?patina:enamel(ribColors[k-1]),0,B0,-.4-L/2+k*L/5);}
 // Back wall (closed) and front wall with the big sliding doors, a warm light slit between them and the amber strip.
 const back=part(new THREE.CircleGeometry(R,32,0,Math.PI),copper,0,B0,-.4-L/2);back.rotation.y=Math.PI;
 const fz=-.4+L/2;part(new THREE.CircleGeometry(R,32,0,Math.PI),dark,0,B0,fz);
 box(.22,2.6,.08,0,B0+1.3,fz+.03,glow);for(const s of [-1,1])box(1.85,2.7,.1,s*1.05,B0+1.35,fz+.07,enamel(MARS_ENAMEL.teal));
 box(4.4,.14,.12,0,B0+2.85,fz+.06,amber);for(const s of [-1,1])box(1.85,.16,.12,s*1.05,B0+.55,fz+.13,enamel(MARS_ENAMEL.saffron));
 // Warm windows low on both flanks of the vault, three per side, so the hangar reads as working.
 for(const sd of [-1,1])for(let k=0;k<3;k++){const phi=.55,wnd=box(.06,.34,.6,sd*Math.cos(phi)*(R+.01),B0+Math.sin(phi)*(R+.01),-.4-1.6+k*1.6,glow);wnd.rotation.z=sd>0?phi:Math.PI-phi;}
 // Name sign over the doors, in the city's Hebrew signage style (stone plate, dark letters).
 box(2.5,.62,.07,0,B0+3.25,fz+.1,signPlate());g.add(sign('האנגר המסלול',0,B0+3.25,fz+.15));
 // Runway strip on the pad in front of the doors: dark asphalt, a dashed centre line and amber edge lights.
 const rl=runway.z1-runway.z0,rz=(runway.z0+runway.z1)/2;box(runway.width,.04,rl,0,P0+.02,rz,tar);
 for(let k=0;k<4;k++)box(.12,.05,.45,0,P0+.03,runway.z0+.4+k*.9,glow);
 for(const s of [-1,1])for(let k=0;k<5;k++)part(new THREE.SphereGeometry(.07,8,6),amber,s*(runway.width/2+.12),P0+.08,runway.z0+.2+k*.8);
 // Windsock on the east corner: brass pole, a striped cone that leans with the wind.
 rod(new THREE.Vector3(4.6,P0,3.2),new THREE.Vector3(4.6,P0+3.2,3.2),.05,brass);
 for(let k=0;k<3;k++){const c=part(new THREE.CylinderGeometry(.22-k*.05,.27-k*.05,.36,10,1,true),k%2?glow:amber,4.6+.2+k*.34,P0+3.05-k*.05,3.2);c.rotation.z=Math.PI/2+.12;}
 // Mast behind the vault carrying the emblem: a four-arm rotor facing the street, with a thin orbit ring around it.
 rod(new THREE.Vector3(0,B0+R-.2,mast.z),new THREE.Vector3(0,mast.top,mast.z),.16,patina);
 box(.9,.24,.5,0,mast.top,mast.z,brass);
 const hub=new THREE.Vector3(0,rotor.y,rotor.z);
 part(new THREE.CylinderGeometry(.34,.34,.32,16),brass,hub.x,hub.y,hub.z).rotation.x=Math.PI/2;
 part(new THREE.SphereGeometry(.2,12,10),amber,hub.x,hub.y,hub.z+.2);
 for(let k=0;k<rotor.arms;k++){const a=k*Math.PI*2/rotor.arms+Math.PI/4;const bl=part(new THREE.BoxGeometry(rotor.length,.34,.07),copper,hub.x+Math.cos(a)*(rotor.length/2+.25),hub.y+Math.sin(a)*(rotor.length/2+.25),hub.z);bl.rotation.order='ZYX';bl.rotation.set(.28,0,a);
  part(new THREE.BoxGeometry(.3,.36,.08),brass,hub.x+Math.cos(a)*(rotor.length+.15),hub.y+Math.sin(a)*(rotor.length+.15),hub.z);}
 const ring=part(new THREE.TorusGeometry(orbit.radius,.035,6,64),brass,hub.x,hub.y,hub.z-.05);ring.userData.orbitRing=true;
 // The star: a five-point cobalt star with a soft blue glow, on a pivot at the hub. Its tick turns the pivot one lap per
 // orbit.period seconds and counter-turns the star so it stays upright as it travels. The tick only runs when motion
 // is allowed (World.animate skips this.animated under reduced motion), so the star then rests at the top right.
 const sh=new THREE.Shape();for(let k=0;k<10;k++){const a=Math.PI/2+k*Math.PI/5,r=k%2?star.inner:star.outer;k?sh.lineTo(Math.cos(a)*r,Math.sin(a)*r):sh.moveTo(Math.cos(a)*r,Math.sin(a)*r);}sh.closePath();
 const starGeo=new THREE.ExtrudeGeometry(sh,{depth:.14,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:1});starGeo.translate(0,0,-.07);
 const starMat=new THREE.MeshStandardMaterial({color:star.color,emissive:'#1d4dff',emissiveIntensity:1.1,metalness:.2,roughness:.35});
 const pivot=new THREE.Group();pivot.position.copy(hub);pivot.position.z+=.05;g.add(pivot);
 const s0=part(starGeo,starMat,orbit.radius,0,0);pivot.add(s0);s0.userData.orbitStar=true;s0.userData.noMerge=true;
 const halo=part(new THREE.CircleGeometry(.85,24),new THREE.MeshBasicMaterial({color:'#5d8bff',transparent:true,opacity:.28,depthWrite:false}),orbit.radius,0,-.06);pivot.add(halo);halo.userData.noMerge=true;
 const start=Math.PI/4;pivot.rotation.z=start;s0.rotation.z=-start;
 pivot.userData.orbitPivot=true;pivot.userData.dreamTick=(t:number)=>{const a=start-t*Math.PI*2/orbit.period;pivot.rotation.z=a;s0.rotation.z=-a;s0.rotation.y=Math.sin(t*.9)*.35;};
 w.animated.push(pivot);
}
// Cat Ledger (קופת החתולים): a small amber-copper counting house for the day the cats' savings ledger app grew up.
// Plot q=2 r=-3, south of the Builders Accord. A gabled counting house with an open ledger book over the door, and in
// front of it two cat safes: small vaults with round brass doors, a dial, a handle, a coin slot, two ears and a tail.
// Same pad and plinth as the neighbours (pad .35 + plinth .6). The loose stones on this hex are cleared in terrain().
// Local frame: origin = plot centre, y=0 = the group's ground. The door faces +z.
export const CAT_LEDGER_ID='b-cat-ledger-20261105';
export const CAT_LEDGER_PLOT=Object.freeze({q:2,r:-3});
export const CAT_LEDGER=Object.freeze({pad:{radius:8.3,top:.35},plinth:{w:6.6,d:6.2,height:.6},house:{w:4.2,d:3.2,h:3,z:-1.1,ridge:1.5},safes:[{x:-1.75,z:2.15},{x:1.75,z:2.15}],safe:{w:1.3,h:1.25,d:1.1}});
export function catLedger(part:Part,g:THREE.Group,_w:World){
 const mat=(color:string,kind:'stone'|'metal'='stone',metal=.06,rough=.75)=>{const s=detailedSurface(kind);return new THREE.MeshStandardMaterial({color,map:s.color,normalMap:s.normal,roughnessMap:s.rough,normalScale:new THREE.Vector2(.12,.12),roughness:rough,metalness:metal});};
 const stone=mat('#c7ab86'),dark=mat('#2f2d2f'),copper=mat('#d08a4c','metal',.6,.38),brass=mat('#d9a35a','metal',.7,.3),patina=mat('#8a5a3a','metal',.55,.5),bronze=mat('#a8703f','metal',.65,.35),paper=mat('#f1e3c6');
 const glow=new THREE.MeshBasicMaterial({color:'#fff1d2'}),amber=new THREE.MeshBasicMaterial({color:'#ffad4d'}),ink=new THREE.MeshBasicMaterial({color:'#6b4a2e'}),pink=new THREE.MeshBasicMaterial({color:'#e7a08a'});
 const box=(a:number,b:number,c:number,x:number,y:number,z:number,m:THREE.Material=stone)=>part(new THREE.BoxGeometry(a,b,c),m,x,y,z);
 const {pad,plinth,house,safes,safe}=CAT_LEDGER,P0=pad.top,B0=P0+plinth.height,H1=B0+house.h,fz=house.z+house.d/2;
 const padShape=new THREE.Shape();for(let k=0;k<6;k++){const a=k*Math.PI/3,px=Math.sin(a)*pad.radius,py=-Math.cos(a)*pad.radius;k?padShape.lineTo(px,py):padShape.moveTo(px,py);}padShape.closePath();
 const padGeo=new THREE.ExtrudeGeometry(padShape,{depth:.3,bevelEnabled:false});padGeo.rotateX(-Math.PI/2);part(padGeo,stone,0,P0-.3,0);
 box(plinth.w,plinth.height,plinth.d,0,P0+plinth.height/2,0);
 // Counting house: amber-copper walls, brass corner posts, a patina band, and a gabled copper roof.
 box(house.w,house.h,house.d,0,B0+house.h/2,house.z,copper);
 for(const sx of [-1,1])for(const sz of [-1,1])box(.16,house.h,.16,sx*(house.w/2),B0+house.h/2,house.z+sz*(house.d/2),brass);
 box(house.w+.04,.12,house.d+.04,0,B0+house.h*.62,house.z,patina);
 const gable=new THREE.Shape();gable.moveTo(-house.w/2-.25,0);gable.lineTo(house.w/2+.25,0);gable.lineTo(0,house.ridge);gable.closePath();
 const roofGeo=new THREE.ExtrudeGeometry(gable,{depth:house.d+.4,bevelEnabled:false});roofGeo.translate(0,0,-(house.d+.4)/2);const roofMat=enamel(MARS_ENAMEL.terracotta);part(roofGeo,roofMat,0,H1,house.z);
 part(new THREE.CylinderGeometry(.08,.08,house.d+.5,8),brass,0,H1+house.ridge,house.z).rotation.x=Math.PI/2;
 // Door with the amber entrance strip, two warm windows with little ledger-line sills.
 box(1.1,2,.12,0,B0+1,fz+.03,dark);box(1.4,.12,.12,0,B0+2.15,fz+.05,amber);
 for(const s of [-1,1]){box(.8,.7,.05,s*1.45,B0+1.7,fz+.03,glow);box(.9,.08,.12,s*1.45,B0+1.3,fz+.06,brass);}
 // The open ledger over the door: two cream pages tilted like an open book, ruled lines and a brass spine.
 for(const s of [-1,1]){const pg=box(.72,.5,.04,s*.38,B0+2.62,fz+.14,paper);pg.rotation.y=-s*.28;for(let k=0;k<3;k++){const ln=box(.5,.025,.01,s*.38,B0+2.5+k*.11,fz+.17+.03*Math.abs(s),ink);ln.rotation.y=-s*.28;}}
 box(.06,.54,.08,0,B0+2.62,fz+.18,brass);
 // Name sign on the gable, in the city's Hebrew signage style.
 box(2.4,.58,.07,0,H1+.5,fz+.22,signPlate());g.add(sign('קופת החתולים',0,H1+.5,fz+.27));
 // Two cat safes in front of the house, one per cat: a bronze vault body, a round brass door with a dial and a three-spoke
 // handle, a coin slot on top, two pointed ears with warm inner ears, and a curled tail at the back.
 for(const [i,p] of safes.entries()){const y0=P0+plinth.height,cy=y0+safe.h/2,front=p.z+safe.d/2;
  const body=enamel(i?MARS_ENAMEL.coral:MARS_ENAMEL.teal);box(safe.w,safe.h,safe.d,p.x,cy,p.z,body);box(safe.w+.08,.1,safe.d+.08,p.x,y0+.05,p.z,patina);
  const door=part(new THREE.CylinderGeometry(.43,.43,.08,24),brass,p.x,cy-.05,front+.04);door.rotation.x=Math.PI/2;
  const dial=part(new THREE.CylinderGeometry(.13,.13,.08,16),dark,p.x,cy+.05,front+.11);dial.rotation.x=Math.PI/2;
  for(let k=0;k<3;k++){const a=k*Math.PI*2/3+(i?.4:0),sp=box(.05,.34,.04,p.x+Math.cos(a)*.17,cy-.2+Math.sin(a)*.17,front+.12,brass);sp.rotation.z=a-Math.PI/2;}
  box(.36,.04,.08,p.x,y0+safe.h+.01,p.z-.1,dark);
  for(const s of [-1,1]){const ear=part(new THREE.ConeGeometry(.24,.42,4),body,p.x+s*(safe.w/2-.24),y0+safe.h+.21,p.z+.15);ear.rotation.y=Math.PI/4;
   const inner=part(new THREE.ConeGeometry(.13,.26,3),pink,p.x+s*(safe.w/2-.24),y0+safe.h+.17,p.z+.27);inner.rotation.y=Math.PI;}
  for(const s of [-1,1])box(.16,.05,.03,p.x+s*.24,cy+.38,front+.02,amber);
  const tail=part(new THREE.TorusGeometry(.32,.07,8,20,Math.PI*1.4),body,p.x+(i?-.25:.25),cy+.1,p.z-safe.d/2-.18);tail.rotation.set(0,Math.PI/2,i?Math.PI*.2:-Math.PI*.2);}
 // A small stack of coins between the safes.
 for(let k=0;k<4;k++)part(new THREE.CylinderGeometry(.18,.18,.06,16),brass,0,B0+.03+k*.065,2.4);
}
