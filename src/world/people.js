import * as T from 'three';
import { mesh,box,cylinder,material,consolidate,combineColors,opacity } from './palette.js';
import { GUEST_PATH } from './layout.js';
import { clamp } from '../core/tween.js';
const colors={yu:'#4a6274',nurse:'#6b5444',mother:'#f0dfbd',grandma:'#4b3f52',wife:'#b0756e',guest:'#7e7964',walkerA:'#757d68',walkerB:'#847566'};
export const POSES=['stand','sit','bow','walk','point','knock','proud','plant'];
// Figures bend at the waist: a lower robe (standing) or seated legs, plus an upper-body group pivoting at HIP.
// Local forward is -Z, so a negative rotation.x leans the upper body forward.
const HIP=.9,SEAT=.61; // model units (root is scaled ~0.94); SEAT puts the hips on the chair seat (top at 0.57m above the floor)
function person(scene,id) {
  const root=new T.Group(),body=new T.Group();root.add(body);scene.add(root);
  const robe=material(colors[id]||colors.guest),skin=material('#d5b997');
  const skirt=new T.Group();body.add(skirt);
  mesh(new T.LatheGeometry([new T.Vector2(.32,0),new T.Vector2(.30,.15),new T.Vector2(.19,.85),new T.Vector2(0,.86)],8),robe,skirt,[0,.05,0]);
  const seated=new T.Group();body.add(seated);
  const thigh=mesh(new T.CapsuleGeometry(.13,.34,2,8),robe,seated,[0,SEAT+.06,-.2]);thigh.rotation.x=Math.PI/2;
  mesh(new T.LatheGeometry([new T.Vector2(.2,0),new T.Vector2(.17,.2),new T.Vector2(.13,SEAT),new T.Vector2(0,SEAT+.01)],8),robe,seated,[0,0,-.42]);
  const upper=new T.Group();upper.position.y=HIP;body.add(upper);
  mesh(new T.LatheGeometry([new T.Vector2(.19,0),new T.Vector2(.2,.28),new T.Vector2(.12,.35)],8),robe,upper);
  mesh(new T.IcosahedronGeometry(.17,1),skin,upper,[0,.53,0]);mesh(new T.IcosahedronGeometry(.175,0),'ridge',upper,[0,.61,.025]);mesh(new T.IcosahedronGeometry(.08,0),'ridge',upper,[0,.78,.02]);
  const arm=new T.Group();arm.position.set(-.2,.2,0);upper.add(arm);cylinder(arm,0,-.23,0,.08,.1,.46,robe);
  const other=cylinder(upper,.23,0,0,.08,.1,.44,robe);other.rotation.z=.15;
  const baby=new T.Group();upper.add(baby);const swaddle=mesh(new T.CapsuleGeometry(.12,.3,2,6),'paper',baby,[0,.05,-.22]);swaddle.rotation.z=1.1;mesh(new T.IcosahedronGeometry(.085,0),skin,baby,[-.18,.12,-.22]);consolidate(baby,false);combineColors(baby);
  const hu=box(arm,0,-.4,-.12,.08,.43,.025,'paper');
  if(id==='grandma')cylinder(skirt,-.35,.5,-.15,.025,.035,1.1,'wood');
  const ring=mesh(new T.RingGeometry(.3,.55,32),new T.MeshBasicMaterial({color:'#ffdfad',transparent:true,opacity:.25,side:T.DoubleSide,depthWrite:false}),root,[0,.025,0]);ring.rotation.x=-Math.PI/2;
  for(const g of [skirt,seated,upper]){consolidate(g,false);combineColors(g);}
  // consolidate() freezes child matrices; these groups are posed at runtime.
  for(const g of [skirt,seated,upper,arm,baby])g.matrixAutoUpdate=true;
  seated.visible=false;body.traverse(o=>{if(o.isMesh)o.castShadow=true;});root.scale.setScalar(id==='nurse'?1.45/1.76:1.65/1.76);
  const parts=[];body.traverse(o=>{if(o.isMesh)parts.push({mesh:o,normal:o.material,memory:new T.MeshBasicMaterial({color:'#f2c879',transparent:true,opacity:.7,depthWrite:false})});});
  const aura=body.clone(true),auraMaterial=new T.MeshBasicMaterial({color:'#ffe5a3',transparent:true,opacity:.12,side:T.BackSide,depthWrite:false}),originalNodes=[],auraNodes=[];body.traverse(o=>originalNodes.push(o));aura.traverse(o=>{auraNodes.push(o);if(o.isMesh){o.material=auraMaterial;o.castShadow=false;}});const auraLinks=originalNodes.slice(1).map((o,i)=>[o,auraNodes[i+1]]);aura.scale.setScalar(1.065);aura.position.y=-.025;body.add(aura);aura.visible=false;
  return {root,body,skirt,seated,upper,arm,baby,hu,ring,ringMaterial:ring.material,aura,auraMaterial,auraLinks,parts,alpha:0,from:new T.Vector3(),to:new T.Vector3(),spec:null,leaving:false,time:0,memory:false};
}
export function createPeople(scene) {
  const pool=new Map();let lastStep=-1;
  function set(state) {
    const specs={...state.people};
    if(state.guest)specs.guest={pos:GUEST_PATH[0],path:GUEST_PATH,pose:'walk',loop:true};
    if(state.walkers)for(const [i,id] of ['walkerA','walkerB'].entries())specs[id]={pos:[i?2.4:-2.4,.45,3.9],path:i?[[2.4,.45,3.9],[-2.4,.45,3.9]]:[[-2.4,.45,3.9],[2.4,.45,3.9]],pose:'walk',pingpong:true,loop:true};
    for(const [id,p] of pool)if(!specs[id]){p.leaving=true;p.time=0;}
    for(const [id,spec] of Object.entries(specs)){
      let p=pool.get(id);if(!p){p=person(scene,id);pool.set(id,p);p.root.position.set(...spec.pos);}
      p.from.copy(p.root.position);p.to.set(...spec.pos);p.spec=spec;p.time=0;p.leaving=false;p.memory=!!spec.memory;p.root.visible=true;
      p.parts.forEach(part=>{part.mesh.material=p.memory?part.memory:part.normal;part.mesh.castShadow=!p.memory;});p.ring.material=p.ringMaterial;p.aura.traverse(o=>{if(o.isMesh)o.material=p.auraMaterial;});p.aura.visible=p.memory;delete p.root.userData.fadeMaterials;
      p.lengths=[];p.pathLength=0;if(spec.path)for(let i=1;i<spec.path.length;i++){const a=spec.path[i-1],b=spec.path[i],l=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);p.lengths.push(l);p.pathLength+=l;}
      p.baby.visible=spec.carry==='baby';p.hu.visible=spec.carry==='hu';p.ring.visible=p.memory;
      const pose=spec.pose||'stand',sit=pose==='sit',kneel=pose==='plant';
      p.skirt.visible=!sit;p.seated.visible=sit;p.skirt.scale.y=kneel?.55:1;
      p.upper.position.y=sit?SEAT:kneel?HIP*.55:HIP;
      p.upper.rotation.x=pose==='bow'?-.42:kneel?-.75:pose==='proud'?.12:id==='nurse'?-.16:0;
      p.arm.rotation.x=['point','knock'].includes(pose)?1.3:kneel?.9:spec.carry?1:0;
      if(spec.lookAt)p.root.rotation.y=Math.atan2(spec.pos[0]-spec.lookAt[0],spec.pos[2]-spec.lookAt[1]);else p.root.rotation.y=-(spec.face||0)*Math.PI/180;
    }
    lastStep=-1;
  }
  function update(dt,t,onStep){let active=false,moving=false;
    for(const [id,p] of pool){if(!p.root.visible&&p.leaving)continue;p.time+=dt;const spec=p.spec;
      p.alpha=clamp(p.alpha+(p.leaving?-dt:dt)/.6);opacity(p.root,p.alpha);p.ring.visible=p.memory&&p.root.visible;
      if(p.alpha>0&&p.alpha<1)active=true;if(p.leaving)continue;
      if(p.time<.8){p.root.position.lerpVectors(p.from,p.to,clamp(p.time/.8));active=moving=true;}
      const path=spec.path;
      if(path?.length>1){const length=p.pathLength;
        const duration=length/.85,raw=p.time/duration;let fraction=spec.loop?raw%1:Math.min(1,raw);
        if(spec.pingpong&&Math.floor(raw)%2)fraction=1-fraction;
        let distance=fraction*length;
        for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],l=p.lengths[i-1];if(distance<=l||i===path.length-1){const q=clamp(distance/l);p.root.position.set(a[0]+(b[0]-a[0])*q,a[1]+(b[1]-a[1])*q,a[2]+(b[2]-a[2])*q);p.root.rotation.y=Math.atan2(a[0]-b[0],a[2]-b[2])+(spec.pingpong&&Math.floor(raw)%2?Math.PI:0);break;}distance-=l;}
        const walking=spec.loop||raw<1;if(walking){p.body.position.y=Math.sin(p.time*10)*.035;active=moving=true;}
        if(spec.fadeOut&&raw>=.9){opacity(p.root,clamp((1-raw)/.1));}else if(spec.loop&&!spec.pingpong)opacity(p.root,Math.min(p.alpha,clamp(fraction/.06),clamp((1-fraction)/.06)));
        else if(spec.pingpong)opacity(p.root,Math.min(p.alpha,clamp(fraction/.08),clamp((1-fraction)/.08)));
        if(id==='walkerA'&&walking){const step=Math.floor(p.time*2.5);if(step!==lastStep){onStep?.(p.root.position);lastStep=step;}}
      }
      if(p.memory){p.body.position.y=Math.sin(t*1.6)*.035+.04;for(const [source,halo] of p.auraLinks){halo.visible=source.visible;halo.position.copy(source.position);halo.quaternion.copy(source.quaternion);halo.scale.copy(source.scale);halo.updateMatrix();}active=true;}
      if(spec.pose==='knock'&&p.time>.8&&p.time<1.8){p.arm.rotation.x=1.3+Math.sin(p.time*25)*.12;active=true;}
    }
    return {active,moving};
  }
  return {set,update,pool};
}
