"use client";
import { useEffect, useRef, useState } from "react";
import {
  useTrackToggle,
  useMultibandTrackVolume,
  useAgent,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track, type LocalAudioTrack } from "livekit-client";
import { SWATCH_COLORS, type AccentName } from "./theme";
import {
  MicIcon, MicOffIcon, XIcon, ResetIcon,
  SunIcon, MoonIcon, MenuIcon,
} from "./icons";
import { SpinRing, SoundBars, ThinkDots, PulseCircle } from "./status-indicators";
import { TranscriptStrip } from "./TranscriptStrip";
import styles from "./ControlTray.module.css";

// ── Shared props interface ────────────────────────────────────────────────────

export interface ControlsProps {
  agentStatus: string | null;
  isAgentReady: boolean;
  accentName: AccentName;
  dark: boolean;
  onToggleDark: () => void;
  onAccentChange: (name: AccentName) => void;
  onReset: () => void;
  onEnd: () => void;
  transcriptKey: number;
  connStatus: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ATOMS & MOLECULES
// ═══════════════════════════════════════════════════════════════════════════════

// ── ActionButton — matches reference exactly ──────────────────────────────────
// 48px outer container, 37.333px inner circle, shadow-button + shadow-inset

function ActionButton({
  onClick,
  title,
  children,
}: {
  onClick?: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.actionOuter}>
      <button className={styles.actionBtn} onClick={onClick} title={title}>
        <span style={{ color: "var(--t-textIcon)" }}>{children}</span>
        <div className={styles.actionInset} />
      </button>
    </div>
  );
}

// ── ActionButtonRing — mix-blend-overlay layer, rendered separately ───────────

function ActionButtonRing() {
  return (
    <div className={styles.actionOuter}>
      <div className={styles.actionRing} />
    </div>
  );
}

// ── MicBtn ────────────────────────────────────────────────────────────────────

function MicBtn({
  agentStatus,
  disabled,
}: {
  agentStatus: string | null;
  disabled?: boolean;
}) {
  const { enabled, toggle } = useTrackToggle({ source: Track.Source.Microphone });
  const muted = !enabled;

  const className = [
    styles.micBtn,
    muted && styles.micMuted,
    disabled && styles.micDisabled,
  ].filter(Boolean).join(" ");

  return (
    <div className={styles.micWrap}>
      <button
        className={className}
        onClick={() => toggle()}
        disabled={disabled}
        title={disabled ? "Waiting for agent…" : muted ? "Unmute" : "Mute"}
      >
        <span style={{ color: "var(--t-textIcon)" }}>
          {muted || disabled ? <MicOffIcon /> : <MicIcon />}
        </span>
        <div className={styles.actionInset} />
      </button>
    </div>
  );
}

// ── ResetBtn ──────────────────────────────────────────────────────────────────

function ResetBtn({ onReset }: { onReset: () => void }) {
  return (
    <ActionButton onClick={onReset} title="Restart">
      <ResetIcon />
    </ActionButton>
  );
}

// ── EndBtn ────────────────────────────────────────────────────────────────────

function EndBtn({ onEnd }: { onEnd: () => void }) {
  return (
    <div className={styles.actionOuter}>
      <button className={styles.actionBtn} onClick={onEnd} title="End call">
        <span style={{ color: "var(--t-textIcon)" }}><XIcon /></span>
        <div className={styles.actionInset} />
      </button>
    </div>
  );
}

// ── StatusPill ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  connecting:   "Connecting",
  connected:    "Connected",
  disconnected: "Disconnected",
  speaking:     "Speaking",
  listening:    "Listening",
  thinking:     "Thinking",
};

export function StatusPill({ connStatus, agentStatus }: { connStatus: string | null; agentStatus: string | null }) {
  const status = agentStatus ?? connStatus;
  if (!status || !STATUS_LABELS[status]) return null;
  return (
    <div className={styles.statusPill}>
      {status === "connecting" && <SpinRing size={11} />}
      {status === "speaking"   && <SoundBars count={3} height={12} />}
      {status === "thinking"   && <ThinkDots />}
      {status === "listening"  && <PulseCircle />}
      {STATUS_LABELS[status]}
    </div>
  );
}

// ── MergedWaveform ────────────────────────────────────────────────────────────

const BAND_COUNT = 12;
const SVG_W = 120;
const SVG_H = 32;
const HALF_H = SVG_H / 2;
const AMPLITUDE = (HALF_H - 2) * 3.5;
const LEAD_IN = 15;

function buildPath(bands: number[]): string {
  const pts: [number, number][] = [
    [0, HALF_H],
    [LEAD_IN, HALF_H],
  ];
  for (let i = 0; i < bands.length; i++) {
    const x = LEAD_IN + (i / (bands.length - 1)) * (SVG_W - LEAD_IN);
    const sign = i % 2 === 0 ? 1 : -1;
    const y = HALF_H + sign * bands[i] * AMPLITUDE;
    pts.push([x, y]);
  }
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

export function MergedWaveform({ vertical = false }: { vertical?: boolean }) {
  const agent = useAgent();
  const { localParticipant } = useLocalParticipant();
  const micPub = localParticipant.getTrackPublication(Track.Source.Microphone);
  const localTrack = micPub?.track as LocalAudioTrack | undefined;
  const agentTrack = agent.microphoneTrack;
  const userBands  = useMultibandTrackVolume(localTrack,  { bands: BAND_COUNT });
  const agentBands = useMultibandTrackVolume(agentTrack,  { bands: BAND_COUNT });
  const merged = Array.from({ length: BAND_COUNT }, (_, i) =>
    Math.max(userBands[i] ?? 0, agentBands[i] ?? 0),
  );
  const d = buildPath(merged);
  const svgClass = `${styles.waveformSvg} ${vertical ? styles.waveformSvgV : styles.waveformSvgH}`;
  return (
    <svg className={svgClass} viewBox={`0 0 ${SVG_W} ${SVG_H}`} preserveAspectRatio="none">
      <path className={styles.waveformLine} d={d} />
    </svg>
  );
}

// ── AccentPopover ─────────────────────────────────────────────────────────────
// 40px trigger circle → vertical rounded-full pill popover
// Sun/Moon stacked (active = filled text-bg circle), divider, color swatches vertically

export function AccentPopover({
  accentName,
  dark,
  onToggleDark,
  onAccentChange,
}: {
  accentName: AccentName;
  dark: boolean;
  onToggleDark: () => void;
  onAccentChange: (name: AccentName) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const currentSwatch = SWATCH_COLORS.find((s) => s.name === accentName);
  const currentColor = currentSwatch ? (dark ? currentSwatch.dark : currentSwatch.light) : "var(--t-accent)";

  return (
    <div ref={ref} className={styles.accentWrap}>
      {open && (
        <div className={styles.accentPopover}>
          {/* Sun — active when light mode */}
          <button
            className={`${styles.modeBtn} ${!dark ? styles.modeBtnActive : ""}`}
            onClick={() => { if (dark) onToggleDark(); }}
            title="Light mode"
          >
            <SunIcon />
          </button>

          {/* Moon — active when dark mode */}
          <button
            className={`${styles.modeBtn} ${dark ? styles.modeBtnActive : ""}`}
            onClick={() => { if (!dark) onToggleDark(); }}
            title="Dark mode"
          >
            <MoonIcon />
          </button>

          <div className={styles.popoverDivider} />

          {/* Color swatches — vertical */}
          {SWATCH_COLORS.map((swatch) => {
            const isSelected = accentName === swatch.name;
            const color = dark ? swatch.dark : swatch.light;
            return (
              <button
                key={swatch.name}
                className={styles.swatchBtn}
                onClick={() => { onAccentChange(swatch.name); setOpen(false); }}
                title={swatch.name}
              >
                <div
                  className={styles.swatchDot}
                  style={{
                    background: color,
                    width:  isSelected ? 20 : 14,
                    height: isSelected ? 20 : 14,
                    boxShadow: isSelected ? `0 0 10px 2px ${color}50` : "none",
                    border: isSelected
                      ? `2px solid ${dark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)"}`
                      : "none",
                  }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Trigger: 40px circle showing current accent glow dot */}
      <button
        className={styles.accentTrigger}
        onClick={() => setOpen((o) => !o)}
        title="Appearance"
        aria-label="Theme settings"
      >
        <div
                  className="w-5 h-5 rounded-full"
                  style={{
                    background: currentColor,
                    boxShadow: `0 0 6px 1px ${currentColor}`,
                  }}
        />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESKTOP CONTROLS  (hidden on mobile)
// ═══════════════════════════════════════════════════════════════════════════════

export function DesktopControls(props: ControlsProps) {
  const {
    agentStatus, isAgentReady, accentName, dark,
    onToggleDark, onAccentChange, onReset, onEnd,
  } = props;

  return (
    <div className={styles.desktopControls}>
      {/* Blend rings layer — pointer-events:none, sits behind */}
      <div className={styles.floatingRings}>
        <ActionButtonRing />
        <ActionButtonRing />
        <div className={styles.waveformSpacer} />
        <ActionButtonRing />
      </div>

      {/* Buttons layer — interactive, sits in front */}
      <div className={styles.floatingButtons}>
        <MicBtn agentStatus={agentStatus} disabled={!isAgentReady} />
        <ResetBtn onReset={onReset} />
        <div className={styles.waveformSpacer}>
          <MergedWaveform vertical />
        </div>
        <EndBtn onEnd={onEnd} />
      </div>

      {/* Bottom-left accent popover */}
      <AccentPopover
        accentName={accentName}
        dark={dark}
        onToggleDark={onToggleDark}
        onAccentChange={onAccentChange}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE CONTROLS  (hidden on desktop)
// ═══════════════════════════════════════════════════════════════════════════════

export function MobileControls(props: ControlsProps) {
  const {
    agentStatus, isAgentReady, accentName, dark,
    onToggleDark, onAccentChange, onReset, onEnd,
    transcriptKey, connStatus,
  } = props;

  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex flex-col w-full">
      {/* TranscriptStrip */}
      <TranscriptStrip key={transcriptKey} />

      {/* Bottom section: bar with safe-area padding */}
      <div className={styles.mobileBottom}>

        {/* Bottom bar: ActionButton | waveform | ActionButton */}
        <div className={styles.mobileBar}>
          <ActionButton onClick={() => setSheetOpen(true)} title="Menu">
            <MenuIcon />
          </ActionButton>

          <div className={styles.mobileWaveform}>
            <MergedWaveform />
          </div>

          <ActionButton onClick={onEnd} title="End call">
            <XIcon />
          </ActionButton>
        </div>
      </div>

      {/* Settings sheet */}
      {sheetOpen && (
        <>
          <div className={styles.sheetOverlay} onClick={() => setSheetOpen(false)} />

          {/* Floating close button */}
          <button
            className={styles.sheetClose}
            onClick={() => setSheetOpen(false)}
            title="Close"
          >
            <span style={{ color: "var(--t-textIcon)" }}><XIcon /></span>
          </button>

          <div className={styles.sheet}>
            {/* Drag handle */}
            <div className={styles.sheetHandle} />

            <div className="flex flex-col py-1 px-4">
              {/* ── Theme section ── */}
              <div className={styles.sheetSection}>
                <span className={styles.sheetLabel}>Theme</span>
                <div className="flex gap-2">
                  <button
                    className={`${styles.themePill} ${!dark ? styles.themePillActive : ""}`}
                    onClick={() => { if (dark) onToggleDark(); }}
                  >
                    <SunIcon />
                    <span>Light</span>
                  </button>
                  <button
                    className={`${styles.themePill} ${dark ? styles.themePillActive : ""}`}
                    onClick={() => { if (!dark) onToggleDark(); }}
                  >
                    <MoonIcon />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              <div className={styles.sheetDivider} />

              {/* ── Color section ── */}
              <div className={styles.sheetSection}>
                <span className={styles.sheetLabel}>Color</span>
                <div className="flex items-center">
                  {SWATCH_COLORS.map((swatch) => {
                    const isSelected = accentName === swatch.name;
                    const color = dark ? swatch.dark : swatch.light;
                    return (
                      <button
                        key={swatch.name}
                        className={styles.sheetSwatchBtn}
                        onClick={() => onAccentChange(swatch.name)}
                        title={swatch.name}
                      >
                        <div
                          className={styles.sheetSwatchDot}
                          style={{
                            background: color,
                            width:  isSelected ? 24 : 18,
                            height: isSelected ? 24 : 18,
                            boxShadow: isSelected ? `0 0 12px 3px ${color}50` : "none",
                            border: isSelected
                              ? `2px solid ${dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)"}`
                              : "none",
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.sheetDivider} />

              {/* ── Options section ── */}
              <div className={styles.sheetSection}>
                <span className={styles.sheetLabel}>Options</span>
                <div className="flex items-center gap-3">
                  <MicBtn agentStatus={agentStatus} disabled={!isAgentReady} />
                  <button
                    className={styles.restartBtn}
                    onClick={() => { onReset(); setSheetOpen(false); }}
                  >
                    <ResetIcon />
                    <span>Restart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
