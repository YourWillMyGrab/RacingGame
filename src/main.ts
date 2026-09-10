import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { buildTrack } from './track';
import { Input } from './input';
import './style.css';

async function boot() {
  await RAPIER.init();
  const world = new RAPIER.World({x:0,y:-9.81,z:0});
  const scene = new THREE.Scene(); scene.background=new THREE.Color(0x091c29); scene.fog=new THREE.Fog(0x091c29,140,620);
  scene.add(new THREE.HemisphereLight(0xb5e7fa,0x34423a,2.4));
  const sun=new THREE.DirectionalLight(0xffd6b4,2.2); sun.position.set(-80,160,50); scene.add(sun);
  const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.toneMapping=THREE.ACESFilmicToneMapping;
  document.querySelector('#app')!.innerHTML='<div class="brand">VELOCITY / ROGUE <small>DRIVING LAB · M0</small></div><pre id="debug"></pre>';
  document.querySelector('#app')!.append(renderer.domElement);
  const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,1500); camera.position.set(145,125,190); camera.lookAt(0,0,0);
  buildTrack(scene,world);
  const input=new Input(); let last=performance.now();
  window.addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
  renderer.setAnimationLoop(()=>{ const now=performance.now(); input.sample(); renderer.render(scene,camera); document.querySelector('#debug')!.textContent=`${Math.round(1000/(now-last))} FPS | ${renderer.info.render.calls} draw calls\nRapier initialized | ${world.colliders.len()} colliders | ${input.device}`;last=now; });
}
boot().catch(error=>{document.querySelector('#app')!.textContent=`Avvio non riuscito: ${String(error)}`;console.error(error);});
