import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { buildTrack, nearestAnchor, TRACK_LENGTH } from './track';
import { Input } from './input';
import { Vehicle } from './vehicle';
import { createCar } from './car';
import { STEP, tuning, DEFAULT_TUNING } from './config';
import './style.css';
import { FLOW_IT } from './text';

async function boot() {
  await RAPIER.init();
  const world = new RAPIER.World({x:0,y:-9.81,z:0}); world.timestep=STEP;
  const scene = new THREE.Scene(); scene.background=new THREE.Color(0x091c29); scene.fog=new THREE.Fog(0x091c29,140,620);
  scene.add(new THREE.HemisphereLight(0xb5e7fa,0x34423a,2.4));
  const sun=new THREE.DirectionalLight(0xffd6b4,2.2); sun.position.set(-80,160,50); scene.add(sun);
  const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.setSize(innerWidth,innerHeight); renderer.toneMapping=THREE.ACESFilmicToneMapping;
  document.querySelector('#app')!.innerHTML=`
    <header class="brand">VELOCITY<span> / </span>ROGUE<small>01 — NEON COAST / BANCO PROVA</small></header>
    <div class="session"><span>PISTA DI COLLAUDO</span><strong id="time">00:00,0</strong><small id="laps">GIRO 01</small></div>
    <div id="cue">TROVA IL TUO RITMO</div>
    <section class="telemetry"><div class="speed"><strong id="speed">000</strong><span>KM/H</span></div><div class="resources"><label>FLOW <b id="flow-value">25</b></label><meter id="flow" max="100" value="25"></meter><label>INTEGRITÀ <b id="health-value">100</b></label><meter id="health" max="100" value="100"></meter></div></section>
    <div class="controls">WASD <span>guida</span> &nbsp; SPAZIO <span>derapata</span> &nbsp; SHIFT <span>nitro</span> &nbsp; R <span>recupero +3s</span> &nbsp; ESC <span>pausa</span></div>
    <details id="dev"><summary>TELEMETRIA / REGOLAZIONI</summary><pre id="debug"></pre><div id="tuning"></div><button id="defaults">Ripristina regolazioni</button><label class="setting"><input type="checkbox" id="shake" checked> Visuale stabile</label></details>
    <div id="overlay"><article><p class="eyebrow">VELOCITY ROGUE · BANCO PROVA</p><h1>La traiettoria<br>la scegli tu.</h1><p>Una macchina. Una pista. Trova il limite.<br>Genera Flow con curve pulite, velocità e derapate. Per derapare, dai un colpo di freno a mano, poi rilascialo e controlla il gas.</p><button id="start">ENTRA IN PISTA <span>↗</span></button><p class="hint">Controller: RT accelera · LT frena · stick sterza<br>A derapata · B/RB nitro · Y recupera · Start pausa</p><a class="secondary" href="${import.meta.env.BASE_URL}">← Menu principale</a></article></div>`;
  document.querySelector('#app')!.append(renderer.domElement);
  const $ = <T extends HTMLElement>(id:string) => document.getElementById(id) as T;
  let preferences={stableCamera:true,highQuality:true};
  try{const saved=JSON.parse(localStorage.getItem('velocity-preferences')??'{}');preferences={stableCamera:saved.stableCamera!==false,highQuality:saved.highQuality!==false};}catch{/* Storage is optional. */}
  $<HTMLInputElement>('shake').checked=preferences.stableCamera;
  $('shake').onchange=()=>{preferences.stableCamera=$<HTMLInputElement>('shake').checked;try{localStorage.setItem('velocity-preferences',JSON.stringify(preferences));}catch{/* Storage is optional. */}};
  renderer.setPixelRatio(Math.min(devicePixelRatio,preferences.highQuality?1.5:1));
  const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,1500);
  buildTrack(scene,world);
  const vehicle=new Vehicle(world), car=createCar(); scene.add(car.root);
  const input=new Input();
  let state:'title'|'driving'|'paused'|'wrecked'='title', last=performance.now(), accumulator=0, elapsed=0, lap=1, lapDistance=0, previousS=25, fps=60, started=false;
  const cameraTarget=new THREE.Vector3(), lookTarget=new THREE.Vector3();
  function showOverlay(title:string,description:string,button:string) {
    $('overlay').innerHTML=`<article><p class="eyebrow">BANCO PROVA / NEON COAST</p><h1>${title}</h1><p>${description}</p><button id="resume">${button} <span>↗</span></button><button id="restart" class="secondary">Ricomincia la sessione</button><a class="secondary" href="${import.meta.env.BASE_URL}">← Menu principale</a></article>`;
    $('overlay').hidden=false;
    $('resume').onclick=()=>{ if(state==='wrecked') restart(); else {state='driving';$('overlay').hidden=true;} };
    $('restart').onclick=restart;
  }
  function restart() { vehicle.restart(); elapsed=0;lap=1;lapDistance=0;previousS=25;state='driving';$('overlay').hidden=true;input.clear(); }
  function pause() {
    if(state==='driving'){state='paused';showOverlay('Un respiro.','La sessione è in pausa. Regolazioni e recuperi restano validi.','RIPRENDI');}
    else if(state==='paused'){state='driving';$('overlay').hidden=true;}
    else if(state==='title'){state='driving';$('overlay').hidden=true;}
  }
  $('start').onclick=()=>{state='driving';$('overlay').hidden=true;};
  input.onPause=pause;
  input.onConfirm=()=>{if(state==='title')$('start').click();else if(state==='paused'||state==='wrecked')$('resume').click();};
  input.onRecover=()=>{if(state==='driving'){vehicle.recover();previousS=vehicle.lastAnchor;}};
  window.addEventListener('blur',()=>{if(state==='driving')pause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden && state==='driving')pause();});
  const ranges:[keyof typeof tuning,string,number,number,number][]=[['engine','Spinta motore',8000,22000,500],['grip','Aderenza laterale',3,12,.1],['driftGrip','Aderenza in derapata',.5,4,.1],['steer','Sterzo lento',.5,1.6,.05],['highSpeedSteer','Sterzo veloce',.3,1,.05]];
  function tuningPanel() {
    $('tuning').innerHTML=ranges.map(([key,label,min,max,step])=>`<label>${label}<output id="out-${key}">${tuning[key]}</output><input aria-label="${label}" data-tune="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${tuning[key]}"></label>`).join('');
    document.querySelectorAll<HTMLInputElement>('[data-tune]').forEach(el=>el.oninput=()=>{const key=el.dataset.tune as keyof typeof tuning;tuning[key]=Number(el.value);$(`out-${key}`).textContent=el.value;});
  }
  tuningPanel();$('defaults').onclick=()=>{Object.assign(tuning,DEFAULT_TUNING);tuningPanel();};
  window.addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
  // Read-only snapshot for repeatable browser QA. No gameplay mutations are exposed.
  if(import.meta.env.DEV) Object.defineProperty(window,'__drivingLab',{get:()=>({state,speed:vehicle.speed,flow:vehicle.flow,integrity:vehicle.integrity,grounded:vehicle.grounded,contacts:vehicle.contacts,slip:vehicle.slip,drifting:vehicle.drifting,boosting:vehicle.boosting,position:{...vehicle.body.translation()},yaw:vehicle.yaw,elapsed,penalty:vehicle.penalty,recoveries:vehicle.recoveries,device:input.device,lap})});
  renderer.setAnimationLoop(()=>{
    const now=performance.now(), dt=Math.min((now-last)/1000,.1);last=now;fps+=(1/Math.max(.001,dt)-fps)*.05;
    const controls=input.sample();
    if(state==='driving') {
      accumulator+=dt;
      while(accumulator>=STEP) {
        vehicle.step(controls,STEP);world.step();vehicle.afterStep();elapsed+=STEP;accumulator-=STEP;
        const p=vehicle.body.translation(), s=nearestAnchor(p.x,p.z).s;
        let delta=s-previousS;if(delta>TRACK_LENGTH/2)delta-=TRACK_LENGTH;if(delta<-TRACK_LENGTH/2)delta+=TRACK_LENGTH;
        lapDistance+=delta;previousS=s;if(lapDistance>=TRACK_LENGTH){lap++;lapDistance-=TRACK_LENGTH;}
        if(vehicle.integrity<=0){state='wrecked';showOverlay('Fine corsa.',`Integrità esaurita. ${lap-1} giri completati · ${Math.round(elapsed+vehicle.penalty)} secondi. Riparti con la stessa auto base.`,'NUOVA SESSIONE');break;}
      }
    } else accumulator=0;
    const p=vehicle.body.translation(), yaw=vehicle.yaw;
    car.root.position.set(p.x,p.y,p.z);car.root.rotation.y=yaw;
    car.body.rotation.z=THREE.MathUtils.lerp(car.body.rotation.z,-vehicle.steer*Math.min(vehicle.speed/160,.1),.1);
    car.body.rotation.x=THREE.MathUtils.lerp(car.body.rotation.x,controls.throttle*.015-controls.brake*.035,.1);
    for(const wheel of car.wheels) { if(wheel.position.z<0) wheel.rotation.y=vehicle.steer*.3; }
    const back=9+Math.min(vehicle.speed*.065,4), shake=($<HTMLInputElement>('shake').checked?0:vehicle.impact*.25*Math.sin(now*.055));
    cameraTarget.set(p.x+Math.sin(yaw)*back+shake,p.y+4.3,p.z+Math.cos(yaw)*back);
    camera.position.lerp(cameraTarget,started?1-Math.exp(-dt*6):1);started=true;
    lookTarget.set(p.x-Math.sin(yaw)*13,p.y+.6,p.z-Math.cos(yaw)*13);camera.lookAt(lookTarget);
    camera.fov=THREE.MathUtils.lerp(camera.fov,62+vehicle.speed*.2+(vehicle.boosting?5:0),1-Math.exp(-dt*4));camera.updateProjectionMatrix();
    renderer.render(scene,camera);
    $('speed').textContent=Math.round(vehicle.speed*3.6).toString().padStart(3,'0');
    $<HTMLMeterElement>('flow').value=vehicle.flow;$('flow-value').textContent=Math.floor(vehicle.flow).toString();
    $<HTMLMeterElement>('health').value=vehicle.integrity;$('health-value').textContent=Math.ceil(vehicle.integrity).toString();
    const total=elapsed+vehicle.penalty;$('time').textContent=`${Math.floor(total/60).toString().padStart(2,'0')}:${(total%60).toFixed(1).replace('.',',').padStart(4,'0')}`;
    $('laps').textContent=`GIRO ${lap.toString().padStart(2,'0')} · ${input.device.toUpperCase()}`;
    $('cue').textContent=vehicle.boosting?'FLOW → NITRO':vehicle.flowSource!=='none'?`+ FLOW · ${FLOW_IT[vehicle.flowSource]}`:!vehicle.grounded && state==='driving'?'IN VOLO':vehicle.integrity<30?'INTEGRITÀ CRITICA':vehicle.speed>5?'CERCA LA CORDA. APRI IL GAS.':'TROVA IL TUO RITMO';
    $('cue').classList.toggle('active',vehicle.boosting||vehicle.drifting);
    if($<HTMLDetailsElement>('dev').open) $('debug').textContent=`${fps.toFixed(0)} FPS · ${renderer.info.render.calls} draw calls\n1 fixed track · ${world.bodies.len()} body · ${world.colliders.len()} colliders\nGeneration queue: 0 (fixed track)\nWheel contacts ${vehicle.contacts}/4 · slip ${(vehicle.slip*180/Math.PI).toFixed(1)}°\nRecovery ${vehicle.recoveries} · penalty +${vehicle.penalty}s`;
  });
}
boot().catch(error=>{document.querySelector('#app')!.textContent=`Avvio non riuscito: ${String(error)}`;console.error(error);});
