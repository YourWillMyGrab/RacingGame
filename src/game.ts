import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { ModularRoute } from './road/route';
import { RoadStream } from './road/stream';
import { freshSeed, normalizeSeed } from './road/seed';
import { Input } from './input';
import { Vehicle } from './vehicle';
import { createCar } from './car';
import { STEP } from './config';

export async function startGame() {
  await RAPIER.init();
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x102837);scene.fog=new THREE.Fog(0x102837,120,380);
  scene.add(new THREE.HemisphereLight(0xc9edff,0x2c5157,2.8));
  const sun=new THREE.DirectionalLight(0xffdeb7,2.4);sun.position.set(-80,160,50);scene.add(sun);
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(16000,16000),new THREE.MeshStandardMaterial({color:0x123c4b,roughness:.35,metalness:.5}));sea.rotation.x=-Math.PI/2;sea.position.y=-5;scene.add(sea);
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=THREE.ACESFilmicToneMapping;
  const app=document.querySelector('#app')!;
  app.innerHTML=`<header class="brand">VELOCITY<span> / </span>ROGUE<small>01 — NEON COAST / MODULAR ROADS</small></header>
    <div class="session"><span id="objective">ATTRAVERSA LA COSTA</span><strong id="time">00:00.0</strong><small id="seed-label"></small></div>
    <div id="cue"></div><div class="route-progress"><div id="progress-bar"></div></div>
    <section class="telemetry"><div class="speed"><strong id="speed">000</strong><span>KM/H</span></div><div class="resources"><label>FLOW <b id="flow-value">25</b></label><meter id="flow" max="100" value="25"></meter><label>INTEGRITÀ <b id="health-value">100</b></label><meter id="health" max="100" value="100"></meter></div></section>
    <div class="controls">WASD <span>guida</span> &nbsp; SPAZIO <span>deriva</span> &nbsp; SHIFT <span>boost</span> &nbsp; R <span>recupero +3s</span> &nbsp; ESC <span>pausa</span></div>
    <details id="dev"><summary>TELEMETRIA / PERCORSO</summary><pre id="debug"></pre><label class="setting"><input type="checkbox" id="anchors"> Mostra socket e ancore</label><label class="setting"><input type="checkbox" id="shake" checked> Camera stabile</label><a href="/?lab=1">Apri Driving Lab / tuning</a></details>
    <div id="overlay"></div>`;
  app.append(renderer.domElement);
  const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
  const input=new Input(),camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,900),car=createCar();scene.add(car.root);
  let world:RAPIER.World,route:ModularRoute,stream:RoadStream,vehicle:Vehicle;
  let state:'title'|'driving'|'paused'|'finished'|'wrecked'='title',elapsed=0,last=performance.now(),accumulator=0,fps=60,started=false;
  const cameraTarget=new THREE.Vector3(),look=new THREE.Vector3();
  function load(seed:string) {
    if(stream)stream.dispose();if(world)world.free();
    world=new RAPIER.World({x:0,y:-9.81,z:0});world.timestep=STEP;
    route=new ModularRoute(seed,24);stream=new RoadStream(route,scene,world);stream.update(route.start);
    vehicle=new Vehicle(world,route);elapsed=0;accumulator=0;started=false;
    const url=new URL(location.href);url.searchParams.set('seed',route.seed);history.replaceState(null,'',url);
    $('seed-label').textContent=`SEED ${route.seed}`;
  }
  const finish=()=>route.chunks.at(-1)!.start+30;
  function start() {state='driving';$('overlay').hidden=true;input.clear();}
  function title() {
    state='title';$('overlay').hidden=false;
    $('overlay').innerHTML=`<article><p class="eyebrow">NEON COAST / PERCORSO DA SEED</p><h1>Oltre la<br>prossima curva.</h1><p>Una strada nuova a ogni seed. Curve, ponti e tunnel lungo la costa. Conserva l’integrità, carica Flow con la deriva e raggiungi l’arrivo.</p><label class="seed-input">SEED DEL PERCORSO<input id="seed-input" maxlength="24" value="${route.seed}" spellcheck="false"></label><button id="start">PARTI <span>↗</span></button><button id="new-seed" class="secondary">Genera un nuovo seed</button><p class="hint">WASD guida · Spazio deriva · Shift boost<br>Controller: RT/LT · stick · A deriva · B/RB boost</p></article>`;
    $('start').onclick=()=>{const seed=normalizeSeed($<HTMLInputElement>('seed-input').value);if(seed!==route.seed)load(seed);start();};
    $('new-seed').onclick=()=>{load(freshSeed());title();};
  }
  function overlay(kind:'paused'|'finished'|'wrecked') {
    state=kind;$('overlay').hidden=false;
    const heading=kind==='paused'?'Un respiro.':kind==='finished'?'Costa attraversata.':'Fine corsa.';
    $('overlay').innerHTML=`<article><p class="eyebrow">NEON COAST / SEED ${route.seed}</p><h1>${heading}</h1><p>${kind==='paused'?'Il percorso ti aspetta.':`${Math.round(elapsed+vehicle.penalty)} secondi · integrità ${Math.ceil(vehicle.integrity)}% · ${vehicle.recoveries} recuperi`}</p>${kind==='paused'?'<button id="resume">RIPRENDI ↗</button>':''}<button id="restart" class="${kind==='paused'?'secondary':''}">RIPROVA QUESTO SEED</button><button id="menu" class="secondary">Scegli un altro percorso</button></article>`;
    if(kind==='paused')$('resume').onclick=start;
    $('restart').onclick=()=>{load(route.seed);start();};
    $('menu').onclick=()=>{load(route.seed);title();};
  }
  input.onPause=()=>{if(state==='driving')overlay('paused');else if(state==='paused')start();else if(state==='title')$('start').click();};
  input.onRecover=()=>{if(state==='driving')vehicle.recover();};
  const pauseIfDriving=()=>{if(state==='driving')overlay('paused');};
  window.addEventListener('blur',pauseIfDriving);document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseIfDriving();});
  load(new URLSearchParams(location.search).get('seed')??'7F2C-A91D');title();
  window.addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
  if(import.meta.env.DEV)Object.defineProperty(window,'__roadGame',{get:()=>({state,seed:route.seed,progress:vehicle.progress,finish:finish(),elapsed,speed:vehicle.speed,integrity:vehicle.integrity,flow:vehicle.flow,contacts:vehicle.contacts,position:{...vehicle.body.translation()},yaw:vehicle.yaw,activeChunks:stream.active.size,createdChunks:stream.created,unloadedChunks:stream.unloaded,colliders:world.colliders.len(),recoveries:vehicle.recoveries,module:route.moduleAt(vehicle.progress).definition.id})});
  renderer.setAnimationLoop(()=>{
    const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;fps+=(1/Math.max(.001,dt)-fps)*.05;
    const controls=input.sample();
    stream.debug=$<HTMLInputElement>('anchors').checked;
    stream.update(vehicle.progress);
    if(state==='driving') {
      accumulator+=dt;
      while(accumulator>=STEP){vehicle.step(controls,STEP);world.step();vehicle.afterStep();elapsed+=STEP;accumulator-=STEP;
        if(vehicle.integrity<=0){overlay('wrecked');break;}
        if(vehicle.progress>=finish()){overlay('finished');break;}
      }
    } else accumulator=0;
    const p=vehicle.body.translation(),yaw=vehicle.yaw;
    car.root.position.set(p.x,p.y,p.z);car.root.rotation.y=yaw;
    car.body.rotation.z=THREE.MathUtils.lerp(car.body.rotation.z,-vehicle.steer*Math.min(vehicle.speed/160,.1),.1);
    const ahead=route.pointAt(vehicle.progress+2),behind=route.pointAt(vehicle.progress-2);
    car.body.rotation.x=THREE.MathUtils.lerp(car.body.rotation.x,Math.atan2(ahead.y-behind.y,4)+controls.throttle*.015-controls.brake*.035,.1);
    for(const wheel of car.wheels)if(wheel.position.z<0)wheel.rotation.y=vehicle.steer*.3;
    const back=9+Math.min(vehicle.speed*.065,4),shake=$<HTMLInputElement>('shake').checked?0:vehicle.impact*.25*Math.sin(now*.055);
    cameraTarget.set(p.x+Math.sin(yaw)*back+shake,p.y+4.3,p.z+Math.cos(yaw)*back);camera.position.lerp(cameraTarget,started?1-Math.exp(-dt*6):1);started=true;
    look.set(p.x-Math.sin(yaw)*13,p.y+.6,p.z-Math.cos(yaw)*13);camera.lookAt(look);
    camera.fov=THREE.MathUtils.lerp(camera.fov,62+vehicle.speed*.2+(vehicle.boosting?5:0),1-Math.exp(-dt*4));camera.updateProjectionMatrix();renderer.render(scene,camera);
    $('speed').textContent=Math.round(vehicle.speed*3.6).toString().padStart(3,'0');
    $<HTMLMeterElement>('flow').value=vehicle.flow;$('flow-value').textContent=Math.floor(vehicle.flow).toString();
    $<HTMLMeterElement>('health').value=vehicle.integrity;$('health-value').textContent=Math.ceil(vehicle.integrity).toString();
    const total=elapsed+vehicle.penalty;$('time').textContent=`${Math.floor(total/60).toString().padStart(2,'0')}:${(total%60).toFixed(1).padStart(4,'0')}`;
    $('progress-bar').style.width=`${Math.min(100,vehicle.progress/finish()*100)}%`;
    const next=route.moduleAt(vehicle.progress+65).definition;
    $('cue').textContent=vehicle.boosting?'FLOW → BOOST':vehicle.drifting?'DERIVA PULITA / +FLOW':`${Math.max(0,Math.round(finish()-vehicle.progress))} M ALL’ARRIVO · ${next.category==='curve'?(next.turn>0?'↰ CURVA A SINISTRA':'↱ CURVA A DESTRA'):next.flags.tunnel?'TUNNEL':next.flags.bridge?'PONTE':next.category==='crest'?'DOSSO':'STRADA LIBERA'}`;
    $('cue').classList.toggle('active',vehicle.boosting||vehicle.drifting);
    if($<HTMLDetailsElement>('dev').open)$('debug').textContent=`${fps.toFixed(0)} FPS · ${renderer.info.render.calls} draw calls\n${stream.active.size}/${route.chunks.length} chunks · ${world.bodies.len()} bodies\n${world.colliders.len()} colliders · queue 0\nLoaded ${stream.created} · unloaded ${stream.unloaded}\n${route.moduleAt(vehicle.progress).definition.id}\n${vehicle.contacts}/4 contacts · ${input.device}`;
  });
}
