# M5.3 validation — 2026-09-13

## Scope and environment

M5.3 world continuity on `codex/m5-3-world-continuity`, starting from `6459ea6`. Validated implementation checkpoint: `d0941c9`. `git fetch origin` succeeded; `git merge origin/master` reported already up to date (`bd80225` is included in the local baseline). Task scope checkpoint: `801d50b`. Remote branches and Pages are unchanged.

Windows, Node.js 24.11.1, npm 11.6.2 and system Chrome 153.0.8010.36, default headless options; no launch override or increased browser timeout. Vite serves `127.0.0.1:5173`. Tests operate keyboard and simulated standard Gamepad API, advancing the browser clock while real rendering and Rapier physics continue. They do not teleport the campaign to finishes or inject results.

## Automatic evidence

- `npm test`: 41/41 pass. Four new tests cover seeded connected geometry and global IDs, two full physical campaigns with different finale types, seam recovery, frozen finish pose/resources, retained body/chunk identity, rival removal/spawn counts, hook/mass changes, transfer failure and disposal.
- `npm run build`: TypeScript and production Vite build pass. Existing shared-chunk size warning remains approximately 3.40 MB / 1.23 MB gzip.
- `npm run test:stress -- 1000`: 1,000 roads / 32,000 modules / 1,000 forks; 1,000 mixed campaigns / 3,000 events / 2,000 connected event boundaries / 1,489 Time Attacks. Deterministic placement, targets, rewards and reset pass.

## Browser evidence

| Suite | Status | Evidence |
|---|---|---|
| Menu | PASS | Keyboard/controller navigation, persistence, all modes, narrow viewport, braking warning and clean Flow |
| Driving controls | PASS | Acceleration, drift, boost, recovery, pause/reset and analog controller controls |
| Lab lap | PASS | 34.53 s complete lap, 100 integrity |
| Modular solo | PASS | 136.10 s full traversal, 100 integrity, streaming/unloading and restart |
| Standalone Road Race | PASS | Six physical cars, real result, 136.52 s first place, reset |
| Normal mixed campaign, `7F2C-A91D` | PASS | Road Race 89.55 s, Silver Time Attack 90.87 s, Gold Time Attack 101.92 s; victory/reset |
| Over-target mixed campaign, `MIXED-1` | PASS | Road Race 74.93 s, over-target Time Attack 209.95 s, Road Race 106.62 s; victory/reset |

The campaign suite now checks that world generation/body handle and finish pose survive both reward choices, one body remains during transfer, the timer is zero, transfer pause freezes pose/resources, recovery works on the new side of the seam, gate crossing creates the correct next event with a fresh countdown/checkpoint, both fork choices still apply, and reset returns to 12 initial modules/start station 25/base resources.

Final automatic log: `test-results/m5-3-automatic.log`. Browser logs: `test-results/m5-3-regressions.log`, `test-results/m5-3-run-final.log`, `test-results/m5-3-overrun-road-finale.log`. Screenshots: `test-results/m5-3-7F2C-A91D-normal/` and `test-results/m5-3-MIXED-1-overrun/`.

## Fixes found during verification

The first campaign attempt found a Time Attack reward resume moving the body: Rapier retained the former dynamic velocity while the car was kinematic. Resume now explicitly zeros linear/angular velocity and forces; the regression asserts zero velocities and exact handoff pose. The transfer HUD also stopped adding old recovery penalties. The failed initial log is retained as `test-results/m5-3-run.log` and is not counted as passing evidence.

The final review also validates each connected event in its own heading frame, checks all 1,000 coastal campaigns keep advancing globally, clears stale finished Flow feedback, and labels the total as time in competitive events. The final 41-test/build/stress gate passed after these checks.

## Campaign results

Normal run: 282.33 s competitive total, 82.69 final integrity, upgrades `tire-smoke` and `landing`. Over-target run: 391.50 s total, the timed failure band applied −8 integrity (100 → 92), and the final six-car race finished third at 92 integrity with `drift-bank` and `armor`. Both selected left/technical then right/speed and completed two recoveries on the connecting road. World generation stayed 2 and player body handle stayed 0 through all events; event body counts were 6 → 1 → 1 and 6 → 1 → 6 respectively. New run cleared results/builds/branches and restored 100 integrity, 25 Flow, initial station 25 and 12 initial modules. No page exceptions.

## Visual inspection and limits

Inspected both campaigns’ connected transfer roads/start portals, stationary reward resume, zero transfer timer, seam approaches, reward text/cards, Time Attack targets/over-target result and both victory screens. The same car and nearby road remain present behind the reward overlay. Results/rewards intentionally pause driving; the next gate uses a stopped countdown. This milestone is world continuity for the coastal slice, not biome blending or a rolling-start system.

Physical controller hardware, subjective balance, mobile driving and production performance remain unverified. Browser tests still run locally outside Pages CI. Lightweight road metadata grows to 42 modules for this bounded run; meshes and colliders unload by distance. The shared bundle warning remains.
