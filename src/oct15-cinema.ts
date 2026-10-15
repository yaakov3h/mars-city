import * as THREE from 'three';
import {cutRoofWindows} from './underground';
import {detailedSurface,type World} from './world';
const clickHandlers=new WeakMap<HTMLCanvasElement,(e:MouseEvent)=>void>();
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
function material(color:string,kind:'stone'|'metal'='stone'){const s=detailedSurface(kind);return new THREE.MeshStandardMaterial({color,map:s.color,normalMap:s.normal,roughnessMap:s.rough,normalScale:new THREE.Vector2(.12,.12),metalness:kind==='metal'?.4:.05,roughness:.8});}
export function premiereCinema(part:Part,g:THREE.Group,w:World){
 const sand=material('#cbb28c'),copper=material('#a87955','metal'),dark=material('#3a3332'),glass=new THREE.MeshPhysicalMaterial({color:'#d5e2d8',transparent:true,opacity:.2,roughness:.1,depthWrite:false,side:THREE.DoubleSide});
 const box=(a:number,b:number,c:number,x:number,y:number,z:number,m:THREE.Material=sand)=>part(new THREE.BoxGeometry(a,b,c),m,x,y,z);
 const base=part(new THREE.CylinderGeometry(8.3,8.5,.3,6),sand,0,.2,0);cutRoofWindows(base.geometry,[{x:0,z:-5.4,radius:1.4}]);
 // A low auditorium under a ribbed barrel roof, with a separate glazed foyer.
 box(8,3.5,6.4,0,2.2,-.8);const shape=new THREE.Shape();shape.moveTo(-4,0);shape.absarc(0,0,4,Math.PI,0,true);shape.lineTo(3.86,0);shape.absarc(0,0,3.86,0,Math.PI,false);shape.closePath();part(new THREE.ExtrudeGeometry(shape,{depth:6.7,bevelEnabled:false,curveSegments:32}),copper,0,3.95,-4.15);
 const end=new THREE.Shape();end.moveTo(-3.86,0);end.absarc(0,0,3.86,Math.PI,0,true);end.closePath();for(const z of [-4.16,2.56])part(new THREE.ShapeGeometry(end,32),glass,0,3.95,z);
 for(let i=0;i<7;i++){const rib=part(new THREE.TorusGeometry(4.04,.065,6,32,Math.PI),dark,0,3.95,-4.1+i*1.1);}
 box(6.8,2.8,2.25,0,1.95,3.25,glass);box(7.2,.22,2.65,0,3.42,3.35,copper);for(const x of [-3.4,-1.2,1.2,3.4])box(.09,2.9,.09,x,1.95,4.38,copper);
 box(4,.72,.16,0,3.28,4.72,dark);box(2,2.25,.08,0,1.63,4.46,glass);box(3.2,.12,1.5,0,.49,5.25,copper);
 // Shared glass garden, not exposed plants or separate plant domes.
 box(2.65,2.8,3,-5.2,1.9,.8,glass);box(2.8,.12,3.2,-5.2,3.35,.8,copper);for(const z of [-.15,.8,1.75]){box(.7,.25,.7,-5.2,.6,z,dark);w.catalogTree(g,-5.2,.74,z,1,'cinema-garden-'+z,.8);}
 box(2.6,3.1,2.6,0,2,-5.4,glass);for(const x of [-1.3,1.3])box(.09,3.2,.09,x,2,-5.4,copper);
 const poster=new THREE.TextureLoader().load(import.meta.env.BASE_URL+'cinema/poster.webp');poster.colorSpace=THREE.SRGBColorSpace;part(new THREE.PlaneGeometry(1.3,.731),new THREE.MeshBasicMaterial({map:poster,toneMapped:false}),-2.25,1.8,4.45);
 // Ticket desk at one side of the entrance.
 box(1.15,1.25,.9,4.9,1.1,3.1,copper);box(1.3,.1,1.1,4.9,1.8,3.1,dark);
}
export function cinemaInterior(world:World,root:THREE.Group,cx:number,fy:number,cz:number){
 const sand=material('#cbb28c'),copper=material('#a87955','metal'),fabric=material('#70483f'),dark=material('#332e2b');
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(cx+x,fy+y,cz+z);root.add(o);return o;};
 // Seats face the north screen. A clear middle aisle and east passage stay open.
 for(let row=0;row<3;row++){const z=-2.5+row*1.45,h=.12*(3-row);box(7.3,h,1.4,0,h/2,z,dark);for(const x of [-2.7,-1.65,1.65,2.7]){box(.78,.45,.75,x,h+.35,z,fabric);box(.78,.9,.18,x,h+.65,z-.37,fabric);for(const dx of [-.43,.43])box(.08,.5,.8,x+dx,h+.4,z,copper);}}
 box(5.3,3.13,.16,0,2.22,5.5,dark);const tex=new THREE.TextureLoader().load(import.meta.env.BASE_URL+'cinema/poster.webp',()=>screen.userData.imageReady=true);tex.colorSpace=THREE.SRGBColorSpace;
 const posterMat=new THREE.MeshBasicMaterial({map:tex,toneMapped:false});const screen=new THREE.Mesh(new THREE.PlaneGeometry(4.95,2.784),posterMat);screen.position.set(cx,fy+2.22,cz+5.39);screen.rotation.y=Math.PI;screen.userData={noMerge:true,cinemaScreen:true};root.add(screen);
 for(const x of [-2.9,2.9]){box(.48,3.3,.35,x,2.1,5.37,fabric);for(const dx of [-.13,.13])box(.07,3.3,.09,x+dx,2.1,5.13,copper);}
 const plaque=(text:string,w:number,y:number,z:number)=>{const c=document.createElement('canvas');c.width=1200;c.height=160;const p=c.getContext('2d')!;p.fillStyle='#dfd7c4';p.fillRect(0,0,1200,160);p.fillStyle='#433a32';p.font='46px sans-serif';p.textAlign='center';p.fillText(text,600,100);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,.45),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));m.position.set(cx,fy+y,cz+z);m.rotation.y=Math.PI;root.add(m);};
 plaque('יום בחייו של חתול · הקרנת הבכורה',5.1,3.93,5.3);plaque('לחצו על המסך לצפייה עם קול',4.2,.52,5.3);
 // Native film player opens only on an intentional screen click. No autoplay audio.
 const openFilm=()=>{if(document.querySelector('dialog[data-cinema]'))return;const dialog=document.createElement('dialog');dialog.dataset.cinema='true';dialog.style.cssText='border:1px solid #a87955;border-radius:14px;background:#171a20;color:#f3e2c4;padding:16px;width:min(92vw,960px)';const close=document.createElement('button');close.textContent='סגירה';close.style.cssText='padding:8px 16px;margin-bottom:12px';const video=document.createElement('video');video.src=import.meta.env.BASE_URL+'cinema/first-film.mp4';video.controls=true;video.playsInline=true;video.style.width='100%';dialog.append(close,video);document.body.append(dialog);close.onclick=()=>dialog.close();dialog.onclose=()=>{video.pause();dialog.remove()};dialog.showModal();video.play().catch(()=>{});};
 const canvas=world.renderer.domElement;let startX=0,startY=0;canvas.addEventListener('pointerdown',e=>{startX=e.clientX;startY=e.clientY});const old=clickHandlers.get(canvas);if(old)canvas.removeEventListener('click',old);const onClick=(e:MouseEvent)=>{if(Math.hypot(e.clientX-startX,e.clientY-startY)>6)return;if(!world.reviewUnderground?.active||world.reviewUnderground.map)return;const r=canvas.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),world.camera);if(ray.intersectObject(screen).length)openFilm();};clickHandlers.set(canvas,onClick);canvas.addEventListener('click',onClick);
 // Small foyer garden enclosed under shared glass.
 const gl=new THREE.MeshPhysicalMaterial({color:'#cfe1d6',transparent:true,opacity:.18,roughness:.1,depthWrite:false});box(2.1,2.3,1.7,-3.8,1.15,-3.8,gl);for(const z of [-4.2,-3.5])world.catalogTree(root,cx-3.8,fy+.1,cz+z,1,'cinema-lower-'+z,.7);
}
