# Decisions

- The authoritative design brief is `ASTRA_RACING_ROGUELIKE_MASTER.md`.
- The initial implementation follows a vertical-slice approach, starting with a fixed test track and driving feel before procedural generation.
- Target stack: TypeScript, Vite, Three.js, and a custom arcade/simcade vehicle controller.
- Run-critical randomness must use deterministic seeded streams; `Math.random()` is not allowed for gameplay generation.
- There is one base player car in the MVP; build identity comes from temporary run upgrades.
