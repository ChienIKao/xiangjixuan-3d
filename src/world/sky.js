import * as T from 'three';
import { glowSprite } from './effects/glow.js';
import { lerp,clamp } from '../core/tween.js';
export const SKY={
  dim: ['#929f9e','#dedbcf','#cacdc2',.025,.45,.18,'#c3c5b5',1.0,[0,5,18],.1],
  day: ['#b4c9c6','#eee9d8','#dddcd0',.012,.7,.28,'#fff0cb',2.3,[-15,22,18],.15],
  moon: ['#111e37','#626c7c','#3a495e',.012,.48,.2,'#fff0d5',3.8,[40,6.2,0],.9],
  warm: ['#b5aaa1','#f1d4a8','#d6c8af',.019,.55,.23,'#ffd393',1.8,[-22,12,15],1],
  grey: ['#8d9c9e','#c9ceca','#bac3be',.028,.5,.2,'#d4dfdf',1.0,[-14,20,14],.4],
  fireNight: ['#080f20','#302b32','#20232e',.024,.13,.035,'#d4d5e0',.25,[20,15,10],.7],
  spring: ['#b4cdc1','#f3eddb','#e0e2d2',.012,.8,.27,'#fff1d1',2.2,[-16,23,18],.15],
};
export function createSky(scene){
  const uniforms={top:{value:new T.Color()},bottom:{value:new T.Color()}};
  const sphere=new T.Mesh(new T.SphereGeometry(180,20,12),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms,vertexShader:'varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 v;uniform vec3 top;uniform vec3 bottom;void main(){float t=smoothstep(-.08,.65,normalize(v).y);gl_FragColor=vec4(mix(bottom,top,t),1.);}'}));scene.add(sphere);
  scene.fog=new T.FogExp2('#dedbcf',.02);
  const hemi=new T.HemisphereLight('#eff0db','#716b57',.7),ambient=new T.AmbientLight('#fff7e8',.2),sun=new T.DirectionalLight('#fff2dc',2);scene.add(hemi,ambient,sun,sun.target);
  sun.castShadow=true;sun.shadow.camera.left=-16;sun.shadow.camera.right=16;sun.shadow.camera.top=16;sun.shadow.camera.bottom=-16;sun.shadow.camera.near=.5;sun.shadow.camera.far=100;sun.shadow.normalBias=.025;sun.shadow.bias=-.00015;
  sun.target.position.set(0,1,0);
  const positions=new Float32Array(900);for(let i=0;i<300;i++){const a=i*2.399,b=.12+(i%97)/97*1.3;positions[i*3]=Math.cos(a)*120*Math.cos(b);positions[i*3+1]=Math.sin(b)*120;positions[i*3+2]=Math.sin(a)*120*Math.cos(b);}
  const stars=new T.Points(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(positions,3)),new T.PointsMaterial({color:'#e5e7ef',size:.22,transparent:true}));scene.add(stars);
  const moon=new T.Mesh(new T.SphereGeometry(1.15,16,12),new T.MeshBasicMaterial({color:'#fff2cb'}));moon.position.set(65,10.1,0);scene.add(moon);const moonGlow=glowSprite('#fff0ca',8);moon.add(moonGlow);
  const current={top:new T.Color(),bottom:new T.Color(),fog:new T.Color(),light:new T.Color(),density:.02,hemi:.5,ambient:.2,power:1,pos:new T.Vector3(),lamp:0};
  let source=null,target=null,time=2,key='';
  function snapshot(){return {...current,top:current.top.clone(),bottom:current.bottom.clone(),fog:current.fog.clone(),light:current.light.clone(),pos:current.pos.clone()};}
  function set(name,instant=false){if(name===key&&!instant)return;key=name;const p=SKY[name]||SKY.day;source=snapshot();target={top:new T.Color(p[0]),bottom:new T.Color(p[1]),fog:new T.Color(p[2]),density:p[3],hemi:p[4],ambient:p[5],light:new T.Color(p[6]),power:p[7],pos:new T.Vector3(...p[8]),lamp:p[9]};time=instant?1.5:0;if(instant)update(0,false);}
  function update(dt,vast){time=Math.min(1.5,time+dt);const t=clamp(time/1.5);
    if(target){for(const k of ['top','bottom','fog','light'])current[k].lerpColors(source[k],target[k],t);for(const k of ['density','hemi','ambient','power','lamp'])current[k]=lerp(source[k],target[k],t);current.pos.lerpVectors(source.pos,target.pos,t);}
    uniforms.top.value.copy(current.top);uniforms.bottom.value.copy(current.bottom);scene.fog.color.copy(current.fog);scene.fog.density=current.density*(vast?.28:1);
    hemi.color.copy(current.bottom);hemi.intensity=current.hemi;ambient.intensity=current.ambient;sun.color.copy(current.light);sun.intensity=current.power;sun.position.copy(current.pos);
    moon.visible=key==='moon';stars.visible=moon.visible;return time<1.5;
  }
  set('spring',true);return {sun,set,update,current};
}
