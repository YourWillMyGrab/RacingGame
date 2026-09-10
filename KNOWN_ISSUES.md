# Known Issues

- Physical gamepad hardware has not been tested; standard Gamepad API throttle, steering and pause were tested with simulated device data in Chrome. Nonstandard controller mappings are not supported.
- User accepted the starting handling; physical controller validation remains pending.
- Fixed Driving Lab remains flat; modular road adds gentle elevation, tunnels and bridges. Jump gaps and complex banking remain future content. Pitch/roll remain assisted/visual.
- Visual assets are simple original prototype geometry. Audio, tire smoke, advanced lighting and visual polish are not implemented.
- Rapier compatibility/WASM bundle causes a Vite chunk warning (~3.4 MB JavaScript, ~1.23 MB gzip). Startup/performance optimization is still pending; a single local FPS sample is not a performance certification.
- Automated browser scripts require Chrome and a dev server specifically at 127.0.0.1:5173. Timed input tests assume the machine can run the scene without severe stalls.
- No Git remote configured; local development and commits work. No off-device backup was created.

- M2 generator intentionally advances within a bounded heading corridor to prohibit self-intersections. Hairpins, forks, shortcuts and branch validation are not implemented. Geometry is streamed but lightweight route metadata is generated upfront (bounded to 128 modules).

- AI uses a lightweight passing-line heuristic; deliberate defense, drafting and richer personalities remain future tuning. Cars that finish are ghosted against other cars so they cannot block the finish.
