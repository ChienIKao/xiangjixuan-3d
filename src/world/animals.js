import * as T from 'three';
import { box,mesh,cylinder,consolidate,combineColors } from './palette.js';
function animal(scene,pos,type){const g=new T.Group();g.position.set(...pos);scene.add(g);let head;
  if(type==='dog'){box(g,0,.35,0,.6,.32,.25,'soil');for(const x of [-.22,.22])for(const z of [-.09,.09])box(g,x,.16,z,.07,.3,.07,'wood');head=box(g,-.35,.58,0,.27,.28,.24,'soil');box(g,-.5,.52,0,.17,.1,.14,'wood');for(const z of [-.1,.1])mesh(new T.ConeGeometry(.075,.2,3),'wood',g,[-.35,.8,z]);const tail=box(g,.38,.6,0,.25,.06,.06,'soil');tail.rotation.z=.6;}
  else{const size=type==='chicken'?.23:.055;mesh(new T.IcosahedronGeometry(size,1),type==='chicken'?'paper':'#74513a',g,[0,size+.08,0]);head=mesh(new T.IcosahedronGeometry(size*.55,0),'soil',g,[0,size*2+.08,-size*.7]);const beak=mesh(new T.ConeGeometry(size*.22,size*.7,3),'gold',g,[0,size*2+.08,-size*1.3]);beak.rotation.x=-Math.PI/2;for(const x of [-1,1])cylinder(g,x*size*.35,.08,0,.015,.015,.16,'wood');if(type==='chicken')mesh(new T.ConeGeometry(.07,.15,3),'#a3503d',g,[0,size*2.65,-size*.7]);}
  if(type==='bird'){const belly=mesh(new T.IcosahedronGeometry(.046,0),'#d9c9ab',g,[0,.12,-.012]);belly.scale.set(.85,.65,1);const tail=mesh(new T.ConeGeometry(.023,.065,3),'#503b2e',g,[0,.13,.065]);tail.rotation.x=Math.PI/2;}
  // Head kept separate for the barking/pecking motion.
  g.remove(head);consolidate(g,false);combineColors(g);g.add(head);g.traverse(o=>{o.castShadow=false;});if(type==='bird')g.scale.setScalar(1.3);return {g,head,baseY:pos[1],headY:head.position.y};
}
export function createAnimals(scene){const dogs=[[4,0,-4.6],[-1.6,0,-4]].map(p=>animal(scene,p,'dog'));dogs[1].g.rotation.y=Math.PI;
  const birds=[[-.4,0,2.2],[.3,0,1.9],[.1,.15,2.75]].map(p=>animal(scene,p,'bird'));
  const chickens=[[-1.6,.6,-7.2],[-.8,.6,-7.6],[.4,1.65,-8.5]].map(p=>animal(scene,p,'chicken'));
  let state={},lastBark=-1;return {dogs,birds,chickens,set(s){state=s;dogs.forEach(p=>p.g.visible=s.dogs);birds.forEach(p=>p.g.visible=s.birds);chickens.forEach(p=>p.g.visible=s.chickens);lastBark=-1;},update(t,bark){
    if(state.dogs){const n=Math.floor(t/2.2),i=n%2,q=t%2.2;if(n!==lastBark){bark?.(dogs[i].g.position);lastBark=n;}dogs.forEach((d,j)=>d.head.position.y=d.headY+(j===i&&q<.4?Math.sin(q*35)*.045:0));}
    if(state.birds)birds.forEach((b,i)=>{b.g.position.y=b.baseY+Math.max(0,Math.sin(t*3+i*2))*.09;const peck=Math.max(0,Math.sin(t*5+i));b.head.position.y=b.headY-peck*.035;b.g.rotation.x=peck*.23;});
    return state.dogs||state.birds;
  }};
}
