import {test} from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import {ModularRoute} from '../src/road/route';
import {connectRoad} from '../src/road/connect';
import {RoadStream} from '../src/road/stream';
import {Vehicle} from '../src/vehicle';
import {STEP,DEFAULT_TUNING} from '../src/config';
import {IDLE,Race} from '../src/race';
import {FaroTactics} from '../src/special-rival';
import {CoastVfx,soundLevels} from '../src/coast-effects';
import {drive} from './driver';
await RAPIER.init();

test('coast hazards are seeded, signposted, absent from forks/tunnels/finish and survive connected placement',()=>{
  for(let seed=0;seed<100;seed++){
    const a=new ModularRoute(`COAST-${seed}`,12,{forks:true}),b=new ModularRoute(a.seed,12,{forks:true});
    assert.deepEqual(a.chunks.map(c=>c.wind),b.chunks.map(c=>c.wind));
    assert.ok(a.chunks.some(c=>c.wind));
    for(const c of a.chunks)if(c.wind){assert.ok(c.wind.from>=70);assert.ok(c.wind.to<c.definition.length);assert.ok(!c.branches&&!c.definition.flags.tunnel);assert.notEqual(c.definition.category,'finish');assert.equal(a.windAt(c.start+c.wind.from),0);assert.ok(a.windZone(c.start+c.wind.from-70));}
    const before=b.chunks.map(c=>c.wind?b.windAt(c.start+(c.wind.from+c.wind.to)/2):0),station=a.length;
    connectRoad(a,b);
    assert.deepEqual(b.chunks.map(c=>c.wind?b.windAt(c.start+(c.wind.from+c.wind.to)/2):0),before);
    for(const c of b.chunks)if(c.wind){const s=c.start+(c.wind.from+c.wind.to)/2;assert.equal(a.cursor().windAt(s),b.cursor().windAt(s));assert.ok(s>station);}
  }
});

test('Rapier wind displaces the grounded car in the sign direction; calm, air and recovery clear exposure',()=>{
  function simulate(direction:-1|0|1){
    const route=new ModularRoute('WIND-PHYSICS',5),world=new RAPIER.World({x:0,y:-9.81,z:0}),scene=new THREE.Scene();world.timestep=STEP;
    const stream=new RoadStream(route,scene,world);stream.update(100);const car=new Vehicle(world,route,{...DEFAULT_TUNING});
    const zone=route.chunks[0].wind!;zone.direction=direction===-1?-1:1;zone.strength=direction?4.5:0;
    car.lastAnchor=104;car.recover();const x=car.body.translation().x;
    try{
      for(let i=0;i<180;i++){car.step(IDLE,STEP);world.step();car.afterStep();}
      const delta=car.body.translation().x-x;assert.equal(car.integrity,100);assert.ok(car.grounded);
      car.lastAnchor=25;car.recover();assert.equal(car.wind,0);car.step(IDLE,STEP);assert.equal(car.wind,0);
      const p=route.pointAt(104);car.progress=104;car.body.setTranslation({...p,y:10},true);world.step();car.step(IDLE,STEP);assert.equal(car.wind,0);
      return delta;
    }finally{stream.dispose();world.free();}
  }
  const calm=simulate(0),left=simulate(-1),right=simulate(1);
  console.log('WIND displacement after 3 s (m)',{calm,left,right});
  assert.ok(Math.abs(calm)<.01);assert.ok(left<-.5&&right>.5);assert.ok(Math.abs(left+right)<.02);
});

test('Faro bursts are bounded, interrupted by danger and require a cooldown',()=>{
  const tactics=new FaroTactics();assert.equal(tactics.step(false,STEP),'reading');
  assert.equal(tactics.step(true,STEP),'attack');assert.equal(tactics.attacks,1);
  assert.equal(tactics.step(false,STEP),'cooldown');
  for(let i=0;i<299;i++)assert.equal(tactics.step(true,STEP),'cooldown');
  for(let i=0;i<3;i++)tactics.step(true,STEP);
  assert.equal(tactics.phase,'attack');assert.equal(tactics.attacks,2);
  for(let i=0;i<151;i++)tactics.step(true,STEP);assert.equal(tactics.phase,'cooldown');
});

test('special opponent physically spends Flow during attacks and finishes a fork race reproducibly',()=>{
  function run(){
    const route=new ModularRoute('FARO-RACE',12,{forks:true}),world=new RAPIER.World({x:0,y:-9.81,z:0}),scene=new THREE.Scene();world.timestep=STEP;
    const stream=new RoadStream(route,scene,world);stream.update(25);const car=new Vehicle(world,route,{...DEFAULT_TUNING}),race=new Race(route,world,car),faro=race.racers[5];let boostSteps=0;
    try{
      assert.equal(faro.name,'FARO');assert.equal(race.racers.filter(r=>r.special).length,1);
      for(let i=0;i<12000&&faro.finishTime===null;i++){stream.update(car.progress,race.racers.map(r=>r.vehicle.progress));race.step(drive(route,car),STEP);if(faro.vehicle.boosting)boostSteps++;}
      assert.ok(faro.finishTime!==null);assert.ok(boostSteps>10);assert.ok(faro.special!.attacks>0);assert.ok(faro.vehicle.integrity>0);
      return {finish:faro.finishTime,boostSteps,attacks:faro.special!.attacks,integrity:faro.vehicle.integrity};
    }finally{stream.dispose();world.free();}
  }
  const result=run();assert.deepEqual(run(),result);console.log('FARO physical race',result);
});

test('audio channels mute in inactive states; bounded VFX pause/reset/dispose without changing the car',()=>{
  const car={speed:30,wind:4,boosting:true,impact:.5,drifting:false} as Vehicle;
  const silent=soundLevels(car,false);assert.equal(silent.engine+silent.wind+silent.boost+silent.impact,0);
  const active=soundLevels(car,true);assert.ok(active.engine>0&&active.wind>0&&active.boost>0&&active.impact>0);
  const scene=new THREE.Scene(),fx=new CoastVfx(scene),before={...car};
  for(let i=0;i<1000;i++)fx.update(car,{x:0,y:1,z:0,yaw:0},STEP,true);
  assert.equal(fx.mesh.count,64);assert.ok(fx.emitted>64);assert.ok(fx.mesh.visible);assert.deepEqual(car,before);
  const emitted=fx.emitted;fx.update(car,{x:0,y:1,z:0,yaw:0},1,false);assert.equal(fx.emitted,emitted);assert.equal(fx.mesh.visible,false);
  fx.reset();assert.equal(fx.emitted,0);fx.dispose();assert.equal(scene.children.length,0);
});
