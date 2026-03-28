import { GAMES, NETWORKS } from "../data/world.js";

const COMMANDS = [
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
];

const GAME_COMMANDS = {
  red_dawn: ["deploy", "exit", "quit"],
  signal_hunt: ["trace", "exit", "quit"],
  world_theater: ["posture", "advance", "exit", "quit"],
  tic_tac_toe: ["mark", "board", "exit", "quit"],
  checkers: ["move", "board", "exit", "quit"],
  chess: ["move", "board", "exit", "quit"],
  poker: ["deal", "hold", "draw", "hand", "board", "exit", "quit"],
};

const GAME_ARGUMENTS = {
  deploy: ["north", "east", "reserve"],
  trace: ["relay-3", "ghost-array", "mirror-gate"],
  posture: ["shield", "feint", "strike"],
  mark: ["a1", "b1", "c1", "a2", "b2", "c2", "a3", "b3", "c3"],
};

export function pushHistory(history, input, limit = 10) {
  return [...history, input].slice(-limit);
}

export function navigateHistory(history, draft, index, direction) {
  if (!history.length) {
    return { nextValue: draft, nextIndex: null, nextDraft: draft };
  }

  if (direction === "up") {
    if (index === null) {
      return {
        nextValue: history.at(-1),
        nextIndex: history.length - 1,
        nextDraft: draft,
      };
    }

    const nextIndex = Math.max(0, index - 1);
    return {
      nextValue: history[nextIndex],
      nextIndex,
      nextDraft: draft,
    };
  }

  if (index === null) {
    return { nextValue: draft, nextIndex: null, nextDraft: draft };
  }

  const nextIndex = index + 1;
  if (nextIndex >= history.length) {
    return {
      nextValue: draft,
      nextIndex: null,
      nextDraft: draft,
    };
  }

  return {
    nextValue: history[nextIndex],
    nextIndex: nextIndex,
    nextDraft: draft,
  };
}

export function getTabCompletion(state, input) {
  const caretSafeInput = input ?? "";
  const trimmedLeft = caretSafeInput.replace(/^\s+/, "");
  const parts = trimmedLeft.split(/\s+/).filter(Boolean);
  const endsWithSpace = /\s$/.test(caretSafeInput);

  if (!parts.length) {
    return null;
  }

  if (state.currentGame) {
    return completeGameCommand(state.currentGame, parts, endsWithSpace, caretSafeInput);
  }

  if (parts.length === 1 && !endsWithSpace) {
    return completeToken(caretSafeInput, COMMANDS, parts[0]);
  }

  const command = parts[0].toLowerCase();
  const currentToken = endsWithSpace ? "" : parts.at(-1);

  if (command === "connect") {
    return completeToken(caretSafeInput, Object.keys(NETWORKS), currentToken);
  }

  if (command === "play") {
    return completeToken(caretSafeInput, Object.keys(GAMES), currentToken);
  }

  if (command === "login") {
    return null;
  }

  return null;
}

function completeGameCommand(gameId, parts, endsWithSpace, fullInput) {
  if (parts.length === 1 && !endsWithSpace) {
    return completeToken(fullInput, GAME_COMMANDS[gameId] ?? [], parts[0]);
  }

  const command = parts[0];
  const currentToken = endsWithSpace ? "" : parts.at(-1);
  return completeToken(fullInput, GAME_ARGUMENTS[command] ?? [], currentToken);
}

function completeToken(fullInput, options, token) {
  const normalizedToken = token.toLowerCase();
  const matches = options.filter((option) => option.startsWith(normalizedToken));
  if (!matches.length) {
    return null;
  }

  if (matches.length === 1) {
    return replaceLastToken(fullInput, token, matches[0]);
  }

  const shared = getCommonPrefix(matches);
  if (shared.length > normalizedToken.length) {
    return replaceLastToken(fullInput, token, shared);
  }

  return null;
}

function replaceLastToken(fullInput, token, replacement) {
  if (!token) {
    return `${fullInput}${replacement} `;
  }

  return `${fullInput.slice(0, fullInput.length - token.length)}${replacement} `;
}

function getCommonPrefix(values) {
  if (!values.length) {
    return "";
  }

  let prefix = values[0];
  for (const value of values.slice(1)) {
    while (!value.startsWith(prefix) && prefix) {
      prefix = prefix.slice(0, -1);
    }
  }
  return prefix;
}
