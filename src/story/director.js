import { BEATS,COVER,DEFAULT_STATE } from '../content/script.js';
import { stateAt,indexOf,explorationState } from './state.js';
export function createDirector(world,view,audio,ui){let index=0,mode='cover',beat=null,age=0,events=[],cardShown=false;
  function apply(state,camera,instant=false,delay={}){age=0;cardShown=false;view?.quality.suspend();world.set(state,instant,delay);audio.setState(state);view?.setMode(mode);view?.fly(camera,instant);view?.invalidate(true);ui.setFade(state.fade);}
  function goTo(value){index=indexOf(value);mode='guide';beat=BEATS[index];events=(beat.sfx||[]).map(s=>({...s,done:false}));apply(stateAt(index),beat.camera,false,beat.delay);ui.showGuide(beat,index);ui.setMode(mode);try{history.replaceState(null,'',`#${beat.id}`);}catch{location.hash=beat.id;}return index;}
  function explore(value='b38'){mode='explore';beat=null;events=[];apply(explorationState(value),{...COVER.camera,orbit:false});ui.setMode(mode);ui.setEra(value);ui.clearCard();ui.exploreLabels(world.state);}
  function era(value){apply(explorationState(value),{...COVER.camera,orbit:false});ui.setEra(value);ui.clearCard();ui.exploreLabels(world.state);}
  function cover(){mode='cover';events=[];apply({...DEFAULT_STATE,...COVER.state},COVER.camera,true);ui.setMode(mode);}
  function update(dt,t){age+=dt;audio.update(t);for(const s of events)if(!s.done&&age>=s.at){audio.play(s.name);s.done=true;}
    if(mode==='guide'&&beat.card&&!cardShown&&age>=(beat.card.delay||0)){ui.card(beat.card);cardShown=true;}
    ui.effectCaption(world.state,world.age);return mode==='guide'&&((beat?.card&&!cardShown)||events.some(e=>!e.done));
  }
  return {goTo,next:()=>goTo(Math.min(BEATS.length-1,index+1)),prev:()=>goTo(Math.max(0,index-1)),explore,era,cover,update,get index(){return index;},get mode(){return mode;}};
}
