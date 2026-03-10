import { voice, llm } from "@livekit/agents";
import { z } from "zod";

type AgentSession = InstanceType<typeof voice.AgentSession>;

export function withNarration<TShape extends z.ZodRawShape>(
  session: AgentSession,
  name: string,
  config: {
    description: string;
    parameters: z.ZodObject<TShape>;
    execute: (params: z.infer<z.ZodObject<TShape>>) => Promise<string>;
  },
) {
  return llm.tool({
    description: config.description,
    parameters: config.parameters.extend({
      narration: z
        .string()
        .describe(
          `A short natural sentence spoken aloud while the tool runs. DO NOT START WITH "I'm ..."`,
        ),
    }),
    execute: async ({ narration, ...rest }) => {
      console.log(
        `Calling tool [${name}] with narration "[${narration}]" and args: ${JSON.stringify(rest)}`,
      );
      session.say(narration!);
      return config.execute(rest as z.infer<z.ZodObject<TShape>>);
    },
  });
}
