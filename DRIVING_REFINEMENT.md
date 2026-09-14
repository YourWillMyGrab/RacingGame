# Driving refinement — 2026-09-13

## Scope

User playtest requested smoother camera/controller input, less slippery handling, harder roads, longer/different fork arms and continuity into Time Attack.

All branches were integrated into local master (`a4549fa`). The documentation merge retained the existing combined DOC_REVIEW and incorporated the gameplay-review branch. Initial baseline: 41 tests passing.

## Changes

- Pose interpolation at display frequency, shortest-angle heading interpolation, reset on recoveries. The camera filters heading separately; body lean uses time-based damping in both the main game and lab.
- Controller centre sensitivity reduced with a continuous cubic/linear response. Steering and yaw response increased; grip 8.2 → 13 and lateral acceleration 11 → 15 m/s². Normal yaw is capped by available tyre force. Handbrake drift keeps a 0.4 s catch window.
- Scenery objects with common materials are instanced. Runtime streaming admits one new chunk each frame; initial load and physical test setup remain synchronous.
- Road generator version `road-v4`: longer compound technical sectors; 620 m forks replacing the mirrored 300 m curve. Technical left arm has multiple direction changes and at least 35 m more physical length than the right arm in the seeded regression set. Socket, station, carriageway width, collision and recovery invariants remain checked.
- Before a Time Attack, go straight to perk selection. This remains a tactical pause, then finish velocity resumes. The next start portal begins timing immediately without braking the car or showing a grid countdown. Road Race retains the stopped grid. Rewards, repair, world identity and checkpoint protections remain.

## Evidence

- Automatic regression suite includes 144 Hz interpolation, wrapped heading and recovery, centre noise/full-lock controller mapping, planted handling, asymmetric fork geometry, two complete physical journeys, both fork surfaces, six AI finishers and rolling/stopped boundaries.
- Normal cornering test: maximum slip 0.039 rad (about 2.2°); a 3 m/s lateral perturbation is reduced below 0.25 m/s within 300 ms. The braking driver completes the selected technical course with 100 integrity; full throttle becomes stuck well before the finish.
- Stress: 1,000 roads / 32,000 modules / 1,000 forks; 1,000 mixed campaigns / 3,000 events / 2,000 connected boundaries. No invalid connections/grades or missing finishes.
- Browser keyboard acceleration, deliberate drift, boost, recovery, pause/restart, analog throttle and controller pause debounce: PASS.
- Completed browser and build checks are recorded below.

Physical gamepad hardware and subjective handling have not been certified. These checks establish behavior and regressions, not a universal 60 FPS guarantee. The shared bundle size warning remains.

## Completed gates

- `npm test`: 45/45 PASS.
- `npm run build`: PASS (existing shared-bundle size warning).
- `npm run test:stress -- 1000`: PASS for roads and mixed campaigns.
- `npm run test:browser`, `npm run test:menu`, `npm run test:lap`, `npm run test:race`: PASS.
- Normal full browser campaign `7F2C-A91D`: PASS, 362.98 s competitive total, 100 final integrity, Time Attack finale, two rolling boundaries, both physical fork choices and recoveries, keyboard/controller rewards, clean victory/reset. Screenshots of the asymmetric fork, perk selection and moving Time Attack start inspected.
- Artifacts: `test-results/refinement-7F2C-A91D-normal/` and the existing suite screenshot paths (ignored by Git).
- Static scenery sample at station 450, seed `7F2C-A91D`: 7 loaded chunks, 172 decorative objects represented by 14 instanced draw batches (before frustum culling). This measures batching, not end-to-end FPS.

## Resume verification — 2026-09-14

- The solo modular browser run passed at 152.13 s, 100 integrity, zero recoveries, with streaming/unloading and seed restart checked.
- The interrupted over-target `MIXED-1` browser run reached the final victory screen: approximately 521 s competitive total, 92 integrity, two perks, second place in the final Road Race. The saved `run-complete.png` was inspected on resume; preceding output confirmed the Time Attack over-target result at 293.03 s, and the screenshot is produced after the finale assertions. The process tail was unavailable after interruption, so its final reset/console assertion is not separately claimed; the common reset path passed the normal campaign and standalone race suites.
- Final polish applies the same damped chase heading/time-based body lean in the lab and avoids sampling the previous rival pose while paused.
- On resume, 45/45 tests, production build and whitespace checks pass again. Keyboard/gamepad browser smoke passes again. Remote refs refreshed: no outstanding branches outside master.
- Final menu/browser regression also passes after resume, including both input devices, settings, all modes, narrow viewport and clean Flow.
