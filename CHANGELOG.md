# Changelog

## 2026-09-10

- Created the repository documentation and interruption-safe project state baseline.

- M0: Added buildable Vite/TypeScript/Three.js app, Rapier collision world, fixed track, instanced scenery, input abstraction and debug overlay. Build and Chrome smoke check passed.

## First driving slice — 2026-09-10

- Implemented fixed-step custom Rapier vehicle with ray suspension, grip, steering, handbrake drift, braking/reverse and boost.
- Added controlled-drift Flow generation, integrity damage, recovery penalty and clean session restart.
- Added original car geometry, chase camera, lap timer/counter, HUD, title/pause/wreck screens and live tuning.
- Fixed short R/Esc presses missed between animation frames; single actions now use keydown events.
- Added 7 physics/track regression tests and reproducible Chrome keyboard/gamepad/lap checks. Completed a full lap with no damage.
- Reviewed project Markdown, corrected state/blocker descriptions and documented startup and limitations.

- M2.1: Added 11 authored road profiles, independent deterministic random streams, socket validation and reproducible 1,000-seed stress command.

- M2.2: Connected authored geometry to drivable Rapier trimeshes, streamed chunks/colliders, tunnel/bridge scenery, seed entry/replay, route progress and finish. Preserved original Driving Lab. Full 2,860m Chrome test passed at 100 integrity, with 21 chunks unloaded. Added occupied-recovery regression.

- M3: Added five physical AI rivals, seeded personalities and passing behavior, locked countdown, ordered checkpoints, finishing times, three-second recovery holds and race results/restart. 15 tests and full Chrome race passed (1st, 107.30s, 100 integrity).

- Fixed result-screen stop incorrectly counting as collision damage; finished racers no longer receive impact evaluation. Added post-finish integrity regression.

- M4 foundation: added typed removable gameplay hooks, 14 data-defined upgrades, seeded placement-weighted rewards, three-event temporary run state and build/reset regression tests. UI connection is next.

## M4 completed — 2026-09-10

- Connected the 14-upgrade pool and temporary build hooks to a three-event coastal run with one-of-three reward screens, placement-based rarity/repair/penalty and resource carryover.
- Added keyboard and controller reward navigation, final victory, and clean new-run reset. Preserved standalone race, solo road and fixed lab modes.
- Derived separate event road seeds from the full root seed; long seed input no longer risks erasing event identity.
- Fixed countdown resource decay, airborne road progress and recovery past missed checkpoints. Added explicit missed-checkpoint HUD guidance.
- Final verification: 22 automated tests, production build and full Chrome three-event/reward/victory/reset test pass. Tested 1st/5th/1st placements, both reward input methods and recovery. Final run 178.18s, integrity 82.69; new run has zero upgrades, integrity 100 and Flow 25.

## M4 feedback review — 2026-09-10

- Added three authored braking profiles, 12 m technical centres, guaranteed sector spacing, advance road/HUD signs and curvature-aware AI braking. Capped lateral tire force so excess entry speed loses the line.
- Increased base-car acceleration and accessible Flow: clean corners, reachable high speed, wider drift eligibility and clean-exit bonus; reduced nitro drain. The HUD explains the source of Flow.
- Added a main menu with three-race play, standalone race, solo practice, fixed lab, controls/help and persisted view/resolution preferences. Supports keyboard and standard controller navigation.
- Revised player-facing Italian: derapata, nitro, codice percorso, checkpoint guidance, upgrade names/descriptions and translated rarities; internal identifiers remain stable.
- Added braking-versus-full-throttle regression and menu/browser coverage. The new road-v2 stream changes old seed layouts while preserving repeatability within the version.
- Verification: 24 automated tests, build, 1,000 seeds / 32,000 modules, keyboard/controller controls and a damage-free lab lap pass. Full three-event Chrome run passed in 255.87 s with 69.17 final integrity, keyboard/controller rewards, recovery and clean reset.

- 2026-09-11 resume: completed return-to-menu from lab pause, shared lab view preferences, Enter/A lab start, Italian decimal separators and singular recovery labels. Final menu regression passed.
- Final long-route checks passed: standalone six-car race 136.52 s / 1st / 100 integrity; solo 136.10 s / 100 integrity, 21 streamed chunks unloaded; both reset successfully. All requested feedback items are complete.

## M5.1 physical route choice — 2026-09-11

- Added a physical 300 m split/merge to the first two campaign races. Each 12 m branch has road collision and barriers, with a real separated centre; rendering is instanced and streaming owns/disposes both arms and signs.
- Driving left selects a technical next-event profile; driving right selects longer straight sections. Signs at 100/30 m and Italian HUD/reward text explain the consequence. New-run reset clears route history.
- Added per-car route cursors, physical branch locking, branch-aware AI targeting and recovery, preserving ordered gates and equal branch stationing.
- Added six regressions covering 1,000 deterministic fork/profile layouts, both full physical drives with recovery, central collision gap, six independent racing cars and event-profile/reset behavior. 30 automated tests and production build pass; 1,000-seed / 32,000-module stress now includes both arms. Final Chrome run passed: left then right physical choices, both branch recoveries, technical then speed event profiles, keyboard/controller rewards, victory and clean reset. Times 89.53 / 91.87 / 109.47 s, final integrity 73.08.
- Corrected fork minimum-width/curvature metadata and compensated carriageway width through the bend; edge ray coverage and both full physical drives pass after this refinement.
- Added the GitHub Pages workflow and project-site-aware Vite base path. Every push to `master` runs tests, builds `dist`, and deploys the playable site.
