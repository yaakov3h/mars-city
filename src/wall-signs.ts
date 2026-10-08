import * as THREE from 'three';
import {Text} from 'troika-three-text';
import {SVGLoader} from 'three/addons/loaders/SVGLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import outlines from './sign-outlines.json';
import type {World} from './world';
import specs from './sign-specs.json';
export const signSpecs=specs;
export function addWallSigns(world:World){
 // Hide obsolete floating building labels, while leaving the sun halo and scene decor alone.
 world.root.children.forEach(g=>{if(g.userData.buildingId)g.children.forEach(o=>{if(o instanceof THREE.Sprite)o.visible=false})});
 const mode=new URLSearchParams(location.search).get('signs');if(mode==='before')return;
 signSpecs.forEach((spec,i)=>{const g=world.root.children.find(o=>(o.userData.buildingId??o.userData.landmarkId)===spec.id);if(!g||g.children.some(o=>o.userData.wallSign))return;const sign=new THREE.Group();sign.position.set(spec.x,spec.y,spec.z);sign.rotation.y=spec.yaw;sign.rotateX(spec.tilt);sign.userData={noMerge:true,wallSign:true};g.add(sign);
 const plate=new THREE.Mesh(new THREE.BoxGeometry(spec.width,spec.height,.024),new THREE.MeshStandardMaterial({color:spec.plate,roughness:.85}));plate.position.z=.012;plate.receiveShadow=true;sign.add(plate);
 const rule=new THREE.Mesh(new THREE.BoxGeometry(spec.width-.12,.022,.012),new THREE.MeshStandardMaterial({color:spec.accent,roughness:.75}));rule.position.set(0,-spec.height/2+.045,.029);sign.add(rule);
 const scale=Math.min((spec.width-.2)/outlines[i].width,(spec.height*.57)/outlines[i].height),parts:THREE.BufferGeometry[]=[];new SVGLoader().parse(outlines[i].svg).paths.forEach(p=>SVGLoader.createShapes(p).forEach(shape=>{const geo=new THREE.ExtrudeGeometry(shape,{depth:.026/scale,bevelEnabled:false,curveSegments:4});geo.scale(scale,-scale,scale);geo.translate(-outlines[i].width*scale/2,-spec.height*.1,.025);parts.push(geo)}));const geometry=mergeGeometries(parts);if(geometry){const letters=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:spec.color,roughness:.65,metalness:.2}));letters.castShadow=true;letters.receiveShadow=true;letters.userData.reliefDepth=.026;sign.add(letters)}parts.forEach(p=>p.dispose());sign.traverse(o=>{o.userData.noMerge=true});
 // Small wall-bound family label demonstrates live Troika RTL with the same local font.
 const family=new Text();family.text=spec.sub;family.direction='rtl';family.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';family.fontSize=.075;family.anchorX='center';family.anchorY='middle';family.color=spec.color;family.position.set(0,-spec.height*.28,.027);sign.add(family);family.userData.noMerge=true;family.sync(()=>{world.renderer.shadowMap.needsUpdate=true});
 world.renderer.shadowMap.needsUpdate=true;
 });
}
