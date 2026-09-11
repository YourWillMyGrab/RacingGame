import RAPIER from '@dimforge/rapier3d-compat';
import { tuning as t } from './config';
import type { Controls } from './input';
import { nearestAnchor, trackPoint, TRACK, TRACK_LENGTH } from './track';
import type { DrivableRoute } from './road/route';
import { EventBus } from './events';

export interface VehicleEvent { car:Vehicle;dt:number;amount:number;input:Controls }
export interface VehicleEvents { tick:VehicleEvent;drift:VehicleEvent;driftExit:VehicleEvent;boost:VehicleEvent;damage:VehicleEvent;landing:VehicleEvent }

const labRoute: DrivableRoute = {length:TRACK_LENGTH,start:25,pointAt:s=>({...trackPoint(s),y:0,s,width:TRACK.width}),nearest:(x,z)=>({...nearestAnchor(x,z),y:0,width:TRACK.width})};

const clamp = (v: number, min: number, max: number) => Math.min(max,Math.max(min,v));
export class Vehicle {
  body: RAPIER.RigidBody;
  collider: RAPIER.Collider;
  flow = 25;
  flowSource:'none'|'drift'|'corner'|'speed'|'exit'='none';
  flowEarned=0;
  integrity = 100;
  speed = 0;
  slip = 0;
  grounded = false;
  contacts = 0;
  drifting = false;
  boosting = false;
  steer = 0;
  driftTime = 0;
  impact = 0;
  recoveries = 0;
  penalty = 0;
  lastAnchor = 25;
  progress = 25;
  readonly events=new EventBus<VehicleEvents>();
  power=1;
  surge=0;
  private cooldown = 0;
  private previousSpeed = 0;
  private airTime = 0;
  private reverseArmed = false;
  private stopTime = 0;
  constructor(private world: RAPIER.World, readonly route:DrivableRoute=labRoute, readonly settings=t) {
    const p=route.pointAt(route.start);
    this.lastAnchor=route.start;this.progress=route.start;
    this.body=world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(p.x,p.y+1,p.z).setCanSleep(false).setCcdEnabled(true));
    this.body.setEnabledRotations(false,true,false,true);
    this.collider=world.createCollider(RAPIER.ColliderDesc.cuboid(.92,.28,1.95).setMass(settings.mass).setFriction(.05).setRestitution(.08).setCollisionGroups(0x00020003),this.body);
  }
  get yaw() { const q=this.body.rotation(); return Math.atan2(2*q.w*q.y,1-2*q.y*q.y); }
  step(input: Controls, dt: number) {
    const t=this.settings;
    this.power=1;this.surge=Math.max(0,this.surge-dt);
    this.events.emit('tick',{car:this,dt,amount:0,input});
    const p=this.body.translation(), v=this.body.linvel(), yaw=this.yaw;
    const fx=-Math.sin(yaw), fz=-Math.cos(yaw), rx=Math.cos(yaw), rz=-Math.sin(yaw);
    const forward=v.x*fx+v.z*fz, lateral=v.x*rx+v.z*rz;
    this.speed=Math.hypot(v.x,v.z);
    this.slip=Math.atan2(lateral,Math.max(2,Math.abs(forward)));
    this.body.resetForces(true); this.body.resetTorques(true);
    this.contacts=0;
    let springForce=0;
    for(const x of [-.8,.8]) for(const z of [-1.35,1.35]) {
      const origin={x:p.x+rx*x+Math.sin(yaw)*z,y:p.y,z:p.z+rz*x+Math.cos(yaw)*z};
      const hit=this.world.castRay(new RAPIER.Ray(origin,{x:0,y:-1,z:0}),t.springLength,true,undefined,undefined,undefined,this.body);
      if(hit) { this.contacts++; springForce+=clamp((t.springLength-hit.timeOfImpact)*t.spring-v.y*t.damper,0,18000); }
    }
    this.grounded=this.contacts>=2;
    this.body.addForce({x:0,y:springForce-(this.grounded?this.speed*this.speed*t.downforce:0),z:0},true);
    this.steer+=(input.steer-this.steer)*(1-Math.exp(-t.steerResponse*dt));
    const canDrive=this.integrity>0;
    this.boosting=canDrive && input.boost && input.throttle>.1 && this.flow>0 && this.grounded && forward>2;
    const previousDrift=this.driftTime;
    this.drifting=canDrive && this.grounded && forward>t.minDriftSpeed && Math.abs(this.slip)>t.minSlip && Math.abs(this.slip)<t.maxSlip && !input.handbrake && input.throttle>.1;
    if(this.drifting)this.events.emit('drift',{car:this,dt,amount:0,input});
    else if(previousDrift>.35 && this.grounded && Math.abs(this.slip)<t.minSlip)this.events.emit('driftExit',{car:this,dt,amount:previousDrift,input});
    if(this.boosting)this.events.emit('boost',{car:this,dt,amount:0,input});
    this.flowSource='none';let earned=0;
    const clean=canDrive&&this.grounded&&!input.handbrake&&this.cooldown===0;
    if(this.drifting&&clean){this.driftTime+=dt;earned=t.driftFlow*dt*(Math.abs(this.slip)/t.maxSlip+.6);this.flowSource='drift';}
    else {
      this.driftTime=0;
      if(clean&&previousDrift>.35&&Math.abs(this.slip)<t.minSlip){earned=t.cleanExitFlow;this.flowSource='exit';}
      else if(clean&&!this.boosting&&forward>9&&Math.abs(this.steer)>.12&&Math.abs(this.slip)<.45){earned=t.cornerFlow*dt;this.flowSource='corner';}
      else if(clean&&!this.boosting&&forward>t.speedFlowThreshold){earned=t.speedFlow*dt;this.flowSource='speed';}
      else if(this.speed<5)this.flow-=.15*dt;
    }
    this.flow+=earned;this.flowEarned+=earned;
    if(this.boosting) this.flow-=t.flowDrain*dt;
    this.flow=clamp(this.flow,0,100);
    if(this.grounded && canDrive) {
      // Braking from speed must stop before a deliberate second press engages reverse.
      if(input.brake<.1) { this.reverseArmed=Math.abs(forward)<1; this.stopTime=0; }
      if(Math.abs(forward)<.6 && input.brake>.1) this.stopTime+=dt;
      const reversing=this.reverseArmed || this.stopTime>.7;
      const max=this.boosting?t.boostMaxSpeed:t.maxSpeed;
      let force=input.throttle*t.engine*this.power*(this.surge>0?1.6:1)*clamp(1-Math.max(0,forward)/max,0,1);
      if(input.brake>0) force+=forward>1 ? -input.brake*t.brakes : reversing ? -input.brake*t.reverse*clamp(1+forward/t.reverseSpeed,0,1) : -forward*t.mass*8;
      if(input.throttle>.1 && forward<0) force+=-forward*t.mass*3;
      if(this.boosting) force+=t.boostForce*clamp(1-forward/t.boostMaxSpeed,0,1);
      if(input.handbrake) force-=forward*t.mass*.65;
      const grip=input.handbrake?t.driftGrip:t.grip;
      const side=clamp(-lateral*grip,-t.maxLateralAccel,t.maxLateralAccel)*t.mass;
      this.body.addForce({x:fx*force+rx*side,y:0,z:fz*force+rz*side},true);
      const speedSteer=t.steer+(t.highSpeedSteer-t.steer)*clamp(Math.abs(forward)/50,0,1);
      const desired=this.steer*speedSteer*clamp(forward/12,-.6,1)*(input.handbrake?t.driftRotation:1);
      this.body.setAngvel({x:0,y:this.body.angvel().y+(desired-this.body.angvel().y)*(1-Math.exp(-t.yawResponse*dt)),z:0},true);
    } else this.body.setAngvel({x:0,y:this.body.angvel().y*Math.exp(-dt),z:0},true);
    const drag=(t.rollingDrag+t.drag*this.speed)*t.mass;
    this.body.addForce({x:-v.x*drag,y:0,z:-v.z*drag},true);
    this.cooldown=Math.max(0,this.cooldown-dt); this.impact*=Math.exp(-dt*5);
    // Progress follows the road corridor in the air too; only safe recovery
    // anchors require wheel contact. Otherwise a crest could skip a race gate.
    const anchor=this.route.nearest(p.x,p.z,this.progress);
    if(anchor.distance<anchor.width/2+.5)this.progress=anchor.s;
    if(this.grounded) {
      if(this.airTime>.3)this.events.emit('landing',{car:this,dt,amount:this.airTime,input});
      if(this.airTime>.3 && v.y < -6) this.damage((-v.y-6)*t.damageScale);
      this.airTime=0;
      if(anchor.distance<anchor.width/2-2 && this.speed>2)this.lastAnchor=anchor.s;
    } else this.airTime+=dt;
    if(p.y < -8) this.recover();
    this.previousSpeed=this.speed;
  }
  afterStep() {
    const t=this.settings;
    const v=this.body.linvel(), speed=Math.hypot(v.x,v.z);
    const lost=this.previousSpeed-speed;
    if(lost>t.impactThreshold) this.damage((lost-t.impactThreshold)*t.damageScale);
  }
  private damage(amount: number) {
    if(this.cooldown>0 || amount<=0) return;
    this.integrity=clamp(this.integrity-amount,0,100); this.cooldown=.5; this.impact=Math.min(1,amount/25);
    this.events.emit('damage',{car:this,dt:0,amount,input:{throttle:0,brake:0,steer:0,handbrake:false,boost:false}});
  }
  recover() {
    if(this.integrity<=0) return;
    let p=this.route.pointAt(this.lastAnchor);
    // Search backward if another racer occupies the recovery anchor.
    let free=false;
    for(let back=0;back<=90;back+=6) {
      p=this.route.pointAt(Math.max(0,this.lastAnchor-back));
      const rotation={x:0,y:Math.sin(p.yaw/2),z:0,w:Math.cos(p.yaw/2)};
      if(!this.world.intersectionWithShape({x:p.x,y:p.y+1.2,z:p.z},rotation,new RAPIER.Cuboid(1,.3,2.1),undefined,undefined,undefined,this.body)){free=true;break;}
    }
    if(!free)return;
    this.body.setTranslation({x:p.x,y:p.y+1.2,z:p.z},true);
    this.body.setRotation({x:0,y:Math.sin(p.yaw/2),z:0,w:Math.cos(p.yaw/2)},true);
    this.body.setLinvel({x:0,y:0,z:0},true); this.body.setAngvel({x:0,y:0,z:0},true);
    this.body.resetForces(true); this.body.resetTorques(true);
    this.speed=0; this.previousSpeed=0; this.steer=0; this.slip=0; this.driftTime=0; this.airTime=0;this.cooldown=1;
    this.boosting=false;this.drifting=false; this.penalty+=t.recoveryPenalty; this.recoveries++;
    this.progress=p.s;this.lastAnchor=p.s;
  }
  restart() {
    this.integrity=100;this.lastAnchor=this.route.start;this.recover();this.flow=25;this.penalty=0;this.recoveries=0;
    this.reverseArmed=false;this.stopTime=0;
    this.surge=0;this.power=1;
    this.flowEarned=0;this.flowSource='none';
  }
}
