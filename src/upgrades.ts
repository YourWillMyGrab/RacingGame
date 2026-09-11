import { DEFAULT_TUNING } from './config';
import type { Vehicle, VehicleEvents } from './vehicle';
import { randomStream } from './road/seed';
export type Rarity='Common'|'Uncommon'|'Rare'|'Epic'|'Legendary'|'Cursed';
export interface Upgrade {id:string;name:string;rarity:Rarity;description:string;downside?:string;tags:string[];stats?:Partial<typeof DEFAULT_TUNING>;hook?:keyof VehicleEvents;effect?:(event:VehicleEvents[keyof VehicleEvents])=>void}
export const UPGRADES:readonly Upgrade[]=[
  {id:'tire-smoke',name:'Generatore da derapata',rarity:'Common',description:'Le derapate controllate generano il doppio del Flow.',tags:['DERAPATA','FLOW'],stats:{driftFlow:2}},
  {id:'late-apex',name:'Corda ritardata',rarity:'Common',description:'Uscire pulito da una derapata fornisce 1,5 s di spinta motore +60%.',tags:['DERAPATA','POTENZA'],hook:'driftExit',effect:({car})=>{car.surge=1.5;}},
  {id:'impact-cell',name:'Cella cinetica',rarity:'Common',description:'Ogni punto di danno ricevuto genera 2 Flow.',tags:['IMPATTO','FLOW'],hook:'damage',effect:({car,amount})=>{car.flow=Math.min(100,car.flow+amount*2);}},
  {id:'armor',name:'Naso rinforzato',rarity:'Uncommon',description:'Massa +40%, danni da impatto dimezzati. L’accelerazione diminuisce.',tags:['IMPATTO','INTEGRITÀ'],stats:{mass:1.4,damageScale:.5}},
  {id:'capacitor',name:'Ricircolo',rarity:'Uncommon',description:'Il nitro consuma il 45% di Flow in meno.',tags:['FLOW','NITRO'],stats:{flowDrain:.55}},
  {id:'landing',name:'Carica aerea',rarity:'Uncommon',description:'Dopo oltre 0,3 s in aria, l’atterraggio fornisce 15 Flow.',tags:['ARIA','FLOW'],hook:'landing',effect:({car})=>{car.flow=Math.min(100,car.flow+15);}},
  {id:'redline',name:'Zona rossa',rarity:'Rare',description:'Sotto il 40% di integrità, la spinta motore aumenta del 90%.',tags:['RISCHIO','POTENZA'],hook:'tick',effect:({car})=>{if(car.integrity<40)car.power*=1.9;}},
  {id:'drift-bank',name:'Banca laterale',rarity:'Rare',description:'Un’uscita pulita dalla derapata restituisce 12 Flow.',tags:['DERAPATA','FLOW'],hook:'driftExit',effect:({car})=>{car.flow=Math.min(100,car.flow+12);}},
  {id:'overdrive',name:'Sovralimentazione',rarity:'Rare',description:'Forza del nitro +80%, consumo Flow +30%.',tags:['NITRO','POTENZA'],stats:{boostForce:1.8,flowDrain:1.3}},
  {id:'afterburn',name:'Ultima fiamma',rarity:'Epic',description:'Usare il nitro con meno di 25 Flow raddoppia la spinta motore.',tags:['NITRO','RISCHIO'],hook:'boost',effect:({car})=>{if(car.flow<25)car.power*=2;}},
  {id:'repair-drift',name:'Officina in curva',rarity:'Epic',description:'Le derapate controllate riparano 3 integrità al secondo.',tags:['DERAPATA','INTEGRITÀ'],hook:'drift',effect:({car,dt})=>{car.integrity=Math.min(100,car.integrity+dt*3);}},
  {id:'perpetual',name:'Moto perpetuo',rarity:'Legendary',description:'Sopra 90 km/h guadagni 8 Flow al secondo, anche con il nitro.',tags:['VELOCITÀ','FLOW'],hook:'tick',effect:({car,dt})=>{if(car.speed>25)car.flow=Math.min(100,car.flow+8*dt);}},
  {id:'no-brakes',name:'Senza freni',rarity:'Cursed',description:'Spinta motore +80% e limite velocità +30%.',downside:'Potenza frenante ridotta del 75%.',tags:['MALEDIZIONE','POTENZA'],stats:{engine:1.8,maxSpeed:1.3,brakes:.25}},
  {id:'blood-fuel',name:'Sangue nel motore',rarity:'Cursed',description:'Puoi usare il nitro anche senza Flow.',downside:'A Flow esaurito, il nitro consuma 8 integrità al secondo e può distruggerti.',tags:['MALEDIZIONE','NITRO'],hook:'tick',effect:({car,dt,input})=>{if(input.boost&&input.throttle>.1&&car.grounded&&car.speed>2&&car.flow<=car.settings.flowDrain*dt&&car.integrity>0){car.flow+=car.settings.flowDrain*dt;car.integrity=Math.max(0,car.integrity-8*dt);}}},
];

export function buildSettings(ids:readonly string[]) {
  const settings={...DEFAULT_TUNING};
  for(const id of ids){const upgrade=UPGRADES.find(u=>u.id===id);if(!upgrade)throw new Error(`Unknown upgrade ${id}`);for(const [key,factor] of Object.entries(upgrade.stats??{}))settings[key as keyof typeof settings]*=factor;}
  return settings;
}
export function attachBuild(car:Vehicle,ids:readonly string[]) {
  const remove:(()=>void)[]=[];
  for(const id of ids){const u=UPGRADES.find(u=>u.id===id);if(!u)throw new Error(`Unknown upgrade ${id}`);if(u.hook&&u.effect)remove.push(car.events.on(u.hook,u.effect));}
  return ()=>{for(const unsubscribe of remove)unsubscribe();};
}
export function rewardChoices(seed:string,event:number,position:number,owned:readonly string[]):Upgrade[] {
  const weights:Record<Rarity,number>=position===1?{Common:28,Uncommon:30,Rare:24,Epic:12,Legendary:4,Cursed:2}:position<=3?{Common:45,Uncommon:35,Rare:16,Epic:4,Legendary:0,Cursed:0}:{Common:80,Uncommon:20,Rare:0,Epic:0,Legendary:0,Cursed:0};
  const pool=UPGRADES.filter(u=>!owned.includes(u.id)&&weights[u.rarity]>0),rng=randomStream(seed,`rewards-v1:${event}:${position}`),chosen:Upgrade[]=[];
  if(pool.length<3)throw new Error('Insufficient rewards for this run state');
  for(let choice=0;choice<3;choice++) {
    const weight=(u:Upgrade)=>weights[u.rarity]/pool.filter(v=>v.rarity===u.rarity).length;
    let pick=rng()*pool.reduce((sum,u)=>sum+weight(u),0),index=pool.length-1;
    for(let i=0;i<pool.length;i++){pick-=weight(pool[i]);if(pick<=0){index=i;break;}}
    chosen.push(pool.splice(index,1)[0]);
  }
  return chosen;
}
