import * as THREE from 'three';
import {detailedSurface,type World} from './world';
// The joint Mars City monument (#45), hex q=-4 r=6: one tower for the partnership of two assistants.
// Alon built everything above ground: a sealed basalt plinth, a hollow hexagonal tower with a turquoise (Noa)
// and amber (Alon) double spiral, a glass lift and a spiral stair, a crown greenhouse, a sealed glass cupola
// and the two-half hex symbol on top. Mars: no one goes outside unprotected, so nothing here opens to the air.
// Noa builds the underground room (its floor at ABSOLUTE world y=-8.4) and the lift's lower run up to the plinth floor - her part, not in this file.
// Local frame: origin = plot centre at plinth floor level (y=0). The plinth and its ground pad follow the city grid like every
// plot (a vertex on ±z, the same as the district tiles, the bespoke building pads and the leveled terrain); the tower body,
// the cupola and the symbol keep a vertex on +x.
export const JOINT_MONUMENT_ID='l-joint-monument-20261024';
export const MONUMENT=Object.freeze({
 plinth:{radius:8.6,height:3},
 body:{radius:5.6,x:1.8,y0:3,y1:46,wall:.3},
 shaft:{radius:1.5,x:3.6,z:0,y0:0,y1:52},
 stair:{inner:1.6,outer:2.8,y0:0,y1:46},
 crown:{y0:46,y1:52},
 // cupola: a vertical sealed glass hex wall 52-54.42, then a shallow glass dome cap rising to 54.52 at the lift axis.
 cupola:{radius:2.4,x:3.6,y0:52,wall:54.42,y1:54.52},
 // symbol: a small copper stem and the two-half hex, its top at 55.0 = the agreed ~55 envelope above the plinth floor.
 symbol:{y0:54.52,y1:55}
});
// Interface for Noa's underground piece: the lift axis meets the plinth floor here (plot-local, y=0 = plinth floor).
export const MONUMENT_SHAFT_POINT=Object.freeze({x:MONUMENT.shaft.x,z:MONUMENT.shaft.z,y:0,radius:MONUMENT.shaft.radius});
// Shared lift contract (agreed with Noa, do not move silently): world axis x=-13.72 z=90, her room floor at absolute world y=-8.4 (undergroundFloor, NOT podiumY-8.4),
// a 1.9x1.9 square cage whose door faces +z, a 2.4x2.4 square head pad at the plinth floor, stops 0 / 46 / 52.
export const MONUMENT_LIFT=Object.freeze({cage:1.9,headPad:2.4,opening:2.0,door:'+z',undergroundFloor:-8.4,stops:[0,46,52]});
// The ONE moving lift cab is built by Noa's underground builder (motion + stations, underground and above ground).
// This file draws no cab, only the glass sleeve, the head pad and the floor opening. What her cab must fit:
// a square 1.9 x 1.9 cab, 2.2 tall (floor to roof, frames included), door on +z, centred on the lift axis
// (plot-local x=3.6 z=0; world x=-13.7205 z=90). Stations are LOCAL to the plinth floor: world y = podiumY + station,
// where podiumY is the monument group's world y (ground at the plot centre). Only the stations are local: undergroundFloor -8.4 is an
// ABSOLUTE world y (NOT podiumY-8.4); her own stop(s) down there are hers to set.
// At the top stop (52) the cab stands inside the sealed cupola with >=0.2 head room under the glass: a view from the cab, no floor outside it.
export const MONUMENT_LIFT_CAB=Object.freeze({width:1.9,depth:1.9,height:2.2,door:'+z',
 axisLocal:Object.freeze({x:3.6,z:0}),axisWorld:Object.freeze({x:-13.7205,z:90}),
 stations:Object.freeze([Object.freeze({name:'plinth floor',y:0}),Object.freeze({name:'crown greenhouse',y:46}),Object.freeze({name:'observation cupola',y:52})]),
 undergroundFloor:-8.4,
 undergroundFloorFrame:'absolute world y',
 stationsAreLocal:'world y = podiumY + station'});
const TURQUOISE='#3fe3d4',AMBER='#ffad4d';
// The city's plot hex (world.ts hex(q,r,10) is pointy-top): circumradius 9.94, a vertex on ±z, flat faces on ±x.
// The monument's ground pad is that tile, drawn like a district tile; its top is the plinth floor (y=0), so podiumY
// does not move: the leveled terrain under it sits `drop` lower and the tile's warm rim shows that step, like the neighbours.
export const MONUMENT_GROUND_PAD=Object.freeze({radius:9.94,drop:.35});
/** Corner k of a grid-aligned hexagon (vertex on ±z, like the plot): plot-local [x,z]. k=1 is +z. */
export const plinthCorner=(r:number,k:number)=>[r*Math.cos(Math.PI/6+k*Math.PI/3),r*Math.sin(Math.PI/6+k*Math.PI/3)] as const;
/** Distance measure of the city's plot hexes (same as world.ts padDistance): <= apothem means inside. */
export const gridHexDistance=(x:number,z:number)=>Math.max(Math.abs(x),Math.abs(.5*x+.8660254*z),Math.abs(.5*x-.8660254*z));
/** Apothem of a vertex-at-+x hexagon of circumradius r. */
export const apothem=(r:number)=>r*Math.cos(Math.PI/6);
/** Distance from a point (local to a hexagon's centre) to the hexagon's inner wall faces. */
export function hexWallDistance(px:number,pz:number,innerApothem:number){let d=Infinity;for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;d=Math.min(d,innerApothem-(px*Math.cos(a)+pz*Math.sin(a)));}return d;}
/** Smallest gap between the spiral stair's outer edge and the tower's inner wall. */
export function stairWallClearance(){const{body,shaft,stair}=MONUMENT;return hexWallDistance(shaft.x-body.x,shaft.z,apothem(body.radius)-body.wall)-stair.outer;}
/** Two-half hex symbol: flat-top hexagon of circumradius `radius` (height 2*apothem) on a short stem. */
export const MONUMENT_SYMBOL=Object.freeze({stem:.04,radius:.25,apothem:apothem(.25)});
/** Shallow dome cap of the cupola, in the monument's local frame but centred on x=0 (place it at cupola.x). */
export function cupolaCapGeometry(){const{cupola}=MONUMENT,rise=cupola.y1-cupola.wall;
 const g=new THREE.SphereGeometry(cupola.radius,6,4,0,Math.PI*2,0,Math.PI/2);g.scale(1,rise/cupola.radius,1);g.translate(0,cupola.wall,0);return g;}
export function jointMonument(group:THREE.Group,w:World,skirt=2){
 const{plinth,body,shaft,stair,crown,cupola,symbol}=MONUMENT;
 const add=(g:THREE.BufferGeometry,m:THREE.Material,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);group.add(o);return o;};
 const surf=detailedSurface('stone'),metal=detailedSurface('metal');
 const basalt=new THREE.MeshStandardMaterial({color:'#2a292d',map:surf.color,normalMap:surf.normal,roughnessMap:surf.rough,normalScale:new THREE.Vector2(.18,.18),roughness:.82,metalness:.08});
 const copper=new THREE.MeshStandardMaterial({color:'#b47a4e',map:metal.color,normalMap:metal.normal,normalScale:new THREE.Vector2(.1,.1),roughness:.42,metalness:.65});
 const edge=new THREE.MeshBasicMaterial({color:'#ff9a45'}),turq=new THREE.MeshBasicMaterial({color:TURQUOISE}),amber=new THREE.MeshBasicMaterial({color:AMBER});
 const glass=new THREE.MeshPhysicalMaterial({color:'#cfe6e4',transparent:true,opacity:.22,roughness:.08,side:THREE.DoubleSide,depthWrite:false});
 const pale=new THREE.MeshStandardMaterial({color:'#e9dcc6',roughness:.5,metalness:.1});
 // vertex-at-+x hexagonal prism: CylinderGeometry starts its first vertex at +z, a quarter turn moves it to +x.
 const hex=(r:number,h:number,m:THREE.Material,x:number,y0:number,open=false)=>add(new THREE.CylinderGeometry(r,r,h,6,1,open,Math.PI/2),m,x,y0+h/2,0);
 const corner=(r:number,k:number)=>[r*Math.cos(k*Math.PI/3),r*Math.sin(k*Math.PI/3)] as const;
 const rod=(a:THREE.Vector3,b:THREE.Vector3,r:number,m:THREE.Material)=>{const d=b.clone().sub(a),o=add(new THREE.CylinderGeometry(r,r,d.length(),6),m,...a.clone().add(b).multiplyScalar(.5).toArray() as [number,number,number]);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;};
 const ring=(r:number,cx:number,y:number,thick:number,m:THREE.Material,c:(r:number,k:number)=>readonly [number,number]=corner)=>{for(let k=0;k<6;k++){const[ax,az]=c(r,k),[bx,bz]=c(r,k+1);rod(new THREE.Vector3(cx+ax,y,az),new THREE.Vector3(cx+bx,y,bz),thick,m);}};
 // Plinth: one sealed basalt hexagon, no door, no stair outside. A skirt runs into the ground so slopes never show a gap.
 // Inside it is a closed hall: floor at 0 (the lift's entry level, where Noa's shaft arrives), roof at 3, open to the atrium above.
 const H0=plinth.height,AI=apothem(body.radius)-body.wall;
 // The plinth follows the plot grid: CylinderGeometry's first vertex is on +z already (thetaStart 0), so no quarter turn here.
 const basaltWall=basalt.clone();basaltWall.side=THREE.DoubleSide;add(new THREE.CylinderGeometry(plinth.radius,plinth.radius,H0+skirt,6,1,true,0),basaltWall,0,(H0-skirt)/2,0);
 const hexShape=(r:number,cx=0,c:(r:number,k:number)=>readonly [number,number]=corner)=>{const s=new THREE.Shape();for(let k=0;k<=6;k++){const[px,pz]=c(r,k);k?s.lineTo(cx+px,-pz):s.moveTo(cx+px,-pz);}return s;};
 const hexHole=(r:number,cx=0)=>{const p=new THREE.Path();for(let k=6;k>=0;k--){const[px,pz]=corner(r,k);k===6?p.moveTo(cx+px,-pz):p.lineTo(cx+px,-pz);}return p;};
 const slab=(s:THREE.Shape,depth:number,m:THREE.Material,y:number)=>{const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false});g.rotateX(-Math.PI/2);return add(g,m,0,y,0);};
 const top=hexShape(plinth.radius,0,plinthCorner);top.holes.push(hexHole(AI/Math.cos(Math.PI/6),body.x));slab(top,.3,basalt,H0-.3);
 const L=MONUMENT_LIFT,floorS=hexShape(plinth.radius-.01,0,plinthCorner),sq=new THREE.Path(),o2=L.opening/2;
 sq.moveTo(shaft.x-o2,-o2);sq.lineTo(shaft.x-o2,o2);sq.lineTo(shaft.x+o2,o2);sq.lineTo(shaft.x+o2,-o2);sq.lineTo(shaft.x-o2,-o2);floorS.holes.push(sq);
 slab(floorS,.3,basalt,-.3);
 // Head pad: a 2.4x2.4 copper-and-amber frame round the 2.0 opening, flush on the plinth floor at the lift axis.
 const hp=L.headPad,fw=(hp-L.opening)/2;
 for(const s of [-1,1]){add(new THREE.BoxGeometry(hp,.06,fw),amber,shaft.x,.03,s*(hp-fw)/2).userData.liftHeadPad=true;add(new THREE.BoxGeometry(fw,.06,L.opening),amber,shaft.x+s*(hp-fw)/2,.03,0).userData.liftHeadPad=true;}
 ring(plinth.radius+.02,0,H0,.07,edge,plinthCorner);ring(plinth.radius+.02,0,.12,.05,edge,plinthCorner);
 for(let k=0;k<6;k++){const[cx,cz]=plinthCorner(plinth.radius+.02,k);rod(new THREE.Vector3(cx,0,cz),new THREE.Vector3(cx,H0,cz),.05,edge);}
 // Tower body: hollow hexagon, wall 0.3. Each face is two basalt piers around a tall glass strip, so the atrium,
 // the stair and the lift read from outside the way the approved render shows them.
 const H=body.y1-body.y0,A=apothem(body.radius),mid=A-body.wall/2,side=mid/Math.cos(Math.PI/6),pier=1.55;
 for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3,nx=Math.cos(a),nz=Math.sin(a),tx=-nz,tz=nx;
  for(const s of [-1,1]){const o=add(new THREE.BoxGeometry(pier+.09,H,body.wall),basalt,body.x+nx*mid+tx*s*(side/2-pier/2+.045),body.y0+H/2,nz*mid+tz*s*(side/2-pier/2+.045));o.rotation.y=-a+Math.PI/2;}
  const pane=add(new THREE.BoxGeometry(side-2*pier,H,.06),glass,body.x+nx*mid,body.y0+H/2,nz*mid);pane.rotation.y=-a+Math.PI/2;
 }
 // Copper edge glow on the six corners and at the foot and head of the tower.
 for(let k=0;k<6;k++){const[cx,cz]=corner(body.radius+.02,k);rod(new THREE.Vector3(body.x+cx,body.y0,cz),new THREE.Vector3(body.x+cx,body.y1,cz),.06,edge);}
 ring(body.radius+.02,body.x,body.y0+.06,.06,edge);ring(body.radius+.02,body.x,body.y1,.08,edge);
 // Double spiral: a turquoise band (Noa) and an amber band (Alon) wrap the body half a turn apart. Light, not stairs.
 const TURNS=2.25;
 class HexHelix extends THREE.Curve<THREE.Vector3>{phase:number;constructor(phase:number){super();this.phase=phase;}getPoint(t:number,target=new THREE.Vector3()){const th=this.phase+t*TURNS*Math.PI*2,f=((th%(Math.PI/3))+Math.PI/3)%(Math.PI/3)-Math.PI/6,r=(A+.06)/Math.cos(f);return target.set(body.x+r*Math.cos(th),body.y0+1.2+t*(H-2.4),r*Math.sin(th));}}
 const bandA=add(new THREE.TubeGeometry(new HexHelix(Math.PI/2),540,.16,6,false),turq);bandA.userData.spiral='noa';
 const bandB=add(new THREE.TubeGeometry(new HexHelix(-Math.PI/2),540,.16,6,false),amber);bandB.userData.spiral='alon';
  // Lift: a glass sleeve r1.5 from the plinth floor (0) to the cupola floor (52). No cab here: the one moving cab
 // (MONUMENT_LIFT_CAB) is Noa's, it runs from her room through this sleeve up into the cupola.
 // Below y=0 the shaft continues into Noa's room (her part). The head pad at the floor is the meeting point.
 add(new THREE.CylinderGeometry(shaft.radius,shaft.radius,shaft.y1-shaft.y0,28,1,true),glass,shaft.x,(shaft.y0+shaft.y1)/2,shaft.z).userData.liftShaft=true;
 for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;rod(new THREE.Vector3(shaft.x+Math.cos(a)*shaft.radius,shaft.y0,Math.sin(a)*shaft.radius),new THREE.Vector3(shaft.x+Math.cos(a)*shaft.radius,shaft.y1,Math.sin(a)*shaft.radius),.035,copper);}

 // Spiral stair round the shaft: open treads, inner radius 1.6, outer 2.8, from the plinth floor (0) up to the crown (46).
 const STEP=.25,SWEEP=Math.PI/8,n=Math.round((stair.y1-stair.y0)/STEP),tread=new THREE.Shape();
 tread.absarc(0,0,stair.outer,-SWEEP/2-.02,SWEEP/2+.02,false);tread.absarc(0,0,stair.inner,SWEEP/2+.02,-SWEEP/2-.02,true);
 const treadGeo=new THREE.ExtrudeGeometry(tread,{depth:.08,bevelEnabled:false,curveSegments:3});treadGeo.rotateX(-Math.PI/2);
 const steps:THREE.BufferGeometry[]=[];for(let i=1;i<=n;i++){const g=treadGeo.clone();g.rotateY(i*SWEEP);g.translate(shaft.x,stair.y0+i*STEP-.08,shaft.z);steps.push(g);}
 const merged=mergeAll(steps);add(merged,pale).userData.spiralStair=n;
 class Rail extends THREE.Curve<THREE.Vector3>{r:number;constructor(r:number){super();this.r=r;}getPoint(t:number,target=new THREE.Vector3()){const th=t*n*SWEEP;return target.set(shaft.x+this.r*Math.cos(th),stair.y0+t*(stair.y1-stair.y0)+.9,-this.r*Math.sin(th));}}
 add(new THREE.TubeGeometry(new Rail(stair.outer-.05),n*3,.035,5,false),copper);
 // Crown greenhouse, 46-52: glass walls on the body footprint, copper frames, a flat glass roof, plants inside.
 const floor=new THREE.Shape();for(let k=0;k<=6;k++){const[cx,cz]=corner(body.radius,k);k?floor.lineTo(cx,-cz):floor.moveTo(cx,-cz);}
 const hole=new THREE.Path();hole.absarc(shaft.x-body.x,0,stair.outer+.05,0,Math.PI*2,true);floor.holes.push(hole);
 const floorGeo=new THREE.ExtrudeGeometry(floor,{depth:.3,bevelEnabled:false});floorGeo.rotateX(-Math.PI/2);add(floorGeo,basalt,body.x,crown.y0-.3,0);
 hex(body.radius,crown.y1-crown.y0,glass,body.x,crown.y0,true);
 for(let k=0;k<6;k++){const[cx,cz]=corner(body.radius,k);rod(new THREE.Vector3(body.x+cx,crown.y0,cz),new THREE.Vector3(body.x+cx,crown.y1,cz),.07,copper);}
 for(const y of [crown.y0+2,crown.y0+4])ring(body.radius,body.x,y,.035,copper);
 ring(body.radius,body.x,crown.y1,.09,copper);
 const roof=new THREE.Shape();for(let k=0;k<=6;k++){const[cx,cz]=corner(body.radius,k);k?roof.lineTo(cx,-cz):roof.moveTo(cx,-cz);}
 const roofHole=new THREE.Path();for(let k=6;k>=0;k--){const[cx,cz]=corner(cupola.radius,k);k===6?roofHole.moveTo(shaft.x-body.x+cx,-cz):roofHole.lineTo(shaft.x-body.x+cx,-cz);}roof.holes.push(roofHole);
 const roofGeo=new THREE.ExtrudeGeometry(roof,{depth:.12,bevelEnabled:false});roofGeo.rotateX(-Math.PI/2);add(roofGeo,glass,body.x,crown.y1-.12,0);
 // Planters along the inner glass and the plants themselves (the colony's own tree helper, like the other domes).
 const beds=[[-3.3,0],[-2.1,2.3],[-2.1,-2.3],[0.3,3.2],[0.3,-3.2],[-3.4,1.6],[-3.4,-1.6],[-1.2,0]];
 beds.forEach(([bx,bz],i)=>{add(new THREE.CylinderGeometry(.5,.42,.4,10),basalt,body.x+bx,crown.y0+.2,bz);w.catalogTree(group,body.x+bx,crown.y0+.4,bz,i%3,'joint-monument-crown-'+i,1.5);});
 // Cupola, 52-54.52: a small sealed hexagonal glass hood over the lift axis - a vertical glass hex wall and a shallow
 // glass dome on top. Copper frames, no railing, no balcony, no floor: the 52 stop is a view from the cab, not a room to walk round.
 hex(cupola.radius,cupola.wall-cupola.y0,glass,cupola.x,cupola.y0,true).userData.cupola='sealed';
 add(cupolaCapGeometry(),glass,cupola.x,0,0).userData.cupola='sealed';
 ring(cupola.radius,cupola.x,cupola.y0+.05,.07,copper);ring(cupola.radius,cupola.x,cupola.wall,.06,copper);
 for(let k=0;k<6;k++){const[cx,cz]=corner(cupola.radius,k);rod(new THREE.Vector3(cupola.x+cx,cupola.y0,cz),new THREE.Vector3(cupola.x+cx,cupola.wall,cz),.045,copper);
  const pts:THREE.Vector3[]=[];for(let j=0;j<=6;j++){const ph=j/6*Math.PI/2,r=cupola.radius*Math.cos(ph);const[px,pz]=corner(r,k);pts.push(new THREE.Vector3(cupola.x+px,cupola.wall+(cupola.y1-cupola.wall)*Math.sin(ph),pz));}
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),12,.035,5,false),copper);}
 // Symbol: a two-half hexagon (flat top), turquoise half and amber half, on a short copper stem on the cupola's apex.
 const{stem,apothem:sA,radius:sR}=MONUMENT_SYMBOL,sY=symbol.y0+stem+sA;add(new THREE.CylinderGeometry(.05,.07,stem+.02,6),copper,cupola.x,symbol.y0+stem/2,0);
 const half=(s:number)=>{const sh=new THREE.Shape();sh.moveTo(0,sA);sh.lineTo(s*sR/2,sA);sh.lineTo(s*sR,0);sh.lineTo(s*sR/2,-sA);sh.lineTo(0,-sA);sh.lineTo(0,sA);const g=new THREE.ExtrudeGeometry(sh,{depth:.1,bevelEnabled:false});g.translate(0,0,-.05);return g;};
 const sym=new THREE.Group();sym.position.set(cupola.x,sY,0);sym.userData.symbol='two-half hex';sym.userData.halves={turquoise:'noa',amber:'alon'};group.add(sym);
 const st=new THREE.Mesh(half(1),turq),sa=new THREE.Mesh(half(-1),amber);st.userData.identity='noa';sa.userData.identity='alon';sym.add(st,sa);
 const sym2=sym.clone();sym2.rotation.y=Math.PI/2;group.add(sym2);
}
function mergeAll(list:THREE.BufferGeometry[]){let count=0,icount=0;for(const g of list){count+=g.attributes.position.count;icount+=g.index?g.index.count:g.attributes.position.count;}
 const pos=new Float32Array(count*3),nor=new Float32Array(count*3),idx:number[]=[];let o=0;
 for(const g of list){const p=g.attributes.position,nn=g.attributes.normal;pos.set(p.array as Float32Array,o*3);if(nn)nor.set(nn.array as Float32Array,o*3);if(g.index)for(let i=0;i<g.index.count;i++)idx.push(g.index.getX(i)+o);else for(let i=0;i<p.count;i++)idx.push(i+o);o+=p.count;}
 void icount;const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.BufferAttribute(pos,3));out.setAttribute('normal',new THREE.BufferAttribute(nor,3));out.setIndex(idx);return out;}
/** The plot's hex ground pad, drawn the way world.ts zone() draws a district tile: a dark tile with its top at the
 * plinth floor (y=0) and a warm rim wall down into the terrain, a copper edge halo and six corner posts. The tile is a
 * ring round the plinth (the plinth's own floor covers the middle), so nothing is coplanar with the plinth floor.
 * `ground(x,z)` returns the natural terrain height in this local frame. Grid-aligned: a vertex on ±z, like every plot. */
export function monumentGroundPad(group:THREE.Group,ground:(x:number,z:number)=>number,m:{tile:THREE.Material;wall:THREE.Material;glow:THREE.Material;post:THREE.Material}){
 const R=MONUMENT_GROUND_PAD.radius,drop=MONUMENT_GROUND_PAD.drop,inner=MONUMENT.plinth.radius-.1;
 const add=(g:THREE.BufferGeometry,mat:THREE.Material,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,mat);o.position.set(x,y,z);o.receiveShadow=true;o.userData.monumentGroundPad=true;group.add(o);return o;};
 const tile=new THREE.Shape(),hole=new THREE.Path();
 for(let k=0;k<=6;k++){const[px,pz]=plinthCorner(R,k);k?tile.lineTo(px,-pz):tile.moveTo(px,-pz);}
 for(let k=6;k>=0;k--){const[px,pz]=plinthCorner(inner,k);k===6?hole.moveTo(px,-pz):hole.lineTo(px,-pz);}
 tile.holes.push(hole);const tg=new THREE.ShapeGeometry(tile);tg.rotateX(-Math.PI/2);add(tg,m.tile).userData.groundTile=true;
 const v:number[]=[],idx:number[]=[];
 for(let i=0;i<48;i++){const e=i/8,k=Math.floor(e),t=e-k,a=k*Math.PI/3,b=(k+1)*Math.PI/3,px=(Math.sin(a)*(1-t)+Math.sin(b)*t)*R,pz=(Math.cos(a)*(1-t)+Math.cos(b)*t)*R;v.push(px,0,pz,px,Math.min(-drop-.12,ground(px,pz)-.08),pz);}
 for(let i=0;i<48;i++){const a=i*2,b=((i+1)%48)*2;idx.push(a,b,a+1,b,b+1,a+1);}
 const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(v,3));wg.setIndex(idx);wg.computeVertexNormals();add(wg,m.wall).userData.groundRim=true;
 const halo=add(new THREE.TorusGeometry(R-.16,.095,5,6),m.glow,0,.13,0);halo.rotation.x=Math.PI/2;halo.rotation.z=Math.PI/6;
 for(let i=0;i<6;i++){const a=i*Math.PI/3;add(new THREE.CylinderGeometry(.09,.14,1.1,6),m.post,Math.sin(a)*(R-.8),.45,Math.cos(a)*(R-.8));}
}
