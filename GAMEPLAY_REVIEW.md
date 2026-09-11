# Revisione critica del gameplay — 2026-09-11

## Giudizio sintetico

**Velocity Rogue ha già un buon prototipo di guida e un’identità leggibile, ma non ha ancora una run roguelike abbastanza profonda.** Il gioco convince quando chiede di frenare, scegliere una linea, controllare una perdita di aderenza e trasformare la guida pulita in nitro. Convince molto meno quando deve far percepire una build, una rivalità o una scelta di percorso come realmente trasformativa.

Il problema non è “mancano tanti contenuti”. Il problema è che diversi sistemi presenti promettono più decisioni di quante ne producano oggi:

- il Flow arriva soprattutto dalla guida ordinaria, anziché da una catena di azioni rischiose;
- i bivi cambiano soprattutto la gara successiva e poco il rischio/tempo della scelta attuale;
- due sole ricompense non bastano a far maturare una build;
- le famiglie Impatto, Aria e Precisione hanno pochi strumenti o poche occasioni per esprimersi;
- tre Road Race consecutive cambiano la strada, ma non cambiano abbastanza la domanda posta al giocatore.

La direzione è valida. Non cambierei il fondamento simcade né introdurrei più auto, armi o una mappa a nodi. Rafforzerei invece il triangolo **guida → rischio → Flow**, darei conseguenze immediate alle strade scelte e costruirei una run corta con tre atti ludicamente distinti: Road Race, Time Attack e Boss/Duel.

## Il gameplay attuale, senza abbellimenti

La campagna attuale propone:

1. una Road Race a sei auto;
2. un bivio fisico che determina il profilo della gara seguente;
3. risultato e scelta di un upgrade fra tre;
4. una seconda Road Race, un secondo bivio e un secondo upgrade;
5. una terza Road Race e conclusione della run.

Durante la guida il giocatore gestisce acceleratore, freno/retromarcia, sterzo, freno a mano, nitro e recupero. Flow e integrità persistono fra gli eventi; il piazzamento influenza riparazione/penalità e rarità delle offerte. È un loop completo e comprensibile, ma in questa forma la run è soprattutto **tre gare con due modificatori**, non ancora una vera escalation roguelike.

## Cosa mi convince

### 1. La base dell’auto ha una tesi precisa

La macchina non è un kart che gira sempre al limite: i settori tecnici impongono una frenata reale, l’aderenza laterale ha un limite e il freno a mano serve a iniziare o approfondire la rotazione. Questo crea una distinzione utile fra:

- entrare puliti e conservare velocità;
- provocare una derapata per generare risorsa;
- rischiare un ingresso troppo veloce;
- spendere Flow per accelerare sul tratto successivo.

È il nucleo giusto per un racing roguelike: il giocatore non sceglie soltanto “quanto andare forte”, ma **come convertire una curva in vantaggio futuro**.

### 2. Flow è una risorsa intuitiva

Un solo indicatore collega derapata, velocità e nitro. Questo evita la proliferazione di barre e cooldown e rende immediatamente comprensibile il ciclo “guida bene/aggressivo, poi spendi”. Il nitro aumenta anche il limite raggiungibile, quindi non è soltanto un effetto visivo.

La scelta di non premiare il freno a mano tenuto passivamente è corretta: separa l’intenzione tecnica dall’abuso dell’input. Anche il bonus di uscita pulita dà un momento conclusivo alla derapata invece di premiare solo la durata.

### 3. Integrità e recupero producono tensione senza eliminazione istantanea

Gli urti forti hanno conseguenze che attraversano la run e il recupero costa tempo. Questo rende muri, traffico e linee sbagliate più importanti del semplice cronometro, senza trasformare ogni errore in un riavvio immediato.

È positiva anche la distinzione fra recupero in gara — fermo fisico di tre secondi incluso nel tempo — e penalità aggiunta nelle modalità solo/lab. In gara gli avversari continuano ad avanzare, quindi la punizione è visibile e coerente.

### 4. La scelta del percorso avviene guidando

Il bivio non è un pulsante su una mappa. Segnaletica anticipata, separazione fisica, scelta indipendente delle auto e ricongiungimento rispettano l’idea più distintiva del progetto: **la strada è la mappa della run**.

Il fatto che il recupero conservi il ramo impedisce di annullare accidentalmente una decisione. Il profilo “tecnico” contro “veloce” è inoltre leggibile anche senza conoscere statistiche nascoste.

### 5. La sconfitta non coincide automaticamente con il quarto posto

Consentire alla run di continuare dopo un piazzamento basso è una buona scelta. In un roguelike il giocatore deve poter trasformare una situazione imperfetta in una storia di rimonta; richiedere sempre la vittoria renderebbe inutili integrità persistente, build rischiose e recupero.

### 6. Le maledizioni hanno il tono corretto

“Senza freni” e “Sangue nel motore” cambiano davvero una regola e dichiarano lo svantaggio. Sono molto più interessanti di un semplice bonus percentuale e indicano la direzione corretta per tutto il catalogo: effetti che fanno pensare “è pericoloso, ma voglio provarlo”.

## Cosa non mi convince ancora

### 1. La run non ha tempo di costruire un’identità

Tre eventi producono soltanto due scelte. Il primo terzo della run si disputa con l’auto base; la configurazione finale esiste per una sola gara. Con due upgrade è difficile ottenere una vera sinergia, soprattutto con un catalogo di 14 elementi e sei rarità.

Questo indebolisce la promessa centrale: il giocatore vede modificatori interessanti, ma raramente costruisce una macchina “rotta” o riconoscibile. Inoltre le ricompense di alta rarità sono legate ai piazzamenti migliori e hanno probabilità basse: molti giocatori possono completare più run senza vedere gli effetti più trasformativi.

**Cambierei così:** offrirei una scelta iniziale fra tre upgrade Common selezionati per rappresentare archetipi diversi, presentata come preparazione della vettura e non come metaprogressione. La run corta avrebbe così una direzione già dalla prima gara e terminerebbe con tre upgrade. In alternativa servono almeno quattro eventi, ma allungare tre Road Race simili è la soluzione meno interessante.

### 2. L’economia del Flow premia troppo il semplice avanzare

Oggi Flow arriva da curve pulite, velocità sopra 83 km/h, derapata e uscita pulita. È accessibile, che è positivo, ma mancano quasi tutte le fonti che dovrebbero caratterizzare un racing aggressivo: scia, sorpasso, quasi incidente, contatto efficace, concatenazione di azioni.

Il rischio è che la strategia ottimale diventi “guida normalmente, accumula, usa nitro sul rettilineo”, con la derapata come bonus e non come scelta. Inoltre non c’è decadimento passivo: conservare Flow non ha costo e il giocatore non è spinto a mantenere il ritmo.

**Cambierei così:** ridurrei leggermente il guadagno passivo da velocità e introdurrei eventi chiaramente leggibili:

- scia mantenuta per almeno 1 secondo;
- sorpasso completato senza contatto;
- near miss con barriera o rivale a velocità elevata;
- ram efficace che sposta il rivale senza una grande perdita di velocità propria;
- moltiplicatore temporaneo per concatenare due azioni differenti;
- decadimento lieve solo dopo alcuni secondi di guida passiva.

Il Flow dovrebbe raccontare **come** si sta guidando, non solo che l’auto si sta muovendo bene.

### 3. La derapata è funzionale, ma poco espressiva

Il sistema riconosce slip, durata e uscita, però al giocatore arrivano soprattutto un messaggio generico e Flow. Non c’è una valutazione comprensibile di angolo, velocità, controllo o continuità. Senza audio, fumo e risposta visiva delle gomme è inoltre difficile percepire il confine fra drift utile e scivolata inefficiente.

**Cambierei così:** aggiungerei un feedback compatto, non un punteggio arcade invadente:

- stato crescente `INNESCO → CONTROLLO → USCITA PULITA`;
- intensità visiva proporzionale a velocità e slip valido;
- suono gomme che distingue grip, drift controllato e spin;
- piccolo moltiplicatore se la derapata rimane nella finestra ideale;
- nessuna ricompensa extra per allungarla artificialmente fuori traiettoria.

La domanda deve essere “riesco a fare una derapata veloce e utile?”, non “quanto a lungo posso tenere la macchina di traverso?”.

### 4. Il bivio ha una conseguenza differita, ma poco conflitto immediato

I due rami sono intenzionalmente equivalenti nella distanza e selezionano il profilo dell’evento successivo. È una buona prima implementazione tecnica, ma da game design il giocatore non sacrifica quasi nulla nel momento della scelta. Una volta compreso quale profilo preferisce, il bivio rischia di diventare una selezione di menu mascherata da strada.

**Cambierei così:** manterrei la scelta futura ma differenzierei anche il presente:

- **Tecnica:** più corta ma stretta, richiede frenata e offre più occasioni Flow da curve;
- **Veloce:** più lunga ma larga, permette scia/nitro e sorpassi;
- oppure **Sicura:** recovery/repair minore contro **Rischiosa:** tempo migliore e rarità aumentata;
- segnaletica con icone di distanza, rischio e ricompensa, non soltanto nomi.

Le opzioni devono essere bilanciate sul tempo medio, non identiche nella geometria. Un giocatore esperto dovrebbe poter preferire il rischio, mentre uno danneggiato dovrebbe avere una ragione concreta per scegliere sicurezza.

### 5. Il sistema di piazzamento crea una possibile spirale negativa

I primi tre recuperano integrità e accedono alle rarità migliori; gli ultimi tre perdono integrità e ricevono offerte peggiori. Il giocatore che è già in difficoltà viene quindi colpito su tre assi: posizione, salute futura e potenza futura. È coerente con una run punitiva, ma riduce la probabilità di rimonta e rende meno significativa la scelta fra ricompense Common.

**Cambierei così:** conserverei il vantaggio di chi arriva davanti, ma eviterei il doppio castigo sistematico:

- 1°: alta probabilità di rarità e piccola riparazione;
- 2°–3°: rarità standard e piccola riparazione;
- 4°–5°: rarità ridotta **oppure** perdita di integrità, non entrambe sempre;
- 6°: penalità piena, ma almeno una proposta di recupero/build difensiva;
- obiettivi secondari (“nessun recupero”, “2 sorpassi puliti”) capaci di migliorare una delle offerte anche con piazzamento basso.

La vittoria deve accelerare una build, non rendere inevitabile la vittoria successiva.

### 6. Le famiglie di build non sono ancora equivalenti

La build Drift/Flow è già supportata dal percorso e dai trigger. Redline/Nitro ha alcune scelte chiare. Le altre famiglie sono più nominali che reali:

- **Impatto:** massa, riduzione danni e conversione danno→Flow esistono, ma manca una ricompensa esplicita per ram riusciti, knockback o sorpassi di contatto;
- **Aria:** esiste una ricompensa all’atterraggio, ma non esistono veri jump module e i dossi moderati non sostengono un archetipo;
- **Precisione:** la guida pulita genera Flow, ma non ha una catena di upgrade propria;
- **Chaos:** le due maledizioni sono buone, ma non formano ancora interazioni sorprendenti;
- **Grip:** non ha quasi una presenza autonoma nel catalogo.

**Cambierei così:** non aggiungerei subito decine di carte. Porterei prima a 4–5 upgrade realmente giocabili tre famiglie complete — Drift/Flow, Impatto, Precisione/Nitro — e rimanderei Aria finché i salti non sono contenuto reale. Ogni famiglia deve avere un generatore, un convertitore e un payoff.

### 7. Le tre gare chiedono quasi la stessa abilità

Cambiano seed, lunghezza e profilo, ma l’obiettivo resta sempre arrivare davanti a cinque AI. Questo limita la varietà più della quantità di moduli. Una strada tecnica non è un evento diverso: è la stessa prova con curve differenti.

**Cambierei così:** M5.2 dovrebbe introdurre Time Attack come vera seconda grammatica:

- target Bronzo/Argento/Oro visibili fin dall’inizio;
- checkpoint intermedi con delta, non solo un timer finale;
- piccoli bonus tempo ottenuti con linee rischiose, mai casuali;
- nessun traffico, oppure traffico deterministico e leggibile;
- ricompensa basata sulla fascia raggiunta, con integrità ancora persistente.

La terza prova della slice dovrebbe diventare un Duel/Boss, non una terza Road Race standard. Bastano un rivale memorabile e una regola leggibile; non serve ancora un sistema boss generale.

### 8. Gli avversari funzionano, ma non diventano personaggi

I rivali hanno nomi, ritmo, aggressività e linea preferita, però dal punto di vista del giocatore risultano soprattutto auto che occupano la pista. Non difendono in modo riconoscibile, non commettono errori leggibili e non comunicano la propria personalità. La scelta alternata dei rami garantisce copertura tecnica, ma è prevedibile.

**Cambierei così:** assegnerei a ogni nome un tratto visibile e limitato:

- Mica: pulita, forte in curva, evita contatti;
- Rook: pesante, protegge l’interno;
- Vanta: usa nitro e ramo veloce;
- Echo: rischia il ramo tecnico e può sbagliare;
- Sable: cerca scia e sorpasso tardivo.

Niente bonus impossibili o teleport. Bastano differenti soglie di frenata, propensione al contatto, scelta ramo, uso Flow ed errore controllato. Il risultato deve far dire “mi ha chiuso Rook”, non “la macchina viola era davanti”.

### 9. Recupero e checkpoint sono corretti, ma il fallimento è poco graduato

Il recupero evita soft lock ed è indispensabile sulle strade procedurali. Tuttavia una singola azione risolve ribaltamento, uscita, checkpoint saltato e blocco, sempre con lo stesso costo. Il giocatore può percepirlo come teleport di servizio anziché come parte del racing.

**Cambierei così:** manterrei un comando unico, ma modulerei la conseguenza:

- recupero rapido sulla carreggiata: 3 secondi;
- checkpoint saltato: ritorno prima del gate e perdita maggiore di posizione;
- caduta/uscita grave: 3 secondi più un piccolo danno, chiaramente anticipato;
- countdown visuale e ghost temporaneo al respawn per evitare nuovi impatti.

Non aumenterei la punizione finché la leggibilità procedurale non è provata con persone reali.

### 10. Manca ancora buona parte del “feeling di velocità”

FOV, camera chase e vibrazione da impatto sono una base, ma senza audio, particelle, fumo gomme, oggetti ravvicinati e feedback di superficie la velocità dipende troppo dal numero sul tachimetro. Questo danneggia anche drift, nitro e contatti, perché le loro differenze sensoriali sono meno forti delle differenze numeriche.

**Cambierei così, prima dell’art pass completo:**

1. motore reattivo a regime e carico;
2. vento proporzionale alla velocità;
3. tono e volume gomme legati allo slip;
4. colpo audio/visivo nitro;
5. particelle leggere e marker stradali per parallasse;
6. fumo solo durante slip significativo;
7. feedback direzionale dell’impatto.

Questo è gameplay feedback, non decorazione rinviabile interamente alla fine.

### 11. L’onboarding è informativo, ma troppo testuale

Il menu di aiuto descrive correttamente Flow, frenata e bivi. Tuttavia leggere un paragrafo non insegna il timing di una curva o di una derapata. Gli avvisi in gara aiutano, ma arrivano tutti nello stesso canale del cue e possono competere con countdown, recupero e checkpoint saltato.

**Cambierei così:** userei la prima gara come tutorial invisibile:

- prima curva larga: “FRENA PRIMA DELLA CURVA”;
- prima esse: indicatore della velocità consigliata;
- primo rettilineo: invito al nitro solo se c’è abbastanza Flow;
- primo bivio: anteprima persistente delle conseguenze;
- messaggi mostrati una volta per profilo locale, disattivabili.

Il Banco prova deve restare disponibile, ma non può essere l’unico luogo dove imparare il feeling.

## Cosa implementerei, in ordine

### Fase 1 — Rendere profondo ciò che esiste

1. Telemetria di playtest: Flow guadagnato per fonte, danni per causa, recuperi, velocità d’ingresso/uscita nei settori, ramo scelto e upgrade usato.
2. Feedback drift in tre fasi e primo pass audio per motore/gomme/nitro/urti.
3. Scia, sorpasso, near miss e ram come fonti Flow; riduzione del guadagno puramente passivo.
4. Una scelta Common iniziale per dare identità alla prima gara.
5. Revisione della penalità 4°–6° per evitare la spirale negativa.

### Fase 2 — Dare varietà alla run corta

1. Time Attack con tre target e delta ai checkpoint.
2. Bivi asimmetrici nel rischio attuale, mantenendo la conseguenza sull’evento seguente.
3. Finale Duel/Boss con un rivale e una regola distintiva.
4. Tre archetipi completi: Drift/Flow, Impatto e Precisione/Nitro.
5. Personalità AI leggibili e scelta ramo non puramente alternata.

### Fase 3 — Validare prima di espandere

1. Playtest con almeno 5 giocatori nuovi e 3 già esperti del progetto.
2. Sessioni sia con tastiera sia con controller fisico.
3. Domande senza suggerire la risposta: “cosa ti ha dato Flow?”, “cosa cambiava al bivio?”, “che build avevi?”.
4. Misurare abbandono, incidenti, uso nitro, scelta rami, piazzamenti e comprensione delle ricompense.
5. Cambiare numeri solo dopo aver distinto problemi di leggibilità, abilità e bilanciamento.

### Fase 4 — Espansione contenuti

Solo dopo il gate precedente introdurrei salti reali e build Aria, hazard, un secondo bioma, transizioni seamless più lunghe ed eventi aggiuntivi. Eliminazione e Survival hanno senso quando strada, AI e feedback sostengono già pressioni differenti; aggiungerli prima produrrebbe modalità nominalmente diverse ma superficialmente simili.

## Cose che non implementerei ora

- altre auto iniziali o un garage con statistiche differenti;
- armi, proiettili o power-up da kart racer;
- metaprogressione di potenza permanente;
- decine di upgrade prima che esistano trigger e payoff sufficienti;
- una mappa a nodi che sostituisca i bivi fisici;
- rubber-banding aggressivo;
- più biomi prima che una singola slice abbia audio, feedback e tre eventi distinti;
- classifiche online o multiplayer prima di stabilizzare il loop single-player.

## Metriche utili per decidere se il gameplay funziona

Non userei soltanto “ha finito la gara”. Per ogni evento registrerei:

- tempo in pieno gas, frenata, drift valido, fuori strada e scia;
- Flow prodotto per ogni fonte e Flow sprecato a cap;
- percentuale di Flow effettivamente spesa;
- velocità media e velocità nei punti tecnici;
- danni da muro, rivale, atterraggio o maledizione;
- sorpassi dati/subiti e contatti efficaci;
- numero e causa dei recuperi;
- scelta del ramo e tempo guadagnato/perso rispetto all’alternativa simulata;
- upgrade scelto, trigger attivati e valore prodotto;
- piazzamento e distanza dal rivale precedente/successivo.

Una build è riuscita se cambia queste metriche e il giocatore sa descrivere il cambiamento. Un bivio è riuscito se la scelta dipende dallo stato della run e dallo stile desiderato, non solo da una preferenza fissa sinistra/destra.

## Conclusione

La cosa migliore del progetto è che **la strada, la guida e la run stanno già iniziando a parlare fra loro**. La cosa da evitare è scambiare questa infrastruttura promettente per profondità già raggiunta.

La prossima versione convincente non richiede più quantità: richiede che Flow premi azioni automobilistiche riconoscibili, che i bivi impongano compromessi immediati, che tre ricompense costruiscano un’identità e che ogni evento chieda una competenza diversa. Se questi quattro punti funzionano, nuovi biomi e contenuti moltiplicheranno il valore del gioco; se non funzionano, lo diluiranno.
