import type RAPIER from '@dimforge/rapier3d-compat';
import type { ModularRoute } from '../road/route';
import type { Vehicle } from '../vehicle';
import type { Controls } from '../input';
import { PointToPoint } from './point-to-point';
import { timeTargets, timedResult } from './rules';

export class TimeAttack extends PointToPoint {
  readonly kind='time-attack' as const;
  readonly targets;
  readonly awaitingRivals=false;
  constructor(route:ModularRoute,world:RAPIER.World,player:Vehicle,preservePlayer=false) {
    const velocity={...player.body.linvel()},angular={...player.body.angvel()};
    super(route,world,player,1,preservePlayer);
    if(preservePlayer){
      player.body.setLinvel(velocity,true);player.body.setAngvel(angular,true);
      player.speed=Math.hypot(velocity.x,velocity.z);this.countdown=0;this.started=true;
    }
    this.targets=timeTargets(route);
  }
  get result() {return timedResult(this.player.finishTime??this.elapsed,this.targets);}
  override recover() {if(this.started&&!this.complete)super.recover();}
  override step(controls:Controls,dt:number) {
    if(this.complete)return;
    super.step(controls,dt);
  }
}
