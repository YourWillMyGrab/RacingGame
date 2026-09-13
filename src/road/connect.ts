import { ModularRoute, type RoadPoint, type Socket } from './route';
import { validateConnection } from './modules';

/** Place an independently seeded event at the world's last socket, then append
 * its metadata. Existing chunks and their streamed GPU/physics resources survive.
 * Stations and chunk IDs are global; the event retains its own seed and bounds. */
export function placeRoad(next:ModularRoute,end:Socket,station:number,index:number) {
  if(next.chunks[0].start!==0||next.chunks[0].index!==0)throw new Error('Road already connected');
  const origin=next.chunks[0].entry,angle=end.yaw-origin.yaw;
  const cos=Math.cos(angle),sin=Math.sin(angle);
  const transform=<T extends Socket|RoadPoint>(p:T):T=>{
    const x=p.x-origin.x,z=p.z-origin.z;
    return {...p,x:end.x+cos*x+sin*z,y:end.y+p.y-origin.y,z:end.z-sin*x+cos*z,yaw:p.yaw+angle};
  };
  const point=(p:RoadPoint):RoadPoint=>({...transform(p),s:p.s+station,
    ...(p.forkIndex===undefined?{}:{forkIndex:p.forkIndex+index})});
  for(const chunk of next.chunks){
    chunk.entry=transform(chunk.entry);chunk.exit=transform(chunk.exit);
    chunk.points=chunk.points.map(point);
    if(chunk.branches)chunk.branches={left:chunk.branches.left.map(point),right:chunk.branches.right.map(point)};
    chunk.start+=station;chunk.end+=station;chunk.index+=index;
  }
  next.points.splice(0,next.points.length,...next.chunks.flatMap((c,i)=>i?c.points.slice(1):c.points));
  next.start+=station;next.length+=station;
  if(!validateConnection(end,next.chunks[0].entry))throw new Error('Disconnected event socket');
  return next;
}

export function connectRoad(road:ModularRoute,next:ModularRoute) {
  if(next===road)throw new Error('Cannot connect road to itself');
  placeRoad(next,road.chunks.at(-1)!.exit,road.length,road.chunks.length);
  road.chunks.push(...next.chunks);road.points.push(...next.points.slice(1));road.length=next.length;
  return next;
}
