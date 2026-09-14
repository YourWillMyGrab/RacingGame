import {launchBrowser} from './browser.mjs';
import assert from 'node:assert/strict';
const browser=await launchBrowser();
try {
const page=await browser.newPage({viewport:{width:1280,height:800}});
await page.goto('http://127.0.0.1:5173/?lab=1');await page.click('#start');
await page.evaluate(async()=>{
  const {trackPoint,nearestAnchor}=await import('/src/track.ts');
  const pad={mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};
  Object.defineProperty(navigator,'getGamepads',{value:()=>[pad]});
  function drive(){
    const v=window.__drivingLab;if(!v)return;
    const s=nearestAnchor(v.position.x,v.position.z).s, target=trackPoint(s+12+v.speed*.22);
    let error=Math.atan2(-(target.x-v.position.x),-(target.z-v.position.z))-v.yaw;
    error=Math.atan2(Math.sin(error),Math.cos(error));
    const steer=Math.max(-1,Math.min(1,error*2.4));
    let lo=0,hi=1;for(let i=0;i<16;i++){const mid=(lo+hi)/2;if(.45*mid+.55*mid**3<Math.abs(steer))lo=mid;else hi=mid;}pad.axes[0]=-Math.sign(steer)*(.12+(lo+hi)/2*.88);
    pad.buttons[7]={pressed:v.speed<24,value:v.speed<24?.85:0};pad.buttons[6]={pressed:v.speed>25,value:v.speed>25?.65:0};
    if(v.lap<2 && v.integrity>0)requestAnimationFrame(drive);
    else pad.buttons[7]={pressed:false,value:0};
  }requestAnimationFrame(drive);
});
await page.waitForFunction(()=>window.__drivingLab.lap>=2 || window.__drivingLab.integrity<=0,{},{timeout:55000});
const result=await page.evaluate(()=>window.__drivingLab);console.log(result);assert.equal(result.lap,2);assert.equal(result.integrity,100);await page.screenshot({path:'test-results/lap.png'});
}finally{await browser.close();}
