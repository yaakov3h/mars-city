import * as THREE from 'three';
import {Text} from 'troika-three-text';
import {detailedSurface,type World} from './world';
import {cutRoofWindows} from './underground';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
// Knowledge Tree (עץ הידע): an artificial tree of copper and basalt. One trunk, six jointed branches at different
// heights, and a lit lantern at the end of each branch: every lantern is one field of expertise held by one person.
// A shared round table stands at the foot of the trunk, and the reading room below is reached by a glass lift.
export const KNOWLEDGE_TREE_ID='b-knowledge-tree-20261026';
export const KNOWLEDGE_SHAFT_POINT=Object.freeze({x:-5.2,z:-1.2});
export const KNOWLEDGE_TREE=Object.freeze({trunkTop:21,branches:6,pad:8.3});
export function knowledgeTree(part:Part,g:THREE.Group,w:World){
 const mat=(color:string,kind:'stone'|'metal'='stone',metal=.08,rough=.78)=>{const s=detailedSurface(kind);return new THREE.MeshStandardMaterial({color,map:s.color,normalMap:s.normal,roughnessMap:s.rough,normalScale:new THREE.Vector2(.12,.12),roughness:rough,metalness:metal});};
 const stone=mat('#c9ae88'),dark=mat('#2f2d2f'),copper=mat('#b8794a','metal',.55,.42),brass=mat('#d9a35a','metal',.65,.34),bark=mat('#6e4a38','metal',.35,.6);
 const glass=new THREE.MeshPhysicalMaterial({color:'#d3e6dd',transparent:true,opacity:.2,roughness:.1,side:THREE.DoubleSide,depthWrite:false});
 const amber=new THREE.MeshBasicMaterial({color:'#ffad4d'}),warm=new THREE.MeshBasicMaterial({color:'#fff1d2'});
 const box=(a:number,b:number,c:number,x:number,y:number,z:number,m:THREE.Material=stone)=>part(new THREE.BoxGeometry(a,b,c),m,x,y,z);
 const rod=(a:THREE.Vector3,b:THREE.Vector3,r:number,m:THREE.Material=bark)=>{const d=b.clone().sub(a),o=part(new THREE.CylinderGeometry(r*.8,r,d.length(),10),m,...a.clone().add(b).multiplyScalar(.5).toArray() as [number,number,number]);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());return o;};
 const P=.35;
 // Shared hex pad with the shaft point cut open for the lift.
 const pad=part(new THREE.CylinderGeometry(8.3,8.5,.3,6),stone,0,.2,0);
 cutRoofWindows(pad.geometry,[{x:KNOWLEDGE_SHAFT_POINT.x,z:KNOWLEDGE_SHAFT_POINT.z,radius:1.4}]);
 // Round stone plinth and the shared table around the trunk: six seats, one per lantern.
 part(new THREE.CylinderGeometry(4.2,4.45,.4,36),stone,0,P+.2,0);
 part(new THREE.CylinderGeometry(2.6,2.6,.16,36),dark,0,P+1.05,0);part(new THREE.CylinderGeometry(2.45,2.45,.06,36),stone,0,P+1.16,0);
 part(new THREE.CylinderGeometry(.9,1.2,.9,16),bark,0,P+.65,0);
 for(let k=0;k<6;k++){const a=k*Math.PI/3+Math.PI/6;part(new THREE.CylinderGeometry(.34,.38,.5,14),copper,Math.cos(a)*3.15,P+.65,Math.sin(a)*3.15);}
 // Trunk: a tapering copper-bark column in three jointed sections with brass collars.
 const secs=[[0,7,1.0,.78],[7,14,.78,.55],[14,KNOWLEDGE_TREE.trunkTop,.55,.32]] as const;
 for(const[y0,y1,r0,r1] of secs){const h=y1-y0;part(new THREE.CylinderGeometry(r1,r0,h,16),bark,0,P+.4+y0+h/2,0);const c=part(new THREE.TorusGeometry(r1+.06,.07,8,24),brass,0,P+.4+y1,0);c.rotation.x=Math.PI/2;}
 // Root flare: six low buttresses reaching the plinth.
 for(let k=0;k<6;k++){const a=k*Math.PI/3;rod(new THREE.Vector3(Math.cos(a)*2.1,P+.4,Math.sin(a)*2.1),new THREE.Vector3(Math.cos(a)*.7,P+3.2,Math.sin(a)*.7),.32);}
 // Six branches: each leaves the trunk at its own height, bends once at a brass elbow and ends in a lantern.
 const heights=[8.2,10.6,13,15.2,17.4,19.6];
 for(let k=0;k<6;k++){const a=k*Math.PI/3+.35,ca=Math.cos(a),sa=Math.sin(a),y0=P+.4+heights[k],reach=3.4+((k*2)%3)*.5,rise=1.3+(k%2)*.7;
  const r0=.5-k*.04,a0=new THREE.Vector3(ca*.2,y0,sa*.2),a1=new THREE.Vector3(ca*reach*.55,y0+rise*.35,sa*reach*.55),a2=new THREE.Vector3(ca*reach,y0+rise,sa*reach);
  rod(a0,a1,r0*.6);part(new THREE.SphereGeometry(r0*.62,10,8),brass,a1.x,a1.y,a1.z);rod(a1,a2,r0*.4);
  // Lantern at the tip: a brass cup holding a lit amber glass globe; nothing floats, the cup is welded to the branch end.
  part(new THREE.CylinderGeometry(.34,.2,.28,12),brass,a2.x,a2.y+.1,a2.z);
  part(new THREE.SphereGeometry(.46,18,14),amber,a2.x,a2.y+.62,a2.z);part(new THREE.SphereGeometry(.2,12,10),warm,a2.x,a2.y+.62,a2.z);
  part(new THREE.SphereGeometry(.5,18,14),glass,a2.x,a2.y+.62,a2.z);
  const hoop=part(new THREE.TorusGeometry(.4,.03,6,20),copper,a2.x,a2.y+.3,a2.z);hoop.rotation.x=Math.PI/2;}
 // Crown: the trunk ends in a slim amber point, the tree's shared light.
 part(new THREE.CylinderGeometry(.08,.32,1.2,10),copper,0,P+.4+KNOWLEDGE_TREE.trunkTop+.6,0);part(new THREE.SphereGeometry(.2,12,10),amber,0,P+.4+KNOWLEDGE_TREE.trunkTop+1.3,0);
 // Name strip: a bronze-framed plate fixed to a low stone block at the plinth, never floating.
 const FZ=5.6;box(4,.9,.5,0,P+.45,FZ,stone);box(3.4,.55,.1,0,P+.5,FZ+.28,dark);box(3.56,.05,.12,0,P+.8,FZ+.28,brass);box(3.56,.05,.12,0,P+.2,FZ+.28,brass);
 const t=new Text();t.text='עץ הידע';t.direction='rtl';t.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';t.fontSize=.34;t.anchorX='center';t.anchorY='middle';t.color='#ffd899';t.position.set(0,P+.5,FZ+.35);t.userData.noMerge=true;g.add(t);t.sync();
 // Steps from the plinth to the pad toward the street (+z).
 box(2.6,.18,.8,0,P+.1,4.7,stone);
 // Glazed lift head at the shaft point: open glass shaft, brass frame, amber marker light on top.
 const{x:EX,z:EZ}=KNOWLEDGE_SHAFT_POINT;
 for(const dz of [-.74,.74])box(1.6,.1,.14,EX,.42,EZ+dz,amber);
 for(const dx of [-.74,.74])box(.14,.1,1.34,EX+dx,.42,EZ,amber);
 box(1.2,1.7,1.2,EX,1.35,EZ,glass);for(const dx of [-.6,.6])for(const dz of [-.6,.6])box(.07,1.8,.07,EX+dx,1.35,EZ+dz,copper);
 box(1.36,.16,1.36,EX,2.28,EZ,copper);part(new THREE.SphereGeometry(.1,10,8),amber,EX,2.46,EZ);
 // The only plants live under glass: a small glazed planter beside the table.
 part(new THREE.CylinderGeometry(1.05,1.15,.3,20),copper,-5.2,.45,3.6);part(new THREE.SphereGeometry(.95,20,10,0,Math.PI*2,0,Math.PI/2),glass,-5.2,.6,3.6);
 for(let i=0;i<3;i++){const a=i*2.094;w.catalogTree(g,-5.2+Math.cos(a)*.4,.62,3.6+Math.sin(a)*.4,i,'knowledge-planter-'+i,.3);}
}
// Underground reading room below the tree: a round table with six small lamps, one per branch, and quiet shelves.
export function knowledgeRoom(root:THREE.Group,cx:number,fy:number,cz:number){
 const mat=(color:string,kind:'stone'|'metal'='stone')=>{const s=detailedSurface(kind);return new THREE.MeshStandardMaterial({color,map:s.color,normalMap:s.normal,roughnessMap:s.rough,normalScale:new THREE.Vector2(.12,.12),roughness:kind==='metal'?.6:.95,metalness:kind==='metal'?.45:.08});};
 const bronze=mat('#9f7b58','metal'),dark=mat('#343334'),paper=mat('#e3d3b5'),stone=mat('#b39a7b'),rock=mat('#8a6f52');
 const glow=new THREE.MeshBasicMaterial({color:'#ffb85c'});
 const add=(geo:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number,ry=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(cx+x,fy+y,cz+z);o.rotation.y=ry;o.castShadow=true;o.receiveShadow=true;root.add(o);return o;};
 const box=(a:number,b:number,c:number,x:number,y:number,z:number,m:THREE.Material=stone,ry=0)=>add(new THREE.BoxGeometry(a,b,c),m,x,y,z,ry);
 add(new THREE.CylinderGeometry(1.7,1.9,.18,24),stone,0,.95,0);add(new THREE.CylinderGeometry(.26,.36,.9,12),bronze,0,.48,0);
 for(let k=0;k<6;k++){const a=k*Math.PI/3,px=Math.cos(a)*1.1,pz=Math.sin(a)*1.1;add(new THREE.CylinderGeometry(.05,.07,.35,8),bronze,px,1.22,pz);add(new THREE.SphereGeometry(.13,12,10),glow,px,1.5,pz);add(new THREE.CylinderGeometry(.3,.33,.45,12),dark,Math.cos(a)*2.5,.22,Math.sin(a)*2.5);}
 for(let u=0;u<3;u++){const ang=(u*2-2)*Math.PI/3+Math.PI,ux=Math.cos(ang)*5.2,uz=Math.sin(ang)*5.2,ry=-ang-Math.PI/2;
  box(3,.1,.5,ux,1.0,uz,bronze,ry);box(3,.1,.5,ux,2.1,uz,bronze,ry);box(.1,2.2,.5,ux,1.1,uz,bronze,ry);
  for(let lv=0;lv<2;lv++)for(let k=0;k<4;k++)box(.4,.6,.06,ux+Math.cos(ry)*(k-1.5)*.62,1.35+lv*1.1,uz-Math.sin(ry)*(k-1.5)*.62,paper,ry);}
 // Lift alcove of carved rock behind the west door, open upward and into the room.
 box(.45,4.2,3.5,-6.12,2.1,-.1,rock);box(1.5,4.2,.35,-5.5,2.1,1.62,rock);box(1.5,4.2,.35,-5.5,2.1,-1.9,rock);box(.3,4.2,2.15,-5.4,2.1,.42,rock);
 const lamp=new THREE.PointLight('#ffe2b3',14,9,2);lamp.position.set(cx,fy+2.6,cz);root.add(lamp);
}
