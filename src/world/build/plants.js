import * as T from 'three';
import { cylinder,mesh,instances,consolidate,combineColors } from '../palette.js';
export function tree(parent,pos,height=3.2,leaf='leaf') {
  const g=new T.Group();parent.add(g);g.position.set(...pos);
  const isLoquat=leaf==='loquat',canopy=[],fruit=[],radius=isLoquat?1.8:height*.48,center=isLoquat?3.2:height*.84,depth=isLoquat?.8:height*.22;
  cylinder(g,0,(center-1)/2,0,.10,.17,center-1,'wood');
  for(let i=0;i<4;i++){const angle=i*Math.PI/2+.35,start=new T.Vector3(0,center-1,0),end=new T.Vector3(Math.cos(angle)*radius*.45,center-.12,Math.sin(angle)*radius*.45),delta=end.clone().sub(start),branch=cylinder(g,...start.clone().add(end).multiplyScalar(.5).toArray(),.07,.115,delta.length(),'wood');branch.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());}
  for(let i=0;i<61;i++){const angle=i*2.399,r=(radius-.45)*Math.sqrt(i/60),x=Math.cos(angle)*r,z=Math.sin(angle)*r,y=center+.13*(1-r/radius)+(i%3-1)*.10;
    canopy.push([x,y,z,.55,depth*(.82-.22*r/radius),.53,0,angle,0]);
    if(isLoquat&&i%9===0)fruit.push([x,y-depth*.78,z,.055,.065,.055]);
  }
  const leaves=instances(g,new T.IcosahedronGeometry(1,1),leaf,canopy),color=new T.Color();
  canopy.forEach((_,i)=>leaves.setColorAt(i,color.set(['#e8edcc','#ffffff','#bfceac','#d3dcba'][i%4])));
  // Dark lower facets give depth without adding another shell.
  const geo=leaves.geometry,colors=new Float32Array(geo.attributes.position.count*3);for(let i=0;i<geo.attributes.position.count;i++){const shade=geo.attributes.position.getY(i)<0?.7:1;colors.set([shade,shade,shade],i*3);}geo.setAttribute('color',new T.BufferAttribute(colors,3));leaves.material=leaves.material.clone();leaves.material.vertexColors=true;leaves.material.color.set(isLoquat?'#6b8847':'#668348');
  if(fruit.length)instances(g,new T.IcosahedronGeometry(1,0),'#d9a44a',fruit);
  let growth=()=>{};
  if(isLoquat){
    const mature=canopy.map(p=>[...p]),transform=new T.Object3D();let lastGrowth=-1;
    growth=value=>{const q=T.MathUtils.smoothstep(value,.12,1);if(q===lastGrowth)return;lastGrowth=q;
      canopy.forEach((p,i)=>{const j=i%22,angle=j*2.399,r=height*.43*Math.sqrt((j+.5)/22),seed=[Math.cos(angle)*r,height*(.8+.16*(1-r/(height*.5)))+(j%3-1)*height*.065,Math.sin(angle)*r,height*.16,height*.085,height*.14,0,angle,0];const target=mature[i];const v=seed.map((n,k)=>T.MathUtils.lerp(n,target[k],q));transform.position.set(...v.slice(0,3));transform.scale.set(...v.slice(3,6));transform.rotation.set(...v.slice(6));transform.updateMatrix();leaves.setMatrixAt(i,transform.matrix);});leaves.instanceMatrix.needsUpdate=true;
    };
  }
  consolidate(g,false);
  if(isLoquat){
    const seedWood=new T.Group();cylinder(seedWood,0,height*.38,0,.055,.13,height*.76,'wood');
    for(let i=0;i<22;i+=2){const angle=i*2.399,r=height*.43*Math.sqrt((i+.5)/22),x=Math.cos(angle)*r,z=Math.sin(angle)*r,branch=cylinder(seedWood,x*.5,height*.73,z*.5,.026,.045,height*.32,'wood');branch.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(x,height*.35,z).normalize());}
    consolidate(seedWood,false);const wood=g.children.find(o=>o.isMesh&&!o.isInstancedMesh),source=seedWood.children[0].geometry,target=wood.geometry,count=Math.max(source.attributes.position.count,target.attributes.position.count),geometry=new T.BufferGeometry();
    for(const key of ['position','normal']){const from=new Float32Array(count*3),to=new Float32Array(count*3),a=source.attributes[key],b=target.attributes[key];for(let i=0;i<count;i++){from.set([a.getX(i%a.count),a.getY(i%a.count),a.getZ(i%a.count)],i*3);to.set([b.getX(i%b.count),b.getY(i%b.count),b.getZ(i%b.count)],i*3);}geometry.setAttribute(key,new T.BufferAttribute(from,3));geometry.morphAttributes[key]=[new T.BufferAttribute(to,3)];}
    wood.geometry=geometry;wood.updateMorphTargets();source.dispose();target.dispose();const growLeaves=growth;
    g.userData.grow=value=>{growLeaves(value);wood.morphTargetInfluences[0]=T.MathUtils.smoothstep(value,.12,1);};
  }
  g.userData.tree=true;return g;
}
export function buildPlants(scene){
  const plants=[];plants.push(tree(scene,[-3.7,0,2],3.2));plants.push(tree(scene,[-4,0,-1.2],2.9));
  const bamboo=new T.Group();bamboo.position.set(4.2,0,2.4);scene.add(bamboo);const stems=[],leaves=[];
  for(let i=0;i<14;i++){const a=i*2.4,r=.18+(i%4)*.16,h=3.5+(i%5)*.32,x=Math.cos(a)*r,z=Math.sin(a)*r;stems.push([x,h/2,z,.045,h,.045,0,0,(i%3-1)*.035]);for(let k=0;k<5;k++)leaves.push([x+Math.cos(k*2)*.25,h-.4-k*.13,z+Math.sin(k*2)*.25,.65,.06,.18,0,k*2,.35]);}
  instances(bamboo,new T.CylinderGeometry(.5,.5,1,5),'bamboo',stems);instances(bamboo,new T.OctahedronGeometry(.5),'bamboo',leaves);plants.push(bamboo);
  for(const p of [[-1.6,.45,3.65],[1.6,.45,3.65],[-.95,0,2.5],[.95,0,2.5]]){const g=new T.Group();g.position.set(...p);scene.add(g);cylinder(g,0,.15,0,.18,.12,.3,'soil');for(let i=0;i<7;i++){const m=mesh(new T.ConeGeometry(.045,.7,3),'leaf',g,[Math.sin(i)*.08,.55,Math.cos(i)*.08]);m.rotation.z=Math.sin(i)*.5;}consolidate(g,false);combineColors(g);plants.push(g);}
  const loquat=tree(scene,[-1.4,0,.1],4.5,'loquat');
  const weeds=new T.Group();scene.add(weeds);const wt=[];for(let i=0;i<150;i++){const x=Math.sin(i*127.1)*4.8,z=-5.7+((i*71)%100)/100*8.8;wt.push([x,.13,z,.12,.26,.12,0,i,0]);}for(let i=0;i<65;i++){const cluster=i%13,x=-2.1+(cluster%7)*.68,z=2.8+Math.floor(cluster/7)*.72;wt.push([x+Math.sin(i*7)*.22,.2,z+Math.cos(i*9)*.22,.12,.4+(i%4)*.06,.1,0,i,.15]);}instances(weeds,new T.ConeGeometry(.5,1,3),'bamboo',wt);
  const landscape=new T.Group();scene.add(landscape);for(let i=0;i<17;i++){const a=i/17*Math.PI*2,r=42+(i%3)*9;const m=mesh(new T.ConeGeometry(9+(i%4)*2,8+(i%5)*2,5),['#a8b2a4','#bcc2b3','#c7cbbd'][i%3],landscape,[Math.cos(a)*r,2,Math.sin(a)*r]);m.rotation.y=i;m.scale.z=.6;}consolidate(landscape,false);
  return {plants,loquat,weeds,landscape};
}
