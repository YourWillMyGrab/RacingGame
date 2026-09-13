import RAPIER from '@dimforge/rapier3d-compat';
import { ModularRoute } from '../road/route';
import { connectRoad } from '../road/connect';
import { Run } from '../run';
import { Vehicle } from '../vehicle';
import { buildSettings,attachBuild } from '../upgrades';
import type { Controls } from '../input';
import { createEvent,type CompetitiveEvent } from './session';
import { IDLE } from './point-to-point';

/** A run owns one physical player and one append-only road. Events own only
 * their rules and rivals. The transfer drives on the same streamed surface. */
export class EventJourney {
  readonly road:ModularRoute;
  route:ModularRoute;
  event:CompetitiveEvent|undefined;
  transferring=false;
  hold=0;
  private detach=()=>{};
  private transferStart=0;
  constructor(readonly run:Run,private world:RAPIER.World,readonly vehicle:Vehicle,route:ModularRoute,event:CompetitiveEvent){
    this.route=route;this.road=route;this.event=event;this.applyBuild();
  }
  private applyBuild(){
    this.detach();this.vehicle.applySettings(buildSettings(this.run.owned));
    this.detach=attachBuild(this.vehicle,this.run.owned);
  }
  choose(id:string){
    if(this.transferring||!this.event?.complete)throw new Error('Event is not finished');
    this.run.choose(id);
    this.event.disposeRivals();this.event=undefined;
    this.route=connectRoad(this.road,new ModularRoute(this.run.routeSeed,this.run.moduleCount,this.run.routeOptions));
    this.applyBuild();this.vehicle.integrity=this.run.integrity;this.vehicle.flow=this.run.flow;
    this.vehicle.route=this.road.cursor();
    this.vehicle.body.setBodyType(RAPIER.RigidBodyType.Dynamic,true);
    // Rapier can retain the pre-finish dynamic velocity while the body is
    // kinematic. Resume from the stopped finish pose, including controller input.
    this.vehicle.body.setLinvel({x:0,y:0,z:0},true);
    this.vehicle.body.setAngvel({x:0,y:0,z:0},true);
    this.vehicle.body.resetForces(true);this.vehicle.body.resetTorques(true);
    this.vehicle.collider.setCollisionGroups(0x00020003);
    this.transferStart=this.vehicle.progress;this.hold=0;this.transferring=true;
  }
  recover(){
    if(!this.transferring){this.event?.recover();return;}
    const count=this.vehicle.recoveries;this.vehicle.recover();
    if(this.vehicle.recoveries>count)this.hold=3;
  }
  step(controls:Controls,dt:number){
    if(!this.transferring){this.event?.step(controls,dt);return;}
    if(this.run.phase==='failed')return;
    const before=this.vehicle.progress,recoveries=this.vehicle.recoveries;
    this.hold=Math.max(0,this.hold-dt);
    this.vehicle.step(this.hold>0?IDLE:controls,dt);
    if(this.vehicle.recoveries>recoveries)this.hold=3;
    if(this.hold>0)this.vehicle.body.setLinvel({x:0,y:this.vehicle.body.linvel().y,z:0},true);
    this.world.step();this.vehicle.afterStep();
    if(this.vehicle.integrity<=0){this.run.failTransfer(this.vehicle.flow);return;}
    // No nearest-point jump, recovery teleport or skipped gate can start an event.
    if(before<this.route.start&&this.vehicle.progress>=this.route.start&&this.vehicle.progress-before<=12&&this.vehicle.recoveries===recoveries){
      this.vehicle.route=this.route.cursor();
      this.event=createEvent(this.run.eventType,this.route,this.world,this.vehicle,true);
      this.transferring=false;
    }else if(this.vehicle.progress>this.route.start+8){
      this.vehicle.lastAnchor=Math.max(this.transferStart,this.route.start-8);this.recover();
    }
  }
  dispose(){this.detach();}
}
