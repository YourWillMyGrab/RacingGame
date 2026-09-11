# Current Task

- Task id: review-driving-menu-italian
- Goal: Address user feedback: technical circuits that reward braking, accessible skill-based Flow, a real main menu, and consistent Italian localization.
- Files expected to change: src/config.ts, src/vehicle.ts, src/road/, src/race.ts, src/game.ts, src/input.ts, src/lab.ts, src/upgrades.ts, src/style.css, tests/, docs.
- Acceptance criteria: Every generated race has readable technical braking sectors; a braking driver outperforms full-throttle driving there; useful Flow without upgrades; no idle/handbrake farming; menu and modes work with keyboard/controller; Italian player-facing labels; regression/build/browser checks pass.
- Baseline commit: aea3264 (stable gameplay e90fe92).
- Status: DONE
- Review findings: Road curvature is too mild, lateral tire force is unbounded, high-speed Flow threshold 38 m/s is above normal engine equilibrium, drift eligibility is narrow, title screen lacks a main-menu hierarchy and player text mixes English/internal terms.
- Outcome: All four user feedback items implemented. 24 automated tests, build, 1,000-seed stress and Chrome menu/controls/lap/solo/race/full-run checks passed. Local stable commit is recorded in PROJECT_STATE.md.
- Resume: This review is complete. Preserve the new braking/Flow/menu regressions when beginning the next authorized roadmap step.
