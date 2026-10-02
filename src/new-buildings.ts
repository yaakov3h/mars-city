import * as THREE from 'three';
type Part=(g:THREE.BufferGeometry,m:THREE.Material,x?:number,y?:number,z?:number)=>THREE.Mesh;
const std=(color:string,rough=.7,metal=.1)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const glow=(color:string)=>new THREE.MeshBasicMaterial({color});
const glass=(color='#bfe4e8',opacity=.22)=>new THREE.MeshPhysicalMaterial({color,transparent:true,opacity,roughness:.08,metalness:.05,side:THREE.DoubleSide,depthWrite:false});
function label(text:string,w:number,h:number,font:string,fg='#fff1c9',bg='rgba(9,30,40,.9)'){const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const g=c.getContext('2d')!;g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);g.strokeStyle=fg;g.lineWidth=6;g.strokeRect(8,8,c.width-16,c.height-16);g.fillStyle=fg;g.font=font;g.textAlign='center';g.textBaseline='middle';g.shadowColor=fg;g.shadowBlur=8;g.fillText(text,c.width/2,c.height/2+4);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function tree(part:Part,x:number,y:number,z:number,s=1,leaf='#6fa05a'){part(new THREE.CylinderGeometry(.05*s,.08*s,.8*s,5),std('#6e4a35'),x,y+.4*s,z);for(let i=0;i<3;i++){const m=part(new THREE.IcosahedronGeometry(.42*s-i*.06*s,0),std(i%2?'#8fbf68':leaf,.9,0),x+(i-1)*.12*s,y+.95*s+i*.28*s,z+(i%2?.1:-.1)*s);m.scale.y=.85;}}

/** Personal finance mapping: a very tall tower of stacked metallic volumes with lit bands, glazed garden terraces and a rooftop shekel sign. */
export function financeTower(group:THREE.Group,part:Part,color:string){
 const stone=std('#b9a07f',.8),metal=std('#8fa7a1',.35,.6),bronze=std('#a77d57',.45,.6),dark=std('#2e3a3d',.5,.4),band=glow(color),warm=glow('#ffd79a'),gl=glass('#c3e7e1',.2);
 part(new THREE.CylinderGeometry(7.4,7.8,.7,6),stone,0,.35,0);
 part(new THREE.CylinderGeometry(6.3,6.6,.35,6),dark,0,.85,0);
 // Garden court around the foot, enclosed by glazing.
 for(let i=0;i<6;i++){const a=i*Math.PI/3+Math.PI/6;const x=Math.cos(a)*6.1,z=Math.sin(a)*6.1;const w=part(new THREE.BoxGeometry(5.2,2.6,.08),gl,Math.cos(a)*5.6,2.2,Math.sin(a)*5.6);w.rotation.y=-a+Math.PI/2;tree(part,x*.88,1,z*.88,1.5+(i%2)*.3,i%2?'#5f9a52':'#7aa95b');}
 const levels=[[4.6,7,0],[4.1,7,0],[3.6,6,0],[3.1,6,0],[2.6,5,0],[2.15,5,0],[1.75,4,0]];let y=1.05;
 levels.forEach(([r,h],i)=>{const body=part(new THREE.CylinderGeometry(r*.94,r,h as number,6),i%2?metal:stone,0,y+(h as number)/2,0);body.rotation.y=i*Math.PI/6;
  for(let k=0;k<6;k++){const a=k*Math.PI/3+(i*Math.PI/6);part(new THREE.BoxGeometry(.16,h as number,.16),bronze,Math.cos(a)*(r as number)*.94,y+(h as number)/2,Math.sin(a)*(r as number)*.94);}
  const b=part(new THREE.TorusGeometry((r as number)*.97,.07,5,6),band,0,y+(h as number)-.2,0);b.rotation.x=Math.PI/2;b.rotation.z=i*Math.PI/6;
  const b2=part(new THREE.TorusGeometry((r as number)*.96,.05,5,6),band,0,y+.2,0);b2.rotation.x=Math.PI/2;b2.rotation.z=i*Math.PI/6;
  // Lit windows and a planted terrace at every step.
  for(let k=0;k<6;k++){const a=k*Math.PI/3+i*Math.PI/6+Math.PI/6;const wn=part(new THREE.BoxGeometry(1.5,(h as number)*.55,.06),warm,Math.cos(a)*(r as number)*.9,y+(h as number)*.5,Math.sin(a)*(r as number)*.9);wn.rotation.y=-a+Math.PI/2;}
  const terr=part(new THREE.CylinderGeometry((r as number)*1.08,(r as number)*1.08,.16,6),stone,0,y+(h as number)+.02,0);terr.rotation.y=i*Math.PI/6;
  for(let k=0;k<6;k++){const a=k*Math.PI/3+i*Math.PI/6;tree(part,Math.cos(a)*(r as number)*.93,y+(h as number)+.1,Math.sin(a)*(r as number)*.93,.8,'#6ba058');}
  y+=h as number;});
 // Crown, mast and the rooftop shekel sign (two crossed lit panels).
 part(new THREE.CylinderGeometry(1.1,1.5,1.2,6),bronze,0,y+.6,0);part(new THREE.CylinderGeometry(.12,.16,5.5,6),bronze,0,y+3.9,0);
 const map=label('₪',1,1,'700 620px sans-serif','#ffe6a7','rgba(0,0,0,0)');
 for(let k=0;k<2;k++){const m=new THREE.Mesh(new THREE.PlaneGeometry(4.6,4.6),new THREE.MeshBasicMaterial({map,transparent:true,side:THREE.DoubleSide,depthWrite:false}));m.position.set(0,y+8.8,0);m.rotation.y=k*Math.PI/2;m.userData={buildingId:'b-money-map-20261001'};group.add(m);}
 const halo=part(new THREE.TorusGeometry(2.9,.06,6,40),warm,0,y+8.8,0);halo.rotation.x=Math.PI/2;
 
}

/** Flight compensation: a small, cute airplane with skylights. */
export function cuteAirplane(group:THREE.Group,part:Part,color:string){
 const body=std('#c98a6e',.6,.05),accent=std('#b5483a',.55),teal=std('#9c5a43',.55),stone=std('#8f6a52',.9),gl=glass('#9cc8ff',.35),win=glow('#8fc4ff');
 part(new THREE.CylinderGeometry(6.2,6.4,.4,6),stone,0,.2,0);
 const pad=part(new THREE.TorusGeometry(5.9,.06,5,6),glow(color),0,.46,0);pad.rotation.x=Math.PI/2;pad.rotation.z=Math.PI/6;
 const fus=part(new THREE.CapsuleGeometry(1.55,5.4,8,16),body,0,2.6,0);fus.rotation.z=Math.PI/2;
 const nose=part(new THREE.SphereGeometry(1.6,16,12),accent,2.95,2.6,0);nose.scale.set(.9,1,1);
 // Wings, tail, stubby and rounded.
 for(const s of [-1,1]){const w=part(new THREE.CylinderGeometry(.34,.34,4.4,10),teal,-.2,2.35,s*3.1);w.rotation.x=Math.PI/2;w.scale.set(2.2,1,.45);part(new THREE.SphereGeometry(.48,10,8),accent,-.2,2.35,s*5.3);
  const t=part(new THREE.CylinderGeometry(.22,.22,1.9,8),teal,-4,2.7,s*1.0);t.rotation.x=Math.PI/2;t.scale.set(1.8,1,.5);}
 const fin=part(new THREE.CylinderGeometry(.2,.2,2.1,8),accent,-4.1,3.7,0);fin.scale.set(1.8,1,.5);fin.rotation.z=-.22;
 // Round windows plus two glazed skylights on the roof.
 for(const s of [-1,1])for(let i=0;i<5;i++){const m=part(new THREE.CylinderGeometry(.3,.3,.06,14),win,1.7-i*.95,2.9,s*1.5);m.rotation.x=Math.PI/2;}
 for(const x of [1.0,-1.3]){const sk=part(new THREE.SphereGeometry(.95,16,8,0,Math.PI*2,0,Math.PI/2),gl,x,3.85,0);sk.scale.set(1.15,.8,1);const r=part(new THREE.TorusGeometry(.95,.05,5,20),std('#a77d57',.4,.6),x,3.86,0);r.rotation.x=Math.PI/2;r.scale.set(1.15,1.15,1);}
 // Cute face and a spinning-style propeller.
 for(const s of [-1,1]){part(new THREE.SphereGeometry(.34,10,8),glow('#1b2c34'),4.1,3.05,s*.62);part(new THREE.SphereGeometry(.1,8,6),glow('#fff'),4.35,3.18,s*.68);part(new THREE.SphereGeometry(.2,8,6),glow('#f7b3b7'),3.95,2.35,s*1.05);}
 part(new THREE.SphereGeometry(.2,8,6),glow('#c5656a'),4.5,2.7,0);
 part(new THREE.SphereGeometry(.22,10,8),accent,4.55,2.75,0);
 for(let i=0;i<2;i++){const p=part(new THREE.BoxGeometry(.08,3.1,.34),accent,-.0+5.1,2.6,0);p.position.x=4.95;p.rotation.x=i*Math.PI/2;}
 for(const s of [-1,1]){part(new THREE.CylinderGeometry(.08,.08,1.3,6),std('#6e4a35'),1.4,1.3,s*1.1);part(new THREE.SphereGeometry(.38,10,8),std('#2f3a3d',.8),1.4,.7,s*1.1);}
 part(new THREE.SphereGeometry(.34,10,8),std('#2f3a3d',.8),-3.4,.7,0);
 const bg=part(new THREE.CylinderGeometry(5.4,5.4,.05,6),glow('#4a7dff'),0,.5,0);bg.scale.set(1,1,1);const bg2=part(new THREE.SphereGeometry(1.5,12,8),glow('#6fa8ff'),0,1.2,0);bg2.scale.set(2.6,.2,1.3);
 tree(part,-4.8,.4,-3.8,1.1);tree(part,-5.2,.4,3.6,1.1);
 
}

/** Academic recognition: a small observatory tower on a stack of book-like slabs, glazed dome. */
export function scholarTower(group:THREE.Group,part:Part,color:string){
 const stone=std('#b9a07f',.8),paper=std('#e8dcc2',.85),leather=std('#7a4f3f',.8),violet=std('#8f80d8',.5,.3),bronze=std('#a77d57',.45,.6),gl=glass('#cfc6ff',.28),win=glow('#ffe7a8'),band=glow(color);
 part(new THREE.CylinderGeometry(6.4,6.8,.5,6),stone,0,.25,0);
 const slabs=[[5.2,.7,'#7a4f3f',0],[4.7,.7,'#d6c9a6',.25],[4.3,.7,'#5c6a8a',-.2]];let y=.5;
 for(const [w,h,c,off] of slabs as [number,number,string,number][]){const b=part(new THREE.BoxGeometry(w*1.5,h,w),std(c,.85),off*2,y+h/2,0);b.rotation.y=off;y+=h;}
 const drum=part(new THREE.CylinderGeometry(2.2,2.6,5.2,10),paper,0,y+2.6,0);
 for(let i=0;i<10;i++){const a=i*Math.PI/5;part(new THREE.BoxGeometry(.14,5.2,.14),bronze,Math.cos(a)*2.4,y+2.6,Math.sin(a)*2.4);const w=part(new THREE.BoxGeometry(.8,2,.05),win,Math.cos(a+Math.PI/10)*2.3,y+2.8,Math.sin(a+Math.PI/10)*2.3);w.rotation.y=-(a+Math.PI/10)+Math.PI/2;}
 for(const k of [0,1]){const r=part(new THREE.TorusGeometry(2.45+k*.25,.06,5,36),band,0,y+1.1+k*3.0,0);r.rotation.x=Math.PI/2;}
 y+=5.2;
 part(new THREE.CylinderGeometry(2.7,2.5,.3,10),bronze,0,y+.1,0);
 const dome=part(new THREE.SphereGeometry(2.6,24,12,0,Math.PI*2,0,Math.PI/2),gl,0,y+.2,0);
 for(let i=0;i<6;i++){const r=part(new THREE.TorusGeometry(2.6,.045,5,24,Math.PI),bronze,0,y+.2,0);r.rotation.y=i*Math.PI/6;}
 const tel=part(new THREE.CylinderGeometry(.22,.34,2.7,10),bronze,.6,y+1.4,0);tel.rotation.z=-.9;
 part(new THREE.SphereGeometry(.5,12,8),violet,0,y+.5,0);
 tree(part,-4.8,.5,-3.6,1.2);tree(part,-5,.5,3.8,1.2,'#7aa95b');
 
}

/** The Living Archive: a very large glass-fronted hall in the city's design language, with a cat statue guide at the entrance. */
export function livingArchive(group:THREE.Group,part:Part,color:string){
 const basalt=std('#3b3436',.7,.2),stone=std('#b9a07f',.8),bronze=std('#a77d57',.45,.6),copper=std('#c48b62',.4,.7),gl=glass('#bfe4e8',.2),warm=glow('#ffd79a'),band=glow(color),cat=std('#c9b79a',.75,.1);
 part(new THREE.CylinderGeometry(9.2,9.5,.8,6),basalt,0,.4,0);
 part(new THREE.CylinderGeometry(8.1,8.5,.35,6),stone,0,.95,0);
 // Tall glazed hall: hex body with frame mullions and stacked lit floors.
 const H=22,R=7.4;
 const shell=part(new THREE.CylinderGeometry(R*.9,R,H,6),gl,0,1.1+H/2,0);
 for(let k=0;k<6;k++){const a=k*Math.PI/3;for(const t of [-1,1]){}
  const px=Math.cos(a)*R*.97,pz=Math.sin(a)*R*.97;part(new THREE.BoxGeometry(.55,H,.55),k%2?copper:bronze,px,1.1+H/2,pz);
  for(let f=1;f<7;f++){const fr=part(new THREE.BoxGeometry(R*.96,.12,.2),bronze,Math.cos(a+Math.PI/6)*R*.82,1.1+f*H/7,Math.sin(a+Math.PI/6)*R*.82);fr.rotation.y=-(a+Math.PI/6)+Math.PI/2;}}
 for(let f=0;f<7;f++){const fl=part(new THREE.CylinderGeometry(R*(1-f*.012)*.9,R*.9,.22,6),f%2?stone:basalt,0,1.1+f*H/7,0);const b=part(new THREE.TorusGeometry(R*.88,.05,5,6),band,0,1.2+f*H/7,0);b.rotation.x=Math.PI/2;b.rotation.z=Math.PI/6;
  // Hanging lit "version" panels inside the glass, a hint of the archive below.
  for(let k=0;k<5;k++){const a=k*1.26+f*.7;const p=part(new THREE.BoxGeometry(.9,1.2,.05),warm,Math.cos(a)*R*.45,1.1+f*H/7+1.4,Math.sin(a)*R*.45);p.rotation.y=-a;}}
 // Stepped crown with a skylight ring.
 part(new THREE.CylinderGeometry(R*.62,R*.86,2.2,6),basalt,0,1.1+H+1.1,0);part(new THREE.CylinderGeometry(R*.38,R*.6,2,6),copper,0,1.1+H+3.1,0);
 const crown=part(new THREE.ConeGeometry(R*.34,3.4,6),gl,0,1.1+H+5.8,0);const ring=part(new THREE.TorusGeometry(R*.62,.08,5,6),band,0,1.1+H+2.1,0);ring.rotation.x=Math.PI/2;
 // Entrance portal on the +z side with a big cat statue as the official guide.
 const zf=R*.95+.1;
 part(new THREE.BoxGeometry(4.4,5.6,.7),basalt,0,3.8,zf+.15);part(new THREE.BoxGeometry(3.2,4.6,.8),glow('#e8c88a'),0,3.3,zf+.2);
 part(new THREE.BoxGeometry(5.2,.5,1),bronze,0,6.8,zf+.3);
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(4.4,1.1),new THREE.MeshBasicMaterial({map:label('מתחת כל הסיפור',4.4,1.1,'600 120px sans-serif')}));sign.position.set(0,7.6,zf+.85);sign.userData={buildingId:'b-living-archive-20261001'};group.add(sign);
 // Cat statue: seated, with tail, ears and lit eyes.
 const cx=3.6,cz=zf+2.6;part(new THREE.CylinderGeometry(1.6,1.9,.9,6),basalt,cx,.55,cz);
 const body=part(new THREE.SphereGeometry(1.45,20,14),cat,cx,2.4,cz);body.scale.set(1,1.35,.9);
 part(new THREE.SphereGeometry(1.05,20,14),cat,cx,4.65,cz+.2);
 for(const s of [-1,1]){const ear=part(new THREE.ConeGeometry(.38,.9,4),cat,cx+s*.62,5.55,cz+.2);ear.rotation.z=-s*.15;part(new THREE.SphereGeometry(.16,10,8),glow('#9ff0d8'),cx+s*.38,4.8,cz+1.15);part(new THREE.CylinderGeometry(.24,.3,1.5,8),cat,cx+s*.5,1.5,cz+.9);}
 part(new THREE.SphereGeometry(.12,8,6),glow('#c5656a'),cx,4.55,cz+1.25);
 const tail=part(new THREE.TorusGeometry(1.1,.2,8,18,Math.PI*1.2),cat,cx-1.4,1.5,cz-.3);tail.rotation.set(0,.8,.5);
 
 tree(part,-5.8,1.1,zf+1.6,1.4);tree(part,6.2,1.1,zf+1,1.4);
}

function flowerBed(part:Part,cx:number,cz:number,r:number,n:number,seed:number){
 const cols=['#f06a8d','#ffd24a','#fff1f4','#b78cf2','#ff9a52','#7fd0ff'];
 for(let i=0;i<n;i++){const a=(i*2.399+seed)%(Math.PI*2),d=r*(.35+.65*((i*0.618+seed*.13)%1));const x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d,h=.3+((i*7+seed)%5)*.07;
  part(new THREE.CylinderGeometry(.02,.03,h,4),std('#4f8a3c'),x,.45+h/2,z);
  part(new THREE.SphereGeometry(.13,8,6),glow(cols[(i+seed)%cols.length]),x,.45+h+.05,z);
  if(i%3===0)part(new THREE.SphereGeometry(.2,7,5),std('#5f9a47',.9),x+.12,.5,z-.1);}
}

/** Game concept pavilion: a small playful glass pavilion with cat ears on the roof, glowing play pieces and a flower garden. */
export function gamePavilion(group:THREE.Group,part:Part,color:string){
 const stone=std('#b9a07f',.85),bronze=std('#a77d57',.45,.6),copper=std('#c48b62',.4,.7),gl=glass('#d8f3f5',.16),band=glow(color),cat=std('#3b3436',.6,.2);
 part(new THREE.CylinderGeometry(6.2,6.4,.4,6),stone,0,.2,0);
 const pad=part(new THREE.TorusGeometry(5.9,.06,5,6),band,0,.46,0);pad.rotation.x=Math.PI/2;pad.rotation.z=Math.PI/6;
 // Glass pavilion: hex body, mullions, floor, and a low domed hex roof.
 part(new THREE.CylinderGeometry(2.6,2.6,.25,6),std('#8f6a52',.8),0,.55,0);
 part(new THREE.CylinderGeometry(2.4,2.5,2.6,6),gl,0,1.9,0);
 for(let k=0;k<6;k++){const a=k*Math.PI/3;part(new THREE.BoxGeometry(.14,2.7,.14),k%2?copper:bronze,Math.cos(a)*2.45,1.9,Math.sin(a)*2.45)}
 const roof=part(new THREE.CylinderGeometry(1.1,2.8,.9,6),copper,0,3.5,0);
 const band2=part(new THREE.TorusGeometry(2.55,.05,5,6),band,0,3.05,0);band2.rotation.x=Math.PI/2;band2.rotation.z=Math.PI/6;
 // Cat ears on top.
 for(const s of [-1,1]){const ear=part(new THREE.ConeGeometry(.6,1.3,4),cat,s*.85,4.5,0);ear.rotation.z=-s*.18;ear.rotation.y=Math.PI/4;const inner=part(new THREE.ConeGeometry(.34,.85,4),glow('#f7b3b7'),s*.85,4.45,.25);inner.rotation.z=-s*.18;inner.rotation.y=Math.PI/4}
 // Inside: glowing play pieces (dice, orbs, a joystick).
 for(let i=0;i<3;i++){const a=i*2.1;const d=part(new THREE.BoxGeometry(.5,.5,.5),glow(['#ffd24a','#7fd0ff','#f06a8d'][i]),Math.cos(a)*1,1.5+i*.15,Math.sin(a)*1);d.rotation.set(.5,a,.3)}
 part(new THREE.CylinderGeometry(.05,.05,.7,6),std('#2f3a3d'),0,1.05,0);part(new THREE.SphereGeometry(.2,10,8),glow('#f06a8d'),0,1.5,0);
 // Door glow on the +z face.
 part(new THREE.BoxGeometry(.9,1.5,.06),glow('#ffe7a8'),0,1.45,2.2);
 // Floating play orbs above.
 for(let i=0;i<4;i++){const a=i*1.57+.4;part(new THREE.SphereGeometry(.22,10,8),glow(['#ffd24a','#7fd0ff','#f06a8d','#b78cf2'][i]),Math.cos(a)*3.4,3.6+Math.sin(i*2)*.5,Math.sin(a)*3.4)}
 // Flower garden and trees around the foot, all under one glass dome.
 flowerBed(part,0,0,4.9,70,1);
 for(const [x,z] of [[-4.2,2.4],[4.4,2.2],[-4.4,-2.2],[4.2,-2.6],[0,-4.6],[-1.8,4.5]])tree(part,x,.4,z,1.15,'#6fa05a');
 for(const [x,z] of [[-3.4,-3.6],[3.2,3.6],[3.8,-0.4]])part(new THREE.IcosahedronGeometry(.4,0),std('#8a5a44',.95),x,.6,z);
 const dg=glass('#c9efe8',.14);const dome=part(new THREE.SphereGeometry(5.7,40,20,0,Math.PI*2,0,Math.PI/2),dg,0,.45,0);dome.scale.y=1.0;
 for(let i=0;i<8;i++){const rb=part(new THREE.TorusGeometry(5.7,.045,5,32,Math.PI),std('#f0d9c8',.4,.5),0,.45,0);rb.rotation.y=i*Math.PI/8}
 const rr=part(new THREE.TorusGeometry(5.7,.07,5,40),std('#f0d9c8',.4,.5),0,.47,0);rr.rotation.x=Math.PI/2;
}

/** Strata Spire: a very tall triangular tower with a sharp slanted roof. Layered rock slabs on its plinth echo the soil layers underneath. */
export function strataSpire(group:THREE.Group,part:Part,color:string){
 const basalt=std('#4a5468',.5,.4),steel=std('#8d9bb0',.35,.65),band=glow(color),win=glow('#ffe2a8'),gl=glass('#bfe9ef',.2);
 const layers=['#4a3f38','#7a5a44','#a27a55','#c79a68','#8a6a52','#5b4a42'];
 // Plinth: stepped rings of rock, one tone per soil layer.
 part(new THREE.CylinderGeometry(6.4,6.6,.4,6),std('#3a3633',.9),0,.2,0);
 layers.forEach((c,i)=>{const r=6.0-i*.55,h=.35;const m=part(new THREE.CylinderGeometry(r,r+.12,h,6),std(c,.95,0),0,.4+.2+i*h*.9,0);m.rotation.y=i*.18;});
 // Loose rocks sorted by layer colour around the plinth edge.
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2,rr=5.0+((i*7)%3)*.35;const c=layers[i%layers.length];const rk=part(new THREE.DodecahedronGeometry(.42+(i%3)*.12,0),std(c,.95,0),Math.cos(a)*rr,.75,Math.sin(a)*rr);rk.rotation.set(i,i*2,0);rk.scale.y=.6;}
 // Tapering triangular tower with a sharp slanted roof cut.
 const base=2.1,H=32,y0=2.6;
 part(new THREE.CylinderGeometry(3.4,3.9,H,3),basalt,0,y0+H/2,0).rotation.y=Math.PI/6;
 for(let k=0;k<3;k++){const a=k*Math.PI*2/3+Math.PI/6;const e=part(new THREE.BoxGeometry(.18,H,.18),steel,Math.cos(a)*3.7,y0+H/2,Math.sin(a)*3.7);e.rotation.z=0;}
 for(let j=1;j<=9;j++){const r=3.7-j*.04;const t=part(new THREE.TorusGeometry(r,.05,4,3),j%3===0?band:win,0,y0+j*3.1,0);t.rotation.x=Math.PI/2;t.rotation.z=Math.PI/6;}
 // Slanted roof: a tilted triangular slab and a sharp blade.
 const roof=part(new THREE.CylinderGeometry(3.5,3.5,.45,3),steel,.4,y0+H+.3,0);roof.rotation.y=Math.PI/6;roof.rotation.z=.32;
 const blade=part(new THREE.ConeGeometry(1.1,7.5,3),band,-.9,y0+H+4,0);blade.rotation.z=.22;blade.rotation.y=Math.PI/6;
 // Glass-covered garden at the foot of the tower.
 const dome=part(new THREE.SphereGeometry(2.2,20,10,0,Math.PI*2,0,Math.PI/2),gl,-3.6,.8,3.4);
 for(let i=0;i<4;i++){const r=part(new THREE.TorusGeometry(2.2,.04,4,20,Math.PI),steel,-3.6,.8,3.4);r.rotation.y=i*Math.PI/4;}
 tree(part,-3.6,.8,3.4,1.1,'#7aa95b');tree(part,-4.3,.8,3.0,.8);
 void dome;
}

/** The Search Building: a small, slightly weird house with an oversized magnifier and a funny rooftop contraption full of tiny details. */
export function searchBuilding(group:THREE.Group,part:Part,color:string){
 const stone=std('#b9a07f',.85),bronze=std('#a77d57',.45,.6),copper=std('#c48b62',.4,.7),paper=std('#efe3c4',.9),gl=glass('#d8f3f5',.2),band=glow(color),dark=std('#2f3a3d',.6,.3);
 part(new THREE.CylinderGeometry(6.2,6.4,.4,6),stone,0,.2,0);
 const pad=part(new THREE.TorusGeometry(5.9,.06,5,6),band,0,.46,0);pad.rotation.x=Math.PI/2;pad.rotation.z=Math.PI/6;
 // Crooked little house: stacked, slightly rotated boxes.
 const b1=part(new THREE.BoxGeometry(4.2,2.6,3.6),std('#8f6a52',.8),0,1.7,0);b1.rotation.y=.12;
 const b2=part(new THREE.BoxGeometry(3.2,1.8,3),std('#6f8c8f',.8),.3,3.9,.1);b2.rotation.y=-.25;
 for(const [x,y,z] of [[-1.2,1.8,1.85],[1.1,1.8,1.85],[0,4,1.6]] as number[][]){part(new THREE.BoxGeometry(.7,.8,.06),glow('#ffe2a8'),x,y,z);}
 // Oversized magnifier leaning on the roof.
 const ring=part(new THREE.TorusGeometry(1.5,.14,8,24),bronze,-1.4,6.6,.2);ring.rotation.y=.2;
 part(new THREE.CircleGeometry(1.4,24),glass('#9fe0ea',.28),-1.4,6.6,.22);
 const handle=part(new THREE.CylinderGeometry(.14,.18,2.4,8),dark,-2.6,5.1,.25);handle.rotation.z=-.7;
 // Rooftop contraption: dish, periscope, funnels, flag, hanging lanterns.
 const dish=part(new THREE.SphereGeometry(.9,14,8,0,Math.PI*2,0,Math.PI/2),copper,1.3,5.3,-.4);dish.rotation.x=Math.PI*.8;
 part(new THREE.CylinderGeometry(.08,.08,1.4,6),dark,1.3,4.9,-.4);
 const peri=part(new THREE.CylinderGeometry(.12,.12,2.2,8),bronze,.4,6.1,-.9);part(new THREE.BoxGeometry(.5,.3,.3),dark,.4,7.3,-.75);
 for(const [x,z,c] of [[.9,.9,'#d98a5b'],[-.2,1.0,'#5aa6a6']] as [number,number,string][]){const f=part(new THREE.ConeGeometry(.45,.8,10,1,true),std(c,.6,.3),x,5.2,z);f.rotation.z=Math.PI;}
 part(new THREE.CylinderGeometry(.04,.04,2,5),dark,-.8,5.8,-1.1);
 part(new THREE.BoxGeometry(.7,.45,.04),glow('#f06a8d'),-.45,6.4,-1.1);
 for(let i=0;i<4;i++){const a=i*1.5;part(new THREE.CylinderGeometry(.01,.01,.9,3),dark,Math.cos(a)*1.5,3.3,Math.sin(a)*1.5+1);part(new THREE.SphereGeometry(.13,8,6),glow(['#ffd24a','#7fd0ff','#f06a8d','#9ff07a'][i]),Math.cos(a)*1.5,2.8,Math.sin(a)*1.5+1);}
 // Tiny question marks and a calendar page floating by the door.
 const page=part(new THREE.BoxGeometry(.9,1.1,.05),paper,2.4,2.2,1.7);page.rotation.z=.2;
 for(let i=0;i<5;i++)part(new THREE.BoxGeometry(.1,.1,.06),glow('#d9505a'),2.15+(i%3)*.25,2.5-Math.floor(i/3)*.3,1.74);
 // Glass-covered plant corner.
 part(new THREE.SphereGeometry(1.4,16,8,0,Math.PI*2,0,Math.PI/2),gl,-3.2,.4,-2.6);
 tree(part,-3.2,.4,-2.6,.9,'#7aa95b');
 sleeve(part,color);
}

/** The sleeve (שרוול): glass corridor with plants and side lights from the search building toward the scholar tower, plus the wild reserve beside it. Positions are local to the search building hex. */
function sleeve(part:Part,color:string){
 const d=[.5,.8660254],n=[-.8660254,.5],yaw=-Math.atan2(d[1],d[0]),L=9.4,mid=[d[0]*8.66,d[1]*8.66];
 const gl=glass('#bfe9ef',.2),steel=std('#8d9bb0',.35,.65),dark=std('#0b0d12',.9,0),floor=std('#5a4a40',.9,0),lamp=glow('#ffe2a8'),band=glow(color);
 const tube=part(new THREE.CylinderGeometry(2.1,2.1,L,24,1,true),gl,mid[0],1.3,mid[1]);tube.rotation.order='YXZ';tube.rotation.y=yaw;tube.rotation.z=Math.PI/2;tube.rotation.x=0;
 const slab=part(new THREE.BoxGeometry(L,.16,4.4),floor,mid[0],.07,mid[1]);slab.rotation.y=yaw;
 for(let k=0;k<=6;k++){const t=-L/2+k*L/6;const rib=part(new THREE.TorusGeometry(2.1,.09,4,20),steel,mid[0]+d[0]*t,1.3,mid[1]+d[1]*t);rib.rotation.order='YXZ';rib.rotation.y=yaw+Math.PI/2;}
 for(const sd of [-1,1])for(let k=0;k<6;k++){const t=-L/2+.8+k*(L-1.6)/5;part(new THREE.BoxGeometry(.3,.2,.3),lamp,mid[0]+d[0]*t+n[0]*sd*1.95,.3,mid[1]+d[1]*t+n[1]*sd*1.95);}
 for(const [t,sd] of [[-3,1],[-1.5,-1],[0,1],[1.5,-1],[3,1]] as number[][])tree(part,mid[0]+d[0]*t+n[0]*sd*1.3,.15,mid[1]+d[1]*t+n[1]*sd*.55,.9,'#7aa95b');
 // Ramps down to the underground at both ends of the corridor, each with a dark opening.
 for(const e of [-1,1]){const cx=mid[0]+d[0]*e*(L/2+1.6),cz=mid[1]+d[1]*e*(L/2+1.6);const r=part(new THREE.BoxGeometry(3.2,.18,2.2),std('#6a5a4c',.9,0),cx,.04,cz);r.rotation.order='YXZ';r.rotation.y=yaw;r.rotation.z=-e*.22;part(new THREE.BoxGeometry(.9,.06,2.2),dark,cx+d[0]*e*1.7,-.2,cz+d[1]*e*1.7).rotation.y=yaw;const b=part(new THREE.TorusGeometry(1.1,.04,4,12),band,cx,.4,cz);b.rotation.x=Math.PI/2;}
 // Wild reserve: nothing grows here. West side (left on the default view): a big boulder. East side: a low crater with a very tall thin antenna and a red light.
 const wx=mid[0]+n[0]*7.2,wz=mid[1]+n[1]*7.2;
 const rk=std('#8a6a58',.95,0);part(new THREE.DodecahedronGeometry(3.1,0),rk,wx,1.4,wz).scale.set(1,.8,1);
 for(const [dx,dz,sc] of [[2.6,1.2,1.1],[-2.4,1.8,.9],[1.4,-2.8,1.0],[-1.6,-2.2,.7]] as number[][])part(new THREE.DodecahedronGeometry(sc,0),rk,wx+dx,.5,wz+dz).scale.set(1,.6,1);
 const ex=mid[0]-n[0]*7.6,ez=mid[1]-n[1]*7.6;
 const rim=part(new THREE.TorusGeometry(3.2,.55,6,24),std('#c9694a',.9,0),ex,.25,ez);rim.rotation.x=Math.PI/2;
 part(new THREE.CylinderGeometry(2.9,2.9,.06,24),dark,ex,.12,ez);
 part(new THREE.CylinderGeometry(.05,.09,18,6),steel,ex,9,ez);
 part(new THREE.SphereGeometry(.28,10,8),glow('#ff3b30'),ex,18.2,ez);
}

/** Monument: a dark, futuristic stepped pyramid inspired by Mayan temples. Each future monument takes a different world-landmark inspiration. */
export function monumentPyramid(group:THREE.Group){
 const obs=std('#1d2028',.5,.45),edge=glow('#58e0d0'),gold=std('#c79a58',.35,.7),core=glow('#ffd899');
 const add=(g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);group.add(o);return o;};
 add(new THREE.CylinderGeometry(9.6,9.8,.4,6),std('#2a2c33',.9,.1),0,.2,0);{const rg=new THREE.Mesh(new THREE.TorusGeometry(9.3,.07,4,6),edge);rg.rotation.x=Math.PI/2;rg.rotation.z=Math.PI/6;rg.position.y=.45;group.add(rg);}
 add(new THREE.CylinderGeometry(7.4,7.6,.3,4),std('#2a2c33',.9,.1),0,.5,0).rotation.y=Math.PI/4;
 const tiers=7;let y=.65;
 for(let i=0;i<tiers;i++){const w=10.2-i*1.35,h=1.15;const m=add(new THREE.BoxGeometry(w,h,w),obs,0,y+h/2,0);m.rotation.y=0;for(const sd of [-1,1]){add(new THREE.BoxGeometry(w+.1,.06,.1),edge,0,y+h+.02,sd*(w/2));add(new THREE.BoxGeometry(.1,.06,w+.1),edge,sd*(w/2),y+h+.02,0);}y+=h;}
 // Central stairway: sloped slab on the south face with glowing steps.
 for(let k=0;k<tiers;k++){const w=10.2-k*1.35;add(new THREE.BoxGeometry(2.2,1.15,.7),std('#3a3d46',.6,.3),0,.5+1.15*k+.575,w/2+.35-.0);add(new THREE.BoxGeometry(2.0,.05,.12),edge,0,.5+1.15*(k+1)+.03,w/2+.62);}
 // Temple crown with a gold roof comb and a bright core.
 add(new THREE.BoxGeometry(2.6,1.4,2.6),std('#262932',.5,.4),0,y+.7,0);
 add(new THREE.BoxGeometry(3,.25,3),gold,0,y+1.5,0);
 add(new THREE.ConeGeometry(.5,2.2,4),gold,0,y+2.7,0).rotation.y=Math.PI/4;
 add(new THREE.SphereGeometry(.38,12,8),core,0,y+4.1,0);
}
