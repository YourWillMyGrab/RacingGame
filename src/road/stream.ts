import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { ModularRoute, type PlacedModule } from './route';

interface ChunkResources { group: THREE.Group; colliders: RAPIER.Collider[]; geometry: THREE.BufferGeometry[]; debug: THREE.Group; materials?:THREE.Material[]; textures?:THREE.Texture[] }
export class RoadStream {
  readonly active=new Map<number,ChunkResources>();
  debug=false;
  created=0;
  unloaded=0;
  private road=new THREE.MeshStandardMaterial({color:0x2d3c46,roughness:.8});
  private wall=new THREE.MeshStandardMaterial({color:0x24bfae,emissive:0x073f42});
  private white=new THREE.MeshStandardMaterial({color:0xb8d2d5});
  private structure=new THREE.MeshStandardMaterial({color:0x244550,roughness:.75});
  private debugMat=new THREE.MeshBasicMaterial({color:0xffd27a,wireframe:true});
  private signTexture?:THREE.CanvasTexture;
  private signMaterial?:THREE.MeshBasicMaterial;
  constructor(readonly route: ModularRoute,private scene:THREE.Scene,private world:RAPIER.World) {}
  update(progress:number, others:number[]=[]) {
    const centers=[progress,...others];
    for(const chunk of this.route.chunks) {
      const needed=centers.some(s=>chunk.end>s-180 && chunk.start<s+650);
      if(needed && !this.active.has(chunk.index)) {this.active.set(chunk.index,this.build(chunk));this.created++;}
      else if(!needed && this.active.has(chunk.index))this.remove(chunk.index);
    }
    for(const chunk of this.active.values())chunk.debug.visible=this.debug;
  }
  private build(chunk:PlacedModule):ChunkResources {
    if(chunk.branches)return this.buildFork(chunk);
    const group=new THREE.Group(),debug=new THREE.Group(),colliders:RAPIER.Collider[]=[],geometry:THREE.BufferGeometry[]=[];
    group.add(debug);debug.visible=this.debug;
    const vertices:number[]=[],indices:number[]=[];
    for(const p of chunk.points)for(const side of [-1,1])vertices.push(p.x+Math.cos(p.yaw)*p.width/2*side,p.y,p.z-Math.sin(p.yaw)*p.width/2*side);
    for(let i=0;i<chunk.points.length-1;i++){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();geometry.push(geo);
    group.add(new THREE.Mesh(geo,this.road));
    colliders.push(this.world.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(vertices),new Uint32Array(indices)).setFriction(.1)));
    const count=chunk.points.length-1,box=new THREE.BoxGeometry(1,1,1);geometry.push(box);
    const barriers=new THREE.InstancedMesh(box,this.wall,count*2),stripes=new THREE.InstancedMesh(box,this.white,Math.ceil(count/3));
    const dummy=new THREE.Object3D();
    let stripeIndex=0;
    for(let i=0;i<count;i++) {
      const a=chunk.points[i],b=chunk.points[i+1],yaw=(a.yaw+b.yaw)/2,length=Math.hypot(b.x-a.x,b.z-a.z),pitch=Math.atan2(b.y-a.y,length);
      for(let side=0;side<2;side++) {
        const offset=(side?1:-1)*(a.width/2+.3);
        const x=(a.x+b.x)/2+Math.cos(yaw)*offset,y=(a.y+b.y)/2+.5,z=(a.z+b.z)/2-Math.sin(yaw)*offset;
        dummy.position.set(x,y,z);dummy.rotation.set(pitch,yaw,0,'YXZ');dummy.scale.set(.5,1,length+.2);dummy.updateMatrix();barriers.setMatrixAt(i*2+side,dummy.matrix);
        colliders.push(this.world.createCollider(RAPIER.ColliderDesc.cuboid(.25,.5,(length+.2)/2).setTranslation(x,y,z).setRotation(dummy.quaternion).setFriction(.04).setRestitution(.1)));
      }
      if(i%3===0){dummy.position.set((a.x+b.x)/2,(a.y+b.y)/2+.025,(a.z+b.z)/2);dummy.rotation.set(pitch,yaw,0,'YXZ');dummy.scale.set(.14,.025,2);dummy.updateMatrix();stripes.setMatrixAt(stripeIndex++,dummy.matrix);}
    }
    group.add(barriers,stripes);
    const decorations=new THREE.Group();group.add(decorations);
    const addBox=(w:number,h:number,d:number,s:number,offset:number,y:number,material:THREE.Material=this.structure,physical=false)=>{
      const p=this.route.pointAt(s),mesh=new THREE.Mesh(box,material);
      mesh.scale.set(w,h,d);mesh.position.set(p.x+Math.cos(p.yaw)*offset,p.y+y,p.z-Math.sin(p.yaw)*offset);mesh.rotation.y=p.yaw;decorations.add(mesh);
      if(physical)colliders.push(this.world.createCollider(RAPIER.ColliderDesc.cuboid(w/2,h/2,d/2).setTranslation(mesh.position.x,mesh.position.y,mesh.position.z).setRotation(mesh.quaternion)));
    };
    if(chunk.definition.flags.tunnel) {
      for(let s=chunk.start+2;s<chunk.end;s+=12){addBox(22,.7,12,s,0,6,this.structure,true);for(const side of [-1,1])addBox(.8,6,1,s,side*10.8,3);addBox(8,.06,.25,s,0,5.62,this.white);}
    } else {
      for(let s=chunk.start+12;s<chunk.end;s+=30)for(const side of [-1,1]){addBox(.25,7,.25,s,side*11.8,3.5);addBox(1.8,.15,.35,s,side*11.2,7,this.white);}
    }
    if(chunk.definition.flags.bridge)for(let s=chunk.start+8;s<chunk.end;s+=18)for(const side of [-1,1])addBox(.4,5,.4,s,side*10.8,2.5,this.white);
    for(const s of chunk.definition.scenerySockets)for(const side of [-1,1])addBox(14,15+(chunk.index%5)*7,18,chunk.start+s,side*50,6+(chunk.index%5)*3.5);
    if(chunk.definition.difficulty===3&&typeof document!=='undefined') {
      if(!this.signMaterial){const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#ffb65c';ctx.fillRect(0,0,256,256);ctx.fillStyle='#172c35';ctx.textAlign='center';ctx.font='bold 38px sans-serif';ctx.fillText('FRENA',128,53);ctx.font='bold 105px sans-serif';ctx.fillText('50',128,159);ctx.font='24px sans-serif';ctx.fillText('CURVE STRETTE',128,215);this.signTexture=new THREE.CanvasTexture(canvas);this.signTexture.colorSpace=THREE.SRGBColorSpace;this.signMaterial=new THREE.MeshBasicMaterial({map:this.signTexture,side:THREE.DoubleSide});}
      const signGeo=new THREE.PlaneGeometry(2.4,2.4);geometry.push(signGeo);
      for(const distance of [70,35])for(const side of [-1,1]){const p=this.route.pointAt(chunk.start-distance),sign=new THREE.Mesh(signGeo,this.signMaterial);sign.position.set(p.x+Math.cos(p.yaw)*side*11.8,p.y+2.7,p.z-Math.sin(p.yaw)*side*11.8);sign.rotation.y=p.yaw;group.add(sign);addBox(.18,1.5,.18,chunk.start-distance,side*11.8,.75,this.white);}
    }
    for(const s of [chunk.start,...chunk.definition.recoveryAnchors.map(s=>s+chunk.start)]) {
      const p=this.route.pointAt(s),anchor=new THREE.Mesh(box,this.debugMat);anchor.position.set(p.x,p.y+.5,p.z);anchor.scale.set(2,1,2);debug.add(anchor);
    }
    if(chunk.definition.category==='start'||chunk.definition.category==='finish') {
      const s=chunk.definition.category==='start'?chunk.start+25:chunk.start+30;
      for(const side of [-1,1])addBox(.6,7,.8,s,side*10.5,3.5,this.white);
      addBox(22,.8,.8,s,0,7,this.white);
      for(let i=0;i<10;i++)addBox(2,.03,1.5,s,-9+i*2,.03,i%2?this.road:this.white);
    }
    this.scene.add(group);return {group,colliders,geometry,debug};
  }
  private buildFork(chunk:PlacedModule):ChunkResources {
    const group=new THREE.Group(),debug=new THREE.Group(),colliders:RAPIER.Collider[]=[],geometry:THREE.BufferGeometry[]=[],materials:THREE.Material[]=[],textures:THREE.Texture[]=[];
    group.add(debug);debug.visible=this.debug;
    const box=new THREE.BoxGeometry(1,1,1);geometry.push(box);
    const left=chunk.branches!.left,right=chunk.branches!.right,normal=new THREE.Vector3(Math.cos(chunk.entry.yaw),0,-Math.sin(chunk.entry.yaw));
    const vertices:number[]=[],indices:number[]=[],instances=new Map<THREE.Material,THREE.Matrix4[]>();
    const at=(i:number,offset:number)=>new THREE.Vector3((left[i].x+right[i].x)/2,left[i].y,(left[i].z+right[i].z)/2).addScaledVector(normal,offset);
    const bounds=(i:number)=>{const d=Math.hypot(left[i].x-right[i].x,left[i].z-right[i].z)/2,halfWidth=6/Math.cos(left[i].yaw-chunk.entry.yaw);return [-Math.max(10,d+halfWidth),Math.min(0,halfWidth-d),Math.max(0,d-halfWidth),Math.max(10,d+halfWidth)];};
    const beam=(a:THREE.Vector3,b:THREE.Vector3,width:number,height:number,material:THREE.Material,physical=false)=>{
      const length=a.distanceTo(b),mesh=new THREE.Mesh(box,material);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.position.y+=height/2;mesh.scale.set(width,height,length+.04);mesh.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);mesh.updateMatrix();const batch=instances.get(material)??[];batch.push(mesh.matrix.clone());instances.set(material,batch);
      if(physical)colliders.push(this.world.createCollider(RAPIER.ColliderDesc.cuboid(width/2,height/2,(length+.04)/2).setTranslation(mesh.position.x,mesh.position.y,mesh.position.z).setRotation(mesh.quaternion).setFriction(.04)));
    };
    for(let i=0;i<left.length-1;i++){
      const a=bounds(i),b=bounds(i+1);
      // Two strips meet at the centre before/after the island, never overlap.
      for(const side of [0,2]){const base=vertices.length/3;for(const p of [at(i,a[side]),at(i,a[side+1]),at(i+1,b[side]),at(i+1,b[side+1])])vertices.push(p.x,p.y,p.z);indices.push(base,base+1,base+2,base+1,base+3,base+2);}
      for(const edge of [0,3])beam(at(i,a[edge]),at(i+1,b[edge]),.5,1,this.wall,true);
      if(a[2]-a[1]>.8&&b[2]-b[1]>.8)for(const edge of [1,2])beam(at(i,a[edge]),at(i+1,b[edge]),.45,1,this.white,true);
      if(i%3===0)for(const arm of [left,right]){const p=new THREE.Vector3(arm[i].x,arm[i].y+.025,arm[i].z),q=new THREE.Vector3(arm[i+1].x,arm[i+1].y+.025,arm[i+1].z);beam(p,q,.15,.025,this.white);}
      if(i%20===0)for(const arm of [left,right]){const mesh=new THREE.Mesh(box,this.debugMat);mesh.position.set(arm[i].x,arm[i].y+.5,arm[i].z);mesh.scale.set(2,1,2);debug.add(mesh);}
    }
    const road=new THREE.BufferGeometry();road.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));road.setIndex(indices);road.computeVertexNormals();geometry.push(road);group.add(new THREE.Mesh(road,this.road));
    colliders.push(this.world.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(vertices),new Uint32Array(indices)).setFriction(.1)));
    if(typeof document!=='undefined')for(const distance of [100,30])for(const [side,label,detail] of [[-1,'↖ TECNICA','PIÙ CURVE'],[1,'VELOCE ↗','PIÙ RETTILINEI']] as const){
      const canvas=document.createElement('canvas');canvas.width=640;canvas.height=320;const ctx=canvas.getContext('2d')!;
      ctx.fillStyle='#12343e';ctx.fillRect(0,0,640,320);ctx.strokeStyle='#8df7df';ctx.lineWidth=10;ctx.strokeRect(5,5,630,310);ctx.textAlign='center';ctx.fillStyle='#dffaf2';ctx.font='bold 40px sans-serif';ctx.fillText('PROSSIMA GARA',320,63);ctx.font='bold 75px sans-serif';ctx.fillText(label,320,170);ctx.font='38px sans-serif';ctx.fillText(detail,320,252);
      const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);const material=new THREE.MeshBasicMaterial({map:texture});materials.push(material);
      const geo=new THREE.PlaneGeometry(8,4);geometry.push(geo);const sign=new THREE.Mesh(geo,material),p=this.route.pointAt(chunk.start-distance);
      sign.position.set(p.x+Math.cos(p.yaw)*side*5,p.y+6,p.z-Math.sin(p.yaw)*side*5);sign.rotation.y=p.yaw;group.add(sign);
      const base=new THREE.Vector3(p.x+Math.cos(p.yaw)*side*10.6,p.y,p.z-Math.sin(p.yaw)*side*10.6);beam(base,base.clone().setY(base.y+.01),.4,8,this.structure);
      const cross=new THREE.Mesh(box,this.white);cross.scale.set(22,.25,.3);cross.position.set(p.x,p.y+8,p.z);cross.rotation.y=p.yaw;group.add(cross);
    }
    for(const [material,matrices] of instances){const mesh=new THREE.InstancedMesh(box,material,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));group.add(mesh);}
    this.scene.add(group);return {group,debug,colliders,geometry,materials,textures};
  }
  private remove(index:number) {
    const r=this.active.get(index)!;
    for(const collider of r.colliders)this.world.removeCollider(collider,true);
    this.scene.remove(r.group);
    r.group.traverse(object=>{if(object instanceof THREE.InstancedMesh)object.dispose();});
    for(const geometry of r.geometry)geometry.dispose();
    for(const material of r.materials??[])material.dispose();for(const texture of r.textures??[])texture.dispose();
    this.active.delete(index);this.unloaded++;
  }
  dispose() {for(const i of [...this.active.keys()])this.remove(i);for(const mat of [this.road,this.wall,this.white,this.structure,this.debugMat])mat.dispose();this.signMaterial?.dispose();this.signTexture?.dispose();}
}
