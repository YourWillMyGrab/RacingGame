import type RAPIER from '@dimforge/rapier3d-compat';
import type {ModularRoute} from './road/route';
import type {Vehicle} from './vehicle';
import {PointToPoint} from './event/point-to-point';
export {IDLE,advanceCheckpoint} from './event/point-to-point';
export type {Racer,Finish} from './event/point-to-point';

/** Standard six-car Road Race; Time Attack shares only the physical session. */
export class Race extends PointToPoint {
  readonly kind = 'road-race' as const;
  constructor(route:ModularRoute,world:RAPIER.World,player:Vehicle) {super(route,world,player,6);}
  get result() {return {kind:this.kind,position:this.position,time:this.player.finishTime??this.elapsed};}
  get awaitingRivals() {return this.order.length<6 && this.elapsed<(this.player.finishTime??0)+30;}
}
