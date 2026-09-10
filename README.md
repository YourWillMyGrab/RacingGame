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
