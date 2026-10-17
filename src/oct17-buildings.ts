import * as THREE from 'three';
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
 const garden=(x:number,z:number,ww:number,dd:number,y=.5)=>{box(ww,2.7,dd,x,y+1.35,z,glass);box(ww+.1,.1,dd+.1,x,y+2.73,z,copper);for(let i=0;i<3;i++){const xx=x+(i-1)*ww*.27;box(.6,.2,.6,xx,y+.1,z,dark);w.catalogTree(g,xx,y+.2,z,i,'oct17-garden-'+x+'-'+i,.8);}for(const dx of [-ww/2,ww/2])for(const dz of [-dd/2,dd/2])rod(v(x+dx,y,z+dz),v(x+dx,y+2.7,z+dz),.045);};
 return {stone,copper,dark,glass,box,rod,v,lift,garden};
}
export function planningHouse(part:Part,g:THREE.Group,w:World){
 const{stone,copper,dark,glass,box,rod,v,lift,garden}=kit(part,g,w);
 const glow=new THREE.MeshBasicMaterial({color:'#ffd899'});
 const mat2=(c:string)=>new THREE.MeshStandardMaterial({color:c,roughness:.85});
 // Three stepped terraces; each terrace roof carries a miniature glowing city model.
 const slab=(ww:number,dd:number,h:number,x:number,y0:number,z:number)=>{
  box(ww,h,dd,x,y0+h/2,z);box(ww+.3,.14,dd+.3,x,y0+h+.07,z,copper);
  box(ww-.5,1,.07,x,y0+h*.55,z+dd/2+.05,glass);
  for(let i=0;i<6;i++){const bx=x-ww/2+1.1+i*(ww-2.2)/5;for(const dz of [-dd/2+.95,dd/2-.95]){const hh=.22+((i*7+(dz>0?3:0))%5)*.15;box(.42,hh,.42,bx,y0+h+.14+hh/2,z+dz,glow);}}
  box(ww-1.4,.035,.2,x,y0+h+.16,z,dark);
 };
 slab(8.6,6.6,3.2,-.5,.6,-.4);slab(6.6,5.2,2.8,.4,3.8,-.9);slab(4.8,3.9,2.6,-.3,6.6,-1.2);
 // A grand moon-topped tower rises from the upper terrace - the district landmark marking the moon-city game.
 const tx=-.3,tz=-1.2,moonMat=new THREE.MeshBasicMaterial({color:'#fdf3da'});
 box(3.4,6.8,3.4,tx,12.6,tz);
 box(3.75,.24,3.75,tx,16.14,tz,copper);
 for(let i=0;i<5;i++)box(.32,.26+(i%2)*.16,.32,tx-1.35+i*.67,16.39,tz+1.56,glow);
 box(2.6,5.7,2.6,tx,19.1,tz);
 box(2.9,.2,2.9,tx,22.05,tz,copper);
 box(1.8,4,1.8,tx,24.15,tz);
 box(2.15,.18,2.15,tx,26.24,tz,copper);
 // Glazed curtain walls wrap every tower face, with copper mullions and transoms.
 const curtain=new THREE.MeshPhysicalMaterial({color:'#bfdcd4',transparent:true,opacity:.45,roughness:.08,metalness:.15,side:THREE.DoubleSide});
 for(const[ww,y0,hh]of[[3.4,9.2,6.8],[2.6,16.25,5.7],[1.8,22.15,4]]as const){for(const s of[-1,1]){
  box(ww*.86,hh*.9,.06,tx,y0+hh/2,tz+s*(ww/2+.04),curtain);
  box(.06,hh*.9,ww*.86,tx+s*(ww/2+.04),y0+hh/2,tz,curtain);
  for(const m of[-1,0,1]){box(.07,hh*.9,.08,tx+m*ww*.29,y0+hh/2,tz+s*(ww/2+.06),copper);box(.08,hh*.9,.07,tx+s*(ww/2+.06),y0+hh/2,tz+m*ww*.29,copper);}
  const rows=Math.max(2,Math.round(hh/1.6));
  for(let r=1;r<rows;r++){box(ww*.88,.06,.08,tx,y0+r*hh/rows,tz+s*(ww/2+.06),copper);box(.08,.06,ww*.88,tx+s*(ww/2+.06),y0+r*hh/rows,tz,copper);}
 }}
 for(const s of[-1,1])for(const t of[-1,1])rod(v(tx+s*1.68,9.3,tz+t*1.68),v(tx+s*1.68,16,tz+t*1.68),.07,copper);
 // Four copper prongs cradle the moon itself at the tip.
 for(let a=0;a<4;a++){const ang=a*Math.PI/2+Math.PI/4;rod(v(tx+Math.cos(ang)*.98,26.3,tz+Math.sin(ang)*.98),v(tx+Math.cos(ang)*1.5,28.5,tz+Math.sin(ang)*1.5),.075,copper);}
 const my=30.1;
 part(new THREE.SphereGeometry(2.2,28,20),moonMat,tx,my,tz);
 // Faint craters keep it a moon, not a lamp.
 const crater=mat2('#d9c9a8');
 for(const[dx,dy,dz,r]of[[-.9,.7,1.85,.34],[1.35,-.5,1.6,.26],[.4,1.7,1.35,.2],[-1.6,-.9,1.2,.22]]as const){const l=Math.hypot(dx,dy,dz);part(new THREE.SphereGeometry(r,10,8),crater,tx+dx/l*2.16,my+dy/l*2.16,tz+dz/l*2.16);}
 // A tilted copper orbit ring marks the game around its moon.
 const ring=part(new THREE.TorusGeometry(3.05,.09,10,44),copper,tx,my,tz);ring.rotation.x=.5;ring.rotation.z=.28;
 // The tilted model table at the entrance is a real working surface, not a label.
 const ty=(z:number)=>1.75+.287*(4.6-z);
 const table=box(4.6,.18,3.1,.2,1.75,4.6);table.rotation.x=-.28;
 for(const dx of [-1.9,1.9]){box(.22,1.9,.22,dx+.2,.95,4.0,dark);box(.22,1.3,.22,dx+.2,.65,5.35,dark);}
 for(let i=0;i<8;i++){const bx=-1.4+(i%4)*.95,bz=4.1+Math.floor(i/4)*1.05;const cube=box(.34,.3,.34,bx+.2,ty(bz)+.24,bz,glow);cube.rotation.x=-.28;}
 for(const dz of [4.35,5.0]){const r=box(4,.035,.14,.2,ty(dz)+.11,dz,copper);r.rotation.x=-.28;}
 box(5.2,.12,3.6,.2,3.4,4.7,copper);
 for(const dx of [-2.35,2.35])for(const dz of [3.15,6.25])box(.09,2.75,.09,dx+.2,2,dz,copper);
 box(4.4,.5,.14,.2,3.08,6.55,dark);
 garden(4.9,-3.9,2.6,2.2);lift();
}
export function soundsHouse(part:Part,g:THREE.Group,w:World){
 const{stone,copper,dark,glass,box,rod,v,lift,garden}=kit(part,g,w);
 // Two rounded listening chambers of different sizes, joined by a glazed link.
 const chamber=(R:number,h:number,x:number,z:number)=>{
  part(new THREE.CylinderGeometry(R,R,h,28),stone,x,.6+h/2,z);
  part(new THREE.CylinderGeometry(R+.22,R+.22,.2,28),copper,x,.6+h+.1,z);
  for(let i=0;i<10;i++){const a=i*Math.PI/5+.2,px=x+Math.sin(a)*(R+.02),pz=z+Math.cos(a)*(R+.02);const pane=part(new THREE.PlaneGeometry(1.05,h*.42),i%3?glass:copper,px,.6+h*.5,pz);pane.rotation.y=a;}
 };
 chamber(2.6,6.2,-1.8,-.6);chamber(1.7,4,2.7,.7);
 // A curved rank of equalizer ribs rises and falls across the front court.
 for(let i=0;i<13;i++){const a=(i-6)*.17,x=-1.8+Math.sin(a)*4.1,z=-.6+Math.cos(a)*4.1,h=1.3+(Math.sin(i*.9)*.5+.5)*3.2;box(.3,h,.3,x,.6+h/2,z,copper);box(.42,.12,.42,x,.6+h+.06,z,dark);}
 // Three small brass horns on the tall chamber aim the sound outward.
 for(const a of[-.5,0,.5]){const hx=-1.8+Math.sin(a)*1.1,hz=-.6+Math.cos(a)*1.1,horn=part(new THREE.ConeGeometry(.42,1.1,16),copper,hx,7.6,hz);horn.rotation.x=Math.PI/2.4;horn.rotation.z=a;}
 // Glazed link between the chambers carries the fixed wall sign band.
 box(2.2,2.4,1.7,.4,1.8,1.2,glass);box(2.5,.14,2,.4,3.1,1.2,copper);box(2.3,.5,.12,.4,2.9,2.15,dark);
 // A painted poster of musical instruments hangs on the tall chamber's curved wall.
 const art=document.createElement('canvas');art.width=800;art.height=620;const q=art.getContext('2d')!;
 q.fillStyle='#e5d4b5';q.fillRect(0,0,800,620);q.strokeStyle='#a87955';q.lineWidth=18;q.strokeRect(22,22,756,576);
 q.fillStyle='#b67650';q.fillRect(90,152,60,14);q.fillRect(150,142,320,34);
 for(const vx of[210,265,320]){q.fillRect(vx,106,28,36);q.fillRect(vx-4,98,36,10);}
 q.beginPath();q.moveTo(470,159);q.lineTo(585,82);q.lineTo(585,236);q.closePath();q.fill();q.fillRect(585,82,16,154);
 for(const[nx,ny]of[[655,140],[730,205]] as const){q.fillStyle='#343334';q.beginPath();q.ellipse(nx,ny,26,18,-.3,0,7);q.fill();q.fillRect(nx+20,ny-95,10,98);}
 q.save();q.translate(215,470);q.rotate(-.32);q.fillStyle='#a88d62';q.beginPath();q.arc(-60,10,62,0,7);q.fill();q.beginPath();q.arc(10,-6,48,0,7);q.fill();q.fillStyle='#343334';q.fillRect(35,-18,210,24);q.fillRect(235,-26,36,42);q.beginPath();q.arc(-25,3,22,0,7);q.fill();q.restore();
 q.fillStyle='#343334';q.fillRect(545,390,205,170);q.fillStyle='#b67650';q.fillRect(545,390,205,12);
 q.fillStyle='#f2ead8';q.fillRect(560,470,175,26);q.fillStyle='#343334';for(const kx of[575,592,609,635,652,669,686,703,720])q.fillRect(kx,470,10,15);
 q.fillRect(560,560,14,25);q.fillRect(720,560,14,25);
 const tex=new THREE.CanvasTexture(art);tex.colorSpace=THREE.SRGBColorSpace;
 const sa=-.2,ss=Math.sin(sa),sc=Math.cos(sa),mx=-1.8+ss*3.15,my2=4.85,mz=-.6+sc*3.15;
 const mw=part(new THREE.BoxGeometry(3.4,2.6,.1),copper,mx,my2,mz);mw.rotation.y=sa;
 const pp=part(new THREE.PlaneGeometry(3.18,2.38),new THREE.MeshBasicMaterial({map:tex}),-1.8+ss*3.24,my2,-.6+sc*3.24);pp.rotation.y=sa;
 for(const m of[-1,1])for(const ny of[-1,1])rod(v(-1.8+ss*2.58+m*sc*1.45,my2+ny*1.05,-.6+sc*2.58-m*ss*1.45),v(-1.8+ss*3.12+m*sc*1.45,my2+ny*1.05,-.6+sc*3.12-m*ss*1.45),.05,copper);
 garden(.2,-3.7,2.8,2.1);lift();
}
export function oct17Room(root:THREE.Group,cx:number,fy:number,cz:number,planning:boolean){
 const mat=(c:string)=>new THREE.MeshStandardMaterial({color:c,roughness:.8});const bronze=mat('#a87955'),stone=mat('#cbb28c'),dark=mat('#343334');const glow=new THREE.MeshBasicMaterial({color:'#ffd899'});
 const box=(a:number,b:number,c:number,x:number,y:number,z:number,m:THREE.Material=stone)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(a,b,c),m);o.position.set(cx+x,fy+y,cz+z);root.add(o);return o;};
 const art=document.createElement('canvas');art.width=1200;art.height=600;const p=art.getContext('2d')!;p.fillStyle='#e5d4b5';p.fillRect(0,0,1200,600);
 if(planning){
  p.strokeStyle='#5c5348';p.lineWidth=9;
  for(const x of [220,430,640,850,1010]){p.beginPath();p.moveTo(x,60);p.lineTo(x,540);p.stroke();}
  for(const y of [150,300,450]){p.beginPath();p.moveTo(120,y);p.lineTo(1080,y);p.stroke();}
  const cols=['#b67650','#647e79','#a88d62'];
  for(let i=0;i<10;i++){const gx=i%5,gy=Math.floor(i/5);p.fillStyle=cols[i%3];p.fillRect(250+gx*195,180+gy*150,120-(i%3)*20,80+(i%4)*15);}
  for(const x of [-4,4]){const t=box(2.2,.14,1.2,x,1.05,-.6,bronze);t.rotation.z=x<0?.18:-.18;box(.16,1,.16,x,.5,-1.05,dark);box(.16,1,.16,x,.5,-.15,dark);}
  box(1.8,.12,1.2,0,.75,-2.6,bronze);for(let i=0;i<5;i++)box(.3,.22+(i%3)*.14,.3,-.6+i*.3,.97,-2.6,glow);
  // A small statue of Felicit the space cat, laughing inside her bubble helmet.
  const sx=2.5,sz=1.7,suit=new THREE.MeshStandardMaterial({color:'#cfd6d3',roughness:.5,metalness:.3});
  box(1.1,.85,1.1,sx,.425,sz,stone);box(1.24,.14,1.24,sx,.92,sz,bronze);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.4,.5,.85,14),suit);body.position.set(cx+sx,fy+1.42,cz+sz);root.add(body);
  const col=new THREE.Mesh(new THREE.TorusGeometry(.3,.06,8,18),bronze);col.rotation.x=Math.PI/2;col.position.set(cx+sx,fy+1.9,cz+sz);root.add(col);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.4,16,12),mat('#c98d5f'));head.position.set(cx+sx,fy+2.28,cz+sz);root.add(head);
  for(const e of[-1,1]){const ear=new THREE.Mesh(new THREE.ConeGeometry(.12,.22,8),head.material);ear.position.set(cx+sx+e*.21,fy+2.66,cz+sz);root.add(ear);}
  const tail=new THREE.Mesh(new THREE.TorusGeometry(.28,.055,8,14,Math.PI*1.3),suit);tail.position.set(cx+sx+.42,fy+1.35,cz+sz+.2);tail.rotation.y=.6;root.add(tail);
  const helm=new THREE.Mesh(new THREE.SphereGeometry(.58,18,14),new THREE.MeshPhysicalMaterial({color:'#dfe9e2',transparent:true,opacity:.18,roughness:.1,depthWrite:false}));helm.position.copy(head.position);root.add(helm);
  const fc=document.createElement('canvas');fc.width=fc.height=256;const f2=fc.getContext('2d')!;
  f2.strokeStyle='#343334';f2.lineCap='round';f2.lineWidth=12;
  for(const ex of[78,178]){f2.beginPath();f2.arc(ex,96,30,Math.PI*1.15,Math.PI*1.85);f2.stroke();}
  f2.fillStyle='#8a3d2e';f2.beginPath();f2.arc(128,168,44,0,Math.PI);f2.closePath();f2.fill();
  f2.fillStyle='#d98a70';f2.beginPath();f2.ellipse(128,192,26,14,0,0,7);f2.fill();
  f2.lineWidth=6;for(const[w0,w1]of[[20,72],[184,236]] as const)for(const wy of[140,158]){f2.beginPath();f2.moveTo(w0,wy);f2.lineTo(w1,wy-6);f2.stroke();}
  const ftex=new THREE.CanvasTexture(fc);ftex.colorSpace=THREE.SRGBColorSpace;
  const face=new THREE.Mesh(new THREE.CircleGeometry(.36,20),new THREE.MeshBasicMaterial({map:ftex,transparent:true}));
  face.rotation.order='YXZ';face.rotation.set(-.62,Math.PI,0);face.position.set(cx+sx,fy+2.28,cz+sz-.42);root.add(face);
 }else{
  const cols=['#b67650','#647e79','#a88d62'];
  for(let k=0;k<3;k++){p.strokeStyle=cols[k];p.lineWidth=10-k*2;p.beginPath();for(let x=60;x<=1140;x+=8){const y=170+k*130+Math.sin(x/(60+k*24)+k)*44;p.lineTo(x,y);}p.stroke();}
  box(2.6,.5,1,-3.9,.55,-.4,dark);for(let i=0;i<8;i++)box(.08,.1,.5,-4.9+i*.28,.88,-.4,bronze);
  for(const x of [3.6,4.6]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.45,.5,2.6,14),dark);c.position.set(cx+x,fy+1.3,cz-1.2);root.add(c);for(const y of [.6,1.4,2.2]){const r=new THREE.Mesh(new THREE.TorusGeometry(.46,.04,6,18),bronze);r.rotation.x=Math.PI/2;r.position.set(cx+x,fy+y,cz-1.2);root.add(r);}}
  for(const x of [-1,.4,1.8]){box(.5,.12,.5,x,.62,.9,bronze);box(.1,.56,.1,x,.3,.9,dark);}
 }
 const t=new THREE.CanvasTexture(art);t.colorSpace=THREE.SRGBColorSpace;box(5.3,2.75,.12,0,2.2,5.52,bronze);const panel=new THREE.Mesh(new THREE.PlaneGeometry(5.05,2.52),new THREE.MeshBasicMaterial({map:t}));panel.rotation.y=Math.PI;panel.position.set(cx,fy+2.2,cz+5.43);root.add(panel);
    }
