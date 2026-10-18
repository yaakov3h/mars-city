import * as THREE from 'three';
import {Text} from 'troika-three-text';
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
 const garden=(x:number,z:number,ww:number,dd:number,y=.5)=>{box(ww,2.7,dd,x,y+1.35,z,glass);box(ww+.1,.1,dd+.1,x,y+2.73,z,copper);for(let i=0;i<3;i++){const xx=x+(i-1)*ww*.27;box(.6,.2,.6,xx,y+.1,z,dark);w.catalogTree(g,xx,y+.2,z,i,'oct18-garden-'+x+'-'+i,.8);}for(const dx of [-ww/2,ww/2])for(const dz of [-dd/2,dd/2])rod(v(x+dx,y,z+dz),v(x+dx,y+2.7,z+dz),.045);};
 return {stone,copper,dark,glass,box,rod,v,lift,garden};
}
function hebrew(g:THREE.Group,text:string,size:number,color:string,x:number,y:number,z:number,yaw=0){
 const t=new Text();t.text=text;t.direction='rtl';t.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';t.fontSize=size;t.anchorX='center';t.anchorY='middle';t.color=color;t.position.set(x,y,z);t.rotation.y=yaw;t.userData.noMerge=true;g.add(t);t.sync();return t;
}
export function monumentsAvenue(part:Part,g:THREE.Group,w:World){
 const{stone,copper,dark,glass,box,rod,v,lift,garden}=kit(part,g,w);
 const glow=new THREE.MeshBasicMaterial({color:'#ffd899'});
 // A quiet processional walk flanked by eight small plinths, each with a tiny brass figure and its symbol.
 const figure=(x:number,z:number)=>{
  box(1.05,1.05,1.05,x,1.02,z,stone);box(1.17,.13,1.17,x,1.6,z,copper);
  part(new THREE.CylinderGeometry(.17,.22,.58,10),copper,x,1.95,z);
  part(new THREE.SphereGeometry(.15,12,10),copper,x,2.38,z);
  // A glowing story plaque faces the walk from the plinth front.
  box(.68,.46,.06,x,1.0,z+(z<1?-.56:.56),dark);box(.56,.07,.07,x,.86,z+(z<1?-.6:.6),glow);
 };
 const stand=(x:number,z:number,h:number)=>rod(v(x,1.66,z),v(x,1.66+h,z),.035,copper);
 const row=[[-2.6,-2.2],[-2.6,-.6],[-2.6,1],[-2.6,2.6],[2.6,-2.2],[2.6,-.6],[2.6,1],[2.6,2.6]] as const;
 for(const[x,z]of row)figure(x,z);
 // Einstein: a glowing equation plaque on a stand.
 stand(-2.6-.55,-2.2,.5);const eq=box(.5,.34,.04,-3.15,2.32,-2.2,dark);eq.rotation.z=.1;hebrew(g,'E=mc²',.16,'#ffd899',-3.15,2.33,-2.17);
 // Newton: a red apple resting beside the figure.
 part(new THREE.SphereGeometry(.13,12,10),new THREE.MeshStandardMaterial({color:'#b5443c',roughness:.5}),-2.6+.42,1.72,-2.2+.3);
 // Copernicus: an orbit ring circling a small sun.
 stand(-2.6+.55,-.6,.62);const orb=part(new THREE.TorusGeometry(.24,.035,8,24),copper,-2.05,2.45,-.6);orb.rotation.y=.5;part(new THREE.SphereGeometry(.08,10,8),glow,-2.05,2.45,-.6);
 // Tycho: a small golden star for the naked-eye astronomer.
 stand(-2.6-.55,1,.6);part(new THREE.OctahedronGeometry(.16),new THREE.MeshStandardMaterial({color:'#e8c56a',roughness:.35,metalness:.5}),-3.15,2.44,1);
 // Galileo: a small angled telescope on two legs.
 stand(2.6-.55,-2.2,.5);const tel=part(new THREE.CylinderGeometry(.07,.09,.5,8),copper,2.05,2.42,-2.2);tel.rotation.z=1.1;
 // Kepler: a tilted ellipse with its planet.
 stand(2.6+.55,-.6,.62);const ell=part(new THREE.TorusGeometry(.26,.03,8,24),copper,3.15,2.45,-.6);ell.scale.set(1,.62,1);ell.rotation.x=.4;part(new THREE.SphereGeometry(.06,8,6),glow,3.36,2.5,-.6);
 // The Curie couple: two figures together and a softly glowing flask.
 part(new THREE.CylinderGeometry(.15,.2,.52,10),copper,2.6-.28,1.92,1);part(new THREE.SphereGeometry(.13,12,10),copper,2.6-.28,2.3,1);
 part(new THREE.SphereGeometry(.11,10,8),new THREE.MeshBasicMaterial({color:'#9fe6a0'}),2.6+.34,1.78,1+.28);
 // The eighth plinth stays empty, waiting for the next scientist, with a soft question mark.
 hebrew(g,'?',.34,'#ffd899',2.6,2.5,2.6);
 // Colonnade rows shade the walk on both sides.
 for(const s of[-1,1]){for(let i=0;i<5;i++)part(new THREE.CylinderGeometry(.13,.16,3.1,10),stone,s*4.6,2.05,-2.8+i*1.6);box(.5,.18,8.3,s*4.6,3.7,.4,copper);box(.7,.1,8.5,s*4.6,3.84,.4,stone);}
 // A low domed reading rotunda closes the back of the court; the sign band sits on its face.
 part(new THREE.CylinderGeometry(2.2,2.35,2.9,20),stone,0,1.95,-4.6);
 part(new THREE.CylinderGeometry(2.34,2.34,.18,20),copper,0,3.48,-4.6);
 part(new THREE.SphereGeometry(2.14,20,12,0,Math.PI*2,0,Math.PI/2),glass,0,3.55,-4.6);
 box(3.3,.62,.14,0,2.3,-2.32,dark);
 // Warm bollards light the processional walk.
 for(let i=0;i<6;i++){const z=-2.8+i*1.35;box(.1,.5,.1,0,.75,z,dark);box(.16,.1,.16,0,1.04,z,glow);}
 // Two glazed planters frame the entrance steps.
 garden(5,-3.6,2.4,2);garden(-5,-3.6,2.4,2);
 box(3.4,.18,1.2,0,.44,6.6,stone);box(2.8,.18,.8,0,.62,6.3,stone);
 lift();
}
export function teslaStorm(part:Part,g:THREE.Group,w:World){
 const{stone,copper,dark,glass,box,rod,v,lift,garden}=kit(part,g,w);
 const arc=new THREE.MeshBasicMaterial({color:'#cfe8ff'});
 const ceramic=new THREE.MeshStandardMaterial({color:'#e8e2d4',roughness:.55});
 // Three slim Tesla masts of different heights, each crowned by a copper toroid.
 const mast=(x:number,z:number,h:number)=>{
  part(new THREE.CylinderGeometry(.5,.62,.5,10),stone,x,.75,z);
  part(new THREE.CylinderGeometry(.2,.34,h-1.6,10),copper,x,h/2+.5,z);
  for(const a of[0,1,2,3]){const ang=a*Math.PI/2+.4;rod(v(x+Math.cos(ang)*1.25,.5,z+Math.sin(ang)*1.25),v(x+Math.cos(ang)*.3,h*.42,z+Math.sin(ang)*.3),.06,copper);}
  part(new THREE.TorusGeometry(.85,.2,10,26),copper,x,h+.55,z).rotation.x=Math.PI/2;
  part(new THREE.TorusGeometry(.95,.045,8,26),arc,x,h+.55,z).rotation.x=Math.PI/2;
  part(new THREE.SphereGeometry(.24,12,10),arc,x,h+.98,z);
  return new THREE.Vector3(x,h+.98,z);
 };
 const t1=mast(-3.6,-1.2,8.5),t2=mast(.6,-2.8,12.5),t3=mast(3.9,.2,15.5);
 // A stored charge crackles between the two tallest masts.
 const bolt=(a:THREE.Vector3,b:THREE.Vector3)=>{const n=5;for(let i=0;i<n;i++){const p0=a.clone().lerp(b,i/n),p1=a.clone().lerp(b,(i+1)/n);for(const p of[p0,p1])if(i>0&&i<n-1){p.x+=Math.sin(i*7)*.5;p.z+=Math.cos(i*5)*.4;}rod(p0,p1,.03,arc);}};
 bolt(t2,t3);
 // The central capacitor sphere rests on a ceramic insulator cradle.
 box(1.7,.5,1.7,0,.75,2.4,stone);
 for(let i=0;i<3;i++)part(new THREE.CylinderGeometry(.52,.52,.13,14),ceramic,0,1.12+i*.2,2.4);
 part(new THREE.SphereGeometry(1.9,22,16),copper,0,3.6,2.4);
 part(new THREE.TorusGeometry(1.94,.05,8,30),arc,0,3.6,2.4).rotation.x=Math.PI/2;
 for(const a of[0,1,2,3]){const ang=a*Math.PI/2+.78;rod(v(Math.cos(ang)*1.5,1,2.4+Math.sin(ang)*1.5),v(Math.cos(ang)*.9,2.6,2.4+Math.sin(ang)*.9),.08,copper);}
 // Wide grounding ribs spread the charge safely across the plot.
 for(let i=0;i<6;i++){const a=i*Math.PI/3+.26;const r=box(3.6,.07,.5,Math.cos(a)*3.4,.42,Math.sin(a)*3.4,copper);r.rotation.y=-a;}
 // An insulated control pod with a glazed band; the sign band sits on its face.
 box(3.6,2.6,2.6,-4.2,1.8,3.6);box(3.72,.7,2.72,-4.2,2.35,3.6,glass);box(3.9,.16,2.9,-4.2,3.18,3.6,copper);
 box(1,1.9,.1,-2.9,1.45,4.35,dark).rotation.y=Math.PI/2;
 box(2.9,.62,.14,-4.2,2.62,4.98,dark);
 rod(v(-4.2,3.26,3.6),v(-4.2,4.5,3.6),.05,copper);part(new THREE.SphereGeometry(.12,8,8),arc,-4.2,4.62,3.6);
 // A bronze statue of Nikola Tesla holding a glowing bulb greets visitors at the walk.
 const sx=2.7,sz=4.9;
 box(1.2,1.1,1.2,sx,1.05,sz,stone);box(1.34,.14,1.34,sx,1.67,sz,copper);
 part(new THREE.CylinderGeometry(.3,.4,1.35,12),copper,sx,2.42,sz);
 part(new THREE.SphereGeometry(.24,14,12),copper,sx,3.32,sz);
 rod(v(sx-.3,2.85,sz),v(sx-.62,2.1,sz+.15),.07,copper);
 rod(v(sx+.3,2.85,sz),v(sx+.78,3.6,sz-.3),.07,copper);
 part(new THREE.SphereGeometry(.17,12,10),new THREE.MeshBasicMaterial({color:'#ffe9b0'}),sx+.84,3.78,sz-.34);
 hebrew(g,'ניקולה טסלה',.2,'#ffe9b0',sx,1.28,sz+.63);
 garden(-5.2,-3.4,2.4,2);lift();
}
export function oct18Room(root:THREE.Group,cx:number,fy:number,cz:number,monuments:boolean){
 const mat=(c:string)=>new THREE.MeshStandardMaterial({color:c,roughness:.8});const bronze=mat('#a87955'),stone=mat('#cbb28c'),dark=mat('#343334');const glow=new THREE.MeshBasicMaterial({color:'#ffd899'});
 const glass=new THREE.MeshPhysicalMaterial({color:'#cfe1d6',transparent:true,opacity:.22,roughness:.12,side:THREE.DoubleSide,depthWrite:false});
 const box=(a:number,b:number,c:number,x:number,y:number,z:number,m:THREE.Material=stone)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(a,b,c),m);o.position.set(cx+x,fy+y,cz+z);root.add(o);return o;};
 const mesh=(geo:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number)=>{const o=new THREE.Mesh(geo,m);o.position.set(cx+x,fy+y,cz+z);root.add(o);return o;};
 const art=document.createElement('canvas');art.width=1200;art.height=600;const p=art.getContext('2d')!;p.fillStyle='#e5d4b5';p.fillRect(0,0,1200,600);
 if(monuments){
  // A story band of the eight symbols runs across the back wall: apple, prism, orbit, star, telescope, ellipse, flask, and the open question.
  p.strokeStyle='#5c5348';p.lineWidth=7;p.strokeRect(28,28,1144,544);
  const cxr=(i:number)=>150+i*130;
  p.fillStyle='#b5443c';p.beginPath();p.arc(cxr(0),200,34,0,7);p.fill();p.fillStyle='#5c7a4a';p.fillRect(cxr(0)-4,158,8,20);
  p.fillStyle='#a88d62';p.beginPath();p.moveTo(cxr(1)-40,240);p.lineTo(cxr(1),140);p.lineTo(cxr(1)+40,240);p.closePath();p.fill();
  p.strokeStyle='#647e79';p.lineWidth=10;p.beginPath();p.ellipse(cxr(2),200,52,26,-.4,0,7);p.stroke();p.fillStyle='#e8c56a';p.beginPath();p.arc(cxr(2),200,14,0,7);p.fill();
  p.fillStyle='#e8c56a';for(let k=0;k<5;k++){const a=k*Math.PI*2/5-Math.PI/2,a2=a+Math.PI/5;p.beginPath();p.moveTo(cxr(3)+Math.cos(a)*46,200+Math.sin(a)*46);p.lineTo(cxr(3)+Math.cos(a2)*18,200+Math.sin(a2)*18);p.lineTo(cxr(3),200);p.fill();}
  p.fillStyle='#647e79';p.save();p.translate(cxr(4),200);p.rotate(-.5);p.fillRect(-46,-13,92,26);p.fillRect(34,-19,20,38);p.restore();
  p.strokeStyle='#a87955';p.lineWidth=9;p.beginPath();p.ellipse(cxr(5),200,56,24,0,0,7);p.stroke();p.fillStyle='#b67650';p.beginPath();p.arc(cxr(5)+38,192,10,0,7);p.fill();
  p.fillStyle='#8fbf90';p.beginPath();p.moveTo(cxr(6)-22,240);p.lineTo(cxr(6)-14,170);p.lineTo(cxr(6)+14,170);p.lineTo(cxr(6)+22,240);p.closePath();p.fill();
  p.fillStyle='#5c5348';p.font='bold 110px sans-serif';p.textAlign='center';p.fillText('?',cxr(7),238);
  // Eight small niches around the room hold miniature figures with glowing plaques.
  for(let i=0;i<8;i++){const a=i*Math.PI/4+.39,px=Math.cos(a)*4.1,pz=Math.sin(a)*4.1;
   box(.7,.7,.7,px,.35,pz,stone);box(.8,.1,.8,px,.75,pz,bronze);
   if(i!==7){mesh(new THREE.CylinderGeometry(.09,.12,.34,8),bronze,px,1.0,pz);mesh(new THREE.SphereGeometry(.08,8,6),bronze,px,1.24,pz);}else mesh(new THREE.SphereGeometry(.1,8,6),glow,px,1.05,pz);
   box(.4,.3,.05,px*.82,1.15,pz*.82,dark);}
  // A central reading desk with an open book of the scientists' stories.
  box(2,.12,1.1,0,.85,-.4,bronze);box(.14,.8,.14,-.8,.4,-.4,dark);box(.14,.8,.14,.8,.4,-.4,dark);
  box(.62,.05,.44,-.33,.94,-.4,stone).rotation.y=0;const pg1=box(.6,.04,.42,-.32,.95,-.4,mat('#f2ead8'));pg1.rotation.z=.12;const pg2=box(.6,.04,.42,.32,.95,-.4,mat('#f2ead8'));pg2.rotation.z=-.12;
  for(const dz of [-2.4,2.4]){box(1.6,.14,.6,-3.4,.45,dz,stone);box(.14,.4,.5,-3.9,.22,dz,stone);box(.14,.4,.5,-2.9,.22,dz,stone);}
 }else{
  // The storm log mural: charge fronts rolling over the plain.
  p.strokeStyle='#5c5348';p.lineWidth=7;p.strokeRect(28,28,1144,544);
  const cols=['#b67650','#647e79','#a88d62'];
  for(let k=0;k<3;k++){p.strokeStyle=cols[k];p.lineWidth=10-k*2;p.beginPath();for(let x=60;x<=1140;x+=8){const y=170+k*130+Math.sin(x/(60+k*24)+k)*44;p.lineTo(x,y);}p.stroke();}
  p.strokeStyle='#7d8f8a';p.lineWidth=6;for(const bx of[300,620,900]){p.beginPath();p.moveTo(bx,120);p.lineTo(bx-24,190);p.lineTo(bx+8,190);p.lineTo(bx-16,262);p.stroke();}
  // Rows of Leyden jars store the captured charge along both side walls.
  for(const s of[-1,1])for(let i=0;i<3;i++){const px=s*4.4,pz=-2.2+i*2;
   box(.8,.3,.8,px,.15,pz,bronze);mesh(new THREE.CylinderGeometry(.3,.3,1.1,12),glass,px,.85,pz);
   mesh(new THREE.CylinderGeometry(.05,.05,1.5,6),bronze,px,1.05,pz);mesh(new THREE.SphereGeometry(.1,8,6),bronze,px,1.85,pz);}
  // A gauge wall tracks the last storm, and a small arc still snaps between two terminals.
  box(3.2,1.9,.1,-2.9,2.1,5.55,dark);
  for(let i=0;i<4;i++){const gx=-4.0+i*.75;mesh(new THREE.CylinderGeometry(.3,.3,.06,18),mat('#f2ead8'),gx,2.3,5.48).rotation.x=Math.PI/2;
   const nd=box(.05,.26,.04,gx,2.3,5.44,dark);nd.rotation.z=-.8+i*.5;}
  mesh(new THREE.CylinderGeometry(.05,.05,1,6),bronze,3.4,1,3.2);mesh(new THREE.CylinderGeometry(.05,.05,1,6),bronze,4.2,1,3.2);
  const z1=box(.7,.04,.04,3.8,1.6,3.2,glow);z1.rotation.z=.5;const z2=box(.7,.04,.04,3.8,1.75,3.2,glow);z2.rotation.z=-.45;
  // The storm-log desk keeps a handwritten record of every captured front.
  box(1.8,.12,1,2.4,.85,-2.6,bronze);box(.13,.8,.13,1.7,.4,-2.6,dark);box(.13,.8,.13,3.1,.4,-2.6,dark);
  box(.55,.05,.4,2.15,.94,-2.6,mat('#f2ead8')).rotation.z=.1;box(.55,.05,.4,2.75,.94,-2.6,mat('#f2ead8')).rotation.z=-.1;
 }
 const t=new THREE.CanvasTexture(art);t.colorSpace=THREE.SRGBColorSpace;box(5.3,2.75,.12,0,2.2,5.52,bronze);const panel=new THREE.Mesh(new THREE.PlaneGeometry(5.05,2.52),new THREE.MeshBasicMaterial({map:t}));panel.rotation.y=Math.PI;panel.position.set(cx,fy+2.2,cz+5.43);root.add(panel);
 if(!monuments){
  // A real-facts wall about Nikola Tesla, from Britannica, the Nikola Tesla Museum and the US Department of Energy.
  const lines=['ניקולה טסלה (1856–1943)','נולד בסמיליאן, ממציא סרבי-אמריקאי','פיתח את מערכת הזרם החילופין','המציא את סליל טסלה ב-1891','יחידת השטף המגנטי נקראת על שמו'];
  box(4.4,2.5,.1,0,2.2,-5.52,dark);
  lines.forEach((s,i)=>{const tx=new Text();tx.text=s;tx.direction='rtl';tx.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';tx.fontSize=i?0.26:0.3;tx.anchorX='center';tx.anchorY='middle';tx.color=i?'#f2ead8':'#ffd899';tx.position.set(cx,fy+3.1-i*.44,cz-5.43);tx.userData.noMerge=true;root.add(tx);tx.sync();});
 }
}
