import { ACCESS_LEVELS, PROFILES, SUBSYSTEMS } from "../data/world.js";

export const SAVE_KEY = "bock-save-state-v1";

export function createInitialState() {
  return {
    profile: "guest",
    discoveredKeywords: [],
    connectedNode: null,
    discoveredNodes: [],
    bootComplete: false,
    soundEnabled: true,
    voiceEnabled: true,
    voiceRate: 1.15,
    voicePitch: 0.70,
    screenTone: "green",
    phosphorGlow: 1,
    scanlineStrength: 0.34,
    demoMode: false,
    currentGame: null,
    gameState: null,
    commandHistory: [],
    unlockedModules: ["status", "network-nodes"],
    subsystemStates: SUBSYSTEMS.map((item) => ({ ...item })),
    attractIndex: 0,
    cheepCheepTurns: 0,
    infinityBotName: "Cheep Cheep",
    infinityUserName: "Professor Bock Bock",
  };
}

export function getProfile(state) {
  return PROFILES[state.profile];
}

export function getAccessRank(profileKey) {
  return ACCESS_LEVELS.find((level) => level.key === profileKey)?.rank ?? 0;
}

export function hasAccess(state, requiredProfile) {
  return getAccessRank(state.profile) >= getAccessRank(requiredProfile);
}

export function serializeState(state) {
  return JSON.stringify(state);
}

export function deserializeState(value) {
  const parsed = JSON.parse(value);
  const migratedVoiceRate = parsed.voiceRate === 1.17 ? 1.15 : parsed.voiceRate;
  const migratedVoicePitch = parsed.voicePitch === 0.58 ? 0.70 : parsed.voicePitch;
  const migratedInfinityUserName = parsed.infinityUserName === "Chief Imbibbing Officer"
    ? "Chief Imbibing Officer"
    : parsed.infinityUserName;
  const migratedInfinityBotName = parsed.infinityBotName;
  const migratedCheepCheepTurns = parsed.cheepCheepTurns;
  const migratedScreenTone = parsed.screenTone === "amber" ? "amber" : "green";
  const migratedPhosphorGlow = Number.isFinite(parsed.phosphorGlow)
    ? Math.min(10, Math.max(0.5, parsed.phosphorGlow))
    : createInitialState().phosphorGlow;
  const migratedScanlineStrength = Number.isFinite(parsed.scanlineStrength) ? parsed.scanlineStrength : createInitialState().scanlineStrength;

  return {
    ...createInitialState(),
    ...parsed,
    voiceRate: migratedVoiceRate ?? createInitialState().voiceRate,
    voicePitch: migratedVoicePitch ?? createInitialState().voicePitch,
    screenTone: migratedScreenTone,
    phosphorGlow: migratedPhosphorGlow,
    scanlineStrength: migratedScanlineStrength,
    cheepCheepTurns: migratedCheepCheepTurns ?? createInitialState().cheepCheepTurns,
    infinityBotName: migratedInfinityBotName ?? createInitialState().infinityBotName,
    infinityUserName: migratedInfinityUserName ?? createInitialState().infinityUserName,
    commandHistory: Array.isArray(parsed.commandHistory)
      ? parsed.commandHistory.slice(-10)
      : createInitialState().commandHistory,
    subsystemStates: Array.isArray(parsed.subsystemStates)
      ? parsed.subsystemStates
      : createInitialState().subsystemStates,
  };
}

export function rememberKeyword(state, keyword) {
  if (state.discoveredKeywords.includes(keyword)) {
    return false;
  }

  state.discoveredKeywords.push(keyword);
  return true;
}

export function promoteProfile(state, newProfile) {
  if (getAccessRank(newProfile) > getAccessRank(state.profile)) {
    state.profile = newProfile;
    return true;
  }

  return false;
}
