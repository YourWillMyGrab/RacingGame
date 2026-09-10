# Velocity Rogue

Gioco browser 3D in sviluppo: una prima run roguelike di **tre gare sulla costa**, con sei auto, strade modulari da seed e potenziamenti temporanei. La specifica completa rimane `ASTRA_RACING_ROGUELIKE_MASTER.md`.

## Avvio e verifiche

Node.js 22.12+ e browser desktop con WebGL; sviluppo verificato con Node 24.11 e Chrome.

```sh
npm ci
npm run dev
npm run build
npm run preview
npm test
npm run test:stress -- 1000
```

Apri l'indirizzo mostrato da Vite, normalmente http://127.0.0.1:5173.

Con Chrome installato e server di sviluppo attivo sulla porta 5173:

```sh
npm run test:browser
npm run test:lap
npm run test:modular
npm run test:race
npm run test:run
```

I test browser salvano screenshot in `test-results/` (ignorata da Git). Usano tastiera reale via Playwright e Gamepad API simulato; il test dell'intera run accelera l'orologio virtuale del browser. Non sostituiscono il collaudo con un controller fisico. La build produzione non espone le proprietà QA `window.__drivingLab` e `window.__roadGame`.

## Modalità

| URL | Modalità |
|---|---|
| `/` | Run di tre gare, potenziamenti e reset completo |
| `/?race=1` | Gara singola a sei auto |
| `/?solo=1` | Percorso modulare in solitaria |
| `/?lab=1` | Circuito ovale originale e tuning live |

Inserisci il seed nel menu o aggiungi `seed=7F2C-A91D` ai parametri URL. La stessa versione e seed riproducono strade, rivali e ricompense (a parità di piazzamento e scelte). La run deriva un seed separato per ogni evento. Il circuito di laboratorio è fisso.

## Controlli

| Azione | Tastiera | Controller standard |
|---|---|---|
| Accelerare | W / ↑ | RT |
| Frenare / retromarcia | S / ↓ | LT |
| Sterzare | A/D / ←/→ | Stick sinistro |
| Freno a mano | Spazio | A |
| Boost | Shift | B / RB |
| Recupero | R | Y |
| Pausa / riprendi | Esc | Start |
| Scegli potenziamento | 1/2/3 oppure ←/→ + Invio | D-pad + A |
| Conferma avvio/risultati | Invio | A / Start |

La frenata arresta prima l'auto, poi mantenendola premuta da fermo innesta la retromarcia. Inizia la deriva con sterzo e freno a mano, rilascia il freno a mano e controlla il gas per generare Flow. Tenere il freno a mano premuto non genera ricompense. Shift consuma Flow. Gli urti forti riducono l'integrità; a zero la run termina. Cambiare finestra mette in pausa.

In gara, il recupero cerca un punto libero e ferma l'auto per tre secondi, già compresi nel tempo di gara. Nel laboratorio/solo mantiene la penalità originale di +3 secondi.

## Run e potenziamenti

Le prime due gare offrono una scelta fra tre potenziamenti. I primi tre classificati recuperano fino a 8 integrità; i piazzamenti inferiori perdono 8 integrità (resta almeno 1) e ricevono ricompense di rarità ridotta. Integrità e Flow passano alla gara successiva.

La libreria iniziale comprende 14 potenziamenti, sei categorie di rarità e svantaggi espliciti per le maledizioni. Le direzioni di build comprendono deriva/Flow, massa/impatti e potenza a bassa integrità. Statistiche ed effetti vengono rimossi iniziando una nuova run. Non esiste progressione permanente.

I rivali usano lo stesso modello fisico, con ritmo, linea preferita e aggressività derivati dal seed. Frenano per le curve, cercano una linea di sorpasso e recuperano se bloccati. I checkpoint devono essere attraversati in ordine. Dopo l'arrivo del giocatore, gli altri continuano fino a 30 secondi: la classifica distingue tempi registrati, ritiri, piloti in pista e fuori tempo. Le auto arrivate non bloccano fisicamente gli altri piloti.

## Architettura

- `src/config.ts`: parametri in unità SI, fisica a 60 Hz.
- `src/vehicle.ts`: corpo Rapier, quattro raggi sospensione, grip, deriva, Flow, danni, recupero ed eventi.
- `src/input.ts`: tastiera e controller standard.
- `src/road/`: profili modulari, socket, seed, validazione, assemblaggio e streaming.
- `src/race.ts`: griglia, AI, checkpoint e arrivi.
- `src/events.ts`, `src/upgrades.ts`, `src/run.ts`: hook rimovibili, dati dei potenziamenti e stato temporaneo.
- `src/game.ts`: rendering, HUD e flusso della run; `src/lab.ts` conserva il laboratorio iniziale.
- `tests/`: regressioni fisiche/logiche, stress e prove browser riproducibili.

Il pannello telemetria mostra chunk, collisioni, caricamenti/scaricamenti, ID dei moduli e ancore/socket. Il tuning è disponibile nel Driving Lab.

## Limiti attuali

Questa è la slice costiera M4, non il gioco completo da 20–30 minuti. Le gare passano attraverso risultati/ricompense e ricreano la strada successiva. Bivi fisici, continuità senza ricostruzione, altri eventi, boss, altri biomi, salti, audio e rifinitura visiva appartengono ai prossimi milestone.

Le strade avanzano in un corridoio senza autointersezioni: curve, esse, dossi moderati, tunnel e ponti. La geometria e le collisioni vengono caricate davanti e scaricate dietro; i metadati leggeri sono generati in anticipo. Rollio/beccheggio sono assistiti e visivi. Vedi `PROJECT_STATE.md` e `KNOWN_ISSUES.md` per il checkpoint e i limiti precisi.
