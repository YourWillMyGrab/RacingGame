import {randomStream} from './road/seed';
import type {RoadModule} from './road/modules';

export const COAST={id:'lighthouse-coast-v1',name:'COSTA DEL FARO',sky:0x829ca6,sea:0x246b77,road:0x39454a,wall:0xe2c9a0,rock:0x665e58,white:0xf7e8c9,accent:0xe98a46};
/** Local stations survive placement/streaming without rerolling the event seed. */
export interface WindZone {from:number;to:number;direction:1|-1;strength:number}
export function coastWind(seed:string,index:number,module:RoadModule):WindZone|undefined {
  if(module.category!=='start'&&!(['straight','bridge'].includes(module.category)&&module.length>=140))return;
  const rng=randomStream(seed,`coast-wind-v1:${index}`);
  return {from:module.category==='start'?95:70,to:module.length-5,direction:rng()<.5?-1:1,strength:4+rng()};
}
export function windAcceleration(zone:WindZone|undefined,localStation:number) {
  if(!zone||localStation<=zone.from||localStation>=zone.to)return 0;
  const ramp=Math.min(1,(localStation-zone.from)/6,(zone.to-localStation)/6);
  return zone.direction*zone.strength*ramp;
}
