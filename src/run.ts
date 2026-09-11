import { normalizeSeed, randomStream } from './road/seed';
import { rewardChoices, type Upgrade } from './upgrades';
import {BRANCH_PROFILE,type Branch,type RouteProfile} from './road/fork';
export class Run {
  readonly seed:string;
  readonly totalEvents=3;
  event=0;
  owned:string[]=[];
  integrity=100;
  flow=25;
  elapsed=0;
  phase:'race'|'reward'|'complete'|'failed'='race';
  offers:Upgrade[]=[];
  results:{position:number;time:number}[]=[];
  profile:RouteProfile='balanced';
  nextProfile:RouteProfile='balanced';
  routeChoices:{event:number;branch:Branch;profile:RouteProfile}[]=[];
  constructor(seed:string){this.seed=normalizeSeed(seed);}
  get routeSeed(){return `${Math.floor(randomStream(this.seed,`event-road:${this.event}${this.profile==='balanced'?'':`:${this.profile}`}`)()*4294967296).toString(16).padStart(8,'0').toUpperCase()}-E${this.event+1}`;}
  get moduleCount(){return 12+this.event*2;}
  get routeOptions(){return {forks:this.event<this.totalEvents-1,profile:this.profile};}
  selectRoute(branch:Branch){
    if(this.phase!=='race'||this.event===this.totalEvents-1||this.routeChoices.some(c=>c.event===this.event))return false;
    if(branch!=='left'&&branch!=='right')throw new Error('Invalid route choice');
    this.nextProfile=BRANCH_PROFILE[branch];this.routeChoices.push({event:this.event,branch,profile:this.nextProfile});return true;
  }
  finish(position:number,time:number,integrity:number,flow:number) {
    if(this.phase!=='race')throw new Error('Event already resolved');
    if(!Number.isInteger(position)||position<1||position>6||!Number.isFinite(time)||time<0)throw new Error('Invalid race result');
    this.elapsed+=time;this.results.push({position,time});this.integrity=Math.max(0,integrity);this.flow=flow;
    if(this.integrity<=0){this.phase='failed';return;}
    if(this.event===this.totalEvents-1){this.phase='complete';return;}
    this.integrity=Math.min(100,Math.max(1,this.integrity+(position<=3?8:-8)));
    this.offers=rewardChoices(this.seed,this.event,position,this.owned);this.phase='reward';
  }
  choose(id:string) {
    if(this.phase!=='reward'||!this.offers.some(u=>u.id===id))throw new Error('Upgrade was not offered');
    this.owned.push(id);this.offers=[];this.event++;this.profile=this.nextProfile;this.nextProfile='balanced';this.phase='race';
  }
  reset(){this.event=0;this.owned=[];this.integrity=100;this.flow=25;this.elapsed=0;this.phase='race';this.offers=[];this.results=[];this.profile='balanced';this.nextProfile='balanced';this.routeChoices=[];}
}
