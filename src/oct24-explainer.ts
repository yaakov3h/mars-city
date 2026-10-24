import * as THREE from 'three';
import {Text} from 'troika-three-text';
import {detailedSurface,type World} from './world';
import {cutRoofWindows} from './underground';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
// Explainer Studio (סטודיו ההסבר), hex q=-5 r=6: a small studio where complex things are explained step by step.
// Alon built the surface; Noa built the archive room and its elevator below ground (her part).
// The elevator head at the reserved shaft point is now open: the pad is cut and the lift connects to her room.
export const EXPLAINER_SHAFT_POINT=Object.freeze({x:-5.7,z:-1.2});
export function explainerStudio(part:Part,g:THREE.Group,w:World){
 const mat=(color:string,kind:'stone'|'metal'='stone')=>{const s=detailedSurface(kind);return new THREE.MeshStandardMaterial({color,map:s.color,normalMap:s.normal,roughnessMap:s.rough,normalScale:new THREE.Vector2(.12,.12),roughness:.75,metalness:kind==='metal'?.4:.06});};
 const stone=mat('#cbb28c'),pale=mat('#d8c3a0'),copper=mat('#a87955','metal'),dark=mat('#343334');
 const glass=new THREE.MeshPhysicalMaterial({color:'#cfe1d6',transparent:true,opacity:.2,roughness:.12,side:THREE.DoubleSide,depthWrite:false});
 const glow=new THREE.MeshBasicMaterial({color:'#fff3d6'}),amber=new THREE.MeshBasicMaterial({color:'#ffb85c'});
 const box=(a:number,b:number,c:number,x:number,y:number,z:number,m:THREE.Material=stone)=>part(new THREE.BoxGeometry(a,b,c),m,x,y,z);
 const B=.35,H=6.7,W=8,D=5.4,Z0=-.6,FRONT=Z0+D/2,ROOF=B+H;
 // Hex pad shared by every bespoke building of the colony. Noa: cut open at the reserved shaft point for her lift.
 const pad=part(new THREE.CylinderGeometry(8.3,8.5,.3,6),stone,0,.2,0);
 cutRoofWindows(pad.geometry,[{x:EXPLAINER_SHAFT_POINT.x,z:EXPLAINER_SHAFT_POINT.z,radius:1.4}]);
 // The studio block: one calm stone volume with a copper cornice and a thin plinth.
 box(W,H,D,0,B+H/2,Z0,pale);
 box(W+.3,.22,D+.3,0,B+.11,Z0,stone);
 box(W+.24,.18,D+.24,0,ROOF+.09,Z0,copper);
 for(const x of [-W/2,W/2])for(const z of [Z0-D/2,FRONT])box(.18,H,.18,x,B+H/2,z,copper);
 // Façade: three blank panels, lit in sequence 1→2→3 — one idea, then the next, then the whole picture.
 const panelY=B+4.25,panelW=1.9,panelH=2.55;
 for(let i=0;i<3;i++){const x=(i-1)*2.45;
  box(panelW+.24,panelH+.24,.14,x,panelY,FRONT+.05,dark);
  const m=new THREE.MeshStandardMaterial({color:'#1d2a31',emissive:'#8fd3ec',emissiveIntensity:.85,roughness:.35,metalness:.1});
  const p=part(new THREE.PlaneGeometry(panelW,panelH),m,x,panelY,FRONT+.13);p.userData.stepPanel=i+1;w.animated.push(p);
  // Abstract step marks under each panel: one, two, three studs. No words, no content.
  for(let k=0;k<=i;k++)part(new THREE.SphereGeometry(.07,10,8),glow,x+(k-i/2)*.24,panelY-panelH/2-.26,FRONT+.1);
 }
 // Entrance with a recessed glazed door and steps down to the street.
 box(1.7,1.85,.12,0,B+.925,FRONT+.03,dark);box(1.4,1.7,.06,0,B+.87,FRONT+.1,glass);
 box(2.4,.16,.9,0,.36,FRONT+.75,stone);box(2,.16,.7,0,.24,FRONT+1.4,stone);
 // Name strip: a physical bronze-framed plate fixed to the façade above the door, never floating.
 box(3.6,.6,.1,0,B+2.25,FRONT+.06,dark);box(3.76,.06,.12,0,B+2.58,FRONT+.06,copper);box(3.76,.06,.12,0,B+1.92,FRONT+.06,copper);
 const t=new Text();t.text='סטודיו ההסבר';t.direction='rtl';t.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';t.fontSize=.34;t.anchorX='center';t.anchorY='middle';t.color='#ffd899';t.position.set(0,B+2.25,FRONT+.12);t.userData.noMerge=true;g.add(t);t.sync();
 // Side and back slit windows, warm like the rest of the colony at night.
 for(const s of [-1,1])for(let k=0;k<3;k++)box(.06,1.6,.5,s*(W/2+.01),B+3.6,Z0-1.6+k*1.6,glow);
 for(let k=0;k<4;k++)box(.6,.12,.06,-2.7+k*1.8,B+5.9,FRONT+.02,glow);
 // The open exterior stair: the path itself. Open treads on copper stringers climb the east side,
 // turn on a landing and finish along the back onto the roof.
 const SX=W/2+.75,n1=10,n2=9,rise=(ROOF-B)/(n1+n2+1);
 for(let i=0;i<n1;i++){const z=FRONT+.2-i*.5;box(1.1,.08,.36,SX,B+rise*(i+1),z,stone);}
 const landY=B+rise*(n1+1),LZ=Z0-D/2-.75;box(1.4,.12,1.4,SX,landY,LZ,stone);
 for(let i=0;i<n2;i++){const x=SX-.8-i*.5;box(.36,.08,1.1,x,landY+rise*(i+1),LZ,stone);}
 const rod=(ax:number,ay:number,az:number,bx:number,by:number,bz:number,r=.05)=>{const a=new THREE.Vector3(ax,ay,az),b=new THREE.Vector3(bx,by,bz),d=b.clone().sub(a),o=part(new THREE.CylinderGeometry(r,r,d.length(),8),copper,...a.clone().add(b).multiplyScalar(.5).toArray() as [number,number,number]);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;};
 const z1=FRONT+.2,z2=FRONT+.2-(n1-1)*.5,x2=SX-.8-(n2-1)*.5;
 for(const dx of [-.56,.56]){rod(SX+dx,B+rise-.08,z1,SX+dx,B+rise*n1-.08,z2,.06);}
 rod(SX+.56,B+rise+.95,z1,SX+.56,B+rise*n1+.95,z2);rod(SX+.56,landY+.95,LZ+.7,SX+.56,landY+.95,LZ-.7);
 for(const dz of [-.56,.56])rod(SX-.8,landY+rise-.08,LZ+dz,x2,landY+rise*n2-.08,LZ+dz,.06);
 rod(SX-.8,landY+rise+.95,LZ-.56,x2,landY+rise*n2+.95,LZ-.56);
 for(let i=0;i<n1;i+=3)rod(SX+.56,B+rise*(i+1),z1-i*.5,SX+.56,B+rise*(i+1)+.95,z1-i*.5,.035);
 for(let i=0;i<n2;i+=3)rod(SX-.8-i*.5,landY+rise*(i+1),LZ-.56,SX-.8-i*.5,landY+rise*(i+1)+.95,LZ-.56,.035);
 box(.16,landY,.16,SX+.6,landY/2,LZ-.6,copper);box(.16,landY,.16,SX+.6,landY/2,LZ+.6,copper);
 // A small glass dome inside the roof footprint; the only plants of the studio live under it.
 const DX=-1.6,DZ=Z0-.2,R=1.55;
 part(new THREE.CylinderGeometry(R+.12,R+.12,.22,24),copper,DX,ROOF+.29,DZ);
 part(new THREE.SphereGeometry(R,24,12,0,Math.PI*2,0,Math.PI/2),glass,DX,ROOF+.4,DZ);
 for(let k=0;k<4;k++){const r=part(new THREE.TorusGeometry(R,.025,6,40,Math.PI),copper,DX,ROOF+.4,DZ);r.rotation.y=k*Math.PI/4;}
 part(new THREE.CylinderGeometry(R-.2,R-.2,.16,20),dark,DX,ROOF+.48,DZ);
 for(let i=0;i<3;i++){const a=i*2.094+.4;w.catalogTree(g,DX+Math.cos(a)*.65,ROOF+.56,DZ+Math.sin(a)*.65,i,'explainer-dome-'+i,.42);}
 // Roof hatch where the stair arrives.
 box(1.2,.5,1,x2-.2,ROOF+.43,LZ+1.4,copper);
 // The elevator head at the reserved shaft point: Alon's hatch-banded design, opened by Noa -
 // the sealing plate is gone, the amber bands became the rim of the open lift, his marker light stays on top.
 const{x:EX,z:EZ}=EXPLAINER_SHAFT_POINT;
 for(const dz of [-.74,.74])box(1.6,.1,.14,EX,.42,EZ+dz,amber);
 for(const dx of [-.74,.74])box(.14,.1,1.34,EX+dx,.42,EZ,amber);
 box(1.2,1.7,1.2,EX,1.35,EZ,glass);for(const dx of [-.6,.6])for(const dz of [-.6,.6])box(.07,1.8,.07,EX+dx,1.35,EZ+dz,copper);
 box(1.36,.16,1.36,EX,2.28,EZ,copper);part(new THREE.SphereGeometry(.1,10,8),amber,EX,2.46,EZ);
}

// Noa's underground piece: ארכיון הצעדים - the Archive of Steps below the studio (registered in the underground city as theme 'explainer').
// Shelves of blank step-cards in one/two/three groupings and a quiet reading table with the same
// three-panel motif as the facade, at rest. No words, no content - the archive stores the shape of steps.
export function explainerRoom(root:THREE.Group,cx:number,fy:number,cz:number){
 const mat=(color:string,kind:'stone'|'metal'='stone')=>{const s=detailedSurface(kind);return new THREE.MeshStandardMaterial({color,map:s.color,normalMap:s.normal,roughnessMap:s.rough,normalScale:new THREE.Vector2(.12,.12),roughness:kind==='metal'?.6:.95,metalness:kind==='metal'?.45:.08});};
 const bronze=mat('#9f7b58','metal'),dark=mat('#343334'),paper=mat('#e3d3b5'),stone=mat('#b39a7b');
 const glow=new THREE.MeshBasicMaterial({color:'#fff3d6'}),panelGlow=new THREE.MeshStandardMaterial({color:'#1d2a31',emissive:'#8fd3ec',emissiveIntensity:.55,roughness:.35});
 const add=(geo:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number,ry=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(cx+x,fy+y,cz+z);o.rotation.y=ry;o.castShadow=true;o.receiveShadow=true;root.add(o);return o;};
 const box=(a:number,b:number,c:number,x:number,y:number,z:number,m:THREE.Material=stone,ry=0)=>add(new THREE.BoxGeometry(a,b,c),m,x,y,z,ry);
 // Three shelf units along the east walls, each holding one/two/three blank step-cards.
 for(let u=0;u<3;u++){const ang=(u*2-2)*Math.PI/3,ux=Math.cos(ang)*5.35,uz=Math.sin(ang)*5.35,ry=-ang-Math.PI/2;
  box(3,.1,.5,ux,1.0,uz,bronze,ry);box(3,.1,.5,ux,2.1,uz,bronze,ry);box(.1,2.2,.5,ux,1.1,uz,bronze,ry);
  for(let lv=0;lv<2;lv++)for(let k=0;k<=u;k++){const off=(k-u/2)*.8;
   box(.55,.72,.06,ux+Math.cos(ry)*off,1.42+lv*1.1,uz-Math.sin(ry)*off,paper,ry);
   for(let st=0;st<=k;st++)add(new THREE.SphereGeometry(.05,8,6),glow,ux+Math.cos(ry)*(off+(st-k/2)*.18),1.42+lv*1.1-.44,uz-Math.sin(ry)*(off+(st-k/2)*.18)+.05);}}
 // Reading table at the room center: the three facade panels, at rest, with their step studs.
 add(new THREE.CylinderGeometry(1.5,1.7,.18,18),stone,0,.95,0);add(new THREE.CylinderGeometry(.22,.3,.9,12),bronze,0,.48,0);
 for(let i=0;i<3;i++){const a=i*2.094-.6,px=Math.cos(a)*.95,pz=Math.sin(a)*.95;
  box(.62,.8,.05,px,1.55,pz,dark,-a+Math.PI/2);box(.5,.66,.02,px,1.55,pz,panelGlow,-a+Math.PI/2);
  for(let k=0;k<=i;k++)add(new THREE.SphereGeometry(.035,8,6),glow,px+(k-i/2)*.14,1.08,pz);}
 for(const a of [.9,2.6])box(.5,.45,.5,Math.cos(a)*2.3,.22,Math.sin(a)*2.3,dark);
 // The lift alcove behind the west door is carved rock: a closed niche around the glass shaft,
 // open only upward along the lift and eastward into the room (the lift's entry side).
 const rock=mat('#8a6f52');
 box(.45,4.2,3.5,-6.62,2.1,-.1,rock);            // back (west) wall of the niche
 box(1.5,4.2,.35,-6.0,2.1,1.62,rock);            // north cheek, back to the door frame
 box(1.5,4.2,.35,-6.0,2.1,-1.9,rock);            // south cheek, back to the door frame
 box(.3,4.2,2.15,-5.9,2.1,.42,rock);             // door-plane closure north of the shaft
 // Warm point light over the table. No plants down here: the colony rule is plants only under glazing.
 const lamp=new THREE.PointLight('#ffe2b3',14,9,2);lamp.position.set(cx,fy+2.6,cz);root.add(lamp);
}
