# Known Issues

- Physical gamepad hardware has not been tested; standard Gamepad API throttle, steering and pause were tested with simulated device data in Chrome. Nonstandard controller mappings are not supported.
- Driving feel needs human evaluation before M2. The completed automatic lap verifies traversability, not fun or balance.
- Test circuit is flat. Suspension and airborne/landing return are unit-tested, but ramps and elevation are not yet browser content. Pitch/roll are visual only; the dynamic body locks those axes as an arcade stability assist.
- Visual assets are simple original prototype geometry. Audio, tire smoke, advanced lighting and visual polish are not implemented.
- Rapier compatibility/WASM bundle causes a Vite chunk warning (~3.4 MB JavaScript, ~1.23 MB gzip). Startup/performance optimization is still pending; a single local FPS sample is not a performance certification.
- Automated browser scripts require Chrome and a dev server specifically at 127.0.0.1:5173. Timed input tests assume the machine can run the scene without severe stalls.
- No Git remote configured; local development and commits work. No off-device backup was created.
