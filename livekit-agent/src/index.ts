import {
  type JobContext,
  ServerOptions,
  cli,
  defineAgent,
  inference,
  voice,
} from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import * as silero from "@livekit/agents-plugin-silero";
import { fileURLToPath } from "node:url";
import { type AgentMode, createVoiceAgent } from "./agent.js";

async function createPipelineSession() {
  const vad = await silero.VAD.load();
  return new voice.AgentSession({
    stt: new inference.STT({ model: "deepgram/nova-3", language: "multi" }),
    llm: new inference.LLM({ model: "google/gemini-3-flash" }),
    tts: new inference.TTS({ model: "inworld/inworld-tts-1", voice: "Ashley" }),
    vad,
    voiceOptions: {
      allowInterruptions: true,
      maxToolSteps: 10,
      minInterruptionDuration: 0.5,
      useTtsAlignedTranscript: true,
    },
  });
}

function createRealtimeSession() {
  return new voice.AgentSession({
    llm: new openai.realtime.RealtimeModel({
      model: "gpt-realtime",
      voice: "marin",
    }),
  });
}

export default defineAgent({
  entry: async (ctx: JobContext) => {
    const roomMeta = ctx.job.room?.metadata ?? "";
    const mode: AgentMode = roomMeta === "pipeline" ? "pipeline" : "realtime";
    console.log(`[entry] Starting in ${mode} mode (metadata: "${roomMeta}")`);

    const session =
      mode === "pipeline"
        ? await createPipelineSession()
        : createRealtimeSession();

    session.on(voice.AgentSessionEventTypes.Error, (err: unknown) => {
      console.error("[session] Error:", err);
    });

    session.on(voice.AgentSessionEventTypes.Close, () => {
      console.log("[session] Closed");
    });

    try {
      await session.start({
        agent: createVoiceAgent(
          ctx.room,
          mode,
          mode === "pipeline" ? session : undefined,
        ),
        room: ctx.room,
      });
    } catch (err) {
      console.error("[entry] Failed to start session:", err);
      throw err;
    }

    try {
      await ctx.connect();
    } catch (err) {
      console.error("[entry] Failed to connect to room:", err);
      throw err;
    }

    try {
      session.generateReply({ instructions: "Greet the user briefly." });
    } catch (err) {
      console.error("[entry] Failed to generate greeting:", err);
    }
  },
});

cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: "voice-genui-agent",
  }),
);
