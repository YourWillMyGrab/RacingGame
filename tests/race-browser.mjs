import {launchBrowser} from './browser.mjs';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
await mkdir('test-results',{recursive:true});
const browser=await launchBrowser();
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/?race=1&seed=7F2C-A91D');await page.click('#start');
 let state=await page.evaluate(()=>window.__roadGame);assert.equal(state.race.racers.length,6);assert.ok(state.race.countdown>2);
 await page.screenshot({path:'test-results/race-grid.png'});
 await page.evaluate(async()=>{
  const {ModularRoute}=await import('/src/road/route.ts');const route=new ModularRoute(window.__roadGame.seed);
  const pad={mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[pad]});
  function drive(){const v=window.__roadGame,p=v.position,target=route.pointAt(v.progress+6+v.speed*.32);let e=Math.atan2(-(target.x-p.x),-(target.z-p.z))-v.yaw;e=Math.atan2(Math.sin(e),Math.cos(e));const steer=Math.max(-1,Math.min(1,e*3));let lo=0,hi=1;for(let i=0;i<16;i++){const mid=(lo+hi)/2;if(.45*mid+.55*mid**3<Math.abs(steer))lo=mid;else hi=mid;}pad.axes[0]=-Math.sign(steer)*(.12+(lo+hi)/2*.88);const limit=route.speedAt(v.progress)*.96;pad.buttons[7]={pressed:v.speed<limit,value:v.speed<limit?.94:0};pad.buttons[6]={pressed:v.speed>limit+.7,value:v.speed>limit+.7?.65:0};if(v.state==='driving')requestAnimationFrame(drive);else pad.buttons[7]={pressed:false,value:0};}requestAnimationFrame(drive);
 });
 await page.waitForFunction(()=>window.__roadGame.progress>450,{},{timeout:45000});console.log('RACING',await page.evaluate(()=>window.__roadGame));await page.screenshot({path:'test-results/race-driving.png'});
 await page.waitForFunction(()=>window.__roadGame.state!=='driving',{},{timeout:150000});state=await page.evaluate(()=>window.__roadGame);console.log('RESULT',state);assert.equal(state.state,'finished');assert.ok(state.race.order.some(r=>r.id===0));assert.ok(state.race.position>=1&&state.race.position<=6);assert.deepEqual(errors,[]);
 await page.screenshot({path:'test-results/race-result.png'});await page.click('#restart');state=await page.evaluate(()=>window.__roadGame);assert.ok(state.race.countdown>2);assert.equal(state.race.order.length,0);assert.equal(state.integrity,100);assert.ok(state.progress<50);console.log('PASS browser six-car race and restart');
}finally{await browser.close();}
