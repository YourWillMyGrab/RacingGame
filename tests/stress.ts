import assert from 'node:assert/strict';
import {Run} from '../src/run.ts';
import {timeTargets,timedResult} from '../src/event/rules.ts';
import { ModularRoute } from '../src/road/route.ts';
import {connectRoad} from '../src/road/connect.ts';
import {validateConnection} from '../src/road/modules.ts';
const count=Number(process.argv[2]??1000);
if(!Number.isInteger(count)||count<1||count>100000)throw new Error('Supply a seed count between 1 and 100000');
let modules=0, points=0, forks=0;
const categories=new Set<string>();
for(let i=0;i<count;i++) {
  const route=new ModularRoute(`STRESS-${i}`,32,{forks:true,profile:(['balanced','technical','speed'] as const)[i%3]});
  const errors=route.validate();if(errors.length)throw new Error(`STRESS-${i}: ${errors.join(',')}`);
  modules+=route.chunks.length;points+=route.points.length;
  for(const c of route.chunks){categories.add(c.definition.category);if(c.branches){forks++;points+=c.branches.right.length;}}
}
console.log(JSON.stringify({seeds:count,modules,points,invalidConnections:0,invalidGrades:0,missingFinish:0,excessiveRepetition:0,categories:[...categories],forks,branches:'Both arms validated for sockets, curvature and separation; physical coverage in forks.test.ts.'},null,2));

// Independent streams: replay mixed campaign structure, target times and rewards.
const finales=new Set<string>();
let timedEvents=0;
for(let i=0;i<count;i++) {
 const a=new Run(`EVENT-STRESS-${i}`),b=new Run(`EVENT-STRESS-${i}`);
 assert.deepEqual(a.eventTypes,b.eventTypes);finales.add(a.eventTypes[2]);
 let worldA:ModularRoute|undefined,worldB:ModularRoute|undefined;
 for(let event=0;event<3;event++) {
  assert.equal(a.routeSeed,b.routeSeed);
  const roadA=new ModularRoute(a.routeSeed,a.moduleCount,a.routeOptions),roadB=new ModularRoute(b.routeSeed,b.moduleCount,b.routeOptions);
  assert.deepEqual(roadA.points,roadB.points);
  const targets=timeTargets(roadA);assert.deepEqual(targets,timeTargets(roadB));
  if(worldA&&worldB){
   const end={...worldA.chunks.at(-1)!.exit};connectRoad(worldA,roadA);connectRoad(worldB,roadB);
   assert.ok(validateConnection(end,roadA.chunks[0].entry));assert.deepEqual(roadA.points,roadB.points);
   assert.deepEqual(timeTargets(roadA),targets);assert.equal(new Set(worldA.chunks.map(c=>c.index)).size,worldA.chunks.length);
   assert.deepEqual(worldA.validate(),[]);assert.deepEqual(roadA.validate(),[]);
   assert.ok(worldA.points.every((p,j)=>j===0||p.z<worldA!.points[j-1].z),'the coastal campaign keeps advancing without doubling back');
  }else{worldA=roadA;worldB=roadB;}
  const position=[1,3,6][i%3];
  const result=a.eventType==='road-race'?{kind:'road-race' as const,position,time:90}:timedResult([targets.gold,targets.silver,targets.bronze,targets.bronze+1][i%4],targets);
  if(result.kind==='time-attack')timedEvents++;
  for(const run of [a,b]) {
   if(event<2)run.selectRoute((i+event)%2?'left':'right');
   run.finish(result,80,45);
  }
  assert.deepEqual(a.results,b.results);assert.deepEqual(a.offers,b.offers);assert.equal(a.integrity,b.integrity);
  if(event<2){assert.equal(a.offers.length,3);for(const run of [a,b])run.choose(run.offers[0].id);}
 }
 a.reset();assert.deepEqual(a.results,[]);assert.deepEqual(a.routeChoices,[]);assert.equal(a.flow,25);assert.equal(a.integrity,100);
}
console.log(JSON.stringify({campaignSeeds:count,events:count*3,connectedBoundaries:count*2,timedEvents,finales:[...finales],deterministicTargetsRewardsAndReset:true},null,2));
