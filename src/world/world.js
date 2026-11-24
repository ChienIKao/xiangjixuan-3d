import * as T from 'three';
import { buildArchitecture } from './build/architecture.js';
import { buildPlants } from './build/plants.js';
import { createSky } from './sky.js';
import { createPeople } from './people.js';
import { createAnimals } from './animals.js';
import { createEffects } from './effects/index.js';
import { opacity } from './palette.js';
import { clamp,lerp,ease } from '../core/tween.js';
export function createWorld(){
  const scene=new T.Scene(),sky=createSky(scene),a=buildArchitecture(scene),p=buildPlants(scene),people=createPeople(scene),animals=createAnimals(scene),effects=createEffects(scene);
  opacity(a.well,1);
  let state=null,age=0,from={cutaway:0,wall:0,fence:0,partition:0,plants:0,decay:0,glow:0,loquat:0,door:0},values={...from},doorFrom=0,delays={};
  function set(next,instant=false,delay={}){
    state=next;age=instant?20:0;from={...values};doorFrom=a.doorPivot.rotation.y;delays=delay;
    sky.set(next.sky,instant);people.set(next);animals.set(next);effects.set(next);
    a.well.traverse(o=>{if(o.material){o.material.depthTest=!next.well;o.material.depthWrite=!next.well;o.renderOrder=next.well?5:0;}});
    a.oldFront.visible=!next.windows;a.windows.visible=next.windows;a.shutters.visible=next.windows&&next.windowsClosed;a.newLattice.visible=next.windows&&next.rebuilt;
    a.books.visible=next.books;a.hu.visible=next.hu==='desk';a.broken.visible=next.roof==='broken';
    a.xr.damagePatches.visible=next.roof!=='broken';
    a.xr.patches.visible=next.roof==='repaired';p.landscape.visible=true;
    if(next.timeLapse==='grow'&&!instant){from.loquat=.12;values.loquat=.12;}
    opacity(p.landscape,next.vast?.72:.2);
  }
  const decayedMaterials=[];
  for(const g of [...a.wallFaces.map(f=>f.group),a.railing]){opacity(g,1);g.traverse(o=>{if(o.isMesh)decayedMaterials.push({material:o.material,color:o.material.color.clone()});});}
  a.windows.traverse(o=>{if(o.isMesh&&o.material.userData.windowPaper)a.paper=o.material;});
  const grey=new T.Color('#8a7350'),roofPos=new T.Vector3(0,3.12,5.85),chamberPos=new T.Vector3(-4.95,3.15,6.2),patchTransform=new T.Object3D();
  function update(dt,t,events={}){
    if(!state)return {active:false};age+=dt;const q=ease(clamp(age/1.5));
    const target={cutaway:+state.cutaway,wall:+(state.courtWall==='full'),fence:+(state.partition===1),partition:+(state.partition===2),plants:+state.plants,decay:state.decay,glow:state.roomGlow,loquat:state.loquat,door:state.door==='open'?1:0};
    for(const k of Object.keys(values)){const progress=k==='loquat'&&state.timeLapse==='grow'?ease(clamp(age/7)):q;values[k]=lerp(from[k],target[k],progress);}
    let faceMoving=false;
    for(const face of a.wallFaces){const direction=new T.Vector3().subVectors(events.camera?.position||new T.Vector3(0,8,-10),face.center).normalize();const goal=state.cutaway&&face.normal.dot(direction)>.2?.12:1;face.alpha=face.alpha+Math.sign(goal-face.alpha)*Math.min(Math.abs(goal-face.alpha),dt/.3);faceMoving ||= Math.abs(face.alpha-goal)>.001;opacity(face.group,face.alpha);}
    const lift=values.cutaway*3;
    a.xr.group.position.copy(roofPos);a.xr.group.position.y+=lift;a.zr.group.position.copy(chamberPos);a.zr.group.position.y+=lift;
    opacity(a.xr.group,1-values.cutaway);opacity(a.zr.group,1-values.cutaway);
    a.xr.patches.visible=state.roof==='repaired';a.broken.visible=state.roof==='broken';
    a.xr.damagePatches.visible=state.roof!=='broken';
    if(state.roof==='repaired'&&age<2){a.xr.missing.forEach((p,i)=>{patchTransform.position.set(...p.slice(0,3));patchTransform.rotation.set(p[6]||0,0,0);patchTransform.scale.set(p[3],p[4],p[5]);patchTransform.scale.multiplyScalar(clamp((age-i*.07)/.3));patchTransform.updateMatrix();a.xr.patches.setMatrixAt(i,patchTransform.matrix);});a.xr.patches.instanceMatrix.needsUpdate=true;}
    for(const wall of a.courtWalls){wall.visible=values.wall>.005;wall.scale.y=Math.max(.001,values.wall);}
    opacity(a.ruins,1-values.wall);a.fence.visible=values.fence>.005;a.fence.scale.y=Math.max(.001,values.fence);a.partition.visible=values.partition>.005;a.partition.scale.y=Math.max(.001,values.partition);
    p.plants.forEach((g,i)=>{const scale=lerp(from.plants,target.plants,ease(clamp((age-i*.15)/1.2)));g.visible=scale>.001;g.scale.setScalar(Math.max(.001,scale));g.rotation.z=state.wind?Math.sin(t*1.25+i)*.016:0;});
    p.loquat.visible=values.loquat>.005;p.loquat.scale.setScalar(Math.max(.001,values.loquat));
    p.loquat.userData.grow(values.loquat);
    p.weeds.visible=!state.plants||values.decay>.01;p.weeds.scale.y=.3+values.decay*2;
    for(const entry of decayedMaterials)entry.material.color.copy(entry.color).lerp(grey,values.decay*.85);
    a.railing.visible=values.decay<.5;a.brokenRailing.visible=values.decay>=.5;a.xr.ridge.position.y=-values.decay*.35;a.xr.ridge.updateMatrix();
    if(state.fire){const pulse=age>=9.6?.15:age%2.4>=2?Math.sin((age%2.4-2)/.4*Math.PI)*.32:0;for(const entry of decayedMaterials){if(entry.material.emissive){entry.material.emissive.set('#e6ad37');entry.material.emissiveIntensity=pulse;}}}else for(const entry of decayedMaterials)if(entry.material.emissive)entry.material.emissiveIntensity=0;
    a.railing.rotation.z=values.decay*.045;a.paper.emissiveIntensity=values.glow*(state.windowsClosed?.06:.55)*(1-values.decay*.95);a.paper.color.set(state.windowsClosed?'#6b6559':'#f3ead2').lerp(grey,values.decay*.7);
    a.paperHoles.visible=state.windows&&!state.windowsClosed&&values.decay>.01;
    a.xr.group.traverse(o=>{if(o.isInstancedMesh&&o.material.color)o.material.color.set(state.rebuilt?'#626c70':'#4a4f55');});
    const delay=delays.door||0,doorT=ease(clamp((age-delay)/.9));a.doorPivot.rotation.y=lerp(doorFrom,target.door*-1.4,doorT);
    if(state.door==='knock'&&age>.8&&age<1.8)a.doorPivot.rotation.y=Math.sin((age-.8)*25)*.035;
    if(state.desk==='shuffle'){a.desk.position.x=Math.sin(t*.7)*.6;a.desk.position.z=5+Math.sin(t*.45)*.4;}else{a.desk.position.x=0;a.desk.position.z=5;}
    const skyActive=sky.update(dt,state.vast);a.roomLight.intensity=values.glow*(state.sky==='moon'?1.6:3.2);a.lampLight.intensity=sky.current.lamp*2;
    const human=people.update(dt,t,pos=>{effects.step(pos);if(state.footsteps)events.step?.();});
    const animalActive=animals.update(t,pos=>events.bark?.(pos));const effectActive=effects.update(dt,t);if(state.sun==='blocked')sky.sun.position.copy(effects.sunPosition);
    const transition=faceMoving||age<2.5||skyActive||(state.timeLapse==='grow'&&age<7);
    return {active:transition||human.active||animalActive||effectActive||state.wind||state.desk==='shuffle'||age<delay+.9,shadow:transition||faceMoving||human.moving||(state.wind&&state.sky==='moon')||state.sun==='blocked'||state.door==='knock'&&age<2,labels:human.moving||human.active||state.dogs};
  }
  return {scene,sky,people,animals,effects,set,update,get state(){return state;},get age(){return age;},get fade(){return state?state.fade:0;}};
}
