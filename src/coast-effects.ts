import * as THREE from 'three';
import type {Vehicle} from './vehicle';

/** Presentation only: never feeds random values or timing back into physics. */
export function soundLevels(car:Pick<Vehicle,'speed'|'wind'|'boosting'|'impact'>,active:boolean){
  return active?{engine:.018+Math.min(1,car.speed/45)*.045,frequency:42+car.speed*3,wind:Math.abs(car.wind)*.023,boost:car.boosting?.045:0,impact:car.impact*.09}:{engine:0,frequency:42,wind:0,boost:0,impact:0};
}
export class CoastAudio {
  private context?:AudioContext;
  private master?:GainNode;
  private engine?:OscillatorNode;
  private engineGain?:GainNode;
  private airGain?:GainNode;
  private air?:AudioBufferSourceNode;
  enabled=true;
  audible=false;
  get state(){return this.context?.state??'locked';}
  unlock(){
    if(!this.enabled)return;
    try{
      if(!this.context){
        const ctx=new AudioContext();this.context=ctx;
        const master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);this.master=master;
        const engine=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
        engine.type='triangle';engine.frequency.value=42;gain.gain.value=0;filter.type='lowpass';filter.frequency.value=600;
        engine.connect(filter).connect(gain).connect(master);engine.start();this.engine=engine;this.engineGain=gain;
        const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);let seed=41;
        for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;data[i]=(seed/2147483648)*.6;}
        const air=ctx.createBufferSource(),airGain=ctx.createGain(),lowpass=ctx.createBiquadFilter();air.buffer=buffer;air.loop=true;airGain.gain.value=0;lowpass.frequency.value=1400;
        air.connect(lowpass).connect(airGain).connect(master);air.start();this.air=air;this.airGain=airGain;
      }
      if(this.context.state==='suspended')void this.context.resume().catch(()=>{});
    }catch{/* Audio is optional on browsers without a working output device. */}
  }
  update(car:Vehicle,active:boolean){
    this.audible=this.enabled&&active&&this.context?.state==='running';
    if(!this.context||!this.master)return;
    const level=soundLevels(car,this.audible),now=this.context.currentTime;
    const set=(param:AudioParam,value:number)=>{param.cancelScheduledValues(now);param.setTargetAtTime(value,now,.035);};
    set(this.master.gain,this.audible?.7:0);set(this.engine!.frequency,level.frequency);set(this.engineGain!.gain,level.engine+level.boost);set(this.airGain!.gain,level.wind+level.boost+level.impact);
  }
  silence(){
    // Hidden tabs may stop rendering before another update can run.
    this.audible=false;
    if(this.context&&this.master){const now=this.context.currentTime;this.master.gain.cancelScheduledValues(now);this.master.gain.setTargetAtTime(0,now,.02);}
  }
  dispose(){this.audible=false;this.engine?.stop();this.air?.stop();if(this.context)void this.context.close().catch(()=>{});}
}

interface Particle {x:number;y:number;z:number;vx:number;vz:number;life:number;size:number}
export class CoastVfx {
  readonly mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xf4e4c9,transparent:true,opacity:.6,depthWrite:false}),64);
  private particles:Particle[]=Array.from({length:64},()=>({x:0,y:0,z:0,vx:0,vz:0,life:0,size:0}));
  private dummy=new THREE.Object3D();
  private cursor=0;
  private carry=0;
  private lastImpact=0;
  emitted=0;
  constructor(scene:THREE.Scene){this.mesh.frustumCulled=false;scene.add(this.mesh);this.reset();}
  reset(){for(const p of this.particles)p.life=0;this.carry=0;this.emitted=0;this.lastImpact=0;this.mesh.visible=false;}
  update(car:Vehicle,pose:{x:number;y:number;z:number;yaw:number},dt:number,active:boolean){
    if(!active){this.mesh.visible=false;return;}
    const impact=car.impact>this.lastImpact+.1;this.lastImpact=car.impact;
    this.carry+=dt*(car.boosting?35:Math.abs(car.wind)>.1?24:car.drifting?18:0);
    const count=Math.min(16,Math.floor(this.carry)+(impact?12:0));this.carry%=1;
    for(let i=0;i<count;i++){
      const p=this.particles[this.cursor++%64],side=this.cursor%2?1:-1;
      Object.assign(p,{x:pose.x+Math.sin(pose.yaw)*2+Math.cos(pose.yaw)*side*.8,y:pose.y-.25,z:pose.z+Math.cos(pose.yaw)*2-Math.sin(pose.yaw)*side*.8,vx:Math.cos(pose.yaw)*(car.wind*2+side),vz:-Math.sin(pose.yaw)*(car.wind*2+side),life:.5,size:car.boosting?.18:.32});this.emitted++;
    }
    let alive=0;
    this.particles.forEach((p,i)=>{p.life=Math.max(0,p.life-dt);if(p.life){p.x+=p.vx*dt;p.z+=p.vz*dt;p.y+=dt*.7;alive++;}this.dummy.position.set(p.x,p.y,p.z);this.dummy.scale.setScalar(p.life*p.size*2);this.dummy.updateMatrix();this.mesh.setMatrixAt(i,this.dummy.matrix);});
    this.mesh.instanceMatrix.needsUpdate=true;this.mesh.visible=alive>0;
    (this.mesh.material as THREE.MeshBasicMaterial).color.setHex(car.boosting?0x70ffe1:impact?0xffb45b:0xf4e4c9);
  }
  dispose(){this.mesh.removeFromParent();this.mesh.geometry.dispose();(this.mesh.material as THREE.Material).dispose();this.mesh.dispose();}
}
