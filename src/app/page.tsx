"use client";

import { useMemo, useState } from "react";
import {
  SessionProvider,
  useSession,
  RoomAudioRenderer,
} from "@livekit/components-react";
import { TokenSource } from "livekit-client";
import { VoiceUI } from "@/lib/components/VoiceUI";

export type AgentMode = "realtime" | "pipeline";

export default function VoicePage() {
  const [mode, setMode] = useState<AgentMode>("pipeline");

  return (
    <ModeSession key={mode} mode={mode} onModeChange={setMode} />
  );
}

function ModeSession({ mode, onModeChange }: { mode: AgentMode; onModeChange: (m: AgentMode) => void }) {
  const tokenSource = useMemo(
    () =>
      TokenSource.custom(async () => {
        const res = await fetch(
          `/api/connection-details?mode=${mode}`,
          { method: "POST" },
        );
        if (!res.ok) throw new Error(`Failed to get token: ${res.status}`);
        return res.json();
      }),
    [mode],
  );
  const session = useSession(tokenSource);

  return (
    <SessionProvider session={session}>
      <RoomAudioRenderer />
      <VoiceUI mode={mode} onModeChange={onModeChange} />
    </SessionProvider>
  );
}
