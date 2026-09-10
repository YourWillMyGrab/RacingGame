import {test} from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import {ModularRoute} from '../src/road/route.ts';
import {RoadStream} from '../src/road/stream.ts';
import {Vehicle} from '../src/vehicle.ts';
import {Race,IDLE,advanceCheckpoint} from '../src/race.ts';
import {STEP} from '../src/config.ts';
await RAPIER.init();
test('checkpoint progress requires contiguous forward gate crossing',()=>{assert.equal(advanceCheckpoint(64,66,65,1000),145);assert.equal(advanceCheckpoint(50,200,65,1000),65);assert.equal(advanceCheckpoint(70,60,65,1000),65);assert.equal(advanceCheckpoint(64,64,65,1000),65);});
test('six physical racers stay on grid during countdown, race to finish and keep results',()=>{
 const world=new RAPIER.World({x:0,y:-9.81,z:0});world.timestep=STEP;const route=new ModularRoute('RACE-TEST',8),stream=new RoadStream(route,new THREE.Scene(),world);stream.update(25);const player=new Vehicle(world,route),race=new Race(route,world,player);
 try {
  assert.equal(world.bodies.len(),6);const start=race.racers.map(r=>({...r.vehicle.body.translation()}));
  for(let i=0;i<170;i++)race.step({...IDLE,throttle:1},STEP);
  assert.equal(race.started,false);for(const r of race.racers){assert.equal(r.vehicle.body.translation().x,start[r.id].x);assert.equal(r.vehicle.body.translation().z,start[r.id].z);}
  let finishedIntegrity:number|undefined;for(let i=0;i<8000 && race.order.length<6;i++){
   if(i%10===0)stream.update(player.progress,race.racers.map(r=>r.vehicle.progress));
   const p=player.body.translation(),target=route.pointAt(player.progress+12+player.speed*.22);let e=Math.atan2(-(target.x-p.x),-(target.z-p.z))-player.yaw;e=Math.atan2(Math.sin(e),Math.cos(e));
   race.step({throttle:.92,brake:0,steer:Math.max(-1,Math.min(1,e*2.4)),handbrake:false,boost:false},STEP); if(race.player.finishTime!==null){finishedIntegrity??=player.integrity;assert.equal(player.integrity,finishedIntegrity);}
  }
  assert.equal(race.order.length,6,JSON.stringify(race.racers.map(r=>({id:r.id,progress:r.vehicle.progress,health:r.vehicle.integrity,checkpoint:r.checkpoint}))));
  assert.equal(new Set(race.order.map(r=>r.id)).size,6);for(let i=1;i<6;i++)assert.ok(race.order[i].time>=race.order[i-1].time);
  const integrity=player.integrity;const order=JSON.stringify(race.order);for(let i=0;i<30;i++)race.step(IDLE,STEP);assert.equal(JSON.stringify(race.order),order);assert.equal(player.integrity,integrity);assert.ok(race.position>=1&&race.position<=6);
 }finally{stream.dispose();world.free();}
});
