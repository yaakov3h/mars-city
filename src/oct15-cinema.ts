import * as THREE from 'three';
import {detailedSurface,type World} from './world';
const clickHandlers=new WeakMap<HTMLCanvasElement,(e:MouseEvent)=>void>();
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
function material(color:string,kind:'stone'|'metal'='stone'){const s=detailedSurface(kind);return new THREE.MeshStandardMaterial({color,map:s.color,normalMap:s.normal,roughnessMap:s.rough,normalScale:new THREE.Vector2(.12,.12),metalness:kind==='metal'?.4:.05,roughness:.8});}
export function premiereCinema(part:Part,g:THREE.Group,w:World){
 const sand=material('#cbb28c'),copper=material('#a87955','metal'),dark=material('#3a3332'),glass=new THREE.MeshPhysicalMaterial({color:'#d5e2d8',transparent:true,opacity:.2,roughness:.1,depthWrite:false,side:THREE.DoubleSide});
 const box=(a:number,b:number,c:number,x:number,y:number,z:number,m:THREE.Material=sand)=>part(new THREE.BoxGeometry(a,b,c),m,x,y,z);
 const base=part(new THREE.CylinderGeometry(8.3,8.5,.3,6),sand,0,.2,0);
 // A low auditorium under a ribbed barrel roof, with a separate glazed foyer.
 box(8,3.5,6.4,0,2.2,-.8);const shape=new THREE.Shape();shape.moveTo(-4,0);shape.absarc(0,0,4,Math.PI,0,true);shape.lineTo(3.86,0);shape.absarc(0,0,3.86,0,Math.PI,false);shape.closePath();part(new THREE.ExtrudeGeometry(shape,{depth:6.7,bevelEnabled:false,curveSegments:32}),copper,0,3.95,-4.15);
 const end=new THREE.Shape();end.moveTo(-3.86,0);end.absarc(0,0,3.86,Math.PI,0,true);end.closePath();for(const z of [-4.16,2.56])part(new THREE.ShapeGeometry(end,32),glass,0,3.95,z);
 for(let i=0;i<7;i++){const rib=part(new THREE.TorusGeometry(4.04,.065,6,32,Math.PI),dark,0,3.95,-4.1+i*1.1);}
 box(6.8,2.8,2.25,0,1.95,3.25,glass);box(7.2,.22,2.65,0,3.42,3.35,copper);for(const x of [-3.4,-1.2,1.2,3.4])box(.09,2.9,.09,x,1.95,4.38,copper);
 box(4,.72,.16,0,3.28,4.72,dark);box(2,2.25,.08,0,1.63,4.46,glass);box(3.2,.12,1.5,0,.49,5.25,copper);
 // Shared glass garden, not exposed plants or separate plant domes.
 box(2.65,2.8,3,-5.2,1.9,.8,glass);box(2.8,.12,3.2,-5.2,3.35,.8,copper);for(const z of [-.15,.8,1.75]){box(.7,.25,.7,-5.2,.6,z,dark);w.catalogTree(g,-5.2,.74,z,1,'cinema-garden-'+z,.8);}
 box(2.6,3.1,2.6,0,2,-5.4,glass);for(const x of [-1.3,1.3])box(.09,3.2,.09,x,2,-5.4,copper);
 const poster=new THREE.TextureLoader().load(import.meta.env.BASE_URL+'cinema/1-poster.webp');poster.colorSpace=THREE.SRGBColorSpace;part(new THREE.PlaneGeometry(1.3,.731),new THREE.MeshBasicMaterial({map:poster,toneMapped:false}),-2.25,1.8,4.45);
 // Ticket desk at one side of the entrance.
 box(1.15,1.25,.9,4.9,1.1,3.1,copper);box(1.3,.1,1.1,4.9,1.8,3.1,dark);
}
