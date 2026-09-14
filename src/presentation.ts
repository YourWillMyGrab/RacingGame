/** Rendering is one physics tick behind simulation, independent of display Hz. */
export interface Pose { x:number; y:number; z:number; yaw:number }
export function angleDelta(from:number,to:number){return Math.atan2(Math.sin(to-from),Math.cos(to-from));}
export class PoseBuffer {
  private previous:Pose;
  private current:Pose;
  constructor(pose:Pose){this.previous={...pose};this.current={...pose};}
  capture(pose:Pose){
    this.previous=this.current;this.current={...pose};
    if(Math.hypot(pose.x-this.previous.x,pose.y-this.previous.y,pose.z-this.previous.z)>5)this.reset(pose);
  }
  reset(pose:Pose){this.previous={...pose};this.current={...pose};}
  sample(alpha:number):Pose {
    const a=this.previous,b=this.current,t=Math.max(0,Math.min(1,alpha));
    return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t,yaw:a.yaw+angleDelta(a.yaw,b.yaw)*t};
  }
}
