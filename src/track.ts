import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

export const TRACK = { radius: 64, halfStraight: 95, width: 20 };
export const TRACK_LENGTH = 4 * TRACK.halfStraight + 2 * Math.PI * TRACK.radius;
export function trackPoint(s: number) {
  const { radius: r, halfStraight: h } = TRACK;
  s = ((s % TRACK_LENGTH) + TRACK_LENGTH) % TRACK_LENGTH;
  if (s < 2*h) return { x: r, z: h-s, yaw: 0 };
  s -= 2*h;
  if (s < Math.PI*r) { const a = s/r; return { x: r*Math.cos(a), z: -h-r*Math.sin(a), yaw: a }; }
  s -= Math.PI*r;
  if (s < 2*h) return { x: -r, z: -h+s, yaw: Math.PI };
  s -= 2*h;
  const a = s/r;
  return { x: -r*Math.cos(a), z: h+r*Math.sin(a), yaw: Math.PI+a };
}
export function nearestAnchor(x: number, z: number) {
  let best = 0, distance = Infinity;
  for (let s = 0; s < TRACK_LENGTH; s += 3) {
    const p = trackPoint(s), d = (p.x-x)**2+(p.z-z)**2;
    if (d < distance) { best = s; distance = d; }
  }
  return { ...trackPoint(best), s: best, distance: Math.sqrt(distance) };
}
export function buildTrack(scene: THREE.Scene, world: RAPIER.World) {
  const road = new THREE.MeshStandardMaterial({ color: 0x25333e, roughness: .86 });
  const stripe = new THREE.MeshStandardMaterial({ color: 0x8aabb4, emissive: 0x16333a });
  const barriers = [new THREE.MeshStandardMaterial({ color: 0x22dbc6, emissive: 0x096b66 }), new THREE.MeshStandardMaterial({ color: 0xff7348, emissive: 0x792915 })];
  const n = 260, ds = TRACK_LENGTH/n;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(2200,2200), new THREE.MeshStandardMaterial({ color: 0x0d262d, roughness: 1 }));
  ground.rotation.x = -Math.PI/2; ground.position.y = -.27; scene.add(ground);
  world.createCollider(RAPIER.ColliderDesc.cuboid(1100,.2,1100).setTranslation(0,-.45,0));
  const asphalt = new THREE.InstancedMesh(new THREE.BoxGeometry(TRACK.width,.35,ds+.3),road,n);
  const lines = new THREE.InstancedMesh(new THREE.BoxGeometry(.16,.025,1.8),stripe,n);
  const walls = barriers.map(mat => new THREE.InstancedMesh(new THREE.BoxGeometry(.55,1.1,ds+.15),mat,n));
  const dummy = new THREE.Object3D();
  for (let i=0;i<n;i++) {
    const p=trackPoint(i*ds);
    dummy.position.set(p.x,-.175,p.z); dummy.rotation.set(0,p.yaw,0); dummy.updateMatrix(); asphalt.setMatrixAt(i,dummy.matrix);
    dummy.position.y=.025; dummy.updateMatrix(); lines.setMatrixAt(i,dummy.matrix);
    world.createCollider(RAPIER.ColliderDesc.cuboid(TRACK.width/2,.175,ds/2+.15).setTranslation(p.x,-.175,p.z).setRotation({x:0,y:Math.sin(p.yaw/2),z:0,w:Math.cos(p.yaw/2)}).setFriction(.1));
    for (let side=0;side<2;side++) {
      const offset=(side===0?-1:1)*(TRACK.width/2+.4);
      const x=p.x+Math.cos(p.yaw)*offset, z=p.z-Math.sin(p.yaw)*offset;
      dummy.position.set(x,.55,z); dummy.updateMatrix(); walls[side].setMatrixAt(i,dummy.matrix);
      world.createCollider(RAPIER.ColliderDesc.cuboid(.275,.55,ds/2+.075).setTranslation(x,.55,z).setRotation({x:0,y:Math.sin(p.yaw/2),z:0,w:Math.cos(p.yaw/2)}).setFriction(.05).setRestitution(.15));
    }
  }
  scene.add(asphalt,lines,...walls);
  const buildings = new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0x173943,roughness:.7}),70);
  for(let i=0;i<70;i++) {
    const a=i/70*Math.PI*2, radius=240+(i%5)*19, h=12+(i*17%61);
    dummy.position.set(Math.cos(a)*radius,h/2,Math.sin(a)*radius); dummy.rotation.set(0,a,0); dummy.scale.set(15,h,18); dummy.updateMatrix(); buildings.setMatrixAt(i,dummy.matrix);
  }
  scene.add(buildings);
  const start = new THREE.Group();
  for(let row=0;row<2;row++) for(let col=0;col<10;col++) {
    const tile=new THREE.Mesh(new THREE.BoxGeometry(2,.03,1),new THREE.MeshBasicMaterial({color:(row+col)%2?0x111c23:0xdff8f3})); tile.position.set(55+col*2,.035,70+row); start.add(tile);
  }
  scene.add(start);
}
