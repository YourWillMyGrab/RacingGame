import {launchBrowser} from './browser.mjs';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const output=`test-results/refinement-${process.env.RUN_SEED??'7F2C-A91D'}-${process.env.TIME_ATTACK_OVERRUN?'overrun':'normal'}`;
await mkdir(output,{recursive:true});
const browser=await launchBrowser();
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install();
 await page.goto(`http://127.0.0.1:5173/?seed=${process.env.RUN_SEED??'7F2C-A91D'}`);await page.click('#new-run');await page.click('#start');
 async function pilot(branch){await page.evaluate(async(branch)=>{
  const {ModularRoute}=await import('/src/road/route.ts'),{placeRoad}=await import('/src/road/connect.ts');const snapshot=window.__roadGame,route=new ModularRoute(snapshot.seed,snapshot.moduleCount,snapshot.routeOptions);placeRoad(route,snapshot.routePlacement.socket,snapshot.routePlacement.station,snapshot.routePlacement.index);const generation=window.qaPilotGeneration=(window.qaPilotGeneration??0)+1;
  const pad={mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};window.qaPad=pad;Object.defineProperty(navigator,'getGamepads',{value:()=>[window.qaPad],configurable:true});
  function drive(){if(generation!==window.qaPilotGeneration)return;const v=window.__roadGame,p=v.position,target=route.pointAt(v.progress+6+v.speed*.32,branch);let e=Math.atan2(-(target.x-p.x),-(target.z-p.z))-v.yaw;e=Math.atan2(Math.sin(e),Math.cos(e));const steer=Math.max(-1,Math.min(1,e*3));let lo=0,hi=1;for(let i=0;i<16;i++){const mid=(lo+hi)/2;if(.45*mid+.55*mid**3<Math.abs(steer))lo=mid;else hi=mid;}pad.axes[0]=-Math.sign(steer)*(.12+(lo+hi)/2*.88);const limit=route.speedAt(v.progress)*.96;pad.buttons[7]={pressed:v.speed<limit,value:v.speed<limit?.94:0};pad.buttons[6]={pressed:v.speed>limit+.7,value:v.speed>limit+.7?.65:0};if(v.state==='driving')requestAnimationFrame(drive);else pad.buttons[7]={pressed:false,value:0};}requestAnimationFrame(drive);
 },branch);}
 for(let event=0;event<3;event++){
  let initial=await page.evaluate(()=>window.__roadGame);
  if(initial.lifecycle==='transfer'){
   assert.equal(initial.race,null);assert.equal(initial.bodies,1);assert.equal(initial.elapsed,0);
   assert.match(await page.locator('#position').innerText(),/TRASFERIMENTO/);
   assert.equal(await page.locator('#time').innerText(),'00:00,0');
   await page.keyboard.press('Escape');const paused=await page.evaluate(()=>window.__roadGame);
   await page.clock.runFor(2000);const still=await page.evaluate(()=>window.__roadGame);
   assert.deepEqual(still.position,paused.position);assert.equal(still.flow,paused.flow);assert.equal(still.elapsed,0);
   await page.click('#resume');await pilot('left');let recovered=false;
   for(let tick=0;tick<400;tick++){
    await page.clock.runFor(100);const transfer=await page.evaluate(()=>window.__roadGame);
    if(transfer.lifecycle!=='transfer')break;
    assert.equal(transfer.elapsed,0);assert.equal(transfer.worldGeneration,initial.worldGeneration);
    if(!recovered&&transfer.progress>=transfer.routePlacement.station+4&&transfer.progress<transfer.routeStart-6){
     await page.screenshot({path:output+'/transfer-seam-'+event+'.png'});
     await page.keyboard.press('KeyR');recovered=true;
    }
   }
   initial=await page.evaluate(()=>window.__roadGame);assert.ok(recovered,'transfer seam recovery');
   assert.equal(initial.lifecycle,'event');if(initial.race.kind==='time-attack'){assert.equal(initial.race.countdown,0);assert.ok(initial.speed>15);}else assert.ok(initial.race.countdown>2.8);
   assert.equal(initial.race.checkpoint,initial.routeStart+40);assert.ok(initial.elapsed<.1);
   // Stop the transfer pilot before testing countdown and pause.
   await page.evaluate(()=>{window.qaPilotGeneration++;window.qaPad.buttons[7]={pressed:false,value:0};});
  }
  assert.equal(initial.race.kind,initial.run.eventTypes[event]);
  assert.equal(initial.race.racers.length,initial.race.kind==='time-attack'?1:6);
  if(initial.race.kind==='time-attack') {
   assert.match(await page.locator('#objective').innerText(),/TIME ATTACK/);
   assert.match(await page.locator('#event-targets').innerText(),/Oro.*Argento.*Bronzo/);
   assert.doesNotMatch(await page.locator('#position').innerText(),/1 \/ 6/);
   await page.keyboard.press('Escape');const paused=await page.evaluate(()=>window.__roadGame);
   await page.clock.runFor(2000);assert.equal((await page.evaluate(()=>window.__roadGame)).elapsed,paused.elapsed);
   await page.click('#resume');await page.clock.runFor(500);
   const countdown=await page.evaluate(()=>window.__roadGame);assert.ok(countdown.elapsed>initial.elapsed);assert.ok(countdown.speed>5);assert.equal(countdown.integrity,initial.integrity);
   await page.screenshot({path:`${output}/time-attack-start-${event}.png`});
   if(process.env.TIME_ATTACK_OVERRUN&&event===1) {
    await page.clock.runFor((initial.race.result.targets.bronze+5)*1000);
    const over=await page.evaluate(()=>window.__roadGame);assert.equal(over.state,'driving');assert.equal(over.race.result.band,'over-target');
    assert.match(await page.locator('#position').innerText(),/FUORI OBIETTIVO/);
   }
  }
  const branch=event===1?'right':'left';await pilot(branch);let captured=false,recoveredInFork=false,lastRecoveryChunk=-99;
  for(let chunk=0;chunk<100;chunk++){await page.clock.runFor(3000);const current=await page.evaluate(()=>window.__roadGame);if(current.state!=='driving')break;const fork=current.forks[0];
   if(fork&&!captured&&current.progress>fork.start-100&&current.progress<fork.start+50){assert.match(await page.locator('#route-choice').innerText(),/PROSSIMA GARA/);await page.screenshot({path:output+'/fork-approach-'+event+'.png'});captured=true;}
   if(fork&&!recoveredInFork&&current.branchChoices.length&&current.progress<fork.end-60){assert.equal(current.branchChoices[0][1],branch);await page.screenshot({path:output+'/fork-'+branch+'.png'});await page.keyboard.press('KeyR');recoveredInFork=true;lastRecoveryChunk=chunk;console.log('FORK RECOVERY',event+1,branch);}
   else if(chunk>2&&chunk-lastRecoveryChunk>2&&(current.speed<1||current.progress>current.race.checkpoint+8)){await page.keyboard.press('KeyR');lastRecoveryChunk=chunk;console.log('RECOVERY',event+1,current.progress);}
  }
  let snapshot=await page.evaluate(()=>window.__roadGame);console.log('EVENT',event+1,snapshot);
  assert.equal(snapshot.state,event<2&&snapshot.run.eventTypes[event+1]==='time-attack'?'reward':'finished');assert.ok(snapshot.integrity>0);assert.equal(snapshot.run.event,event);
  if(snapshot.race.kind==='time-attack') {
   assert.equal(await page.locator('#standings').count(),0);
   assert.match(await page.locator('#overlay').innerText(),/ORO|ARGENTO|BRONZO|FUORI OBIETTIVO/);
   assert.equal(snapshot.run.results[event].time,snapshot.race.result.time);
   if(process.env.TIME_ATTACK_OVERRUN&&event===1)assert.equal(snapshot.run.results[event].band,'over-target');
   await page.screenshot({path:`${output}/time-attack-result-${event}.png`});
  }
  const integrity=snapshot.integrity;await page.clock.runFor(2000);assert.equal((await page.evaluate(()=>window.__roadGame.integrity)),integrity,'no damage after finish');
  if(event<2){assert.ok(recoveredInFork);assert.equal(snapshot.run.routeChoices[event].branch,branch);assert.equal(snapshot.run.nextProfile,event===0?'technical':'speed');
   if(snapshot.state==='finished')await page.click('#claim-reward');assert.equal(await page.locator('[data-reward]').count(),3);await page.screenshot({path:`${output}/reward-${event+1}.png`});
   if(event===0){await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter');}
   else {await page.evaluate(()=>{window.qaPad.buttons[0]={pressed:true,value:1};});await page.clock.runFor(50);}
   const beforeChoice=snapshot; snapshot=await page.evaluate(()=>window.__roadGame);assert.equal(snapshot.worldGeneration,beforeChoice.worldGeneration);assert.equal(snapshot.bodyHandle,beforeChoice.bodyHandle);assert.ok(Math.hypot(snapshot.position.x-beforeChoice.position.x,snapshot.position.z-beforeChoice.position.z)<2.5);assert.ok(snapshot.createdChunks>=beforeChoice.createdChunks);assert.equal(snapshot.integrity,Math.min(100,Math.max(1,integrity+(snapshot.run.results[event].position<=3?8:-8))));assert.equal(snapshot.run.owned.length,event+1);assert.equal(snapshot.run.event,event+1);assert.equal(snapshot.state,'driving');assert.equal(snapshot.lifecycle,'transfer');assert.equal(snapshot.race,null);assert.equal(snapshot.bodies,1);await page.screenshot({path:output+'/transfer-start-'+event+'.png'});assert.equal(snapshot.run.profile,event===0?'technical':'speed');
  }else{assert.equal(snapshot.run.phase,'complete');await page.screenshot({path:output+'/run-complete.png'});}
 }
 await page.click('#restart');const reset=await page.evaluate(()=>window.__roadGame);assert.equal(reset.lifecycle,'event');assert.equal(reset.worldModules,12);assert.equal(reset.routeStart,25);assert.deepEqual(reset.run.results,[]);assert.equal(reset.race.kind,'road-race');assert.deepEqual(reset.run.owned,[]);assert.deepEqual(reset.run.routeChoices,[]);assert.equal(reset.run.profile,'balanced');assert.equal(reset.run.event,0);assert.equal(reset.integrity,100);assert.equal(reset.flow,25);assert.deepEqual(errors,[]);console.log('PASS continuous world, transfer pause/recovery/countdown, mixed run, Time Attack targets/pause/results, both physical arms, recovery and next-event profiles, keyboard/controller rewards, victory and clean reset');
}finally{await browser.close();}
