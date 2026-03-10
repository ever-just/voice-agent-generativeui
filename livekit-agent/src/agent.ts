import { voice, llm } from "@livekit/agents";
import { Exa } from "exa-js";
import { ShowUITool } from "./tools/show-ui.js";
import { withNarration } from "./tools/narration.js";
import * as webSearch from "./tools/web-search.js";
import * as imageSearch from "./tools/image-search.js";
import { buildPrompt } from "./prompt.js";

export type AgentMode = "realtime" | "pipeline";

type AgentSession = InstanceType<typeof voice.AgentSession>;

export function createVoiceAgent(
  room: any,
  mode: AgentMode,
  session?: AgentSession,
) {
  const exaClient = new Exa(process.env.EXA_API_KEY);
  return new VoiceAgent(room, mode, exaClient, session);
}

function makeTool(
  mode: AgentMode,
  session: AgentSession | undefined,
  name: string,
  config: {
    description: string;
    parameters: any;
    execute: (params: any) => Promise<string>;
  },
) {
  if (mode === "pipeline" && session) {
    return withNarration(session, name, config);
  }
  return llm.tool(config);
}

class VoiceAgent extends voice.Agent {
  constructor(
    room: any,
    mode: AgentMode,
    exaClient: Exa,
    session?: AgentSession,
  ) {
    const showUI = new ShowUITool(room);

    super({
      instructions: buildPrompt(mode),
      tools: {
        show_ui: showUI.tool,

        web_search: makeTool(mode, session, "web_search", {
          description: webSearch.description,
          parameters: webSearch.parameters,
          execute: webSearch.createExecute(exaClient),
        }),

        search_images: makeTool(mode, session, "search_images", {
          description: imageSearch.description,
          parameters: imageSearch.parameters,
          execute: imageSearch.createExecute(),
        }),
      },
    });
  }
}
