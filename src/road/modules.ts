export interface Socket { x: number; y: number; z: number; yaw: number; grade: number; width: number }
export interface RoadModule {
  id: string;
  category: 'straight' | 'curve' | 's-curve' | 'crest' | 'tunnel' | 'bridge' | 'start' | 'finish' | 'fork';
  biomeTags: string[];
  length: number;
  width: number;
  minWidth: number;
  lanes: number;
  turn: number;
  wave: number;
  rise: number;
  curvature: number;
  maxGrade: number;
  banking: number;
  recommendedSpeed: number;
  difficulty: number;
  minSightDistance: number;
  estimatedTraversalTime: number;
  aiCompatible: boolean;
  eventTags: string[];
  flags: { tunnel: boolean; bridge: boolean; jump: boolean; shortcut: boolean };
  entry: Socket;
  exit: Socket;
  recoveryAnchors: number[];
  hazardSockets: number[];
  scenerySockets: number[];
}

function define(id: string, category: RoadModule['category'], length: number, turn=0, wave=0, rise=0, technical=false): RoadModule {
  const width=20, curvature=(Math.abs(turn)+Math.abs(wave)*2*Math.PI)/length;
  const recommendedSpeed=technical?14:curvature>.006?25:35;
  // Fixed authored profiles, flat sockets, sampled with the same integration as placement.
  let x=0,z=0;
  const steps=Math.ceil(length/2);
  for(let i=0;i<steps;i++) {const u=(i+.5)/steps, yaw=turn*u+wave*Math.sin(u*Math.PI*2);x-=Math.sin(yaw)*length/steps;z-=Math.cos(yaw)*length/steps;}
  return {id,category,biomeTags:['coast'],length,width,minWidth:technical?12:width,lanes:2,turn,wave,rise,curvature,maxGrade:Math.abs(rise)*Math.PI/length,banking:0,recommendedSpeed,difficulty:technical?3:curvature>.006?2:rise?1:0,minSightDistance:70,estimatedTraversalTime:length/recommendedSpeed,aiCompatible:true,eventTags:['road-race','time-attack'],flags:{tunnel:category==='tunnel',bridge:category==='bridge',jump:false,shortcut:false},entry:{x:0,y:0,z:0,yaw:0,grade:0,width},exit:{x,y:0,z,yaw:turn,grade:0,width},recoveryAnchors:[length*.25,length*.5,length*.75],hazardSockets:[],scenerySockets:[length*.2,length*.8]};
}

export const MODULES: readonly RoadModule[] = [
  define('launch','start',120), define('boulevard','straight',100),
  define('sweeper-left','curve',110,.5), define('sweeper-right','curve',110,-.5),
  define('connector-left','curve',90,.32), define('connector-right','curve',90,-.32),
  define('harbor-esses','s-curve',140,0,.22), define('overpass','crest',140,0,0,3),
  define('underpass','tunnel',120), define('sea-bridge','bridge',140,0,0,2),
  define('dock-chicane-left','s-curve',110,0,.82,0,true),
  define('dock-chicane-right','s-curve',110,0,-.82,0,true),
  define('harbor-switchbacks','s-curve',125,0,.92,0,true),
  define('finish-straight','finish',150),
];

// Explicitly placed by the director, never randomly inserted into the old modes.
export const FORK_MODULE={...define('coastal-choice','fork',300),minWidth:12,curvature:26*2*Math.PI**2/300**2};
export const SPEED_RELEASE=define('coastal-express','straight',180);

export function validateModule(m: RoadModule): string[] {
  const errors: string[]=[];
  if(!Number.isFinite(m.length) || m.length<40 || m.length>300) errors.push('length');
  if(!Number.isFinite(m.width) || m.width<12 || m.width>28) errors.push('width');
  if(!Number.isFinite(m.minWidth)||m.minWidth<12||m.minWidth>m.width)errors.push('minimum width');
  if(![m.turn,m.wave,m.rise,m.curvature,m.maxGrade,m.recommendedSpeed,m.minSightDistance].every(Number.isFinite)) errors.push('non-finite metadata');
  const curvature=(Math.abs(m.turn)+Math.abs(m.wave)*2*Math.PI)/m.length;
  if(curvature>.055 || m.curvature<curvature-1e-9) errors.push('curvature');
  if(Math.abs(m.rise)*Math.PI/m.length>.09 || m.maxGrade>.09 || m.maxGrade<Math.abs(m.rise)*Math.PI/m.length-1e-9) errors.push('grade');
  if(!m.aiCompatible || m.recommendedSpeed<10 || m.recommendedSpeed>50) errors.push('AI');
  if(m.minSightDistance<m.recommendedSpeed*2) errors.push('sight distance');
  if(!m.recoveryAnchors.length || m.recoveryAnchors.some(s=>!Number.isFinite(s)||s<=0||s>=m.length)) errors.push('recovery anchors');
  if(m.entry.width!==m.width || m.exit.width!==m.width || m.entry.grade!==0 || m.exit.grade!==0) errors.push('socket profile');
  if(!validateConnection(m.entry,{x:0,y:0,z:0,yaw:0,grade:0,width:m.width}))errors.push('entry transform');
  if(!errors.includes('length') && Number.isFinite(m.turn) && Number.isFinite(m.wave)) {
    let x=0,z=0;const n=Math.ceil(m.length/2);
    for(let i=0;i<n;i++){const u=(i+.5)/n,yaw=m.turn*u+m.wave*Math.sin(u*Math.PI*2);x-=Math.sin(yaw)*m.length/n;z-=Math.cos(yaw)*m.length/n;}
    if(!validateConnection(m.exit,{x,y:0,z,yaw:m.turn,grade:0,width:m.width}))errors.push('exit transform');
  }
  return errors;
}

export function validateConnection(a: Socket, b: Socket): boolean {
  return [a.x,a.y,a.z,a.yaw,a.grade,a.width,b.x,b.y,b.z,b.yaw,b.grade,b.width].every(Number.isFinite)
    && Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)<.01
    && Math.abs(Math.atan2(Math.sin(a.yaw-b.yaw),Math.cos(a.yaw-b.yaw)))<.001
    && Math.abs(a.grade-b.grade)<.001 && Math.abs(a.width-b.width)<.01;
}
