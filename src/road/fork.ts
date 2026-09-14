import type {RoadPoint, Socket} from './route';
export type Branch='left'|'right';
export type RouteProfile='balanced'|'technical'|'speed';
export const BRANCH_PROFILE:Record<Branch,RouteProfile>={left:'technical',right:'speed'};
export const PROFILE_LABEL:Record<RouteProfile,string>={balanced:'COSTA',technical:'TECNICA',speed:'VELOCE'};
export const FORK_COMMIT_DISTANCE=80;

/** Shared forward stations keep gates comparable. The technical arm winds
 * around the island; the express arm follows a broad, shorter arc. */
export function forkPoints(entry:Socket,start:number,length:number,branch:Branch,variation=0):RoadPoint[]{
  const points:RoadPoint[]=[],n=Math.ceil(length/2),side=branch==='left'?-1:1;
  for(let i=0;i<=n;i++){
    const u=i/n,envelope=Math.sin(Math.PI*u)**2;
    const amplitude=branch==='left'?76+variation*8:38+variation*4;
    const waves=branch==='left'?4:2,ripple=branch==='left'?.38:.08;
    const shape=1+ripple*Math.sin(waves*Math.PI*u);
    const offset=side*amplitude*envelope*shape;
    const derivative=side*amplitude/length*(Math.PI*Math.sin(2*Math.PI*u)*shape+envelope*ripple*waves*Math.PI*Math.cos(waves*Math.PI*u));
    points.push({x:entry.x-Math.sin(entry.yaw)*length*u+Math.cos(entry.yaw)*offset,y:entry.y,z:entry.z-Math.cos(entry.yaw)*length*u-Math.sin(entry.yaw)*offset,yaw:entry.yaw-Math.atan(derivative),s:start+length*u,width:12,branch});
  }
  return points;
}
