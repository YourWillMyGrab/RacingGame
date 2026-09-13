# Velocity Rogue

Gioco browser 3D in sviluppo: una prima run roguelike di **tre eventi sulla costa**, con Road Race a sei auto, Time Attack in solitaria, strade modulari da seed e potenziamenti temporanei. La specifica completa rimane `ASTRA_RACING_ROGUELIKE_MASTER.md`.

Per le valutazioni aggiornate, vedi `DOC_REVIEW.md` per rischi e priorità tecniche e `GAMEPLAY_REVIEW.md` per l'analisi critica da game designer.

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

## Documentazione di progetto

- `PROJECT_STATE.md`: checkpoint verificato, limiti e prossimo task.
- `ROADMAP.md`: milestone e micro-milestone con stato TODO / IN_PROGRESS / DONE / BLOCKED.
- `CURRENT_TASK.md`: task attivo, criteri di accettazione e verifiche ancora da completare.
- `KNOWN_ISSUES.md`: limiti riproducibili e copertura non certificata.
- `DEVELOPMENT.md`: workflow locale, browser playtest e skill consigliate.
- `ASTRA_RACING_ROGUELIKE_MASTER.md`: specifica di prodotto e protocollo di recupero.

## Pubblicazione su GitHub Pages

Il workflow in `.github/workflows/deploy-pages.yml` esegue test e build a ogni push su `master`, poi pubblica automaticamente `dist` su GitHub Pages. Nel repository GitHub imposta **Settings → Pages → Source: GitHub Actions** una sola volta; dopo il primo deploy l’URL sarà `https://yourwillmygrab.github.io/RacingGame/`.

Il percorso degli asset viene impostato automaticamente sul nome del repository in CI, mentre lo sviluppo locale continua a usare la radice `/`. I link del menu rispettano lo stesso percorso, quindi il gioco è navigabile anche come project site Pages.

Con Chrome installato e server di sviluppo attivo sulla porta 5173:

```sh
npm run test:browser
npm run test:lap
npm run test:modular
npm run test:race
npm run test:run
npm run test:menu
```

I test browser salvano screenshot in `test-results/` (ignorata da Git). Usano tastiera reale via Playwright e Gamepad API simulato; il test dell'intera run accelera l'orologio virtuale del browser. Non sostituiscono il collaudo con un controller fisico. La build produzione non espone le proprietà QA `window.__drivingLab` e `window.__roadGame`.

## Modalità

| URL | Modalità |
|---|---|
| `/` | Menu principale: partita di tre eventi, modalità, comandi e impostazioni |
| `/?race=1` | Gara singola a sei auto |
| `/?solo=1` | Percorso modulare in solitaria |
| `/?lab=1` | Circuito ovale originale e tuning live |

Dal menu puoi anche aprire comandi e impostazioni di visuale/risoluzione, conservate nel browser. Inserisci il codice percorso nella schermata di avvio o aggiungi `seed=7F2C-A91D` ai parametri URL. La stessa versione e seed riproducono strade, rivali e ricompense (a parità di piazzamento e scelte). La run deriva un seed separato per ogni evento. Il circuito di laboratorio è fisso.

## Controlli

| Azione | Tastiera | Controller standard |
|---|---|---|
| Accelerare | W / ↑ | RT |
| Frenare / retromarcia | S / ↓ | LT |
| Sterzare | A/D / ←/→ | Stick sinistro |
| Freno a mano | Spazio | A |
| Nitro | Shift | B / RB |
| Recupero | R | Y |
| Pausa / riprendi | Esc | Start |
| Scegli potenziamento | 1/2/3 oppure ←/→ + Invio | D-pad + A |
| Naviga nel menu | ↑/↓ e Invio | Croce direzionale e A |

La frenata arresta prima l'auto, poi mantenendola premuta da fermo innesta la retromarcia. Inizia la derapata con sterzo e freno a mano, rilascia il freno a mano e controlla il gas per generare Flow. Tenere il freno a mano premuto non genera ricompense. Curve pulite generano 4 Flow/s, velocità oltre 83 km/h 3 Flow/s e un’uscita pulita dalla derapata 8 Flow. Il nitro consuma 18 Flow/s. Gli urti interrompono temporaneamente la ricarica da guida pulita. Gli urti forti riducono l'integrità; a zero la run termina. Cambiare finestra mette in pausa.

In gara, il recupero cerca un punto libero e ferma l'auto per tre secondi, già compresi nel tempo di gara. Nel laboratorio/solo mantiene la penalità originale di +3 secondi.

## Run e potenziamenti

I primi due eventi offrono una scelta fra tre potenziamenti. I primi tre classificati recuperano fino a 8 integrità; i piazzamenti inferiori perdono 8 integrità (resta almeno 1) e ricevono ricompense di rarità ridotta. Integrità e Flow passano all’evento successivo.

La libreria iniziale comprende 14 potenziamenti, sei categorie di rarità e svantaggi espliciti per le maledizioni. Le direzioni di build comprendono derapata/Flow, massa/impatti e potenza a bassa integrità. Statistiche ed effetti vengono rimossi iniziando una nuova run. Non esiste progressione permanente.

I rivali usano lo stesso modello fisico, con ritmo, linea preferita e aggressività derivati dal seed. Frenano per le curve, cercano una linea di sorpasso e recuperano se bloccati. I checkpoint devono essere attraversati in ordine. Dopo l'arrivo del giocatore, gli altri continuano fino a 30 secondi: la classifica distingue tempi registrati, ritiri, piloti in pista e fuori tempo. Le auto arrivate non bloccano fisicamente gli altri piloti.

## Architettura

- `src/config.ts`: parametri in unità SI, fisica a 60 Hz.
- `src/vehicle.ts`: corpo Rapier, quattro raggi sospensione, grip, derapata, Flow, danni, recupero ed eventi.
- `src/input.ts`: tastiera e controller standard.
- `src/road/`: profili modulari, socket, seed, validazione, assemblaggio e streaming; `fork.ts` definisce i due rami e `RouteCursor` mantiene la scelta di ogni auto.
- `src/event/`: simulazione PointToPoint, Time Attack, obiettivi/risultati deterministici e presentazione italiana.
- `src/race.ts`: Road Race a sei auto sul ciclo fisico condiviso.
- `src/events.ts`, `src/upgrades.ts`, `src/run.ts`: hook rimovibili, dati dei potenziamenti e stato temporaneo.
- `src/game.ts`: rendering, HUD e flusso della run; `src/lab.ts` conserva il laboratorio iniziale.
- `tests/`: regressioni fisiche/logiche, stress e prove browser riproducibili.

Il pannello telemetria mostra chunk, collisioni, caricamenti/scaricamenti, ID dei moduli e ancore/socket. Le regolazioni di guida sono disponibili nel Banco prova.

## Limiti attuali

Questa è la slice costiera durante M5, non il gioco completo da 20–30 minuti. Le gare passano attraverso risultati/ricompense e ricreano la strada successiva. Il primo bivio fisico con ricongiungimento è integrato in M5.1. Continuità senza ricostruzione, ulteriori tipi di evento, boss, altri biomi, salti, audio e rifinitura visiva appartengono ai prossimi task.

Il generatore `road-v2` introduce almeno tre settori tecnici nelle gare della partita: chicane ed esse che si restringono fino a 12 metri, con avvisi anticipati di frenata a 50 km/h. L’aderenza laterale ha un limite fisico: entrare troppo forte fa perdere la linea. Il cambio di versione modifica i percorsi dei vecchi codici; la ripetibilità resta garantita nella stessa versione.

Le strade avanzano in un corridoio senza autointersezioni: curve, esse, dossi moderati, tunnel e ponti. La geometria e le collisioni vengono caricate davanti e scaricate dietro; i metadati leggeri sono generati in anticipo. Rollio/beccheggio sono assistiti e visivi. Vedi `PROJECT_STATE.md` e `KNOWN_ISSUES.md` per il checkpoint e i limiti precisi.

## Bivi M5.1

La scelta avviene guidando, con cartelli a 100 e 30 metri dal bivio e un avviso nel cruscotto. I due rami sono larghi 12 metri, separati fisicamente, e tornano sulla stessa carreggiata. Anche i rivali scelgono un ramo. Il profilo tecnico aggiunge curve ed esse più impegnative; quello veloce allunga i rettilinei, conservando i settori di frenata. Il profilo si applica sia alle gare su strada sia alla Time Attack.

Il recupero conserva il ramo scelto. Una nuova partita cancella scelte, profili e potenziamenti. I codici sono ripetibili nella stessa versione e con le stesse scelte. Lo stress verifica 1.000 bivi e i test fisici attraversano entrambi i rami, controllano il vuoto centrale e la rimozione delle collisioni.

## Time Attack M5.2 — implementata, collaudo browser da completare

La run propone Road Race → Time Attack → un evento scelto dal seed fra i due tipi. La cronometro ha tre obiettivi fissi, calcolati dalla strada/profilo e da uno stream del seed indipendente dagli upgrade. L’HUD mostra soglie e tempo residuo per la migliore fascia ancora raggiungibile. Oro dà le ricompense del primo posto, Argento quelle del terzo, Bronzo/fuori obiettivo quelle del sesto. Superare il tempo non termina la run: puoi ancora raggiungere il traguardo. A integrità zero la run termina. L’ultimo evento non dà un terzo upgrade o una riparazione finale.

37 test automatici, build e stress su 1.000 percorsi più 1.000 run miste passano. Chrome 153 avvia la run senza errori di pagina; le prove browser lunghe sono però troppo lente in modalità headless software (la gara singola non supera 450 m entro 45 s). M5.2 resta IN_PROGRESS finché menu, HUD, risultati e run completa non vengono verificati. I test possono usare `BROWSER_CONFIG=/percorso/config.json`, un file JSON di opzioni Playwright, per esempio `{"executablePath":"/percorso/chromium","headless":true}`. Senza configurazione usano Chrome. `TIME_ATTACK_OVERRUN=1 npm run test:run` controlla anche l’arrivo oltre il Bronzo; `RUN_SEED` cambia il seed del test.
