import { randomStream } from '../road/seed';
import type { ModularRoute } from '../road/route';

export type EventKind = 'road-race' | 'time-attack';
export type TimeBand = 'gold' | 'silver' | 'bronze' | 'over-target';
export interface TimeTargets { readonly gold:number; readonly silver:number; readonly bronze:number }
export type EventResult =
  | {kind:'road-race';position:number;time:number}
  | {kind:'time-attack';position:number;time:number;band:TimeBand;targets:TimeTargets};
export const EVENT_LABEL:Record<EventKind,string> = {'road-race':'GARA SU STRADA','time-attack':'TIME ATTACK'};
export const BAND_LABEL:Record<TimeBand,string> = {gold:'ORO',silver:'ARGENTO',bronze:'BRONZO','over-target':'FUORI OBIETTIVO'};
export const BAND_POSITION:Record<TimeBand,number> = {gold:1,silver:3,bronze:6,'over-target':6};

/** Guarantees both modes and a Time Attack reward in the short coastal slice. */
export function eventSchedule(seed:string):readonly EventKind[] {
  return ['road-race','time-attack',randomStream(seed,'event-types-v1')()<.5?'road-race':'time-attack'];
}

/** Road-v3 speed envelope includes advance braking. Targets never depend on a build.
 * Integrate forward station distance (equal on both M5.1 arms), then allow for
 * acceleration and human driving. Version the stream when changing this tuning.
 */
export function timeTargets(route:ModularRoute):TimeTargets {
  const finish=route.chunks.at(-1)!.start+30;
  let reference=4;
  for(let s=route.start;s<finish;s+=2)reference+=Math.min(2,finish-s)/route.speedAt(s);
  const variation=.98+randomStream(route.seed,`time-targets-v1:${route.options.profile??'balanced'}`)()*.04;
  const gold=Math.ceil(reference*variation*1.08*100)/100;
  return Object.freeze({gold,silver:Math.ceil(gold*1.16*100)/100,bronze:Math.ceil(gold*1.35*100)/100});
}
export function timeBand(time:number,targets:TimeTargets):TimeBand {
  if(![targets.gold,targets.silver,targets.bronze].every(Number.isFinite)||targets.gold<=0||targets.silver<=targets.gold||targets.bronze<=targets.silver)throw new Error('Invalid Time Attack targets');
  if(!Number.isFinite(time)||time<0)throw new Error('Invalid Time Attack time');
  return time<=targets.gold?'gold':time<=targets.silver?'silver':time<=targets.bronze?'bronze':'over-target';
}
export function timedResult(time:number,targets:TimeTargets):Extract<EventResult,{kind:'time-attack'}> {
  const band=timeBand(time,targets);
  return {kind:'time-attack',position:BAND_POSITION[band],time,band,targets};
}
export function formatSeconds(time:number) {return `${time.toFixed(2).replace('.',',')} s`;}
export function targetText(targets:TimeTargets) {
  return `Oro ≤ ${formatSeconds(targets.gold)} · Argento ≤ ${formatSeconds(targets.silver)} · Bronzo ≤ ${formatSeconds(targets.bronze)}`;
}
