import * as THREE from 'three';
import {Text} from 'troika-three-text';
import type {World} from './world';
import {random} from './model';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
// Granny House: a huge kitsch embroidery house in the style of a grandmother's home. Its walls are wallpaper
// panels of Israeli aircraft in many patterns, framed by cream moulding, with lace curtains, a scalloped roof and
// giant embroidery hoops. Fully above ground in the city's permanent daylight.
export const GRANNY_HOUSE_ID='b-granny-house-20261126';
export const GRANNY_HOUSE_PLOT=Object.freeze({q:6,r:0});
export const GRANNY_HOUSE_NAME='בית סבתא';
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
// ---------- the Granny House ----------
function jet(ctx:CanvasRenderingContext2D,x:number,y:number,s:number,a:number,color:string,twin=false){
 ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.scale(s*1.7,s*1.7);ctx.fillStyle=color;ctx.beginPath();
 const pts:[number,number][]=[[0,-1],[.08,-.6],[.5,.2],[.5,.4],[.12,.3],[.1,.75],[.3,.95],[.28,1],[-.28,1],[-.3,.95],[-.1,.75],[-.12,.3],[-.5,.4],[-.5,.2],[-.08,-.6]];
 pts.forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py));ctx.closePath();ctx.fill();
 if(twin){ctx.fillRect(-.32,.55,.07,.4);ctx.fillRect(.25,.55,.07,.4)}
 ctx.restore();
}
function heli(ctx:CanvasRenderingContext2D,x:number,y:number,s:number,color:string){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=.07;
 ctx.beginPath();ctx.ellipse(0,0,.55,.3,0,0,Math.PI*2);ctx.fill();ctx.fillRect(.4,-.06,.9,.12);ctx.fillRect(1.2,-.3,.07,.34);
 ctx.beginPath();ctx.moveTo(-1,-.42);ctx.lineTo(1,-.42);ctx.stroke();ctx.fillRect(-.03,-.42,.06,.2);ctx.restore();
}
function wallpaper(style:number){
 const S=512,c=document.createElement('canvas');c.width=S;c.height=S;const ctx=c.getContext('2d')!;
 const bgs=['#7fc4e8','#f3b6c4','#f2c14e','#1f2f5c','#2fb8a8','#ff8a6b'];ctx.fillStyle=bgs[style];ctx.fillRect(0,0,S,S);
 if(style===0){ctx.fillStyle='#ffffff';for(let i=0;i<7;i++){const cx=(i*97)%S,cy=60+(i*149)%S;for(let k=0;k<4;k++){ctx.beginPath();ctx.arc(cx+k*26,cy+(k%2)*10,30+k%2*8,0,7);ctx.fill()}}for(let r=0;r<3;r++)for(let q=0;q<3;q++)jet(ctx,q*180+(r%2)*90+60,r*170+90,34,.3+r*.1,'#f4f6f8');}
 if(style===1){for(let r=0;r<3;r++)for(let q=0;q<3;q++){const cx=q*190+70+(r%2)*60,cy=r*180+70;ctx.fillStyle='#d8566f';for(let k=0;k<6;k++){ctx.beginPath();ctx.arc(cx+Math.cos(k)*18,cy+Math.sin(k)*18,16,0,7);ctx.fill()}ctx.fillStyle='#8c2f4a';ctx.beginPath();ctx.arc(cx,cy,10,0,7);ctx.fill();ctx.fillStyle='#4e8a4a';ctx.beginPath();ctx.ellipse(cx+34,cy+26,20,8,.7,0,7);ctx.fill();jet(ctx,cx+86,cy+82,26,.8,'#ffffff')}}
 if(style===2){ctx.fillStyle='#e4a028';for(let x=0;x<S;x+=64)ctx.fillRect(x,0,32,S);for(let r=0;r<4;r++)for(let q=0;q<3;q++)jet(ctx,q*170+(r%2)*80+70,r*130+70,28,-.2+r*.15,'#7a3b1d',true)}
 if(style===3){for(let r=0;r<4;r++)for(let q=0;q<4;q++){const x=q*130+60+(r%2)*60,y=r*130+60;if((q+r)%3===0)heli(ctx,x,y,30,'#ffd166');else jet(ctx,x,y,30,.5,'#ffd166');ctx.fillStyle='#fff1b8';ctx.fillRect(x+44,y-28,6,6)}}
 if(style===4){ctx.fillStyle='rgba(255,255,255,.28)';for(let x=0;x<S;x+=64){ctx.fillRect(x,0,32,S);ctx.fillRect(0,x,S,32)}for(let r=0;r<3;r++)for(let q=0;q<3;q++)jet(ctx,q*180+80,r*170+90,32,-.5,'#ffffff')}
 if(style===5){ctx.fillStyle='rgba(255,255,255,.7)';for(let r=0;r<12;r++)for(let q=0;q<12;q++){ctx.beginPath();ctx.arc(q*48+(r%2)*24,r*48,7,0,7);ctx.fill()}for(let r=0;r<3;r++)for(let q=0;q<3;q++)jet(ctx,q*180+70+(r%2)*40,r*170+80,34,.15,'#2c2a55')}
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;return tex;
}
function hoopTexture(seed:number){
 const S=256,c=document.createElement('canvas');c.width=S;c.height=S;const ctx=c.getContext('2d')!;ctx.fillStyle='#f6efe2';ctx.fillRect(0,0,S,S);
 const cols=['#d8566f','#ffc145','#2fb8a8','#7a4fb0','#ff6f59'];ctx.lineCap='round';
 for(let p=0;p<9;p++){const a=p*Math.PI*2/9+seed;ctx.strokeStyle=cols[(p+seed)%cols.length];ctx.lineWidth=3;for(let s=0;s<16;s++){const r0=18+s*3.3;ctx.beginPath();ctx.moveTo(S/2+Math.cos(a-.22)*r0,S/2+Math.sin(a-.22)*r0);ctx.lineTo(S/2+Math.cos(a+.22)*(r0+34),S/2+Math.sin(a+.22)*(r0+34));ctx.stroke()}}
 ctx.fillStyle='#ffc145';ctx.beginPath();ctx.arc(S/2,S/2,16,0,7);ctx.fill();
 ctx.strokeStyle='#4e8a4a';ctx.lineWidth=4;for(let k=0;k<12;k++){ctx.beginPath();ctx.arc(S/2,S/2,100+(k%2)*5,k*.52,k*.52+.24);ctx.stroke()}
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}
function laceTexture(){
 const S=128,c=document.createElement('canvas');c.width=S;c.height=S;const ctx=c.getContext('2d')!;ctx.fillStyle='#fbf6ec';ctx.fillRect(0,0,S,S);ctx.strokeStyle='#d9ccb4';ctx.lineWidth=3;
 for(let y=0;y<S;y+=32)for(let x=0;x<S;x+=32){ctx.beginPath();ctx.arc(x+16,y+16,11,0,7);ctx.stroke();ctx.beginPath();ctx.arc(x+16,y+16,4,0,7);ctx.stroke()}
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;return tex;
}
export function grannyHouse(part:Part,group:THREE.Group,world:World){
 const C=NEIGHBOURHOOD,P=C.padTop;
 const ea=Math.atan2(.3,-1);
 pad(part,group,ea,GRANNY_HOUSE_NAME,'#fff1d0');
 const body=new THREE.Group();group.add(body);body.rotation.y=Math.atan2(Math.cos(ea),Math.sin(ea));body.scale.set(1.15,1.25,1.15);
 const add=(g:THREE.BufferGeometry,m:THREE.Material,x=0,y=0,z=0)=>{const mesh=part(g,m,x,y,z);body.add(mesh);return mesh};
 const W=11,D=7.2,H=13,FY=P+.5;
 add(new THREE.BoxGeometry(W+1,.5,D+1),matte('#e9d9c2'),0,P+.25,0);
 add(new THREE.BoxGeometry(W,H,D),matte('#fff4dd',.85),0,FY+H/2,0);
 // Wallpaper panels, a different aircraft pattern on each, framed by cream moulding.
 const panels:[number,number,number,number,number][]=[[-4.1,D/2+.03,2.3,0,0],[-1.4,D/2+.03,2.3,0,1],[1.6,D/2+.03,2.3,0,2],[4.2,D/2+.03,2.3,0,3]];
 const wp=[0,1,2,3,4,5].map(wallpaper);
 const wmat=(i:number,ry:number)=>{const t=wp[i].clone();t.repeat.set(ry<2?.7:1,ry);t.needsUpdate=true;return new THREE.MeshStandardMaterial({map:t,roughness:.8})};
 const wm=wp.map((_,i)=>wmat(i,i<4?3.6:.9));
 for(const [bx,ix] of [[-3.6,5],[0,0],[3.6,2]] as [number,number][]){const bp=add(new THREE.BoxGeometry(3.2,H-1.2,.08),wmat(ix,3),bx,FY+H/2+.1,-(D/2+.03));bp.userData.noMerge=true;add(new THREE.BoxGeometry(3.5,.18,.12),matte('#fff7e8'),bx,FY+H-.45,-(D/2+.04));add(new THREE.BoxGeometry(3.5,.18,.12),matte('#fff7e8'),bx,FY+.5,-(D/2+.04))}
 for(const [px,pz,pw,ry,ix] of panels){
  const p=add(new THREE.BoxGeometry(pw,H-1.2,.08),wm[ix],px,FY+H/2+.1,pz);p.userData.noMerge=true;
  add(new THREE.BoxGeometry(pw+.28,.18,.12),matte('#fff7e8'),px,FY+H-.45,pz+.02);add(new THREE.BoxGeometry(pw+.28,.18,.12),matte('#fff7e8'),px,FY+.5,pz+.02);
 }
 for(const s of [-1,1]){
  const p=add(new THREE.BoxGeometry(.08,H-1.2,D-1.2),wm[s>0?4:5],s*(W/2+.03),FY+H/2+.1,0);p.userData.noMerge=true;
  add(new THREE.BoxGeometry(.12,.18,D-.9),matte('#fff7e8'),s*(W/2+.04),FY+H-.45,0);
 }
 // Door, windows with lace curtains, scalloped lace trim under the eaves.
 add(new THREE.BoxGeometry(1.8,3.4,.2),enamel('#2fb8a8',.15),-1.4,FY+1.7,D/2+.15);
 add(new THREE.SphereGeometry(.12,8,6),copper(.25),-.8,FY+1.7,D/2+.3);
 const lace=new THREE.MeshStandardMaterial({map:laceTexture(),roughness:.9});
 for(const x of [-4.1,1.6]){add(new THREE.BoxGeometry(1.6,1.7,.2),enamel('#9ed8e8',.2),x,FY+3.4,D/2+.18);const l=add(new THREE.PlaneGeometry(.75,1.5),lace,x-.42,FY+3.4,D/2+.3);l.userData.noMerge=true;const l2=add(new THREE.PlaneGeometry(.75,1.5),lace,x+.42,FY+3.4,D/2+.3);l2.userData.noMerge=true}
 for(const x of [-4.1,-1.4,1.6,4.2]){add(new THREE.BoxGeometry(1.6,1.7,.2),enamel('#9ed8e8',.2),x,FY+8.6,D/2+.18);const l=add(new THREE.PlaneGeometry(.75,1.5),lace,x-.42,FY+8.6,D/2+.3);l.userData.noMerge=true;const l2=add(new THREE.PlaneGeometry(.75,1.5),lace,x+.42,FY+8.6,D/2+.3);l2.userData.noMerge=true}
 for(let i=0;i<22;i++){const x=-W/2+.35+i*(W-.7)/21;add(new THREE.SphereGeometry(.28,8,6,0,Math.PI*2,Math.PI/2,Math.PI/2),matte('#fffaf0'),x,FY+H+.05,D/2+.35).scale.set(1,.7,1)}
 // Pitched roof of scalloped pink and teal tile rows.
 const roofH=4.6,ang=Math.atan2(roofH,W/2+.3);
 for(const s of [-1,1]){
  const slant=Math.hypot(roofH,W/2+.3)+.4;
  const rows=8;
  for(let r=0;r<rows;r++){
   const t=(r+.5)/rows,y=FY+H+t*roofH+.1,x=s*(W/2+.3)*(1-t),len=slant/rows*1.35;
   const roofRow=add(new THREE.BoxGeometry(len,.22,D+1.2),enamel(r%2?'#f08aa8':'#3fbfb0',.15),x,y,0);roofRow.rotation.z=-s*ang;
  }
 }
 // Front and back gable triangles in cream with a wallpaper band, so the roof reads as a house roof from the front.
 for(const gs of [1,-1]){
  const sh=new THREE.Shape();sh.moveTo(-W/2-.4,0);sh.lineTo(W/2+.4,0);sh.lineTo(0,roofH+.1);sh.closePath();
  const gm=add(new THREE.ShapeGeometry(sh),new THREE.MeshStandardMaterial({color:'#fff1d0',roughness:.85,side:THREE.DoubleSide}),0,FY+H,gs*(D/2+.12));gm.userData.noMerge=true;
  const tm=new THREE.Shape();tm.moveTo(-W/2+.9,.35);tm.lineTo(W/2-.9,.35);tm.lineTo(0,roofH-.9);tm.closePath();
  const t2=wp[gs>0?3:2].clone();t2.repeat.set(1.2,.8);t2.needsUpdate=true;
  const gm2=add(new THREE.ShapeGeometry(tm),new THREE.MeshStandardMaterial({map:t2,roughness:.8,side:THREE.DoubleSide}),0,FY+H,gs*(D/2+.16));gm2.userData.noMerge=true;
 }
 add(new THREE.BoxGeometry(.5,.3,D+1.3),copper(.22),0,FY+H+roofH+.05,0);
 // Gable: a big embroidery hoop above the door.
 const hoopMat=new THREE.MeshStandardMaterial({map:hoopTexture(1),roughness:.9});
 const hoop=(x:number,y:number,z:number,r:number,sd:number)=>{const m=new THREE.MeshStandardMaterial({map:hoopTexture(sd),roughness:.9});const disc=add(new THREE.CircleGeometry(r,28),m,x,y,z);disc.userData.noMerge=true;add(new THREE.TorusGeometry(r+.06,.14,8,30),matte('#a8643a',.6),x,y,z)};
 void hoopMat;
 hoop(0,FY+H+1.7,D/2+.45,1.25,0);
 // Chimney, a roof cat and the crossed giant knitting needles.
 add(new THREE.BoxGeometry(1.1,2.6,1.1),enamel('#c8553d',.1),3.6,FY+H+1.9,-.4);
 const cat=new THREE.Group();cat.position.set(3.6,FY+H+3.3,-.4);body.add(cat);
 const cadd=(g:THREE.BufferGeometry,m:THREE.Material,x=0,y=0,z=0)=>{const mesh=part(g,m,x,y,z);cat.add(mesh);return mesh};
 cadd(new THREE.CapsuleGeometry(.3,.5,4,8),enamel('#e07a3a',.15),0,0,0).rotation.z=Math.PI/2;cadd(new THREE.SphereGeometry(.26,10,8),enamel('#e07a3a',.15),.55,.12,0);
 for(const s of [-1,1])cadd(new THREE.ConeGeometry(.09,.2,4),enamel('#e07a3a',.15),.62,.38,s*.12);
 cadd(new THREE.TorusGeometry(.12,.04,6,12),glow('#4fd8be'),.62,.12,.26);cadd(new THREE.CylinderGeometry(.06,.04,.7,6),enamel('#e07a3a',.15),-.7,.15,0).rotation.z=.9;
 for(const s of [-1,1]){const n=add(new THREE.CylinderGeometry(.07,.07,4.6,8),copper(.25),s*.5,FY+H+roofH+2.1,0);n.rotation.z=-s*.42;add(new THREE.SphereGeometry(.2,8,6),enamel('#ff6f59',.3),s*(.5+Math.sin(.42)*2.3),FY+H+roofH+2.1+Math.cos(.42)*2.3,0)}
 // Giant yarn ball on the front lawn with a thread trailing to the door.
 const ball=new THREE.Group();ball.position.set(3.8,FY+2.1,D/2+2.4);ball.scale.setScalar(1.3);body.add(ball);
 const bm=part(new THREE.SphereGeometry(2.4,28,18),enamel('#ff6f59',.2),0,0,0);ball.add(bm);bm.userData.noMerge=true;
 const wrapCols=['#ffc145','#2fb8a8','#7a4fb0','#fff4dd'];
 for(let k=0;k<9;k++){const r=part(new THREE.TorusGeometry(2.43*Math.sin((k+.7)*Math.PI/10.4),.09,6,34),enamel(wrapCols[k%4],.25),0,2.43*Math.cos((k+.7)*Math.PI/10.4),0);r.rotation.x=Math.PI/2+(k%3)*.15;r.rotation.y=k*.6;ball.add(r)}
 for(let k=0;k<7;k++){const r=part(new THREE.TorusGeometry(2.45,.08,6,34),enamel(wrapCols[(k+1)%4],.25),0,0,0);r.rotation.set(k*.45,k*.9,k*.3);ball.add(r)}
 const needle=part(new THREE.CylinderGeometry(.07,.07,4.2,8),copper(.25),-1.2,1.8,0);needle.rotation.z=.9;ball.add(needle);
 const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(3.6-.9,FY+.4,D/2+1.5),new THREE.Vector3(2.4,FY+.15,D/2+1.8),new THREE.Vector3(.8,FY+.15,D/2+1.1),new THREE.Vector3(-.4,FY+.2,D/2+1.9),new THREE.Vector3(-1.4,FY+.2,D/2+.6)]);
 add(new THREE.TubeGeometry(curve,28,.1,6),enamel('#ff6f59',.25));
 // Garden: picket fence with scalloped caps and rose bushes.
 const rose=['#d8566f','#ff8fb1','#ffc145','#fff1f4'];
 for(let i=0;i<9;i++){const x=-5.2+i*1.3;add(new THREE.BoxGeometry(.28,1.1,.12),matte('#fffaf0'),x,FY+.55,D/2+4.6);add(new THREE.ConeGeometry(.17,.25,4),matte('#fffaf0'),x,FY+1.2,D/2+4.6).rotation.y=Math.PI/4}
 add(new THREE.BoxGeometry(11.4,.12,.1),matte('#fffaf0'),0,FY+.8,D/2+4.6);
 for(let i=0;i<8;i++){const x=-5+i*1.45+(i%2)*.25,z=D/2+3.8+(i%2)*.4;add(new THREE.SphereGeometry(.5,8,6),matte('#4e8a4a'),x,FY+.35,z);for(let k=0;k<3;k++)add(new THREE.SphereGeometry(.17,6,5),enamel(rose[(i+k)%4],.3),x+Math.cos(k*2)*.28,FY+.7+(k%2)*.12,z+Math.sin(k*2)*.28)}
 // Two more hoops on the sides, and aircraft-patterned bunting along the porch.
 hoop(-W/2-.2,FY+4.2,0,1.0,2);body.children[body.children.length-1].rotation.y=0;
 group.traverse(o=>{const m=(o as THREE.Mesh).material as THREE.Material|undefined;if(m&&(m as any).map)m.userData.preserveRealismSurface=true});
 focus(group,0,9,2,16,18,16);
 void world;
}
