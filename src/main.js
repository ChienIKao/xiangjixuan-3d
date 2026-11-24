import './styles.css';
import { createUI,loadPreferences } from './ui/app.js';
import { createWorld } from './world/world.js';
import { createRenderer } from './core/renderer.js';
import { createDirector } from './story/director.js';
import { AudioEngine } from './audio.js';
import { BEATS } from './content/script.js';
import { STATES } from './story/state.js';
const ui=createUI(document.getElementById('app'),loadPreferences()),audio=new AudioEngine(ui.prefs.sound);
let world,view,director;
const unlock=()=>audio.unlock();document.addEventListener('pointerdown',unlock,{once:true});document.addEventListener('keydown',unlock,{once:true});
document.addEventListener('visibilitychange',()=>audio.pause(document.hidden));
// When the browser has hardware acceleration off, WebGL falls back to CPU rendering (SwiftShader etc.) and
// everything stutters. Start at the lowest quality and tell the teacher how to turn acceleration back on.
function softwareRendering(view){
  let name='';
  try{const gl=view.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');name=info?gl.getParameter(info.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);}catch{}
  if(!/swiftshader|basic render|llvmpipe|softpipe|software/i.test(name))return;
  view.quality.software=true;view.quality.set(view.quality.mode);
  const notice=document.createElement('div');notice.className='hw-notice';notice.setAttribute('role','alert');
  notice.innerHTML='<p><strong>這個瀏覽器沒有開啟硬體加速</strong>，3D 畫面會比較卡。</p><p>Chrome／Edge：設定 → 系統 → 開啟「可用時使用圖形加速」，再重新啟動瀏覽器。</p><button type="button">知道了</button>';
  notice.querySelector('button').addEventListener('click',()=>notice.remove());document.body.append(notice);
}
async function init(){
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  try{
    world=createWorld();
    view=createRenderer(ui.$('stage'),world.sky.sun,adjusted=>{if(adjusted)ui.toast('已自動調整畫質，維持流暢');},ui.prefs.quality);
    view.scene=world.scene;
    softwareRendering(view);
    for(const state of STATES){world.set(state,true);world.update(0,0,{camera:view.camera});}
    await view.precompile();
  }catch(error){console.warn('三維場景初始化失敗',error);view?.dispose();view=null;ui.fallback('這個瀏覽器目前無法顯示 WebGL 三維場景，仍可用下方導覽閱讀完整原文、語譯與注釋。');world={state:{},age:0,set(s){this.state=s;},update(){return{};}};}
  director=createDirector(world,view,audio,ui);
  Object.assign(ui.actions,{goTo:value=>director.goTo(value),next:()=>director.next(),prev:()=>director.prev(),explore:()=>director.explore(),era:value=>director.era(value),cover:()=>{director.cover();ui.clearCard();},mode:()=>{if(director.mode==='explore')director.goTo(director.index);else director.explore(BEATS[director.index].id);},sound:value=>{audio.unlock();audio.toggle(value);},quality:value=>{view?.quality.set(value);view?.invalidate(true);},cutaway:value=>{world.set({...world.state,cutaway:value});view?.invalidate(true);},focus:place=>{const p=place.pos;view?.fly({pos:[p[0]+6,p[1]+4,p[2]-7],target:[p[0],Math.max(.8,p[1]-2),p[2]],dur:1.6});},fullscreen:async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else ui.toast('請使用瀏覽器選單開啟全螢幕');}catch{ui.toast('請使用瀏覽器選單開啟全螢幕');}}});
  const hash=/^#b\d+$/.test(location.hash)?location.hash.slice(1):null;if(hash&&BEATS.some(b=>b.id===hash))director.goTo(hash);else director.cover();
  addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(BEATS.some(b=>b.id===id))director.goTo(id);});
  const debug=new URLSearchParams(location.search).has('debug');ui.$('debug').hidden=!debug;let debugTime=0,frames=0;
  if(view)view.setCallbacks((dt,t)=>{const pending=director.update(dt,t);const result=world.update(dt,t,{camera:view.camera,step:()=>audio.play('step'),bark:pos=>{audio.play('bark');ui.bark(pos,t);}});result.active=!!(result.active||pending);return result;},(labels,dt)=>{
    if(labels)ui.positionLabels(view.camera,world.people,view.elapsed,world.effects);
    if(debug){debugTime+=dt;frames++;if(debugTime>.5){const info=view.renderer.info;ui.$('debug').textContent=`${Math.round(frames/debugTime)} FPS · ${info.render.calls} 繪製 · ${info.render.triangles.toLocaleString()} 三角形 · ${view.quality.mode==='auto'?'自動／':''}${view.quality.label}`;debugTime=0;frames=0;}}
  });
  else{let last=0;function tick(now){if(!document.hidden){const dt=last?Math.min(.1,(now-last)/1000):0;director.update(dt,now/1000);world.age+=dt;}last=now;requestAnimationFrame(tick);}requestAnimationFrame(tick);}
  const readingGap=()=>{if(!ui.$('reading').hidden)document.documentElement.style.setProperty('--reading-height',`${innerHeight-ui.$('reading').getBoundingClientRect().top+20}px`);};const readingObserver=new ResizeObserver(readingGap);readingObserver.observe(ui.$('reading'));addEventListener('resize',readingGap);
  window.__xjx={goTo:value=>director.goTo(value),next:()=>director.next(),prev:()=>director.prev(),getState:()=>JSON.parse(JSON.stringify(world.state)),getCamera:()=>view?.getCamera(),setCamera:spec=>view?.setCamera(spec),renderer:view?.renderer??null,quality:view?.quality??null};
  ui.ready();
}
init().catch(error=>{console.error(error);ui.fallback('載入時發生問題，請重新開啟此頁面。');});
