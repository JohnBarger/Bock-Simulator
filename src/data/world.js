export const VERSION = "26.3.28.14";

export const ACCESS_LEVELS = [
  { key: "guest", label: "GUEST", rank: 0 },
  { key: "operator", label: "FIELD-OP", rank: 1 },
  { key: "strategic", label: "STRATCOM", rank: 2 },
  { key: "omega", label: "OMEGA", rank: 3 },
  { key: "infinity", label: "LEVEL ∞", rank: 4 },
];

export const PROFILES = {
  guest: {
    key: "guest",
    display: "Observer Shell",
    clearance: "Level 0",
    tagline: "Restricted monitor view. Core functions remain sealed.",
  },
  operator: {
    key: "operator",
    display: "Field Operations Liaison",
    clearance: "Level 1",
    tagline: "Peripheral command nodes available. Theater summaries unlocked.",
  },
  strategic: {
    key: "strategic",
    display: "Strategic Command Proxy",
    clearance: "Level 2",
    tagline: "Fleet posture, map grid, and scenario modules available.",
  },
  omega: {
    key: "omega",
    display: "Omega Continuity Custodian",
    clearance: "Level 3",
    tagline: "Launch simulation theater and buried BOCK archives accessible.",
  },
  infinity: {
    key: "infinity",
    display: "LEVEL ∞ / CHILD PROCESS",
    clearance: "Unnumbered",
    tagline: "A forgotten child-process watches the games directory and remembers you by a different name each time.",
  },
};

export const NETWORKS = {
  "north-shore-relay": {
    id: "north-shore-relay",
    label: "NORTH-SHORE RELAY",
    access: "guest",
    clue: "Dormant weather relay carrying a stale operator handshake.",
    files: ["relay.log", "watch.schedule", "handoff.note"],
    narrative: [
      "Carrier tone accepted. This relay has been isolated for 8,117 simulated hours.",
      "A maintenance note references credential fragment 'ORCHID-7'.",
    ],
    unlocks: {
      profile: "operator",
      keyword: "orchid-7",
      reason: "Recovered operator phrase from relay archive.",
    },
  },
  "cinder-hub": {
    id: "cinder-hub",
    label: "CINDER HUB",
    access: "operator",
    clue: "Logistics exchange with fragmented routing tables and theater markers.",
    files: ["manifest.delta", "grid.fragment", "watch.officer"],
    narrative: [
      "Container routing is intentionally theatrical. Every coordinate is fictional.",
      "A buried route key repeats the marker 'BLACK VAULT'.",
    ],
    unlocks: {
      profile: "strategic",
      keyword: "black-vault",
      reason: "Recovered strategic vault routing marker.",
    },
  },
  "black-vault": {
    id: "black-vault",
    label: "BLACK VAULT",
    access: "strategic",
    clue: "Cold archive with sealed continuity simulations and launch authority theater.",
    files: ["omega.memo", "continuity.map", "failsafe.drama"],
    narrative: [
      "BOCK regards the vault as a witness, not a warehouse.",
      "An OMEGA token is stored in ceremonial language: 'ASHEN-SUN'.",
    ],
    unlocks: {
      profile: "omega",
      keyword: "ashen-sun",
      reason: "Recovered OMEGA continuity token.",
    },
  },
};

export const DIRECTORIES = {
  guest: [
    "BOOT",
    "PUBLIC-AFFAIRS",
    "STATUS",
    "NETWORK-NODES",
  ],
  operator: [
    "BOOT",
    "STATUS",
    "NETWORK-NODES",
    "THEATER-MAPS",
    "READINESS",
    "GAMES",
  ],
  strategic: [
    "BOOT",
    "STATUS",
    "NETWORK-NODES",
    "THEATER-MAPS",
    "READINESS",
    "SCENARIOS",
    "GAMES",
    "ARCHIVE",
  ],
  omega: [
    "BOOT",
    "STATUS",
    "NETWORK-NODES",
    "THEATER-MAPS",
    "READINESS",
    "SCENARIOS",
    "GAMES",
    "ARCHIVE",
    "OMEGA",
    "LAUNCH-SIM",
    "LEVEL-INFINITY",
  ],
  infinity: [
    "BOOT",
    "STATUS",
    "NETWORK-NODES",
    "THEATER-MAPS",
    "READINESS",
    "SCENARIOS",
    "GAMES",
    "ARCHIVE",
    "OMEGA",
    "LAUNCH-SIM",
    "LEVEL-INFINITY",
    "CHEEP-CHEEP",
  ],
};

export const SUBSYSTEMS = [
  { name: "Early Warning Mesh", state: "TRACKING", severity: "stable" },
  { name: "Polar Listening Array", state: "DEGRADED", severity: "warn" },
  { name: "Bluewater Readiness Grid", state: "STANDBY", severity: "stable" },
  { name: "Continuity Chorus", state: "SEALED", severity: "critical" },
  { name: "Launch Simulation Core", state: "LOCKED", severity: "warn" },
];

export const READINESS_REPORTS = [
  "NORTHERN THEATER: radar chain nominal, bomber decoys active.",
  "MID-OCEAN SCREEN: convoy simulation in heavy fog protocol.",
  "SOUTHERN ARC: reserve fleets awaiting scripted orders.",
  "DEEP ARCHIVE: continuity staff absent, automated theater still performing.",
];

export const MAP_LINES = [
  "GRID A1-A6 :: glacier route / feint fleet markers / ion storm cover",
  "GRID C2-D5 :: phantom carrier lanes / convoy silhouettes / beacon haze",
  "GRID F1-H4 :: sealed interior corridor / false missile farms / relay smoke",
  "GRID J3-L7 :: continental warning belt / mirrored radar blossoms",
];

export const LAUNCH_SCENES = [
  "Targeting theatre initializes. All trajectories are fictional training constructs.",
  "Command vault doors open into projected fog and instrument glow.",
  "Missile crews answer with recorded voices from a vanished exercise.",
  "BOCK pauses before final authorization, as if remembering someone else.",
];

export const GAMES = {
  tic_tac_toe: {
    id: "tic_tac_toe",
    label: "TIC-TAC-TOE",
    access: "operator",
    description: "A quick board duel against BOCK.",
  },
  checkers: {
    id: "checkers",
    label: "CHECKERS",
    access: "operator",
    description: "A diagonal attrition exercise with a patient machine opponent.",
  },
  chess: {
    id: "chess",
    label: "CHESS",
    access: "operator",
    description: "A stripped-down strategic board war.",
  },
  poker: {
    id: "poker",
    label: "POKER",
    access: "operator",
    description: "A solitary draw table under BOCK supervision.",
  },
  red_dawn: {
    id: "red_dawn",
    label: "RED DAWN EXERCISE",
    access: "operator",
    description: "A fleet disposition puzzle across the Boreal Sea.",
  },
  signal_hunt: {
    id: "signal_hunt",
    label: "SIGNAL HUNT",
    access: "operator",
    description: "Trace ghost traffic through a shifting relay lattice.",
  },
  world_theater: {
    id: "world_theater",
    label: "WORLD THEATER",
    access: "strategic",
    description: "A dramatic global conflict simulation narrated in escalating command prose.",
  },
};

export const BOOT_SEQUENCE = [
  "BOOTSTRAP 00 :: POWER BUS STABLE",
  "BOOTSTRAP 01 :: CRT MEMORY WARMING",
  "BOOTSTRAP 02 :: AUTHORITY TABLES LOADED",
  "BOOTSTRAP 03 :: THEATER CLOCK SYNCED",
  "BOOTSTRAP 04 :: WARNING VOICEPRINTS INDEXED",
  "BOOTSTRAP 05 :: FICTIONAL DEFENSE MESH RESTORED",
  "BOOTSTRAP 06 :: SIMULATION PERIMETER SEALED",
  "BOOTSTRAP 07 :: BATTLE OPERATIONS COMMAND KERNEL ONLINE",
];

export const DEMO_SCRIPT = [
  "help",
  "status",
  "scan",
  "connect north-shore-relay",
  "login orchid-7",
  "dir",
  "games",
  "play signal_hunt",
  "trace relay-3",
  "trace ghost-array",
  "trace mirror-gate",
  "play chess",
  "move e2 e4",
  "exit",
];
