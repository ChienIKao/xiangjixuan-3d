// Optional local QA: start headless Chrome on port 9223, then run with Node's --experimental-websocket.
import { writeFile,mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const assertions=[];
function check(condition,name){assert.ok(condition,name);assertions.push(name);}
const tabs=await fetch('http://127.0.0.1:9223/json').then(r=>r.json());
const tab=tabs.find(t=>t.type==='page');
if(!tab)throw Error('找不到本機 Chrome 分頁');
const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[],requests=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);else if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push({source:'console',text:m.params.args.map(a=>a.value||a.description||'').join(' ')});else if(m.method==='Log.entryAdded'&&m.params.entry.level==='error')errors.push(m.params.entry);else if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);});
const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
const evaluate=async(expression)=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const delay=ms=>new Promise(r=>setTimeout(r,ms));
await call('Page.enable');await call('Runtime.enable');await call('Log.enable');await call('Network.enable');
await evaluate('try{localStorage.removeItem("xjx-preferences")}catch{}');
await call('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:pathToFileURL(resolve('dist/index.html')).href+'?debug'});
for(let i=0;i<60;i++){if(await evaluate('!!window.__xjx'))break;await delay(200);}
console.log('初始化',await evaluate('({ready:!!window.__xjx,webgl:!!window.__xjx?.renderer,message:document.getElementById("webgl-message").textContent})'));
await mkdir('qa',{recursive:true});
async function capture(name){const r=await call('Page.captureScreenshot',{format:'png'});await writeFile(`qa/${name}.png`,Buffer.from(r.data,'base64'));}
await delay(1500);await capture('cover-1366');
const metrics=[];
for(let i=0;i<38;i++){
  await evaluate(`window.__xjx.goTo(${i})`);await delay(100);
  if([0,5,9,13,18,25,26,33,37].includes(i)){await delay(i===37?8200:2200);await capture(`b${i+1}-1366`);metrics.push(await evaluate('({beat:location.hash,calls:__xjx.renderer?.info.render.calls,triangles:__xjx.renderer?.info.render.triangles,quality:__xjx.quality?.label})'));}
}
for(const n of [38,2,19,10]){await evaluate(`window.__xjx.goTo('b${n}')`);const s=await evaluate('window.__xjx.getState()');console.log(`跳句 b${n}`,JSON.stringify({sky:s.sky,partition:s.partition,rain:s.rain,people:Object.keys(s.people)}));}
await evaluate('document.querySelector("[data-action=mode]").click()');await delay(1600);await capture('explore-1366');
await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await evaluate('window.__xjx.goTo("b19")');await delay(2200);await capture('b19-mobile');
await call('Emulation.setDeviceMetricsOverride',{width:1024,height:768,deviceScaleFactor:1,mobile:false});await delay(300);await capture('b19-1024');
check(await evaluate('document.getElementById("text-panel").getBoundingClientRect().bottom <= document.getElementById("reading").getBoundingClientRect().top'),'1024 字幕與原文面板不重疊');
await evaluate('window.__xjx.goTo("b10")');await delay(2600);await call('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false});await delay(300);await capture('b10-1920');
await evaluate('window.__xjx.goTo("b5")');await delay(3100);const before=await evaluate('__xjx.renderer.info.render.frame');await delay(500);check(before===await evaluate('__xjx.renderer.info.render.frame'),'靜止場景停止繪製');
await call('Input.dispatchKeyEvent',{type:'keyDown',key:'PageDown',code:'PageDown',windowsVirtualKeyCode:34});check(await evaluate('location.hash==="#b6"'),'簡報筆 PageDown 下一句');
await call('Input.dispatchKeyEvent',{type:'keyDown',key:'PageUp',code:'PageUp',windowsVirtualKeyCode:33});check(await evaluate('location.hash==="#b5"'),'簡報筆 PageUp 上一句');
const glossBefore=await evaluate('document.getElementById("gloss").hidden');await call('Input.dispatchKeyEvent',{type:'keyDown',key:'g',code:'KeyG',windowsVirtualKeyCode:71});check(glossBefore!==await evaluate('document.getElementById("gloss").hidden'),'G 切換語譯');
await evaluate('document.querySelector("[data-action=notes]").getAttribute("aria-pressed")==="false" && document.querySelector("[data-action=notes]").click();document.querySelector(".note-term").click()');check(await evaluate('document.getElementById("dialog").open'),'注釋視窗開啟');await evaluate('document.getElementById("dialog-close").click()');
await evaluate('document.getElementById("question").click()');check(await evaluate('document.getElementById("dialog").open'),'段落提問開啟');await evaluate('document.getElementById("dialog-close").click()');
await evaluate('__xjx.quality.set("low")');check(await evaluate('!__xjx.renderer.shadowMap.enabled && __xjx.renderer.getPixelRatio()===.85'),'低畫質關閉陰影與設定 DPR');
await evaluate('__xjx.quality.set("auto");for(let i=0;i<60;i++)__xjx.quality.sample(.04,true)');check(await evaluate('__xjx.quality.level===1'),'自動畫質低於 40 FPS 降一級');
await evaluate('for(let i=0;i<60;i++)__xjx.quality.sample(.04,true)');check(await evaluate('__xjx.quality.level===0'),'自動畫質可降至低');await evaluate('__xjx.quality.set("auto")');
await evaluate('document.querySelector("[data-action=mode]").click();document.getElementById("era").value="b3";document.getElementById("era").dispatchEvent(new Event("change"))');check(await evaluate('__xjx.getState().loquat===0 && !Array.from(document.querySelectorAll(".place-label")).some(e=>e.textContent==="枇杷樹")'),'探索時期隱藏未種植的枇杷樹');
await evaluate('document.getElementById("cutaway").checked=true;document.getElementById("cutaway").dispatchEvent(new Event("change"))');check(await evaluate('__xjx.getState().cutaway'),'探索掀屋頂');
const url=pathToFileURL(resolve('dist/index.html')).href;
await call('Page.navigate',{url:url+'#b12'});await delay(2000);check(await evaluate('!!window.__xjx && location.hash==="#b12" && document.getElementById("counter").textContent==="12 / 38"'),'離線網址直接開到 b12');
const injected=await call('Page.addScriptToEvaluateOnNewDocument',{source:'const originalContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:originalContext.call(this,type,...args)};Storage.prototype.setItem=function(){throw new Error("測試儲存失敗")};'});
await call('Page.navigate',{url:url+'#b2'});await call('Page.reload',{ignoreCache:true});await delay(2000);check(await evaluate('!!window.__xjx && !__xjx.renderer && !document.getElementById("webgl-message").hidden && document.getElementById("subtitle").textContent.length>0'),'WebGL 不可用時仍能閱讀');
await evaluate('document.querySelector("[data-action=gloss]").click()');check(await evaluate('!!window.__xjx'),'本機儲存寫入失敗仍可操作');await capture('fallback');
await call('Page.removeScriptToEvaluateOnNewDocument',{identifier:injected.identifier});
// WebGLRenderer deliberately reports an initialization error during this explicit fallback case.
const expectedErrors=errors.filter(e=>JSON.stringify(e).includes('Error creating WebGL context'));
for(const e of expectedErrors)errors.splice(errors.indexOf(e),1);
console.log('效能',JSON.stringify(metrics));console.log('外部請求',JSON.stringify(requests.filter(u=>/^https?:/.test(u))));console.log('錯誤',JSON.stringify(errors));
console.log('操作驗證',JSON.stringify(assertions));
await writeFile('qa/browser-results.json',JSON.stringify({metrics,assertions,requests,errors,expectedFallbackErrors:expectedErrors.length},null,2));ws.close();if(errors.length)process.exitCode=1;
