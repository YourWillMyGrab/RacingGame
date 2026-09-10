# Project State

- Current stable milestone: Milestone 0 — DONE. Milestone 1 implementation is playable; handling acceptance and physical gamepad validation remain IN_PROGRESS.
- Current stable micro-milestone: M1 fixed-track driving, Flow/boost, collisions, recovery, session HUD and tuning — implemented and automatically validated.
- Last known working commit: see latest `feat: add playable fixed-track driving prototype` in git log (exact hash recorded in the following documentation checkpoint).
- What currently works: Three.js/Rapier fixed-track driving; four suspension ray contacts; speed-sensitive steering; brake/reverse; controlled drift earns Flow; boost consumes Flow; impacts damage integrity; wreck/restart session; safe recovery with +3s penalty; lap counter; chase camera; keyboard and standard Gamepad API; pause on focus loss; live tuning/debug metrics.
- What is incomplete: Physical controller and subjective feel acceptance; ramps/elevation and richer handling cases; all procedural/AI/roguelike systems (M2 onward). This is not the full game/MVP.
- Exact next recommended action: Resume from this clean checkpoint; run build/tests and the browser checks; tune repeated laps and validate a connected physical standard controller before starting M2. Do not infer subjective handling approval from automated lap completion.
- Current known blockers: None for local development. Physical hardware testing depends on a connected controller.
- Commands: `npm ci`, `npm run dev`, `npm run build`, `npm test`. With dev server on port 5173 and Chrome installed: `npm run test:browser`, `npm run test:lap`.
- Validation (2026-09-10): production build passed; 7 physics/track tests passed; Chrome exercised keyboard acceleration/drift/boost, rapid R/Esc, frozen pause and restart; simulated Gamepad API exercised analog throttle, steering and Start debounce; completed a full lap in 33.53s at 100 integrity, no recoveries; title/driving/lap screenshots inspected. Vite reports the known large Rapier bundle warning.
- Runtime: local dev server on http://127.0.0.1:5173 during implementation. Restart it if no longer running.
