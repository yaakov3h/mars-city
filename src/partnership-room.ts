import * as THREE from 'three';

// Shared underground room (hex q=-4 r=6, floor -8.4, R6.8): one room, two viewpoints.
// Two office identities (cat with glasses, amber robot) stand on a low hex stage;
// a turquoise path and an amber path lead to it and meet at the centre.
// All measures are the approved concept's proposed values: stage r1.65 h.25, statue 1.55 incl. base r.45 at x +-.65,
// portraits 1.4 square, bottom 1.2, on edges 120 (Noa cat) and 180 (Alon robot). Door 240, lift cage at +3.6,0.
export const PARTNERSHIP={stageR:1.65,stageH:.25,statueH:1.55,baseR:.45,baseDx:.65,portrait:1.4,portraitBottom:1.2,catEdge:120,robotEdge:180,liftDx:3.6,turquoise:'#40E0D0',amber:'#E8A23A'} as const;

const INRADIUS=6.8*.8660254;
type Add=(g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number,p?:THREE.Object3D)=>THREE.Mesh;

const CAT_SVG='<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#40E0D0" opacity=".22"/><path d="M5.6 14.5L7.2 4.6l6.2 5.2z" fill="#FFE6D2" stroke="#D9AE8E" stroke-width=".8" stroke-linejoin="round"/><path d="M26.4 14.5L24.8 4.6l-6.2 5.2z" fill="#FFE6D2" stroke="#D9AE8E" stroke-width=".8" stroke-linejoin="round"/><path d="M7.7 11.2l.8-4.2 3 2.5z M24.3 11.2l-.8-4.2-3 2.5z" fill="#F7B3C2"/><ellipse cx="16" cy="18.2" rx="11.2" ry="9.4" fill="#FFEBDA" stroke="#D9AE8E" stroke-width=".8"/><path d="M3.6 20.6l4.6.4M3.9 23.2l4.4-.9M28.4 20.6l-4.6.4M28.1 23.2l-4.4-.9" stroke="#B88E72" stroke-width=".6" stroke-linecap="round"/><circle cx="11.4" cy="17.4" r="3.7" fill="#fff" fill-opacity=".6" stroke="#237b72" stroke-width="1.6"/><circle cx="20.6" cy="17.4" r="3.7" fill="#fff" fill-opacity=".6" stroke="#237b72" stroke-width="1.6"/><path d="M15.1 17.1q.9-.7 1.8 0" stroke="#237b72" stroke-width="1.4" fill="none" stroke-linecap="round"/><circle cx="11.6" cy="17.6" r="1.35" fill="#2d211b"/><circle cx="20.4" cy="17.6" r="1.35" fill="#2d211b"/><circle cx="12.1" cy="17.1" r=".45" fill="#fff"/><circle cx="20.9" cy="17.1" r=".45" fill="#fff"/><path d="M14.9 21.6h2.2l-1.1 1.2z" fill="#F08AA3"/><path d="M16 22.8q-.9 1.3-2.2.7M16 22.8q.9 1.3 2.2.7" stroke="#2d211b" stroke-width=".8" fill="none" stroke-linecap="round"/></svg>';
const ROBOT_SVG='<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 32 32"><line x1="16" y1="3" x2="16" y2="8" stroke="#805920" stroke-width="2"/><circle cx="16" cy="3.5" r="2.2" fill="#E8A23A"/><rect x="2.5" y="14" width="3" height="6" rx="1.5" fill="#805920"/><rect x="26.5" y="14" width="3" height="6" rx="1.5" fill="#805920"/><rect x="5" y="8" width="22" height="19" rx="7" fill="#E8A23A"/><rect x="8.5" y="12" width="15" height="8.5" rx="4.2" fill="#fff"/><circle cx="13" cy="16.2" r="1.9" fill="#2d211b"/><circle cx="19" cy="16.2" r="1.9" fill="#2d211b"/><path d="M13 23.5h6" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></svg>';
// Office mascot art (art only, from the approved concept). Drawn to a canvas texture; updates when the SVG has decoded.
function portraitTexture(kind:'cat'|'robot'){
  const c=document.createElement('canvas');c.width=c.height=512;const p=c.getContext('2d')!;
  p.fillStyle=kind==='cat'?'#13302e':'#33260f';p.fillRect(0,0,512,512);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  const img=new Image();img.onload=()=>{p.drawImage(img,0,0,512,512);t.needsUpdate=true};img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(kind==='cat'?CAT_SVG:ROBOT_SVG);
  return t;
}

export function partnershipRoom(group:THREE.Group,add:Add,cx:number,fy:number,cz:number,stone:THREE.Material){
  const P=PARTNERSHIP,turq=new THREE.MeshBasicMaterial({color:P.turquoise}),amb=new THREE.MeshBasicMaterial({color:P.amber});
  const ivory=new THREE.MeshStandardMaterial({color:'#e7dcc6',roughness:.7});
  // hex stage: slab plus two flat-lit colour halves and a small neutral hex between them
  add(new THREE.CylinderGeometry(P.stageR,P.stageR,P.stageH,6),stone,cx,fy+P.stageH/2,cz,group);
  const half=(thetaStart:number,col:string)=>{const h=new THREE.Mesh(new THREE.CircleGeometry(P.stageR-.07,6,thetaStart,Math.PI),new THREE.MeshBasicMaterial({color:col}));h.rotation.x=-Math.PI/2;h.position.set(cx,fy+P.stageH+.006,cz);group.add(h)};
  half(Math.PI/2,'#2fb8aa');
  half(-Math.PI/2,'#d08a22');
  add(new THREE.CylinderGeometry(.14,.14,.012,6),ivory,cx,fy+P.stageH+.012,cz,group);
  // statues: separate bases r.45 at x +-.65; total height above the stage = 1.55 (base .45 + figure 1.1). Figures face the entry/lift side (-z), turned slightly toward each other.
  const sy=fy+P.stageH,baseH=.45,white=new THREE.MeshBasicMaterial({color:'#ffffff'}),ink=new THREE.MeshBasicMaterial({color:'#1d1612'});
  for(const s of [-1,1]){add(new THREE.CylinderGeometry(P.baseR,P.baseR+.04,baseH,6),ivory,cx+s*P.baseDx,sy+baseH/2,cz,group)}
  const figure=(x:number,yaw:number)=>{const g=new THREE.Group();g.position.set(x,sy+baseH,cz);g.rotation.y=yaw;group.add(g);return g};
  const put=(g:THREE.Group,geo:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o};
  // cat with turquoise glasses (west)
  {const g=figure(cx-P.baseDx,Math.PI-.2),fur=new THREE.MeshStandardMaterial({color:'#ffe6d2',roughness:.6,emissive:'#ffd7bd',emissiveIntensity:.25}),ear=new THREE.MeshStandardMaterial({color:'#f7b3c2',emissive:'#f7b3c2',emissiveIntensity:.2}),rim=new THREE.MeshBasicMaterial({color:'#1f8f84'});
   put(g,new THREE.CapsuleGeometry(.2,.3,4,12),fur,0,.3,0);
   put(g,new THREE.SphereGeometry(.31,22,16),fur,0,.74,0).scale.set(1.12,.95,1);
   for(const e of [-1,1]){const c=put(g,new THREE.ConeGeometry(.12,.26,3),fur,e*.2,1.04,0);c.rotation.z=-e*.25;
     put(g,new THREE.ConeGeometry(.06,.14,3),ear,e*.2,1.03,.03).rotation.z=-e*.25;
     put(g,new THREE.CircleGeometry(.115,20),white,e*.135,.77,.305);
     put(g,new THREE.TorusGeometry(.12,.025,8,24),rim,e*.135,.77,.31);
     put(g,new THREE.CircleGeometry(.04,12),ink,e*.135,.77,.32);}
   put(g,new THREE.BoxGeometry(.06,.025,.02),rim,0,.8,.315);
   put(g,new THREE.ConeGeometry(.035,.04,3),ear,0,.68,.318).rotation.x=Math.PI;
   put(g,new THREE.TorusGeometry(.2,.04,8,16,Math.PI*1.2),fur,0,.28,-.2).rotation.y=Math.PI/2;}
  // amber robot with white visor, dark eyes and antenna (east)
  {const g=figure(cx+P.baseDx,Math.PI+.2),metal=new THREE.MeshStandardMaterial({color:P.amber,roughness:.45,metalness:.15,emissive:P.amber,emissiveIntensity:.3}),brown=new THREE.MeshBasicMaterial({color:'#805920'});
   put(g,new THREE.BoxGeometry(.5,.46,.36),metal,0,.26,0);
   put(g,new THREE.CylinderGeometry(.07,.07,.08,8),brown,0,.53,0);
   put(g,new THREE.BoxGeometry(.54,.44,.4),metal,0,.8,0);
   put(g,new THREE.BoxGeometry(.4,.2,.02),white,0,.82,.205);
   for(const e of [-1,1]){put(g,new THREE.CircleGeometry(.05,14),ink,e*.1,.82,.217);put(g,new THREE.BoxGeometry(.06,.14,.1),brown,e*.3,.8,0)}
   put(g,new THREE.BoxGeometry(.2,.02,.02),white,0,.62,.205);
   put(g,new THREE.CylinderGeometry(.015,.015,.14,6),brown,0,1.09,0);
   put(g,new THREE.SphereGeometry(.06,12,10),metal,0,1.17,0);}
  // portraits on two free edges (not the 240 door, not the 0 lift side)
  for(const [ang,kind] of [[P.catEdge,'cat'],[P.robotEdge,'robot']] as const){
    const a=ang*Math.PI/180,d=INRADIUS-.11-.03,px=cx+Math.cos(a)*d,pz=cz+Math.sin(a)*d,yaw=Math.atan2(-Math.cos(a),-Math.sin(a)),y=fy+P.portraitBottom+P.portrait/2;
    const frame=new THREE.Mesh(new THREE.BoxGeometry(P.portrait+.12,P.portrait+.12,.05),kind==='cat'?turq:amb);frame.position.set(px,y,pz);frame.rotation.y=yaw;group.add(frame);
    const pic=new THREE.Mesh(new THREE.PlaneGeometry(P.portrait,P.portrait),new THREE.MeshBasicMaterial({map:portraitTexture(kind)}));
    pic.position.set(px-Math.cos(a)*.03,y,pz-Math.sin(a)*.03);pic.rotation.y=yaw;group.add(pic);
  }
  // paths: two inlaid .08 strips, each from its portrait toward its own stage sector, converging at the stage.
  // Noa (turquoise) from edge 120 to the x-negative sector; Alon (amber) from edge 180 around the north side to the x-positive sector.
  const strip=(pts:number[][],m:THREE.Material)=>{for(let i=0;i<pts.length-1;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az),s=add(new THREE.BoxGeometry(L,.012,.08),m,cx+(ax+bx)/2,fy+.008,cz+(az+bz)/2,group);s.rotation.y=-Math.atan2(bz-az,bx-ax)}};
  strip([[-2.4,-4.3],[-1.9,-2.6],[-1.2,-1.45]],turq);
  strip([[3.6,1.55],[2.3,1.5],[1.3,.7]],amb);
  for(const [col,x,z] of [[P.turquoise,-1.4,-2.2],[P.amber,1.4,-2.2]] as const){const l=new THREE.PointLight(col,5,6,2);l.position.set(cx+x,fy+2.2,cz+z);group.add(l);}
}
