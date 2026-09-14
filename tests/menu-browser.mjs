import {launchBrowser} from './browser.mjs';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
await mkdir('test-results',{recursive:true});
const browser=await launchBrowser();
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.clock.install();
 await page.goto('http://127.0.0.1:5173/?seed=3B44-0E69');
 await page.waitForSelector('#new-run');assert.equal(await page.evaluate(()=>window.__roadGame.state),'menu');
 await page.screenshot({path:'test-results/main-menu.png'});
 await page.click('#help');assert.match(await page.locator('#overlay').innerText(),/83 km\/h/);await page.keyboard.press('Escape');
 await page.click('#settings');await page.uncheck('#stable-setting');await page.uncheck('#quality-setting');
 await page.reload();await page.click('#settings');assert.equal(await page.isChecked('#stable-setting'),false);assert.equal(await page.isChecked('#quality-setting'),false);await page.click('#back');
 await page.evaluate(()=>{window.qaPad={mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[window.qaPad],configurable:true});});
 const press=async index=>{await page.evaluate(i=>{window.qaPad.buttons[i]={pressed:true,value:1};},index);await page.clock.runFor(32);await page.evaluate(i=>{window.qaPad.buttons[i]={pressed:false,value:0};},index);await page.clock.runFor(32);};
 await press(13);assert.match(await page.locator('.menu-selected').innerText(),/Gara singola/);await press(12);await press(0);
 assert.equal(await page.evaluate(()=>window.__roadGame.state),'title');
 await page.fill('#seed-input','3B44-0E69');await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>window.__roadGame.state),'driving');
 await page.keyboard.press('Escape');await page.click('#menu');assert.equal(await page.evaluate(()=>window.__roadGame.state),'menu');
 await page.setViewportSize({width:390,height:740});await page.screenshot({path:'test-results/main-menu-mobile.png'});
 assert.ok(await page.evaluate(()=>document.querySelector('.main-menu').getBoundingClientRect().right<=innerWidth));
 await page.setViewportSize({width:1440,height:900});
 for(const mode of ['race','solo','lab']){await page.locator(`.mode-links a[href*="${mode}=1"]`).click();await page.waitForSelector('#start');assert.equal(await page.evaluate(()=>window.__roadGame?.state??window.__drivingLab?.state),'title');if(mode==='lab'){assert.equal(await page.isChecked('#shake'),false);await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>window.__drivingLab.state),'driving');await page.keyboard.press('Escape');}await page.locator('a[href="/"]').count()?await page.locator('a[href="/"]').click():await page.click('#back');await page.waitForSelector('#new-run');}
 await page.locator('.mode-links a[href*="solo=1"]').click();await page.click('#start');
 await page.evaluate(async()=>{const {ModularRoute}=await import('/src/road/route.ts');const route=new ModularRoute(window.__roadGame.seed);const pad={mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[pad],configurable:true});function drive(){const v=window.__roadGame,t=route.pointAt(v.progress+6+v.speed*.32),p=v.position;let e=Math.atan2(-(t.x-p.x),-(t.z-p.z))-v.yaw;e=Math.atan2(Math.sin(e),Math.cos(e));const steer=Math.max(-1,Math.min(1,e*3)),limit=route.speedAt(v.progress)*.96;let lo=0,hi=1;for(let i=0;i<16;i++){const mid=(lo+hi)/2;if(.45*mid+.55*mid**3<Math.abs(steer))lo=mid;else hi=mid;}pad.axes[0]=-Math.sign(steer)*(.12+(lo+hi)/2*.88);pad.buttons[7]={value:v.speed<limit?.94:0};pad.buttons[6]={value:v.speed>limit+.7?.65:0};requestAnimationFrame(drive);}requestAnimationFrame(drive);});
 for(let second=0;second<30;second++){await page.clock.runFor(1000);if(await page.locator('#cue').evaluate(el=>el.classList.contains('braking'))){await page.screenshot({path:'test-results/braking-warning.png'});break;}}
 assert.match(await page.locator('#cue').innerText(),/CURVE STRETTE/);
 await page.clock.runFor(20000);const v=await page.evaluate(()=>window.__roadGame);assert.ok(v.flowEarned>20);assert.ok(v.integrity>90);assert.deepEqual(errors,[]);
 console.log('PASS menu, keyboard/controller, persisted settings, all modes, narrow-screen layout, braking warning and clean Flow',v.flowEarned);
}finally{await browser.close();}
