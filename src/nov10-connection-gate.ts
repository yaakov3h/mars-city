import * as THREE from 'three';
import type {World} from './world';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
// Connection Gate (שער הקשר): two ribbons of light rise from opposite sides of the hex and meet high above it
// in a single arch. Both ribbons wear the same colours at the same heights, so the meeting point reads as two
// paths arriving at one place. It marks the first family link made through the assistants' trusted network -
// two separate paths becoming one connection. The whole structure stands above ground in the city's permanent
// daylight. Noa's turquoise signature is kept small: an entrance light strip and the roof light point.
export const CONNECTION_GATE_ID='b-connection-gate-20261110';
export const CONNECTION_GATE_PLOT=Object.freeze({q:4,r:0});
// Footprint relative to the hex centre; heights are above the pad top.
export const CONNECTION_GATE=Object.freeze({padRadius:8.3,plinthX:5.2,archTop:27.2,crownRadius:1.05,maxHeight:30.2});
// Shared height-banded palette: both paths carry the same colour at the same height.
export const GATE_BANDS=Object.freeze(['#4fd8be','#7ee8a2','#ffd166','#ff9a45','#ff6b8a','#b78cff']);
const copper=(e=.25)=>new THREE.MeshStandardMaterial({color:'#f0b074',roughness:.42,metalness:.72,emissive:new THREE.Color('#ff9a45'),emissiveIntensity:e});
const stone=()=>new THREE.MeshStandardMaterial({color:'#bca07b',roughness:.9,metalness:.05});
const band=(c:string)=>new THREE.MeshStandardMaterial({color:c,roughness:.32,metalness:.18,emissive:new THREE.Color(c),emissiveIntensity:.5});
const glow=(c:string)=>new THREE.MeshBasicMaterial({color:c});
export function connectionGate(part:Part,group:THREE.Group,world:World){
 const G=CONNECTION_GATE;
 part(new THREE.CylinderGeometry(G.padRadius,G.padRadius+.15,.5,6),stone(),0,.25);
 // Entrance light strip on the city-facing edge: Noa's small turquoise signature.
 const strip=part(new THREE.BoxGeometry(.5,.07,3.4),glow('#4fd8be'),-G.padRadius+.5,.54);
 strip.userData.noSignature=true;
 // Ground light paths: a slim glowing strip from each side of the pad toward its plinth.
 for(const side of [-1,1]){
  part(new THREE.BoxGeometry(2.7,.06,.5),glow(side<0?'#4fd8be':'#ffd166'),side*(G.plinthX+1.9),.53);
  // Path lights: small posts with tiny colour orbs alternating through the shared palette.
  for(let k=0;k<3;k++){
   const px=side*(G.plinthX+.9+k*.85);
   part(new THREE.CylinderGeometry(.05,.05,.7,6),copper(.15),px,.85,0);
   part(new THREE.SphereGeometry(.14,10,8),glow(GATE_BANDS[(k+(side<0?0:3))%GATE_BANDS.length]),px,1.32,0);
  }
  // Stepped copper plinth where the path leaves the ground.
  part(new THREE.CylinderGeometry(1.5,1.8,.8,8),copper(.18),side*G.plinthX,.9);
  part(new THREE.CylinderGeometry(1.1,1.32,.6,8),copper(.25),side*G.plinthX,1.6);
  const collar=part(new THREE.TorusGeometry(1.16,.06,8,24),band(side<0?'#4fd8be':'#b78cff'),side*G.plinthX,1.92);
  collar.rotation.x=Math.PI/2;
 }
 // The two ribbons: banded half-arches meeting at the crown. Same colour at the same height on both sides.
 const segments=26;
 for(const side of [-1,1]){
  const curve=new THREE.QuadraticBezierCurve3(
   new THREE.Vector3(side*G.plinthX,1.9,0),
   new THREE.Vector3(side*G.plinthX,G.archTop,0),
   new THREE.Vector3(0,G.archTop,0));
  for(let i=0;i<segments;i++){
   const p0=curve.getPoint(i/segments),p1=curve.getPoint((i+1)/segments);
   const len=p0.distanceTo(p1);
   const midH=(p0.y+p1.y)/2;
   const bandIndex=Math.min(GATE_BANDS.length-1,Math.floor((midH-1.9)/(G.archTop-1.9)*GATE_BANDS.length));
   const seg=part(new THREE.CylinderGeometry(.34,.34,len,10),band(GATE_BANDS[bandIndex]));
   seg.position.copy(p0.clone().add(p1).multiplyScalar(.5));
   seg.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),p1.clone().sub(p0).normalize());
  }
  // A thin warm light cord running the full curve inside the bands.
  const cord=new THREE.Mesh(new THREE.TubeGeometry(curve,32,.09,6),glow('#fff3d6'));
  cord.userData={buildingId:CONNECTION_GATE_ID,districtId:group.userData.districtId};
  group.add(cord);
  world.hit.push(cord);
 }
 // The crown where the two paths meet: a warm glowing heart-orb with a slow-turning copper ring.
 part(new THREE.SphereGeometry(G.crownRadius,18,14),glow('#ffe9b8'),0,G.archTop);
 const ring=part(new THREE.TorusGeometry(1.75,.12,8,44),copper(.45),0,G.archTop);
 ring.userData.spin=true;
 world.animated.push(ring);
 const ring2=part(new THREE.TorusGeometry(2.15,.07,8,44),band('#4fd8be'),0,G.archTop);
 ring2.rotation.x=Math.PI/2.4;
 ring2.userData.spin=true;
 world.animated.push(ring2);
 // Roof light point: a small turquoise beacon on a slim mast above the crown (Noa's signature).
 part(new THREE.CylinderGeometry(.07,.09,2.1,8),copper(.2),0,G.archTop+1.9);
 part(new THREE.SphereGeometry(.34,12,10),glow('#4fd8be'),0,G.archTop+3);
 // On the ground beneath the crown: a small warm lamp marking the meeting point, and two benches
 // angled toward each other - the two sides of the conversation.
 part(new THREE.CylinderGeometry(.05,.05,1.5,6),copper(.2),0,1.25);
 part(new THREE.SphereGeometry(.3,12,10),glow('#ffd9a8'),0,2.15);
 for(const side of [-1,1]){
  const seat=part(new THREE.BoxGeometry(1.7,.16,.55),copper(.22),side*1.7,.95,2.4);
  seat.rotation.y=-side*.5;
  for(const dz of [-.18,.18]){
   const leg=part(new THREE.CylinderGeometry(.05,.05,.55,6),copper(.15),side*1.7,.62,2.4+dz);
   leg.rotation.y=-side*.5;
  }
 }
}
