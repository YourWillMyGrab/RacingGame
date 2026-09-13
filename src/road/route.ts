import { MODULES, FORK_MODULE, SPEED_RELEASE, validateModule, validateConnection, type RoadModule, type Socket } from './modules';
import { normalizeSeed, randomStream } from './seed';
import {forkPoints,FORK_COMMIT_DISTANCE,type Branch,type RouteProfile} from './fork';
export type {Socket} from './modules';

export interface RoadPoint { x: number; y: number; z: number; yaw: number; s: number; width: number; branch?:Branch; forkIndex?:number }
export interface RoadAnchor extends RoadPoint { distance: number }
export interface DrivableRoute {
  length: number;
  start: number;
  pointAt(s: number): RoadPoint;
  nearest(x: number,z: number,hint?: number): RoadAnchor;
  cursor?():RouteCursor;
}
export interface PlacedModule { definition: RoadModule; index: number; start: number; end: number; entry: Socket; exit: Socket; points: RoadPoint[]; branches?:Record<Branch,RoadPoint[]> }
export interface RouteOptions {forks?:boolean;profile?:RouteProfile}

export class ModularRoute implements DrivableRoute {
  readonly seed: string;
  readonly chunks: PlacedModule[]=[];
  readonly points: RoadPoint[]=[];
  length=0;
  start=25;
  constructor(seed: string, count=24,readonly options:RouteOptions={}) {
    if(!Number.isInteger(count)||count<5||count>128) throw new Error('Module count must be between 5 and 128');
    this.seed=normalizeSeed(seed);
    const rng=randomStream(this.seed,options.forks||options.profile&&options.profile!=='balanced'?`road-v3:${options.profile??'balanced'}`:'road-v2');
    let socket:Socket={x:64,y:0,z:95,yaw:0,grade:0,width:20};
    for(let i=0;i<count;i++) {
      const previous=this.chunks.at(-1)?.definition;
      let options=MODULES.filter(m=>m.category!=='start'&&m.category!=='finish'&&m.id!==previous?.id
        && Math.abs(socket.yaw+m.turn)<=.8 && Math.abs(socket.yaw)+Math.abs(m.wave)<=1
        && !(previous && previous.difficulty>=2 && m.difficulty>=2));
      // Rhythm: flowing release, prepare/alignment, guaranteed braking sector.
      if(i%3===2)options=options.filter(m=>m.difficulty===3);
      else if(i%3===1)options=options.filter(m=>m.difficulty<2&&Math.abs(socket.yaw+m.turn)<.001);
      else options=options.filter(m=>m.difficulty<3&&m.wave===0&&Math.abs(m.turn)!==.32);
      if(this.options.profile==='technical'&&i%3===2)options=options.filter(m=>m.id==='harbor-switchbacks');
      if(this.options.profile==='technical'&&i%3===0&&options.some(m=>Math.abs(m.turn)===.5))options=options.filter(m=>Math.abs(m.turn)===.5);
      const m=i===0?MODULES[0]:i===count-1?MODULES.at(-1)!:this.options.forks&&i===6&&count>=9?FORK_MODULE:this.options.profile==='speed'&&i%3===0?SPEED_RELEASE:options[Math.floor(rng()*options.length)];
      if(!m || validateModule(m).length) throw new Error(`Invalid authored module: ${m?.id}`);
      const start=this.length, n=Math.ceil(m.length/2), points:RoadPoint[]=[];
      let x=socket.x,z=socket.z;
      for(let j=0;j<=n;j++) {
        const u=j/n;
        if(j) {const mid=(j-.5)/n, a=socket.yaw+m.turn*mid+m.wave*Math.sin(mid*Math.PI*2);x-=Math.sin(a)*m.length/n;z-=Math.cos(a)*m.length/n;}
        points.push({x,y:socket.y+m.rise*Math.sin(Math.PI*u)**2,z,yaw:socket.yaw+m.turn*u+m.wave*Math.sin(u*Math.PI*2),s:start+m.length*u,width:m.width-(m.width-m.minWidth)*Math.sin(Math.PI*u)**2});
      }
      const branches=m.category==='fork'?{left:forkPoints(socket,start,m.length,'left'),right:forkPoints(socket,start,m.length,'right')}:undefined;
      if(branches){for(const arm of Object.values(branches))for(const p of arm)p.forkIndex=i;points.splice(0,points.length,...branches.left);}
      const last=points.at(-1)!;
      const exit={x:last.x,y:last.y,z:last.z,yaw:last.yaw,grade:0,width:m.width};
      this.chunks.push({definition:m,index:i,start,end:start+m.length,entry:{...socket},exit,points,branches});
      this.points.push(...(i?points.slice(1):points));
      this.length+=m.length; socket=exit;
    }
    const issues=this.validate(); if(issues.length) throw new Error(issues.join(', '));
  }
  cursor(){return new RouteCursor(this);}
  pointAt(s: number,branch:Branch='left'): RoadPoint {
    s=Math.max(this.chunks[0].start,Math.min(this.length,s));
    const chunk=this.moduleAt(s),points=chunk.branches?.[branch]??chunk.points;
    let lo=0,hi=points.length-1;
    while(lo+1<hi) {const mid=(lo+hi)>>1;if(points[mid].s<=s)lo=mid;else hi=mid;}
    const a=points[lo], b=points[hi], t=(s-a.s)/(b.s-a.s);
    return {...a,x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t,yaw:a.yaw+(b.yaw-a.yaw)*t,s,width:a.width+(b.width-a.width)*t};
  }
  nearest(x: number,z: number,hint?: number,choices?:ReadonlyMap<number,Branch>): RoadAnchor {
    let best=this.points[0],distance=Infinity;
    // Hint limits hot-loop work and prevents accidental jumps along the route.
    for(const chunk of this.chunks) {
      if(hint!==undefined&&(chunk.end<hint-100||chunk.start>hint+100))continue;
      const arms=chunk.branches?(choices?.has(chunk.index)?[chunk.branches[choices.get(chunk.index)!]]:[chunk.branches.left,chunk.branches.right]):[chunk.points];
      for(const points of arms)for(const p of points) {
      if(hint!==undefined && Math.abs(p.s-hint)>100) continue;
      const d=(p.x-x)**2+(p.z-z)**2;
      if(d<distance){best=p;distance=d;}
      }
    }
    return {...best,distance:Math.sqrt(distance)};
  }
  moduleAt(s: number) { return s<this.chunks[0].start?this.chunks[0]:this.chunks.find(c=>s>=c.start && s<c.end) ?? this.chunks.at(-1)!; }
  speedAt(s:number) {
    let speed=35;
    for(const c of this.chunks)if(c.end>=s&&c.start<s+120)speed=Math.min(speed,Math.sqrt(c.definition.recommendedSpeed**2+16*Math.max(0,c.start-s-8)));
    return speed;
  }
  brakingZone(s:number) {return this.chunks.find(c=>c.definition.difficulty===3&&c.end>s&&c.start<s+110);}
  validate(): string[] {
    const errors:string[]=[];
    let frame=this.chunks[0].entry.yaw;
    const forwardZ=(a:RoadPoint,b:RoadPoint)=>(b.z-a.z)*Math.cos(frame)+(b.x-a.x)*Math.sin(frame);
    for(let i=0;i<this.chunks.length;i++) {
      const c=this.chunks[i]; errors.push(...validateModule(c.definition).map(e=>`${c.index}:${e}`));
      // Connected events retain their authored corridor in a rotated frame.
      if(c.definition.category==='start')frame=c.entry.yaw;
      if(i && !validateConnection(this.chunks[i-1].exit,c.entry)) errors.push(`${i}:socket`);
      if(i && this.chunks[i-1].definition.id===c.definition.id)errors.push(`${i}:repetition`);
      if(c.branches){
        for(const arm of Object.values(c.branches)){
          for(const [p,socket] of [[arm[0],c.entry],[arm.at(-1)!,c.exit]] as const)if(Math.hypot(p.x-socket.x,p.z-socket.z)>.01||Math.abs(p.yaw-socket.yaw)>.001)errors.push(`${i}:fork socket`);
          for(let j=1;j<arm.length;j++){const a=arm[j-1],b=arm[j];if(forwardZ(a,b)>=0||Math.abs(b.yaw-frame)>1+1e-9||Math.abs(b.yaw-a.yaw)/Math.hypot(b.x-a.x,b.z-a.z)>.02)errors.push(`${i}:fork curvature`);}
        }
        const mid=Math.floor(c.branches.left.length/2);if(Math.hypot(c.branches.left[mid].x-c.branches.right[mid].x,c.branches.left[mid].z-c.branches.right[mid].z)<20)errors.push(`${i}:fork separation`);
      }
      for(let j=1;j<c.points.length;j++) {
        const a=c.points[j-1],b=c.points[j],d=Math.hypot(b.x-a.x,b.z-a.z);
        if(d<.1||Math.abs(b.y-a.y)/d>.09)errors.push(`${i}:grade`);
        // Heading envelope makes z strictly decreasing, with positive inner-edge z
        // derivative (curvature*halfWidth < 1), ruling out self-intersections.
        if(forwardZ(a,b)>=0 || Math.abs(b.yaw-frame)>1+1e-9)errors.push(`${i}:non-monotonic road`);
      }
    }
    if(this.chunks.at(-1)?.definition.category!=='finish')errors.push('missing finish');
    return errors;
  }
}

/** Per-car topology: a rival's route never changes the player's recovery path. */
export class RouteCursor implements DrivableRoute {
  readonly choices=new Map<number,Branch>();
  readonly plans=new Map<number,Branch>();
  private tentative=new Map<number,Branch>();
  constructor(readonly road:ModularRoute){}
  get length(){return this.road.length;}
  get start(){return this.road.start;}
  pointAt(s:number){const c=this.road.moduleAt(s);return this.road.pointAt(s,this.choices.get(c.index)??this.plans.get(c.index)??this.tentative.get(c.index)??'left');}
  nearest(x:number,z:number,hint?:number){
    const p=this.road.nearest(x,z,hint,this.choices);
    if(p.forkIndex!==undefined&&p.branch){
      this.tentative.set(p.forkIndex,p.branch);
      const c=this.road.chunks.find(c=>c.index===p.forkIndex)!;
      if(!this.choices.has(c.index)&&hint!==undefined&&Math.abs(p.s-hint)<=12&&p.s>=c.start+FORK_COMMIT_DISTANCE&&p.s<c.end-FORK_COMMIT_DISTANCE&&p.distance<p.width/2+.5)this.choices.set(c.index,p.branch);
    }
    return p;
  }
}
