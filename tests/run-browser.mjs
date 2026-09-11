import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install();
 await page.goto('http://127.0.0.1:5173/?seed=7F2C-A91D');await page.click('#new-run');await page.click('#start');
 async function pilot(branch){await page.evaluate(async(branch)=>{
  const {ModularRoute}=await import('/src/road/route.ts');const snapshot=window.__roadGame,route=new ModularRoute(snapshot.seed,snapshot.moduleCount,snapshot.routeOptions);
  const pad={mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};window.qaPad=pad;Object.defineProperty(navigator,'getGamepads',{value:()=>[window.qaPad],configurable:true});
  function drive(){const v=window.__roadGame,p=v.position,target=route.pointAt(v.progress+6+v.speed*.32,branch);let e=Math.atan2(-(target.x-p.x),-(target.z-p.z))-v.yaw;e=Math.atan2(Math.sin(e),Math.cos(e));const steer=Math.max(-1,Math.min(1,e*3));pad.axes[0]=-Math.sign(steer)*(.12+Math.abs(steer)*.88);const limit=route.speedAt(v.progress)*.96;pad.buttons[7]={pressed:v.speed<limit,value:v.speed<limit?.94:0};pad.buttons[6]={pressed:v.speed>limit+.7,value:v.speed>limit+.7?.65:0};if(v.state==='driving')requestAnimationFrame(drive);else pad.buttons[7]={pressed:false,value:0};}requestAnimationFrame(drive);
 },branch);}
 for(let event=0;event<3;event++){
  const branch=event===1?'right':'left';await pilot(branch);let captured=false,recoveredInFork=false,lastRecoveryChunk=-99;
  for(let chunk=0;chunk<100;chunk++){await page.clock.runFor(3000);const current=await page.evaluate(()=>window.__roadGame);if(current.state!=='driving')break;const fork=current.forks[0];
   if(fork&&!captured&&current.progress>fork.start-100&&current.progress<fork.start+50){assert.match(await page.locator('#route-choice').innerText(),/PROSSIMA GARA/);await page.screenshot({path:'test-results/fork-approach-'+event+'.png'});captured=true;}
   if(fork&&!recoveredInFork&&current.branchChoices.length&&current.progress<fork.end-60){assert.equal(current.branchChoices[0][1],branch);await page.screenshot({path:'test-results/fork-'+branch+'.png'});await page.keyboard.press('KeyR');recoveredInFork=true;lastRecoveryChunk=chunk;console.log('FORK RECOVERY',event+1,branch);}
   else if(chunk>2&&chunk-lastRecoveryChunk>2&&(current.speed<1||current.progress>current.race.checkpoint+8)){await page.keyboard.press('KeyR');lastRecoveryChunk=chunk;console.log('RECOVERY',event+1,current.progress);}
  }
  let snapshot=await page.evaluate(()=>window.__roadGame);console.log('EVENT',event+1,snapshot);
  assert.equal(snapshot.state,'finished');assert.ok(snapshot.integrity>0);assert.equal(snapshot.run.event,event);
  const integrity=snapshot.integrity;await page.clock.runFor(2000);assert.equal((await page.evaluate(()=>window.__roadGame.integrity)),integrity,'no damage after finish');
  if(event<2){assert.ok(recoveredInFork);assert.equal(snapshot.run.routeChoices[event].branch,branch);assert.equal(snapshot.run.nextProfile,event===0?'technical':'speed');
   await page.click('#claim-reward');assert.equal(await page.locator('[data-reward]').count(),3);await page.screenshot({path:`test-results/reward-${event+1}.png`});
   if(event===0){await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter');}
   else {await page.evaluate(()=>{window.qaPad.buttons[0]={pressed:true,value:1};});await page.clock.runFor(50);}
   snapshot=await page.evaluate(()=>window.__roadGame);assert.equal(snapshot.run.owned.length,event+1);assert.equal(snapshot.run.event,event+1);assert.equal(snapshot.state,'driving');assert.ok(snapshot.race.countdown>2);assert.equal(snapshot.run.profile,event===0?'technical':'speed');
  }else{assert.equal(snapshot.run.phase,'complete');await page.screenshot({path:'test-results/run-complete.png'});}
 }
 await page.click('#restart');const reset=await page.evaluate(()=>window.__roadGame);assert.deepEqual(reset.run.owned,[]);assert.deepEqual(reset.run.routeChoices,[]);assert.equal(reset.run.profile,'balanced');assert.equal(reset.run.event,0);assert.equal(reset.integrity,100);assert.equal(reset.flow,25);assert.deepEqual(errors,[]);console.log('PASS full run, both physical arms, recovery and next-event profiles, keyboard/controller rewards, victory and clean reset');
}finally{await browser.close();}
