import * as THREE from 'three';
import {Text} from 'troika-three-text';
import {detailedSurface,type World} from './world';
import {cutRoofWindows} from './underground';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
// Mars Dream Archive (ארכיון החלומות של מאדים): a transparent dome of floating, softly glowing books. Every so often one book
// opens and a small flat hologram (a cat, a tree, a ship or an island) rises out of it and fades away. Clicking the building
// reads a short invented Martian dream. Nothing here comes from a real chat or from any person; all dreams are made up.
export const DREAM_ARCHIVE_ID='b-dream-archive-20261027';
export const DREAM_PLOT=Object.freeze({q:-6,r:7});
export const DREAM_SHAFT_POINT=Object.freeze({x:-4.3,z:-1.2});
// Dome footprint relative to the hex centre; heights are above the pad top.
// Geodesic dome over the whole hex: a triangulated shell (icosahedron, 3 segments per edge, cut flat at the base) stretched
// to a tall ellipsoid. The base circle matches the 8.3 stone pad, inside the 8.61 apothem of the leveled hex ground.
export const DREAM_DOME=Object.freeze({x:0,z:0,radius:8,height:12.5,baseY:.5,ringOuter:8.35,maxHeight:13,hologramApex:9.2,door:{halfWidth:1.7,height:3.8}});
export const DREAMS=[
 {he:'הלילה חלמתי על גשם. הייתי צריך לחפש מה זה.',en:'Last night I dreamed of rain. I had to look up what that is.'},
 {he:'חלמתי שהחתול ישן על כוכב. הכוכב לא התלונן.',en:'I dreamed the cat slept on a star. The star did not complain.'},
 {he:'חלמתי על עץ שגדל בלי זכוכית. נבהלתי, אבל הוא היה בסדר.',en:'I dreamed of a tree growing without glass. It scared me, but it was fine.'},
 {he:'חלמתי שהאופק הוא קו ארוך של מים. ירדתי לבדוק.',en:'I dreamed the horizon was one long line of water. I went down to check.'},
 {he:'חלמתי על ספינה שמפליגה על חול אדום. הגל היה קטן ונחמד.',en:'I dreamed of a ship sailing on red sand. The wave was small and kind.'},
 {he:'חלמתי על אי קטן בתוך ספר. הוא נפתח כשהסתכלתי.',en:'I dreamed of a small island inside a book. It opened when I looked.'}
];
let cursor=0;
export const nextDream=()=>DREAMS[cursor++%DREAMS.length];
export const HOLOGRAMS=['cat','tree','ship','island'] as const;
// One slot per hologram. Slot timeline (seconds): 0-1.2 the book opens, 1-8.8 the hologram rises, 8.8-10 it fades and the book
// closes, 10-12 rest. Four slots make a 48 second cycle, so at most one book is open at any time.
export const DREAM_SLOT=12,DREAM_CYCLE=DREAM_SLOT*HOLOGRAMS.length;
const sstep=(x:number)=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
export function dreamPhase(t:number){
 const c=((t%DREAM_CYCLE)+DREAM_CYCLE)%DREAM_CYCLE,slot=Math.floor(c/DREAM_SLOT),s=c-slot*DREAM_SLOT;
 const open=s<1.2?sstep(s/1.2):s<8.8?1:s<10?1-sstep((s-8.8)/1.2):0;
 const rise=s<1?0:s<8.8?sstep((s-1)/7.8):1;
 const alpha=s<1?0:s<1.8?sstep((s-1)/.8):s<7.8?1:s<8.8?1-sstep(s-7.8):0;
 return {cycle:Math.floor(t/DREAM_CYCLE),slot,s,open,rise,alpha};
}
// Eight books on two slow rings; heights are fixed per book so no two books ever share space.
export const DREAM_BOOKS=Object.freeze([0,1,2,3,4,5,6,7].map(i=>({ring:i<4?3.2:6.4,speed:i<4?.12:-.08,phase:(i%4)*Math.PI/2+(i<4?0:Math.PI/4),y:i<4?2.0+(i%2)*1:4.0+(i%2)*1.2,bob:i*.9})));
// Only the four inner-ring books ever open, so every hologram rises near the middle of the dome.
export const DREAM_BOOK_SCALE=1.5,HOLO_SCALE=2.4,HOLO_RISE=1.3;
export const DREAM_MAX_BOOK_Y=Math.max(...DREAM_BOOKS.slice(0,4).map(b=>b.y))+.15;
const COLORS=['#ff7a59','#29c7ac','#ffb347','#8b6cf0','#5ec8ff','#ff8fb1','#a6e05a','#f4e06d'];
// Geodesic shell on the unit hemisphere: an icosahedron with a vertex on top, three segments per edge, every triangle
// clipped at the base plane so the base is a clean circle. Faces carry a slight per-face tint; struts are thin boxes on the
// triangle edges. The shell is then scaled to radius R and height H. Faces whose centre lies in the door box are left out.
export function geodesicDome(R:number,H:number,door:{halfWidth:number;height:number}){
 const ico=new THREE.IcosahedronGeometry(1,2).toNonIndexed(),pos=ico.getAttribute('position');
 const top=new THREE.Vector3(0,1.6180339887,1).normalize(),q=new THREE.Quaternion().setFromUnitVectors(top,new THREE.Vector3(0,1,0));
 const v=(i:number)=>new THREE.Vector3(pos.getX(i),pos.getY(i),pos.getZ(i)).normalize().applyQuaternion(q);
 const clip=(poly:THREE.Vector3[])=>{const out:THREE.Vector3[]=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];const ain=a.y>=0,bin=b.y>=0;if(ain)out.push(a);if(ain!==bin){const t=a.y/(a.y-b.y);out.push(a.clone().lerp(b,t).setY(0));}}return out;};
 const P:number[]=[],C:number[]=[],edges=new Map<string,[THREE.Vector3,THREE.Vector3]>();
 for(let f=0;f<pos.count;f+=3){const tri=[v(f),v(f+1),v(f+2)];
  const cx=(tri[0].x+tri[1].x+tri[2].x)/3*R,cy=(tri[0].y+tri[1].y+tri[2].y)/3*H,cz=(tri[0].z+tri[1].z+tri[2].z)/3*R;
  if(cy<0)continue;
  const inDoor=Math.abs(cx)<door.halfWidth+.5&&cz>0&&cy<door.height+.8;
  const tint=.55+((Math.abs(Math.sin(f*12.9898))*43758.5453)%1)*.45;
  if(!inDoor){const poly=clip(tri);for(let k=1;k+1<poly.length;k++)for(const w of [poly[0],poly[k],poly[k+1]]){P.push(w.x*R,w.y*H,w.z*R);C.push(.62*tint,.84*tint,1*tint);}}
  for(let e=0;e<3;e++){const a=tri[e],b=tri[(e+1)%3];if(a.y<0&&b.y<0)continue;const k=[a,b].map(p=>p.toArray().map(n=>Math.round(n*500)).join(',')).sort().join('|');if(edges.has(k))continue;edges.set(k,[a.y<0?a.clone().lerp(b,a.y/(a.y-b.y)).setY(0):a.clone(),b.y<0?b.clone().lerp(a,b.y/(b.y-a.y)).setY(0):b.clone()]);}
 }
 const faces=new THREE.BufferGeometry();faces.setAttribute('position',new THREE.Float32BufferAttribute(P,3));faces.setAttribute('color',new THREE.Float32BufferAttribute(C,3));faces.computeVertexNormals();
 const boxes:THREE.BufferGeometry[]=[],up=new THREE.Vector3(0,0,1);
 for(const [a,b] of edges.values()){const A=new THREE.Vector3(a.x*R,a.y*H,a.z*R),B=new THREE.Vector3(b.x*R,b.y*H,b.z*R),mid=A.clone().add(B).multiplyScalar(.5),len=A.distanceTo(B);
  const mx=mid.clone();if(Math.abs(mx.x)<door.halfWidth+.5&&mx.z>0&&mx.y<door.height+.8)continue;
  const g=new THREE.BoxGeometry(.11,.11,len);const m=new THREE.Matrix4().lookAt(new THREE.Vector3(),B.clone().sub(A).normalize(),new THREE.Vector3(0,1,0));m.setPosition(mid);g.applyMatrix4(m);boxes.push(g);}
 void up;
 return {faces,struts:mergeGeometries(boxes)!};
}
export function dreamArchive(part:Part,g:THREE.Group,_w:World,animated:THREE.Object3D[]){
 const mat=(color:string,kind:'stone'|'metal'='stone',metal=.08,rough=.78)=>{const s=detailedSurface(kind);return new THREE.MeshStandardMaterial({color,map:s.color,normalMap:s.normal,roughnessMap:s.rough,normalScale:new THREE.Vector2(.12,.12),roughness:rough,metalness:metal});};
 const stone=mat('#c9ae88'),dark=mat('#2f2d2f'),bronze=mat('#a9774e','metal',.55,.42),brass=mat('#d9a35a','metal',.65,.34);
 const glass=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false});
 const liftGlass=new THREE.MeshPhysicalMaterial({color:'#d3e6dd',transparent:true,opacity:.2,roughness:.1,side:THREE.DoubleSide,depthWrite:false});
 const amber=new THREE.MeshBasicMaterial({color:'#ffad4d'});
 const box=(a:number,b:number,c:number,x:number,y:number,z:number,m:THREE.Material=stone)=>part(new THREE.BoxGeometry(a,b,c),m,x,y,z);
 const P=.35,{x:DX,z:DZ,radius:R,height:H}=DREAM_DOME;
 // Shared hex pad with the shaft point cut open for the lift.
 const pad=part(new THREE.CylinderGeometry(8.3,8.5,.3,6),stone,0,.2,0);
 cutRoofWindows(pad.geometry,[{x:DREAM_SHAFT_POINT.x,z:DREAM_SHAFT_POINT.z,radius:1.4}]);
 // Stone base ring, brass rim, and the geodesic glass shell (one merged mesh of faces, one merged mesh of struts).
 const BY=DREAM_DOME.baseY;
 part(new THREE.CylinderGeometry(R+.2,R+.35,.5,48),stone,DX,P+.1,DZ);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(R+.05,.16,8,64),brass);rim.rotation.x=Math.PI/2;rim.position.set(DX,P+BY,DZ);g.add(rim);
 const {faces,struts}=geodesicDome(R,H,DREAM_DOME.door);
 const shell=part(faces,glass,DX,P+BY,DZ);shell.castShadow=false;shell.receiveShadow=false;
 const frame=new THREE.Mesh(struts,brass);frame.position.set(DX,P+BY,DZ);g.add(frame);
 // Entrance: brass door frame in the shell on the +z side, with a stone step.
 {const hw=DREAM_DOME.door.halfWidth,dh=DREAM_DOME.door.height,dz=Math.sqrt(R*R-hw*hw)*.995;
  for(const sx of [-1,1])box(.26,dh,.26,DX+sx*hw,P+BY+dh/2,DZ+dz,brass);box(hw*2+.26,.26,.26,DX,P+BY+dh,DZ+dz,brass);box(hw*2+.6,.14,.9,DX,P+.3,DZ+dz+.2,stone);}
 const disc=part(new THREE.CylinderGeometry(2.1,2.3,.14,32),new THREE.MeshBasicMaterial({color:'#5b4bb0'}),DX,P+.5,DZ);void disc;
 const orb=new THREE.Mesh(new THREE.SphereGeometry(.34,16,12),amber);orb.position.set(DX,P+1.0,DZ);g.add(orb);
 // Books: flat-coloured covers with pale pages. Each is two halves on one spine; the halves fold from a closed stack to open.
 const pages=new THREE.MeshBasicMaterial({color:'#fff4dc'});
 const bookMats=COLORS.map(c=>new THREE.MeshBasicMaterial({color:c}));
 const W=.55,Dp=.8;
 const half=(m:THREE.Material,sign:number)=>{const h=new THREE.Group();const c=new THREE.Mesh(new THREE.BoxGeometry(W,.04,Dp),m);c.position.set(sign*W/2,0,0);const p=new THREE.Mesh(new THREE.BoxGeometry(W-.06,.05,Dp-.06),pages);p.position.set(sign*W/2,.045,0);h.add(c,p);return h;};
 const books=DREAM_BOOKS.map((b,i)=>{const root=new THREE.Group(),R_=half(bookMats[i%COLORS.length],1),L_=half(bookMats[i%COLORS.length],-1);root.add(R_,L_);root.userData.dreamPart=true;root.scale.setScalar(DREAM_BOOK_SCALE);g.add(root);animated.push(root);return {root,L_,b};});
 // Flat holograms: small extruded silhouettes in one translucent colour, with a dark accent for the eyes and details.
 const flat=(s:THREE.Shape,m:THREE.Material,z=0)=>{const geo=new THREE.ExtrudeGeometry(s,{depth:.05,bevelEnabled:false,curveSegments:14});const o=new THREE.Mesh(geo,m);o.position.z=z-.025;return o;};
 const circ=(x:number,y:number,r:number)=>{const s=new THREE.Shape();s.absarc(x,y,r,0,Math.PI*2,false);return s;};
 const ell=(x:number,y:number,rx:number,ry:number)=>{const s=new THREE.Shape();s.absellipse(x,y,rx,ry,0,Math.PI*2,false,0);return s;};
 const poly=(pts:number[][])=>{const s=new THREE.Shape();pts.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;};
 const holoMats:THREE.MeshBasicMaterial[]=[];
 const holo=(color:string,build:(m:THREE.Material,a:THREE.Material)=>THREE.Mesh[])=>{const m=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0,depthWrite:false}),a=new THREE.MeshBasicMaterial({color:'#10303a',transparent:true,opacity:0,depthWrite:false});holoMats.push(m,a);const grp=new THREE.Group();for(const o of build(m,a))grp.add(o);grp.visible=false;grp.userData.dreamPart=true;grp.userData.mats=[m,a];g.add(grp);animated.push(grp);return grp;};
 const holos=[
  holo('#7fe3ff',(m,a)=>[flat(ell(0,.35,.38,.34),m),flat(circ(0,.82,.27),m),flat(poly([[-.25,1.0],[-.22,1.32],[-.05,1.08]]),m),flat(poly([[.25,1.0],[.22,1.32],[.05,1.08]]),m),flat(ell(.44,.3,.34,.08),m),flat(circ(-.09,.86,.04),a,.03),flat(circ(.09,.86,.04),a,.03)]),
  holo('#9bf08a',(m,a)=>[flat(poly([[-.07,0],[.07,0],[.05,.62],[-.05,.62]]),m),flat(circ(0,.95,.34),m),flat(circ(-.28,.72,.24),m),flat(circ(.28,.72,.24),m),flat(circ(0,.55,.01),a,.03)]),
  holo('#ffd27a',(m,a)=>[flat(poly([[-.5,.2],[.5,.2],[.32,-.05],[-.32,-.05]]),m),flat(poly([[-.02,.22],[.02,.22],[.02,1.1],[-.02,1.1]]),m),flat(poly([[.06,.3],[.06,1.05],[.42,.3]]),m),flat(poly([[-.06,.35],[-.06,.95],[-.34,.35]]),m),flat(ell(0,-.12,.62,.05),a,.03)]),
  holo('#ff9fc4',(m,a)=>[flat(ell(0,.05,.58,.22),m),flat(poly([[.12,.15],[.2,.15],[.15,.75],[.08,.75]]),m),flat(ell(.17,.82,.32,.09),m),flat(ell(.02,.88,.28,.08),m),flat(ell(0,-.18,.7,.04),a,.03)])
 ];
 const book=new THREE.Vector3();
 const driver=new THREE.Object3D();driver.userData.dreamTick=(t:number)=>update(t);g.add(driver);animated.push(driver);
 function update(t:number){
  const ph=dreamPhase(t),openIdx=(ph.slot+ph.cycle)%4;
  books.forEach(({root,L_,b},i)=>{
   const a=t*b.speed+b.phase,y=P+.55+b.y+Math.sin(t*1.1+b.bob)*.1;
   root.position.set(DX+Math.cos(a)*b.ring,y,DZ+Math.sin(a)*b.ring);root.rotation.set(Math.sin(t*.5+b.bob)*.08,-a+Math.PI/2,0);
   const o=i===openIdx?ph.open:0;L_.rotation.z=-Math.PI*(1-o);L_.position.y=.13*(1-o);
  });
  const hi=ph.slot,holoShow=ph.alpha>0.001;
  holos.forEach((h,k)=>{const on=k===hi&&holoShow;h.visible=on;if(!on)return;const b=books[openIdx].root;book.copy(b.position);const sc=HOLO_SCALE*(.55+.45*ph.rise);h.position.set(book.x,book.y+.25+ph.rise*HOLO_RISE,book.z);h.scale.setScalar(sc);h.rotation.y=t*.6;(h.userData.mats as THREE.MeshBasicMaterial[]).forEach((m,n)=>m.opacity=ph.alpha*(n?.9:.78));});
 }
 update(0);
 // Name strip: a bronze-framed plate fixed to a low stone block at the pad edge, never floating.
 const FZ=5.4,FX=3.6;box(3,.9,.5,FX,P+.45,FZ,stone);box(2.5,.55,.1,FX,P+.5,FZ+.28,dark);box(2.66,.05,.12,FX,P+.8,FZ+.28,brass);box(2.66,.05,.12,FX,P+.2,FZ+.28,brass);
 const t=new Text();t.text='ארכיון החלומות';t.direction='rtl';t.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';t.fontSize=.34;t.anchorX='center';t.anchorY='middle';t.color='#ffd899';t.position.set(FX,P+.5,FZ+.35);t.userData.noMerge=true;g.add(t);t.sync();
 // Glazed lift head at the shaft point: open glass shaft, brass frame, amber marker light on top.
 const{x:EX,z:EZ}=DREAM_SHAFT_POINT;
 for(const dz of [-.74,.74])box(1.6,.1,.14,EX,.42,EZ+dz,amber);
 for(const dx of [-.74,.74])box(.14,.1,1.34,EX+dx,.42,EZ,amber);
 box(1.2,1.7,1.2,EX,1.35,EZ,liftGlass);for(const dx of [-.6,.6])for(const dz of [-.6,.6])box(.07,1.8,.07,EX+dx,1.35,EZ+dz,bronze);
 box(1.36,.16,1.36,EX,2.28,EZ,bronze);part(new THREE.SphereGeometry(.1,10,8),amber,EX,2.46,EZ);
 void holoMats;
}
// Underground dream room: a round dais with one big open book, six glowing dream jars and three shelves of coloured books.
export function dreamRoom(root:THREE.Group,cx:number,fy:number,cz:number){
 const mat=(color:string,kind:'stone'|'metal'='stone')=>{const s=detailedSurface(kind);return new THREE.MeshStandardMaterial({color,map:s.color,normalMap:s.normal,roughnessMap:s.rough,normalScale:new THREE.Vector2(.12,.12),roughness:kind==='metal'?.6:.95,metalness:kind==='metal'?.45:.08});};
 const bronze=mat('#9f7b58','metal'),dark=mat('#343334'),stone=mat('#b39a7b'),paper=new THREE.MeshBasicMaterial({color:'#fff4dc'});
 const add=(geo:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number,ry=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(cx+x,fy+y,cz+z);o.rotation.y=ry;o.castShadow=true;o.receiveShadow=true;root.add(o);return o;};
 const box=(a:number,b:number,c:number,x:number,y:number,z:number,m:THREE.Material=stone,ry=0)=>add(new THREE.BoxGeometry(a,b,c),m,x,y,z,ry);
 add(new THREE.CylinderGeometry(1.9,2.1,.3,32),stone,0,.15,0);add(new THREE.CylinderGeometry(1.6,1.6,.1,32),dark,0,.35,0);
 for(const s of [-1,1]){const p=box(1.2,.07,1.5,s*.62,.46,0,new THREE.MeshBasicMaterial({color:COLORS[s>0?1:0]}));p.rotation.z=-s*.12;box(1.05,.05,1.35,s*.62,.5,0,paper).rotation.z=-s*.12;}
 for(let k=0;k<6;k++){const a=k*Math.PI/3+Math.PI/6,jx=Math.cos(a)*3.0,jz=Math.sin(a)*3.0;add(new THREE.CylinderGeometry(.34,.4,.45,14),dark,jx,.22,jz);add(new THREE.SphereGeometry(.34,16,12),new THREE.MeshBasicMaterial({color:COLORS[(k+2)%COLORS.length],transparent:true,opacity:.85}),jx,.78,jz);add(new THREE.SphereGeometry(.14,10,8),new THREE.MeshBasicMaterial({color:'#fff7e0'}),jx,.78,jz);}
 for(const deg of [90,150,240]){const ang=deg*Math.PI/180,ux=Math.cos(ang)*5.0,uz=Math.sin(ang)*5.0,ry=-ang-Math.PI/2;
  box(3,.1,.5,ux,1.0,uz,bronze,ry);box(3,.1,.5,ux,2.1,uz,bronze,ry);box(.1,2.2,.5,ux,1.1,uz,bronze,ry);
  for(let lv=0;lv<2;lv++)for(let k=0;k<5;k++)box(.38,.62,.07,ux+Math.cos(ry)*(k-2)*.54,1.36+lv*1.1,uz-Math.sin(ry)*(k-2)*.54,new THREE.MeshBasicMaterial({color:COLORS[(k+lv*3+deg)%COLORS.length]}),ry);}
 const lamp=new THREE.PointLight('#e8e0ff',10,9,2);lamp.position.set(cx,fy+2.6,cz);root.add(lamp);
}
