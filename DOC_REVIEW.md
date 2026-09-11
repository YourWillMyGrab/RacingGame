# Revisione critica — 2026-09-11

## Verdetto

La base tecnica è **solida per una vertical slice**, ma non è ancora un MVP completo. Il progetto ha già superato la fase di prototipo fragile: generazione deterministica, guida a passo fisso, gare, streaming, run e bivi sono verificati con test mirati. Il rischio principale ora non è la correttezza del singolo sistema, bensì accumulare M5.2/M5.3 dentro un coordinatore UI/gameplay già troppo denso e arrivare tardi su prestazioni, accessibilità e collaudo reale.

Non risultano difetti bloccanti nei controlli automatici eseguiti per questa revisione. La priorità corretta è quindi consolidare prima di ampliare.

## Cosa va bene

### 1. Il nucleo simulativo è riproducibile e verificabile

- La fisica usa un passo fisso e il gameplay casuale usa stream derivati dal seed, anziché `Math.random()`.
- Strada, ricompense, rivali e profili successivi sono riproducibili; la scelta del ramo appartiene alla singola auto e non a uno stato globale.
- I checkpoint richiedono avanzamento continuo: il traguardo non si può ottenere saltando lungo la nearest-road projection.
- Lo streaming distrugge risorse fisiche e grafiche e viene provato anche ricaricando segmenti già scaricati.

Queste non sono solo intenzioni documentate: la suite copre geometria, sospensioni, danni, Flow, checkpoint, AI, upgrade, reset e i due rami fisici. Lo stress su 1.000 seed ha validato 32.000 moduli senza raccordi o pendenze non validi e senza traguardi mancanti.

### 2. Lo scope è dichiarato con onestà

`PROJECT_STATE.md`, `ROADMAP.md` e `KNOWN_ISSUES.md` distinguono chiaramente la slice costiera dal gioco completo. È positivo non chiamare “finito” ciò che manca ancora: eventi distinti, continuità fra eventi, biomi, boss, audio e polish.

### 3. Le regole della run sono piccole e isolate

`Run` concentra avanzamento, ricompense, integrità, Flow e profilo del percorso in uno stato facile da testare. Anche gli hook degli upgrade sono rimovibili e i valori derivati ripartono dalla configurazione base: riduce il rischio di bonus che sopravvivono per errore a una nuova partita.

### 4. Il prodotto comunica già le meccaniche essenziali

Menu, aiuto, avvisi di frenata, HUD del bivio, feedback Flow e schermata ricompense spiegano il loop in italiano. Tastiera e controller simulato coprono navigazione, guida, pausa, recupero e scelta ricompense; il layout stretto ha almeno una regressione browser dedicata.

## Cosa cambiare, in ordine di priorità

### P0 — Nessun blocco immediato rilevato

I test logici, la build TypeScript/Vite e lo stress deterministico passano. Non emerge una ragione tecnica per annullare M5.1 o riscrivere il controller di guida.

### P1 — Ridurre il ruolo di `game.ts` prima di M5.2/M5.3

`startGame()` oggi possiede inizializzazione WebGL/Rapier, DOM, menu, preferenze, ciclo di simulazione, camera, HUD, gara, run, streaming e API QA. Le schermate sono grandi template HTML inseriti inline e molte operazioni sono concatenate sulla stessa riga. Il file non è enorme in byte, ma ha troppe responsabilità e rende costosa ogni nuova tipologia di evento.

**Intervento consigliato:** prima o insieme a M5.2, estrarre almeno:

1. `ui/screens.ts` per menu, titolo, pausa, risultato e ricompense;
2. `ui/hud.ts` per aggiornamenti HUD e telemetria;
3. `session.ts` per caricamento/distruzione di mondo, gara e veicoli;
4. un piccolo state machine esplicito per le transizioni, invece di callback DOM distribuite.

Non serve introdurre un framework UI. Serve rendere testabili le transizioni senza avviare Three.js e Rapier.

### P1 — Portare i test browser nella CI

Il workflow Pages esegue soltanto `npm test` e `npm run build`. I test browser più preziosi — menu, run completa, streaming e gara — richiedono invece un server già acceso su `127.0.0.1:5173` e un’installazione esterna di Chrome. Di conseguenza una regressione di integrazione può essere pubblicata pur con CI verde.

**Intervento consigliato:** adottare una configurazione Playwright con `webServer`, installare Chromium nella CI ed eseguire almeno uno smoke di menu e una run accelerata prima del deploy. Lasciare i playtest fisici più lunghi come job separato o manuale se il tempo è eccessivo.

### P1 — Trattare il peso iniziale come budget, non come nota

La build genera un chunk condiviso di circa **3,40 MB** (circa **1,23 MB gzip**), segnalato da Vite. Per un gioco WebGL non è automaticamente inaccettabile, ma su GitHub Pages e rete mobile incide sul tempo prima del menu e non esiste ancora un test prestazionale.

**Intervento consigliato:** misurare cold load, tempo al menu e memoria su un dispositivo medio; fissare un budget. Valutare poi lazy loading del laboratorio e delle modalità non selezionate, caching corretto degli asset e una schermata di caricamento con avanzamento reale. Non mascherare l’avviso alzando soltanto `chunkSizeWarningLimit`.

### P1 — Fare un vero passaggio di accessibilità e input

Ci sono buone basi (`aria-live`, focus visibile e navigazione da tastiera/controller), ma restano lacune:

- non c’è supporto touch, quindi il layout mobile non equivale a giocabilità mobile;
- gli elementi selezionati dal controller ricevono una classe visiva, non necessariamente il focus DOM;
- `aria-live` su feedback aggiornati molto spesso può produrre annunci invasivi;
- mancano opzioni per riduzione del movimento, contrasto/dimensione HUD e rimappatura comandi;
- manca un controllo automatico con axe o equivalente.

**Intervento consigliato:** definire ufficialmente “desktop only” finché non esistono controlli touch; sincronizzare selezione e focus; limitare gli annunci live agli eventi significativi; aggiungere un audit automatico delle schermate statiche. Riduzione movimento e rimappatura possono entrare in M9, ma vanno pianificate ora.

### P2 — Separare “testato” da “divertente e bilanciato”

La suite dimostra che frenare batte il full throttle e che l’AI arriva al traguardo; non dimostra che tre gare siano varie, leggibili o divertenti. Il controller fisico non è stato provato e l’AI usa ancora euristiche leggere. Anche la difficoltà delle ricompense e la leggibilità dei bivi sono state validate soprattutto con driver automatici.

**Intervento consigliato:** introdurre una scheda di playtest umano ripetibile con almeno:

- tastiera e controller fisico;
- giocatore nuovo e giocatore esperto;
- comprensione del bivio prima della scelta;
- uso spontaneo di Flow/nitro e recupero;
- percezione delle differenze fra profilo tecnico e veloce;
- durata, incidenti, piazzamento e upgrade scelto per evento.

Registrare decisioni di tuning dai risultati, senza trasformare impressioni singole in costanti “definitive”.

### P2 — Rendere i contratti di stato più robusti

Nel coordinatore sono presenti varie asserzioni non-null (`race!`, lookup upgrade con `!`, elementi DOM assunti presenti). Sono ragionevoli nel flusso attuale, ma M5.2 introdurrà eventi senza la stessa struttura di `Race` e aumenterà il rischio di stati impossibili a compile time ma possibili a runtime.

**Intervento consigliato:** modellare la sessione come un’unione discriminata (`road-race`, `time-attack`, `solo`) e far dipendere dati/azioni dal tipo di evento. Validare preferenze e parametri URL con funzioni dedicate, invece di affidarsi a coercizioni e fallback sparsi.

### P2 — Migliorare manutenzione e osservabilità

Mancano script di lint/format, soglie di coverage e un test che controlli leak o crescita di memoria fra più eventi. La telemetria in-game è utile, ma non sostituisce metriche ripetibili.

**Intervento consigliato:** aggiungere formatter e lint con regole minime, coverage sulle parti pure (`Run`, route, upgrade, checkpoint) e uno stress di più load/dispose che verifichi conteggi Rapier/Three stabili. Conservare screenshot e trace Playwright solo su fallimento in CI.

## Sequenza raccomandata

1. **Consolidamento breve:** estrazione di sessione/UI, Playwright con server gestito e smoke in CI.
2. **M5.2 Time Attack:** implementarlo tramite un contratto evento discriminato, non con nuovi `if (race)` nel loop principale.
3. **M5.3 continuità:** verificare esplicitamente lifecycle, dispose e conservazione dello stato su tre eventi.
4. **Gate di qualità:** cold-load budget, playtest umano con controller, audit accessibilità e profilo memoria.
5. **Solo dopo:** ampliare contenuti, biomi, audio/VFX e durata della run.

## Controlli eseguiti per questa revisione

- `npm test`: 30/30 test superati.
- `npm run build`: type-check e build superati; resta l’avviso sul chunk condiviso da circa 3,40 MB.
- `npm run test:stress -- 1000`: 1.000 seed, 32.000 moduli e 1.000 bivi validati.

I test browser non sono stati rilanciati in questa revisione: dipendono da server di sviluppo e Chrome esterno e il loro mancato inserimento nella CI è precisamente uno dei rischi evidenziati sopra.
