# BOCK - Battle Operations Command Kernel

BOCK is a local single-player retro military computer simulator presented as a fictional 1980s command terminal. Everything in the app is self-contained: the systems, networks, locations, vulnerabilities, command flow, and conflict simulations are invented for dramatic gameplay only.

Current version: `26.3.30.1`

## Features

- Full-screen green phosphor CRT aesthetic with scanlines, flicker, typing cadence, synthesized terminal sounds, and an optional retro computer voice channel
- Voice menu for live control of BOCK speech speed and pitch
- Cinematic boot sequence with fake diagnostics and subsystem initialization
- Ominous BOCK shell with puzzle-style access escalation through fictional node exploration
- Command parser with `help`, `login`, `dir`, `connect`, `scan`, `games`, `play`, `status`, `clear`, `logout`, `save`, and `load`
- Layered access levels: `guest` -> `operator` -> `strategic` -> `omega`
- Fictional command modules for status, theater maps, readiness reports, archive fragments, and launch simulation previews
- Built-in simulations:
  - `tic_tac_toe`: quick board duel against BOCK
  - `checkers`: diagonal attrition exercise
  - `chess`: stripped-down strategic board war
  - `poker`: solitary draw table
  - `red_dawn`: fleet placement deterrence puzzle
  - `signal_hunt`: relay-tracing signal puzzle
  - `world_theater`: large-scale global conflict simulation with dramatic text resolution
- Hidden `SUPER USER ∞` mode with a fully local Cheep Cheep chat process and no external credentials or APIs
- Local save/load state via `localStorage`
- Attract/demo mode that periodically demonstrates the shell when enabled
- Lightweight browser test page for command and gameplay verification

## Project Structure

```text
.
├── index.html
├── README.md
├── scripts/
│   └── serve.py
├── src/
│   ├── core/
│   │   ├── commands.js
│   │   ├── games.js
│   │   └── state.js
│   ├── data/
│   │   └── world.js
│   ├── main.js
│   └── style.css
└── tests/
    └── index.html
```

## Run Locally

This project has no external dependencies.

1. From the project root, start the local server:

   ```bash
   python3 scripts/serve.py
   ```

2. Open [http://127.0.0.1:4173](http://127.0.0.1:4173)

3. Optional: open [http://127.0.0.1:4173/tests/](http://127.0.0.1:4173/tests/) to run the browser tests

## Sample Narrative Flow

1. BOCK boots into a sealed observer shell and offers only superficial status output.
2. The player runs `scan` and sees `north-shore-relay`, a fictional abandoned relay node.
3. `connect north-shore-relay` reveals atmospheric archive fragments and the token `orchid-7`.
4. `login orchid-7` raises clearance to `FIELD-OP`, unlocking readiness views and the first game modules.
5. The player uses `games` and `play signal_hunt` or `play red_dawn` to explore BOCK’s training simulations.
6. A second fictional node, `cinder-hub`, yields the phrase `black-vault`.
7. `login black-vault` promotes the player to `STRATCOM`, opening `world_theater` and the theater map feeds.
8. The `black-vault` node grants the final phrase `ashen-sun`.
9. `login ashen-sun` unlocks `OMEGA`, where BOCK reveals its launch simulation theater and continuity archive drama.

## Fiction and Safety

- No real networking occurs
- No real scanning occurs
- No external systems are contacted
- No exploit behavior exists
- All military systems, geographies, credentials, and vulnerabilities are fictional narrative devices
