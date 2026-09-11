# Current Task

- Task id: M5.1-physical-route-choice
- Goal: Add a physical split/merge in the first two campaign races. Driving left/right selects a technical/speed profile for the next event; signage explains the consequence in advance.
- Baseline commit: 88c4c17 (validated gameplay 7a8c4c0).
- Status: IN_PROGRESS
- Acceptance criteria: both arms physically drivable and rejoin; deterministic geometry and profile choices; player and AI have independent route cursors; recovery stays on selected arm; choice applied once and preserved in run history; visible Italian signs/HUD; streaming disposes both arms; existing modes/tests/build remain valid and browser proves both choices and next-event profile.
- Scope: M5.1 only. Two distinct event types and continuous event-to-event world lifecycle are the subsequent M5.2/M5.3 tasks, not claimed here.
- Files expected to change: src/road/, src/vehicle.ts, src/race.ts, src/run.ts, src/game.ts, tests/, state documents.
- Resume: Complete and validate physical route selection before starting the next micro-milestone.
