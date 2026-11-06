// Motif Quarter (רובע המוטיבים) — nine five-floor houses carrying the 45 themed rooms that moved above ground, plus the pilot plaza/street/atelier rebuilt on the surface and the rehomed personal gallery wall.
import * as THREE from 'three';
import {Text} from 'troika-three-text';
import type {World} from './world';
import {buildVignette,type Add} from './nov06-motif-vignettes';
import {partnerStatues} from './nov06-partnership-statues';
export type MotifFloor={theme:string;he:string;color:string};
export type MotifHouse={id:string;he:string;en:string;plot:{q:number;r:number};floors:MotifFloor[]};
const F=(theme:string,he:string,color:string):MotifFloor=>({theme,he,color});
export const MOTIF_QUARTER:MotifHouse[]=[
 {id:'b-motif-knowledge-20261106',he:'בית ידע ולמידה',en:'House of Knowledge & Learning',plot:{q:0,r:6},floors:[F('library','ספרייה אקדמית','#7a9b6d'),F('academy','אקדמיית המסע','#8fae7e'),F('tutorial','סדנת ההדרכה','#a5c28f'),F('explainer','סטודיו ההסבר','#bcd6a1'),F('knowledge','עץ הידע','#d4eab3')]},
 {id:'b-motif-screen-sound-20261106',he:'בית מסך וצליל',en:'House of Screen & Sound',plot:{q:1,r:6},floors:[F('presence','בית הנוכחות','#5a7bd9'),F('frequency','אי התדרים','#6f8de0'),F('cinema','קולנוע הבכורה','#85a0e6'),F('sounds','בית הצלילים','#9bb2ec'),F('radio','חדר הרדיו','#b1c5f2')]},
 {id:'b-motif-memory-story-20261106',he:'בית זיכרון וסיפור',en:'House of Memory & Story',plot:{q:2,r:6},floors:[F('monuments','בית האנדרטאות','#a87bb0'),F('civic','ארכיון ההכרעות','#b78dbe'),F('dreams','ארכיון החלומות','#c6a0cc'),F('atlas','אטלס הגרסאות','#d5b2da'),F('accord','אמנת הבונים','#e4c5e8')]},
 {id:'b-motif-journey-horizon-20261106',he:'בית מסע ואופק',en:'House of Journey & Horizon',plot:{q:0,r:7},floors:[F('overseas','קשר חו"ל','#5aa8a0'),F('travel','מרכז מסעות','#6fb6ae'),F('view','בית המבט','#84c4bc'),F('professions','מצפה המקצועות','#99d2ca'),F('launch','בית העלייה לאוויר','#aee0d8')]},
 {id:'b-motif-workshops-tools-20261106',he:'בית סדנאות וכלים',en:'House of Workshops & Tools',plot:{q:1,r:7},floors:[F('imagery','סדנת הדימויים','#c98a5a'),F('shelf','מדף הכלים','#d49b6f'),F('magazine','מגזין הכלים','#dfac84'),F('spatial','מעבדת המרחב','#eabd99'),F('scale','בית המידות','#f5ceae')]},
 {id:'b-motif-city-community-20261106',he:'בית עיר וקהילה',en:'House of City & Community',plot:{q:2,r:7},floors:[F('plaza','כיכר החיבורים','#c9b45a'),F('desk','שולחן פנייה','#d4c26f'),F('links','בית הקישורים','#dfd084'),F('partnership','חדר השותפות','#eade99'),F('tails','שלושת הזנבות','#f5ecae')]},
 {id:'b-motif-strategy-work-20261106',he:'בית אסטרטגיה ועבודה',en:'House of Strategy & Work',plot:{q:0,r:8},floors:[F('search','בניין החיפוש','#8a8f9e'),F('strategy','מסמך אסטרטגי','#9aa0ae'),F('finance','בדיקת עתיד','#aab1be'),F('agents','מעבדת הסוכנים','#bac2ce'),F('preparation','בית ההכנה','#cad3de')]},
 {id:'b-motif-hearts-symbols-20261106',he:'בית ליבות וסמלים',en:'House of Hearts & Symbols',plot:{q:1,r:8},floors:[F('pavilion','ביתן הקונספט','#d97b8a'),F('mosaic','חלל הפסיפס','#e08d9a'),F('core','ליבת בראשית','#e6a0ab'),F('spire','חוד השכבות','#ecb2bc'),F('pyramid','המונומנט הראשון','#f2c5cd')]},
 {id:'b-motif-science-planning-20261106',he:'בית מדע ותכנון',en:'House of Science & Planning',plot:{q:2,r:8},floors:[F('opening','בית הפתיחה','#6d8fc9'),F('planning','בית תכנון הערים','#7f9fd4'),F('tesla','בית סופות טסלה','#91afdf'),F('ramp','מצפה המדרון','#a3bfea'),F('hall','אולם המדרגות','#b5cff5')]},
];
export const MOTIF_FLOOR_HEIGHT=2.1,MOTIF_HOUSE_WIDTH=7.2;
const EMBLEM:Record<string,string>={library:'books',academy:'cap',tutorial:'cap',explainer:'steps',knowledge:'tree',presence:'screen',cinema:'screen',frequency:'waves',sounds:'waves',radio:'antenna',monuments:'column',civic:'table',dreams:'moon',atlas:'map',accord:'arch',overseas:'globe',travel:'globe',view:'scope',professions:'scope',launch:'rocket',imagery:'frame',shelf:'books',magazine:'books',spatial:'ruler',scale:'ruler',plaza:'ring',desk:'table',links:'arch',partnership:'arch',tails:'heart',search:'lens',strategy:'grid',finance:'coin',agents:'lens',preparation:'door',pavilion:'heart',mosaic:'hex',core:'star',spire:'spire',pyramid:'pyramid',opening:'door',planning:'grid',tesla:'bolt',ramp:'steps',hall:'steps'};
function emblem(kind:string,mat:THREE.Material,glow:THREE.Material):THREE.Group{
 const e=new THREE.Group();const add=(geo:THREE.BufferGeometry,m:THREE.Material,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.userData.noMerge=true;e.add(o);return o};
 switch(kind){
  case 'books':add(new THREE.BoxGeometry(.5,.08,.34),mat,0,-.18);add(new THREE.BoxGeometry(.44,.08,.3),glow,.02,-.08);add(new THREE.BoxGeometry(.5,.08,.34),mat,-.02,.02);break;
  case 'cap':add(new THREE.BoxGeometry(.5,.06,.5),mat,0,.1);add(new THREE.CylinderGeometry(.16,.2,.16,4),glow,0,-.04);break;
  case 'steps':for(let i=0;i<3;i++)add(new THREE.BoxGeometry(.2+i*.14,.09,.3),i%2?glow:mat,-.2+i*.14,-.2+i*.1);break;
  case 'tree':add(new THREE.CylinderGeometry(.05,.07,.3,6),mat,0,-.2);add(new THREE.SphereGeometry(.26,10,8),glow,0,.12);break;
  case 'screen':add(new THREE.BoxGeometry(.56,.36,.05),mat,0,0);add(new THREE.BoxGeometry(.44,.24,.06),glow,0,0,.01);break;
  case 'waves':for(let i=0;i<3;i++)add(new THREE.BoxGeometry(.1,.16+i*.14,.1),i===1?glow:mat,-.22+i*.22,-.1+i*.07);break;
  case 'antenna':add(new THREE.CylinderGeometry(.03,.05,.5,6),mat,0,-.05);add(new THREE.SphereGeometry(.09,8,6),glow,0,.24);break;
  case 'column':add(new THREE.BoxGeometry(.4,.08,.3),mat,0,-.22);add(new THREE.CylinderGeometry(.09,.11,.4,8),glow,0,.02);add(new THREE.BoxGeometry(.34,.07,.26),mat,0,.26);break;
  case 'table':add(new THREE.BoxGeometry(.5,.07,.3),mat,0,.08);for(const sx of [-1,1])add(new THREE.BoxGeometry(.06,.26,.06),glow,sx*.2,-.09);break;
  case 'moon':add(new THREE.SphereGeometry(.22,12,8),glow,0,.05);add(new THREE.SphereGeometry(.18,12,8),mat,.12,.12,.06);break;
  case 'map':add(new THREE.BoxGeometry(.5,.34,.04),mat,0,0);add(new THREE.SphereGeometry(.06,8,6),glow,.12,.06,.05);break;
  case 'arch':add(new THREE.TorusGeometry(.24,.06,6,12,Math.PI),glow,0,-.05);for(const sx of [-1,1])add(new THREE.BoxGeometry(.08,.3,.08),mat,sx*.24,-.2);break;
  case 'globe':add(new THREE.SphereGeometry(.2,12,8),mat,0,.02);{const r=add(new THREE.TorusGeometry(.26,.03,6,20),glow,0,.02);r.rotation.x=.6;}break;
  case 'scope':add(new THREE.CylinderGeometry(.07,.09,.4,8),mat,-.08,0).rotation.z=Math.PI/2.4;add(new THREE.CylinderGeometry(.07,.09,.4,8),glow,.1,0).rotation.z=Math.PI/2.4;break;
  case 'rocket':add(new THREE.CylinderGeometry(.09,.12,.34,8),mat,0,-.06);add(new THREE.ConeGeometry(.09,.18,8),glow,0,.2);break;
  case 'frame':for(const [w,h,x,y] of [[.5,.05,0,.2],[.5,.05,0,-.2],[.05,.45,-.24,0],[.05,.45,.24,0]]as const)add(new THREE.BoxGeometry(w,h,.05),glow,x,y);add(new THREE.BoxGeometry(.3,.25,.04),mat,0,0);break;
  case 'ruler':add(new THREE.BoxGeometry(.6,.1,.05),mat,0,0);for(let i=0;i<4;i++)add(new THREE.BoxGeometry(.02,.16,.06),glow,-.24+i*.16,.02);break;
  case 'ring':add(new THREE.TorusGeometry(.22,.06,6,20),glow,0,0);break;
  case 'heart':add(new THREE.SphereGeometry(.14,10,8),glow,-.08,.08);add(new THREE.SphereGeometry(.14,10,8),glow,.08,.08);add(new THREE.ConeGeometry(.2,.26,4),mat,0,-.1).rotation.z=Math.PI;break;
  case 'lens':add(new THREE.TorusGeometry(.18,.05,6,16),mat,0,.06);add(new THREE.CylinderGeometry(.04,.04,.26,6),glow,.2,-.2).rotation.z=Math.PI/4;break;
  case 'grid':for(let i=0;i<4;i++)add(new THREE.BoxGeometry(.16,.16,.05),i%3?mat:glow,(i%2)*.22-.11,Math.floor(i/2)*.22-.11);break;
  case 'coin':add(new THREE.CylinderGeometry(.2,.2,.06,16),glow,0,0).rotation.x=Math.PI/2;break;
  case 'door':add(new THREE.BoxGeometry(.3,.44,.06),mat,0,0);add(new THREE.SphereGeometry(.04,8,6),glow,.09,0,.05);break;
  case 'hex':add(new THREE.CylinderGeometry(.22,.22,.06,6),glow,0,0).rotation.x=Math.PI/2;break;
  case 'star':add(new THREE.OctahedronGeometry(.22),glow,0,.02);break;
  case 'spire':add(new THREE.ConeGeometry(.14,.5,6),mat,0,.05);add(new THREE.SphereGeometry(.06,8,6),glow,0,.34);break;
  case 'pyramid':add(new THREE.ConeGeometry(.26,.3,4),mat,0,-.05);break;
  case 'bolt':add(new THREE.ConeGeometry(.12,.26,4),glow,0,.1).rotation.x=Math.PI;add(new THREE.ConeGeometry(.12,.26,4),mat,0,-.12);break;
 }
 return e;
}
function floorSign(text:string,color:string,width:number):Text{
 const sign=new Text();sign.text=text;sign.direction='rtl';sign.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';sign.fontSize=.34;sign.anchorX='center';sign.anchorY='middle';sign.color=color;sign.userData.noMerge=true;sign.userData.wallSign=true;sign.sync();return sign;
}
export function motifHouse(part:(geo:THREE.BufferGeometry,mat:THREE.Material,px?:number,py?:number,pz?:number)=>THREE.Mesh,group:THREE.Group,world:World,spec:MotifHouse){
 const w=MOTIF_HOUSE_WIDTH,fh=MOTIF_FLOOR_HEIGHT,trim=new THREE.MeshStandardMaterial({color:'#6b5d4f',roughness:.6,metalness:.25});
 part(new THREE.CylinderGeometry(w*.78,w*.9,.5,6),trim,0,.25,0);
 const glassMat=new THREE.MeshStandardMaterial({color:'#dff3f6',roughness:.08,metalness:.1,transparent:true,opacity:.16});
 const lightStrip=new THREE.MeshBasicMaterial({color:'#fff2cf'});
 const signPlate=new THREE.MeshStandardMaterial({color:'#f4e6cc',roughness:.8});
 const slabMat=new THREE.MeshStandardMaterial({color:'#8a7d6b',roughness:.8});
 const winMat=new THREE.MeshStandardMaterial({color:'#fff2cf',emissive:'#ffe9b8',emissiveIntensity:.5,roughness:.3});
 spec.floors.forEach((f,i)=>{
  const y=.5+fh*i,ww=w*(1-i*.045),body=new THREE.MeshStandardMaterial({color:f.color,roughness:.68,metalness:.08});
  part(new THREE.BoxGeometry(ww,.14,ww),slabMat,0,y+.07,0);
  part(new THREE.BoxGeometry(ww-.34,.03,ww-.34),new THREE.MeshStandardMaterial({color:'#e8dcc4',roughness:.85}),0,y+.15,0);
  part(new THREE.BoxGeometry(ww,.56,.16),body,0,y+.28,ww/2-.08);
  part(new THREE.BoxGeometry(ww-.16,fh-.78,.05),glassMat,0,y+.56+(fh-.78)/2,ww/2-.03);
  part(new THREE.BoxGeometry(ww,.12,.14),body,0,y+fh-.06,ww/2-.07);
  for(const sx of [-1,1]){part(new THREE.BoxGeometry(.18,fh-.2,ww),body,sx*(ww/2-.09),y+.1+(fh-.2)/2,0);
   for(const wz of [-1,1])part(new THREE.BoxGeometry(.06,.6,.5),winMat,sx*(ww/2+.01),y+fh*.55,wz*ww*.22);}
  part(new THREE.BoxGeometry(ww,.56,.16),body,0,y+.28,-(ww/2-.08));
  part(new THREE.BoxGeometry(ww-.16,fh-.78,.05),glassMat,0,y+.56+(fh-.78)/2,-(ww/2-.03));
  part(new THREE.BoxGeometry(ww,.12,.14),body,0,y+fh-.06,-(ww/2-.07));
  part(new THREE.BoxGeometry(ww-.7,.06,.34),lightStrip,0,y+fh-.14,0);
  part(new THREE.BoxGeometry(ww*.62,.42,.05),signPlate,0,y+.28,-(ww/2+.012));
  const sign=floorSign(f.he,'#2e2a26',ww);sign.fontSize=.37;sign.position.set(0,y+.28,-(ww/2+.045));sign.rotation.y=Math.PI;group.add(sign);
  const floor=new THREE.Group();floor.position.set(0,y+.16,0);group.add(floor);
  const add:Add=(geo,mat,x,yy,z,rotY=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,yy,z);if(rotY)m.rotation.y=rotY;m.userData.noMerge=true;floor.add(m);return m;};
  buildVignette(f.theme,add,0,f.color);
 });
 const stairMat=new THREE.MeshStandardMaterial({color:'#7d6f5e',roughness:.7});
 const railMat=new THREE.MeshStandardMaterial({color:'#5d5245',roughness:.6,metalness:.3});
 const d=w*.5+.55,cs:number[][]=[[d,-d],[d,d],[-d,d],[-d,-d]];
 for(const [cx2,cz2] of cs)part(new THREE.BoxGeometry(1.15,.12,1.15),stairMat,cx2,.44,cz2);
 for(let f0=0;f0<5;f0++){const s=f0%4,A=cs[s],B=cs[(s+1)%4],dx=B[0]-A[0],dz=B[1]-A[1],D=Math.hypot(dx,dz),ux=dx/D,uz=dz/D,y0=.5+fh*f0,yaw=-Math.atan2(dz,dx);
  for(let k=0;k<8;k++){const t=(k+.5)/8;part(new THREE.BoxGeometry(Math.abs(ux)>.5?D/8+.1:.92,.3,Math.abs(uz)>.5?D/8+.1:.92),stairMat,A[0]+dx*t,y0+((k+1)/8)*fh-.15,A[1]+dz*t);}
  const stringer=new THREE.Group();stringer.position.set((A[0]+B[0])/2,y0+fh/2-.3,(A[1]+B[1])/2);stringer.rotation.y=yaw;
  const sb=new THREE.Mesh(new THREE.BoxGeometry(D*1.01,.34,.9),stairMat);sb.rotation.z=Math.atan2(fh,D);sb.userData.noMerge=true;stringer.add(sb);group.add(stringer);
  const off=.5,ox=uz*off,oz=-ux*off;
  const rail=new THREE.Group();rail.position.set((A[0]+B[0])/2+ox,y0+fh/2+.78,(A[1]+B[1])/2+oz);rail.rotation.y=yaw;
  const rb=new THREE.Mesh(new THREE.BoxGeometry(D*1.02,.07,.07),railMat);rb.rotation.z=Math.atan2(fh,D);rb.userData.noMerge=true;rail.add(rb);group.add(rail);
  for(const t of [0,.25,.5,.75,1])part(new THREE.BoxGeometry(.07,.82,.07),railMat,A[0]+dx*t+ox,y0+fh*t+.41,A[1]+dz*t+oz);
  const L=f0+1,wwL=w*(1-L*.045),c=cs[L%4];
  if(c[1]<0)part(new THREE.BoxGeometry(.9,1.3,.07),railMat,c[0]*.55,.5+fh*L+.75,-(wwL/2+.005));
  else part(new THREE.BoxGeometry(.07,1.3,.9),railMat,Math.sign(c[0])*(wwL/2+.005),.5+fh*L+.75,c[1]*.55);
 }
 for(let k=0;k<3;k++)part(new THREE.BoxGeometry(.9,.12,.5),stairMat,d,.14+k*.16,-(d+.35+k*.32));
 const cap=new THREE.MeshStandardMaterial({color:'#8a7d6b',roughness:.85});
 part(new THREE.CylinderGeometry(w*.34,w*.52,.9,6),cap,0,.5+fh*5+.45,0);
 const crest=emblem(EMBLEM[spec.floors[4].theme]??'star',new THREE.MeshStandardMaterial({color:'#4a423a',roughness:.55,metalness:.3}),new THREE.MeshStandardMaterial({color:spec.floors[4].color,emissive:spec.floors[4].color,emissiveIntensity:.6,roughness:.4}));crest.position.set(0,.5+fh*5+.5,-w*.36);crest.rotation.y=Math.PI;group.add(crest);
 const roofY=.5+fh*5+.9,hasStatues=spec.id==='b-motif-memory-story-20261106';
 const beacon=new THREE.Mesh(new THREE.OctahedronGeometry(.42),new THREE.MeshStandardMaterial({color:spec.floors[4].color,emissive:spec.floors[4].color,emissiveIntensity:.9,roughness:.3}));beacon.position.set(0,roofY+(hasStatues?3.1:.35),0);beacon.userData.noMerge=true;group.add(beacon);world.animated.push(beacon);
 if(hasStatues)partnerStatues(group,0,roofY,-.2);
 const nz=-(w*.5+2.6);
 for(const sx of [-1,1])part(new THREE.BoxGeometry(.1,1.3,.1),trim,sx*w*.3,.65,nz);
 part(new THREE.BoxGeometry(w*.8,.62,.07),signPlate,0,1.05,nz);
 const name=floorSign(spec.he,'#2e2a26',w);name.fontSize=.5;name.position.set(0,1.06,nz-.06);name.rotation.y=Math.PI;group.add(name);
}
// Pilot identities rebuilt above ground at the original pilot footprint: entrance plaza with the glass skylight cluster, the transit street segment with planters and benches, the cafe corner, the atelier pavilion, and the rehomed personal gallery wall.
export const PILOT_GALLERY=[{file:'cat-suitcase.jpg',ratio:1427/805},{file:'couple-palms.jpg',ratio:928/1238},{file:'family-overhead.jpg',ratio:1238/928},{file:'cat-window.jpg',ratio:805/1427},{file:'cat-aircon.jpg',ratio:805/1427}];
export function pilotQuarter(world:World,ground:(x:number,z:number)=>number){
 const root=world.root,base=new THREE.MeshStandardMaterial({color:'#344851',roughness:.8}),wall=new THREE.MeshStandardMaterial({color:'#677b80',roughness:.7}),warm=new THREE.MeshStandardMaterial({color:'#cfbca4',roughness:.75}),cyan=new THREE.MeshStandardMaterial({color:'#70ddea',emissive:'#70ddea',emissiveIntensity:.55,roughness:.35}),yellow=new THREE.MeshStandardMaterial({color:'#e6b667',emissive:'#e6b667',emissiveIntensity:.4,roughness:.5});
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.noMerge=true;root.add(mesh);return mesh};
 const sign=(text:string,x:number,y:number,z:number,rtl=false,color='#f4e6cc',size=.3)=>{const s=new Text();s.text=text;s.direction=rtl?'rtl':'ltr';s.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';s.fontSize=size;s.anchorX='center';s.anchorY='middle';s.color=color;s.position.set(x,y,z);s.userData.noMerge=true;s.userData.wallSign=true;root.add(s);s.sync();return s};
 // Entrance plaza: paving strip with the yellow guide dashes and the glass skylight cluster preserved as a daylight glass floor feature.
 for(let x=-38.5;x<-13;x++)for(let z=1.5;z<7;z++)box(1.01,.16,1.01,x,ground(x,z)+.17,z,base);
 for(let x=-38;x<-13;x+=2)box(.8,.03,.06,x,ground(x,4)+.28,4,yellow);
 const glass=new THREE.MeshPhysicalMaterial({color:'#b9e5e6',transparent:true,opacity:.3,roughness:.12,metalness:.12});
 for(let i=0;i<3;i++)for(let z=2.5;z<6;z++){const x=-27.480762+.5+i;box(1,.14,1,x,ground(x,z)+.34,z,glass);}
 for(let i=0;i<=3;i++){const x=-27.480762+i;box(.025,.12,4,x,ground(x,4)+.42,4,cyan);}
 for(const z of [2,6])box(3,.12,.04,-25.980762,ground(-25.980762,z)+.42,z,cyan);
 // Transit street edge: planter boxes with the original catalog trees and benches.
 for(const x of [-37,-31,-23.9,-8.1]){box(1.5,.18,.4,x,ground(x,6.75)+.35,6.75,warm);box(1.5,.5,.12,x,ground(x,6.92)+.65,6.92,wall);box(.5,.35,.6,x+1.1,ground(x,6.8)+.3,6.8,base);world.catalogTree(root,x+1.1,ground(x,6.8)+.5,6.8,Math.abs(x)%3,'pilot-'+x,.9);}
 const transit=sign('TRANSIT / ROAD RESERVE',-36.5,ground(-36.5,1.6)+1.2,1.6,false,'#e6b667',.32);transit.rotation.y=Math.PI;
 // Cafe corner and atelier pavilion: tables, counter, cyan screen, canopy, and the preserved sign texts.
 for(const x of [-36,-33]){box(.75,.06,.65,x,ground(x,8.5)+.62,8.5,warm);box(.06,.55,.06,x,ground(x,8.5)+.3,8.5,wall);for(const z of [7.9,9.1]){box(.4,.08,.4,x,ground(x,z)+.45,z,warm);box(.4,.35,.06,x,ground(x,z)+.62,z+.17,wall);}}
 box(3,.5,1.1,-34,ground(-34,11)+.45,11,warm);box(2.4,.9,.1,-34,ground(-34,11.5)+1.5,11.5,cyan);
 for(const x of [-37,-31.8]){box(.8,.55,.8,x,ground(x,10)+.3,10,warm);world.catalogTree(root,x,ground(x,10)+.6,10,x===-37?1:2,'pilot-room-'+x,1.1);}
 for(const [px,pz] of [[-38.1,7.2],[-30.9,7.2],[-38.1,11.8],[-30.9,11.8]])box(.18,3,.18,px,ground(px,pz)+1.5,pz,wall);
 box(7.6,.22,5.2,-34.5,ground(-34.5,9.5)+3.1,9.5,base);
 const cafe=sign('CAFE / ATELIER',-34.5,ground(-34.5,9.5)+2.6,9.2,false,'#70ddea',.34);cafe.rotation.y=Math.PI;
 const atelier=sign('ATELIER 01',-34.5,ground(-34.5,7.2)+2.2,7.05,false,'#f4e6cc',.34);atelier.rotation.y=Math.PI;
 // Personal gallery wall rehomed above ground along the pavilion's back wall, original files, ratios and bronze frame style.
 const bronze=new THREE.MeshStandardMaterial({color:'#98704d',roughness:.7,metalness:.35}),matte=new THREE.MeshStandardMaterial({color:'#e2d3b9',roughness:.95});
 box(13.5,.5,.5,-16,ground(-16,7)+.25,7,warm);
 box(13.5,2.6,.24,-16,ground(-16,7)+2.05,7,wall);
 let gx=-21.6;
 PILOT_GALLERY.forEach((photo,i)=>{
  const height=photo.ratio>1?1.45:1.8,width=height*photo.ratio,y=ground(-16,6.84)+2.15,z=6.84;
  const frame=new THREE.Group();frame.userData={personalGallery:true,noMerge:true,photoIndex:i};frame.position.set(gx+width/2+.3,y,z);frame.rotation.y=Math.PI;root.add(frame);gx+=width+.85;
  const fbox=(w:number,h:number,d:number,x:number,yy:number,z:number,m:THREE.Material)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,yy,z);mesh.userData.noMerge=true;frame.add(mesh);return mesh};
  fbox(width+.22,height+.22,.05,0,0,0,matte);
  for(const side of [-1,1]){fbox(width+.34,.06,.09,0,side*(height/2+.14),.035,bronze);fbox(.06,height+.28,.09,side*(width/2+.14),0,.035,bronze);}
  const mat=new THREE.MeshBasicMaterial({color:0xffffff});const image=new THREE.Mesh(new THREE.PlaneGeometry(width,height),mat);image.position.z=.03;image.userData.noMerge=true;frame.add(image);
  new THREE.TextureLoader().load(import.meta.env.BASE_URL+'personal-gallery/'+photo.file,t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,world.renderer.capabilities.getMaxAnisotropy());mat.map=t;mat.needsUpdate=true;});
 });
 const plaza=sign('כיכר הכניסה',-26,ground(-26,5.6)+1.5,5.6,true,'#f4e6cc',.4);plaza.rotation.y=Math.PI;
 }
