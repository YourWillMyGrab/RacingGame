import {test} from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import {ModularRoute} from '../src/road/route.ts';
import {RoadStream} from '../src/road/stream.ts';
import {Vehicle} from '../src/vehicle.ts';
import {STEP,DEFAULT_TUNING} from '../src/config.ts';
import {drive} from './driver.ts';
await RAPIER.init();
test('normal high-speed steering holds grip and lateral motion is caught quickly',()=>{
 const world=new RAPIER.World({x:0,y:-9.81,z:0});world.timestep=STEP;
 world.createCollider(RAPIER.ColliderDesc.cuboid(500,.5,500).setTranslation(0,-.5,0));
 const car=new Vehicle(world,undefined,{...DEFAULT_TUNING}),idle={throttle:0,brake:0,steer:0,handbrake:false,boost:false};
 try{
  for(let i=0;i<90;i++){car.step(idle,STEP);world.step();car.afterStep();}
  car.body.setLinvel({x:3,y:0,z:-25},true);
  for(let i=0;i<18;i++){car.step(idle,STEP);world.step();car.afterStep();}
  assert.ok(Math.abs(car.body.linvel().x)<.25,'catch sideways velocity within 300 ms');
  let maxSlip=0;
  for(let i=0;i<120;i++){car.step({...idle,throttle:.6,steer:.65},STEP);world.step();car.afterStep();maxSlip=Math.max(maxSlip,Math.abs(car.slip));}
  console.log('NORMAL CORNER MAX SLIP',maxSlip);
  assert.ok(maxSlip<.12,'ordinary steering must not trigger a long uncontrolled slide');
 }finally{world.free();}
});
test('braking beats full throttle through guaranteed technical sectors; clean driving earns usable Flow',()=>{
  function trial(braking:boolean){
    const route=new ModularRoute('3B44-0E69',8),world=new RAPIER.World({x:0,y:-9.81,z:0}),stream=new RoadStream(route,new THREE.Scene(),world);world.timestep=STEP;stream.update(25);const car=new Vehicle(world,route);let brakeSeconds=0;
    try{for(let i=0;i<6000&&car.progress<route.length-40;i++){if(i%10===0)stream.update(car.progress);const controls=drive(route,car,braking);if(controls.brake>0)brakeSeconds+=STEP;car.step(controls,STEP);world.step();car.afterStep();}return {progress:car.progress,integrity:car.integrity,flow:car.flowEarned,brakeSeconds,length:route.length};}finally{stream.dispose();world.free();}
  }
  const careful=trial(true),flat=trial(false);console.log('HANDLING COMPARISON',JSON.stringify({careful,flat}));
  assert.ok(careful.progress>=careful.length-40);assert.ok(careful.brakeSeconds>1);
  assert.ok(careful.integrity>flat.integrity+10||careful.progress>flat.progress+200);
  assert.ok(careful.flow>35,'unupgraded clean driving must earn meaningful Flow');
});
test('every race has spaced braking sectors with narrow centres and advance warning distance',()=>{
  for(let i=0;i<100;i++){const route=new ModularRoute(`REVIEW-${i}`,12),technical=route.chunks.filter(c=>c.definition.difficulty===3);assert.ok(technical.length>=3);for(const c of technical){assert.ok(c.start>=190);assert.ok(c.definition.recommendedSpeed<18);assert.ok(Math.abs(route.pointAt(c.start+c.definition.length/2).width-12)<.02);assert.ok(route.speedAt(c.start-30)<30);}}
});
