import {launchBrowser} from './browser.mjs';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
await mkdir('test-results',{recursive:true});
const browser=await launchBrowser();
try {
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173/?solo=1&seed=7F2C-A91D');await page.click('#start');
await page.evaluate(async()=>{
  const {ModularRoute}=await import('/src/road/route.ts');const route=new ModularRoute(window.__roadGame.seed);
  const pad={mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};
  Object.defineProperty(navigator,'getGamepads',{value:()=>[pad]});
  function drive(){const v=window.__roadGame;const target=route.pointAt(v.progress+6+v.speed*.32);let error=Math.atan2(-(target.x-v.position.x),-(target.z-v.position.z))-v.yaw;error=Math.atan2(Math.sin(error),Math.cos(error));const steer=Math.max(-1,Math.min(1,error*3));let lo=0,hi=1;for(let i=0;i<16;i++){const mid=(lo+hi)/2;if(.45*mid+.55*mid**3<Math.abs(steer))lo=mid;else hi=mid;}pad.axes[0]=-Math.sign(steer)*(.12+(lo+hi)/2*.88);const limit=route.speedAt(v.progress)*.96;pad.buttons[7]={pressed:v.speed<limit,value:v.speed<limit?.94:0};pad.buttons[6]={pressed:v.speed>limit+.7,value:v.speed>limit+.7?.65:0};if(v.state==='driving')requestAnimationFrame(drive);else pad.buttons[7]={pressed:false,value:0};}requestAnimationFrame(drive);
});
await page.waitForFunction(()=>window.__roadGame.progress>600,{},{timeout:45000});console.log('STREAM',await page.evaluate(()=>window.__roadGame));await page.screenshot({path:'test-results/modular-road.png'});
await page.waitForFunction(()=>window.__roadGame.state!=='driving',{},{timeout:150000});
const result=await page.evaluate(()=>window.__roadGame);console.log('FINISH',result);assert.equal(result.state,'finished');assert.equal(result.integrity,100);assert.ok(result.unloadedChunks>10);assert.ok(result.activeChunks<11);assert.deepEqual(errors,[]);await page.screenshot({path:'test-results/modular-finish.png'});
await page.click('#restart');const reset=await page.evaluate(()=>window.__roadGame);assert.equal(reset.seed,result.seed);assert.ok(reset.progress<30);assert.equal(reset.integrity,100);console.log('PASS modular route browser drive, streaming and seed restart');
}finally{await browser.close();}
