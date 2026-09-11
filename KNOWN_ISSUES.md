# Known Issues

- This is the coastal slice during M5 development: three short Road Races, two reward selections, temporary upgrades and run end/reset. It is not the complete three-biome 20–30 minute MVP.
- One authored physical split/merge now supports two next-race road profiles. Distinct event types, seamless event continuation, time attack/bosses, further biomes, jump gaps and richer banking remain outstanding.
- Between races the result/reward screen rebuilds the next seeded road; seamless progression is a future M5 task.
- Physical gamepad hardware is untested. Standard Gamepad API throttle/steering/pause and reward selection were tested with simulated hardware; nonstandard mappings are unsupported.
- AI uses a lightweight passing-line heuristic. Contact can block a car and require recovery; richer avoidance/defense, drafting and balance remain work for later slices. Finished cars retain road collision and ignore other cars so they cannot block the finish.
- The route generator intentionally stays inside a forward heading corridor to prevent self-intersections. Metadata is generated upfront, bounded to 128 modules; render and physics chunks are streamed. Stress validation now includes both arms of one authored split/merge; arbitrary branching graphs and shortcuts are not covered.
- Suspension uses four Rapier rays, while body pitch/roll are locked and visually assisted. Gentle elevation is tested, but large jumps and complex landings still need authored browser content.
- Art is simple original prototype geometry. Audio, tire smoke, weather, rich lighting and final visual polish remain outstanding.
- Vite reports the large Rapier/WASM shared chunk (~3.4 MB JavaScript, ~1.23 MB gzip). Performance and startup optimization remain outstanding; local FPS is not a hardware certification.
- Browser tests require Chrome and the dev server on 127.0.0.1:5173. The full-run test uses a virtual clock and a simulated braking driver that uses the actual R recovery action when blocked.
- No remote Git origin is configured; local development and commits work, but no off-device backup was created.

- Standalone modes retain road-v2. Campaign forks/profile choices use road-v3 and deliberately change campaign layouts. Technical sections are narrow chicanes/esses, not hairpins; difficulty and Flow still need subjective human playtesting. Menu graphics/camera preferences persist locally; there is no audio system yet.
