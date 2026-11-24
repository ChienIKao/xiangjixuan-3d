import assert from 'node:assert/strict';
import { META,PARAGRAPHS,BEATS,NOTES,PLACES,ERAS,DEFAULT_STATE,COVER } from '../src/content/script.js';
import { stateAt,explorationState } from '../src/story/state.js';
const poses=new Set(['stand','sit','bow','walk','point','knock','proud','plant']);
const errors=[];
const check=(value,message)=>{if(!value)errors.push(message);};
const vector=(a,n=3)=>Array.isArray(a)&&a.length===n&&a.every(Number.isFinite);
const ids=new Set(),paras=new Map(PARAGRAPHS.map(p=>[p.id,p]));
for(const p of PARAGRAPHS)check(BEATS.filter(b=>b.para===p.id).map(b=>b.text).join('')===p.text,`${p.id} 分句串接與原文不符`);
function camera(c,label){check(!!c&&vector(c.pos)&&vector(c.target),`${label} 鏡頭座標無效`);if(c?.dur!==undefined)check(Number.isFinite(c.dur)&&c.dur>=0,`${label} 鏡頭時間無效`);}
function state(s,label){for(const [key,value] of Object.entries(s||{}))check(key in DEFAULT_STATE,`${label} 未定義狀態 ${key}`);
  for(const [id,p] of Object.entries(s?.people||{})){check(vector(p.pos),`${label} ${id} 人物座標無效`);check(poses.has(p.pose),`${label} ${id} 姿勢無效`);if(p.path)check(Array.isArray(p.path)&&p.path.length>1&&p.path.every(a=>vector(a)),`${label} ${id} 路徑無效`);if(p.lookAt)check(vector(p.lookAt,2),`${label} ${id} 注視座標無效`);if(p.face!==undefined)check(Number.isFinite(p.face),`${label} ${id} 朝向無效`);}
}
for(const b of BEATS){check(!ids.has(b.id),`分句 id 重複：${b.id}`);ids.add(b.id);check(paras.has(b.para),`${b.id} 段落不存在`);camera(b.camera,b.id);state(b.state,b.id);}
for(const n of NOTES)check(paras.get(n.p)?.text.includes(n.key),`注釋未出現於原文：${n.p} ${n.key}`);
for(const p of PLACES){check(ids.has(p.beat),`地點 ${p.id} 引用不存在的句子`);check(vector(p.pos),`地點 ${p.id} 座標無效`);}
for(const e of ERAS)check(ids.has(e.beat),`時期 ${e.id} 引用不存在的句子`);
state(COVER.state,'封面');camera(COVER.camera,'封面');state(DEFAULT_STATE,'預設');
// Independent reference fold checks all target states, including nonsequential jumps.
for(const b of [...BEATS].reverse()){
  const i=BEATS.indexOf(b),expected=JSON.parse(JSON.stringify(DEFAULT_STATE));
  for(let j=0;j<=i;j++){for(const k of ['focus','compass','measure','sun','desk','well','timeLapse'])expected[k]=DEFAULT_STATE[k];Object.assign(expected,BEATS[j].state||{});}
  try{assert.deepEqual(stateAt(b.id),expected);}catch{errors.push(`${b.id} 累積狀態不符`);}
  const e=explorationState(i);check(Object.keys(e.people).length===0&&!e.cutaway&&!e.fade&&!e.vast,`${b.id} 探索模式未清空狀態`);
}
const copy=stateAt('b38');copy.people.test={};check(!stateAt('b38').people.test,'狀態副本污染');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`內容檢查通過：${META.title}，${PARAGRAPHS.length} 段、${BEATS.length} 句、${NOTES.length} 則注釋；累積狀態與探索狀態通過。`);
