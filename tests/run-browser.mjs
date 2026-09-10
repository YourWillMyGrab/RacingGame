import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install();
 await page.goto('http://127.0.0.1:5173/?seed=7F2C-A91D');await page.click('#start');
 async function pilot(){await page.evaluate(async()=>{
  const {ModularRoute}=await import('/src/road/route.ts');const snapshot=window.__roadGame,route=new ModularRoute(snapshot.seed,snapshot.moduleCount);
  const pad={mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};window.qaPad=pad;Object.defineProperty(navigator,'getGamepads',{value:()=>[window.qaPad],configurable:true});
  function drive(){const v=window.__roadGame,p=v.position,target=route.pointAt(v.progress+12+v.speed*.22);let e=Math.atan2(-(target.x-p.x),-(target.z-p.z))-v.yaw;e=Math.atan2(Math.sin(e),Math.cos(e));const steer=Math.max(-1,Math.min(1,e*2.4));pad.axes[0]=-Math.sign(steer)*(.12+Math.abs(steer)*.88);pad.buttons[7]={pressed:true,value:.94};if(v.state==='driving')requestAnimationFrame(drive);else pad.buttons[7]={pressed:false,value:0};}requestAnimationFrame(drive);
 });}
 for(let event=0;event<3;event++){
  await pilot();
  for(let chunk=0;chunk<35;chunk++){await page.clock.runFor(5000);const current=await page.evaluate(()=>window.__roadGame);if(current.state!=='driving')break;if(chunk>1 && (current.speed<1 || current.progress>current.race.checkpoint+8)){await page.keyboard.press('KeyR');console.log('RECOVERY',event+1,current.progress);}}
  let snapshot=await page.evaluate(()=>window.__roadGame);console.log('EVENT',event+1,snapshot);
  assert.equal(snapshot.state,'finished');assert.ok(snapshot.integrity>0);assert.equal(snapshot.run.event,event);
  const integrity=snapshot.integrity;await page.clock.runFor(2000);assert.equal((await page.evaluate(()=>window.__roadGame.integrity)),integrity,'no damage after finish');
  if(event<2){
   await page.click('#claim-reward');assert.equal(await page.locator('[data-reward]').count(),3);await page.screenshot({path:`test-results/reward-${event+1}.png`});
   if(event===0){await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter');}
   else {await page.evaluate(()=>{window.qaPad.buttons[0]={pressed:true,value:1};});await page.clock.runFor(50);}
   snapshot=await page.evaluate(()=>window.__roadGame);assert.equal(snapshot.run.owned.length,event+1);assert.equal(snapshot.run.event,event+1);assert.equal(snapshot.state,'driving');assert.ok(snapshot.race.countdown>2);
  }else{assert.equal(snapshot.run.phase,'complete');await page.screenshot({path:'test-results/run-complete.png'});}
 }
 await page.click('#restart');const reset=await page.evaluate(()=>window.__roadGame);assert.deepEqual(reset.run.owned,[]);assert.equal(reset.run.event,0);assert.equal(reset.integrity,100);assert.equal(reset.flow,25);assert.deepEqual(errors,[]);console.log('PASS full three-event run, rewards with keyboard and controller, victory and clean new run');
}finally{await browser.close();}
