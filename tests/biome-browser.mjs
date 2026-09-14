import {launchBrowser} from './browser.mjs';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const output='test-results/m6-coast';await mkdir(output,{recursive:true});
const browser=await launchBrowser();
try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.clock.install();
  await page.goto('http://127.0.0.1:5173/?solo=1&seed=7F2C-A91D');await page.click('#start');
  const snapshot=()=>page.evaluate(()=>window.__roadGame);
  let state=await snapshot();assert.equal(state.biome,'lighthouse-coast-v1');assert.ok(state.windZones.length);assert.equal(state.race,null);
  await page.keyboard.down('KeyW');let exposed=false;
  for(let i=0;i<40;i++){
    await page.clock.runFor(200);state=await snapshot();
    if(state.progress>45&&state.progress<90){assert.match(await page.locator('#biome-cue').innerText(),/RAFFICHE.*TRA/);}
    if(Math.abs(state.wind)>2){exposed=true;break;}
  }
  assert.ok(exposed,'drive physically into the signed wind corridor');assert.ok(state.vfx.emitted>0);assert.equal(state.audio.state,'running');assert.equal(state.audio.audible,true);
  const sign=state.windZones[0].direction;assert.equal(Math.sign(state.wind),sign);
  assert.match(await page.locator('#biome-cue').innerText(),/CONTRASTERZA/);
  await page.screenshot({path:output+'/wind-active.png'});
  await page.keyboard.up('KeyW');await page.keyboard.press('Escape');assert.equal((await snapshot()).audio.audible,false,'pause mutes without waiting for a render frame');await page.clock.runFor(100);
  const paused=await snapshot();await page.clock.runFor(1000);const still=await snapshot();
  assert.deepEqual(still.position,paused.position);assert.equal(still.vfx.emitted,paused.vfx.emitted);assert.equal(still.vfx.visible,false);assert.equal(still.audio.audible,false);
  await page.click('#resume');await page.keyboard.press('KeyR');await page.clock.runFor(100);assert.equal((await snapshot()).recoveries,1);
  await page.keyboard.press('Escape');await page.click('#restart');await page.clock.runFor(100);state=await snapshot();assert.equal(state.vfx.emitted,0);assert.equal(state.wind,0);assert.equal(state.integrity,100);
  await page.keyboard.press('Escape');await page.click('#menu');await page.click('#settings');await page.uncheck('#audio-setting');await page.click('#back');
  await page.reload();await page.click('#back');await page.click('#settings');assert.equal(await page.isChecked('#audio-setting'),false);
  await page.check('#audio-setting');await page.click('#back');await page.locator('.mode-links a[href*="race=1"]').click();await page.click('#start');await page.clock.runFor(100);
  state=await snapshot();assert.equal(state.race.racers.filter(r=>r.special).length,1);assert.equal(state.race.racers[5].name,'FARO');assert.equal(state.audio.audible,false,'countdown stays silent');
  await page.screenshot({path:output+'/faro-grid.png'});
  await page.setViewportSize({width:390,height:740});await page.clock.runFor(100);await page.screenshot({path:output+'/narrow-warning.png'});
  const rect=await page.locator('#biome-cue').boundingBox();assert.ok(rect.x>=0&&rect.x+rect.width<=390);
  assert.deepEqual(errors,[]);console.log('PASS Costa del Faro: physical wind/sign/VFX, audio unlock/mute/persistence, pause/recovery/reset, Faro grid, narrow HUD; no page errors');
}finally{await browser.close();}
