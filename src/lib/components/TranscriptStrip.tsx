import { useEffect, useMemo, useRef, useState } from "react";
import {
  useVoiceAssistant,
  useLocalParticipant,
  useTranscriptions,
} from "@livekit/components-react";
import styles from "./TranscriptStrip.module.css";

export function TranscriptStrip() {
  const { agentTranscriptions, state: agentState } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const rawUserTranscriptions = useTranscriptions({
    participantIdentities: localParticipant ? [localParticipant.identity] : [],
  });

  const userTurnStartRef = useRef(0);
  const agentTurnStartRef = useRef(0);
  const prevAgentStateRef = useRef("");
  const [lastUserText, setLastUserText] = useState("");
  const [lastAgentText, setLastAgentText] = useState("");

  const dedupedUserSegments = useMemo(() => {
    const bySegment = new Map<string, string>();
    for (const t of rawUserTranscriptions) {
      const segId = t.streamInfo.attributes?.["lk.segment_id"] ?? t.streamInfo.id;
      const isFinal = t.streamInfo.attributes?.["lk.transcription_final"] === "true";
      if (isFinal) {
        bySegment.set(segId, t.text);
      } else if (!bySegment.has(segId)) {
        bySegment.set(segId, t.text);
      }
    }
    return [...bySegment.values()];
  }, [rawUserTranscriptions]);

  useEffect(() => {
    const prev = prevAgentStateRef.current;
    const curr = agentState;

    if (curr === "speaking" && prev !== "speaking") {
      agentTurnStartRef.current = agentTranscriptions.length;
      const text = dedupedUserSegments
        .slice(userTurnStartRef.current)
        .join(" ")
        .trim();
      if (text) setLastUserText(text);
      userTurnStartRef.current = dedupedUserSegments.length;
    }

    if (curr !== "speaking" && prev === "speaking") {
      const text = agentTranscriptions
        .slice(agentTurnStartRef.current)
        .map((s) => s.text)
        .join(" ")
        .trim();
      if (text) setLastAgentText(text);
    }

    prevAgentStateRef.current = curr;
  }, [agentState]); // eslint-disable-line react-hooks/exhaustive-deps

  const liveUserText = dedupedUserSegments
    .slice(userTurnStartRef.current)
    .join(" ")
    .trim();

  const liveAgentText = agentTranscriptions
    .slice(agentTurnStartRef.current)
    .map((s) => s.text)
    .join(" ")
    .trim();

  // Blinking cursor while agent is speaking
  const [cursorOn, setCursorOn] = useState(true);
  useEffect(() => {
    if (agentState !== "speaking") return;
    const id = setInterval(() => setCursorOn((v) => !v), 500);
    return () => clearInterval(id);
  }, [agentState]);

  // Single-row priority:
  //   - while agent is speaking: show live agent text
  //   - while user is speaking (live user text present): show live user text
  //   - otherwise fall back to last committed text (agent first, then user)
  let activeText: string;
  let activeLabel: "AI" | "You";
  if (agentState === "speaking" && liveAgentText) {
    activeText = liveAgentText;
    activeLabel = "AI";
  } else if (liveUserText) {
    activeText = liveUserText;
    activeLabel = "You";
  } else if (lastAgentText) {
    activeText = lastAgentText;
    activeLabel = "AI";
  } else {
    activeText = lastUserText;
    activeLabel = "You";
  }

  if (!activeText) return null;

  return (
    <div className={styles.root}>
      <div className={styles.row}>
        <span className={`${styles.label} ${activeLabel === "AI" ? styles.agentLabel : styles.userLabel}`}>
          {activeLabel}
        </span>
        <div className={styles.rowContent}>
          <span className={activeLabel === "AI" ? styles.agentText : styles.userText}>
            {activeText}
            {activeLabel === "AI" && agentState === "speaking" && (
              <span
                className={`${styles.cursor} ${cursorOn ? "opacity-100" : "opacity-0"}`}
              />
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
