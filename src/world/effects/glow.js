import * as T from 'three';
let texture;
export function glowSprite(color,size){
  if(!texture){const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d'),g=ctx.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,.85)');g.addColorStop(.25,'rgba(255,255,255,.3)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);texture=new T.CanvasTexture(canvas);}
  const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,color,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));sprite.scale.set(size,size,1);return sprite;
}
