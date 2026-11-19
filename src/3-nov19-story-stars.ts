import * as THREE from 'three';
import {Text} from 'troika-three-text';
import type {World} from './world';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
// Story Stars (כוכבי הסיפורים): an open rotunda on its own plot beside the Connection Gate and the Oxygen Cafe, so
// the eastern plaza grows by one stop. Its six columns are stacks of giant colourful books under a shallow indigo
// canopy dotted with tiny lights, like a piece of night sky held up in the permanent daylight. Under the canopy a
// slow mobile carries three constellations of small glowing books - a moon-boat, a key and a fox - linked by thin
// light lines. A tap on a book-star opens it like a flower and sends a wave of light along its constellation, and
// two light petals drift down to the reading circle of benches at the centre. Stories and ideas waiting to take
// form. Fully above ground, in the city's permanent daylight; Noa's small turquoise signature is the entrance
// light strip.
export const STORY_STARS_ID='b-story-stars-20261119';
export const STORY_STARS_PLOT=Object.freeze({q:5,r:0});
export const STORY_STARS_NAME='כוכבי הסיפורים';
// Footprint relative to the hex centre; heights are above the pad top.
export const STORY_STARS=Object.freeze({padRadius:8.3,padTop:.5,columnRing:4.4,bookStack:4,columnTop:2.55,canopyRadius:3.8,canopyTop:1.8,canopyBase:4.0,canopyHeight:1.0,mobileRadius:2.4,mobileY:2.75,maxHeight:7});
export const STORY_ENAMEL=Object.freeze({terracotta:'#c8553d',coral:'#ff6f59',saffron:'#ffc145',teal:'#2fb8a8',indigo:'#2c2a55'});
const enamel=(c:string,e=.12)=>new THREE.MeshStandardMaterial({color:c,roughness:.38,metalness:.22,emissive:new THREE.Color(c),emissiveIntensity:e});
const cream=()=>new THREE.MeshStandardMaterial({color:'#f6efe2',roughness:.6,metalness:.05});
const stone=()=>new THREE.MeshStandardMaterial({color:'#bca07b',roughness:.9,metalness:.05});
const copper=(e=.2)=>new THREE.MeshStandardMaterial({color:'#f0b074',roughness:.42,metalness:.72,emissive:new THREE.Color('#ff9a45'),emissiveIntensity:e});
const glow=(c:string)=>new THREE.MeshBasicMaterial({color:c});
const lineMat=()=>new THREE.MeshBasicMaterial({color:'#9fd8ff',transparent:true,opacity:.45});
function signText(text:string,size:number){
 const t=new Text();t.text=text;t.direction='rtl';t.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';t.fontSize=size;
 t.anchorX='center';t.anchorY='middle';t.color='#e8d9c0';t.userData.noMerge=true;t.userData.wallSign=true;t.sync();return t;
}
// Constellation drawings in a local frame, each star [x,y]: a moon-boat, a key and a fox.
const SHAPES:[string,[number,number][]][]=[
 ['boat',[[-.8,0],[-.4,-.22],[0,-.3],[.4,-.22],[.8,0],[.1,.55]]],
 ['key',[[-.7,.1],[-.45,.32],[-.2,.1],[-.45,-.12],[.15,.1],[.55,.28],[.55,-.08]]],
 ['fox',[[-.55,.5],[-.2,.75],[.15,.75],[.5,.5],[-.35,.05],[.3,.05],[.7,.3]]],
];
type Bloom=()=>void;
export function storyStars(part:Part,group:THREE.Group,world:World){
 const C=STORY_STARS,P=C.padTop;
 // Hex pad and Noa's small turquoise entrance strip on the plaza-facing (north-west) edge.
 part(new THREE.CylinderGeometry(C.padRadius,C.padRadius+.15,P,6),stone(),0,P/2);
 const ea=Math.atan2(-1,-1); // entrance ray: toward the gap between the cafe (-z) and the gate (-x)
 const ex=Math.cos(ea),ez=Math.sin(ea);
 const strip=part(new THREE.BoxGeometry(.5,.07,3.4),glow('#4fd8be'),ex*(C.padRadius-.5),P+.04,ez*(C.padRadius-.5));
 strip.rotation.y=-ea;strip.userData.noSignature=true;
 // Warm ground-light slabs leading from the pad edge to the entrance.
 for(let k=0;k<4;k++)part(new THREE.BoxGeometry(.6,.06,.5),glow('#ffd166'),ex*(7.6-k*1.05),P+.03,ez*(7.6-k*1.05)).rotation.y=-ea;
 // The reading circle: a low cream floor disc with three benches facing the middle, clear of the entrance ray.
 part(new THREE.CylinderGeometry(3.2,3.3,.18,28),cream(),0,P+.09);
 for(const ba of [Math.PI/2,Math.PI/2+2.094,Math.PI/2-2.094]){
  const bx=Math.cos(ba)*2.2,bz=Math.sin(ba)*2.2;
  part(new THREE.BoxGeometry(1.6,.14,.5),stone(),bx,P+.62,bz).rotation.y=-ba+Math.PI/2;
  part(new THREE.BoxGeometry(1.6,.5,.12),stone(),bx-Math.cos(ba)*.26,P+.36,bz-Math.sin(ba)*.26).rotation.y=-ba+Math.PI/2;
  for(const s of [-1,1])part(new THREE.BoxGeometry(.12,.5,.4),stone(),bx+Math.cos(ba+Math.PI/2)*s*.65,P+.36,bz+Math.sin(ba+Math.PI/2)*s*.65).rotation.y=-ba+Math.PI/2;
 }
 // Six columns, each a stack of four giant books with a small capital, carrying the ring beam.
 const covers=[STORY_ENAMEL.terracotta,STORY_ENAMEL.saffron,STORY_ENAMEL.teal,STORY_ENAMEL.coral];
 for(let cix=0;cix<6;cix++){
  const a=cix*Math.PI/3,cx=Math.cos(a)*C.columnRing,cz=Math.sin(a)*C.columnRing;
  let y=P+.1;
  for(let k=0;k<C.bookStack;k++){
   const rot=(k%2?-1:1)*.13,bc=covers[(cix+k)%4];
   const pages=part(new THREE.BoxGeometry(1.5,.3,1.05),cream(),cx,y+.15,cz);pages.rotation.y=-a+rot;
   const cover=part(new THREE.BoxGeometry(1.62,.09,1.17),enamel(bc),cx,y+.345,cz);cover.rotation.y=-a+rot;
   y+=.42;
  }
  part(new THREE.BoxGeometry(1.3,.18,1.0),copper(.18),cx,y+.09,cz).rotation.y=-a;
 }
 part(new THREE.TorusGeometry(C.columnRing,.12,8,48),copper(.22),0,C.columnTop+.07,0).rotation.x=Math.PI/2;
 // The indigo canopy: a shallow open cone held above the columns, dotted underneath with tiny star lights.
 const coneY=(rr:number)=>C.canopyBase+(1-(rr-C.canopyTop)/(C.canopyRadius-C.canopyTop))*C.canopyHeight;
 const canopy=part(new THREE.CylinderGeometry(C.canopyTop,C.canopyRadius,C.canopyHeight,36,1,true),
  new THREE.MeshStandardMaterial({color:STORY_ENAMEL.indigo,roughness:.55,metalness:.15,emissive:new THREE.Color('#191744'),emissiveIntensity:.5,side:THREE.DoubleSide}),
  0,C.canopyBase+C.canopyHeight/2,0);
 canopy.userData.noMerge=true;
 part(new THREE.TorusGeometry(C.canopyRadius,.06,6,48),copper(.22),0,C.canopyBase,0).rotation.x=Math.PI/2;
 part(new THREE.TorusGeometry(C.canopyTop,.05,6,36),copper(.22),0,C.canopyBase+C.canopyHeight,0).rotation.x=Math.PI/2;
 // Three slim copper rods carry the floating canopy from the ring beam.
 for(let k=0;k<3;k++){
  const ra=Math.PI/2+k*2.094,rx=Math.cos(ra)*3.4,rz=Math.sin(ra)*3.4,top=coneY(3.4);
  part(new THREE.CylinderGeometry(.05,.05,top-C.columnTop-.1,6),copper(.22),rx,(top+C.columnTop+.1)/2,rz);
 }
 for(let i=0;i<20;i++){
  const rr=C.canopyTop+.15+(i%5)*.42,aa=i*2.399,dy=coneY(rr)-.08;
  const dot=part(new THREE.SphereGeometry(.055,6,5),glow(i%3?'#cfe6ff':'#ffe9a8'),Math.cos(aa)*rr,dy,Math.sin(aa)*rr);
  dot.userData.noMerge=true;
 }
 const finial=part(new THREE.OctahedronGeometry(.3,0),glow('#ffe9a8'),0,C.canopyBase+C.canopyHeight+.45,0);
 finial.userData={buildingId:STORY_STARS_ID,districtId:group.userData.districtId,pulse:true};world.animated.push(finial);
 // The mobile: three constellations of glowing book-stars turning slowly under the canopy.
 const mobile=new THREE.Group();mobile.position.set(0,0,0);group.add(mobile);
 let lastT=0;
 type Star={pivot:THREE.Group;halo:THREE.Mesh};
 type Cons=Bloom&object;
 const conses:{group:THREE.Group;stars:Star[];lines:THREE.MeshBasicMaterial[];petals:THREE.Mesh[];bloomT:number;i:number}[]=[];
 SHAPES.forEach(([shape,pts],ci)=>{
  const a=ci*2.094+Math.PI/6,cx=Math.cos(a)*C.mobileRadius,cz=Math.sin(a)*C.mobileRadius,cy=C.mobileY+(ci%2)*.35;
  const cons=new THREE.Group();cons.position.set(cx,cy,cz);cons.rotation.y=-a+Math.PI/2;mobile.add(cons);
  // Hanging thread from the canopy underside.
  const topY=coneY(C.mobileRadius)-.1,thread=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,topY-cy-.4,4),copper(.1));
  thread.position.set(cx,(topY+cy)/2-.2,cz);thread.userData={buildingId:STORY_STARS_ID,districtId:group.userData.districtId,noMerge:true};mobile.add(thread);
  const stars:Star[]=[],lines:THREE.MeshBasicMaterial[]=[];
  pts.forEach(([sx,sy],si)=>{
   const star=new THREE.Group();star.position.set(sx*1.35,sy*1.35,0);cons.add(star);
   const pages=new THREE.Mesh(new THREE.BoxGeometry(.46,.1,.33),cream());pages.rotation.x=-.35;star.add(pages);
   const pivot=new THREE.Group();pivot.position.set(-.26,.07,0);star.add(pivot);
   const cover=new THREE.Mesh(new THREE.BoxGeometry(.55,.06,.4),enamel(covers[(ci+si)%4],.55));
   cover.position.set(.26,0,0);cover.rotation.x=-.35;pivot.add(cover);
   const halo=new THREE.Mesh(new THREE.OctahedronGeometry(.14,0),glow('#ffe9a8'));halo.position.set(0,.3,0);star.add(halo);
   for(const m of [pages,cover,halo]){m.userData={buildingId:STORY_STARS_ID,districtId:group.userData.districtId};world.hit.push(m)}
   stars.push({pivot,halo});
  });
  for(let si=0;si<pts.length-1;si++){
   const [x1,y1]=pts[si],[x2,y2]=pts[si+1],len=Math.hypot(x2-x1,y2-y1)*1.35,lm=lineMat();
   const seg=new THREE.Mesh(new THREE.CylinderGeometry(.013,.013,len,4),lm);
   seg.position.set((x1+x2)*.675,(y1+y2)*.675,0);seg.rotation.z=Math.atan2(y2-y1,x2-x1)-Math.PI/2;
   seg.userData={buildingId:STORY_STARS_ID,districtId:group.userData.districtId,noMerge:true};cons.add(seg);lines.push(lm);
  }
  // Two light petals that drift down to the reading circle while the bloom wave runs.
  const petals=[0,1].map(k=>{
   const p=new THREE.Mesh(new THREE.OctahedronGeometry(.09,0),glow(k?'#9fd8ff':'#ffe9a8'));
   p.visible=false;p.userData={buildingId:STORY_STARS_ID,districtId:group.userData.districtId,dreamPart:true};
   group.add(p);world.animated.push(p);return p;
  });
  const rec={group:cons,stars,lines,petals,bloomT:-99,i:ci};
  // Tap a book-star of this constellation: it blooms now.
  const bloom: Bloom=()=>{rec.bloomT=lastT};
  cons.traverse(o=>{if((o as THREE.Mesh).isMesh)o.userData.storyBloom=bloom});
  cons.traverse(o=>{if((o as THREE.Mesh).isMesh&&!world.hit.includes(o as THREE.Mesh))world.hit.push(o as THREE.Mesh)});
  conses.push(rec);
 });
 mobile.userData={dreamTick:(t:number)=>{
  lastT=t;mobile.rotation.y=t*.12;
  for(const rec of conses){
   // A gentle auto-cycle lets each constellation bloom in turn; a tap blooms it right away.
   if(Math.floor(t/12)%conses.length===rec.i&&t-rec.bloomT>12)rec.bloomT=t;
   const dtb=t-rec.bloomT,active=dtb>=0&&dtb<2.6,close=dtb>1.7?Math.min(1,(dtb-1.7)/.6):0;
   rec.stars.forEach((st,si)=>{
    const on=Math.max(0,Math.min(1,(dtb-si*.22)/.35)),env=on*(1-close);
    st.pivot.rotation.z=-1.85*env+Math.sin(t*1.3+si*1.7+rec.i)*.05;
    st.halo.scale.setScalar(1+env*.9+Math.sin(t*2+si)*.06);
   });
   rec.lines.forEach((lm,li)=>{
    const on=Math.max(0,Math.min(1,(dtb-(li+1)*.22)/.35)),env=on*(1-close);
    lm.opacity=.45+env*.55;
   });
   rec.petals.forEach((p,pi)=>{
    const pt=(dtb-.7-pi*.3)/1.3;
    if(!active||pt<0||pt>1){p.visible=false;return}
    p.visible=true;
    const sx=Math.cos(rec.i*2.094+Math.PI/6)*C.mobileRadius,sz=Math.sin(rec.i*2.094+Math.PI/6)*C.mobileRadius,sy=C.mobileY+(rec.i%2)*.35;
    p.position.set(sx*(1-pt)+Math.sin(pt*9+pi)*.15,sy*(1-pt)+Math.sin(pt*Math.PI)*.6+P+.4,sz*(1-pt)+Math.cos(pt*7+pi)*.15);
    p.rotation.y=t*3+pi;
   });
  }
 }};
 world.animated.push(mobile);
 // The entrance name plate on a post beside the path, facing the plaza.
 const px=ex*5.6,pz=ez*5.6;
 part(new THREE.BoxGeometry(.12,1.5,.12),copper(.15),px,P+.75,pz);
 part(new THREE.BoxGeometry(.1,.62,2.6),copper(.22),px,P+1.55,pz).rotation.y=-ea;
 part(new THREE.BoxGeometry(.07,.5,2.44),new THREE.MeshStandardMaterial({color:'#3a2c1c',roughness:.8,metalness:.1}),px-.04,P+1.55,pz).rotation.y=-ea;
 const sign=signText(STORY_STARS_NAME,.19);
 sign.position.set(px-.09,P+1.55,pz);sign.rotation.y=Math.atan2(ex,ez);group.add(sign);
 // Selection framing: a tap-focus should land on the open interior (book columns + mobile), not the whole pad.
 const anchor=new THREE.Group();anchor.position.set(0,2.2,0);group.add(anchor);
 const focusVolume=new THREE.Mesh(new THREE.BoxGeometry(10.5,5.4,10.5),new THREE.MeshBasicMaterial({visible:false}));
 focusVolume.visible=false;focusVolume.userData.noMerge=true;anchor.add(focusVolume);
 group.traverse(o=>{if((o as THREE.Mesh).isMesh)o.userData.focusAnchor=anchor});
}
