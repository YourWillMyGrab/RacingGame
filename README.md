# Velocity Rogue — Driving Lab

Prototipo browser 3D su pista fissa. Prima vertical slice della specifica `ASTRA_RACING_ROGUELIKE_MASTER.md`: guida prima della generazione procedurale.

## Avvio

Richiede Node.js 22.12+ (verificato con Node 24.11) e un browser desktop con WebGL.

```sh
npm ci
npm run dev
```

Apri l'indirizzo mostrato da Vite, normalmente http://127.0.0.1:5173.

```sh
npm run build
npm run preview
npm test
npm run test:browser
npm run test:lap
```

I due test browser richiedono Google Chrome installato e il server `npm run dev` attivo sulla porta 5173. Usano input reali di tastiera nel browser e un Gamepad API simulato; salvano screenshot in `test-results/` (ignorata da Git). Non sostituiscono il collaudo con un controller fisico. La build produzione non espone la telemetria QA `window.__drivingLab`.

## Controlli

| Azione | Tastiera | Controller standard |
|---|---|---|
| Accelerare | W / ↑ | RT |
| Frenare / retromarcia | S / ↓ | LT |
| Sterzare | A/D / ←/→ | Stick sinistro |
| Freno a mano | Spazio | A |
| Boost | Shift | B / RB |
| Recupero (+3 secondi) | R | Y |
| Pausa | Esc | Start |

La frenata arresta prima la macchina; mantenendola premuta da fermo si innesta la retromarcia. Per generare Flow: inizia la deriva con sterzo e freno a mano, rilascia il freno a mano e mantieni una scivolata controllata con il gas. Tenere premuto il freno a mano non genera Flow. Shift consuma Flow per accelerare. Gli urti forti consumano integrità; a zero la sessione termina. Ricominciare ripristina tutte le risorse. Cambiare finestra mette in pausa.

Apri **TELEMETRIA / TUNING** per modificare la guida dal vivo. Le regolazioni durano solo fino al ricaricamento della pagina. **Ripristina tuning** ripristina i valori base. La camera stabile è attiva inizialmente.

## Struttura

- `src/config.ts`: parametri centralizzati, unità SI, timestep a 60 Hz.
- `src/vehicle.ts`: corpo Rapier dinamico, quattro raggi sospensione, grip, sterzo, deriva, Flow, danni e recupero.
- `src/input.ts`: tastiera e Gamepad API standard con deadzone e azioni singole.
- `src/track.ts`: pista ovale fissa, collisioni e ancore di recupero. Non è il generatore procedurale.
- `src/car.ts`: geometria originale del veicolo.
- `src/main.ts`: sessione, rendering, chase camera e HUD.
- `tests/`: verifiche fisiche e playtest riproducibili.

La pista è volutamente piatta. Rollio e beccheggio del telaio sono visivi, mentre la fisica consente rotazione sull'asse verticale e movimento verticale con sospensioni. Non ci sono ancora rivali, eventi, upgrade, salti o run roguelike. Vedi `PROJECT_STATE.md` e `KNOWN_ISSUES.md` per lo stato preciso.

## Modular roads (M2)

The default entry point now loads a point-to-point seeded road; `/?lab=1` preserves the original oval and live tuning. Enter a seed on the title screen or use `?seed=7F2C-A91D` to replay it. The same version and seed reproduce all road geometry. The title, HUD, pause and results show the seed.

The first module library includes start/finish, straights, left/right sweepers, S-curves, gentle crests, tunnels and bridges. Road profiles are authored data; the generator assembles compatible pieces and shapes challenge/release rhythm. This version intentionally follows a nonintersecting corridor; forks and jumps are later milestones.

Rendering and collision are loaded ahead and removed behind. The debug panel shows active chunks, colliders, load/unload counts, module IDs, entry sockets and recovery markers. Recovery chooses an unoccupied earlier road anchor. Finish the road to reach results, replay the same seed or choose another.

```sh
npm run test:stress -- 1000
npm run test:modular
```

The modular browser test drives the full road using a simulated analog controller, checks unloaded chunks and restarts the same seed. The stress test reports unsupported branches explicitly rather than claiming to validate nonexistent forks.

## Six-car racing (M3)

The default route is now a race against five seeded rivals. `/?solo=1` preserves the modular-road test drive and `/?lab=1` the oval. A three-second countdown locks the grid, then every racer uses the same dynamic vehicle model. Rivals have seeded pace, preferred lines and aggression; they brake for corners and choose a passing lane around nearby cars. Stuck recovery returns to an earlier valid anchor and holds the car for three seconds.

Race position uses validated road progress and ordered checkpoints. Recovery is a real three-second hold, already included in race time. Finishes are ordered by crossing time; cars that finish become noncolliding with other racers to keep the finish line clear. Results keep simulating remaining rivals for up to 30 seconds; unfinished racers are explicitly marked rather than assigned invented times. Start on controller resumes or retries from the result screen.

```sh
npm run test:race
```
