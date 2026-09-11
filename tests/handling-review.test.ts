import {test} from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import {ModularRoute} from '../src/road/route.ts';
import {RoadStream} from '../src/road/stream.ts';
import {Vehicle} from '../src/vehicle.ts';
import {STEP} from '../src/config.ts';
import {drive} from './driver.ts';
await RAPIER.init();
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
