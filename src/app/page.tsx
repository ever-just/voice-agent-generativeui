"use client";

import { useMemo, useRef, useState } from "react";
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
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const tokenSource = useMemo(
    () =>
      TokenSource.custom(async () => {
        const res = await fetch(
          `/api/connection-details?mode=${modeRef.current}`,
          { method: "POST" },
        );
        if (!res.ok) throw new Error(`Failed to get token: ${res.status}`);
        return res.json();
      }),
    [],
  );
  const session = useSession(tokenSource);

  return (
    <SessionProvider session={session}>
      <RoomAudioRenderer />
      <VoiceUI mode={mode} onModeChange={setMode} />
    </SessionProvider>
  );
}
