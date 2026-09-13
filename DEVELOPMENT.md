# Development workflow

## Baseline corrente

M5.3 introduce la continuità del mondo tra gli eventi sul branch `codex/m5-3-world-continuity`. Lo stato e il checkpoint verificato sono in `PROJECT_STATE.md`; le prove correnti in `M5_3_VALIDATION.md`, quelle storiche di M5.2 in `BROWSER_VALIDATION.md`.

Prima di iniziare un nuovo micro-milestone:

1. leggere `PROJECT_STATE.md`, `ROADMAP.md`, `CURRENT_TASK.md` e `KNOWN_ISSUES.md`;
2. eseguire `git status` e `git diff`;
3. verificare la baseline con test rapidi;
4. aggiornare `CURRENT_TASK.md` prima di modifiche rischiose.

## Comandi

```sh
npm ci
npm test
npm run build
npm run test:stress -- 1000
npm run dev
```

Con Vite attivo su `127.0.0.1:5173`, i test browser sono:

```sh
npm run test:browser
npm run test:lap
npm run test:modular
npm run test:race
npm run test:run
npm run test:menu
```

I test browser richiedono Chrome e usano Playwright con tastiera e Gamepad API simulato. Il risultato non certifica un controller fisico né prestazioni costanti a 60 FPS su ogni macchina. Gli screenshot finiscono in `test-results/`, esclusa da Git. Le campagne M5.3 usano sottocartelle separate per seed e variante normale/fuori tempo.

Per una configurazione Chromium alternativa, `BROWSER_CONFIG` indica un file JSON di opzioni di avvio Playwright. Senza override viene usato Chrome headless. `RUN_SEED` cambia il seed della campagna di test. Per verificare anche la Time Attack oltre il Bronzo su PowerShell:

```powershell
$env:TIME_ATTACK_OVERRUN='1'
npm run test:run
Remove-Item Env:TIME_ATTACK_OVERRUN
```

Per coprire anche la ripartenza con cinque rivali, imposta `$env:RUN_SEED='MIXED-1'` prima di `npm run test:run`, poi rimuovila con `Remove-Item Env:RUN_SEED`. Puoi combinarla con `TIME_ATTACK_OVERRUN` per verificare riduzione delle ricompense e finale Road Race nella stessa campagna.

Consultare `M5_3_VALIDATION.md` per le prove del checkpoint. Non confondere un timeout su un host lento con una certificazione di prestazioni o con un difetto di gameplay: conservare risultati e configurazione dell'ambiente. Il workflow Pages esegue ancora solo test automatici e build; il gate browser resta locale.

## Hosting

Il workflow `.github/workflows/deploy-pages.yml` esegue `npm ci`, `npm test` e `npm run build` su ogni push a `master`, poi pubblica `dist` su GitHub Pages. Il repository usa `origin/master`; la sorgente Pages deve essere impostata su GitHub Actions nelle impostazioni del repository.

## Skill Codex

- `playwright` è la skill di sviluppo rilevante per questo repository: aiuta a mantenere ed estendere i test browser e le verifiche UI.
- `hermes-agent` è installata come supporto opzionale all’orchestrazione Hermes. Non è una dipendenza del progetto, non modifica il runtime e non sostituisce i test locali.

Le skill sono installate nell’ambiente Codex dell’utente e diventano disponibili nelle sessioni successive; il repository non deve importarle come dipendenze npm.

## Criteri di completamento

Una modifica di gameplay è pronta quando passa test pertinenti, build e browser playtest del relativo loop, aggiorna i file di stato e viene registrata in un checkpoint Git. Non descrivere M5.1 come evento Time Attack o come continuità seamless: quei risultati appartengono ai micro-milestone successivi.
