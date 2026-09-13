# Known Issues

- This is the coastal slice during M5 development: three short mixed Road Race/Time Attack events, two reward selections, temporary upgrades and run end/reset. It is not the complete three-biome 20–30 minute MVP.
- One authored physical split/merge now supports two next-race road profiles. Seamless event continuation, bosses, further biomes, jump gaps and richer banking remain outstanding.
- Between races the result/reward screen rebuilds the next seeded road; seamless progression is a future M5 task.
- Physical gamepad hardware is untested. Standard Gamepad API throttle/steering/pause and reward selection were tested with simulated hardware; nonstandard mappings are unsupported.
- AI uses a lightweight passing-line heuristic. Contact can block a car and require recovery; richer avoidance/defense, drafting and balance remain work for later slices. Finished cars retain road collision and ignore other cars so they cannot block the finish.
- The route generator intentionally stays inside a forward heading corridor to prevent self-intersections. Metadata is generated upfront, bounded to 128 modules; render and physics chunks are streamed. Stress validation now includes both arms of one authored split/merge; arbitrary branching graphs and shortcuts are not covered.
- Suspension uses four Rapier rays, while body pitch/roll are locked and visually assisted. Gentle elevation is tested, but large jumps and complex landings still need authored browser content.
- Art is simple original prototype geometry. Audio, tire smoke, weather, rich lighting and final visual polish remain outstanding.
- Vite reports the large Rapier/WASM shared chunk (~3.4 MB JavaScript, ~1.23 MB gzip). Performance and startup optimization remain outstanding; local FPS is not a hardware certification.
- Browser tests require Chrome and the dev server on 127.0.0.1:5173. The full-run test uses a virtual clock and a simulated braking driver that uses the actual R recovery action when blocked.
- GitHub origin is configured for YourWillMyGrab/RacingGame; the old no-remote note is superseded.

- Standalone modes retain road-v2. Campaign forks/profile choices use road-v3 and deliberately change campaign layouts. Technical sections are narrow chicanes/esses, not hairpins; difficulty and Flow still need subjective human playtesting. Menu graphics/camera preferences persist locally; there is no audio system yet.

- M5.2 browser gate is pending: 37 automatic tests/build/stress pass. Chrome 153 boot smoke succeeds, but the standalone race browser test times out before 450 m in 45 s; the menu test reaches its braking-warning screenshot but its long virtual-time drive is too slow to complete here. The mixed campaign and over-target browser suites have not passed, and no Time Attack screenshot/layout review is claimed. Run all browser scripts on a faster or hardware-accelerated Chrome host; use BROWSER_CONFIG for an alternative Playwright launch configuration.
- Time Attack target tuning is initial: integration of the road braking envelope plus seeded variation, with fixed Gold/Silver/Bronze multipliers. Both profiles are reachable in physical simulations, but difficulty and HUD readability still require browser/human playtesting. Impact-focused upgrades have no rivals to ram during Time Attack; no compensating rebalance is included.
