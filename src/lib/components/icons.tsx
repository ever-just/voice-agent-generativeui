"use client";
import { useRef, useEffect } from "react";

/* ── Microphone — filled rect body, arc + stem ── */
export function MicIcon() {
  return (
    <svg className="block" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="4.5" y="1" width="5" height="7.5" rx="2.5" fill="currentColor" />
      <path d="M3 6.25V7C3 9.21 4.79 11 7 11C9.21 11 11 9.21 11 7V6.25"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M7 11V13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/* ── Microphone muted — same as MicIcon + diagonal slash ── */
export function MicOffIcon() {
  return (
    <svg className="block" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="4.5" y="1" width="5" height="7.5" rx="2.5" fill="currentColor" />
      <path d="M3 6.25V7C3 9.21 4.79 11 7 11C9.21 11 11 9.21 11 7V6.25"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M7 11V13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M2.1 1.4L11.9 12.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/* ── Close / X — 8×8, thin ── */
export function XIcon() {
  return (
    <svg className="block" width="8" height="8" viewBox="0 0 8 8" fill="none">
      <path d="M0.5 0.5L7.5 7.5" stroke="currentColor" strokeLinecap="round" />
      <path d="M7.5 0.5L0.5 7.5" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

/* ── Reset / Retry — circular arrow ── */
export function ResetIcon() {
  return (
    <svg className="block" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7a5 5 0 1 0 1.2-3.2L2 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 2.5V5.5H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Menu / Hamburger — 3 lines ── */
export function MenuIcon() {
  return (
    <svg className="block" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 4h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M2 7h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M2 10h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/* ── Sun — circle + 8 rays ── */
const SUN_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const;

export function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      {SUN_ANGLES.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        return (
          <line
            key={angle}
            x1={10 + cos * 6} y1={10 + sin * 6}
            x2={10 + cos * 7.5} y2={10 + sin * 7.5}
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

/* ── Moon — crescent path ── */
export function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path
        d="M15.5 11.5a6 6 0 0 1-7-7A6 6 0 1 0 15.5 11.5Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Play ── */
export function PlayIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

/* ── Wifi off (status indicators) ── */
export function WifiOffIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

/* ── Animated vertical audio waveform divider (canvas) ──
   Desktop: 48×72px vertical  |  Mobile: rotated 90° → horizontal
   ──────────────────────────────────────────────────────────────── */
export function AudioWaveformDivider() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 48;
    const H = 72;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.scale(DPR, DPR);

    const centerX = W / 2;
    let t = 0;

    const bands = [
      { freq: 0.12, speed: 2.0, amp: 14, phase: 0 },
      { freq: 0.22, speed: 3.2, amp: 8,  phase: 1.5 },
      { freq: 0.38, speed: 4.5, amp: 5,  phase: 3.0 },
    ];

    function computePath(yStep: number): [number, number][] {
      const pts: [number, number][] = [];
      for (let y = 0; y <= H; y += yStep) {
        const norm = y / H;
        const centered = Math.abs(norm - 0.5) * 2;
        const edge = 0.75;
        const envelope = centered < edge ? Math.pow(1 - centered / edge, 3) : 0;
        let dx = 0;
        for (const b of bands) {
          const energy = 0.7 + 0.3 * Math.sin(t * b.speed * 0.25 + b.phase);
          dx += Math.sin(y * b.freq + t * b.speed + b.phase) * b.amp * energy;
        }
        pts.push([centerX + dx * envelope, y]);
      }
      return pts;
    }

    function drawPath(pts: [number, number][]) {
      if (!ctx || pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i][0] + pts[i + 1][0]) / 2;
        const my = (pts[i][1] + pts[i + 1][1]) / 2;
        ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
      }
      const last = pts[pts.length - 1];
      ctx.lineTo(last[0], last[1]);
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const accent = getComputedStyle(document.documentElement)
        .getPropertyValue("--t-accent").trim() || "#FF712A";
      const pts = computePath(1.5);
      drawPath(pts);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      t += 0.03;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div style={{
      position: "relative",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 72,
      width: 48,
    }}
      className="audioWaveformDividerDesktop"
    >
      <canvas
        ref={canvasRef}
        style={{ width: 48, height: 72, pointerEvents: "none" }}
        className="audioWaveformCanvas"
      />
    </div>
  );
}
