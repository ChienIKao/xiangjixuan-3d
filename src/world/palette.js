import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
export const COLORS={wall:'#ece6da',stone:'#8f8a80',tile:'#4a4f55',ridge:'#3a3e44',wood:'#5b3a29',lattice:'#6b4a35',paper:'#f3ead2',paving:'#b8b2a6',ground:'#9da68c',bamboo:'#6f8f4e',leaf:'#3f5f3a',loquat:'#4d6b3c',soil:'#928574',gold:'#d9ad60'};
const cache=new Map();
export function material(key, extra={}) {
  const color=COLORS[key] || key;
  const id=color+JSON.stringify(extra);
  if(!cache.has(id)) cache.set(id,new T.MeshLambertMaterial({color,flatShading:true,...extra}));
  return cache.get(id);
}
export function mesh(geometry,mat,parent,pos=[0,0,0]) {
  const m=new T.Mesh(geometry,typeof mat==='string'?material(mat):mat);
  m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent?.add(m);return m;
}
export function box(parent,x,y,z,w,h,d,mat='wall') { return mesh(new T.BoxGeometry(w,h,d),mat,parent,[x,y,z]); }
export function cylinder(parent,x,y,z,rt,rb,h,mat='wood',segments=8) {return mesh(new T.CylinderGeometry(rt,rb,h,segments),mat,parent,[x,y,z]);}
export function instances(parent,geometry,mat,transforms) {
  const m=new T.InstancedMesh(geometry,typeof mat==='string'?material(mat):mat,transforms.length),o=new T.Object3D();
  transforms.forEach((p,i)=>{o.position.set(...p.slice(0,3));o.rotation.set(p[6]||0,p[7]||0,p[8]||0);o.scale.set(p[3]??1,p[4]??1,p[5]??1);o.updateMatrix();m.setMatrixAt(i,o.matrix);});
  m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
// Merge only immobile meshes belonging to this group; animated groups remain separate.
export function consolidate(group,ink=true,deep=false) {
  const byMaterial=new Map(),outlines=[];group.updateMatrixWorld(true);
  const inverse=new T.Matrix4().copy(group.matrixWorld).invert();
  const children=[];if(deep)group.traverse(o=>{if(o!==group)children.push(o);});else children.push(...group.children);
  for(const child of children) {
    if(deep&&child.isLineSegments){outlines.push(child.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,child.matrixWorld)));child.parent.remove(child);child.geometry.dispose();continue;}
    if(!child.isMesh || child.isInstancedMesh) continue;
    const g=child.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,child.matrixWorld));
    if(ink) {const e=new T.EdgesGeometry(g,20);outlines.push(e);}
    if(!byMaterial.has(child.material))byMaterial.set(child.material,[]);
    byMaterial.get(child.material).push(g);child.parent.remove(child);child.geometry.dispose();
  }
  for(const [mat,gs] of byMaterial) {
    // Non-indexed geometries allow boxes, cylinders and spheres to share one draw call.
    const normalized=gs.map(g=>{const n=g.index?g.toNonIndexed():g; n.deleteAttribute('uv');return n;});
    const merged=mergeGeometries(normalized);if(merged)mesh(merged,mat,group);
    normalized.forEach(g=>g.dispose());gs.forEach(g=>g.dispose());
  }
  if(outlines.length){const g=mergeGeometries(outlines);group.add(new T.LineSegments(g,new T.LineBasicMaterial({color:'#2b2723',transparent:true,opacity:.28})));outlines.forEach(g=>g.dispose());}
  for(const c of group.children){c.updateMatrix();c.matrixAutoUpdate=false;}
}
export function combineColors(group) {
  const gs=[];group.updateMatrixWorld(true);const inverse=new T.Matrix4().copy(group.matrixWorld).invert();
  for(const o of [...group.children]){
    if(!o.isMesh||o.isInstancedMesh||!o.material.isMeshLambertMaterial)continue;
    const g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));g.deleteAttribute('uv');
    const colors=new Float32Array(g.attributes.position.count*3),c=o.material.color;for(let i=0;i<colors.length;i+=3){colors[i]=c.r;colors[i+1]=c.g;colors[i+2]=c.b;}g.setAttribute('color',new T.BufferAttribute(colors,3));gs.push(g);group.remove(o);o.geometry.dispose();
  }
  if(gs.length){const g=mergeGeometries(gs);const m=mesh(g,material('#ffffff',{vertexColors:true}),group);m.updateMatrix();m.matrixAutoUpdate=false;gs.forEach(g=>g.dispose());}
}
export function combineInstances(group) {
  group.updateMatrixWorld(true);const batches=new Map(),inverse=new T.Matrix4().copy(group.matrixWorld).invert();
  group.traverse(o=>{if(o.isInstancedMesh){const key=o.material.uuid+o.geometry.type+JSON.stringify(o.geometry.parameters);if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);}});
  const local=new T.Matrix4(),world=new T.Matrix4(),color=new T.Color();
  for(const list of batches.values()){
    if(list.length<2)continue;const count=list.reduce((n,o)=>n+o.count,0),source=list[0],merged=new T.InstancedMesh(source.geometry,source.material,count);let index=0;
    for(const o of list){world.multiplyMatrices(inverse,o.matrixWorld);for(let i=0;i<o.count;i++){o.getMatrixAt(i,local);local.premultiply(world);merged.setMatrixAt(index,local);if(o.instanceColor){o.getColorAt(i,color);merged.setColorAt(index,color);}index++;}o.parent.remove(o);}
    merged.castShadow=true;merged.receiveShadow=true;merged.updateMatrix();merged.matrixAutoUpdate=false;group.add(merged);
  }
}
export function opacity(group,value) {
  group.visible=value>.005;
  if(!group.userData.fadeMaterials){
    const map=new Map();group.traverse(o=>{if(o.material){if(!map.has(o.material))map.set(o.material,o.material.clone());o.material=map.get(o.material);}});
    group.userData.fadeMaterials=[...map.values()];for(const m of group.userData.fadeMaterials)m.userData.baseOpacity=m.opacity;
  }
  for(const m of group.userData.fadeMaterials){const transparent=value<.999;if(m.transparent!==transparent){m.transparent=transparent;m.needsUpdate=true;}m.opacity=value*m.userData.baseOpacity;m.depthWrite=value>.9;}
}
