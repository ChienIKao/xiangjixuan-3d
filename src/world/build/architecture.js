import * as T from 'three';
import { box,cylinder,mesh,material,instances,consolidate,combineInstances,combineColors } from '../palette.js';
import { LAYOUT } from '../layout.js';
const group=(parent)=>{const g=new T.Group();parent.add(g);return g;};
function roof(parent,x,z,w,d,y,rise=1.3,axis=false,holes=false) {
  const g=group(parent);g.position.set(x,y,z);if(axis)g.rotation.y=Math.PI/2;
  if(axis)[w,d]=[d,w];
  const angle=Math.atan2(rise,d/2),length=Math.hypot(rise,d/2),tiles=[],missing=[],damaged=[];
  for(let side=-1;side<=1;side+=2)for(let ix=0;ix<Math.ceil(w/.24);ix++)for(let iz=0;iz<6;iz++){
    const q=(iz+.5)/6;
    const p=[-w/2+(ix+.5)*w/Math.ceil(w/.24),rise*(1-q),side*d/2*q,w/Math.ceil(w/.24)+.014,.085,length/6+.035,side*angle,0,0];
    (holes&&ix>=3&&ix<=8&&iz>=2&&iz<=4?missing:holes&&ix>9&&ix<15&&iz>1&&iz<5?damaged:tiles).push(p);
  }
  instances(g,new T.BoxGeometry(1,1,1),'tile',tiles);
  const patches=instances(g,new T.BoxGeometry(1,1,1),'tile',missing);
  const damagePatches=instances(g,new T.BoxGeometry(1,1,1),'tile',damaged);
  const ridge=holes?group(g):g;box(ridge,-w*.32,rise+.08,0,w*.36,.15,.17,'ridge');box(ridge,w*.32,rise+.08,0,w*.36,.15,.17,'ridge');const sag=box(ridge,0,rise+.08,0,w*.3,.15,.17,'ridge');if(holes)consolidate(ridge);
  for(const s of [-1,1])box(g,0,-.04,s*d/2,w+.15,.16,.13,'wood');
  consolidate(g);if(!holes)combineColors(g);return {group:g,patches,damagePatches,missing,ridge};
}
function wallsWithDoor(parent,x,z,w,h,d,doorAxis='none',gap=.9) {
  if(doorAxis==='x'){box(parent,x-(w+gap)/4,h/2,z,(w-gap)/2,h,d);box(parent,x+(w+gap)/4,h/2,z,(w-gap)/2,h,d);box(parent,x,h-.25,z,gap,.5,d);}
  else if(doorAxis==='z'){box(parent,x,h/2,z-(d+gap)/4,w,h,(d-gap)/2);box(parent,x,h/2,z+(d+gap)/4,w,h,(d-gap)/2);box(parent,x,h-.25,z,w,.5,gap);}
  else box(parent,x,h/2,z,w,h,d);
}
export function buildArchitecture(scene) {
  const fixed=group(scene),woodwork=group(scene),xuanWalls=group(scene),railing=group(scene);
  box(fixed,0,-.14,0,80,.25,80,'ground');
  const stones=[];
  for(let x=-4.75;x<5;x+=.5)for(let z=-5.75;z<3.4;z+=.5)stones.push([x,.015,z,.47,.045,.47]);
  const paving=instances(fixed,new T.BoxGeometry(1,1,1),'paving',stones);const color=new T.Color();for(let i=0;i<stones.length;i++)paving.setColorAt(i,color.set('#b8b2a6').multiplyScalar(.92+(i*17%11)*.012));
  // The front side is north (-Z); no south-facing entrance is added.
  box(fixed,0,.225,5.7,4.2,.45,4.6,'stone');box(woodwork,0,.47,6,3.2,.06,3.2,'wood');
  for(let i=0;i<3;i++)box(fixed,0,.075+i*.15,2.73+i*.27,1.4,.15*(i+1),.29,'stone');
  box(xuanWalls,0,1.8,7.65,3.4,2.7,.16);
  box(xuanWalls,1.65,1.8,6,.16,2.7,3.3);
  box(xuanWalls,-1.65,1.8,5.25,.16,2.7,1.7);box(xuanWalls,-1.65,1.8,7.33,.16,2.7,.65);box(xuanWalls,-1.65,2.95,6.6,.16,.4,.95);
  box(xuanWalls,0,.87,4.4,3.35,.84,.14);box(xuanWalls,0,2.85,4.4,3.35,.6,.14);
  const wallFaces=[];
  function face(g,normal,center){consolidate(g);wallFaces.push({group:g,normal:new T.Vector3(...normal),center:new T.Vector3(...center),alpha:1});}
  // Partition the walls before batching so each face can fade independently.
  const faces=[group(xuanWalls),group(xuanWalls),group(xuanWalls),group(xuanWalls)];
  for(const o of [...xuanWalls.children])if(o.isMesh){const p=o.position;faces[p.z>7.5?0:p.x>1.5?1:p.x< -1.5?2:3].add(o);}
  [[0,0,1],[1,0,0],[-1,0,0],[0,0,-1]].forEach((n,i)=>face(faces[i],n,[[0,1.8,7.65],[1.65,1.8,6],[-1.65,1.8,6],[0,1.8,4.4]][i]));
  const oldFront=group(faces[3]);box(oldFront,0,1.92,4.4,3.2,1.26,.14,'wood');
  for(let i=0;i<12;i++)box(oldFront,-1.5+i*.27,1.9,4.31,.012,1.2,.015,'ridge');consolidate(oldFront);
  const windows=group(faces[3]),shutters=group(faces[3]),newLattice=group(faces[3]);
  const paper=material('paper',{emissive:'#9b692f',emissiveIntensity:0});paper.userData.windowPaper=true;
  for(let i=0;i<4;i++) {
    const x=-1.125+i*.75;
    box(windows,x,1.9,4.39,.65,1.05,.045,paper);
    for(const side of [-1,1])box(windows,x+side*.34,1.9,4.32,.055,1.16,.075,'lattice');
    for(const y of [1.34,1.9,2.46])box(windows,x,y,4.32,.72,.045,.075,'lattice');
    for(const off of [-.15,0,.15])box(windows,x+off,1.9,4.30,.025,1.1,.055,'lattice');
    box(shutters,x,1.9,4.24,.66,1.08,.09,'wood');
    for(let k=0;k<2;k++){const b=box(newLattice,x,1.9,4.22,.035,.8,.04,'lattice');b.rotation.z=k?Math.PI/4:-Math.PI/4;}
  }
  consolidate(windows);consolidate(shutters);consolidate(newLattice);
  const paperHoles=group(faces[3]),holeTransforms=[];for(let i=0;i<8;i++)holeTransforms.push([-1.3+(i%4)*.75,1.65+Math.floor(i/4)*.48,4.25,.11+(i%3)*.025,.17,.1,0,0,i*.4]);
  const holes=instances(paperHoles,new T.CircleGeometry(1,5),material('#343b33',{side:T.DoubleSide}),holeTransforms);holes.castShadow=false;
  for(const x of [-1.9,1.9]){cylinder(woodwork,x,1.8,3.65,.075,.085,2.7);box(woodwork,x,3.08,5.6,.14,.17,4.8);}
  for(const side of [-1,1]){for(let i=0;i<5;i++)box(railing,side*(.85+i*.27),.76,3.45,.055,.6,.055,'wood');for(const y of [.6,1])box(railing,side*1.43,y,3.45,1.35,.07,.075,'wood');}
  const brokenRailing=group(scene);for(const side of [-1,1]){for(let i=0;i<4;i++){const post=box(brokenRailing,side*(1+i*.28),.72,3.45,.055,.5,.055,'wood');post.rotation.z=(i%2?.3:-.25);}const rail=box(brokenRailing,side*1.5,.91,3.45,.85,.07,.075,'wood');rail.rotation.z=side*.23;}consolidate(brokenRailing);consolidate(railing);
  const doorPivot=group(scene);doorPivot.position.set(-1.69,.45,6.15);box(doorPivot,0,1,.43,.1,2,.86,'wood');cylinder(doorPivot,.08,1,.7,.04,.04,.06,'gold');consolidate(doorPivot);
  const xr=roof(scene,0,5.85,4.65,5.4,3.12,1.3,false,true);
  const broken=group(xr.group);box(broken,.2,1.22,0,1.1,.12,.22,'ridge');broken.rotation.z=.12;consolidate(broken);
  // Inner chamber: two doorways in its east wall, one to the passage, one to the veranda.
  box(fixed,-4.95,.225,6.2,5.7,.45,5.6,'stone');
  const chamberWalls=group(scene);
  box(chamberWalls,-7.8,1.8,6.2,.18,2.7,5.6);box(chamberWalls,-5,1.8,9,5.7,2.7,.18);box(chamberWalls,-5,1.8,3.4,5.7,2.7,.18);
  box(chamberWalls,-2.1,1.8,5.27,.16,2.7,1.75);box(chamberWalls,-2.1,1.8,8,.16,2.7,1.95);box(chamberWalls,-2.1,2.95,6.6,.16,.4,.9);
  const chamberEast=group(chamberWalls);for(const o of [...chamberWalls.children])if(o.isMesh&&o.position.x> -2.2)chamberEast.add(o);face(chamberEast,[1,0,0],[-2.1,1.8,6.2]);
  const zr=roof(scene,-4.95,6.2,6,6,3.15,1.4,true);roof(fixed,-1.88,6.6,.65,1.3,2.65,.3);
  // Kitchen, with north, east and west doorways.
  box(fixed,4.75,.15,6.2,5.3,.3,5.6,'stone');
  const kg=group(fixed);kg.position.y=.3;
  box(kg,2.425,1.3,3.4,.65,2.6,.18);box(kg,5.525,1.3,3.4,3.75,2.6,.18);box(kg,3.2,2.4,3.4,.9,.4,.18);box(kg,4.75,1.3,9,5.3,2.6,.18);
  wallsWithDoor(kg,7.4,6,.18,2.6,6,'z');box(kg,2.1,1.3,6.7,.18,2.6,4.6);box(kg,2.1,2.4,3.9,.18,.4,.9);
  box(kg,5.8,.5,7.6,1.7,1,1.05,'stone');cylinder(kg,5.8,1.05,7.6,.45,.45,.1,'ridge');box(fixed,6,3.6,7.8,.5,2.8,.5,'stone');
  roof(scene,4.75,6.2,6,6.3,2.9,1.3,true);
  box(fixed,0,.3,-9.25,13,.6,6.5,'stone');box(fixed,0,2.7,-12.5,13,4.2,.22);
  for(const x of [-6.3,6.3])box(fixed,x,2.7,-9.5,.2,4.2,6.2);
  for(let i=0;i<6;i++)cylinder(woodwork,-6+i*2.4,2.7,-6.2,.12,.15,4.2);
  roof(scene,0,-9.25,14.4,7.7,4.8,1.7);
  for(let i=0;i<3;i++)box(fixed,0,.1+i*.2,-5.25-i*.26,3,.2*(i+1),.3,'stone');
  const banquet=group(fixed);box(banquet,0,1.55,-8.5,4,.13,1.15,'wood');for(const x of [-1.6,1.6])for(const z of [-8.1,-8.9])box(banquet,x,1.05,z,.12,1,.12,'wood');
  // Desk, chair, shelf and books.
  const desk=group(scene);desk.position.set(0,.45,5);
  box(desk,0,.78,0,1.1,.085,.55,'wood');for(const x of [-.43,.43])for(const z of [-.2,.2])box(desk,x,.38,z,.075,.76,.075,'wood');
  const lamp=cylinder(desk,.38,.87,0,.1,.15,.1,'soil');cylinder(desk,.38,1,0,.018,.018,.2,'gold');consolidate(desk);combineColors(desk);
  const hu=group(desk);const hm=box(hu,-.15,.86,0,.09,.025,.45,material('#f3e3b4',{emissive:'#b9a26c',emissiveIntensity:.35}));hm.rotation.y=.2;
  const lampLight=new T.PointLight('#ffc772',0,7,2);lampLight.position.set(.38,1.5,5);scene.add(lampLight);
  const roomLight=new T.PointLight('#ffe4ad',0,7,2);roomLight.position.set(0,2,5.5);scene.add(roomLight);
  box(woodwork,0,.97,5.65,.5,.1,.5,'wood');
  for(const x of [-.21,.21])for(const z of [5.44,5.86])box(woodwork,x,.7,z,.06,.54,.06,'wood');
  for(const x of [-.21,0,.21])box(woodwork,x,1.31,5.88,.045,.65,.055,'wood');box(woodwork,0,1.65,5.88,.53,.06,.07,'wood');
  for(const z of [5.3,7.3])box(woodwork,1.38,1.4,z,.35,1.9,.1);
  for(let i=0;i<4;i++)box(woodwork,1.38,.6+i*.5,6.3,.4,.065,2.1);
  const books=group(scene),bt=[];for(let i=0;i<60;i++)bt.push([1.37,.72+Math.floor(i/15)*.5,5.4+(i%15)*.125,.27,.13,.085]);
  const bm=instances(books,new T.BoxGeometry(1,1,1),'paper',bt);for(let i=0;i<60;i++)bm.setColorAt(i,color.set(['#c7b699','#6b776f','#a39380','#bca88a'][i%4]));
  // Court walls grow vertically; the base of each group remains on the ground.
  const courtWalls=[];
  for(const x of [-5,5]){const g=group(scene);g.position.x=x;box(g,0,1.3,-1.3,.3,2.6,9.4);box(g,0,2.65,-1.3,.48,.16,9.6,'tile');consolidate(g);combineColors(g);courtWalls.push(g);}
  const ruins=group(scene);for(const x of [-5,5])for(let i=0;i<12;i++){if(i===4||i===9)continue;const h=.55+(i*7%5)*.1;box(ruins,x,h/2,-5.6+i*.77,.32,h,.74,'soil');}consolidate(ruins);
  const fence=group(scene),partition=group(scene),ft=[];
  const segments=[[-5,3.2,-2,-2],[4,5,-2,-2],[1,1,-6,-4.4],[1,1,-3.6,-2],[-7,-5.7,1,1],[5.5,6.6,2.4,2.4]];
  for(const [x1,x2,z1,z2] of segments){const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz),n=Math.ceil(len/.12);
    for(let i=0;i<n;i++)ft.push([x1+dx*i/n,.65,z1+dz*i/n,.04,1.3,.04]);
    for(const y of [.35,1])box(fence,(x1+x2)/2,y,(z1+z2)/2,dx?len:.06,.06,dz?len:.06,'bamboo');
    box(partition,(x1+x2)/2,1.15,(z1+z2)/2,dx?len:.23,2.3,dz?len:.23);
    box(partition,(x1+x2)/2,2.35,(z1+z2)/2,dx?len:.36,.15,dz?len:.36,'tile');
  }
  instances(fence,new T.BoxGeometry(1,1,1),'bamboo',ft);consolidate(fence);consolidate(partition);
  const gates=group(partition);for(const [x,z,rot] of [[3.6,-2,0],[1,-4,Math.PI/2]]){const g=group(gates);g.position.set(x,0,z);g.rotation.y=rot;for(const s of [-1,1])box(g,s*.44,1.15,0,.08,2.3,.3,'wood');box(g,0,2.25,0,1,.12,.3,'wood');const leaf=box(g,-.23,1,0,.43,2,.06,'wood');leaf.rotation.y=-.9;consolidate(g);}
  // Perimeter and simplified family homes outside the courtyard.
  for(const x of [-14,14])box(fixed,x,1.2,-2.5,.28,2.4,31);
  for(const z of [-18,13])box(fixed,0,1.2,z,28,2.4,.28);
  for(const [x,z] of [[-10,-6],[10,-9],[-10,6],[10,5]]){box(fixed,x,1.35,z,3.3,2.7,4);roof(fixed,x,z,3.9,4.8,2.7,1);}
  const well=group(scene);well.position.set(...LAYOUT.well);mesh(new T.CylinderGeometry(.6,.6,.5,12,1,true),'#c9c3ae',well,[0,.25,0]);cylinder(well,0,.07,0,.53,.53,.04,'ridge');mesh(new T.TorusGeometry(.6,.095,4,12),'#ddd3b9',well,[0,.5,0]).rotation.x=Math.PI/2;consolidate(well);combineColors(well);
  consolidate(chamberWalls);consolidate(woodwork);combineColors(woodwork);consolidate(fixed,true,true);combineInstances(fixed);combineColors(fixed);
  return {well,brokenRailing,wallFaces,fixed,xuanWalls,chamberWalls,railing,oldFront,windows,shutters,newLattice,paperHoles,paper,doorPivot,xr,zr,broken,desk,hu,lamp,lampLight,roomLight,books,courtWalls,ruins,fence,partition};
}
