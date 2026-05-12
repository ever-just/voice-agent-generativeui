import { z } from "zod";

export const description =
  "Search for images for multiple subjects in parallel. Pass one query per subject (e.g. one per product, hotel, or item). Returns markdown image syntax grouped by query.";

export const parameters = z.object({
  queries: z
    .array(z.string())
    .describe("List of image search queries, one per subject"),
  count: z
    .number()
    .optional()
    .describe("Number of images per query (default 5)"),
});

async function serperImageSearch(
  query: string,
  count: number,
): Promise<string[]> {
  const res = await fetch("https://google.serper.dev/images", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num: Math.min(count, 10) }),
  });
  if (!res.ok) throw new Error(`Serper error: ${res.status}`);
  const data = (await res.json()) as { images?: { imageUrl: string }[] };
  return (data.images ?? []).map((item) => item.imageUrl);
}

export function createExecute() {
  return async ({ queries, count }: z.infer<typeof parameters>) => {
    const n = count ?? 5;
    const results = await Promise.all(
      queries.map(async (query) => {
        try {
          const urls = await serperImageSearch(query, n);
          const markdown = urls.map((url) => `![${query}](${url})`).join("\n");
          return `${query}:\n${markdown}`;
        } catch (err) {
          console.error(`[search_images] Error for "${query}":`, err);
          return `Failed to fetch images for "${query}": ${err}`;
        }
      }),
    );
    console.log(`[search_images] ${queries.length} queries done`);
    return results.join("\n\n");
  };
}
