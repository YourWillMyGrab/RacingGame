import RAPIER from '@dimforge/rapier3d-compat';
import { ModularRoute,RouteCursor } from '../road/route';
import { randomStream } from '../road/seed';
import { Vehicle } from '../vehicle';
import type { Controls } from '../input';
import { DEFAULT_TUNING } from '../config';
import {FaroTactics} from '../special-rival';

export const IDLE:Controls={throttle:0,brake:0,steer:0,handbrake:false,boost:false};
export interface Racer { id:number; name:string; color:number; vehicle:Vehicle; preferredLane:number; lane:number; pace:number; aggression:number; checkpoint:number; previous:number; finishTime:number|null; stuck:number; hold:number; special?:FaroTactics }
export interface Finish { id:number; name:string; time:number }

/** Ordered gates prevent a jump in nearest-road progress from becoming a finish. */
export function advanceCheckpoint(previous:number,current:number,next:number,finish:number):number {
  if(current<previous || current-previous>12)return next;
  return next<finish && previous<next && current>=next ? Math.min(finish,next+80) : next;
}

export class PointToPoint {
  readonly racers:Racer[]=[];
  readonly finish:number;
  readonly order:Finish[]=[];
  countdown=3;
  elapsed=0;
  started=false;
  finishVelocity={x:0,y:0,z:0};
  constructor(readonly route:ModularRoute,private world:RAPIER.World,player:Vehicle,participants:number,preservePlayer=false) {
    this.finish=route.chunks.at(-1)!.start+30;
    const rng=randomStream(route.seed,'rivals-v1');
    const names=['TU','MICA','SABLE','ECHO','ROOK','VANTA'],colors=[0xff704a,0x49dbc9,0xf4c95f,0x7da9ff,0xf2f1dd,0xb68cff];
    for(let i=0;i<participants;i++) {
      const vehicle=i?new Vehicle(world,route,{...DEFAULT_TUNING}):player;
      if(i&&vehicle.route instanceof RouteCursor)for(const c of route.chunks)if(c.branches)vehicle.route.plans.set(c.index,i%2?'right':'left');
      const lane=i%2===0?-3:3,s=route.start+Math.floor(i/2)*8+(preservePlayer&&i?12:0),p=route.pointAt(s);
      if(i||!preservePlayer){
        vehicle.body.setTranslation({x:p.x+Math.cos(p.yaw)*lane,y:p.y+1,z:p.z-Math.sin(p.yaw)*lane},true);
        vehicle.body.setRotation({x:0,y:Math.sin(p.yaw/2),z:0,w:Math.cos(p.yaw/2)},true);
        vehicle.progress=s;vehicle.lastAnchor=s;
      }
      vehicle.body.setLinvel({x:0,y:0,z:0},true);vehicle.body.setAngvel({x:0,y:0,z:0},true);
      vehicle.speed=0;vehicle.collider.setCollisionGroups(0x00020003);
      vehicle.renderPose.reset({...vehicle.body.translation(),yaw:vehicle.yaw});
      this.racers.push({id:i,name:i===5?'FARO':names[i],color:i===5?0xffae48:colors[i],vehicle,preferredLane:lane,lane,pace:.70+rng()*.2,aggression:rng(),checkpoint:route.start+40,previous:vehicle.progress,finishTime:null,stuck:0,hold:0,...(i===5?{special:new FaroTactics()}: {})});
    }
  }
  get player() {return this.racers[0];}
  get complete() {return this.player.finishTime!==null || this.player.vehicle.integrity<=0;}
  get position() {return this.standings.findIndex(r=>r.id===0)+1;}
  get standings() {
    return [...this.racers].sort((a,b)=>{
      if(a.finishTime!==null || b.finishTime!==null)return a.finishTime===null?1:b.finishTime===null?-1:a.finishTime-b.finishTime||a.id-b.id;
      if((a.vehicle.integrity<=0)!==(b.vehicle.integrity<=0))return a.vehicle.integrity<=0?1:-1;
      return b.vehicle.progress-a.vehicle.progress||a.id-b.id;
    });
  }
  recover(id=0) {const r=this.racers[id],before=r.vehicle.recoveries;if(r.vehicle.progress>=r.checkpoint)r.vehicle.lastAnchor=Math.min(r.vehicle.lastAnchor,r.checkpoint-6);r.vehicle.recover();if(r.vehicle.recoveries>before){r.hold=3;r.previous=r.vehicle.progress;r.stuck=0;}}
  private controls(r:Racer,dt:number):Controls {
    const car=r.vehicle,p=car.body.translation();
    if(car.progress>r.checkpoint+8){this.recover(r.id);return IDLE;}
    let lane=r.preferredLane;
    const ahead=this.racers.find(other=>other!==r && other.finishTime===null && other.vehicle.progress>car.progress && other.vehicle.progress-car.progress<20 && Math.hypot(other.vehicle.body.translation().x-p.x,other.vehicle.body.translation().z-p.z)<22);
    if(ahead)lane=ahead.lane>=0?-4.5:4.5;
    const module=this.route.moduleAt(car.progress+25),technical=module.definition.difficulty===3;
    const clear=!ahead&&!module.branches&&!this.route.windZone(car.progress)&&this.route.speedAt(car.progress+80)>30&&Math.abs(car.slip)<.08&&car.flow>12;
    const phase=r.special?.step(clear,dt);
    if(r.special&&technical)lane=0;
    if(technical)lane*=.5;
    if(module.branches)lane=0;
    r.lane+=(lane-r.lane)*Math.min(1,dt*1.5);
    const target=car.route.pointAt(car.progress+6+car.speed*.32);
    const tx=target.x+Math.cos(target.yaw)*r.lane,tz=target.z-Math.sin(target.yaw)*r.lane;
    const desired=Math.atan2(-(tx-p.x),-(tz-p.z));
    const error=Math.atan2(Math.sin(desired-car.yaw),Math.cos(desired-car.yaw));
    const targetSpeed=this.route.speedAt(car.progress)*(r.special?(phase==='attack'?1.04:.86):(.88+r.aggression*.08));
    if(car.speed<1.5 && this.elapsed>5)r.stuck+=dt;else r.stuck=0;
    if(r.stuck>4)this.recover(r.id);
    return {throttle:car.speed>targetSpeed?0:r.special?(phase==='attack'?1:.78):r.pace,brake:car.speed>targetSpeed+.8?.65:0,steer:Math.max(-1,Math.min(1,error*3)),handbrake:false,boost:r.special?phase==='attack'&&Math.abs(error)<.06&&car.speed<targetSpeed: this.route.speedAt(car.progress+80)>30&&Math.abs(error)<.04&&car.speed<targetSpeed-2&&car.flow>35&&!ahead&&r.aggression>.65};
  }
  step(playerControls:Controls,dt:number) {
    if(!this.started) {
      this.countdown=Math.max(0,this.countdown-dt);
      // Keep grid coordinates locked while allowing suspension to settle.
      for(const r of this.racers){const flow=r.vehicle.flow,integrity=r.vehicle.integrity;r.vehicle.step(IDLE,dt);r.vehicle.flow=flow;r.vehicle.integrity=integrity;r.vehicle.body.setLinvel({x:0,y:r.vehicle.body.linvel().y,z:0},true);}
      this.world.step();
      for(const r of this.racers)r.vehicle.renderPose.capture({...r.vehicle.body.translation(),yaw:r.vehicle.yaw});
      if(this.countdown===0)this.started=true;return;
    }
    this.elapsed+=dt;
    for(const r of this.racers) {
      if(r.finishTime!==null)continue;
      r.hold=Math.max(0,r.hold-dt);
      const controls=r.hold>0?IDLE:r.id===0?playerControls:this.controls(r,dt);
      r.vehicle.step(controls,dt);
      if(r.hold>0)r.vehicle.body.setLinvel({x:0,y:r.vehicle.body.linvel().y,z:0},true);
    }
    this.world.step();
    const crossings:{r:Racer;time:number}[]=[];
    for(const r of this.racers) {
      if(r.finishTime!==null)continue;
      r.vehicle.afterStep();
      const progress=r.vehicle.progress;
      r.checkpoint=advanceCheckpoint(r.previous,progress,r.checkpoint,this.finish);
      if(r.checkpoint===this.finish && r.previous<this.finish && progress>=this.finish && progress-r.previous<=12 && r.vehicle.integrity>0) {
        crossings.push({r,time:this.elapsed-dt+dt*(this.finish-r.previous)/Math.max(.001,progress-r.previous)});
      }
      r.previous=progress;
    }
    crossings.sort((a,b)=>a.time-b.time||a.r.id-b.r.id);
    for(const {r,time} of crossings){
      if(r.id===0)this.finishVelocity={...r.vehicle.body.linvel()};
      r.finishTime=time;r.vehicle.collider.setCollisionGroups(0x00020001);
      r.vehicle.body.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased,true);
      r.vehicle.body.setLinvel({x:0,y:0,z:0},true);r.vehicle.body.setAngvel({x:0,y:0,z:0},true);
      r.vehicle.speed=0;r.vehicle.flowSource='none';r.vehicle.boosting=false;r.vehicle.drifting=false;
      this.order.push({id:r.id,name:r.name,time});
    }
  }
  disposeRivals(){for(const r of this.racers.slice(1))this.world.removeRigidBody(r.vehicle.body);}
}
