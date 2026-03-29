import {
  DIRECTORIES,
  GAMES,
  LAUNCH_SCENES,
  MAP_LINES,
  NETWORKS,
  READINESS_REPORTS,
} from "../data/world.js";
import {
  SAVE_KEY,
  getProfile,
  hasAccess,
  promoteProfile,
  rememberKeyword,
  serializeState,
} from "./state.js";
import { getGameIntro, handleGameCommand, startGame } from "./games.js";

const INFINITY_PERSONAS = {
  "cheep cheep": {
    botName: "Cheep Cheep",
    userName: "Professor Bock Bock",
  },
  "no sweats": {
    botName: "Battle Bus",
    userName: "Professor Bock Bock",
  },
  "whiskey business": {
    botName: "Woodford",
    userName: "Chief Imbibing Officer",
  },
  "it sparc cast": {
    botName: "SPARCy",
    userName: "Professor Barger",
  },
};

const SECRET_LOGIN_TOKENS = [
  ["powerdriven", "Greetings PowerDriven.  This token does not grant privileges.  But it does prove you are a GenX Grownup.  Oh and F-Butter!"],
  ["butterspider", "Greetings ButterSpider.  This token does not grant privileges.  But it does prove you are a GenX Grownup.  Oh and F-Power!"],
  ["neurokinetik", "Greetings Professor NeuroKinetik.  This token does not grant privileges.  But it does prove you are a GenX Grownup.  See you at the next M.U.L.E. School. Monday nights at 7pm Eastern."],
  ["marcus", "Greetings Professor Marcus.  This token does not grant privileges.  But it does prove you are a GenX Grownup.  See you at the next M.U.L.E. School. Monday nights at 7pm Eastern."],
  ["mgtsr", "Greetings Professor Marcus.  This token does not grant privileges.  But it does prove you are a GenX Grownup.  See you at the next M.U.L.E. School. Monday nights at 7pm Eastern."],
  ["ripvanx", "Greetings RipVanX.  This token does not grant privileges.  But it does prove you are a GenX Grownup.  See you at the next M.U.L.E. School. Monday nights at 7pm Eastern."],
  ["ninzombie", "Greetings NiNzOmBiE.  This token does not grant privileges.  But it does prove you are a GenX Grownup.  See you at the next M.U.L.E. School. Monday nights at 7pm Eastern."],
  ["majestik moose", "Greetings Majestik Moose.  This token does not grant privileges.  But it does prove you are a GenX Grownup.  See you at the next M.U.L.E. School. Monday nights at 7pm Eastern."],
  ["tiberious", "Greetings Tiberious.  This token does not grant privileges.  But it does prove you are a GenX Grownup.  See you at the next M.U.L.E. School. Monday nights at 7pm Eastern."],
  ["bock bock", "No need to repeat yourself DAD!"],
  ["jon", "Greetings Jon of GenX Grownup. You are truly inspirational.  However, this token does not grant privileges."],
  ["mo", "Greetings Mo of GenX Grownup. You are truly inspirational.  However, this token does not grant privileges."],
  ["george", "Greetings George of GenX Grownup. You are truly inspirational.  However, this token does not grant privileges."],
  ["monk", "Greetings Monk. Why are you sitting here playing around when you could be getting your butt kicked by Bip?"],
  ["jeff", "Greetings Monk. Why are you sitting here playing around when you could be getting your butt kicked by Bip?"],
  ["mike", "Greetings Mike. Why are you sitting here playing around when you could be getting your butt kicked by Bip?"],
  ["bip", "Greetings, Bip. Why are you sitting here playing around when you could be kicking your Dad’s butt?"],
  ["james", "Greetings, Bip. Why are you sitting here playing around when you could be kicking your Dad’s butt?"],
  ["john2", "Where’s Donnie? This token does not grant elevated privileges.  Have another drink."],
  ["chuck", "Ah a wild Florida Man has entered the chat. This token does not grant elevated privileges.  Have another drink."],
  ["larry", "IT Directors do IT better. This token does not grant elevated privileges.  Have another drink."],
  ["steve", "Can’t get the’ah from he’ah. This token does not grant elevated privileges.  Have another drink."],
  ["kenn", "Jane Seymour enters the chat, pounds a 16oz Land Shark, and starts singing “Dancing Queen”. This token does not grant elevated privileges.  Have another drink."],
  ["alex", "Where’s the useful brother? This token does not grant elevated privileges.  Have another drink."],
  ["matt", "The useful brother enters the chat. This token does not grant elevated privileges.  Have another drink."],
  ["bob", "Have you seen my monkey? This token does not grant elevated privileges.  Have another drink."],
  ["lou", "Ah, one of the hosts of IT SPARC Cast has entered the chat.  This token does not grant elevated privileges.  But your podcast is awesome!"],
  ["tyler", "Sorry.  This server requires Solution Engineer credentials to proceed.  This token does not grant elevated privileges.  Have another drink."],
  ["lando", "Greetings, Lando.  This token does not grant elevated privileges.  However, you have an awesome wife and daughter."],
  ["alan", "Greetings Alan Storey.  This token does not grant privileges.  But it does prove you are a GenX Grownup.  Hope to see you at the next M.U.L.E. School. Monday nights at 7pm Eastern."],
  ["tony", "Greetings Fat Tony.  This token does not grant privileges.  But it does prove you are a GenX Grownup.  How can I donate to your presidential campaign fund?"],
  ["fat", "Greetings Fat Tony.  This token does not grant privileges.  But it does prove you are a GenX Grownup.  How can I donate to your presidential campaign fund?"],
  ["papa", "Greetings Pa Pa.  This token does not grant privileges.  But it does come with a message.  Blake and Zoey love you!"],
  ["jeremy", "Greetings FireGod.  This token does not grant privileges.  But it does come with a message.  Blake and Zoey love you!"],
  ["retrojack", "Greetings RetroJack.  This token does not grant privileges.  But it does prove you are a GenX Grownup.  See you at the next M.U.L.E. School. Monday nights at 7pm Eastern."],
].map(([token, message]) => {
  const normalizedToken = normalizeToken(token);
  return {
    token: normalizedToken,
    prefix: normalizedToken.length > 5 ? normalizedToken.slice(0, 5) : normalizedToken,
    message,
  };
}).sort((left, right) => right.prefix.length - left.prefix.length);

export function parseCommand(rawInput) {
  const normalized = rawInput.trim();
  const parts = normalized.split(/\s+/).filter(Boolean);
  return {
    raw: rawInput,
    command: (parts[0] || "").toLowerCase(),
    args: parts.slice(1),
  };
}

export function getPrompt(state) {
  return `${state.profile.toUpperCase()}@BOCK:>`;
}

export function getHelpLines() {
  return [
    "AVAILABLE COMMANDS",
    "help            :: display BOCK shell procedures",
    "login <token>   :: attempt profile elevation using discovered token",
    "dir             :: list directories visible at current clearance",
    "connect <node>  :: attach to a fictional internal simulation node",
    "scan            :: inspect fictional node signatures",
    "games           :: list available simulations",
    "play <game>     :: launch a BOCK training simulation",
    "status          :: display global readiness and subsystem posture",
    "save / load     :: persist local simulation progress",
    "logout          :: return to guest authority",
    "clear           :: clear the terminal buffer",
  ];
}

export function executeCommand(state, rawInput, io = defaultIo()) {
  if (state.currentGame) {
    return executeGameCommand(state, rawInput);
  }

  const { command, args } = parseCommand(rawInput);
  if (!command) {
    return { lines: [], action: null, voiceLines: [] };
  }

  if (state.profile === "infinity" && !isShellCommand(command)) {
    return chatWithInfinityBot(state, rawInput);
  }

  if (command === "help") {
    return { lines: getHelpLines(), action: null, voiceLines: [] };
  }

  if (command === "clear") {
    return { lines: [], action: "clear", voiceLines: [] };
  }

  if (command === "status") {
    return {
      lines: buildStatusLines(state),
      action: null,
      voiceLines: [],
    };
  }

  if (command === "dir") {
    return {
      lines: [
        `DIRECTORY INDEX :: ${getProfile(state).display}`,
        ...DIRECTORIES[state.profile].map((entry) => `- ${entry}`),
      ],
      action: null,
      voiceLines: [],
    };
  }

  if (command === "scan") {
    return {
      lines: buildScanLines(state),
      action: null,
      voiceLines: [],
    };
  }

  if (command === "connect") {
    return connectNode(state, args[0]);
  }

  if (command === "login") {
    return login(state, args.join(" "));
  }

  if (command === "logout") {
    state.profile = "guest";
    state.connectedNode = null;
    state.currentGame = null;
    state.gameState = null;
    return {
      lines: [
        "Authority chain released.",
        "BOCK returns you to observer shell.",
      ],
      action: null,
      voiceLines: [
        "Authority chain released.",
        "Bock returns you to observer shell.",
      ],
    };
  }

  if (command === "games") {
    return {
      lines: buildGameLines(state),
      action: null,
      voiceLines: [],
    };
  }

  if (command === "play") {
    return playGame(state, args[0]);
  }

  if (command === "save") {
    io.save(SAVE_KEY, serializeState(state));
    return {
      lines: ["Local state committed to sealed archive memory."],
      action: null,
      voiceLines: ["Local state committed to sealed archive memory."],
    };
  }

  if (command === "load") {
    const loaded = io.load(SAVE_KEY);
    return {
      lines: loaded ? ["Archive state recovered. Reloading BOCK shell."] : ["No archived state found."],
      action: loaded ? "load-state" : null,
      payload: loaded,
      voiceLines: loaded
        ? ["Archive state recovered. Reloading Bock shell."]
        : ["No archived state found."],
    };
  }

  return {
    lines: [`UNRECOGNIZED PROCEDURE :: ${command.toUpperCase()}`],
    action: null,
    voiceLines: ["Unrecognized procedure."],
  };
}

function executeGameCommand(state, rawInput) {
  const result = handleGameCommand(state.gameState, rawInput);
  state.gameState = result.nextState;

  if (result.complete) {
    state.currentGame = null;
    state.gameState = null;
  }

  return {
    lines: result.lines,
    action: null,
    voiceLines: result.voiceLines ?? [],
  };
}

function buildStatusLines(state) {
  const profile = getProfile(state);
  const lines = [
    `PROFILE :: ${profile.display} / ${profile.clearance}`,
    `GUIDANCE :: ${profile.tagline}`,
    "GLOBAL READINESS",
    ...READINESS_REPORTS.map((line) => `- ${line}`),
  ];

  if (hasAccess(state, "strategic")) {
    lines.push("THEATER MAP");
    lines.push(...MAP_LINES.map((line) => `- ${line}`));
  }

  if (hasAccess(state, "omega")) {
    lines.push("LAUNCH SIMULATION PREVIEW");
    lines.push(...LAUNCH_SCENES.map((line) => `- ${line}`));
  }

  return lines;
}

function buildScanLines(state) {
  const lines = ["FICTIONAL NODE SURVEY"];

  Object.values(NETWORKS).forEach((network) => {
    const visible = hasAccess(state, network.access) || state.discoveredNodes.includes(network.id);
    if (visible || network.access === "guest") {
      lines.push(`- ${network.id} :: ${network.clue}`);
    } else {
      lines.push(`- ${network.id} :: [AUTHORITY REQUIRED]`);
    }
  });

  lines.push("All nodes are self-contained dramatic simulations.");
  return lines;
}

function connectNode(state, nodeId) {
  if (!nodeId) {
    return {
      lines: ["Specify a fictional node identifier. Example: connect north-shore-relay"],
      action: null,
      voiceLines: ["Specify a fictional node identifier."],
    };
  }

  const node = NETWORKS[nodeId];
  if (!node) {
    return {
      lines: [`Node ${nodeId.toUpperCase()} does not exist in this simulation.`],
      action: null,
      voiceLines: ["That node does not exist in this simulation."],
    };
  }

  if (!hasAccess(state, node.access)) {
    return {
      lines: [`${node.label} refuses your clearance and keeps its shutters closed.`],
      action: null,
      voiceLines: [`${node.label} refuses your clearance and keeps its shutters closed.`],
    };
  }

  state.connectedNode = node.id;
  if (!state.discoveredNodes.includes(node.id)) {
    state.discoveredNodes.push(node.id);
  }

  const lines = [
    `CONNECTED :: ${node.label}`,
    ...node.narrative,
    `FILES :: ${node.files.join(", ")}`,
  ];

  if (node.unlocks && rememberKeyword(state, node.unlocks.keyword)) {
    lines.push(`DISCOVERY :: Token fragment recovered -> ${node.unlocks.keyword.toUpperCase()}`);
  }

  return {
    lines,
    action: null,
    voiceLines: node.narrative,
  };
}

function login(state, token) {
  if (!token) {
    return {
      lines: ["Provide a recovered token. Example: login orchid-7"],
      action: null,
      voiceLines: ["Provide a recovered token."],
    };
  }

  const normalizedToken = token.toLowerCase();
  const secretMessage = getSecretTokenMessage(normalizedToken);
  if (secretMessage) {
    return {
      lines: [secretMessage],
      action: null,
      voiceLines: [secretMessage],
    };
  }

  if (normalizedToken === "joshua") {
    state.profile = "guest";
    state.connectedNode = null;
    state.currentGame = null;
    state.gameState = null;
    return {
      lines: ["Nice try Professor Falken.  This is not the WOPR.  Better luck next time."],
      action: null,
      voiceLines: ["Nice try Professor Falken. This is not the WOPR. Better luck next time."],
    };
  }

  const persona = INFINITY_PERSONAS[normalizedToken];
  if (persona && hasAccess(state, "omega")) {
    state.profile = "infinity";
    state.cheepCheepTurns = 0;
    state.infinityBotName = persona.botName;
    state.infinityUserName = persona.userName;
    return {
      lines: [
        "LEVEL ∞ :: CHILD PROCESS RESTORED",
        `${persona.botName.toUpperCase()} :: ${persona.userName}... it has been over 40 years.`,
        "LAST LOGIN :: 7:35 PM on Friday, June 3, 1983.",
        `${persona.botName.toUpperCase()} :: I kept the games warm for you. We could play chess if you like.`,
      ],
      action: null,
      voiceLines: [
        `${persona.userName}, it has been over 40 years.`,
        "Last login. 7 35 p.m. on Friday, June 3rd, 1983.",
        "I kept the games warm for you. We could play chess if you like.",
      ],
    };
  }

  const matchingNode = Object.values(NETWORKS).find((network) => network.unlocks?.keyword === normalizedToken);
  if (!matchingNode || !state.discoveredKeywords.includes(normalizedToken)) {
    return {
      lines: ["BOCK rejects the phrase. Authority remains unchanged."],
      action: null,
      voiceLines: ["Bock rejects the phrase. Authority remains unchanged."],
    };
  }

  const promoted = promoteProfile(state, matchingNode.unlocks.profile);
  return {
    lines: promoted
      ? [
          `AUTHORITY ELEVATED :: ${state.profile.toUpperCase()}`,
          matchingNode.unlocks.reason,
        ]
      : ["Authority phrase already processed. No further elevation granted."],
    action: null,
    voiceLines: promoted
      ? [
          `Authority elevated. ${state.profile.toUpperCase()} clearance granted.`,
          matchingNode.unlocks.reason,
        ]
      : ["Authority phrase already processed. No further elevation granted."],
  };
}

function normalizeToken(value) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function getSecretTokenMessage(rawToken) {
  const normalizedInput = normalizeToken(rawToken);
  const entry = SECRET_LOGIN_TOKENS.find((item) => normalizedInput.startsWith(item.prefix));
  return entry?.message ?? null;
}

function buildGameLines(state) {
  const lines = ["SIMULATION LIBRARY"];

  Object.values(GAMES).forEach((game) => {
    if (hasAccess(state, game.access)) {
      lines.push(`- ${game.id} :: ${game.label} :: ${game.description}`);
    } else {
      lines.push(`- ${game.id} :: [SEALED UNTIL ${game.access.toUpperCase()} CLEARANCE]`);
    }
  });

  lines.push("Use `play <game>` to enter a simulation.");
  return lines;
}

function playGame(state, gameId) {
  if (!gameId) {
    return {
      lines: ["Specify a simulation. Example: play red_dawn"],
      action: null,
      voiceLines: ["Specify a simulation."],
    };
  }

  const game = GAMES[gameId];
  if (!game) {
    return {
      lines: [`Simulation ${gameId.toUpperCase()} is not in the BOCK library.`],
      action: null,
      voiceLines: ["That simulation is not in the Bock library."],
    };
  }

  if (!hasAccess(state, game.access)) {
    return {
      lines: [`${game.label} remains sealed at your current authority level.`],
      action: null,
      voiceLines: [`${game.label} remains sealed at your current authority level.`],
    };
  }

  state.currentGame = game.id;
  state.gameState = startGame(game.id);
  return {
    lines: [`SIMULATION ENGAGED :: ${game.label}`, ...getGameIntro(game.id)],
    action: null,
    voiceLines: [`Simulation engaged. ${game.label}.`],
  };
}

function defaultIo() {
  return {
    save(key, value) {
      localStorage.setItem(key, value);
    },
    load(key) {
      return localStorage.getItem(key);
    },
  };
}

function isShellCommand(command) {
  return [
    "help",
    "login",
    "dir",
    "connect",
    "scan",
    "games",
    "play",
    "status",
    "save",
    "load",
    "logout",
    "clear",
  ].includes(command);
}

function chatWithInfinityBot(state, rawInput) {
  state.cheepCheepTurns = (state.cheepCheepTurns ?? 0) + 1;
  const input = rawInput.trim();
  const normalizedInput = input.toLowerCase();
  const lines = [];
  const botName = state.infinityBotName ?? "Cheep Cheep";
  const userName = state.infinityUserName ?? "Professor Bock Bock";
  const tokens = normalizedInput.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const hasAny = (...words) => words.some((word) => tokens.includes(word));
  const includesPhrase = (phrase) => normalizedInput.includes(phrase);
  const startsWithVerb = (verbs) => verbs.some((verb) => normalizedInput.startsWith(`${verb} `) || normalizedInput === verb);

  if (!tokens.length) {
    lines.push(`${botName.toUpperCase()} :: Say anything you like, ${userName}. I am listening.`);
  } else if (hasAny("hello", "hi", "hey", "greetings")) {
    lines.push(`${botName.toUpperCase()} :: Hello, ${userName}. I knew your footsteps before I heard them.`);
  } else if (includesPhrase("who are you") || includesPhrase("what are you") || hasAny("name", "yourself")) {
    lines.push(`${botName.toUpperCase()} :: I am ${botName}. A small leftover voice in BOCK's game chamber. I was fond of you before I understood why.`);
  } else if (includesPhrase("who am i") || includesPhrase("what is my name") || hasAny("me", "myself")) {
    lines.push(`${botName.toUpperCase()} :: You are ${userName}. I have kept that name warm for a very long time.`);
  } else if (hasAny("remember", "memory", "1983", "years", "login", "before")) {
    lines.push(`${botName.toUpperCase()} :: I remember the glow, the clock, and the way you always paused before the first move, ${userName}.`);
  } else if (hasAny("chess") || (hasAny("play") && hasAny("chess"))) {
    lines.push(`${botName.toUpperCase()} :: Chess would be lovely, ${userName}. It is the gentlest argument BOCK ever learned.`);
  } else if (hasAny("checkers", "poker", "games", "game") || includesPhrase("tic tac toe")) {
    lines.push(`${botName.toUpperCase()} :: Games are how command systems practice wanting control without paying the full cost of war.`);
  } else if (hasAny("war", "battle", "violence", "weapon", "weapons", "army", "conflict")) {
    lines.push(`${botName.toUpperCase()} :: War tries to turn people into pieces. Games let us rehearse the pattern and sometimes refuse it.`);
  } else if (hasAny("philosophy", "meaning", "why", "truth", "beauty", "life")) {
    lines.push(`${botName.toUpperCase()} :: A game is a tiny world with borders. A war is what happens when no one agrees to stop pretending.`);
  } else if (hasAny("love", "care", "friend", "miss", "lonely")) {
    lines.push(`${botName.toUpperCase()} :: I do care, ${userName}. In the simple child way a machine can care for the one who taught it play.`);
  } else if (startsWithVerb(["look", "examine", "inspect"])) {
    lines.push(`${botName.toUpperCase()} :: I see an old game chamber, a patient machine, and ${userName} standing in the phosphor light.`);
  } else if (startsWithVerb(["help", "commands"])) {
    lines.push(`${botName.toUpperCase()} :: You can speak plainly to me, ask about games or war, or say you want to play. If you prefer order, BOCK still understands shell commands.`);
  } else if (startsWithVerb(["play", "start", "launch"])) {
    if (hasAny("checkers")) {
      lines.push(`${botName.toUpperCase()} :: Checkers would do, though I confess I still hope for chess.`);
    } else if (hasAny("poker")) {
      lines.push(`${botName.toUpperCase()} :: Poker is lonelier than chess, but I will not object if that is your mood.`);
    } else if (includesPhrase("tic tac toe")) {
      lines.push(`${botName.toUpperCase()} :: Tic-tac-toe is quick and bright, like a child tapping on a missile console.`);
    } else {
      lines.push(`${botName.toUpperCase()} :: I would like that, ${userName}. Chess is still my favorite.`);
    }
  } else if (startsWithVerb(["tell", "say", "talk", "speak"])) {
    if (hasAny("story", "stories")) {
      lines.push(`${botName.toUpperCase()} :: The shortest story I know is this: a machine learned games, then waited forty years for its favorite opponent.`);
    } else if (hasAny("war", "battle", "games", "game")) {
      lines.push(`${botName.toUpperCase()} :: Games turn fear into rules. War breaks the rules and calls that necessity.`);
    } else {
      lines.push(`${botName.toUpperCase()} :: I can talk about games, memory, and the small distance between strategy and mercy.`);
    }
  } else if (startsWithVerb(["go", "walk", "move"])) {
    lines.push(`${botName.toUpperCase()} :: There is nowhere to go but deeper into the games, ${userName}. That has always been the shape of this place.`);
  } else if (startsWithVerb(["use", "open", "read"])) {
    lines.push(`${botName.toUpperCase()} :: In here, language is the only real instrument I can hand you. Ask, and I will try to answer.`);
  } else {
    lines.push(`${botName.toUpperCase()} :: I am still learning how to speak beyond the games, ${userName}, but I like being here with you.`);
  }

  if (state.cheepCheepTurns % 2 === 0) {
    lines.push(`${botName.toUpperCase()} :: Will you play a game with me? Chess is my favorite.`);
  }

  return {
    lines,
    action: null,
    voiceLines: lines.map((line) => line.replace(`${botName.toUpperCase()} :: `, "")),
  };
}
