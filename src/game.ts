import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { ModularRoute,RouteCursor } from './road/route';
import {PROFILE_LABEL} from './road/fork';
import { RoadStream } from './road/stream';
import { freshSeed, normalizeSeed } from './road/seed';
import { Input } from './input';
import { Vehicle } from './vehicle';
import { createCar } from './car';
import { STEP } from './config';
import { IDLE } from './race';
import {createEvent,eventView,type CompetitiveEvent} from './event/session';
import {EVENT_LABEL} from './event/rules';
import {EventJourney} from './event/journey';
import { Run } from './run';
import { RARITY_IT, FLOW_IT } from './text';
import { UPGRADES, buildSettings } from './upgrades';

export async function startGame() {
  await RAPIER.init();
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x102837);scene.fog=new THREE.Fog(0x102837,120,380);
  scene.add(new THREE.HemisphereLight(0xc9edff,0x2c5157,2.8));
  const sun=new THREE.DirectionalLight(0xffdeb7,2.4);sun.position.set(-80,160,50);scene.add(sun);
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(16000,16000),new THREE.MeshStandardMaterial({color:0x123c4b,roughness:.35,metalness:.5}));sea.rotation.x=-Math.PI/2;sea.position.y=-5;scene.add(sea);
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=THREE.ACESFilmicToneMapping;
  const app=document.querySelector('#app')!;
  const solo=new URLSearchParams(location.search).has('solo');
  const campaign=!solo&&!new URLSearchParams(location.search).has('race');
  app.innerHTML=`<header class="brand">VELOCITY<span> / </span>ROGUE<small>01 — NEON COAST / ${solo?'ALLENAMENTO':'GARA SU STRADA'}</small></header>
    <div class="session"><span id="objective">${solo?'ATTRAVERSA LA COSTA':'GARA SU STRADA · 6 PILOTI'}</span><strong id="time">00:00,0</strong><small id="seed-label"></small><small id="event-targets"></small></div><div id="position" class="race-position"></div>
    <div id="cue"></div><div id="route-choice" aria-live="polite"></div><div id="flow-feedback" aria-live="polite"></div><div class="route-progress"><div id="progress-bar"></div></div><div id="build-hud" class="build-hud"></div>
    <section class="telemetry"><div class="speed"><strong id="speed">000</strong><span>KM/H</span></div><div class="resources"><label>FLOW <b id="flow-value">25</b></label><meter id="flow" max="100" value="25"></meter><label>INTEGRITÀ <b id="health-value">100</b></label><meter id="health" max="100" value="100"></meter></div></section>
    <div class="controls">WASD <span>guida</span> &nbsp; SPAZIO <span>derapata</span> &nbsp; SHIFT <span>nitro</span> &nbsp; R <span>recupero +3s</span> &nbsp; ESC <span>pausa</span></div>
    <details id="dev"><summary>TELEMETRIA / PERCORSO</summary><pre id="debug"></pre><label class="setting"><input type="checkbox" id="anchors"> Mostra raccordi e punti di recupero</label><label class="setting"><input type="checkbox" id="shake" checked> Visuale stabile</label><a href="${import.meta.env.BASE_URL}?lab=1">Banco prova e regolazioni</a></details>
    <div id="overlay"></div>`;
  app.append(renderer.domElement);
  const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
  const input=new Input(),camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,900),car=createCar();scene.add(car.root);
  let world:RAPIER.World,route:ModularRoute,stream:RoadStream,vehicle:Vehicle;
  let race:CompetitiveEvent|undefined;
  let journey:EventJourney|undefined,worldGeneration=0;
  let run:Run|undefined,selectedReward=0;
  const rivals:ReturnType<typeof createCar>[]=[];
  let state:'menu'|'help'|'settings'|'title'|'driving'|'paused'|'finished'|'wrecked'|'reward'='menu',elapsed=0,last=performance.now(),accumulator=0,fps=60,started=false;
  let menuSelection=0;
  let preferences={stableCamera:true,highQuality:true};
  try{const saved=JSON.parse(localStorage.getItem('velocity-preferences')??'{}');preferences={stableCamera:saved.stableCamera!==false,highQuality:saved.highQuality!==false};}catch{/* Storage is optional. */}
  function savePreferences(){try{localStorage.setItem('velocity-preferences',JSON.stringify(preferences));}catch{/* Storage is optional. */}}
  $<HTMLInputElement>('shake').checked=preferences.stableCamera;
  $('shake').onchange=()=>{preferences.stableCamera=$<HTMLInputElement>('shake').checked;savePreferences();};
  renderer.setPixelRatio(Math.min(devicePixelRatio,preferences.highQuality?1.5:1));
  const cameraTarget=new THREE.Vector3(),look=new THREE.Vector3();
  function clearRivalModels(){
    for(const model of rivals){scene.remove(model.root);model.root.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();for(const m of Array.isArray(object.material)?object.material:[object.material])m.dispose();}});}rivals.length=0;
  }
  function syncRivalModels(){
    clearRivalModels();
    for(const racer of race?.racers.slice(1)??[]){const model=createCar(racer.color);rivals.push(model);scene.add(model.root);}
  }
  function load(seed:string) {
    journey?.dispose();journey=undefined;
    if(campaign)run=new Run(seed);
    clearRivalModels();
    if(stream)stream.dispose();if(world)world.free();
    world=new RAPIER.World({x:0,y:-9.81,z:0});world.timestep=STEP;worldGeneration++;
    route=new ModularRoute(run?.routeSeed??seed,run?.moduleCount??24,run?.routeOptions);stream=new RoadStream(route,scene,world);stream.update(route.start);
    vehicle=new Vehicle(world,route,buildSettings(run?.owned??[]));elapsed=0;accumulator=0;started=false;
    if(run){vehicle.integrity=run.integrity;vehicle.flow=run.flow;}
    race=solo?undefined:createEvent(run?.eventType??'road-race',route,world,vehicle);
    if(run)journey=new EventJourney(run,world,vehicle,route,race!);
    syncRivalModels();
    const url=new URL(location.href);url.searchParams.set('seed',run?.seed??route.seed);history.replaceState(null,'',url);
    $('seed-label').textContent=`CODICE ${run?.seed??route.seed}`;
    refreshEventHud();
  }
  function refreshEventHud(){
    $('objective').textContent=run?`EVENTO ${run.event+1} / ${run.totalEvents} · ${EVENT_LABEL[run.eventType]} · ${PROFILE_LABEL[run.profile]}`:solo?'ATTRAVERSA LA COSTA':'GARA SU STRADA · 6 PILOTI';
    $('event-targets').textContent=race?eventView(race).objective:'';
    document.querySelector('.brand small')!.textContent=`01 — NEON COAST / ${journey?.transferring?'TRASFERIMENTO':race?eventView(race).label:'ALLENAMENTO'}`;
    $('build-hud').textContent=run?.owned.map(id=>UPGRADES.find(u=>u.id===id)!.name).join(' / ')??'';
  }
  const finish=()=>route.chunks.at(-1)!.start+30;
  function start() {state='driving';$('overlay').hidden=true;app.classList.remove('menu-open');input.clear();}
  function menuItems(){return Array.from(document.querySelectorAll<HTMLElement>('[data-menu-item]'));}
  function highlightMenu(){menuItems().forEach((item,index)=>item.classList.toggle('menu-selected',index===menuSelection));}
  function resetMenuFocus(){menuSelection=0;highlightMenu();}
  $('overlay').addEventListener('focusin',event=>{const index=menuItems().indexOf(event.target as HTMLElement);if(index>=0){menuSelection=index;highlightMenu();}});
  function mainMenu() {
    state='menu';app.classList.add('menu-open');$('overlay').hidden=false;
    const seed=encodeURIComponent(run?.seed??route.seed);
    $('overlay').innerHTML=`<article class="main-menu"><p class="eyebrow">NEON COAST · CORSE ROGUELIKE</p><h1>VELOCITY<br><span>ROGUE</span></h1><p class="menu-tagline">Frena al limite. Derapa. Riparti più forte.</p><nav aria-label="Menu principale"><button id="new-run" data-menu-item>NUOVA PARTITA <span>↗</span><small>Gare e Time Attack, bivi e un’auto da potenziare.</small></button><div class="mode-links"><a data-menu-item href="${import.meta.env.BASE_URL}?race=1&seed=${seed}">Gara singola</a><a data-menu-item href="${import.meta.env.BASE_URL}?solo=1&seed=${seed}">Allenamento libero</a><a data-menu-item href="${import.meta.env.BASE_URL}?lab=1">Banco prova</a></div><div class="menu-tools"><button id="help" data-menu-item>Comandi e Flow</button><button id="settings" data-menu-item>Impostazioni</button></div></nav><p class="hint">↑ ↓ per scegliere · Invio per confermare<br>Controller: croce direzionale e A</p></article>`;
    $('new-run').onclick=()=>{if(campaign){load(run?.seed??route.seed);title();}else location.assign(`${import.meta.env.BASE_URL}?setup=1&seed=${seed}`);};
    $('help').onclick=helpMenu;$('settings').onclick=settingsMenu;resetMenuFocus();
  }
  function helpMenu(){state='help';$('overlay').innerHTML=`<article class="help-menu"><p class="eyebrow">COME SI GIOCA</p><h1>Guida con ritmo.</h1><p><b>Prima della curva:</b> i cartelli arancioni indicano i settori tecnici. Frena prima di sterzare e riapri il gas in uscita.</p><p><b>Flow:</b> lo guadagni con curve pulite, derapate controllate e velocità sopra gli 83 km/h. Una buona uscita dalla derapata dà un bonus. Tener premuto il freno a mano non produce Flow.</p><p><b>Bivi:</b> nelle prime due gare, scegli la strada guidando. Sinistra prepara una prossima gara con più curve; destra una con rettilinei più lunghi. I due rami si ricongiungono e il recupero conserva la scelta.</p><p><b>Time Attack:</b> corri da solo contro tre soglie: Oro, Argento e Bronzo. Il recupero conta nel tempo, la pausa no. Anche fuori obiettivo puoi concludere e continuare: prima dell’evento successivo Oro/Argento riparano fino a 8 integrità; Bronzo/fuori obiettivo costano 8 integrità e riducono la rarità.</p><div class="help-controls"><span>W / ↑ · RT</span><b>Accelera</b><span>S / ↓ · LT</span><b>Frena / retromarcia</b><span>A D / ← → · Stick</span><b>Sterza</b><span>Spazio · A</span><b>Freno a mano</b><span>Shift · B / RB</span><b>Nitro: consuma Flow</b><span>R · Y</span><b>Recupero: 3 secondi</b><span>Esc · Start</span><b>Pausa</b></div><button id="back" data-menu-item>TORNA AL MENU</button></article>`;$('back').onclick=mainMenu;resetMenuFocus();}
  function settingsMenu(){state='settings';$('overlay').innerHTML=`<article><p class="eyebrow">IMPOSTAZIONI</p><h1>La tua visuale.</h1><label class="menu-setting"><input id="stable-setting" type="checkbox" data-menu-item ${preferences.stableCamera?'checked':''}> Visuale stabile<small>Disattiva le vibrazioni da urto.</small></label><label class="menu-setting"><input id="quality-setting" type="checkbox" data-menu-item ${preferences.highQuality?'checked':''}> Risoluzione elevata<small>Disattivala per ridurre il carico grafico.</small></label><button id="back" data-menu-item>TORNA AL MENU</button></article>`;$('stable-setting').onchange=()=>{preferences.stableCamera=$<HTMLInputElement>('stable-setting').checked;$<HTMLInputElement>('shake').checked=preferences.stableCamera;savePreferences();};$('quality-setting').onchange=()=>{preferences.highQuality=$<HTMLInputElement>('quality-setting').checked;renderer.setPixelRatio(Math.min(devicePixelRatio,preferences.highQuality?1.5:1));renderer.setSize(innerWidth,innerHeight);savePreferences();};$('back').onclick=mainMenu;resetMenuFocus();}
  function title() {
    state='title';app.classList.add('menu-open');$('overlay').hidden=false;
    $('overlay').innerHTML=`<article><p class="eyebrow">NEON COAST / ${campaign?'TRE EVENTI. UNA SOLA MACCHINA.':solo?'ALLENAMENTO LIBERO':'SEI PILOTI. UN ARRIVO.'}</p><h1>Oltre la<br>prossima curva.</h1><p>${campaign?'Affronta gare e Time Attack contro il tempo, scegli i potenziamenti e trasforma la tua auto. Ai bivi, guida a sinistra per una prossima gara più tecnica o a destra per più rettilinei. L’integrità e il Flow ti accompagnano fino alla fine.':solo?'Una strada nuova a ogni codice.':'Cinque rivali, una strada nuova a ogni codice.'} Conserva l’integrità, carica Flow con la derapata e conquista l’arrivo.</p><label class="seed-input">CODICE DEL PERCORSO<input id="seed-input" maxlength="24" value="${run?.seed??route.seed}" spellcheck="false"></label><button id="start">PARTI <span>↗</span></button><button id="new-seed" class="secondary">Genera un nuovo percorso</button><p class="hint">WASD guida · Spazio derapata · Shift nitro<br>Controller: RT/LT · stick · A derapata · B/RB nitro</p></article>`;
    $('start').onclick=()=>{const seed=normalizeSeed($<HTMLInputElement>('seed-input').value);if(seed!==(run?.seed??route.seed))load(seed);start();};
    $('new-seed').onclick=()=>{load(freshSeed());title();};
    $('overlay').querySelector('article')!.insertAdjacentHTML('beforeend','<button id="back" class="secondary">← Menu principale</button>');$('back').onclick=mainMenu;
    for(const id of ['start','new-seed','back'])$(id).dataset.menuItem='';resetMenuFocus();
  }
  function overlay(kind:'paused'|'finished'|'wrecked') {
    state=kind;$('overlay').hidden=false;
    const heading=kind==='paused'?'Un respiro.':kind==='finished'?(run?.phase==='complete'?'Costa conquistata.':race?eventView(race).heading:'Costa attraversata.'):'Fine corsa.';
    const standings=race && eventView(race).standings.length>0 && kind!=='paused'?'<ol id="standings" class="standings"></ol>':'';
    $('overlay').innerHTML=`<article><p class="eyebrow">NEON COAST / CODICE ${run?.seed??route.seed}</p><h1>${heading}</h1><p>${kind==='paused'?'Il percorso ti aspetta.':`${Math.round(elapsed+(race||journey?0:vehicle.penalty))} secondi · integrità ${Math.ceil(vehicle.integrity)}% · ${vehicle.recoveries} ${vehicle.recoveries===1?'recupero':'recuperi'}`}${run?.phase==='complete'?`<br>3 eventi completati · ${Math.round(run.elapsed)} s negli eventi · ${run.owned.length} potenziamenti temporanei`:''}</p>${race?`<p class="event-details">${kind==='finished'&&run?.phase==='complete'?eventView(race).heading+'<br>':''}${eventView(race).details}</p>`:''}${standings}${kind==='paused'?'<button id="resume">RIPRENDI ↗</button>':''}${kind==='finished'&&run?.phase==='reward'?'<button id="claim-reward">SCEGLI UN POTENZIAMENTO ↗</button>':''}<button id="restart" class="${kind==='paused'||run?.phase==='reward'?'secondary':''}">${run?'NUOVA PARTITA CON LO STESSO CODICE':'RIPROVA LO STESSO PERCORSO'}</button><button id="menu" class="secondary">Menu principale</button></article>`;
    if(kind==='paused')$('resume').onclick=start;
    if($('claim-reward'))$('claim-reward').onclick=showRewards;
    $('restart').onclick=()=>{load(run?.seed??route.seed);start();};
    $('menu').onclick=()=>{load(run?.seed??route.seed);mainMenu();};
    for(const id of ['resume','claim-reward','restart','menu'])if($(id))$(id).dataset.menuItem='';resetMenuFocus();
  }
  function showRewards() {
    if(!run || run.phase!=='reward')return;
    state='reward';selectedReward=0;
    $('overlay').innerHTML=`<article class="reward-screen"><p class="eyebrow">EVENTO ${run.event+1} COMPLETATO / CODICE ${run.seed}</p><h1>Potenzia la tua auto.</h1><p>Scegli 1 potenziamento, poi riparti da qui e raggiungi la prossima partenza. ${run.results.at(-1)!.position<=3?'Riparazione fino a 8 integrità tra gli eventi.':'−8 integrità per il risultato; ricompense di rarità ridotta.'}<br>Prossimo evento: ${EVENT_LABEL[run.eventTypes[run.event+1]]} · ${PROFILE_LABEL[run.nextProfile]} · scelta guidando al bivio.<br>Configurazione attuale: ${run.owned.map(id=>UPGRADES.find(u=>u.id===id)!.name).join(' / ')||'Auto base'}</p><div class="reward-grid">${run.offers.map((u,i)=>`<button class="reward-card rarity-${u.rarity}" data-reward="${i}"><small>${i+1} / ${RARITY_IT[u.rarity].toUpperCase()}</small><strong>${u.name}</strong><p>${u.description}</p>${u.downside?`<p class="downside">${u.downside}</p>`:''}<em>${u.tags.join(' / ')}</em></button>`).join('')}</div><p class="hint">1 / 2 / 3 oppure ← → e Invio · Controller: croce direzionale e A</p></article>`;
    document.querySelectorAll<HTMLButtonElement>('[data-reward]').forEach(button=>button.onclick=()=>chooseReward(Number(button.dataset.reward)));
    highlightReward();
  }
  function highlightReward(){document.querySelectorAll('[data-reward]').forEach((button,i)=>button.classList.toggle('selected',i===selectedReward));}
  function chooseReward(index:number){
    if(state!=='reward'||!run?.offers[index]||!journey)return;
    journey.choose(run.offers[index].id);route=journey.route;race=journey.event;
    syncRivalModels();elapsed=0;accumulator=0;
    // Existing chunks, body pose and camera interpolation are deliberately retained.
    stream.update(vehicle.progress);refreshEventHud();start();
  }
  input.onNavigate=direction=>{if(state==='reward'){selectedReward=(selectedReward+direction+3)%3;highlightReward();}else if(state!=='driving'){const items=menuItems();if(items.length){menuSelection=(menuSelection+direction+items.length)%items.length;highlightMenu();}}};
  input.onChoice=chooseReward;
  input.onConfirm=()=>{if(state==='reward')chooseReward(selectedReward);else if(state!=='driving')menuItems()[menuSelection]?.click();};
  input.onPause=()=>{if(state==='driving')overlay('paused');else if(state==='paused')start();else if(['help','settings','title'].includes(state))mainMenu();else input.onConfirm();};
  input.onRecover=()=>{if(state==='driving'){if(journey?.transferring)journey.recover();else if(race){if(race.started)race.recover();}else vehicle.recover();}};
  const pauseIfDriving=()=>{if(state==='driving')overlay('paused');};
  window.addEventListener('blur',pauseIfDriving);document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseIfDriving();});
  load(new URLSearchParams(location.search).get('seed')??'7F2C-A91D');if(!campaign||new URLSearchParams(location.search).has('setup'))title();else mainMenu();
  window.addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
  if(import.meta.env.DEV)Object.defineProperty(window,'__roadGame',{get:()=>({state,lifecycle:journey?.transferring?'transfer':'event',worldGeneration,bodyHandle:vehicle.body.handle,bodies:world.bodies.len(),routeStart:route.start,worldModules:stream.route.chunks.length,routePlacement:{station:route.chunks[0].start,index:route.chunks[0].index,socket:route.chunks[0].entry},seed:route.seed,moduleCount:route.chunks.length,routeOptions:route.options,forks:route.chunks.filter(c=>c.branches).map(c=>({index:c.index,start:c.start,end:c.end})),branchChoices:vehicle.route instanceof RouteCursor?Array.from(vehicle.route.choices):[],progress:vehicle.progress,finish:finish(),elapsed,speed:vehicle.speed,integrity:vehicle.integrity,flow:vehicle.flow,flowEarned:vehicle.flowEarned,flowSource:vehicle.flowSource,contacts:vehicle.contacts,position:{...vehicle.body.translation()},yaw:vehicle.yaw,activeChunks:stream.active.size,createdChunks:stream.created,unloadedChunks:stream.unloaded,colliders:world.colliders.len(),recoveries:vehicle.recoveries,module:route.moduleAt(vehicle.progress).definition.id,run:run?{eventType:run.eventType,eventTypes:run.eventTypes,results:run.results,seed:run.seed,event:run.event,phase:run.phase,profile:run.profile,nextProfile:run.nextProfile,routeChoices:[...run.routeChoices],owned:[...run.owned],offers:run.offers.map(u=>u.id),elapsed:run.elapsed}:null,race:race?{kind:race.kind,result:race.result,countdown:race.countdown,position:race.position,checkpoint:race.player.checkpoint,order:race.order.map(r=>({...r})),racers:race.racers.map(r=>({id:r.id,progress:r.vehicle.progress,integrity:r.vehicle.integrity,finish:r.finishTime}))}:null})});
  renderer.setAnimationLoop(()=>{
    const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;fps+=(1/Math.max(.001,dt)-fps)*.05;
    const controls=input.sample();
    stream.debug=$<HTMLInputElement>('anchors').checked;
    stream.update(vehicle.progress,race?.racers.map(r=>r.vehicle.progress));
    if(state==='driving') {
      accumulator+=dt;
      while(accumulator>=STEP){if(journey){journey.step(controls,STEP);if(race!==journey.event){race=journey.event;syncRivalModels();refreshEventHud();}elapsed=race?.elapsed??0;}else if(race){race.step(controls,STEP);elapsed=race.elapsed;}else{vehicle.step(controls,STEP);world.step();vehicle.afterStep();elapsed+=STEP;}accumulator-=STEP;
        if(run&&vehicle.route instanceof RouteCursor)for(const branch of vehicle.route.choices.values())run.selectRoute(branch);
        if(vehicle.integrity<=0){if(run&&run.phase==='race'&&race)run.finish(race.result,0,vehicle.flow);overlay('wrecked');break;}
        if(!journey?.transferring&&(race?race.player.finishTime!==null:vehicle.progress>=finish())){if(race)elapsed=race.player.finishTime!;if(run)run.finish(race!.result,vehicle.integrity,vehicle.flow);overlay('finished');break;}
      }
    } else if(state==='finished' && race && race.awaitingRivals) {
      accumulator+=dt;
      while(accumulator>=STEP){race.step(IDLE,STEP);accumulator-=STEP;}
    } else accumulator=0;
    if(race && $('standings'))$('standings').innerHTML=eventView(race).standings.map(r=>`<li class="${r.you?'you':''}"><span>${r.name}</span><b>${r.value}</b></li>`).join('');
    const p=vehicle.body.translation(),yaw=vehicle.yaw;
    car.root.position.set(p.x,p.y,p.z);car.root.rotation.y=yaw;
    for(let i=0;i<rivals.length;i++){const r=race!.racers[i+1],v=r.vehicle.body.translation();rivals[i].root.position.set(v.x,v.y,v.z);rivals[i].root.rotation.y=r.vehicle.yaw;}
    car.body.rotation.z=THREE.MathUtils.lerp(car.body.rotation.z,-vehicle.steer*Math.min(vehicle.speed/160,.1),.1);
    const ahead=vehicle.route.pointAt(vehicle.progress+2),behind=vehicle.route.pointAt(vehicle.progress-2);
    car.body.rotation.x=THREE.MathUtils.lerp(car.body.rotation.x,Math.atan2(ahead.y-behind.y,4)+controls.throttle*.015-controls.brake*.035,.1);
    for(const wheel of car.wheels)if(wheel.position.z<0)wheel.rotation.y=vehicle.steer*.3;
    const back=9+Math.min(vehicle.speed*.065,4),shake=$<HTMLInputElement>('shake').checked?0:vehicle.impact*.25*Math.sin(now*.055);
    cameraTarget.set(p.x+Math.sin(yaw)*back+shake,p.y+4.3,p.z+Math.cos(yaw)*back);camera.position.lerp(cameraTarget,started?1-Math.exp(-dt*6):1);started=true;
    look.set(p.x-Math.sin(yaw)*13,p.y+.6,p.z-Math.cos(yaw)*13);camera.lookAt(look);
    camera.fov=THREE.MathUtils.lerp(camera.fov,62+vehicle.speed*.2+(vehicle.boosting?5:0),1-Math.exp(-dt*4));camera.updateProjectionMatrix();renderer.render(scene,camera);
    $('speed').textContent=Math.round(vehicle.speed*3.6).toString().padStart(3,'0');
    $<HTMLMeterElement>('flow').value=vehicle.flow;$('flow-value').textContent=Math.floor(vehicle.flow).toString();
    $<HTMLMeterElement>('health').value=vehicle.integrity;$('health-value').textContent=Math.ceil(vehicle.integrity).toString();
    const total=elapsed+(race||journey?0:vehicle.penalty);$('time').textContent=`${Math.floor(total/60).toString().padStart(2,'0')}:${(total%60).toFixed(1).replace('.',',').padStart(4,'0')}`;
    $('position').textContent=race?eventView(race).status:'';
    $('progress-bar').style.width=`${Math.max(0,Math.min(100,(vehicle.progress-route.start)/(finish()-route.start)*100))}%`;
    const next=route.moduleAt(vehicle.progress+65).definition;
    $('cue').textContent=vehicle.boosting?'FLOW → NITRO':vehicle.drifting?'DERAPATA PULITA / +FLOW':`${Math.max(0,Math.round(finish()-vehicle.progress))} M ALL’ARRIVO · ${next.category==='curve'?(next.turn>0?'↰ CURVA A SINISTRA':'↱ CURVA A DESTRA'):next.flags.tunnel?'TUNNEL':next.flags.bridge?'PONTE':next.category==='crest'?'DOSSO':'STRADA LIBERA'}`;
    const zone=route.brakingZone(vehicle.progress);
    if(zone)$('cue').textContent=`${vehicle.progress<zone.start?'FRENA · ':''}CURVE STRETTE${vehicle.progress<zone.start?` TRA ${Math.ceil(zone.start-vehicle.progress)} M`:''} · 50 KM/H`;
    $('cue').classList.toggle('braking',!!zone);
    $('cue').classList.toggle('active',!zone&&(vehicle.boosting||vehicle.drifting));
    $('flow-feedback').textContent=state==='driving'&&vehicle.flowSource!=='none'?`+ FLOW · ${FLOW_IT[vehicle.flowSource]}`:'';
    const fork=route.chunks.find(c=>c.branches&&vehicle.progress<c.end&&vehicle.progress>c.start-150),chosen=run?.routeChoices.find(c=>c.event===run?.event);
    $('route-choice').hidden=!fork||state!=='driving';
    $('route-choice').textContent=chosen?`PERCORSO SCELTO · PROSSIMA GARA ${PROFILE_LABEL[chosen.profile]}`:fork?`BIVIO ${vehicle.progress<fork.start?`TRA ${Math.ceil(fork.start-vehicle.progress)} M`:'· SCEGLI GUIDANDO'} · PROSSIMA GARA\n↖ TECNICA · PIÙ CURVE     |     VELOCE · PIÙ RETTILINEI ↗`:'';
    if(race && !race.started)$('cue').textContent=state==='driving'?`${Math.ceil(race.countdown)} · PREPARATI`:eventView(race).label;
    else if(race && race.player.hold>0)$('cue').textContent=`RECUPERO · ${race.player.hold.toFixed(1).replace('.',',')} S`;
    else if(race && race.player.finishTime===null && vehicle.progress>race.player.checkpoint+8)$('cue').textContent='PUNTO DI CONTROLLO SALTATO · R / Y PER RECUPERARE';
    if(journey?.transferring){
      $('position').textContent='TRASFERIMENTO';$('event-targets').textContent='RAGGIUNGI IL PORTALE · IL CRONOMETRO PARTIRÀ DOPO IL COUNTDOWN';
      $('cue').textContent=journey.hold>0?`RECUPERO · ${journey.hold.toFixed(1)} S`:`PROSSIMA PARTENZA TRA ${Math.max(0,Math.ceil(route.start-vehicle.progress))} M · ${EVENT_LABEL[run!.eventType]}`;
      $('cue').classList.remove('braking','active');
    }
    if($<HTMLDetailsElement>('dev').open)$('debug').textContent=`${fps.toFixed(0)} FPS · ${renderer.info.render.calls} draw calls\n${stream.active.size}/${route.chunks.length} chunks · ${world.bodies.len()} bodies\n${world.colliders.len()} colliders · queue 0\nLoaded ${stream.created} · unloaded ${stream.unloaded}\n${route.moduleAt(vehicle.progress).definition.id}\n${vehicle.contacts}/4 contacts · ${input.device}`;
  });
}
