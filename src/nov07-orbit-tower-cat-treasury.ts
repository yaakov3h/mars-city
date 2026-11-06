import * as THREE from 'three';
import {Text} from 'troika-three-text';
import {detailedSurface,type World} from './world';
import {EMBLEM_SVG,EMBLEM_NAVY} from './nov07-emblem-art';
type P=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
// Two above-ground landmarks of the 7.11 build, rebuilt bigger: a New-York style stepped tower and a grand treasury hall.
// Both stand fully on the surface in the city's permanent daylight, with nothing below the surface. Each
// fills its own hex on the shared pad and plinth (pad .35 + plinth .6, the same base height as the neighbours) and keeps
// the warm amber-copper of the city with bright Mars enamel accents (coral, saffron, teal, terracotta).
export const MARS_ENAMEL=Object.freeze({coral:'#ff6f59',saffron:'#ffc145',teal:'#2fb8a8',terracotta:'#c8553d'});
export const FLOOR_HEIGHT=2.1;
const enamel=(color:string)=>new THREE.MeshStandardMaterial({color,roughness:.45,metalness:.25});
const signPlate=()=>new THREE.MeshStandardMaterial({color:'#bca07b',roughness:.9,metalness:.05});
function sign(text:string,x:number,y:number,z:number,size=.34){
 const t=new Text();t.text=text;t.direction='rtl';t.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';t.fontSize=size;
 t.anchorX='center';t.anchorY='middle';t.color='#4a3418';t.position.set(x,y,z);t.userData.noMerge=true;t.userData.wallSign=true;t.sync();return t;
}
const surfaceMat=(color:string,kind:'stone'|'metal'='stone',metal=.06,rough=.75)=>{const s=detailedSurface(kind);return new THREE.MeshStandardMaterial({color,map:s.color,normalMap:s.normal,roughnessMap:s.rough,normalScale:new THREE.Vector2(.12,.12),roughness:rough,metalness:metal});};
function hexPad(part:P,stone:THREE.Material,radius:number,top:number){
 const s=new THREE.Shape();for(let k=0;k<6;k++){const a=k*Math.PI/3,px=Math.sin(a)*radius,py=-Math.cos(a)*radius;k?s.lineTo(px,py):s.moveTo(px,py);}s.closePath();
 const geo=new THREE.ExtrudeGeometry(s,{depth:.3,bevelEnabled:false});geo.rotateX(-Math.PI/2);part(geo,stone,0,top-.3,0);
}
// The emblem medallion: a square navy panel with a saffron frame, a cream disc, and the emblem artwork painted on it from
// its exact vector drawing (EMBLEM_SVG). The canvas is ready at once; the drawing lands when the browser has decoded it.
let emblemTex:THREE.CanvasTexture|undefined;
export function emblemTexture(){
 if(emblemTex)return emblemTex;
 const S=1024,cv=document.createElement('canvas');cv.width=cv.height=S;const x=cv.getContext('2d')!;
 x.fillStyle=MARS_ENAMEL.saffron;x.fillRect(0,0,S,S);x.fillStyle=EMBLEM_NAVY;x.fillRect(22,22,S-44,S-44);
 // The cream field with a thin navy keyline, and stepped Art-Deco corners in saffron.
 x.fillStyle='#f6efe2';x.fillRect(64,64,S-128,S-128);x.strokeStyle=EMBLEM_NAVY;x.lineWidth=6;x.strokeRect(84,84,S-168,S-168);
 const sq=(px:number,py:number,sx:number,sy:number)=>x.fillRect(Math.min(px,px+sx),Math.min(py,py+sy),Math.abs(sx),Math.abs(sy));
 for(const [cx,cy] of [[0,0],[1,0],[0,1],[1,1]]){const dx=cx?-1:1,dy=cy?-1:1,ox=cx?S-40:40,oy=cy?S-40:40;x.fillStyle=MARS_ENAMEL.saffron;sq(ox,oy,46*dx,46*dy);sq(ox+46*dx,oy,24*dx,24*dy);sq(ox,oy+46*dy,24*dx,24*dy);}
 const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;emblemTex=tex;
 const img=new Image();img.onload=()=>{const k=S*.8;x.drawImage(img,(S-k)/2,(S-k)/2+4,k,k);tex.needsUpdate=true;};
 img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(EMBLEM_SVG);
 return tex;
}
// Orbit Tower (מגדל המסלול): a New-York style Art-Deco tower on plot q=3 r=-4, east of the Builders Accord.
// Eight storeys of 2.1 (above the five-storey rule of the motif houses, kept modest for a landmark): a two-storey podium
// with a stepped portal and a sunburst fan, a four-storey shaft of saffron piers and navy window bays, one setback
// storey, and a tall emblem storey whose four faces carry the emblem medallion. Above it three stepped sunburst tiers,
// a brass spire and a faceted star that turns slowly on the tip (only through the animation list, so it rests under
// reduced motion). The loose natural stones on this hex are cleared in terrain() (radius 10 around the plot centre).
// Local frame: origin = plot centre, y=0 = the group's ground. The portal faces +z.
export const ORBIT_TOWER_ID='b-orbit-tower-20261107';
export const ORBIT_TOWER_PLOT=Object.freeze({q:3,r:-4});
export const ORBIT_TOWER=Object.freeze({pad:{radius:8.3,top:.35},plinth:{w:11.6,d:9.6,height:.6},
 podium:{w:10,d:8.4,floors:2},shaft:{w:6.4,d:5.6,floors:4},setback:{w:5.4,d:4.8,floors:1},crown:{w:4.8,d:4.8,height:4.4},
 tiers:[{w:4.1,h:1},{w:3.2,h:1},{w:2.3,h:1}],spire:{radius:.42,height:3.6},star:{outer:.9,period:24},emblem:{size:3.9},floors:8});
// The star's five points and inner corners, the same proportions as the star of the emblem drawing (outer 80, inner 34).
// The lighter facets of the emblem's star, as pairs of corners that make a triangle with the star's centre (130,271).
const STAR_FACETS=[[9,0],[2,3],[4,5],[5,6],[7,8]];
const STAR=[[130,191],[150.22,243.17],[206.08,246.28],[162.72,281.63],[177.02,335.72],[130,305.4],[82.98,335.72],[97.28,281.63],[53.92,246.28],[109.78,243.17]];
export function orbitTower(part:P,g:THREE.Group,w:World){
 const stone=surfaceMat('#c7ab86'),terra=surfaceMat('#c96a48'),cream=surfaceMat('#efdcc0'),brass=surfaceMat('#d9a35a','metal',.7,.3),copper=surfaceMat('#d08a4c','metal',.6,.38),dark=surfaceMat('#2f2d2f');
 const navy=new THREE.MeshStandardMaterial({color:EMBLEM_NAVY,roughness:.3,metalness:.4}),pier=enamel(MARS_ENAMEL.saffron),teal=enamel(MARS_ENAMEL.teal),coral=enamel(MARS_ENAMEL.coral);
 const glow=new THREE.MeshBasicMaterial({color:'#fff1d2'}),lit=new THREE.MeshBasicMaterial({color:'#ffd99a'}),warm=new THREE.MeshBasicMaterial({color:'#f7a95e'}),amber=new THREE.MeshBasicMaterial({color:'#ffad4d'}),pane=new THREE.MeshStandardMaterial({color:'#2c4f86',roughness:.15,metalness:.6});
 const box=(a:number,b:number,c:number,x:number,y:number,z:number,m:THREE.Material=stone)=>part(new THREE.BoxGeometry(a,b,c),m,x,y,z);
 const T=ORBIT_TOWER,FH=FLOOR_HEIGHT,P0=T.pad.top,B0=P0+T.plinth.height;
 hexPad(part,stone,T.pad.radius,P0);box(T.plinth.w,T.plinth.height,T.plinth.d,0,P0+T.plinth.height/2,0);
 // One facade bay grid on all four faces of a block: navy window field, lit windows (a few left dark), and piers.
 let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 const faces=(bw:number,bd:number,y0:number,floors:number,cols:number,pierMat:THREE.Material)=>{
  for(const [fw,off,axis,sgn] of [[bw,bd/2,'z',1],[bw,bd/2,'z',-1],[bd,bw/2,'x',1],[bd,bw/2,'x',-1]] as [number,number,'x'|'z',number][]){
   const n=axis==='z'?cols:Math.max(3,cols-1),span=fw-.7,step=span/n,h=floors*FH;
   const at=(u:number,y:number,d:number,a:number,b:number,c:number,m:THREE.Material)=>axis==='z'?box(a,b,c,u,y,sgn*(off+d),m):box(c,b,a,sgn*(off+d),y,u,m);
   at(0,y0+h/2,.02,span,h-.3,.06,navy);
   for(let f=0;f<floors;f++)for(let i=0;i<n;i++){const r=rnd();at(-span/2+step*(i+.5),y0+f*FH+FH*.5,.06,step*.5,FH*.56,.05,r<.3?pane:r<.7?lit:warm);}
   for(let i=0;i<=n;i++)at(-span/2+step*i,y0+h/2,.12,.2,h,.2,pierMat);
   for(let f=1;f<floors;f++)at(0,y0+f*FH,.09,span,.1,.1,copper);
  }
 };
 // Podium: two storeys of terracotta stone with brass piers, a cornice, and the stepped portal on the front.
 const pd=T.podium,y1=B0+pd.floors*FH;box(pd.w,pd.floors*FH,pd.d,0,B0+pd.floors*FH/2,0,terra);faces(pd.w,pd.d,B0,pd.floors,6,brass);
 box(pd.w+.3,.28,pd.d+.3,0,y1+.14,0,cream);box(pd.w+.1,.1,pd.d+.1,0,y1+.33,0,pier);
 const fz=pd.d/2;
 for(const [k,ww,hh,m] of [[0,3.6,3.4,brass],[1,3,3.1,coral],[2,2.3,2.8,dark]] as [number,number,number,THREE.Material][])box(ww,hh,.1,0,B0+hh/2,fz+.32-k*.06,m);
 box(1.7,2,.06,0,B0+1,fz+.3,glow);box(.08,2,.08,0,B0+1,fz+.34,brass);
 // Sunburst fan over the doors: a saffron half disc with brass rays.
 const fan=part(new THREE.CircleGeometry(.72,24,0,Math.PI),pier,0,B0+2.02,fz+.33);fan.userData.noMerge=true;
 for(let k=0;k<7;k++){const a=Math.PI*(k+.5)/7,ray=box(.05,.62,.04,Math.cos(a)*.36,B0+2.02+Math.sin(a)*.36,fz+.36,brass);ray.rotation.z=a-Math.PI/2;}
 box(3.4,.62,.07,0,y1-.45,fz+.35,signPlate());g.add(sign('מגדל המסלול',0,y1-.45,fz+.4));
 // Shaft: four storeys, saffron piers running the full height (the Deco vertical lines), teal corner fins.
 const sh=T.shaft,y2=y1+.38+sh.floors*FH;box(sh.w,sh.floors*FH,sh.d,0,y1+.38+sh.floors*FH/2,0,terra);faces(sh.w,sh.d,y1+.38,sh.floors,4,pier);
 for(const sx of [-1,1])for(const sz of [-1,1])box(.34,sh.floors*FH+.6,.34,sx*(sh.w/2+.05),y1+.38+sh.floors*FH/2+.2,sz*(sh.d/2+.05),teal);
 box(sh.w+.3,.26,sh.d+.3,0,y2+.13,0,cream);box(sh.w+.1,.1,sh.d+.1,0,y2+.31,0,coral);
 // Setback storey and its brass band.
 const sb=T.setback,y3=y2+.36+sb.floors*FH;box(sb.w,sb.floors*FH,sb.d,0,y2+.36+sb.floors*FH/2,0,terra);faces(sb.w,sb.d,y2+.36,sb.floors,4,pier);
 box(sb.w+.24,.24,sb.d+.24,0,y3+.12,0,brass);
 // Emblem storey: a cream block with the emblem medallion on all four faces, framed in brass with teal fins.
 const cr=T.crown,y4=y3+.24+cr.height,cy=y3+.24+cr.height/2;box(cr.w,cr.height,cr.d,0,cy,0,cream);
 const em=new THREE.MeshBasicMaterial({map:emblemTexture(),toneMapped:false}),E=T.emblem.size;
 for(const [rx,rz,ry] of [[0,1,0],[0,-1,Math.PI],[1,0,Math.PI/2],[-1,0,-Math.PI/2]]){
  const m=part(new THREE.PlaneGeometry(E,E),em,rx*(cr.w/2+.07),cy,rz*(cr.d/2+.07));m.rotation.y=ry;m.userData.noMerge=true;m.userData.emblem=true;
  const fr=(a:number,b:number,u:number,v:number)=>rz?box(a,b,.12,u,v,rz*(cr.d/2+.04),brass):box(.12,b,a,rx*(cr.w/2+.04),v,u,brass);
  fr(E+.3,.15,0,cy+E/2+.08);fr(E+.3,.15,0,cy-E/2-.08);fr(.15,E+.3,-(E/2+.08),cy);fr(.15,E+.3,E/2+.08,cy);}
 for(const sx of [-1,1])for(const sz of [-1,1])box(.3,cr.height+.4,.3,sx*cr.w/2,cy,sz*cr.d/2,teal);
 box(cr.w+.3,.22,cr.d+.3,0,y4+.11,0,brass);
 // Three stepped sunburst tiers: each a smaller block with a brass arch and lit triangular windows on every face.
 let yt=y4+.22;
 for(const [i,t] of T.tiers.entries()){box(t.w,t.h,t.w,0,yt+t.h/2,0,i%2?pier:coral);
  for(const [rx,rz,ry] of [[0,1,0],[0,-1,Math.PI],[1,0,Math.PI/2],[-1,0,-Math.PI/2]]){
   const at=(u:number,y:number,d:number)=>new THREE.Vector3(rx*(t.w/2+d)+(rz?u:0),y,rz*(t.w/2+d)+(rx?-u:0)),r2=Math.min(t.h*.92,t.w*.36);
   for(const [r0,r1,m] of [[r2*.84,r2,brass],[r2*.52,r2*.62,pier]] as [number,number,THREE.Material][]){const p=at(0,yt+.02,.03),arc=part(new THREE.RingGeometry(r0,r1,24,1,0,Math.PI),m,p.x,p.y,p.z);arc.rotation.y=ry;arc.userData.noMerge=true;}
   for(let k=0;k<5;k++){const a=Math.PI*(k+.5)/5,p=at(Math.cos(a)*r2*.42*(rx?-1:1)*(rz<0||rx<0?-1:1),yt+.02+Math.sin(a)*r2*.42,.035),ray=part(new THREE.PlaneGeometry(.07,r2*.3),glow,p.x,p.y,p.z);ray.rotation.set(0,ry,0);ray.rotateZ(a-Math.PI/2);ray.userData.noMerge=true;}
   for(const k of [-1,1]){const p=at(k*(t.w/2-.28),yt+t.h*.5,.035),side=part(new THREE.PlaneGeometry(.14,t.h*.6),glow,p.x,p.y,p.z);side.rotation.y=ry;side.userData.noMerge=true;}}
  yt+=t.h;}
 // Spire: a brass needle with coral collars, and the faceted star on its tip.
 const sp=T.spire,needle=new THREE.MeshStandardMaterial({color:'#f2c062',metalness:.45,roughness:.3});part(new THREE.ConeGeometry(sp.radius,sp.height,8),needle,0,yt+sp.height/2,0);
 for(const k of [.15,.4])part(new THREE.CylinderGeometry(sp.radius*(1-k)+.06,sp.radius*(1-k)+.06,.12,8),teal,0,yt+sp.height*k,0);
 const s=new THREE.Shape(),sc=T.star.outer/80;STAR.forEach(([px,py],k)=>{const X=(px-130)*sc,Y=-(py-271)*sc;k?s.lineTo(X,Y):s.moveTo(X,Y);});s.closePath();
 const starGeo=new THREE.ExtrudeGeometry(s,{depth:.16,bevelEnabled:true,bevelThickness:.04,bevelSize:.03,bevelSegments:1});starGeo.translate(0,0,-.08);
 const pivot=new THREE.Group();pivot.position.set(0,yt+sp.height+T.star.outer*.75,0);g.add(pivot);
 const starMat=new THREE.MeshStandardMaterial({color:'#1f3a6e',emissive:'#2a4a86',emissiveIntensity:.6,metalness:.35,roughness:.35});
 const st=part(starGeo,starMat,0,0,0);pivot.add(st);st.userData.noMerge=true;
 const facet=new THREE.MeshStandardMaterial({color:'#2a4a86',emissive:'#3a5fa3',emissiveIntensity:.5,metalness:.3,roughness:.3,side:THREE.DoubleSide});
 for(const sgn of [1,-1])for(const [ia,ib] of STAR_FACETS){const c=new THREE.Vector3(0,0,sgn*.13),a=STAR[ia],b=STAR[ib];const v=(p:number[])=>new THREE.Vector3((p[0]-130)*sc,-(p[1]-271)*sc,sgn*.13);
  const geo=new THREE.BufferGeometry().setFromPoints([c,v(a),v(b)]);geo.computeVertexNormals();const f=part(geo,facet,0,0,0);pivot.add(f);f.userData.noMerge=true;}
 pivot.userData.towerStar=true;pivot.userData.dreamTick=(t:number)=>{pivot.rotation.y=t*Math.PI*2/T.star.period;};
 w.animated.push(pivot);
 // Plaza lamps along the front of the plinth.
 for(const sx of [-4.4,4.4]){part(new THREE.CylinderGeometry(.07,.09,2.2,8),brass,sx,B0+1.1,fz+.6);part(new THREE.SphereGeometry(.2,12,10),amber,sx,B0+2.3,fz+.6);}
}
// Cat Treasury (קופת החתולים): a grand Mars treasury hall on plot q=2 r=-3, south of the Builders Accord, for the cats'
// savings ledger app. Three storeys of 2.1 under a teal dome: a terracotta hall behind a portico of six teal columns with
// saffron capitals, a pediment carrying a big cat emblem, a drum and ribbed dome topped by a small golden sitting cat.
// The two cat safes stand in front of the steps like guardian statues, one per cat: big vaults on pedestals with round
// brass doors, a dial, a three-spoke handle, a coin slot, two ears and a curled tail. The loose stones are cleared in terrain().
// Local frame: origin = plot centre, y=0 = the group's ground. The doors face +z.
export const CAT_TREASURY_ID='b-cat-treasury-20261107';
export const CAT_TREASURY_PLOT=Object.freeze({q:2,r:-3});
export const CAT_TREASURY=Object.freeze({pad:{radius:8.3,top:.35},plinth:{w:12,d:9.2,height:.6},hall:{w:10,d:5.6,z:-1.6,floors:3},
 portico:{columns:6,z:2.3,radius:.3,span:8.4},pediment:{rise:1.9},dome:{radius:2.5,drum:1.1},catEmblem:{radius:.72},
 safes:[{x:-4.65,z:3.7},{x:4.65,z:3.7}],safe:{w:1.9,h:1.8,d:1.6,pedestal:.45}});
export function catTreasury(part:P,g:THREE.Group,_w:World){
 const stone=surfaceMat('#c7ab86'),terra=surfaceMat('#cf7650'),cream=surfaceMat('#efdcc0'),dark=surfaceMat('#2f2d2f'),brass=surfaceMat('#d9a35a','metal',.7,.3),patina=surfaceMat('#8a5a3a','metal',.55,.5);
 const teal=enamel(MARS_ENAMEL.teal),saffron=enamel(MARS_ENAMEL.saffron),coral=enamel(MARS_ENAMEL.coral),terracotta=enamel(MARS_ENAMEL.terracotta),gold=new THREE.MeshStandardMaterial({color:'#f4bd52',metalness:.4,roughness:.35}),goldDoor=new THREE.MeshStandardMaterial({color:'#e9b65a',metalness:.45,roughness:.35});
 const glow=new THREE.MeshBasicMaterial({color:'#fff1d2'}),lit=new THREE.MeshBasicMaterial({color:'#ffd99a'}),amber=new THREE.MeshBasicMaterial({color:'#ffad4d'}),pink=new THREE.MeshBasicMaterial({color:'#e7a08a'}),eye=new THREE.MeshBasicMaterial({color:'#2fb8a8'});
 const box=(a:number,b:number,c:number,x:number,y:number,z:number,m:THREE.Material=stone)=>part(new THREE.BoxGeometry(a,b,c),m,x,y,z);
 const T=CAT_TREASURY,FH=FLOOR_HEIGHT,P0=T.pad.top,B0=P0+T.plinth.height,H=T.hall.floors*FH,hz=T.hall.z,fz=hz+T.hall.d/2,top=B0+H;
 hexPad(part,stone,T.pad.radius,P0);box(T.plinth.w,T.plinth.height,T.plinth.d,0,P0+T.plinth.height/2,0);
 // Front steps from the pad up to the portico floor.
 for(let k=0;k<3;k++)box(5-k*.2,.2,.45,0,P0+.1+k*.2,T.plinth.d/2+.9-k*.45,cream);
 // Hall: terracotta stone body with a cream base course, a brass cornice and tall arched windows on the side walls.
 box(T.hall.w,H,T.hall.d,0,B0+H/2,hz,terra);box(T.hall.w+.2,.5,T.hall.d+.2,0,B0+.25,hz,cream);
 for(const sx of [-1,1])for(let k=0;k<3;k++){const z=hz-1.8+k*1.8;box(.05,2.9,1.1,sx*(T.hall.w/2+.01),B0+2.65,z,brass);box(.06,2.6,.9,sx*(T.hall.w/2+.02),B0+2.6,z,lit);
  const a=part(new THREE.CircleGeometry(.45,16,0,Math.PI),lit,sx*(T.hall.w/2+.03),B0+3.9,z);a.rotation.y=sx*Math.PI/2;a.userData.noMerge=true;
  box(.1,.12,1.1,sx*(T.hall.w/2+.05),B0+1.25,z,brass);}
 // The front wall behind the columns: a tall bronze door with a lit transom and two lit windows each side.
 box(1.8,3.2,.12,0,B0+1.6,fz+.04,patina);box(.06,3.2,.14,0,B0+1.6,fz+.06,brass);box(1.8,.7,.08,0,B0+3.6,fz+.04,glow);
 for(const sx of [-1,1])for(const u of [2.1,3.7]){box(1,2.7,.05,sx*u,B0+2.45,fz+.02,brass);box(.8,2.4,.06,sx*u,B0+2.4,fz+.04,lit);const ar=part(new THREE.CircleGeometry(.4,16,0,Math.PI),lit,sx*u,B0+3.6,fz+.04);ar.userData.noMerge=true;box(.05,2.4,.08,sx*u,B0+2.4,fz+.06,brass);}
 // Portico: six teal columns with saffron capitals and bases, a cream entablature with a saffron frieze, the name sign.
 const pc=T.portico,colH=H-.7;
 for(let i=0;i<pc.columns;i++){const x=-pc.span/2+i*pc.span/(pc.columns-1);
  part(new THREE.CylinderGeometry(pc.radius*.9,pc.radius,colH,16),teal,x,B0+colH/2,pc.z);
  for(let k=0;k<8;k++){const a=k*Math.PI/4;box(.05,colH-.2,.05,x+Math.cos(a)*pc.radius*.95,B0+colH/2,pc.z+Math.sin(a)*pc.radius*.95,cream);}
  box(pc.radius*2.6,.3,pc.radius*2.6,x,B0+colH-.15,pc.z,saffron);box(pc.radius*2.4,.22,pc.radius*2.4,x,B0+.11,pc.z,brass);}
 const ed=pc.z+.6-fz,ezc=fz+ed/2;
 box(T.hall.w+.3,.7,ed,0,top-.35,ezc,cream);box(T.hall.w+.34,.18,ed+.04,0,top-.55,ezc,saffron);
 box(4,.5,.07,0,top-.32,pc.z+.62,signPlate());g.add(sign('קופת החתולים',0,top-.32,pc.z+.67,.4));
 // Pediment: a terracotta triangle with a brass rim and the big cat emblem in its tympanum.
 const pr=T.pediment.rise,pw=T.hall.w+.3,tri=new THREE.Shape();tri.moveTo(-pw/2,0);tri.lineTo(pw/2,0);tri.lineTo(0,pr);tri.closePath();
 const pg=new THREE.ExtrudeGeometry(tri,{depth:ed,bevelEnabled:false});pg.translate(0,0,-ed/2);part(pg,terracotta,0,top,ezc);
 for(const s of [-1,1]){const r=box(Math.hypot(pw/2,pr)+.1,.14,.2,s*pw/4,top+pr/2,pc.z+.62,brass);r.rotation.z=-s*Math.atan2(pr,pw/2);}
 const ce=T.catEmblem.radius,cy=top+pr*.42,cz=pc.z+.66,head=new THREE.Shape();
 head.absarc(0,0,ce,-Math.PI*.18,Math.PI*1.18,true);head.lineTo(-ce*.82,ce*1.15);head.lineTo(-ce*.3,ce*.92);head.lineTo(0,ce*.98);head.lineTo(ce*.3,ce*.92);head.lineTo(ce*.82,ce*1.15);head.closePath();
 const hg=new THREE.ExtrudeGeometry(head,{depth:.12,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:1});
 part(hg,saffron,0,cy-ce*.1,cz-.06);
 for(const s of [-1,1]){part(new THREE.SphereGeometry(.12,12,8),eye,s*ce*.38,cy+ce*.02,cz+.12);box(.32,.025,.02,s*ce*.85,cy-ce*.3,cz+.13,dark).rotation.z=s*.12;box(.32,.025,.02,s*ce*.85,cy-ce*.42,cz+.13,dark).rotation.z=-s*.08;}
 part(new THREE.SphereGeometry(.07,10,8),pink,0,cy-ce*.22,cz+.13);
 // Roof, drum and the ribbed teal dome, crowned by a small golden sitting cat.
 box(T.hall.w,.3,T.hall.d,0,top+.15,hz,brass);
 const dm=T.dome,dy=top+.3;part(new THREE.CylinderGeometry(dm.radius+.15,dm.radius+.25,dm.drum,24),cream,0,dy+dm.drum/2,hz);
 for(let k=0;k<12;k++){const a=k*Math.PI/6;box(.16,dm.drum-.25,.16,Math.cos(a)*(dm.radius+.27),dy+dm.drum/2,hz+Math.sin(a)*(dm.radius+.27),saffron);if(k%2)box(.04,.55,.3,Math.cos(a)*(dm.radius+.25),dy+dm.drum/2,hz+Math.sin(a)*(dm.radius+.25),glow).rotation.y=-a;}
 part(new THREE.SphereGeometry(dm.radius,28,14,0,Math.PI*2,0,Math.PI/2),teal,0,dy+dm.drum,hz);
 for(let k=0;k<8;k++){const rib=part(new THREE.TorusGeometry(dm.radius+.02,.05,6,16,Math.PI/2),brass,0,dy+dm.drum,hz);rib.rotation.y=k*Math.PI/4;}
 const ly=dy+dm.drum+dm.radius;part(new THREE.CylinderGeometry(.42,.5,.55,12),brass,0,ly+.2,hz);
 const cat=ly+.48;part(new THREE.SphereGeometry(.38,16,12),gold,0,cat+.32,hz).scale.set(1,1.15,.9);part(new THREE.SphereGeometry(.26,16,12),gold,0,cat+.86,hz+.05);
 for(const s of [-1,1]){const ear=part(new THREE.ConeGeometry(.12,.3,4),gold,s*.15,cat+1.16,hz+.05);ear.rotation.set(0,Math.PI/4,-s*.25);}
 part(new THREE.SphereGeometry(.13,12,10),gold,0,cat+.78,hz+.27).scale.set(1.2,.8,.8);for(const s of [-1,1])part(new THREE.SphereGeometry(.12,10,8),gold,s*.2,cat+.08,hz+.3);
 const tail=part(new THREE.TorusGeometry(.3,.06,8,16,Math.PI*1.2),gold,.18,cat+.14,hz-.28);tail.rotation.set(Math.PI/2,0,-.4);
 // The two cat safes as guardian statues on pedestals, coral and saffron, facing the street.
 const sf=T.safe;
 for(const [i,p] of T.safes.entries()){const body=i?coral:saffron,y0=B0+sf.pedestal,cyS=y0+sf.h/2,front=p.z+sf.d/2;
  box(sf.w+.5,sf.pedestal,sf.d+.4,p.x,B0+sf.pedestal/2,p.z,cream);box(sf.w+.6,.08,sf.d+.5,p.x,B0+sf.pedestal,p.z,brass);
  box(sf.w,sf.h,sf.d,p.x,cyS,p.z,body);box(sf.w+.08,.12,sf.d+.08,p.x,y0+.06,p.z,patina);
  const door=part(new THREE.CylinderGeometry(.62,.62,.1,28),goldDoor,p.x,cyS-.06,front+.05);door.rotation.x=Math.PI/2;
  const dial=part(new THREE.CylinderGeometry(.19,.19,.1,18),dark,p.x,cyS+.08,front+.14);dial.rotation.x=Math.PI/2;
  for(let k=0;k<3;k++){const a=k*Math.PI*2/3+(i?.4:0),spk=box(.07,.5,.05,p.x+Math.cos(a)*.25,cyS-.28+Math.sin(a)*.25,front+.15,brass);spk.rotation.z=a-Math.PI/2;}
  box(.5,.05,.12,p.x,y0+sf.h+.01,p.z-.15,dark);box(.42,.02,.04,p.x,y0+sf.h+.04,p.z-.15,amber);
  for(const s of [-1,1]){const ear=part(new THREE.ConeGeometry(.34,.6,4),body,p.x+s*(sf.w/2-.34),y0+sf.h+.3,p.z+.2);ear.rotation.y=Math.PI/4;
   const inner=part(new THREE.ConeGeometry(.18,.38,3),pink,p.x+s*(sf.w/2-.34),y0+sf.h+.25,p.z+.38);inner.rotation.y=Math.PI;}
  for(const s of [-1,1])box(.24,.07,.04,p.x+s*.36,cyS+.56,front+.02,amber);
  const tl=part(new THREE.TorusGeometry(.46,.1,8,20,Math.PI*1.4),body,p.x+(i?-.35:.35),cyS+.15,p.z-sf.d/2-.25);tl.rotation.set(0,Math.PI/2,i?Math.PI*.2:-Math.PI*.2);}
 // Coin stacks on the top step, between the safes.
 for(const sx of [-1.6,1.6])for(let k=0;k<5;k++)part(new THREE.CylinderGeometry(.2,.2,.07,16),gold,sx,B0+.035+k*.075,T.plinth.d/2-.5);
}
