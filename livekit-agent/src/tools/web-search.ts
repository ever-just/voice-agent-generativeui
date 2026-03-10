import { z } from "zod";
import type { Exa } from "exa-js";

export const description =
  "Search the web for real-time information, current events, facts, prices, or anything that may have changed recently.";

export const parameters = z.object({
  query: z.string().describe("The search query"),
});

export function createExecute(exaClient: Exa) {
  return async ({ query }: z.infer<typeof parameters>) => {
    try {
      const results = await exaClient.searchAndContents(query, {
        type: "auto",
        numResults: 5,
        text: { maxCharacters: 1000 },
      });

      const formatted = results.results
        .map(
          (r: any, i: number) =>
            `[${i + 1}] ${r.title}\n${r.url}\n${r.text?.slice(0, 500) ?? ""}`,
        )
        .join("\n\n");

      console.log(`[web_search] ${results.results.length} results`);
      return formatted || "No results found.";
    } catch (err) {
      console.error("[web_search] Error:", err);
      return "Web search failed. Answer from your knowledge instead.";
    }
  };
}
