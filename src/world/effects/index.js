import * as T from 'three';
import { glowSprite } from './glow.js';
import { mesh,material,consolidate,combineColors } from '../palette.js';
import { PLACES } from '../../content/script.js';
function line(parent,points,color='#d6af65',dashed=false){const g=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p)));const m=new T.Line(g,dashed?new T.LineDashedMaterial({color,dashSize:.25,gapSize:.17,transparent:true,opacity:.8}):new T.LineBasicMaterial({color,transparent:true,opacity:.8}));m.computeLineDistances();parent.add(m);return m;}
function label(parent,text,pos){const anchor=new T.Object3D();anchor.position.set(...pos);anchor.userData.label=text;parent.add(anchor);return anchor;}
function lightPath(parent,points){const group=new T.Group();parent.add(group);const curve=new T.CurvePath();for(let i=1;i<points.length;i++)curve.add(new T.LineCurve3(new T.Vector3(...points[i-1]),new T.Vector3(...points[i])));const ribbon=new T.Mesh(new T.TubeGeometry(curve,24,.075,4,false),new T.MeshBasicMaterial({color:'#ffe2a0',transparent:true,opacity:.24,depthWrite:false,blending:T.AdditiveBlending}));group.add(ribbon);const dots=new T.InstancedMesh(new T.IcosahedronGeometry(.075,0),new T.MeshBasicMaterial({color:'#fff0b0',blending:T.AdditiveBlending}),16);dots.frustumCulled=false;group.add(dots);const transform=new T.Object3D();return {update(t,newPoints){if(newPoints&&(!curve.curves[0].v1.equals(new T.Vector3(...newPoints[0]))||!curve.curves[0].v2.equals(new T.Vector3(...newPoints[1])))){curve.curves[0].v1.fromArray(newPoints[0]);curve.curves[0].v2.fromArray(newPoints[1]);curve.updateArcLengths();ribbon.geometry.dispose();ribbon.geometry=new T.TubeGeometry(curve,12,.075,4,false);}for(let i=0;i<16;i++){transform.position.copy(curve.getPoint((i/16+t*.25)%1));transform.updateMatrix();dots.setMatrixAt(i,transform.matrix);}dots.instanceMatrix.needsUpdate=true;}};}
export function createEffects(scene){
  const groups={};for(const key of ['compass','measure','blocked','reflect','focus','well','rain','fire','footsteps']){groups[key]=new T.Group();scene.add(groups[key]);}
  for(const [text,p] of [['北',[0,.08,1.7]],['南',[0,.08,9]],['東',[3,.08,6]],['西',[-3,.08,6]]])label(groups.compass,text,p,.45);
  label(groups.compass,'門窗朝北',[0,.2,2.5],.8);
  for(const z of [4.5,7.5])line(groups.measure,[[-1.55,.54,z],[1.55,.54,z]],'#a87c3e');line(groups.measure,[[-1.55,.54,4.5],[-1.55,.54,7.5]],'#a87c3e');label(groups.measure,'一丈 ≈ 3.1 公尺',[0,.65,6.1],.85);
  mesh(new T.ConeGeometry(.16,1.4,6),'wood',groups.measure,[1.2,1.2,6.8]);
  const sun=mesh(new T.SphereGeometry(.9,12,8),new T.MeshBasicMaterial({color:'#ffdb87'}),groups.blocked,[0,10,15]);
  sun.add(glowSprite('#ffdc87',4));const blockedRay=lightPath(groups.blocked,[[0,10,15],[0,3.5,7.8]]);label(groups.blocked,'北向：照不到陽光',[0,4.9,5],1);
  const reflected=[lightPath(groups.reflect,[[-14,18,16],[4.85,1.7,.5]]),...[-1.125,-.375,.375,1.125].map(x=>lightPath(groups.reflect,[[4.85,1.7,.5],[x,1.9,4.35]]))];const reflectSun=sun.clone();reflectSun.position.set(-14,18,16);groups.reflect.add(reflectSun);label(groups.reflect,'日影反照',[3,3.3,1.2],.8);

  const focus=mesh(new T.RingGeometry(.6,.72,48),new T.MeshBasicMaterial({color:'#e5be72',transparent:true,opacity:.65,side:T.DoubleSide,depthWrite:false}),groups.focus);focus.rotation.x=-Math.PI/2;focus.position.y=.08;
  const wellRing=focus.clone();groups.well.add(wellRing);wellRing.position.set(-3.6,.55,-4.4);label(groups.well,'埳井之蛙',[-3.6,1.5,-4.4],.8);
  wellRing.geometry=new T.RingGeometry(.74,.94,48);wellRing.material=new T.MeshBasicMaterial({color:'#ffd56b',transparent:true,opacity:.9,side:T.DoubleSide,depthWrite:false,depthTest:false});wellRing.renderOrder=6;
  const frog=new T.Group();groups.well.add(frog);frog.position.set(-3.6,.61,-3.82);
  const frogBody=mesh(new T.IcosahedronGeometry(1,0),'#427d38',frog);frogBody.scale.set(.065,.045,.075);
  for(const x of [-.045,.045]){const leg=mesh(new T.IcosahedronGeometry(1,0),'#558d40',frog,[x,-.02,.03]);leg.scale.set(.035,.022,.048);mesh(new T.IcosahedronGeometry(.018,0),'#a9ba65',frog,[x,.04,-.045]);mesh(new T.IcosahedronGeometry(.008,0),'#1d2e18',frog,[x,.045,-.06]);}consolidate(frog,false);combineColors(frog);
  const throat=mesh(new T.IcosahedronGeometry(1,1),'#cfcc7a',frog,[0,.005,-.061]);throat.scale.set(.031,.022,.018);frog.traverse(o=>{o.castShadow=false;if(o.material){o.material=o.material.clone();o.material.depthTest=false;o.material.depthWrite=false;o.renderOrder=7;}});
  // Falling rain is displaced in the vertex shader; geometry never changes on the CPU.
  const rp=new Float32Array(360*6),seeds=new Float32Array(720);for(let i=0;i<360;i++){const x=Math.sin(i*127.1)*3,z=3.5+(i*53%100)/100*5;for(let k=0;k<2;k++){rp[i*6+k*3]=x;rp[i*6+k*3+1]=k*.24;rp[i*6+k*3+2]=z;seeds[i*2+k]=(i*37%100)/100;}}
  const rainMat=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0}},vertexShader:'attribute float seed;uniform float time;void main(){vec3 p=position;p.y+=mod(seed*6.-time*3.,6.);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',fragmentShader:'void main(){gl_FragColor=vec4(.66,.77,.79,.5);}'});
  groups.rain.add(new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(rp,3)).setAttribute('seed',new T.BufferAttribute(seeds,1)),rainMat));
  const ripples=[];for(let i=0;i<8;i++){const m=mesh(new T.RingGeometry(.08,.1,20),new T.MeshBasicMaterial({color:'#9cafae',transparent:true,opacity:.5,side:T.DoubleSide,depthWrite:false}),groups.rain,[Math.sin(i*4)*1.2,.51,4.8+(i%3)*.8]);m.rotation.x=-Math.PI/2;ripples.push(m);}
  const fp=new Float32Array(90*3),fs=new Float32Array(90);for(let i=0;i<90;i++){fp[i*3]=Math.sin(i*17)*.65;fp[i*3+2]=Math.cos(i*23)*.6;fs[i]=i/90;}
  const fireMat=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{time:{value:0},strength:{value:1}},vertexShader:'attribute float seed;uniform float time;varying float life;void main(){life=fract(seed+time*.6);vec3 p=position;p.y=life*3.;p.x*=1.-life*.6;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=min(65.,75./max(1.,-mv.z))*(1.-life)*6.;}',fragmentShader:'varying float life;uniform float strength;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;gl_FragColor=vec4(1.,.25+life*.4,.03,(1.-r)*(1.-life)*strength);}'});
  groups.fire.add(new T.Points(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(fp,3)).setAttribute('seed',new T.BufferAttribute(fs,1)),fireMat));
  const flames=new T.InstancedMesh(new T.ConeGeometry(1,1,5),new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false}),7);flames.frustumCulled=false;groups.fire.add(flames);const flameTransform=new T.Object3D();for(let i=0;i<7;i++)flames.setColorAt(i,new T.Color(i%2?'#ff6b16':'#ffcf42'));
  groups.fire.traverse(o=>{o.frustumCulled=false;});
  const fireLight=new T.PointLight('#ff8035',0,22,1.5);scene.add(fireLight);
  const halo=mesh(new T.RingGeometry(2.0,2.65,48),new T.MeshBasicMaterial({color:'#ffe1a4',transparent:true,opacity:.2,side:T.DoubleSide,depthWrite:false}),scene,[0,.5,5.8]);halo.rotation.x=-Math.PI/2;const protection=new T.PointLight('#ffda77',0,10,1);protection.position.set(0,2,5.8);scene.add(protection);
  const smoke=new T.InstancedMesh(new T.IcosahedronGeometry(.35,0),new T.MeshBasicMaterial({color:'#71645b',transparent:true,opacity:.28,depthWrite:false}),8);groups.fire.add(smoke);const smokeTransform=new T.Object3D();
  const birth=new T.InstancedBufferAttribute(new Float32Array(16).fill(-100),1),footGeometry=new T.CircleGeometry(.055,8).rotateX(-Math.PI/2).scale(1,1,1.8);footGeometry.setAttribute('birth',birth);
  const footMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{time:{value:0}},vertexShader:'attribute float birth;uniform float time;varying float alpha;void main(){alpha=max(0.,1.-(time-birth)/2.)*.5;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}',fragmentShader:'varying float alpha;void main(){gl_FragColor=vec4(.25,.22,.18,alpha);}'});
  const footprints=new T.InstancedMesh(footGeometry,footMaterial,16),footTransform=new T.Object3D();footprints.frustumCulled=false;groups.footsteps.add(footprints);
  const waves=[];for(let i=0;i<3;i++){const m=focus.clone();m.material=focus.material.clone();groups.footsteps.add(m);waves.push(m);}label(groups.footsteps,'足音',[0,1.4,3.8],.6);
  for(const g of Object.values(groups))g.traverse(o=>{o.castShadow=false;});halo.castShadow=false;
  let state={},age=0,foot=0,focusLabel=null,currentTime=0;
  function set(s){state=s;age=0;groups.compass.visible=s.compass;groups.measure.visible=s.measure;groups.blocked.visible=s.sun==='blocked';groups.reflect.visible=s.sun==='reflect';groups.rain.visible=s.rain;groups.fire.visible=s.fire;groups.footsteps.visible=s.footsteps;groups.well.visible=s.well;groups.focus.visible=!!s.focus;halo.visible=s.fire;
    const p=PLACES.find(p=>p.id===s.focus);if(p){focus.position.set(p.pos[0],.08,p.pos[2]);if(focusLabel){groups.focus.remove(focusLabel);focusLabel.userData.element?.remove();}focusLabel=label(groups.focus,p.name,[p.pos[0],1,p.pos[2]],.7);}
    birth.array.fill(-100);birth.needsUpdate=true;
  }
  function step(pos){if(!state.footsteps)return;const i=foot++%16;footTransform.position.set(pos.x,.5,pos.z+(foot%2?.1:-.1));footTransform.updateMatrix();footprints.setMatrixAt(i,footTransform.matrix);birth.setX(i,currentTime);birth.needsUpdate=true;footprints.instanceMatrix.needsUpdate=true;}
  function update(dt,t){age+=dt;currentTime=t;rainMat.uniforms.time.value=t;fireMat.uniforms.time.value=t;footMaterial.uniforms.time.value=t;
    if(state.sun==='blocked'){const a=clamp(age/6)*Math.PI;sun.position.set(6*Math.cos(a),4.8+Math.sin(a)*.6,8.3);blockedRay.update(t,[sun.position.toArray(),[0,3.5,7.8]]);}
    if(state.sun==='reflect')reflected.forEach(path=>path.update(t));
    if(state.rain)ripples.forEach((r,i)=>{const q=(t*.7+i*.12)%1;r.scale.setScalar(q*3+.1);r.material.opacity=(1-q)*.45;});
    const pulse=1+Math.sin(t*2)*.12;focus.scale.setScalar(pulse);wellRing.scale.setScalar(pulse);
    wellRing.material.opacity=.7+Math.sin(t*2)*.22;if(state.well){const puff=Math.max(0,Math.sin(t*1.3))**12;throat.scale.set(.031+puff*.012,.022+puff*.014,.018+puff*.013);}
    fireLight.intensity=0;protection.intensity=0;
    if(state.fire){const n=Math.min(3,Math.floor(age/2.4)),p=[[4,2.2,7],[-4,2.2,6],[4,0,-1],[0,2.2,10]][n],phase=age%2.4,strength=age<9.6&&phase<2?Math.sin(phase/2*Math.PI):0;groups.fire.position.set(...p);groups.fire.visible=age<9.6&&phase<2;fireMat.uniforms.strength.value=strength;fireLight.position.set(p[0],p[1]+1.3,p[2]);fireLight.intensity=strength*(65+Math.sin(t*23)*12);const grace=age>=9.6?.75:phase>=2?Math.sin((phase-2)/.4*Math.PI):0;halo.material.opacity=grace*.9;halo.scale.setScalar(1+grace*.15);protection.intensity=grace*5;
      for(let i=0;i<7;i++){const height=(2.1+(i%3)*.35)*(1+Math.sin(t*13+i*3)*.12);flameTransform.position.set(Math.sin(i*2.4)*.6,height/2,Math.cos(i*2.4)*.5);flameTransform.rotation.z=Math.sin(t*9+i)*.12;flameTransform.scale.set(.4+(i%2)*.15,height,.38);flameTransform.updateMatrix();flames.setMatrixAt(i,flameTransform.matrix);}flames.instanceMatrix.needsUpdate=true;flames.material.opacity=strength*.85;
      for(let i=0;i<8;i++){const q=(t*.23+i/8)%1;smokeTransform.position.set(Math.sin(i*4+t*.3)*.6,1.7+q*2.5,Math.cos(i*3)*.4);smokeTransform.scale.setScalar(.6+q*1.4);smokeTransform.updateMatrix();smoke.setMatrixAt(i,smokeTransform.matrix);}smoke.instanceMatrix.needsUpdate=true;}
    if(state.footsteps)waves.forEach((w,i)=>{const q=(t*.9+i/3)%1;w.position.set(0,.51,3.9);w.scale.setScalar(.2+q*2);w.material.opacity=(1-q)*.2;});
    return state.rain||state.fire||state.sun!=='none'||state.footsteps||state.focus||state.well;
  }
  return {get sunPosition(){return sun.position;},labels(){const result=[];for(const g of Object.values(groups))g.traverse(o=>{if(o.userData.label)result.push(o);});return result;},set,update,step,get age(){return age;}};
}
function clamp(v){return Math.max(0,Math.min(1,v));}
