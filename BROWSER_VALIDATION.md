# M5.2 browser validation — 2026-09-13

## Scope and environment

Validation resumes the implementation in PR #2, commit `3613864c93b730739864968f0d0b9ea7fcba53a4`, on local integration baseline `b501508`. The pull incorporated `origin/master` (`bd80225`) while preserving local documentation commit `fff275d`. The existing M5.2 branch was then integrated on `codex/m5-2-browser-validation`. No gameplay or test assertions were changed to obtain these results.

Windows, Node.js 24.11.1, npm 11.6.2, system Chrome 153.0.8010.36; default headless launch options, no `BROWSER_CONFIG` override. Vite serves `127.0.0.1:5173`. Browser scripts use the actual keyboard/Gamepad API input path; the campaign/menu scripts advance the browser clock while still running rendering and fixed-step physics. They do not teleport to the finish or inject run results.

## Fresh automatic checks

- `npm test`: 37/37 passed, including timed boundaries, reward tiers, countdown/resource freeze, recovery, wrecks, both physical fork arms, both event finales and reset.
- `npm run build`: TypeScript and Vite passed. Existing shared chunk warning remains: 3,399.31 kB JavaScript / 1,232.18 kB gzip.
- `npm run test:stress -- 1000`: 1,000 roads, 32,000 modules, 1,000 forks; no invalid connections, grades or missing finish. Also 1,000 mixed campaigns, 3,000 events and 1,489 Time Attacks with deterministic targets/rewards/reset.

## Browser checks

| Command | Result | Evidence |
|---|---|---|
| `npm run test:menu` | PASS | Keyboard/controller navigation, saved camera/quality settings, all modes, 390 px menu, braking cue and 73.09 clean Flow earned |
| `npm run test:browser` | PASS | Keyboard acceleration, drift, boost, recovery, pause freeze, restart, analog controller input and pause debounce |
| `npm run test:lap` | PASS | Complete lab lap in 34.53 s with 100 integrity |
| `npm run test:race` | PASS | Six-car standalone race, first place in 136.52 s, 100 integrity, actual finish order and restart |
| `npm run test:modular` | PASS | 2,725 m finish in 136.10 s, 100 integrity, 21 chunks unloaded / 3 active, same-seed reset |
| `npm run test:run` | PASS | Three mixed events, both branches/recoveries, targets/countdown/pause, keyboard/controller rewards, victory and reset |
| `TIME_ATTACK_OVERRUN=1 npm run test:run` | PASS | Late completion, reduced rewards, final victory and clean reset |

## Normal mixed campaign

Root seed `7F2C-A91D`; schedule Road Race → Time Attack → Time Attack.

| Event | Road/profile | Result | Finish integrity | Recovery / choice |
|---|---|---|---|---|
| 1 | `4B87D3B0-E1`, balanced | 6th, 89.50 s | 82.69 | Two recoveries; left chooses technical |
| 2 | `F9DC0B98-E2`, technical | Silver, 90.98 s | 74.69 | One recovery; right chooses speed |
| 3 | `EC365AD8-E3`, speed | Gold, 102.03 s | 82.69 | No recovery; no redundant final fork |

Total: 282.52 s. Time Attack targets were 86.52 / 100.37 / 116.81 s for event 2 and 103.85 / 120.47 / 140.20 s for event 3. The first result applied the existing −8 integrity penalty; Silver repaired 8 before the final event. Two upgrades were selected (`tire-smoke`, `landing`). There was no third reward. New run cleared results, upgrades and route history, restored the balanced profile, 100 integrity and 25 Flow. No page exceptions were reported.

## Late Time Attack

With `TIME_ATTACK_OVERRUN=1` and the same root seed, event 2 stayed playable after Bronze expired and finished at 210.28 s in the over-target band. It retained the right-branch speed choice and one recovery, offered `impact-cell`, `late-apex` and `capacitor`, and applied the existing −8 integrity penalty before event 3 (74.69 → 66.69). The result screen explicitly displayed `FUORI OBIETTIVO`. The final event finished Gold in 102.03 s with 66.69 integrity; the campaign completed in 401.82 s and passed the same clean-reset assertions, without page exceptions.

On PowerShell, launch this variant with `$env:TIME_ATTACK_OVERRUN='1'; npm run test:run`, then remove the variable before a normal run with `Remove-Item Env:TIME_ATTACK_OVERRUN`.

## Visual inspection and limits

Inspected current-run screenshots for the Time Attack countdown/targets, Silver/over-target results, Gold finale, fork selection, reward cards and narrow-screen menu. Text and controls are visible and the timed mode has no fake race standings. Normal-run evidence is preserved locally under `test-results/m5-2-validation/normal/`; over-target evidence is under `test-results/m5-2-validation/overrun/`. Browser artifacts remain ignored by Git.

The previous host's race timeout was not reproduced here. Passing this host does not certify physical gamepad hardware, mobile driving, human difficulty balance or production performance. Browser tests are still outside the Pages CI workflow. M5.3 world continuity is a separate task.
