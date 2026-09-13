import {test} from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import {ModularRoute,RouteCursor} from '../src/road/route.ts';
import {RoadStream} from '../src/road/stream.ts';
import {Vehicle} from '../src/vehicle.ts';
import {Run} from '../src/run.ts';
import {Race} from '../src/race.ts';
import {STEP} from '../src/config.ts';
import {drive} from './driver.ts';
await RAPIER.init();

test('seeded split/merge validates both arms and profiles preserve braking sectors',()=>{
 for(let i=0;i<1000;i++){
  const profile=(['balanced','technical','speed'] as const)[i%3],a=new ModularRoute(`FORK-${i}`,12,{forks:true,profile}),b=new ModularRoute(`FORK-${i}`,12,{forks:true,profile});
  assert.deepEqual(a.points,b.points);assert.equal(a.validate().length,0);assert.ok(a.chunks.filter(c=>c.definition.difficulty===3).length>=3);
  const fork=a.chunks.find(c=>c.branches)!;assert.ok(fork.start>400);assert.equal(fork.definition.minWidth,12);assert.ok(fork.definition.curvature>0);assert.equal(fork.branches!.left.length,fork.branches!.right.length);
 }
});
for(const branch of ['left','right'] as const)test(`physical ${branch} arm completes, keeps recovery on its arm and unloads`,()=>{
 const road=new ModularRoute('7F2C-A91D',12,{forks:true}),world=new RAPIER.World({x:0,y:-9.81,z:0}),scene=new THREE.Scene(),stream=new RoadStream(road,scene,world);world.timestep=STEP;stream.update(25);
 const car=new Vehicle(world,road),cursor=car.route as RouteCursor,fork=road.chunks.find(c=>c.branches)!;cursor.plans.set(fork.index,branch);let recovered=false,minContacts=4,recoveryTick=-1000;
 try{
  for(let tick=0;tick<9000&&car.progress<road.length-40;tick++){
   if(tick%10===0)stream.update(car.progress);
   car.step(drive(road,car),STEP);world.step();car.afterStep();
   if(car.progress>fork.start+90&&car.progress<fork.end-90){if(tick-recoveryTick>60)minContacts=Math.min(minContacts,car.contacts);assert.equal(cursor.choices.get(fork.index),branch);if(!recovered){const s=car.lastAnchor;car.recover();recovered=true;recoveryTick=tick;const p=road.pointAt(s,branch);assert.ok(Math.hypot(car.body.translation().x-p.x,car.body.translation().z-p.z)<.01);}}
  }
  console.log('FORK DRIVE',branch,car.progress,car.integrity,car.recoveries);
  assert.ok(car.progress>=road.length-40);assert.equal(cursor.choices.get(fork.index),branch);assert.ok(recovered);assert.equal(car.integrity,100);assert.ok(minContacts>=2);assert.equal(car.recoveries,1);
  const other=road.pointAt(fork.start+150,branch==='left'?'right':'left');assert.ok(cursor.nearest(other.x,other.z,fork.start+150).distance>20);assert.equal(cursor.choices.get(fork.index),branch);
 }finally{stream.dispose();world.removeRigidBody(car.body);assert.equal(world.colliders.len(),0);assert.equal(scene.children.length,0);world.free();}
});
test('route choice changes the next seeded event once; reset clears history and profiles',()=>{
 const a=new Run('CHOICE'),b=new Run('CHOICE');assert.ok(a.selectRoute('left'));assert.equal(a.selectRoute('right'),false);assert.ok(b.selectRoute('right'));
 for(const run of [a,b]){run.finish({kind:'road-race',position:1,time:90},100,60);run.choose(run.offers[0].id);}
 assert.equal(a.profile,'technical');assert.equal(b.profile,'speed');assert.notEqual(a.routeSeed,b.routeSeed);
 const technical=new ModularRoute(a.routeSeed,a.moduleCount,a.routeOptions),speed=new ModularRoute(b.routeSeed,b.moduleCount,b.routeOptions);
 assert.ok(technical.chunks.some(c=>c.definition.id==='harbor-switchbacks'));assert.ok(speed.chunks.some(c=>c.definition.id==='coastal-express'));assert.equal(a.routeChoices.length,1);
 a.reset();assert.deepEqual(a.routeChoices,[]);assert.equal(a.profile,'balanced');assert.equal(a.nextProfile,'balanced');
});
test('fork collision has two supported carriageways and an actual gap in the island',()=>{
 const road=new ModularRoute('SURFACE',12,{forks:true}),world=new RAPIER.World({x:0,y:-9.81,z:0}),stream=new RoadStream(road,new THREE.Scene(),world),fork=road.chunks.find(c=>c.branches)!;
 try{stream.update(fork.start+150);world.step();for(let s=fork.start;s<=fork.end;s+=10)for(const branch of ['left','right'] as const)for(const offset of [-5.5,0,5.5]){const p=road.pointAt(s,branch),hit=world.castRay(new RAPIER.Ray({x:p.x+Math.cos(p.yaw)*offset,y:3,z:p.z-Math.sin(p.yaw)*offset},{x:0,y:-1,z:0}),5,true);assert.ok(hit);assert.ok(Math.abs(hit.timeOfImpact-3)<.05);}
  const a=road.pointAt(fork.start+150,'left'),b=road.pointAt(fork.start+150,'right');assert.equal(world.castRay(new RAPIER.Ray({x:(a.x+b.x)/2,y:3,z:(a.z+b.z)/2},{x:0,y:-1,z:0}),5,true),null);
 }finally{stream.dispose();world.free();}
});
test('six physical racers independently follow both fork arms and finish in order',()=>{
 const road=new ModularRoute('FORK-AI',12,{forks:true}),world=new RAPIER.World({x:0,y:-9.81,z:0}),stream=new RoadStream(road,new THREE.Scene(),world);world.timestep=STEP;stream.update(25);const car=new Vehicle(world,road),race=new Race(road,world,car),fork=road.chunks.find(c=>c.branches)!;
 try{for(let tick=0;tick<16000&&race.order.length<6;tick++){if(tick%10===0)stream.update(car.progress,race.racers.map(r=>r.vehicle.progress));race.step(drive(road,car),STEP);if(tick%300===0&&race.started&&race.player.finishTime===null&&(car.speed<1||car.progress>race.player.checkpoint+8))race.recover();}
  console.log('FORK RACE',race.racers.map(r=>({id:r.id,finish:r.finishTime,choice:(r.vehicle.route as RouteCursor).choices.get(fork.index),integrity:r.vehicle.integrity})));
  assert.equal(race.order.length,6);const choices=race.racers.map(r=>(r.vehicle.route as RouteCursor).choices.get(fork.index));assert.ok(choices.includes('left')&&choices.includes('right'));assert.ok(choices.every(Boolean));assert.equal(new Set(race.order.map(r=>r.id)).size,6);
 }finally{stream.dispose();world.free();}
});
