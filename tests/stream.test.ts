import { test } from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { ModularRoute } from '../src/road/route.ts';
import { RoadStream } from '../src/road/stream.ts';
import { Vehicle } from '../src/vehicle.ts';
import { STEP } from '../src/config.ts';
await RAPIER.init();

test('stream unloads physics/render resources, can reload behind and dispose to zero',()=>{
  const world=new RAPIER.World({x:0,y:-9.81,z:0}),scene=new THREE.Scene(),route=new ModularRoute('7F2C-A91D');
  const stream=new RoadStream(route,scene,world);
  try {
    stream.update(25);const initial=world.colliders.len();assert.ok(initial>0);
    for(let s=25;s<route.length;s+=90){stream.update(s);assert.ok(stream.active.size<=10);assert.ok(world.colliders.len()<1400);}
    assert.ok(stream.unloaded>10);stream.update(25);assert.equal(world.colliders.len(),initial);
    stream.dispose();assert.equal(world.colliders.len(),0);assert.equal(scene.children.length,0);
  }finally{world.free();}
});
test('ray suspension drives across seeded module seams, curves and height profiles',()=>{
  const route=new ModularRoute('7F2C-A91D',12),world=new RAPIER.World({x:0,y:-9.81,z:0}),scene=new THREE.Scene();world.timestep=STEP;
  const stream=new RoadStream(route,scene,world);stream.update(25);const car=new Vehicle(world,route);
  let maxHeight=0;
  try {
    for(let i=0;i<6000 && car.progress<route.length-40;i++) {
      if(i%10===0)stream.update(car.progress);
      const p=car.body.translation(),target=route.pointAt(car.progress+12+car.speed*.22);
      let error=Math.atan2(-(target.x-p.x),-(target.z-p.z))-car.yaw;error=Math.atan2(Math.sin(error),Math.cos(error));
      car.step({throttle:.85,brake:0,steer:Math.max(-1,Math.min(1,error*2.4)),handbrake:false,boost:false},STEP);world.step();car.afterStep();maxHeight=Math.max(maxHeight,p.y);
      assert.ok(Number.isFinite(car.speed));
    }
    assert.ok(car.progress>=route.length-40,`stopped at ${car.progress}/${route.length} y=${car.body.translation().y}`);
    assert.equal(car.integrity,100);assert.ok(maxHeight>2);
  }finally{stream.dispose();world.free();}
});

test('recovery searches backward when another body occupies the anchor',()=>{
  const route=new ModularRoute('RECOVERY',5),world=new RAPIER.World({x:0,y:-9.81,z:0}),scene=new THREE.Scene();
  const stream=new RoadStream(route,scene,world);stream.update(25);const car=new Vehicle(world,route);
  try {
    const p=route.pointAt(25);world.createCollider(RAPIER.ColliderDesc.cuboid(1.5,1,3).setTranslation(p.x,p.y+1,p.z));world.step();
    car.lastAnchor=25;car.recover();assert.ok(car.progress<25);assert.equal(car.recoveries,1);
    assert.ok(Math.abs(car.body.translation().z-p.z)>4);
  }finally{stream.dispose();world.free();}
});

test('airborne progress crosses road gates continuously while recovery anchor remains on ground',()=>{
 const route=new ModularRoute('AIR-GATE',5),world=new RAPIER.World({x:0,y:-9.81,z:0}),scene=new THREE.Scene(),stream=new RoadStream(route,scene,world);stream.update(25);const car=new Vehicle(world,route);
 try{const p=route.pointAt(64);car.body.setTranslation({x:p.x,y:5,z:p.z},true);car.progress=64;car.lastAnchor=25;car.body.setLinvel({x:0,y:0,z:-25},true);let previous=car.progress;for(let i=0;i<12;i++){car.step({throttle:0,brake:0,steer:0,handbrake:false,boost:false},STEP);world.step();assert.ok(car.progress-previous<=2.01);previous=car.progress;}assert.ok(car.progress>65);assert.equal(car.lastAnchor,25);}finally{stream.dispose();world.free();}
});
