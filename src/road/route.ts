import { MODULES, validateModule, validateConnection, type RoadModule, type Socket } from './modules';
import { normalizeSeed, randomStream } from './seed';

export interface RoadPoint { x: number; y: number; z: number; yaw: number; s: number; width: number }
export interface RoadAnchor extends RoadPoint { distance: number }
export interface DrivableRoute {
  length: number;
  start: number;
  pointAt(s: number): RoadPoint;
  nearest(x: number,z: number,hint?: number): RoadAnchor;
}
export interface PlacedModule { definition: RoadModule; index: number; start: number; end: number; entry: Socket; exit: Socket; points: RoadPoint[] }

export class ModularRoute implements DrivableRoute {
  readonly seed: string;
  readonly chunks: PlacedModule[]=[];
  readonly points: RoadPoint[]=[];
  length=0;
  start=25;
  constructor(seed: string, count=24) {
    if(!Number.isInteger(count)||count<5||count>128) throw new Error('Module count must be between 5 and 128');
    this.seed=normalizeSeed(seed);
    const rng=randomStream(this.seed,'road-v2');
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
      const m=i===0?MODULES[0]:i===count-1?MODULES.at(-1)!:options[Math.floor(rng()*options.length)];
      if(!m || validateModule(m).length) throw new Error(`Invalid authored module: ${m?.id}`);
      const start=this.length, n=Math.ceil(m.length/2), points:RoadPoint[]=[];
      let x=socket.x,z=socket.z;
      for(let j=0;j<=n;j++) {
        const u=j/n;
        if(j) {const mid=(j-.5)/n, a=socket.yaw+m.turn*mid+m.wave*Math.sin(mid*Math.PI*2);x-=Math.sin(a)*m.length/n;z-=Math.cos(a)*m.length/n;}
        points.push({x,y:socket.y+m.rise*Math.sin(Math.PI*u)**2,z,yaw:socket.yaw+m.turn*u+m.wave*Math.sin(u*Math.PI*2),s:start+m.length*u,width:m.width-(m.width-m.minWidth)*Math.sin(Math.PI*u)**2});
      }
      const last=points.at(-1)!;
      const exit={x:last.x,y:last.y,z:last.z,yaw:last.yaw,grade:0,width:m.width};
      this.chunks.push({definition:m,index:i,start,end:start+m.length,entry:{...socket},exit,points});
      this.points.push(...(i?points.slice(1):points));
      this.length+=m.length; socket=exit;
    }
    const issues=this.validate(); if(issues.length) throw new Error(issues.join(', '));
  }
  pointAt(s: number): RoadPoint {
    s=Math.max(0,Math.min(this.length,s));
    let lo=0,hi=this.points.length-1;
    while(lo+1<hi) {const mid=(lo+hi)>>1;if(this.points[mid].s<=s)lo=mid;else hi=mid;}
    const a=this.points[lo], b=this.points[hi], t=(s-a.s)/(b.s-a.s);
    return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t,yaw:a.yaw+(b.yaw-a.yaw)*t,s,width:a.width+(b.width-a.width)*t};
  }
  nearest(x: number,z: number,hint?: number): RoadAnchor {
    let best=this.points[0],distance=Infinity;
    // Hint limits hot-loop work and prevents accidental jumps along the route.
    for(const p of this.points) {
      if(hint!==undefined && Math.abs(p.s-hint)>100) continue;
      const d=(p.x-x)**2+(p.z-z)**2;
      if(d<distance){best=p;distance=d;}
    }
    return {...best,distance:Math.sqrt(distance)};
  }
  moduleAt(s: number) { return this.chunks.find(c=>s>=c.start && s<c.end) ?? this.chunks.at(-1)!; }
  speedAt(s:number) {
    let speed=35;
    for(const c of this.chunks)if(c.end>=s&&c.start<s+120)speed=Math.min(speed,Math.sqrt(c.definition.recommendedSpeed**2+16*Math.max(0,c.start-s-8)));
    return speed;
  }
  brakingZone(s:number) {return this.chunks.find(c=>c.definition.difficulty===3&&c.end>s&&c.start<s+110);}
  validate(): string[] {
    const errors:string[]=[];
    for(let i=0;i<this.chunks.length;i++) {
      const c=this.chunks[i]; errors.push(...validateModule(c.definition).map(e=>`${c.index}:${e}`));
      if(i && !validateConnection(this.chunks[i-1].exit,c.entry)) errors.push(`${i}:socket`);
      if(i && this.chunks[i-1].definition.id===c.definition.id)errors.push(`${i}:repetition`);
      for(let j=1;j<c.points.length;j++) {
        const a=c.points[j-1],b=c.points[j],d=Math.hypot(b.x-a.x,b.z-a.z);
        if(d<.1||Math.abs(b.y-a.y)/d>.09)errors.push(`${i}:grade`);
        // Heading envelope makes z strictly decreasing, with positive inner-edge z
        // derivative (curvature*halfWidth < 1), ruling out self-intersections.
        if(b.z>=a.z || Math.abs(b.yaw)>1)errors.push(`${i}:non-monotonic road`);
      }
    }
    if(this.chunks.at(-1)?.definition.category!=='finish')errors.push('missing finish');
    return errors;
  }
}
