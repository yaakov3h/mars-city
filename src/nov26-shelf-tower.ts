import * as THREE from 'three';
import {Text} from 'troika-three-text';
import type {World} from './world';
import {random} from './model';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
// Shelf Tower (מגדל המדף): a media-and-books tower on the plot next to the Story Stars, shaped like a giant 3D
// bookshelf. Rows of colourful book spines fill its bays, a vintage CRT television with rabbit-ear antenna and a
// slightly flickering screen sits on its roof, and its dark plinth is wrapped in scrolling LED info tickers in the
// style of Times Square. Fully above ground in the city's permanent daylight.
export const SHELF_TOWER_ID='b-shelf-tower-20261126';
export const SHELF_TOWER_PLOT=Object.freeze({q:5,r:1});
export const SHELF_TOWER_NAME='מגדל המדף';
export const NEIGHBOURHOOD=Object.freeze({padRadius:8.3,padTop:.5,shelfMaxHeight:27,houseMaxHeight:14,castleMaxHeight:24});
const matCache=new Map<string,THREE.MeshStandardMaterial>();
const enamel=(c:string,e=.12)=>{const k=c+e;let m=matCache.get(k);if(!m){m=new THREE.MeshStandardMaterial({color:c,roughness:.38,metalness:.22,emissive:new THREE.Color(c),emissiveIntensity:e});matCache.set(k,m)}return m};
const matte=(c:string,r=.8)=>{const k='m'+c+r;let m=matCache.get(k);if(!m){m=new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:.05});matCache.set(k,m)}return m};
const copper=(e=.2)=>enamel('#f0b074',e);
const glow=(c:string)=>new THREE.MeshBasicMaterial({color:c});
const stone=()=>matte('#bca07b',.9);
function signText(text:string,size:number,color='#e8d9c0'){
 const t=new Text();t.text=text;t.direction='rtl';t.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';t.fontSize=size;
 t.anchorX='center';t.anchorY='middle';t.color=color;t.userData.noMerge=true;t.userData.wallSign=true;t.sync();return t;
}
let fontPromise:Promise<void>|null=null;
function signFont(){
 if(!fontPromise)fontPromise=(typeof FontFace==='undefined'?Promise.resolve():new FontFace('MarsLed',`url(${import.meta.env.BASE_URL}fonts/sign-hebrew.ttf)`).load().then(f=>{(document.fonts as any).add(f)}).catch(()=>{}));
 return fontPromise;
}
// ---------- shared pieces ----------
function pad(part:Part,group:THREE.Group,ea:number,name:string,signColor='#e8d9c0',extra=0){
 const C=NEIGHBOURHOOD,P=C.padTop,ex=Math.cos(ea),ez=Math.sin(ea);
 part(new THREE.CylinderGeometry(C.padRadius,C.padRadius+.15,P,6),stone(),0,P/2);
 const strip=part(new THREE.BoxGeometry(.5,.07,3.4),glow('#4fd8be'),ex*(C.padRadius-.5),P+.04,ez*(C.padRadius-.5));
 strip.rotation.y=-ea;strip.userData.noSignature=true;
 for(let k=0;k<4;k++)part(new THREE.BoxGeometry(.6,.06,.5),glow('#ffd166'),ex*(7.6-k*1.05),P+.03,ez*(7.6-k*1.05)).rotation.y=-ea;
 const px=ex*(5.6+extra),pz=ez*(5.6+extra);
 part(new THREE.BoxGeometry(.12,1.5,.12),copper(.15),px,P+.75,pz);
 part(new THREE.BoxGeometry(.1,.62,2.8),copper(.22),px,P+1.55,pz).rotation.y=-ea;
 part(new THREE.BoxGeometry(.07,.5,2.64),matte('#3a2c1c'),px-ex*.04,P+1.55,pz-ez*.04).rotation.y=-ea;
 const sign=signText(name,.2,signColor);sign.position.set(px-ex*.09,P+1.55,pz-ez*.09);sign.rotation.y=Math.atan2(ex,ez);group.add(sign);
}
function focus(group:THREE.Group,x:number,y:number,z:number,w:number,h:number,d:number){
 const anchor=new THREE.Group();anchor.position.set(x,y,z);(anchor as any).toJSON=()=>({});group.add(anchor);
 const vol=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({visible:false}));
 vol.visible=false;vol.userData.noMerge=true;anchor.add(vol);
 group.traverse(o=>{if((o as THREE.Mesh).isMesh&&o!==vol)o.userData.focusAnchor=anchor});
}
function driver(world:World,group:THREE.Group,fn:(t:number)=>void){
 const d=new THREE.Object3D();d.userData.dreamTick=fn;group.add(d);world.animated.push(d);
}
// ---------- the Shelf Tower ----------
function ledTexture(text:string,color:string){
 const W=2048,H=64,c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d')!;
 const draw=()=>{
  ctx.fillStyle='#070707';ctx.fillRect(0,0,W,H);
  ctx.font='800 58px MarsLed, Arial, sans-serif';ctx.textBaseline='alphabetic';ctx.fillStyle=color;
  const w0=Math.max(40,ctx.measureText(text).width),k=Math.max(1,Math.round(W/w0)),sx=W/(k*w0);
  ctx.save();ctx.scale(sx,1);for(let i=0;i<k;i++)ctx.fillText(text,i*w0,52);ctx.restore();
  ctx.fillStyle='rgba(0,0,0,.34)';for(let x=0;x<W;x+=5)ctx.fillRect(x,0,1,H);
 };
 draw();
 const tex=new THREE.CanvasTexture(c);tex.wrapS=THREE.RepeatWrapping;tex.colorSpace=THREE.SRGBColorSpace;tex.repeat.set(.22,1);
 signFont().then(()=>{draw();tex.needsUpdate=true});
 return tex;
}
function tvTexture(){
 const W=512,H=384,c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d')!;
 const bars=['#e8e8e8','#e8e000','#00e8e8','#00e000','#e000e8','#e00000','#0000e8'];
 bars.forEach((b,i)=>{ctx.fillStyle=b;ctx.fillRect(i*W/7,0,W/7+1,H*.68)});
 ['#0000e8','#101010','#e000e8','#101010','#00e8e8','#101010','#e8e8e8'].forEach((b,i)=>{ctx.fillStyle=b;ctx.fillRect(i*W/7,H*.68,W/7+1,H*.1)});
 ctx.fillStyle='#10163a';ctx.fillRect(0,H*.78,W,H*.22);
 ctx.fillStyle='#f6efe2';ctx.fillRect(W*.15,H*.82,W*.7,H*.12);ctx.fillStyle='#10163a';ctx.font='700 40px Arial';ctx.textAlign='center';ctx.fillText('NOW SHOWING',W/2,H*.915);
 ctx.fillStyle='rgba(0,0,0,.35)';for(let y=0;y<H;y+=4)ctx.fillRect(0,y,W,1.6);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapT=THREE.RepeatWrapping;return tex;
}
export function shelfTower(part:Part,group:THREE.Group,world:World){
 const C=NEIGHBOURHOOD,P=C.padTop;
 const ea=Math.atan2(-1,-.2);
 pad(part,group,ea,SHELF_TOWER_NAME);
 const body=new THREE.Group();body.rotation.y=-Math.atan2(Math.cos(ea),Math.sin(ea))+0;group.add(body);
 // The body frame is built facing +z, then turned so its front faces the entrance ray.
 body.rotation.y=Math.atan2(Math.cos(ea),Math.sin(ea));
 const add=(g:THREE.BufferGeometry,m:THREE.Material,x=0,y=0,z=0)=>{const mesh=part(g,m,x,y,z);body.add(mesh);return mesh};
 const W=9,D=3.6,PL=4.2,SH=14.2,TOP=P+PL+SH;
 // Plinth with LED tickers on all four faces.
 add(new THREE.BoxGeometry(W+1.2,PL,D+1.2),matte('#2a2420',.7),0,P+PL/2,0);
 add(new THREE.BoxGeometry(W+1.5,.28,D+1.5),copper(.2),0,P+PL+.14,0);
 add(new THREE.BoxGeometry(W+1.5,.28,D+1.5),copper(.2),0,P+.14,0);
 const tex=[ledTexture('ספרים · סרטים · סדרות · BOOKS · FILMS · SERIES · ','#ffb534'),ledTexture('עכשיו קוראים · NOW READING · עכשיו צופים · NOW SHOWING · ','#35e0ff'),ledTexture('הספרייה לא נסגרת · OPEN 24/7 · NEXT UP · ★ · ','#ff5fa8')];
 const mats=tex.map(t=>{const m=new THREE.MeshBasicMaterial({map:t});m.toneMapped=false;return m});
 const faces:[number,number,number,number][]=[[0,(D+1.2)/2+.02,W+.6,0],[0,-(D+1.2)/2-.02,W+.6,Math.PI],[(W+1.2)/2+.02,0,D+.2,Math.PI/2],[-(W+1.2)/2-.02,0,D+.2,-Math.PI/2]];
 faces.forEach(([fx,fz,fw,ry],fi)=>{
  [0,1,2].forEach(row=>{
   const strip=add(new THREE.PlaneGeometry(fw,1.2),mats[(row+fi)%3],fx,P+.75+row*1.3,fz);strip.rotation.y=ry;
   if(fi>1)strip.scale.x=1;
  });
 });
 // Two angled Times-Square style billboards on the front corners.
 for(const sd of [-1,1]){const bx=sd*(W/2+3.1),bz=D/2+1.3;add(new THREE.BoxGeometry(.18,3.2,.18),copper(.15),bx,P+1.6,bz);add(new THREE.BoxGeometry(4.0,2.1,.14),matte('#1c1612'),bx,P+3.5,bz).rotation.y=-sd*.45;const b=add(new THREE.PlaneGeometry(3.7,1.8),mats[sd>0?1:2],bx-sd*.0,P+3.5,bz+.09);b.rotation.y=-sd*.45;b.position.x+=sd*.04;b.position.z+=.04}
 // The shelf: two side panels, top, back, shelf boards and book rows.
 add(new THREE.BoxGeometry(.5,SH,D),enamel('#8a4f2b',.1),-W/2+.25,P+PL+SH/2,0);
 add(new THREE.BoxGeometry(.5,SH,D),enamel('#8a4f2b',.1),W/2-.25,P+PL+SH/2,0);
 add(new THREE.BoxGeometry(W,.5,D),enamel('#8a4f2b',.1),0,TOP-.25,0);
 add(new THREE.BoxGeometry(W-.4,SH,.25),enamel('#e0794a',.2),0,P+PL+SH/2,-D/2+.12);
 const bays=5,bh=(SH-.5)/bays,covers=['#c8553d','#ff6f59','#ffc145','#2fb8a8','#2c2a55','#e2e2d0','#7a4fb0','#4aa3df','#9ccf5f'];
 for(let b=0;b<bays;b++){
  const y0=P+PL+b*bh;
  add(new THREE.BoxGeometry(W-.5,.22,D),enamel('#a8643a',.1),0,y0+.11,0);
  add(new THREE.BoxGeometry(W-.5,.22,1.1),enamel('#a8643a',.1),0,y0+.11,-D/2-.5);
  let x=-W/2+.65;const end=W/2-.65;let n=0;
  while(x<end-.2){
   const seed='shelf'+b+'-'+n++,w=.22+random(seed+'w')*.4,h=bh*(.45+random(seed+'h')*.4),c=covers[Math.floor(random(seed+'c')*covers.length)];
   const lean=b%2===0&&n%7===0;
   const bk=add(new THREE.BoxGeometry(w,h,D*.72),enamel(c,.14),x+w/2,y0+.22+h/2,.12);if(lean)bk.rotation.z=-.22;
   if(true){const h2=bh*(.4+random(seed+'h2')*.4),c2=covers[Math.floor(random(seed+'c2')*covers.length)];add(new THREE.BoxGeometry(w,h2,1.0),enamel(c2,.14),x+w/2,y0+.22+h2/2,-D/2-.5)}
   x+=w+.02;
  }
  // a small object at the end of some bays: a film reel, a lamp or a globe
  if(b===1){const reel=add(new THREE.TorusGeometry(.5,.12,8,18),copper(.2),W/2-1.3,y0+.8,.2);reel.userData.noMerge=true;add(new THREE.CylinderGeometry(.14,.14,.2,10),copper(.2),W/2-1.3,y0+.8,.2).rotation.x=Math.PI/2}
  if(b===3){add(new THREE.SphereGeometry(.45,12,10),enamel('#4aa3df',.2),-W/2+1.1,y0+.72,.15);add(new THREE.CylinderGeometry(.06,.06,.34,6),copper(.2),-W/2+1.1,y0+.34,.15)}
 }
 // The vintage TV on the roof of the shelf, screen facing the front.
 const TV=new THREE.Group();TV.position.set(0,TOP,0);TV.scale.setScalar(1.4);body.add(TV);
 const tadd=(g:THREE.BufferGeometry,m:THREE.Material,x=0,y=0,z=0)=>{const mesh=part(g,m,x,y,z);TV.add(mesh);return mesh};
 tadd(new THREE.BoxGeometry(6.2,4.6,3.8),enamel('#b9763e',.1),0,2.7,0);
 tadd(new THREE.BoxGeometry(6.5,.3,4.1),matte('#2a1c10'),0,.15,0);
 for(const x of [-2.4,2.4])for(const z of [-1.3,1.3])tadd(new THREE.CylinderGeometry(.18,.3,.5,8),matte('#2a1c10'),x,-.05,z);
 tadd(new THREE.BoxGeometry(4.2,3.4,.3),matte('#1a1a1a',.5),-.55,2.85,1.95);
 const tvTex=tvTexture(),sg=new THREE.PlaneGeometry(3.7,3.0,20,16),sp=sg.attributes.position;
 for(let i=0;i<sp.count;i++){const u=sp.getX(i)/1.85,v=sp.getY(i)/1.5;sp.setZ(i,.32*(1-u*u)*(1-v*v)+.02)}sg.computeVertexNormals();
 const scr=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({map:tvTex}));
 scr.position.set(-.55,2.85,2.02);scr.userData={buildingId:group.userData.buildingId,districtId:group.userData.districtId,noMerge:true};TV.add(scr);world.hit.push(scr);
 tadd(new THREE.BoxGeometry(1.1,3.4,.2),matte('#3b2814'),2.45,2.85,1.9);
 for(let k=0;k<6;k++)tadd(new THREE.BoxGeometry(.8,.08,.12),matte('#1a1208'),2.45,1.7+k*.4,2.03);
 for(const [dy,c] of [[3.9,'#e0c070'],[3.35,'#e0c070']] as [number,string][])tadd(new THREE.CylinderGeometry(.22,.22,.18,12),matte(c,.4),2.45,dy,2.05).rotation.x=Math.PI/2;
 // back of the TV: vent grille, power cable and two knobs so it never reads as a blank slab
 tadd(new THREE.BoxGeometry(4.4,2.6,.12),matte('#2a1c10'),0,2.9,-1.95);
 for(let k=0;k<9;k++)tadd(new THREE.BoxGeometry(3.9,.1,.14),matte('#0e0a06'),0,1.95+k*.22,-2.0);
 for(const x of [-2.2,2.2])tadd(new THREE.CylinderGeometry(.22,.22,.18,12),copper(.2),x,4.55,-1.98).rotation.x=Math.PI/2;
 tadd(new THREE.CylinderGeometry(.07,.07,1.6,6),matte('#101010'),1.6,.9,-1.95);
 // rabbit-ear antenna
 for(const s of [-1,1]){const ear=tadd(new THREE.CylinderGeometry(.04,.04,3.4,6),copper(.25),s*.9,5.4+.1,0);ear.rotation.z=-s*.5;tadd(new THREE.SphereGeometry(.12,8,6),copper(.25),s*(.9+Math.sin(.5)*1.7),5.4+.1+Math.cos(.5)*1.7,0)}
 tadd(new THREE.CylinderGeometry(.4,.55,.35,10),matte('#2a1c10'),0,5.1,0);
 // Screen flicker and a slow rolling bar.
 driver(world,group,t=>{const m=scr.material as THREE.MeshBasicMaterial;m.color.setScalar(.8+.14*Math.sin(t*37)+.06*Math.sin(t*11.3)+(Math.sin(t*2.1)>.97?.12:0));tvTex.offset.y=(Math.sin(t*.7)>.985?.02:0);
  tex.forEach((tx,i)=>{tx.offset.x=(t*(.035+i*.012)*(i===1?-1:1))%1})});
 focus(group,0,TOP/2+2,0,W+2,TOP+6,D+4);
}
