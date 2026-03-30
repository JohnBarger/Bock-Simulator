import { executeCommand, getPrompt } from "./core/commands.js";
import { getTabCompletion, navigateHistory, pushHistory } from "./core/shellInput.js";
import { DEMO_SCRIPT, BOOT_SEQUENCE, VERSION } from "./data/world.js";
import {
  SAVE_KEY,
  createInitialState,
  deserializeState,
  getProfile,
} from "./core/state.js";

const state = restoreState();
const MIN_PHOSPHOR_GLOW = 0.5;
const MAX_PHOSPHOR_GLOW = 10;

const elements = {
  output: document.querySelector("#terminal-output"),
  form: document.querySelector("#command-form"),
  input: document.querySelector("#command-input"),
  prompt: document.querySelector("#prompt-prefix"),
  version: document.querySelector("#version-output"),
  bootCurtain: document.querySelector("#boot-curtain"),
  bootLog: document.querySelector("#boot-log"),
  app: document.querySelector("#app"),
  audioMenu: document.querySelector("#audio-menu"),
  screenMenu: document.querySelector("#screen-menu"),
  soundEnabled: document.querySelector("#sound-enabled"),
  voiceEnabled: document.querySelector("#voice-enabled"),
  voiceRate: document.querySelector("#voice-rate"),
  voiceRateValue: document.querySelector("#voice-rate-value"),
  voicePitch: document.querySelector("#voice-pitch"),
  voicePitchValue: document.querySelector("#voice-pitch-value"),
  screenAmber: document.querySelector("#screen-amber"),
  screenToneLabel: document.querySelector("#screen-tone-label"),
  phosphorGlow: document.querySelector("#phosphor-glow"),
  phosphorGlowValue: document.querySelector("#phosphor-glow-value"),
  scanlineStrength: document.querySelector("#scanline-strength"),
  scanlineStrengthValue: document.querySelector("#scanline-strength-value"),
  demoToggle: document.querySelector("#demo-toggle"),
  clock: document.querySelector("#clock-output"),
  userCount: document.querySelector("#user-count-output"),
  profile: document.querySelector("#profile-output"),
  theater: document.querySelector("#theater-output"),
  subsystems: document.querySelector("#subsystems-output"),
  unlocks: document.querySelector("#unlock-output"),
  secretPanel: document.querySelector("#secret-panel"),
  secretPanelImage: document.querySelector("#secret-panel-image"),
  secretPanelClose: document.querySelector("#secret-panel-close"),
};

const speaker = createAudioBus();
const voice = createVoiceBus();
let typingTimer = null;
let demoTimer = null;
let historyIndex = null;
let historyDraft = "";
let shellHistorySnapshot = [];
let gameHistory = [];

initialize();

function initialize() {
  shellHistorySnapshot = [...state.commandHistory];
  renderSidebar();
  renderDemoButton();
  renderAudioControls();
  renderScreenControls();
  elements.version.textContent = `VER ${VERSION}`;
  elements.prompt.textContent = getPrompt(state);
  applyScreenSettings();
  bindEvents();
  runBootSequence().then(() => {
    state.bootComplete = true;
    writeLines([
      "BOCK welcomes authorized eyes and distrusts every hand.",
      "Type `help` to review shell procedures.",
    ], "system", {
      voiceLines: ["Bock welcomes authorized eyes and distrusts every hand."],
    });
    scheduleDemoMode();
  });
}

function bindEvents() {
  elements.form.addEventListener("submit", handleSubmit);
  elements.input.addEventListener("keydown", handleInputKeydown);
  elements.soundEnabled.addEventListener("change", () => {
    state.soundEnabled = elements.soundEnabled.checked;
    if (state.soundEnabled) {
      speaker.chirp("toggle");
    }
    persistState();
  });

  elements.voiceEnabled.addEventListener("change", () => {
    state.voiceEnabled = elements.voiceEnabled.checked;
    if (state.voiceEnabled) {
      voice.prime();
      voice.speak("Battle Operations Command Kernel voice channel engaged.");
    } else {
      voice.stop();
    }
    persistState();
  });

  elements.voiceRate.addEventListener("input", () => {
    state.voiceRate = Number(elements.voiceRate.value);
    renderAudioControls();
    persistState();
  });

  elements.voicePitch.addEventListener("input", () => {
    state.voicePitch = Number(elements.voicePitch.value);
    renderAudioControls();
    persistState();
  });

  elements.screenAmber?.addEventListener("change", () => {
    state.screenTone = elements.screenAmber.checked ? "amber" : "green";
    renderScreenControls();
    persistState();
  });

  elements.phosphorGlow?.addEventListener("input", () => {
    state.phosphorGlow = clampPhosphorGlow(Number(elements.phosphorGlow.value));
    renderScreenControls();
    persistState();
  });

  elements.scanlineStrength?.addEventListener("input", () => {
    state.scanlineStrength = Number(elements.scanlineStrength.value);
    renderScreenControls();
    persistState();
  });

  elements.demoToggle.addEventListener("click", () => {
    state.demoMode = !state.demoMode;
    renderDemoButton();
    if (state.demoMode) {
      writeLines(["Attract mode armed. BOCK will demonstrate itself after inactivity."], "warn");
      scheduleDemoMode(true);
    } else {
      writeLines(["Attract mode disengaged."], "system");
      cancelDemoMode();
    }
    persistState();
  });

  elements.secretPanelClose.addEventListener("click", hideSecretPanel);
  elements.secretPanel.addEventListener("click", (event) => {
    if (event.target === elements.secretPanel) {
      hideSecretPanel();
    }
  });

  window.addEventListener("pointerdown", (event) => {
    if (!elements.audioMenu.open && !elements.screenMenu?.open) {
      return;
    }

    if (!elements.audioMenu.contains(event.target)) {
      elements.audioMenu.open = false;
    }
    if (elements.screenMenu && !elements.screenMenu.contains(event.target)) {
      elements.screenMenu.open = false;
    }
  });

  window.addEventListener("focusin", (event) => {
    if (!elements.audioMenu.open && !elements.screenMenu?.open) {
      return;
    }

    if (!elements.audioMenu.contains(event.target)) {
      elements.audioMenu.open = false;
    }
    if (elements.screenMenu && !elements.screenMenu.contains(event.target)) {
      elements.screenMenu.open = false;
    }
  });

  ["mousemove", "keydown", "click"].forEach((eventName) => {
    window.addEventListener(eventName, () => {
      if (state.demoMode) {
        scheduleDemoMode();
      }
    });
  });

  window.addEventListener("storage", (event) => {
    if (event.key === SAVE_KEY && event.newValue) {
      const loaded = deserializeState(event.newValue);
      Object.assign(state, loaded);
      renderSidebar();
      elements.prompt.textContent = getPrompt(state);
      renderDemoButton();
      renderAudioControls();
      renderScreenControls();
      writeLines(["External archive update detected. Local shell refreshed."], "warn");
    }
  });
}

async function runBootSequence() {
  elements.bootLog.textContent = "";
  for (const line of BOOT_SEQUENCE) {
    await wait(420);
    appendBootLine(line);
    speaker.chirp("boot");
  }
  await wait(720);
  elements.bootCurtain.classList.add("hidden");
  elements.input.focus();
}

function appendBootLine(line) {
  elements.bootLog.textContent += `${line}\n`;
  elements.bootLog.scrollTop = elements.bootLog.scrollHeight;
}

async function handleSubmit(event) {
  event.preventDefault();
  if (typingTimer || !state.bootComplete) {
    return;
  }

  cancelDemoMode();
  const input = elements.input.value.trim();
  if (!input) {
    return;
  }

  if (state.currentGame) {
    gameHistory = pushHistory(gameHistory, input, 10);
    state.commandHistory = [...gameHistory];
  } else {
    state.commandHistory = pushHistory(state.commandHistory, input, 10);
    shellHistorySnapshot = [...state.commandHistory];
  }
  historyIndex = null;
  historyDraft = "";
  await writeLines([`${getPrompt(state)} ${input}`], "system", { speak: false });
  elements.input.value = "";
  speaker.chirp("keypress");

  const result = executeCommand(state, input);
  if (!state.currentGame && gameHistory.length) {
    gameHistory = [];
    state.commandHistory = [...shellHistorySnapshot];
  } else if (state.currentGame && gameHistory.length) {
    state.commandHistory = [...gameHistory];
  }

  if (result.action === "clear") {
    elements.output.innerHTML = "";
  } else if (result.action === "load-state" && result.payload) {
    Object.assign(state, deserializeState(result.payload));
    await writeLines(result.lines, "warn", { voiceLines: result.voiceLines });
  } else if (result.action === "show-secret-panel" && result.payload?.imageUrl) {
    showSecretPanel(result.payload.imageUrl);
    await writeLines(result.lines, "default", { voiceLines: result.voiceLines });
  } else {
    await writeLines(result.lines, "default", { voiceLines: result.voiceLines });
  }

  elements.prompt.textContent = getPrompt(state);
  renderSidebar();
  renderDemoButton();
  renderAudioControls();
  renderScreenControls();
  persistState();
  scheduleDemoMode();
}

function showSecretPanel(imageUrl) {
  elements.secretPanelImage.src = imageUrl;
  elements.secretPanelImage.alt = "Secret token image";
  elements.secretPanel.hidden = false;
}

function hideSecretPanel() {
  elements.secretPanel.hidden = true;
  elements.secretPanelImage.removeAttribute("src");
}

async function writeLines(lines, tone = "default", options = {}) {
  if (!lines?.length) {
    return;
  }

  const voiceLineSet = new Set((options.voiceLines ?? []).map(normalizeVoiceMatch));
  for (const line of lines) {
    await typeLine(line, tone, {
      speak: voiceLineSet.has(normalizeVoiceMatch(line)),
    });
  }

  for (const line of options.voiceLines ?? []) {
    if (!lines.includes(line)) {
      voice.speak(line);
    }
  }
}

function normalizeVoiceMatch(line) {
  return String(line ?? "")
    .replace(/`/g, "")
    .replace(/\bBOCK\b/g, "Bock")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function typeLine(line, tone, options = {}) {
  return new Promise((resolve) => {
    const div = document.createElement("div");
    div.className = `terminal-line ${tone}`;
    elements.output.appendChild(div);

    let index = 0;
    if (options.speak !== false) {
      voice.stop();
      voice.speak(line);
    }
    clearTimeout(typingTimer);

    const step = () => {
      div.textContent = line.slice(0, index + 1);
      elements.output.scrollTop = elements.output.scrollHeight;

      if (index < line.length - 1) {
        if (state.soundEnabled && line[index] !== " ") {
          speaker.chirp("type");
        }
        index += 1;
        typingTimer = window.setTimeout(step, Math.min(28, 12 + Math.random() * 18));
      } else {
        typingTimer = null;
        resolve();
      }
    };

    step();
  });
}

function renderSidebar() {
  const now = new Date();
  elements.clock.textContent = [
    `THEATER CLOCK :: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
    `SESSION ARCHIVE :: ${state.commandHistory.length} commands`,
  ].join("\n");

  elements.userCount.textContent = `CURRENT USER COUNT :: ${getCurrentUserCount(state)}`;

  const profile = getProfile(state);
  elements.profile.textContent = [
    `PROFILE :: ${profile.display}`,
    `CLEARANCE :: ${profile.clearance}`,
    profile.tagline,
  ].join("\n");

  elements.theater.textContent = state.currentGame
    ? `ACTIVE SIMULATION :: ${state.currentGame.toUpperCase()}\nCURRENT LINK :: ${state.connectedNode ?? "NONE"}`
    : `ACTIVE SIMULATION :: NONE\nCURRENT LINK :: ${state.connectedNode ?? "NONE"}`;

  elements.subsystems.textContent = state.subsystemStates
    .map((item) => `${item.name} :: ${item.state}`)
    .join("\n");

  const discoveries = state.discoveredKeywords.length
    ? state.discoveredKeywords.map((entry) => `- ${entry.toUpperCase()}`).join("\n")
    : "- NONE";
  elements.unlocks.textContent = discoveries;
}

function getCurrentUserCount(currentState) {
  return currentState.profile === "infinity" ? 2 : 1;
}

function persistState() {
  state.commandHistory = state.commandHistory.slice(-10);
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function restoreState() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (!saved) {
    return createInitialState();
  }

  try {
    return deserializeState(saved);
  } catch {
    return createInitialState();
  }
}

function scheduleDemoMode(immediate = false) {
  renderDemoButton();
  clearTimeout(demoTimer);
  if (!state.demoMode) {
    return;
  }

  demoTimer = window.setTimeout(runDemoScript, immediate ? 3000 : 20000);
}

function cancelDemoMode() {
  clearTimeout(demoTimer);
}

async function runDemoScript() {
  if (!state.demoMode || typingTimer) {
    return;
  }

  const steps = DEMO_SCRIPT;
  for (const step of steps) {
    if (!state.demoMode) {
      break;
    }
    if (state.currentGame && !isValidGameDemoStep(state.currentGame, step)) {
      elements.input.value = "exit";
      await wait(450);
      await handleSubmit(new Event("submit"));
      await wait(550);
    }
    elements.input.value = step;
    await wait(450);
    await handleSubmit(new Event("submit"));
    await wait(550);
  }
  scheduleDemoMode(true);
}

function renderDemoButton() {
  elements.demoToggle.textContent = state.demoMode ? "DEMO ACTIVE" : "DEMO MODE";
}

function renderAudioControls() {
  elements.soundEnabled.checked = state.soundEnabled;
  elements.voiceEnabled.checked = state.voiceEnabled;
  elements.voiceRate.value = String(state.voiceRate);
  elements.voiceRateValue.value = `${state.voiceRate.toFixed(2)}x`;
  elements.voicePitch.value = String(state.voicePitch);
  elements.voicePitchValue.value = state.voicePitch.toFixed(2);
}

function renderScreenControls() {
  if (!elements.screenAmber || !elements.screenToneLabel || !elements.phosphorGlow || !elements.phosphorGlowValue || !elements.scanlineStrength || !elements.scanlineStrengthValue) {
    return;
  }
  state.phosphorGlow = clampPhosphorGlow(state.phosphorGlow);
  elements.screenAmber.checked = state.screenTone === "amber";
  elements.screenToneLabel.textContent = state.screenTone === "amber" ? "GREEN SCREEN" : "AMBER SCREEN";
  elements.phosphorGlow.value = String(state.phosphorGlow);
  elements.phosphorGlowValue.textContent = state.phosphorGlow.toFixed(2);
  elements.scanlineStrength.value = String(state.scanlineStrength);
  elements.scanlineStrengthValue.textContent = state.scanlineStrength.toFixed(2);
  applyScreenSettings();
}

function clampPhosphorGlow(value) {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(MAX_PHOSPHOR_GLOW, Math.max(MIN_PHOSPHOR_GLOW, value));
}

function applyScreenSettings() {
  elements.app.dataset.screenTone = state.screenTone;
  elements.app.style.setProperty("--phosphor-glow-intensity", String(state.phosphorGlow));
  elements.app.style.setProperty("--scanline-opacity", String(state.scanlineStrength));
  elements.app.style.setProperty("--scanline-size", `${Math.max(2, 8 - state.scanlineStrength * 8).toFixed(2)}px`);
}

function createAudioBus() {
  let context;

  function beep(frequency, duration, type = "square", gain = 0.015) {
    if (!state.soundEnabled) {
      return;
    }

    if (!context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }
      context = new AudioContextClass();
    }

    const oscillator = context.createOscillator();
    const amplifier = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    amplifier.gain.value = gain;
    oscillator.connect(amplifier);
    amplifier.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }

  return {
    chirp(kind) {
      if (kind === "boot") {
        beep(480, 0.08);
      } else if (kind === "keypress") {
        beep(180, 0.05, "sawtooth", 0.01);
      } else if (kind === "toggle") {
        beep(620, 0.12, "triangle", 0.02);
      } else {
        beep(260, 0.02);
      }
    },
  };
}

function createVoiceBus() {
  const synth = window.speechSynthesis;
  let voices = [];

  function refreshVoices() {
    voices = synth?.getVoices?.() ?? [];
  }

  refreshVoices();
  synth?.addEventListener?.("voiceschanged", refreshVoices);

  function pickVoice() {
    if (!voices.length) {
      refreshVoices();
    }

    const rankedNames = [
      "fred",
      "ralph",
      "zarvox",
      "alex",
      "daniel",
      "reed",
      "victoria",
    ];

    for (const name of rankedNames) {
      const match = voices.find((voiceOption) => voiceOption.name.toLowerCase().includes(name));
      if (match) {
        return match;
      }
    }

    return voices.find((voiceOption) => voiceOption.lang?.toLowerCase().startsWith("en")) ?? null;
  }

  function normalizeForSpeech(text) {
    return text
      .replace(/::/g, ". ")
      .replace(/`/g, "")
      .replace(/->/g, " leads to ")
      .replace(/\bBOCK\b/g, "Bock")
      .replace(/\s+/g, " ")
      .trim();
  }

  return {
    prime() {
      refreshVoices();
    },
    stop() {
      synth?.cancel?.();
    },
    speak(text) {
      if (!state.voiceEnabled || !synth || !window.SpeechSynthesisUtterance || !text.trim()) {
        return;
      }

      const utterance = new SpeechSynthesisUtterance(normalizeForSpeech(text));
      const selectedVoice = pickVoice();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = state.voiceRate;
      utterance.pitch = state.voicePitch;
      utterance.volume = 0.78;
      synth.speak(utterance);
    },
  };
}

function wait(duration) {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

function handleInputKeydown(event) {
  if (!state.bootComplete || typingTimer) {
    return;
  }

  if (event.key === "Tab") {
    event.preventDefault();
    const completion = getTabCompletion(state, elements.input.value);
    if (completion) {
      elements.input.value = completion;
      setCursorToEnd(elements.input);
      if (state.soundEnabled) {
        speaker.chirp("toggle");
      }
    }
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (historyIndex === null) {
      historyDraft = elements.input.value;
    }
    const activeHistory = state.currentGame ? gameHistory : state.commandHistory;
    const next = navigateHistory(activeHistory, historyDraft, historyIndex, "up");
    historyIndex = next.nextIndex;
    historyDraft = next.nextDraft;
    elements.input.value = next.nextValue;
    setCursorToEnd(elements.input);
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    const activeHistory = state.currentGame ? gameHistory : state.commandHistory;
    const next = navigateHistory(activeHistory, historyDraft, historyIndex, "down");
    historyIndex = next.nextIndex;
    historyDraft = next.nextDraft;
    elements.input.value = next.nextValue;
    setCursorToEnd(elements.input);
    return;
  }
}

function setCursorToEnd(input) {
  const position = input.value.length;
  input.setSelectionRange(position, position);
}

function isValidGameDemoStep(gameId, step) {
  const normalizedStep = step.trim().toLowerCase();
  if (normalizedStep === "exit" || normalizedStep === "quit" || normalizedStep === "board") {
    return true;
  }

  const validPrefixes = {
    red_dawn: ["deploy "],
    signal_hunt: ["trace "],
    world_theater: ["posture ", "advance"],
    tic_tac_toe: ["mark "],
    checkers: ["move "],
    chess: ["move "],
    poker: ["hold ", "draw", "deal", "hand"],
  };

  return (validPrefixes[gameId] ?? []).some((prefix) => normalizedStep.startsWith(prefix));
}
