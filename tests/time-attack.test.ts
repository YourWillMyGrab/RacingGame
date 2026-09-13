import {test} from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import {ModularRoute,RouteCursor} from '../src/road/route.ts';
import {RoadStream} from '../src/road/stream.ts';
import {Vehicle} from '../src/vehicle.ts';
import {Run} from '../src/run.ts';
import {STEP} from '../src/config.ts';
import {IDLE} from '../src/race.ts';
import {TimeAttack} from '../src/event/time-attack.ts';
import {createEvent,eventView} from '../src/event/session.ts';
import {eventSchedule,timeTargets,timeBand,timedResult,BAND_POSITION} from '../src/event/rules.ts';
import {attachBuild,buildSettings,rewardChoices} from '../src/upgrades.ts';
import {drive} from './driver.ts';
await RAPIER.init();

test('seeded schedule guarantees both modes, a timed reward, and variable finales',()=>{
 const finales=new Set();
 for(let i=0;i<1000;i++) {
  const schedule=eventSchedule(`EVENT-${i}`);assert.deepEqual(schedule,eventSchedule(`EVENT-${i}`));
  assert.equal(schedule[0],'road-race');assert.equal(schedule[1],'time-attack');assert.equal(schedule.length,3);finales.add(schedule[2]);
 }
 assert.equal(finales.size,2);
});
test('targets follow road/profile, reproduce exactly and have inclusive distinct boundaries',()=>{
 const values=new Set();
 for(const profile of ['balanced','technical','speed'] as const) {
  const road=new ModularRoute('TARGETS',14,{forks:true,profile}),targets=timeTargets(road);
  assert.deepEqual(targets,timeTargets(new ModularRoute('TARGETS',14,{forks:true,profile})));values.add(targets.gold);
  assert.ok(targets.gold>0&&targets.gold<targets.silver&&targets.silver<targets.bronze);
  assert.equal(timeBand(targets.gold,targets),'gold');assert.equal(timeBand(targets.gold+.001,targets),'silver');
  assert.equal(timeBand(targets.silver,targets),'silver');assert.equal(timeBand(targets.silver+.001,targets),'bronze');
  assert.equal(timeBand(targets.bronze,targets),'bronze');assert.equal(timeBand(targets.bronze+.001,targets),'over-target');
  assert.throws(()=>timeBand(NaN,targets));assert.throws(()=>timeBand(-1,targets));assert.throws(()=>timeBand(Infinity,targets));
 }
 assert.equal(values.size,3);
});
test('all timed bands use existing rewards/repair and timeout continues; wreck/invalid/duplicate results do not',()=>{
 const targets={gold:60,silver:70,bronze:80};
 for(const time of [60,70,80,1000])for(const integrity of [1,50,99]) {
  const run=new Run('BANDS');run.finish({kind:'road-race',position:1,time:90},80,40);run.choose(run.offers[0].id);
  const result=timedResult(time,targets);run.finish(result,integrity,33);
  assert.equal(run.phase,'reward');assert.equal(run.flow,33);assert.equal(run.integrity,Math.min(100,Math.max(1,integrity+(result.position<=3?8:-8))));
  assert.deepEqual(run.offers,rewardChoices(run.seed,1,BAND_POSITION[result.band],run.owned));assert.deepEqual(run.results[1],result);
  assert.throws(()=>run.finish(result,100,100));
  if(result.position>3)assert.ok(run.offers.every(u=>['Common','Uncommon'].includes(u.rarity)));
 }
 const run=new Run('WRECK');assert.throws(()=>run.finish(timedResult(20,targets),80,25));
 run.finish({kind:'road-race',position:1,time:90},80,40);run.choose(run.offers[0].id);
 assert.throws(()=>run.finish({...timedResult(70,targets),band:'gold'},80,25));
 run.finish(timedResult(30,targets),0,0);assert.equal(run.phase,'failed');assert.deepEqual(run.offers,[]);
 run.reset();assert.equal(run.eventType,'road-race');assert.deepEqual(run.results,[]);
});
test('Time Attack countdown locks resources; recovery counts once, missed gates cannot finish, and wreck freezes',()=>{
 const world=new RAPIER.World({x:0,y:-9.81,z:0}),road=new ModularRoute('CLOCK',12,{forks:true}),stream=new RoadStream(road,new THREE.Scene(),world);stream.update(25);world.timestep=STEP;
 const car=new Vehicle(world,road),event=new TimeAttack(road,world,car);car.flow=63;car.integrity=72;
 try {
  assert.equal(world.bodies.len(),1);
  for(let i=0;i<180;i++)event.step({...IDLE,throttle:1,boost:true},STEP);
  assert.equal(event.elapsed,0);assert.equal(car.flow,63);assert.equal(car.integrity,72);
  while(!event.started)event.step(IDLE,STEP);
  car.progress=200;car.lastAnchor=200;event.player.checkpoint=145;event.recover();assert.ok(car.progress<145);
  const before=event.elapsed;
  for(let i=0;i<180;i++)event.step(IDLE,STEP);
  assert.ok(Math.abs(event.elapsed-before-3)<1e-8);assert.equal(event.player.finishTime,null);assert.equal(car.recoveries,1);
  // Crossing the finish without preceding ordered gates must not complete.
  const p=road.pointAt(event.finish);car.body.setTranslation({x:p.x,y:p.y+1,z:p.z},true);car.progress=event.finish;event.player.previous=event.finish-2;
  event.step(IDLE,STEP);assert.equal(event.player.finishTime,null);
  event.elapsed=event.targets.bronze+1;assert.equal(event.complete,false);assert.equal(event.result.band,'over-target');
  car.integrity=0;const elapsed=event.elapsed;event.step(IDLE,STEP);assert.equal(event.elapsed,elapsed);assert.equal(event.complete,true);
 }finally{stream.dispose();world.free();}
});
for(const branch of ['left','right'] as const)test(`Time Attack physical ${branch} fork drive, recovery, build, outcome and frozen finish`,()=>{
 const road=new ModularRoute('7F2C-A91D',14,{forks:true,profile:branch==='left'?'technical':'speed'}),world=new RAPIER.World({x:0,y:-9.81,z:0}),stream=new RoadStream(road,new THREE.Scene(),world);stream.update(25);world.timestep=STEP;
 const car=new Vehicle(world,road,buildSettings(['capacitor','impact-cell'])),detach=attachBuild(car,['capacitor','impact-cell']),event=new TimeAttack(road,world,car),fork=road.chunks.find(c=>c.branches)!;
 const cursor=car.route as RouteCursor;cursor.plans.set(fork.index,branch);let recovered=false,boostTicks=0;
 try {
  assert.deepEqual(event.targets,timeTargets(road));
  for(let tick=0;tick<15000&&!event.complete;tick++) {
   if(tick%10===0)stream.update(car.progress);
   const controls=drive(road,car);controls.boost=road.speedAt(car.progress)>30&&car.flow>20&&Math.abs(controls.steer)<.1;
   if(car.boosting)boostTicks++;
   event.step(controls,STEP);
   if(!recovered&&car.progress>fork.start+100&&car.progress<fork.end-60){event.recover();recovered=true;}
   assert.ok(car.integrity>0);
  }
  assert.ok(event.player.finishTime!==null);assert.ok(recovered);assert.equal(cursor.choices.get(fork.index),branch);assert.equal(car.recoveries,1);
  assert.ok(boostTicks>0);assert.ok(car.flowEarned>0);assert.ok(event.result.time<=event.targets.bronze,'base-derived goals are reachable by a braking driver with one recovery');
  assert.equal(event.result.position,BAND_POSITION[event.result.band]);assert.deepEqual(eventView(event).standings,[]);assert.match(eventView(event).objective,/Oro.*Argento.*Bronzo/);
  const final={time:event.elapsed,flow:car.flow,integrity:car.integrity,result:event.result};
  for(let i=0;i<180;i++)event.step({...IDLE,throttle:1,boost:true},STEP);
  assert.deepEqual({time:event.elapsed,flow:car.flow,integrity:car.integrity,result:event.result},final);
  console.log('TIME ATTACK',branch,JSON.stringify(event.result));
 }finally{detach();assert.equal(car.events.size,0);stream.dispose();world.free();}
});
test('mixed run transfers branches/resources/builds through factory, supports either finale and resets',()=>{
 for(const seed of ['MIXED-0','MIXED-1','MIXED-2']) {
  const run=new Run(seed),initialRoad=run.routeSeed;
  for(let index=0;index<3;index++) {
   const road=new ModularRoute(run.routeSeed,run.moduleCount,run.routeOptions),world=new RAPIER.World({x:0,y:-9.81,z:0}),car=new Vehicle(world,road,buildSettings(run.owned));
   const event=createEvent(run.eventType,road,world,car);car.integrity=run.integrity;car.flow=run.flow;
   try {
    assert.equal(event.racers.length,event.kind==='road-race'?6:1);assert.equal(road.options.profile,index===0?'balanced':index===1?'technical':'speed');
    if(index<2)assert.ok(run.selectRoute(index===0?'left':'right'));else assert.equal(run.selectRoute('left'),false);
    run.finish(event.kind==='road-race'?{kind:'road-race',position:3,time:90}:timedResult(event.targets.silver,event.targets),70-index*10,42+index);
    if(index<2){assert.equal(run.integrity,78-index*10);run.choose(run.offers[0].id);assert.equal(run.owned.length,index+1);}
    else{assert.equal(run.phase,'complete');assert.equal(run.integrity,50);assert.deepEqual(run.offers,[]);}
   }finally{world.free();}
  }
  run.reset();assert.equal(run.routeSeed,initialRoad);assert.equal(run.integrity,100);assert.equal(run.flow,25);assert.deepEqual(run.owned,[]);assert.deepEqual(run.routeChoices,[]);assert.deepEqual(run.results,[]);
 }
});
