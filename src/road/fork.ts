import type {RoadPoint, Socket} from './route';
export type Branch='left'|'right';
export type RouteProfile='balanced'|'technical'|'speed';
export const BRANCH_PROFILE:Record<Branch,RouteProfile>={left:'technical',right:'speed'};
export const PROFILE_LABEL:Record<RouteProfile,string>={balanced:'COSTA',technical:'TECNICA',speed:'VELOCE'};
export const FORK_COMMIT_DISTANCE=80;

/** Common 20 m mouths, two 12 m carriageways and a separated middle island.
 * Both curves have identical length and zero lateral derivative at the sockets.
 * s is shared forward stationing so racing gates work equally on either arm.
 */
export function forkPoints(entry:Socket,start:number,length:number,branch:Branch):RoadPoint[]{
  const points:RoadPoint[]=[],n=Math.ceil(length/2),side=branch==='left'?-1:1;
  for(let i=0;i<=n;i++){
    const u=i/n,offset=side*26*Math.sin(Math.PI*u)**2,derivative=side*26*Math.PI/length*Math.sin(2*Math.PI*u);
    points.push({x:entry.x-Math.sin(entry.yaw)*length*u+Math.cos(entry.yaw)*offset,y:entry.y,z:entry.z-Math.cos(entry.yaw)*length*u-Math.sin(entry.yaw)*offset,yaw:entry.yaw-Math.atan(derivative),s:start+length*u,width:12,branch});
  }
  return points;
}
