import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useSessionContext,
  useAgent,
  useChat,
} from "@livekit/components-react";
import { ThemeProvider } from "@thesysai/genui-sdk";

import {
  createTheme,
  themeToVars,
  DarkModeContext,
  ACTIVE_AGENT_STATES,
  DEFAULT_ACCENT,
  type AccentName,
} from "./theme";
import { IdleScreen } from "./IdleScreen";
import { GenUIPanel } from "./GenUIPanel";
import { DesktopControls, MobileControls, StatusPill } from "./ControlTray";
import { TranscriptStrip } from "./TranscriptStrip";
import styles from "./VoiceUI.module.css";

export function VoiceUI() {
  const session = useSessionContext();
  const agent = useAgent();
  const isAgentReady = ACTIVE_AGENT_STATES.includes(agent.state);
  const { send: sendChatMessage } = useChat();

  const [genUIContent, setGenUIContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [transcriptKey, setTranscriptKey] = useState(0);

  // ── Theme ──

  const [dark, setDark] = useState(false);
  const [accentName, setAccentName] = useState<AccentName>(DEFAULT_ACCENT.light);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const isDark = mq.matches;
    setDark(isDark);
    setAccentName(DEFAULT_ACCENT[isDark ? "dark" : "light"]);
    setMounted(true);
    const handler = (e: MediaQueryListEvent) => {
      setDark(e.matches);
      setAccentName(DEFAULT_ACCENT[e.matches ? "dark" : "light"]);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setDark((d) => {
      const next = !d;
      setAccentName(DEFAULT_ACCENT[next ? "dark" : "light"]);
      return next;
    });
  }, []);

  const theme = useMemo(() => createTheme(dark, accentName), [dark, accentName]);
  const themeStyle = useMemo(() => themeToVars(theme), [theme]);

  // ── Connection lifecycle ──

  const [startPending, setStartPending] = useState(false);
  const pendingPromptRef = useRef<string | null>(null);

  useEffect(() => {
    if (session.isConnected) setStartPending(false);
  }, [session.isConnected]);

  useEffect(() => {
    if (isAgentReady && pendingPromptRef.current) {
      sendChatMessage(pendingPromptRef.current);
      pendingPromptRef.current = null;
    }
  }, [isAgentReady, sendChatMessage]);

  const handleStart = useCallback((prompt?: string) => {
    pendingPromptRef.current = prompt ?? null;
    setStartPending(true);
    session.start();
  }, [session]);

  const handleEnd = useCallback(() => {
    pendingPromptRef.current = null;
    session.end();
    setGenUIContent("");
    setStartPending(false);
  }, [session]);

  const handleReset = useCallback(() => {
    session.end();
    setGenUIContent("");
    setIsStreaming(false);
    setTranscriptKey((k) => k + 1);
    setTimeout(() => session.start(), 300);
  }, [session]);

  // ── GenUI text stream ──

  useEffect(() => {
    const room = session.room;
    if (!room) return;

    const handleGenUI = (reader: AsyncIterable<string>) => {
      setIsStreaming(true);
      setIsProcessingAction(false);
      setGenUIContent("");
      let acc = "";
      (async () => {
        try {
          for await (const chunk of reader) {
            acc += chunk;
            setGenUIContent(acc);
          }
        } finally {
          setIsStreaming(false);
        }
      })();
    };

    room.registerTextStreamHandler("genui", handleGenUI);
    return () => {
      try { room.unregisterTextStreamHandler("genui"); } catch {}
    };
  }, [session.room]);

  // ── GenUI actions ──

  const handleAction = useCallback(
    (event: { type?: string; params?: Record<string, unknown> }) => {
      switch (event.type) {
        case "open_url":
          window.open(
            (event.params?.url as string | undefined),
            "_blank",
            "noopener,noreferrer",
          );
          break;
        case "continue_conversation":
        default: {
          const message = event.params?.llmFriendlyMessage as string | undefined;
          if (message) {
            setIsProcessingAction(true);
            sendChatMessage(message);
          }
          break;
        }
      }
    },
    [sendChatMessage],
  );

  // ── Derived state ──

  const connStatus = !session.isConnected
    ? null
    : isAgentReady ? "connected" : "connecting";

  const agentStatus =
    session.isConnected && isAgentReady ? agent.state : null;

  const controlsProps = {
    agentStatus,
    isAgentReady,
    accentName,
    dark,
    onToggleDark: toggleTheme,
    onAccentChange: setAccentName,
    onReset: handleReset,
    onEnd: handleEnd,
    transcriptKey,
    connStatus,
  };

  if (!mounted) return <div className="min-h-screen" />;

  return (
    <DarkModeContext.Provider value={{ dark, toggle: toggleTheme }}>
      <ThemeProvider mode={dark ? "dark" : "light"}>
        <div className={styles.root} style={themeStyle}>
          {/* Blobs for idle screen */}
          <div className={styles.blobs}>
            <div className={styles.blob1} />
            <div className={styles.blob2} />
            <div className={styles.blob3} />
          </div>

          {!session.isConnected ? (
            <IdleScreen
              onStart={handleStart}
              startPending={startPending}
              accentName={accentName}
              dark={dark}
              onToggleDark={toggleTheme}
              onAccentChange={setAccentName}
            />
          ) : (
            <div className={styles.connected}>
              {/* Blobs inside connected so they show around the card */}
              <div className={styles.blobs}>
                <div className={styles.blob1} />
                <div className={styles.blob2} />
                <div className={styles.blob3} />
              </div>
              {/* Floating card — position:relative, pill is absolute inside it */}
              <div className={styles.card}>

                {/* ── Desktop: content + transcript footer ── */}
                <div className="hidden md:flex md:flex-col md:flex-1 md:min-h-0 md:overflow-hidden md:rounded-t-3xl">
                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    <GenUIPanel
                      content={genUIContent}
                      isStreaming={isStreaming}
                      isProcessingAction={isProcessingAction}
                      isAgentReady={isAgentReady}
                      onAction={handleAction}
                    />
                  </div>
                  <div className={styles.cardFooterDesktop}>
                    <TranscriptStrip key={transcriptKey} />
                  </div>
                </div>

                {/* ── Mobile: content + bottom bar ── */}
                <div className="flex flex-col flex-1 min-h-0 md:hidden">
                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    <GenUIPanel
                      content={genUIContent}
                      isStreaming={isStreaming}
                      isProcessingAction={isProcessingAction}
                      isAgentReady={isAgentReady}
                      onAction={handleAction}
                    />
                  </div>
                  <MobileControls {...controlsProps} />
                </div>

                {/* ── Pill: absolute on the card, sits on the footer border ── */}
                <div className={styles.pillAnchor}>
                  <StatusPill connStatus={connStatus} agentStatus={agentStatus} />
                </div>

              </div>

              {/* Desktop controls live outside the card */}
              <div className="hidden md:flex md:items-center md:self-stretch">
                <DesktopControls {...controlsProps} />
              </div>
            </div>
          )}
        </div>
      </ThemeProvider>
    </DarkModeContext.Provider>
  );
}
