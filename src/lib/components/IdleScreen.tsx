import { STARTERS, type AccentName } from "./theme";
import { SpinRing } from "./status-indicators";
import { AccentPopover } from "./ControlTray";
import { LOGO_SVG_PATHS, PLAY_SVG_PATH } from "./svg-paths";
import styles from "./IdleScreen.module.css";

interface IdleScreenProps {
  onStart: (prompt?: string) => void;
  startPending: boolean;
  accentName: AccentName;
  dark: boolean;
  onToggleDark: () => void;
  onAccentChange: (name: AccentName) => void;
}

export function IdleScreen({
  onStart,
  startPending,
  accentName,
  dark,
  onToggleDark,
  onAccentChange,
}: IdleScreenProps) {
  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ backgroundColor: "var(--t-bg)" }}
    >
      {/* Entrance animation keyframes */}
      <style>{`
        @keyframes genie-zoom-in {
          0%   { transform: scale(0); opacity: 0; }
          65%  { transform: scale(1.06); opacity: 1; }
          82%  { transform: scale(0.97); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes genie-fade-up {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .play-ring-entrance {
          opacity: 0;
          animation: genie-zoom-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 1.1s forwards;
        }
        .play-btn-entrance {
          opacity: 0;
          animation: genie-zoom-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 1.1s forwards;
          transition: scale 0.22s cubic-bezier(0.34, 1.2, 0.64, 1), box-shadow 0.22s ease;
        }
        .play-btn-entrance:hover  { scale: 1.14; }
        .play-btn-entrance:active { scale: 0.88; transition-duration: 0.1s; }
        .subtitle-entrance {
          opacity: 0;
          animation: genie-fade-up 0.8s ease-out 1.7s forwards;
        }
        .starters-entrance {
          opacity: 0;
          animation: genie-fade-up 0.8s ease-out 2.0s forwards;
        }
      `}</style>

      {/* Gradient glow blobs */}
      <div className="absolute contents">
        <div
          className="absolute blur-[294px] rounded-[999px] size-[569px] left-[512px] top-[392px] max-[840px]:size-[280px] max-[840px]:left-[calc(50%-80px)] max-[840px]:top-[20%] max-[840px]:blur-[180px]"
          style={{ backgroundColor: "var(--t-glow)" }}
        />
        <div
          className="absolute blur-[294px] rounded-[999px] size-[285px] left-[704px] top-[1119px] max-[840px]:size-[200px] max-[840px]:left-[calc(50%+40px)] max-[840px]:top-[65%] max-[840px]:blur-[140px]"
          style={{ backgroundColor: "var(--t-glow)" }}
        />
        <div
          className="absolute blur-[294px] rounded-[999px] size-[285px] left-[392px] top-[151px] max-[840px]:size-[180px] max-[840px]:left-[calc(50%-120px)] max-[840px]:top-[8%] max-[840px]:blur-[120px]"
          style={{ backgroundColor: "var(--t-glow)" }}
        />
      </div>

      {/* Horizontal divider line */}
      <div className="absolute left-1/2 top-[calc(50%+105px)] -translate-x-1/2 -translate-y-1/2 w-[1372px] h-0 max-[840px]:w-[85vw] max-[840px]:top-[calc(50%+60px)]">
        <div className="absolute inset-[-0.5px_0]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 1373 1"
          >
            <path
              d="M0.5 0.5H1372.5"
              stroke="var(--t-line)"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Genie wordmark with pulsating lines */}
      <div className="absolute left-[calc(50%-0.22px)] top-[calc(50%-8.23px)] -translate-x-1/2 -translate-y-1/2 w-[879.551px] h-[325.538px] max-[840px]:scale-[0.38] max-[840px]:top-[calc(50%-20px)] max-[540px]:scale-[0.3]">
        <svg
          className="absolute block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 879.551 325.538"
          style={{ overflow: "visible" }}
        >
          <defs>
            <style>{`
              @keyframes genie-logo-in {
                0%   { opacity: 0; transform: translateY(8px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              @keyframes genie-pulse-left {
                0%   { transform: scaleX(0); opacity: 0; }
                12%  { opacity: 0.7; }
                100% { transform: scaleX(1); opacity: 0; }
              }
              @keyframes genie-pulse-right {
                0%   { transform: scaleX(0); opacity: 0; }
                12%  { opacity: 0.7; }
                100% { transform: scaleX(1); opacity: 0; }
              }
              .genie-logo-path {
                opacity: 0;
                animation: genie-logo-in 0.8s ease-out forwards;
              }
              .genie-pl {
                transform-box: fill-box;
                transform-origin: right center;
                animation: genie-pulse-left 3.2s ease-out infinite;
              }
              .genie-pr {
                transform-box: fill-box;
                transform-origin: left center;
                animation: genie-pulse-right 3.2s ease-out infinite;
              }
            `}</style>
          </defs>

          {/* Pulsating lines -- left */}
          {PULSE_LINES_LEFT.map((l, i) => (
            <line
              key={`pl-${i}`}
              className="genie-pl"
              x1={l.x1}
              y1={l.y}
              x2="30"
              y2={l.y}
              stroke="var(--t-accent)"
              strokeWidth={l.w}
              style={{ animationDelay: l.delay, opacity: 0 }}
            />
          ))}

          {/* Pulsating lines -- right */}
          {PULSE_LINES_RIGHT.map((l, i) => (
            <line
              key={`pr-${i}`}
              className="genie-pr"
              x1="850"
              y1={l.y}
              x2={l.x2}
              y2={l.y}
              stroke="var(--t-accent)"
              strokeWidth={l.w}
              style={{ animationDelay: l.delay, opacity: 0 }}
            />
          ))}

          {/* Logo letter paths -- staggered entrance */}
          {LOGO_PATH_KEYS.map((key, i) => (
            <path
              key={key}
              d={LOGO_SVG_PATHS[key]}
              fill="var(--t-accent)"
              className="genie-logo-path"
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            />
          ))}
        </svg>
      </div>

      {/* Play button -- ring and inner button */}
      <div className="absolute left-1/2 top-[calc(50%+105px)] -translate-x-1/2 -translate-y-1/2 contents">
        {/* Outer ring */}
        <div
          className="absolute left-1/2 top-[calc(50%+105px)] -translate-x-1/2 -translate-y-1/2 border border-solid mix-blend-overlay rounded-[999px] size-[120px] play-ring-entrance max-[840px]:size-[100px] max-[840px]:top-[calc(50%+60px)]"
          style={{
            backgroundColor: "var(--t-ringBg)",
            borderColor: "var(--t-ringBorder)",
          }}
        />

        {/* Inner glossy button */}
        <button
          onClick={startPending ? undefined : () => onStart()}
          className="absolute left-1/2 top-[calc(50%+105px)] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-[4px] rounded-[999px] size-[93.333px] cursor-pointer play-btn-entrance max-[840px]:size-[78px] max-[840px]:top-[calc(50%+60px)]"
          style={{
            backgroundColor: "var(--t-surface)",
            boxShadow: "var(--t-shadowButton)",
          }}
        >
          {startPending ? (
            <SpinRing size={28} />
          ) : (
            <div className="relative shrink-0 size-[32px] max-[840px]:size-[26px]">
              <svg
                className="absolute block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 32 32"
              >
                <g clipPath="url(#clip-play-landing)">
                  <path d={PLAY_SVG_PATH} fill="var(--t-accentDeep)" />
                </g>
                <defs>
                  <clipPath id="clip-play-landing">
                    <rect fill="white" height="32" width="32" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          )}
          <div
            className="absolute inset-0 pointer-events-none rounded-[inherit]"
            style={{
              boxShadow: "var(--t-shadowInset)",
              border: "1px solid var(--t-buttonStroke)",
            }}
          />
        </button>
      </div>

      {/* Subtitle */}
      <p
        className="absolute left-0 right-0 font-['Inter',sans-serif] text-[24px] text-center top-[calc(50%+228px)] tracking-[-0.48px] subtitle-entrance max-[840px]:text-[18px] max-[840px]:top-[calc(50%+140px)] max-[840px]:px-8 max-[540px]:text-[16px] max-[540px]:top-[calc(50%+125px)]"
        style={{ color: "var(--t-accentText)" }}
      >
        Get Generative UI responses
        <br />
        for voice inputs
      </p>

      {/* Starters */}
      {!startPending && (
        <div className="absolute left-0 right-0 top-[calc(50%+300px)] flex flex-col items-center starters-entrance max-[840px]:top-[calc(50%+200px)] max-[540px]:top-[calc(50%+180px)]">
          <span className={styles.startersLabel}>Try these</span>
          {STARTERS.map((s) => (
            <button key={s} className={styles.starterBtn} onClick={() => onStart(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <AccentPopover
        accentName={accentName}
        dark={dark}
        onToggleDark={onToggleDark}
        onAccentChange={onAccentChange}
      />
    </div>
  );
}

/* ── Static data ── */

const PULSE_LINES_LEFT = [
  { x1: -520, y: 60, w: 0.6, delay: "0.8s" },
  { x1: -380, y: 80, w: 0.8, delay: "2.1s" },
  { x1: -600, y: 100, w: 0.5, delay: "0.9s" },
  { x1: -440, y: 120, w: 0.9, delay: "1.5s" },
  { x1: -520, y: 140, w: 0.7, delay: "2.4s" },
  { x1: -360, y: 155, w: 0.6, delay: "0.6s" },
  { x1: -500, y: 170, w: 0.8, delay: "1.8s" },
  { x1: -580, y: 190, w: 0.5, delay: "2.7s" },
  { x1: -420, y: 210, w: 0.9, delay: "1.2s" },
  { x1: -540, y: 230, w: 0.6, delay: "3.0s" },
  { x1: -390, y: 250, w: 0.7, delay: "1.9s" },
  { x1: -480, y: 270, w: 0.5, delay: "2.5s" },
];

const PULSE_LINES_RIGHT = [
  { x2: 1400, y: 55, w: 0.6, delay: "1.0s" },
  { x2: 1280, y: 75, w: 0.7, delay: "2.3s" },
  { x2: 1450, y: 95, w: 0.5, delay: "1.3s" },
  { x2: 1320, y: 115, w: 0.9, delay: "0.7s" },
  { x2: 1380, y: 135, w: 0.6, delay: "2.0s" },
  { x2: 1260, y: 155, w: 0.8, delay: "1.6s" },
  { x2: 1480, y: 175, w: 0.7, delay: "2.8s" },
  { x2: 1350, y: 195, w: 0.5, delay: "0.9s" },
  { x2: 1420, y: 215, w: 0.8, delay: "2.2s" },
  { x2: 1300, y: 235, w: 0.6, delay: "1.4s" },
  { x2: 1460, y: 255, w: 0.7, delay: "2.6s" },
  { x2: 1340, y: 275, w: 0.5, delay: "1.7s" },
];

const LOGO_PATH_KEYS = [
  "p2f0d8470",
  "p2d00cb80",
  "p8d6a800",
  "p3de4ef00",
  "p30a73900",
];
