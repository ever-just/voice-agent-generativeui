import { createContext, useContext, type CSSProperties } from "react";

// ── Accent color names ────────────────────────────────────────────────────────

export type AccentName = "orange" | "pink" | "green" | "blue" | "purple" | "red";

export const ACCENT_NAMES: AccentName[] = ["orange", "pink", "green", "blue", "purple", "red"];

interface AccentTokens {
  accent: string;
  accentDeep: string;
  accentText: string;
  accentHover: string;
  glow: string;
  line: string;
  buttonStroke: string;
}

const ACCENT_LIGHT: Record<AccentName, AccentTokens> = {
  orange: { accent: "#FF712A", accentDeep: "#F05100", accentText: "#d45e24", accentHover: "#F97316", glow: "#fbb48f", line: "#FCC4A8", buttonStroke: "transparent" },
  pink:   { accent: "#EC4899", accentDeep: "#DB2777", accentText: "#D946A8", accentHover: "#F472B6", glow: "#F9A8D4", line: "#FBCFE8", buttonStroke: "transparent" },
  green:  { accent: "#22C55E", accentDeep: "#16A34A", accentText: "#1DAF54", accentHover: "#4ADE80", glow: "#86EFAC", line: "#BBF7D0", buttonStroke: "transparent" },
  blue:   { accent: "#3B82F6", accentDeep: "#2563EB", accentText: "#3574DB", accentHover: "#60A5FA", glow: "#93C5FD", line: "#BFDBFE", buttonStroke: "transparent" },
  purple: { accent: "#8B5CF6", accentDeep: "#7C3AED", accentText: "#7E52DB", accentHover: "#A78BFA", glow: "#C4B5FD", line: "#DDD6FE", buttonStroke: "transparent" },
  red:    { accent: "#EF4444", accentDeep: "#DC2626", accentText: "#D93B3B", accentHover: "#F87171", glow: "#FCA5A5", line: "#FECACA", buttonStroke: "transparent" },
};

const ACCENT_DARK: Record<AccentName, AccentTokens> = {
  orange: { accent: "#FB923C", accentDeep: "#EA580C", accentText: "#FDBA74", accentHover: "#FCA55A", glow: "#5C2D0E", line: "#7C3D1A", buttonStroke: "rgba(251,146,60,0.20)" },
  pink:   { accent: "#E84B7A", accentDeep: "#D43D6A", accentText: "#E8779A", accentHover: "#F2608B", glow: "#5A1E38", line: "#7A2E4A", buttonStroke: "rgba(232,75,122,0.20)" },
  green:  { accent: "#4ADE80", accentDeep: "#22C55E", accentText: "#86EFAC", accentHover: "#6EE7A0", glow: "#14532D", line: "#1E6B3E", buttonStroke: "rgba(74,222,128,0.20)" },
  blue:   { accent: "#60A5FA", accentDeep: "#3B82F6", accentText: "#93C5FD", accentHover: "#7AB8FC", glow: "#1E3A5F", line: "#1E4A7A", buttonStroke: "rgba(96,165,250,0.20)" },
  purple: { accent: "#A78BFA", accentDeep: "#8B5CF6", accentText: "#C4B5FD", accentHover: "#B8A0FC", glow: "#3B1F6E", line: "#4C2E8A", buttonStroke: "rgba(167,139,250,0.20)" },
  red:    { accent: "#F87171", accentDeep: "#EF4444", accentText: "#FCA5A5", accentHover: "#FA8A8A", glow: "#5C1515", line: "#7C1D1D", buttonStroke: "rgba(248,113,113,0.20)" },
};

/** Visible swatch dot colors — what shows in the popover */
export const SWATCH_COLORS: { name: AccentName; light: string; dark: string }[] = [
  { name: "orange", light: "#FF712A", dark: "#FB923C" },
  { name: "pink",   light: "#EC4899", dark: "#E84B7A" },
  { name: "green",  light: "#22C55E", dark: "#4ADE80" },
  { name: "blue",   light: "#3B82F6", dark: "#60A5FA" },
  { name: "purple", light: "#8B5CF6", dark: "#A78BFA" },
  { name: "red",    light: "#EF4444", dark: "#F87171" },
];

/** Default accent per mode (matches reference) */
export const DEFAULT_ACCENT: Record<"light" | "dark", AccentName> = {
  light: "orange",
  dark:  "orange",
};

// ── Theme creation ────────────────────────────────────────────────────────────

export type Theme = ReturnType<typeof createTheme>;

export function createTheme(dark: boolean, accentName: AccentName = "orange") {
  const d = dark;
  const a = d ? ACCENT_DARK[accentName] : ACCENT_LIGHT[accentName];

  return {
    // Backgrounds
    bg:               d ? "#0E0E11"                 : "#ffffff",
    bgResponse:       d ? "#111114"                 : "#fcfcfc",
    surface:          d ? "#1A1A1E"                 : "#ffffff",

    // Text
    text:             d ? "rgba(255,255,255,0.7)"   : "rgba(0,0,0,0.65)",
    textMuted:        d ? "rgba(255,255,255,0.4)"   : "rgba(0,0,0,0.4)",
    textIcon:         d ? "#e0e0e0"                 : "#000000",

    // Borders
    border:           d ? "rgba(255,255,255,0.1)"   : "rgba(0,0,0,0.1)",
    borderSubtle:     d ? "rgba(255,255,255,0.04)"  : "rgba(0,0,0,0.06)",

    // Shadows
    shadowButton:     d ? "2px 4px 15.168px 0px rgba(0,0,0,0.5)"     : "2px 4px 15.168px 0px rgba(0,0,0,0.2)",
    shadowInset:      d ? "inset -1px -3px 4.632px 0px rgba(0,0,0,0.3)" : "inset -1px -3px 4.632px 0px rgba(0,0,0,0.12)",
    shadowPill:       d ? "2px 4px 15.168px 0px rgba(0,0,0,0.3)"     : "2px 4px 15.168px 0px rgba(0,0,0,0.1)",
    shadowCard:       d
      ? "0px 64px 64px 0px rgba(0,0,0,0.25), 0px 32px 32px 0px rgba(0,0,0,0.1), 0px 24px 24px 0px rgba(0,0,0,0.08), 0px 4px 24px 0px rgba(0,0,0,0.02), 0px 4px 4px 0px rgba(0,0,0,0.05)"
      : "0px 64px 64px 0px rgba(0,0,0,0.08), 0px 32px 32px 0px rgba(0,0,0,0.02), 0px 24px 24px 0px rgba(0,0,0,0.02), 0px 4px 24px 0px rgba(0,0,0,0.02), 0px 4px 4px 0px rgba(0,0,0,0.02)",

    // Ring overlay (mix-blend-overlay layer around action buttons)
    ringBg:           d ? "rgba(255,255,255,0.1)"   : "rgba(0,0,0,0.2)",
    ringBorder:       d ? "rgba(255,255,255,0.2)"   : "rgba(0,0,0,0.6)",

    // Skeleton / muted UI
    skeletonA:        d ? "rgba(255,255,255,0.08)"  : "#e5e7eb",
    skeletonB:        d ? "rgba(255,255,255,0.04)"  : "#f3f4f6",

    // Transcript
    transcriptBorder: d ? "rgba(255,255,255,0.06)"  : "rgba(0,0,0,0.06)",
    userLabel:        d ? "rgba(255,255,255,0.35)"  : "rgba(0,0,0,0.35)",
    userText:         d ? "rgba(255,255,255,0.4)"   : "rgba(0,0,0,0.4)",

    // Pagination dots
    dot:              d ? "rgba(255,255,255,0.15)"  : "rgba(0,0,0,0.1)",
    dotActive:        d ? "rgba(255,255,255,0.4)"   : "rgba(0,0,0,0.25)",

    // Start/idle button
    startBg:          d ? "#ffffff"                 : "#030213",
    startText:        d ? "#030213"                 : "#ffffff",
    startShadow:      d ? "0 8px 36px rgba(255,255,255,0.12)"  : "0 8px 36px rgba(3,2,19,0.22)",
    startShadowHov:   d ? "0 12px 44px rgba(255,255,255,0.20)" : "0 12px 44px rgba(3,2,19,0.30)",

    // Shimmer
    shimmer: d
      ? "linear-gradient(135deg,#fff 0%,#fff 40%,rgba(255,255,255,0.22) 50%,#fff 60%,#fff 100%)"
      : "linear-gradient(135deg,#000 0%,#000 40%,rgba(0,0,0,0.15) 50%,#000 60%,#000 100%)",

    // Accent tokens (derived from accentName + mode)
    accent:           a.accent,
    accentDeep:       a.accentDeep,
    accentText:       a.accentText,
    accentHover:      a.accentHover,
    glow:             a.glow,
    line:             a.line,
    buttonStroke:     a.buttonStroke,

    // Mic ring — all accent
    ringSpeaking:     a.accent,
    ringListening:    a.accent,
    ringThinking:     a.accent,

    // Agent label color = accent text
    agentLabel:       a.accentText,
    agentText:        d ? "#e5e7eb" : "#111",

    // Status chips
    connConnecting:   d ? "#fbbf24" : "#92400e",
    connConnected:    d ? "#4ade80" : "#15803d",
    connDisconnected: d ? "#f87171" : "#be123c",
    agentSpeaking:    a.accent,
    agentListening:   a.accent,
    agentThinking:    a.accent,

    micShadow: d ? "0 4px 20px rgba(255,255,255,0.15)" : "none",
  };
}

export function themeToVars(theme: Theme): CSSProperties {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme)) {
    vars[`--t-${key}`] = value;
  }
  return vars as CSSProperties;
}

type DarkModeValue = { dark: boolean; toggle: () => void };
export const DarkModeContext = createContext<DarkModeValue>({ dark: false, toggle: () => {} });
export const useDarkMode = () => useContext(DarkModeContext);

export const STARTERS = [
  "Help me plan a trip",
  "Compare Apple and Tesla stocks",
  "Who won at Oscars this year",
];

export const ACTIVE_AGENT_STATES = ["listening", "thinking", "speaking"];
