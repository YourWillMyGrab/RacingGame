import {test} from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import {ModularRoute,RouteCursor} from '../src/road/route.ts';
import {connectRoad} from '../src/road/connect.ts';
import {validateConnection} from '../src/road/modules.ts';
import {RoadStream} from '../src/road/stream.ts';
import {Vehicle} from '../src/vehicle.ts';
import {Run} from '../src/run.ts';
import {STEP,DEFAULT_TUNING} from '../src/config.ts';
import {createEvent} from '../src/event/session.ts';
import {EventJourney} from '../src/event/journey.ts';
import {timeTargets} from '../src/event/rules.ts';
import {buildSettings,UPGRADES} from '../src/upgrades.ts';
import {IDLE} from '../src/race.ts';
import {drive} from './driver.ts';
await RAPIER.init();

function setup(seed:string){
  const run=new Run(seed),world=new RAPIER.World({x:0,y:-9.81,z:0});world.timestep=STEP;
  const road=new ModularRoute(run.routeSeed,run.moduleCount,run.routeOptions),scene=new THREE.Scene(),stream=new RoadStream(road,scene,world);stream.update(road.start);
  const car=new Vehicle(world,road,buildSettings([])),event=createEvent(run.eventType,road,world,car),journey=new EventJourney(run,world,car,road,event);
  return {run,world,road,scene,stream,car,journey};
}

test('connected roads preserve sockets, seeded targets, unique stations/IDs and fork cursors',()=>{
  for(let seed=0;seed<100;seed++){
    const road=new ModularRoute(`WORLD-${seed}`,14,{forks:true});
    for(const profile of ['technical','speed'] as const){
      const next=new ModularRoute(`NEXT-${seed}`,14,{forks:true,profile}),targets=timeTargets(next),oldEnd={...road.chunks.at(-1)!.exit},oldLength=road.length;
      connectRoad(road,next);assert.ok(validateConnection(oldEnd,next.chunks[0].entry));assert.deepEqual(timeTargets(next),targets);
      assert.deepEqual(next.validate(),[]);assert.deepEqual(road.validate(),[]);
      assert.equal(next.start,oldLength+25);assert.equal(next.pointAt(oldLength-5).s,oldLength);
      assert.equal(new Set(road.chunks.map(c=>c.index)).size,road.chunks.length);
      for(const c of next.chunks)assert.ok(c.points.every(p=>p.s>=c.start&&p.s<=c.end));
      const fork=next.chunks.find(c=>c.branches)!,cursor=next.cursor(),p=next.pointAt(fork.start+120,'right');
      cursor.nearest(p.x,p.z,p.s-2);assert.equal(cursor.choices.get(fork.index),'right');
      assert.throws(()=>connectRoad(road,next));
    }
  }
});

for(const seed of ['7F2C-A91D','MIXED-1'])test(`one world physically completes mixed journey ${seed}, transfers, rewards and disposal`,()=>{
  const {run,world,road,scene,stream,car,journey}=setup(seed),body=car.body,handle=body.handle;
  try{
    for(let index=0;index<3;index++){
      const event=journey.event!,fork=journey.route.chunks.find(c=>c.branches),cursor=car.route as RouteCursor;
      if(fork)cursor.plans.set(fork.index,index===0?'left':'right');
      for(let tick=0;tick<18000&&!event.complete;tick++){
        if(tick%10===0)stream.update(car.progress,event.racers.map(r=>r.vehicle.progress));
        journey.step(drive(journey.route,car),STEP);
        if(fork)for(const branch of cursor.choices.values())run.selectRoute(branch);
        if(event.started&&(car.progress>event.player.checkpoint+8||tick>300&&tick%300===0&&car.speed<1))journey.recover();
      }
      assert.ok(event.player.finishTime!==null,`event ${index} finished`);assert.ok(car.integrity>0);
      run.finish(event.result,car.integrity,car.flow);
      const pose={...body.translation()},rotation={...body.rotation()},resources=[car.integrity,car.flow];
      for(let i=0;i<120;i++){stream.update(car.progress,event.racers.map(r=>r.vehicle.progress));event.step(IDLE,STEP);}
      assert.deepEqual({...body.translation()},pose);assert.deepEqual({...body.rotation()},rotation);assert.deepEqual([car.integrity,car.flow],resources);
      if(index===2)break;
      const currentChunk=road.moduleAt(car.progress),chunkResources=stream.active.get(currentChunk.index),oldRivals=event.racers.slice(1).map(r=>r.vehicle.body);
      journey.choose(run.offers[0].id);stream.update(car.progress);
      assert.equal(stream.active.get(currentChunk.index),chunkResources);assert.equal(car.body,body);assert.equal(car.body.handle,handle);
      assert.deepEqual({...body.translation()},pose);assert.deepEqual({...body.rotation()},rotation);
      assert.deepEqual({...body.linvel()},{x:0,y:0,z:0});assert.deepEqual({...body.angvel()},{x:0,y:0,z:0});
      assert.deepEqual([car.integrity,car.flow],[run.integrity,run.flow]);assert.equal(world.bodies.len(),1);
      assert.ok(oldRivals.every(r=>!r.isValid()));assert.equal(journey.event,undefined);assert.throws(()=>journey.choose('armor'));
      assert.deepEqual(car.settings,buildSettings(run.owned));assert.ok(Math.abs(car.body.mass()-car.settings.mass)<.01);
      assert.equal(car.events.size,run.owned.filter(id=>UPGRADES.find(u=>u.id===id)!.hook).length);
      const resultCount=run.results.length,time=run.elapsed;let recovered=false,sawSeam=false;
      for(let tick=0;tick<3000&&journey.transferring;tick++){
        if(tick%10===0)stream.update(car.progress);
        // Recover on the newly connected side of the seam, before its start gate.
        if(!recovered&&car.progress>=journey.route.chunks[0].start+4){journey.recover();recovered=true;assert.equal(journey.hold,3);}
        if(car.progress>=journey.route.chunks[0].start)sawSeam=true;
        const before={...body.translation()};journey.step(drive(road,car),STEP);
        if(!journey.transferring)assert.ok(Math.hypot(body.translation().x-before.x,body.translation().z-before.z)<1,'start gate never teleports');
        assert.ok(car.integrity>0);assert.equal(run.elapsed,time);assert.equal(run.results.length,resultCount);
      }
      assert.ok(sawSeam&&recovered);assert.equal(journey.transferring,false);
      const next=journey.event!;assert.equal(next.elapsed,0);assert.equal(next.countdown,3);assert.equal(next.player.checkpoint,journey.route.start+40);
      assert.equal(world.bodies.len(),next.kind==='road-race'?6:1);
      const flow=car.flow,integrity=car.integrity;
      for(let i=0;i<120;i++)journey.step({...IDLE,throttle:1,boost:true},STEP);
      assert.equal(car.flow,flow);assert.equal(car.integrity,integrity);assert.equal(next.elapsed,0);
      stream.update(car.progress);assert.ok(!stream.active.has(0));
    }
    assert.equal(run.phase,'complete');assert.equal(run.owned.length,2);assert.equal(run.results.length,3);assert.equal(road.chunks.length,42);
    console.log('JOURNEY',seed,run.results.map(r=>({kind:r.kind,time:r.time})),world.bodies.len(),stream.unloaded);
  }finally{
    journey.dispose();assert.equal(car.events.size,0);stream.dispose();assert.equal(scene.children.length,0);
    assert.equal(world.colliders.len(),world.bodies.len());world.free();
  }
});

test('transfer wreck has no extra result/reward; in-place builds update mass without mutating defaults',()=>{
  const {run,world,stream,car,journey}=setup('FAIL-TRANSFER');
  try{
    car.applySettings(buildSettings(['armor']));assert.ok(Math.abs(car.body.mass()-DEFAULT_TUNING.mass*1.4)<.01);
    car.applySettings(buildSettings([]));assert.equal(car.body.mass(),DEFAULT_TUNING.mass);
    journey.event!.player.finishTime=90;run.finish({kind:'road-race',position:1,time:90},60,42);
    journey.choose(run.offers[0].id);car.integrity=0;journey.step(IDLE,STEP);
    assert.equal(run.phase,'failed');assert.equal(run.results.length,1);assert.deepEqual(run.offers,[]);
    const pose={...car.body.translation()};journey.step({...IDLE,throttle:1},STEP);assert.deepEqual({...car.body.translation()},pose);
    journey.dispose();run.reset();assert.deepEqual(run.owned,[]);assert.equal(run.integrity,100);assert.equal(run.flow,25);assert.equal(car.events.size,0);
  }finally{journey.dispose();stream.dispose();world.free();}
});
