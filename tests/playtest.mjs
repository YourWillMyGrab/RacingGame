import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173/?lab=1');await page.waitForSelector('#start');
await page.screenshot({path:'test-results/title.png'});
await page.click('#start');
const snapshot=()=>page.evaluate(()=>window.__drivingLab);
await page.keyboard.down('KeyW');await page.waitForTimeout(2500);
const acceleration=await snapshot();assert.ok(acceleration.speed>12);assert.equal(acceleration.contacts,4);
await page.keyboard.down('Space');await page.keyboard.down('KeyA');await page.waitForTimeout(650);await page.keyboard.up('Space');await page.waitForTimeout(200);
const drift=await snapshot();assert.ok(drift.flow>acceleration.flow);await page.screenshot({path:'test-results/driving.png'});
await page.keyboard.up('KeyA');await page.keyboard.down('ShiftLeft');await page.waitForTimeout(350);const boost=await snapshot();assert.ok(boost.boosting);assert.ok(boost.flow<drift.flow);
await page.keyboard.up('ShiftLeft');await page.keyboard.up('KeyW');await page.keyboard.press('KeyR');await page.waitForTimeout(120);
const recovery=await snapshot();assert.equal(recovery.recoveries,1);assert.equal(recovery.penalty,3);assert.ok(recovery.speed<1);
await page.keyboard.press('Escape');await page.waitForTimeout(100);const paused=await snapshot();assert.equal(paused.state,'paused');await page.waitForTimeout(200);assert.equal((await snapshot()).elapsed,paused.elapsed);
await page.click('#restart');await page.waitForTimeout(100);assert.equal((await snapshot()).flow<25,true);assert.equal((await snapshot()).integrity,100);assert.equal((await snapshot()).penalty,0);
// Simulates standard Gamepad API hardware; it is not a physical-controller test.
await page.evaluate(()=>{window.qaPad={mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[window.qaPad]});window.qaPad.buttons[7]={pressed:true,value:.65};});
await page.waitForTimeout(1800);const pad=await snapshot();assert.equal(pad.device,'Controller');assert.ok(pad.speed>5);
await page.evaluate(()=>{window.qaPad.buttons[9]={pressed:true,value:1};});await page.waitForTimeout(100);assert.equal((await snapshot()).state,'paused');await page.waitForTimeout(150);assert.equal((await snapshot()).state,'paused');
await page.evaluate(()=>{window.qaPad.buttons[9]={pressed:false,value:0};});await page.waitForTimeout(50);await page.evaluate(()=>{window.qaPad.buttons[9]={pressed:true,value:1};});await page.waitForTimeout(100);assert.equal((await snapshot()).state,'driving');
assert.deepEqual(errors,[]);console.log('PASS browser: keyboard acceleration, drift, boost, quick recovery, pause freeze, restart, analog gamepad throttle and pause debounce.');
console.log(JSON.stringify({acceleration,drift,boost,recovery,pad},null,2));
} finally {await browser.close();}
