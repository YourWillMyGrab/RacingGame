import * as THREE from 'three';
export function createCar(color=0xff704a) {
  const root=new THREE.Group(), body=new THREE.Group(); root.add(body);
  const paint=new THREE.MeshStandardMaterial({color,metalness:.48,roughness:.28});
  const dark=new THREE.MeshStandardMaterial({color:0x08171d,metalness:.35,roughness:.35});
  const glass=new THREE.MeshStandardMaterial({color:0x386c7a,metalness:.8,roughness:.16});
  function box(w:number,h:number,d:number,x:number,y:number,z:number,mat:THREE.Material) { const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);body.add(mesh);return mesh; }
  box(1.85,.42,3.95,0,0,0,paint); box(1.72,.2,1.35,0,.28,-1.12,paint);
  box(1.5,.55,1.7,0,.44,.15,glass);box(1.52,.08,1.1,0,.75,.3,paint);
  box(1.8,.13,.15,0,.45,1.7,dark);box(1.8,.16,.24,0,-.13,-1.99,dark);
  box(.18,.025,3.9,-.24,.22,0,dark);box(.18,.025,3.9,.24,.22,0,dark);
  const tail=new THREE.MeshBasicMaterial({color:0xff2344}), light=new THREE.MeshBasicMaterial({color:0xc0f9ff});
  for(const x of [-.61,.61]) {box(.47,.1,.04,x,.07,-2,light);box(.5,.09,.04,x,.1,2,tail);}
  const wheels:THREE.Mesh[]=[];
  for(const x of [-.94,.94]) for(const z of [-1.3,1.3]) {
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.26,16),dark);wheel.rotation.z=Math.PI/2;wheel.position.set(x,-.28,z);root.add(wheel);wheels.push(wheel);
  }
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(2.3,4.5),new THREE.MeshBasicMaterial({color:0x30dec9,transparent:true,opacity:.13,depthWrite:false}));glow.rotation.x=-Math.PI/2;glow.position.y=-.48;root.add(glow);
  return {root,body,wheels};
}
