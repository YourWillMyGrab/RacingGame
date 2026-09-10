import {test} from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {EventBus} from '../src/events.ts';
import {Run} from '../src/run.ts';
import {UPGRADES,rewardChoices,buildSettings,attachBuild} from '../src/upgrades.ts';
import {Vehicle} from '../src/vehicle.ts';
import {DEFAULT_TUNING} from '../src/config.ts';
import {IDLE} from '../src/race.ts';
await RAPIER.init();
test('rewards are deterministic, unique, never empty in a legal run; low places obey rarity limits',()=>{
 for(let i=0;i<100;i++)for(let place=1;place<=6;place++){
  const run=new Run(`REWARD-${i}`);
  for(let e=0;e<2;e++){run.finish(place,60,90,20);assert.equal(run.offers.length,3);assert.equal(new Set(run.offers.map(u=>u.id)).size,3);assert.deepEqual(run.offers,rewardChoices(run.seed,e,place,run.owned));if(place>3)assert.ok(run.offers.every(u=>['Common','Uncommon'].includes(u.rarity)));run.choose(run.offers[0].id);}
  run.finish(place,60,90,20);assert.equal(run.phase,'complete');assert.equal(run.owned.length,2);
 }
 for(const u of UPGRADES.filter(u=>u.rarity==='Cursed'))assert.ok(u.downside);
});
test('run reset clears temporary choices, resources and event history',()=>{const run=new Run('RESET');run.finish(1,60,70,5);assert.throws(()=>run.choose('not-offered'));run.choose(run.offers[0].id);assert.equal(run.event,1);run.reset();assert.equal(run.event,0);assert.deepEqual(run.owned,[]);assert.deepEqual(run.results,[]);assert.equal(run.integrity,100);assert.equal(run.flow,25);assert.equal(run.elapsed,0);assert.equal(run.phase,'race');});
test('event hooks remove safely during dispatch and repeated unsubscription preserves replacement listeners',()=>{
 const bus=new EventBus<{tick:number}>();let hits=0;let removeB=()=>{};
 bus.on('tick',()=>{hits++;removeB();});removeB=bus.on('tick',()=>{hits+=100;});bus.emit('tick',1);assert.equal(hits,1);
 bus.clear();const remove=bus.on('tick',()=>{});remove();bus.on('tick',()=>{hits+=10;});remove();bus.emit('tick',1);assert.equal(hits,11);bus.clear();assert.equal(bus.size,0);
});
test('drift/Flow, heavy impact and low-integrity power builds produce different mechanics; detach clears effects',()=>{
 const world=new RAPIER.World({x:0,y:-9.81,z:0});
 try {
  const drift=buildSettings(['tire-smoke','capacitor']);assert.equal(drift.driftFlow,DEFAULT_TUNING.driftFlow*2);assert.ok(drift.flowDrain<DEFAULT_TUNING.flowDrain);
  const heavy=buildSettings(['armor','impact-cell']);assert.ok(heavy.mass>DEFAULT_TUNING.mass);assert.ok(heavy.damageScale<DEFAULT_TUNING.damageScale);
  const power=buildSettings(['no-brakes','redline']);assert.ok(power.engine>DEFAULT_TUNING.engine);assert.ok(power.brakes<DEFAULT_TUNING.brakes);
  const car=new Vehicle(world,undefined,power);car.integrity=30;const detach=attachBuild(car,['redline','impact-cell']);
  car.events.emit('tick',{car,dt:1,amount:0,input:IDLE});assert.equal(car.power,1.9);const flow=car.flow;car.events.emit('damage',{car,dt:0,amount:10,input:IDLE});assert.equal(car.flow,flow+20);
  detach();assert.equal(car.events.size,0);car.power=1;car.events.emit('tick',{car,dt:1,amount:0,input:IDLE});assert.equal(car.power,1);
 }finally{world.free();}
});
