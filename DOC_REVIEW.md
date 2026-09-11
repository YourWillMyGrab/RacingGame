# Documentation Review — 2026-09-11

## Esito

La documentazione è stata riallineata allo stato verificato del repository. M5.1 è completo: il gioco dispone di bivio fisico, scelta di profilo per l’evento successivo, percorsi indipendenti per auto e recupero sul ramo scelto. M5.2 (Time Attack) e M5.3 (ciclo continuo degli eventi) restano da implementare.

La verifica locale eseguita durante questa revisione è positiva:

- `npm test`: 30 test superati;
- `npm run build`: build TypeScript/Vite superata;
- `npm run test:stress -- 1000`: 1.000 seed, 32.000 moduli, 0 connessioni invalide, 0 gradi invalidi, 0 percorsi senza arrivo;
- `git status`: working tree pulita prima delle modifiche;
- `origin/master`: configurato sul commit stabile `54a36cd`.

## Correzioni applicate

- `PROJECT_STATE.md`: aggiornata la baseline da `40d0a78` a `54a36cd`, chiarito il prossimo task M5.2 e corretto il riferimento al remote.
- `KNOWN_ISSUES.md`: rimossa l’affermazione errata sull’assenza di un remote Git.
- `ROADMAP.md`: aggiunta la data dell’ultima revisione e ribadito che M5.1 è il checkpoint corrente.
- `CURRENT_TASK.md`: trasformato il vecchio checkpoint M5.1 in un checkpoint chiuso per questa revisione documentale.
- `README.md`: aggiunta una mappa della documentazione e corretta una nota di riproducibilità.
- `DEVELOPMENT.md`: aggiunte istruzioni operative per test, browser playtest, Pages e skill consigliate.
- `CHANGELOG.md` e `DECISIONS.md`: registrata la revisione e la distinzione tra skill Playwright e Hermes Agent.

## Skill valutate

- `playwright`: installata dal catalogo ufficiale. È pertinente perché il progetto contiene regressioni browser Playwright e richiede test con server Vite attivo.
- `hermes-agent`: installata dal repository pubblico `NousResearch/hermes-agent`. È utile come skill opzionale per orchestrare Hermes e delegare attività, ma non aggiunge capacità specifiche al runtime del gioco.
- Non sono state installate skill di deployment o sicurezza: Pages è già configurato e questa revisione non introduce codice o superfici di rete nuove.

## Gate da preservare

- Non dichiarare il MVP completo: mancano due tipi di evento, continuità senza ricostruzione, biomi, boss, audio e polish/performance.
- Distinguere sempre test automatici, browser playtest simulato e collaudo con controller fisico.
- Mantenere `road-v2` nelle modalità standalone e `road-v3` nella campagna con bivi.
- Prima di M5.2 leggere `PROJECT_STATE.md`, `ROADMAP.md`, `CURRENT_TASK.md`, `git status` e `git diff`, poi eseguire la verifica rapida.
