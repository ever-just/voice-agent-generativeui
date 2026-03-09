import { STARTERS, type AccentName } from "./theme";
import { PlayIcon } from "./icons";
import { SpinRing } from "./status-indicators";
import { AccentPopover } from "./ControlTray";
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
    <div className={styles.root}>
      <div className="flex flex-col items-center gap-2.5 mb-17">
        <h1 className={styles.title}>genie</h1>
        <p className={styles.subtitle}>
          Get Generative UI responses<br />for voice inputs
        </p>
      </div>

      <button
        className={`${styles.startBtn} ${startPending ? styles.loading : ""}`}
        onClick={startPending ? undefined : () => onStart()}
      >
        {startPending ? (
          <><SpinRing size={18} /> Connecting</>
        ) : (
          <><PlayIcon /> Start</>
        )}
      </button>

      {!startPending && (
        <div className="absolute bottom-13 flex flex-col items-center">
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
