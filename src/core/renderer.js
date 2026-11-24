import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { stageRect } from './stage.js';
import { Quality } from './quality.js';
import { ease, reducedMotion } from './tween.js';
export function createRenderer(container,light,onQuality,preference) {
  const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.shadowMap.type=T.PCFShadowMap;renderer.shadowMap.autoUpdate=false;renderer.outputColorSpace=T.SRGBColorSpace;
  container.append(renderer.domElement);
  const camera=new T.PerspectiveCamera(42,1,.1,400);camera.position.set(22,17,26);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,-1);controls.enableDamping=false;
  controls.minDistance=1.5;controls.maxDistance=135;controls.maxPolarAngle=Math.PI*.48;controls.minPolarAngle=.08;
  let dirty=true,flight=null,dragging=false,orbit=false,last=0,elapsed=0,mode='cover',warming=false;
  const start=new T.Vector3(),end=new T.Vector3(),fromTarget=new T.Vector3(),toTarget=new T.Vector3();
  let layoutDirty=true,offsetTime=.3,offsetX=0,offsetY=0,fromX=0,fromY=0,toX=0,toY=0,stage=null;
  const debug=new URLSearchParams(location.search).has('debug'),frame=document.createElement('div');frame.id='stage-debug';frame.hidden=!debug;document.body.append(frame);
  const quality=new Quality(renderer,light,adjusted=>{dirty=true;resize();onQuality?.(adjusted);},preference);
  function resize(){const w=Math.max(1,container.clientWidth||innerWidth),h=Math.max(1,container.clientHeight||innerHeight);camera.aspect=w/h;renderer.setSize(w,h,false);camera.updateProjectionMatrix();layoutDirty=true;dirty=true;renderer.shadowMap.needsUpdate=true;}
  const layoutObserver=new ResizeObserver(()=>{layoutDirty=true;dirty=true;});
  for(const el of document.querySelectorAll('#reading,#text-panel,#toolbar,.masthead,#explore-bar'))layoutObserver.observe(el);
  const mutationObserver=new MutationObserver(()=>{layoutDirty=true;dirty=true;});mutationObserver.observe(document.body,{attributes:true,attributeFilter:['class','data-mode']});
  for(const el of document.querySelectorAll('#reading,#text-panel,#toolbar,#explore-bar'))mutationObserver.observe(el,{attributes:true,attributeFilter:['hidden']});
  addEventListener('resize',resize);
  const observer=new ResizeObserver(resize);observer.observe(container);
  controls.addEventListener('change',()=>{dirty=true;});
  function limits(free){controls.minAzimuthAngle=-Infinity;controls.maxAzimuthAngle=Infinity;controls.minPolarAngle=.08;controls.maxPolarAngle=Math.PI*.48;controls.minDistance=1.5;controls.maxDistance=135;
    if(!free&&mode==='guide'){const dx=camera.position.x-controls.target.x,dy=camera.position.y-controls.target.y,dz=camera.position.z-controls.target.z,d=Math.hypot(dx,dy,dz),a=Math.atan2(dx,dz),p=Math.acos(dy/d);controls.minAzimuthAngle=a-.5;controls.maxAzimuthAngle=a+.5;controls.minPolarAngle=Math.max(.08,p-.3);controls.maxPolarAngle=Math.min(Math.PI*.48,p+.3);controls.minDistance=Math.max(1.5,d*.65);controls.maxDistance=Math.max(4,d*1.4);}
  }
  controls.addEventListener('start',()=>{dragging=true;flight=null;orbit=false;limits(false);});controls.addEventListener('end',()=>dragging=false);
  function fly(spec,instant=false){limits(true);start.copy(camera.position);fromTarget.copy(controls.target);end.fromArray(spec.pos);toTarget.fromArray(spec.target);flight={time:0,duration:instant?0:reducedMotion()?.2:spec.dur??1.8};orbit=!!spec.orbit;dirty=true;}
  let update=()=>({active:false,shadow:false,labels:false}),afterRender=()=>{};
  renderer.setAnimationLoop(now=>{
    if(document.hidden||warming||!api.scene){last=0;return;}
    const dt=last?Math.min((now-last)/1000,.1):1/60;last=now;elapsed+=dt;
    let moved=false;
    if(layoutDirty){const r=stageRect(container),w=container.clientWidth,h=container.clientHeight;fromX=offsetX;fromY=offsetY;toX=w/2-(r.left+r.right)/2;toY=h/2-(r.top+r.bottom)/2;offsetTime=0;stage=r;layoutDirty=false;frame.style.cssText=`left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;document.documentElement.style.setProperty('--stage-center-x',`${(r.left+r.right)/2}px`);document.documentElement.style.setProperty('--stage-top',`${r.top}px`);}
    if(offsetTime<.3){offsetTime=Math.min(.3,offsetTime+dt);const q=ease(offsetTime/.3);offsetX=T.MathUtils.lerp(fromX,toX,q);offsetY=T.MathUtils.lerp(fromY,toY,q);camera.setViewOffset(container.clientWidth,container.clientHeight,offsetX,offsetY,container.clientWidth,container.clientHeight);moved=true;}
    if(flight){flight.time+=dt;const t=flight.duration?Math.min(1,flight.time/flight.duration):1;camera.position.lerpVectors(start,end,ease(t));controls.target.lerpVectors(fromTarget,toTarget,ease(t));controls.update();moved=true;if(t===1){flight=null;limits(false);}}
    else if(orbit&&!reducedMotion()){const x=camera.position.x-controls.target.x,z=camera.position.z-controls.target.z,a=dt*.035;camera.position.x=controls.target.x+x*Math.cos(a)+z*Math.sin(a);camera.position.z=controls.target.z+z*Math.cos(a)-x*Math.sin(a);controls.update();moved=true;}
    const result=update(dt,elapsed,moved||dirty)||{};
    const active=moved||dragging||result.active;
    if(dirty||active){if(result.shadow)renderer.shadowMap.needsUpdate=true;renderer.render(api.scene,camera);afterRender(moved||dirty||result.labels,dt);dirty=false;quality.sample(dt,active);}
    else quality.sample(dt,false);
  });
  document.addEventListener('visibilitychange',()=>{last=0;if(!document.hidden)dirty=true;});
  function getCamera(){return {pos:camera.position.toArray().map(n=>+n.toFixed(2)),target:controls.target.toArray().map(n=>+n.toFixed(2))};}
  function setCamera(spec){flight=null;orbit=false;limits(true);camera.position.fromArray(spec.pos);controls.target.fromArray(spec.target);controls.update();dirty=true;}
  async function precompile(){
    warming=true;const visibility=[],materials=new Map();
    api.scene.traverse(o=>{visibility.push([o,o.visible]);o.visible=true;for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])if(!materials.has(m))materials.set(m,m.transparent);});
    const compile=()=>renderer.compileAsync?renderer.compileAsync(api.scene,camera):renderer.compile(api.scene,camera);
    try{await compile();for(const [m] of materials){m.transparent=true;m.needsUpdate=true;}await compile();}
    finally{for(const [o,v] of visibility)o.visible=v;for(const [m,v] of materials){m.transparent=v;m.needsUpdate=true;}warming=false;quality.suspend();dirty=true;last=0;}
  }
  if(debug)document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='c'&&!e.ctrlKey&&!e.metaKey&&!e.target.closest('input,select,textarea')){const value=getCamera();console.log(value);navigator.clipboard?.writeText(JSON.stringify(value)).catch(()=>{});}});
  const api={getCamera,setCamera,get stage(){return stage;},renderer,camera,controls,quality,scene:null,fly,setMode(value){mode=value;limits(true);},invalidate(shadow=false){dirty=true;if(shadow)renderer.shadowMap.needsUpdate=true;},setOrbit(v){orbit=v;dirty=true;},setCallbacks(a,b){update=a;afterRender=b;},dispose(){observer.disconnect();layoutObserver.disconnect();mutationObserver.disconnect();removeEventListener('resize',resize);frame.remove();controls.dispose();renderer.dispose();},get elapsed(){return elapsed;}};
  api.precompile=precompile;resize();return api;
}
