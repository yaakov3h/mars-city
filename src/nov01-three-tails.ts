import * as THREE from 'three';
import {Text} from 'troika-three-text';
import {detailedSurface,type World} from './world';
import {cutRoofWindows} from './underground';
// Three Tails (שלושת הזנבות): three curling bronze tail towers on one shared stone pad, each tipped with a glowing
// turquoise orb. Below is a small underground rest room with three soft nests and a glass lift. Everything here is
// invented scenery; nothing comes from a real chat or from any person.
export const THREE_TAILS_ID='b-three-tails-20261101';
export const TAILS_PLOT=Object.freeze({q:-5,r:7});
export const TAILS_SHAFT_POINT=Object.freeze({x:-4.3,z:-1.2});
// Tail bases sit on a 3.2 ring at 30/150/270 degrees so the lift head and the name strip stay clear.
export const TAILS=Object.freeze([
 Object.freeze({angle:30,height:9.5}),
 Object.freeze({angle:150,height:12}),
 Object.freeze({angle:270,height:14.2})
] as const);
export const TAIL_RING=3.2,TAIL_RADIUS=.75,TAIL_ORB=.8,TAILS_MAX_HEIGHT=14.2+TAIL_ORB;
export const tailBase=(deg:number)=>({x:Math.cos(deg*Math.PI/180)*TAIL_RING,z:Math.sin(deg*Math.PI/180)*TAIL_RING});
const NOTES=[
 {he:'שלושה זנבות מתעכלים לגבהים שונים. אף פעם לא באותו קצב.',en:'Three tails curl to different heights. Never at the same pace.'},
 {he:'כדורי הטורקיז נדלקים בלילה. זה הסימן שהכול רגוע.',en:'The turquoise orbs light up at night. It means all is calm.'},
 {he:'כל זנב מסתיים בכדור אור, כי סוף טוב מתחיל במבט למעלה.',en:'Each tail ends in an orb of light, because a good ending starts by looking up.'}
];
let cursor=0;
export const nextTailNote=()=>NOTES[cursor++%NOTES.length];
export const TAILS_NOTES=NOTES;
// Underground nests: three soft pods on a 3.6 ring at 90/220/340 degrees, clear of the door lane (180) and the lift.
export const TAILS_PODS=Object.freeze([90,220,340].map(deg=>Object.freeze({deg,x:Math.cos(deg*Math.PI/180)*3.6,z:Math.sin(deg*Math.PI/180)*3.6,block:1.25})));
export function threeTails(part:Part,g:THREE.Group,_w:World,animated:THREE.Object3D[]){
 const mat=(color:string,kind:'stone'|'metal'='stone',metal=.08,rough=.78)=>{const s=detailedSurface(kind);return new THREE.MeshStandardMaterial({color,map:s.color,normalMap:s.normal,roughnessMap:s.rough,normalScale:new THREE.Vector2(.12,.12),roughness:rough,metalness:metal});};
 const stone=mat('#c9ae88'),dark=mat('#2f2d2f'),bronze=mat('#a9774e','metal',.55,.42),brass=mat('#d9a35a','metal',.65,.34);
 const glow=new THREE.MeshBasicMaterial({color:'#6fe8d2'});
 const liftGlass=new THREE.MeshPhysicalMaterial({color:'#d3e6dd',transparent:true,opacity:.2,roughness:.1,side:THREE.DoubleSide,depthWrite:false});
 const box=(a:number,b:number,c:number,x:number,y:number,z:number,m:THREE.Material=stone)=>part(new THREE.BoxGeometry(a,b,c),m,x,y,z);
 const P=.35;
 // Shared hex pad with the shaft point cut open for the lift.
 const pad=part(new THREE.CylinderGeometry(8.3,8.5,.3,6),stone,0,.2,0);
 cutRoofWindows(pad.geometry,[{x:TAILS_SHAFT_POINT.x,z:TAILS_SHAFT_POINT.z,radius:1.4}]);
 // Central plinth with three small turquoise inlays marking the tail directions.
 part(new THREE.CylinderGeometry(1.5,1.7,.25,24),stone,0,P+.12,0);
 for(const t of TAILS){const b=tailBase(t.angle);part(new THREE.SphereGeometry(.12,10,8),glow,Math.cos(t.angle*Math.PI/180)*1.0,P+.3,Math.sin(t.angle*Math.PI/180)*1.0);void b;}
 // The three tails: bronze tubes that rise from the ring and curl gently toward the centre.
 for(const t of TAILS){
  const b=tailBase(t.angle),h=t.height;
  const curve=new THREE.CatmullRomCurve3([
   new THREE.Vector3(b.x,P,b.z),
   new THREE.Vector3(b.x*.92,P+h*.4,b.z*.92),
   new THREE.Vector3(b.x*.6,P+h*.75,b.z*.6),
   new THREE.Vector3(b.x*.18,P+h,b.z*.18)
  ]);
  part(new THREE.TubeGeometry(curve,20,TAIL_RADIUS,10),bronze,0,0,0);
  const tip=curve.getPoint(1);
  const collar=new THREE.Mesh(new THREE.TorusGeometry(TAIL_RADIUS+.1,.09,8,24),brass);collar.position.copy(tip);collar.rotation.x=Math.PI/2;g.add(collar);
  const orb=new THREE.Mesh(new THREE.SphereGeometry(TAIL_ORB,20,14),glow);orb.position.set(tip.x,tip.y+TAIL_ORB*.9,tip.z);orb.userData.pulse=true;g.add(orb);animated.push(orb);
 }
 // Name strip: a bronze-framed plate fixed to a low stone block at the pad edge, never floating.
 const FZ=6.2;box(3,.9,.5,0,P+.45,FZ,stone);box(2.5,.55,.1,0,P+.5,FZ+.28,dark);box(2.66,.05,.12,0,P+.8,FZ+.28,brass);box(2.66,.05,.12,0,P+.2,FZ+.28,brass);
 const t=new Text();t.text='שלושת הזנבות';t.direction='rtl';t.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';t.fontSize=.34;t.anchorX='center';t.anchorY='middle';t.color='#ffd899';t.position.set(0,P+.5,FZ+.35);t.userData.noMerge=true;g.add(t);t.sync();
 // Glazed lift head at the shaft point: open glass shaft, brass frame, turquoise marker light on top.
 const{x:EX,z:EZ}=TAILS_SHAFT_POINT;
 for(const dz of [-.74,.74])box(1.6,.1,.14,EX,.42,EZ+dz,glow);
 for(const dx of [-.74,.74])box(.14,.1,1.34,EX+dx,.42,EZ,glow);
 box(1.2,1.7,1.2,EX,1.35,EZ,liftGlass);for(const dx of [-.6,.6])for(const dz of [-.6,.6])box(.07,1.8,.07,EX+dx,1.35,EZ+dz,bronze);
 box(1.36,.16,1.36,EX,2.28,EZ,bronze);part(new THREE.SphereGeometry(.1,10,8),glow,EX,2.46,EZ);
}
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
// Underground rest room: a round rug and three soft nest pods, each a low ring with a cushion and a small night light.
export function tailsRoom(root:THREE.Group,cx:number,fy:number,cz:number){
 const mat=(color:string,kind:'stone'|'metal'='stone')=>{const s=detailedSurface(kind);return new THREE.MeshStandardMaterial({color,map:s.color,normalMap:s.normal,roughnessMap:s.rough,normalScale:new THREE.Vector2(.12,.12),roughness:kind==='metal'?.6:.95,metalness:kind==='metal'?.45:.08});};
 const stone=mat('#b39a7b'),dark=mat('#343334');
 const glow=new THREE.MeshBasicMaterial({color:'#6fe8d2'});
 const podColors=['#d98a8a','#d9a35a','#a9c4d9'];
 const add=(geo:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number)=>{const o=new THREE.Mesh(geo,m);o.position.set(cx+x,fy+y,cz+z);o.castShadow=true;o.receiveShadow=true;root.add(o);return o;};
 add(new THREE.CylinderGeometry(2.2,2.2,.08,32),dark,0,.04,0);
 TAILS_PODS.forEach((p,i)=>{
  const ring=add(new THREE.TorusGeometry(.9,.3,10,24),mat('#8f7a63','metal'),p.x,.3,p.z);ring.rotation.x=Math.PI/2;
  add(new THREE.CylinderGeometry(.72,.78,.22,20),new THREE.MeshStandardMaterial({color:podColors[i],roughness:.9}),p.x,.28,p.z);
  add(new THREE.CylinderGeometry(.05,.05,.5,8),stone,p.x*1.22,.25,p.z*1.22);
  add(new THREE.SphereGeometry(.16,12,10),glow,p.x*1.22,.58,p.z*1.22);
 });
 const lamp=new THREE.PointLight('#ffd9c9',10,9,2);lamp.position.set(cx,fy+2.6,cz);root.add(lamp);
}
