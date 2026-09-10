import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { ModularRoute, type PlacedModule } from './route';

interface ChunkResources { group: THREE.Group; colliders: RAPIER.Collider[]; geometry: THREE.BufferGeometry[]; debug: THREE.Group }
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
  private remove(index:number) {
    const r=this.active.get(index)!;
    for(const collider of r.colliders)this.world.removeCollider(collider,true);
    this.scene.remove(r.group);
    r.group.traverse(object=>{if(object instanceof THREE.InstancedMesh)object.dispose();});
    for(const geometry of r.geometry)geometry.dispose();
    this.active.delete(index);this.unloaded++;
  }
  dispose() {for(const i of [...this.active.keys()])this.remove(i);for(const mat of [this.road,this.wall,this.white,this.structure,this.debugMat])mat.dispose();}
}
