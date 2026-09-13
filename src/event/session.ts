import type RAPIER from '@dimforge/rapier3d-compat';
import type { ModularRoute } from '../road/route';
import type { Vehicle } from '../vehicle';
import { Race } from '../race';
import { TimeAttack } from './time-attack';
import { BAND_LABEL, EVENT_LABEL, formatSeconds, targetText, timeBand, type EventKind } from './rules';

export type CompetitiveEvent=Race|TimeAttack;
export function createEvent(kind:EventKind,route:ModularRoute,world:RAPIER.World,player:Vehicle,preservePlayer=false):CompetitiveEvent {
  return kind==='time-attack'?new TimeAttack(route,world,player,preservePlayer):new Race(route,world,player,preservePlayer);
}

/** Event-specific Italian presentation stays outside the rendering coordinator. */
export function eventView(event:CompetitiveEvent) {
  if(event.kind==='road-race')return {
    label:EVENT_LABEL[event.kind],objective:'6 PILOTI · RAGGIUNGI L’ARRIVO',
    status:`${event.position} / 6`,heading:`${event.position}° all’arrivo.`,details:'',
    standings:event.standings.map(r=>({name:r.name,you:r.id===0,value:r.finishTime!==null?formatSeconds(r.finishTime):r.vehicle.integrity<=0?'RITIRATO':event.elapsed>=(event.player.finishTime??Infinity)+30?'FUORI TEMPO':'IN PISTA'})),
  };
  const band=timeBand(event.player.finishTime??event.elapsed,event.targets);
  const remaining=band==='over-target'?null:event.targets[band]-(event.player.finishTime??event.elapsed);
  return {
    label:EVENT_LABEL[event.kind],objective:`CONTRO IL TEMPO · ${targetText(event.targets)}`,
    status:event.player.finishTime!==null?BAND_LABEL[band]:remaining===null?'FUORI OBIETTIVO · CONCLUDI':`${BAND_LABEL[band]} · ${formatSeconds(Math.max(0,remaining))} RIMASTI`,
    heading:`${BAND_LABEL[event.result.band]} · ${formatSeconds(event.result.time)}`,
    details:`${targetText(event.targets)}. Oro: ricompense migliori. Argento: standard. Entrambe riparano fino a 8 integrità prima del prossimo evento. Bronzo o fuori obiettivo: rarità ridotta e −8 integrità prima del prossimo evento. Concludi anche oltre il tempo; a integrità zero la run termina.`,
    standings:[],
  };
}
