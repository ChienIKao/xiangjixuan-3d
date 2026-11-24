export class Quality {
  constructor(renderer,light,onChange,preference='auto') {this.renderer=renderer;this.light=light;this.onChange=onChange;this.level=2;this.elapsed=0;this.frames=0;this.set(preference);}
  set(mode) {this.mode=mode;this.level=mode==='low'||(this.software&&mode==='auto')?0:mode==='medium'?1:2;this.elapsed=0;this.frames=0;this.apply();}
  apply() {
    const r=this.renderer,l=this.light,level=this.level;
    r.setPixelRatio(level===2?Math.min(devicePixelRatio||1,2):level===1?Math.min(devicePixelRatio||1,1.25):this.software?.65:.85);
    r.shadowMap.enabled=level>0;l.castShadow=level>0;
    l.shadow.mapSize.setScalar(level===2?2048:1024);l.shadow.map?.dispose();l.shadow.map=null;r.shadowMap.needsUpdate=true;
    this.onChange?.(false);
  }
  sample(dt,continuous) {
    if(this.cooldown>0){this.cooldown-=dt;this.elapsed=0;this.frames=0;return;}
    if(this.mode!=='auto'||!continuous||dt>.5){this.elapsed=0;this.frames=0;return;}
    this.elapsed+=dt;this.frames++;
    if(this.elapsed>=2){if(this.frames/this.elapsed<(this.level===2?40:26)&&this.level>0){this.level--;this.apply();this.onChange?.(true);}this.elapsed=0;this.frames=0;}
  }
  suspend(seconds=1){this.cooldown=seconds;this.elapsed=0;this.frames=0;}
  get label(){return ['低','中','高'][this.level];}
}
