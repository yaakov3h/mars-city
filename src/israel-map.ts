// Permanent live installation: "Israel skies" live-traffic map table on five city hexes.
// Data: adsb.lol snapshot refreshed by .github/workflows/aircraft.yml (~30 min), served from
// public/aircraft/israel-latest.json (same origin) or raw.githubusercontent.com (freshest).
import * as THREE from 'three';
import {Text} from 'troika-three-text';
import type {World} from './world';
import outline from './israel-outline.json';
import sample from './israel-aircraft-sample.json';

export const ISRAEL_MAP_ID='israel-sky-map-20261020';

type Ac={hex?:string;flight?:string;lat?:number;lon?:number;alt_baro?:number|string;gs?:number;track?:number};
type LivePayload={fetchedAt:string;ac:Ac[]};

const HEX=10;
const hexCenter=(q:number,r:number):[number,number]=>[HEX*Math.sqrt(3)*(q+r/2),HEX*1.5*r];
export const PLOTS:[number,number][]=[[-1,5],[0,5],[-1,6],[0,4],[-2,6]]; // 4 map hexes + panel on the eastern hex; hugs city plots (-2,5),(-1,4),(0,3)
const LON0=34.2,LON1=35.95,LAT0=29.4,LAT1=33.45; // map frame around Israel
const KM_LON=85.4,KM_LAT=110.6;
const SPEEDUP=60; // on-screen motion is accelerated; positions and counts come from real snapshots
const PADS=new THREE.Color('#1d3038'),EDGE='#9ed5c8';

type Dot={flight:string;alt:number;kmx:number;kmy:number;ve:number;vn:number};

const borderPts=((outline as {geometry:{coordinates:number[][][]}}).geometry.coordinates[0] as number[][]);

function toDots(list:Ac[]):Dot[]{
  return list.filter(a=>typeof a?.lat==='number'&&typeof a?.lon==='number'&&typeof a?.alt_baro==='number'&&(a.alt_baro as number)>0).map(a=>{
    const v=(a.gs??220)*1.852/3600*SPEEDUP,rad=(a.track??0)*Math.PI/180;
    return{flight:(a.flight||a.hex||'?').trim(),alt:a.alt_baro as number,kmx:((a.lon as number)-LON0)*KM_LON,kmy:(LAT1-(a.lat as number))*KM_LAT,ve:Math.sin(rad)*v,vn:Math.cos(rad)*v};
  });
}

function canvasTexture(plots:[number,number][],x0:number,z0:number,W:number,H:number,airborne:number,fetchedAt?:string){
  const CW=1400,CH=Math.round(CW*H/W),c=document.createElement('canvas');c.width=CW;c.height=CH;
  const g=c.getContext('2d')!;
  const px=(wx:number)=>(wx-x0)/W*CW,pz=(wz:number)=>(wz-z0)/H*CH;
  // hex clip region (screen exists only inside the hexes - no surrounding frame)
  const hexPath=(cx:number,cz:number)=>{for(let i=0;i<6;i++){const a=i*Math.PI/3,vx=cx+Math.sin(a)*(HEX-.35),vz=cz+Math.cos(a)*(HEX-.35);i?g.lineTo(px(vx),pz(vz)):g.moveTo(px(vx),pz(vz))}g.closePath()};
  g.save();g.beginPath();for(const [q,r] of plots){const [cx,cz]=hexCenter(q,r);hexPath(cx,cz)}g.clip();
  // screen background only inside the hexes
  g.fillStyle='rgba(13,24,30,0.94)';g.fillRect(0,0,CW,CH);
  // faint grid
  g.strokeStyle='rgba(158,213,200,.08)';g.lineWidth=1;
  for(let i=1;i<12;i++){g.beginPath();g.moveTo(CW*i/12,0);g.lineTo(CW*i/12,CH);g.stroke();g.beginPath();g.moveTo(0,CH*i/12);g.lineTo(0,CH*i/12);g.stroke()}
  // map fit
  const mapKmW=(LON1-LON0)*KM_LON,mapKmH=(LAT1-LAT0)*KM_LAT;
  const areaW=W*.62,areaX0=x0+W*.015;
  const m=1.4,s=Math.min((areaW-2*m)/mapKmW,(H-2*m)/mapKmH);
  // right-align the map over the 4 map hexes, against the panel hex
  const ox=areaX0+(areaW-m-mapKmW*s);
  const oz=z0+m+((H-2*m)-mapKmH*s)/2;
  const mx=(lon:number)=>ox+(lon-LON0)*KM_LON*s,mz=(lat:number)=>oz+(LAT1-lat)*KM_LAT*s;
  // land
  g.beginPath();borderPts.forEach(([lo,la],i)=>{i?g.lineTo(px(mx(lo)),pz(mz(la))):g.moveTo(px(mx(lo)),pz(mz(la)))});g.closePath();
  g.fillStyle='rgba(38,64,72,.95)';g.fill();
  g.save();g.shadowColor=EDGE;g.shadowBlur=18;g.strokeStyle=EDGE;g.lineWidth=3;g.stroke();g.restore();
  // cities
  const cities:[string,number,number,boolean][]=[['חיפה',32.79,34.99,true],['תל אביב',32.08,34.78,false],['ירושלים',31.77,35.21,false],['באר שבע',31.24,34.79,false],['אילת',29.56,34.95,true]];
  g.font='600 26px sans-serif';g.direction='rtl';
  for(const [name,la,lo,east] of cities){const X=px(mx(lo)),Y=pz(mz(la));g.fillStyle='#ffd899';g.beginPath();g.arc(X,Y,5,0,7);g.fill();g.fillStyle='#dfcba9';g.textAlign=east?'left':'right';g.fillText(name,east?X+14:X-12,Y+8)}
  // Ben Gurion marker
  const bgx=px(mx(34.9)),bgz=pz(mz(32.0));g.strokeStyle='#ffd899';g.lineWidth=2.5;g.beginPath();g.arc(bgx,bgz,14,0,7);g.stroke();g.beginPath();g.arc(bgx,bgz,7,0,7);g.stroke();
  // credit inside map area
  g.font='20px sans-serif';g.fillStyle='rgba(223,203,169,.75)';g.textAlign='left';g.direction='ltr';
  g.fillText('גבולות סכמטיים · תנועה מואצת',px(x0)+18,CH-20);
  {
    const[pcx,pcz]=hexCenter(...plots.reduce((a,b)=>hexCenter(...a)[0]>=hexCenter(...b)[0]?a:b));
    const panCx=px(pcx),panCz=pz(pcz);
    g.textAlign='center';g.direction='rtl';
    g.fillStyle='#9ed5c8';g.font='600 54px sans-serif';g.fillText('שמי ישראל',panCx,panCz-210);
    g.fillStyle='#dfcba9';g.font='30px sans-serif';g.fillText('טיסות חיות מעל הארץ',panCx,panCz-160);
    g.fillStyle='#ffd899';g.font='600 84px sans-serif';g.fillText(String(airborne),panCx,panCz-48);
    g.fillStyle='#dfcba9';g.font='26px sans-serif';g.fillText('מטוסים באוויר כרגע',panCx,panCz-6);g.fillStyle='rgba(223,203,169,.7)';g.font='21px sans-serif';g.fillText('נתונים: adsb.lol (ODbL)',panCx,panCz+38);
    if(fetchedAt){const d=new Date(fetchedAt);const hh=String(d.getHours()).padStart(2,'0'),mm=String(d.getMinutes()).padStart(2,'0');g.fillStyle='rgba(223,203,169,.55)';g.font='19px sans-serif';g.fillText(`עודכן ${hh}:${mm} · מתרענן כחצי שעה`,panCx,panCz+66)}
    g.fillStyle='rgba(158,213,200,.5)';g.fillRect(px(ox+mapKmW*s+.6),panCz-260,2,310);
  }
  g.restore();
  // hex rims
  g.strokeStyle=EDGE;g.lineWidth=4;g.shadowColor=EDGE;g.shadowBlur=12;
  for(const [q,r] of plots){const [cx,cz]=hexCenter(q,r);g.beginPath();hexPath(cx,cz);g.stroke()}
  const tex=new THREE.CanvasTexture(c);tex.anisotropy=4;return{tex,mapX:(lon:number)=>mx(lon),mapZ:(lat:number)=>mz(lat)};
}

// short-lived shared cache so scene rebuilds (tab/history switches) do not refetch
let liveCache:{at:number;payload:LivePayload|null}|undefined;
async function loadLive():Promise<LivePayload|null>{
  if(liveCache&&Date.now()-liveCache.at<5*60*1000)return liveCache.payload;
  const urls=['https://raw.githubusercontent.com/yaakov3h/mars-city/main/public/aircraft/israel-latest.json',import.meta.env.BASE_URL+'aircraft/israel-latest.json'];
  for(const u of urls){try{const r=await fetch(u);if(r.ok){const j=await r.json();if(j&&Array.isArray(j.ac)){liveCache={at:Date.now(),payload:j};return j}}}catch{/* try next source */}}
  liveCache={at:Date.now(),payload:null};return null;
}

export type MapTable={group:THREE.Group;stats():{aircraft:number;frames:number;avgUpdateMs:number;live:boolean;fetchedAt?:string};dispose():void};

export function addIsraelMapTable(world:World):MapTable{
  const plots=PLOTS;
  const centers=plots.map(([q,r])=>hexCenter(q,r));
  const rc=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);
  const terrain=world.scene.children.find(o=>(o as THREE.Mesh).geometry&&(o as THREE.Mesh).geometry.type==='PlaneGeometry') as THREE.Mesh|undefined;
  const baseY=centers.map(([x,z])=>{if(!terrain)return 0;terrain.updateWorldMatrix(true,false);rc.set(new THREE.Vector3(x,60,z),down);const hit=rc.intersectObject(terrain,false)[0];return hit?hit.point.y:0});
  const surfaceY=Math.max(...baseY)+.6; // flush pad height, like city zone tiles
  // flatten dune sand that pokes up through the screen: clamp terrain verts under the pads below the table top
  if(terrain){terrain.updateWorldMatrix(true,false);
    const pos=terrain.geometry.getAttribute('position') as THREE.BufferAttribute;
    const inv=terrain.matrixWorld.clone().invert(),v=new THREE.Vector3();
    for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(terrain.matrixWorld);
      if(centers.some(([cx,cz])=>Math.hypot(v.x-cx,v.z-cz)<HEX+.5)){v.y=Math.min(v.y,surfaceY-.7);v.applyMatrix4(inv);pos.setXYZ(i,v.x,v.y,v.z)}}
    pos.needsUpdate=true;terrain.geometry.computeVertexNormals()}
  const xs=centers.map(c=>c[0]),zs=centers.map(c=>c[1]);
  const x0=Math.min(...xs)-HEX,z0=Math.min(...zs)-HEX,W=Math.max(...xs)-Math.min(...xs)+2*HEX,H=Math.max(...zs)-Math.min(...zs)+2*HEX;
  const group=new THREE.Group();group.userData.mapTable=true;
  let live=false,fetchedAt:string|undefined;
  let dots:Dot[]=toDots((sample as {ac?:Ac[]}).ac??[]);
  const screenMat=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false});
  let texPack=canvasTexture(plots,x0,z0,W,H,dots.length);
  screenMat.map=texPack.tex;
  // slabs (one per hex, common flat top = the "table")
  for(let i=0;i<centers.length;i++){const[cx,cz]=centers[i];const h=surfaceY-.05-(baseY[i]-.8);const slab=new THREE.Mesh(new THREE.CylinderGeometry(HEX-.06,HEX-.06,h,6),new THREE.MeshStandardMaterial({color:PADS,roughness:.85}));slab.position.set(cx,surfaceY-.05-h/2,cz);group.add(slab)}
  // screen
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(W,H),screenMat);
  screen.rotation.x=-Math.PI/2;screen.position.set(x0+W/2,surfaceY,z0+H/2);group.add(screen);
  // dots
  const geo=new THREE.BufferGeometry();
  const dotTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d')!;const gr=g.createRadialGradient(32,32,2,32,32,30);gr.addColorStop(0,'rgba(255,240,200,1)');gr.addColorStop(.4,'rgba(255,216,137,.85)');gr.addColorStop(1,'rgba(255,216,137,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
  const points=new THREE.Points(geo,new THREE.PointsMaterial({size:1.5,map:dotTex,transparent:true,depthWrite:false,color:'#ffd899'}));
  points.frustumCulled=false;group.add(points);
  const labels:Text[]=[];
  function rebuild(){const n=dots.length;geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));for(const l of labels){l.dispose();group.remove(l)}labels.length=0;for(const d of dots){if(d.alt<20000)continue;const t=new Text();t.text=`${d.flight} · ${Math.round(d.alt).toLocaleString('en-US')}`;t.font=import.meta.env.BASE_URL+'fonts/sign-hebrew.ttf';t.fontSize=.85;t.anchorX='center';t.anchorY='bottom';t.color='#ffe9c4';t.outlineWidth=.08;t.outlineColor='#12222a';t.userData.noMerge=true;t.rotation.x=-Math.PI/3;t.sync();labels.push(t);group.add(t)}}
  const labelFor=(d:Dot)=>{const i=dots.filter(x=>x.alt>=20000).indexOf(d);return i>=0?labels[i]:undefined};
  function applyPayload(p:LivePayload|null){if(!p)return;const fresh=toDots(p.ac);if(!fresh.length)return;dots=fresh;live=true;fetchedAt=p.fetchedAt;const old=texPack.tex;texPack=canvasTexture(plots,x0,z0,W,H,dots.length,fetchedAt);screenMat.map=texPack.tex;screenMat.needsUpdate=true;old.dispose();rebuild()}
  let frames=0,totalMs=0;
  function update(dt:number){const t0=performance.now();const attr=geo.getAttribute('position') as THREE.BufferAttribute|undefined;if(!attr)return;const kmW=(LON1-LON0)*KM_LON,kmH=(LAT1-LAT0)*KM_LAT;
    for(let i=0;i<dots.length;i++){const d=dots[i];d.kmx+=d.ve*dt;d.kmy+=d.vn*dt;
      if(d.kmx<0||d.kmx>kmW){d.ve*=-1;d.kmx=Math.min(Math.max(d.kmx,0),kmW)}
      if(d.kmy<0||d.kmy>kmH){d.vn*=-1;d.kmy=Math.min(Math.max(d.kmy,0),kmH)}
      const lon=LON0+d.kmx/KM_LON,lat=LAT1-d.kmy/KM_LAT;
      const wx=texPack.mapX(lon),wz=texPack.mapZ(lat),wy=surfaceY+.35+(d.alt/42000)*5;
      attr.setXYZ(i,wx,wy,wz);const l=labelFor(d);if(l)l.position.set(wx,wy+.9,wz)}
    attr.needsUpdate=true;frames++;totalMs+=performance.now()-t0}
  let raf=0,last=performance.now(),disposed=false;
  const loop=()=>{if(disposed)return;raf=requestAnimationFrame(loop);const now=performance.now();update(Math.min((now-last)/1000,.1));last=now};
  rebuild();update(0);world.scene.add(group);loop();
  void loadLive().then(applyPayload);
  const refresh=setInterval(()=>{void loadLive().then(p=>{if(!disposed)applyPayload(p)})},15*60*1000);
  return{group,stats:()=>({aircraft:dots.length,frames,avgUpdateMs:frames?totalMs/frames:0,live,fetchedAt}),dispose(){disposed=true;cancelAnimationFrame(raf);clearInterval(refresh);for(const l of labels)l.dispose();world.scene.remove(group);group.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const m=o.material as THREE.MeshBasicMaterial;m.map?.dispose();m.dispose()}});texPack.tex.dispose();dotTex.dispose()}};
}
