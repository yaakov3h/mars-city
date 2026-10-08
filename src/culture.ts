import * as THREE from 'three';
import type {World} from './world';
export const gallery=[
 {file:'1-panorama.webp',title:'Perseverance · Jezero · Sol 3',credit:'NASA/JPL-Caltech/ASU/MSSS',url:'https://science.nasa.gov/resource/mastcam-zs-first-360-degree-panorama/'},
 {file:'2-dunes.webp',title:'Curiosity · Namib Dune',credit:'NASA/JPL-Caltech',url:'https://science.nasa.gov/photojournal/mastcam-telephoto-of-a-martian-dunes-downwind-face/'}
];
export function addCulture(world:World){
 const g=world.root.children.find(o=>o.userData.buildingId==='b-journey-academy-20261007');if(!g||g.children.some(o=>o.userData.culture))return;
 const add=(geometry:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,z:number,experience:string)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.userData={culture:true,noMerge:true,experience};g.add(m);world.hit.push(m);return m};
 gallery.forEach((item,i)=>{
  const mat=new THREE.MeshBasicMaterial({color:0xffffff});const poster=add(new THREE.PlaneGeometry(i?.81:1.08,i?.92:.34),mat,6.257,2.3,i?-.6:.6,'gallery');poster.rotation.y=Math.PI/2;
  new THREE.TextureLoader().load(import.meta.env.BASE_URL+'gallery/'+item.file,texture=>{texture.colorSpace=THREE.SRGBColorSpace;mat.map=texture;mat.needsUpdate=true});
  const c=document.createElement('canvas');c.width=768;c.height=150;const ctx=c.getContext('2d')!;ctx.fillStyle='#17262e';ctx.fillRect(0,0,768,150);ctx.textAlign='center';ctx.fillStyle='#fff0d8';ctx.font='38px sans-serif';ctx.fillText(item.title,384,57);ctx.font='30px sans-serif';ctx.fillText(item.credit,384,110);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const label=add(new THREE.PlaneGeometry(1.02,.2),new THREE.MeshBasicMaterial({map:t}),6.26,1.7,i?-.6:.6,'gallery');label.rotation.y=Math.PI/2;
 });
}
