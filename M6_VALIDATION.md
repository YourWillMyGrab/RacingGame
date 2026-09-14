# M6.1 — Costa del Faro

Date: 2026-09-14. Baseline: clean `master`, `d185ecc`, identical to refreshed `origin/master`. Baseline `npm test`: 45/45; `npm run build`: PASS. No push or deployment.

## Micro milestone and implementation

A complete first playable biome loop within the existing three-event slice:

- **Identity:** a bright maritime palette, faceted limestone islets, harbour huts, striped lighthouses, warm barriers and matching orange hazard markings. Scenery is batched by geometry/material and owned/disposed by streamed chunks. Fork road surfaces and rails share the palette; branches stay unobstructed.
- **Hazard:** seeded crosswind, signposted at 70 m and 25 m with directional arrows and fixed windsocks. Orange road-edge strips delimit exposure. A 4–5 m/s² lateral force acts on physically supported vehicles within the road corridor; six-metre ramps soften entry/exit. HUD arrows, metadata and physical force agree. Warnings never replace the braking/checkpoint/recovery prompts.
- **Special rival:** FARO replaces rival 5 in Road Races. Its amber paint, rear wing and roof beacon distinguish it. It centres in technical sectors, uses a conservative target, attacks clear straights for up to 2.5 s and waits 5 s before rearming. Danger interrupts attacks. Boost spends real Flow; no teleporting or position-based speed bonus. The roof light turns green during attack and the HUD names the phase. Time Attack still has only the player.
- **Audio/VFX:** optional local Web Audio engine tone plus wind, boost and impact noise; persistent mute. A 64-instance particle pool supplies wind spray, drift smoke, boost and impact flecks. Presentation uses render poses/frame time and never writes physics state. Audio/particles are inactive in menus, countdowns, pause, rewards and results, and reset on a new run. Pause silences the audio directly without waiting for another render frame; cached-page navigation retains its resources.
- **Continuity:** wind uses independent `coast-wind-v1` random streams and module-local offsets, preserving `road-v4` geometry and seed layouts. Global station/heading placement carries hazards into appended event roads. Existing `EventJourney` ownership, reward handling, rolling Time Attack, stopped race grid, resources and recovery are retained without rebuilding world/body/stream. The lab remains a neutral tuning environment.

## Validation

| Gate | Result |
|---|---|
| Automatic suite | PASS: 50/50 (45 inherited + 5 biome regressions) |
| Production TypeScript/Vite build | PASS; existing large shared-chunk warning |
| Stress | PASS: 1,000 roads, 32,000 modules, 1,000 forks; 1,000 campaigns, 3,000 events, 2,000 connected boundaries |
| Browser biome | PASS: signed physical exposure, VFX, audio unlock/mute/persistence, pause/recovery/reset, FARO grid, 390 px HUD, no page errors |
| Browser menu | PASS: keyboard/controller menu, settings, all four modes, narrow layout, braking warning and clean Flow |
| Browser input/lab | PASS: acceleration, drift, boost, recovery, pause, restart, analog pad and pause debounce |
| Normal browser campaign | PASS: 7F2C-A91D, victory/reset, 362.98 s competitive total, 100 integrity, two rolling Time Attack boundaries, both branch recoveries and reward input devices |
| Over-target browser campaign / Road Race finale | PASS: MIXED-1, Time Attack 293.03 s over target, final Road Race 4th, 525.57 s total, 80.39 integrity, victory and clean reset |
| Standalone browser race | PASS: 1st, 152.43 s, 100 integrity, zero recoveries, clean restart |
| Standalone browser solo completion | PASS: 152.15 s, 100 integrity, zero recoveries, chunk unloading and same-seed restart |

Final automatic suite, production build and whitespace check pass. The final audio pause/background refinement is covered by the dedicated browser suite; driving/route code did not change after the full campaign/race/solo gates.

Physical measurements: at matched poses, a 4.5 m/s² wind displaces the grounded car −0.9158 m / +0.9137 m after three seconds; calm control is 0 m. Integrity remains 100. Recovery clears exposure and airborne cars receive no wind. FARO completes `FARO-RACE` in 118.13 s with five attacks and 279 boost steps (4.65 s), at 100 integrity; two independent physical executions are identical. Existing two complete physical mixed journeys, both fork arms, six finishers, Time Attack tiers, 144 Hz interpolation and progressive controller mapping all pass.

## Browser artifacts and scope

- `test-results/m6-coast/`: `wind-active.png`, `faro-grid.png`, `narrow-warning.png`; visually inspected. Bright-background HUD contrast and mobile overlaps were corrected, then the biome suite passed again.
- `test-results/m6-7F2C-A91D-normal/`: copied current-run victory, rolling start, branch, reward and transfer screenshots. The normal suite started before its artifact directory prefix changed; original full set remains under `test-results/refinement-7F2C-A91D-normal/`.
- `test-results/m6-MIXED-1-overrun/`: complete over-target campaign, rewards/transfers and Road Race finale; victory screenshot inspected, including FARO in the standings.
- Logs: `test-results/m6-run-normal.log`, `m6-run-overrun.log`, `m6-race.log`, `m6-modular.log`, `m6-biome-final.log`, `m6-tests-final.log`, `m6-build-final.log`.
- Browser tests use system headless Chrome, actual keyboard/Gamepad API input and the development server on 127.0.0.1:5173. Campaigns use virtual time and the existing braking pilot/recovery actions. No physical hardware performance claim is made.

## Remaining limits

- This closes a bounded biome micro milestone, not the three-biome 20–30 minute run. M6 remains open for encounter variety and human art/audio/balance acceptance.
- FARO is a special competitor, not a separate boss duel or special reward system. Standard passing/contact avoidance remains basic.
- Wind is spatial ground-level exposure, not dynamic weather; deliberately absent from forks, tunnels, technical sectors and finish lines. Human playtesting should tune perceived challenge and Time Attack targets.
- Original low-poly scenery is decorative outside the road; music, textured final assets and dynamic weather remain future work. Audio is synthesized and its perceived mix/speaker output needs human listening.
- Browser audio may need an initial click/key when entering exclusively with a controller. Audio failure does not block driving. Physical pad feel and hardware FPS remain unverified.
- The shared Rapier/Three bundle is approximately 3.4 MB JS / 1.23 MB gzip; this cycle does not optimise startup.

## Files changed

- Gameplay/presentation: `src/biome.ts`, `src/special-rival.ts`, `src/coast-effects.ts`, `src/vehicle.ts`, `src/event/point-to-point.ts`, `src/road/route.ts`, `src/road/stream.ts`, `src/car.ts`, `src/game.ts`, `src/style.css`.
- Tests/scripts: `tests/biome.test.ts`, `tests/biome-browser.mjs`, `tests/run-browser.mjs`, `package.json`.
- State/report: `PROJECT_STATE.md`, `CURRENT_TASK.md`, `ROADMAP.md`, `KNOWN_ISSUES.md`, `CHANGELOG.md`, `M6_VALIDATION.md`.
