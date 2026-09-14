import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PoseBuffer} from '../src/presentation.ts';
import {gamepadSteer} from '../src/input.ts';

test('render interpolation advances smoothly at 144 Hz and wraps yaw across pi',()=>{
  const buffer=new PoseBuffer({x:0,y:1,z:0,yaw:Math.PI-.02});
  buffer.capture({x:1,y:1,z:0,yaw:-Math.PI+.02});
  assert.ok(Math.abs(buffer.sample(.5).yaw-Math.PI)<1e-9);
  assert.equal(buffer.sample(.5).x,.5);
  let previous=-1;
  for(let frame=0;frame<144;frame++){
    const time=frame/144,tick=Math.floor(time*60);
    if(frame===0)buffer.reset({x:0,y:1,z:0,yaw:0});
    while(buffer.sample(1).x<tick+1)buffer.capture({x:buffer.sample(1).x+1,y:1,z:0,yaw:0});
    const x=buffer.sample(time*60-tick).x;
    if(previous>=0)assert.ok(Math.abs(x-previous-60/144)<1e-8,'no held or jumped render frames');
    previous=x;
  }
  buffer.capture({x:300,y:1,z:0,yaw:1});
  assert.equal(buffer.sample(0).x,300,'recovery never interpolates through scenery');
});

test('controller response rejects centre noise, remains continuous and reaches full lock',()=>{
  for(const axis of [-.12,-.04,0,.09,.12])assert.equal(Math.abs(gamepadSteer(axis)),0);
  assert.ok(Math.abs(gamepadSteer(.12001))<.00001);
  assert.ok(Math.abs(gamepadSteer(.4))<.2);
  for(let axis=.13;axis<1;axis+=.01){assert.ok(Math.abs(gamepadSteer(axis+.01))>Math.abs(gamepadSteer(axis)));assert.ok(Math.abs(gamepadSteer(axis)+gamepadSteer(-axis))<1e-9);}
  assert.equal(gamepadSteer(1),-1);assert.equal(gamepadSteer(-1),1);
});
