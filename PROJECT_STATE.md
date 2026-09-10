# Project State

- Current stable milestone: Milestone 0 — DONE
- Current stable micro-milestone: Browser skeleton, fixed track, Rapier and input abstraction.
- Last known working commit: see latest `feat: initialize browser driving lab` commit in git log.
- What currently works: Vite/TypeScript build, Three.js track with instanced barriers/scenery, Rapier collision world, keyboard/gamepad input abstraction, FPS/draw-call overlay.
- What is incomplete: Vehicle controller and Milestone 1 gameplay; Milestones 2–9.
- Exact next recommended action: Implement the fixed-track driving vehicle and validate actual controls in browser.
- Current known blockers: None. Git remote is optional.
- Commands: `npm install`, `npm run dev`, `npm run build`. Tests arrive with the vehicle controller.
- Validation: production build passed; Chrome loaded canvas and initialized 781 colliders (26 draw calls). No gameplay milestone claimed yet.
