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

async function googleImageSearch(
  query: string,
  count: number,
): Promise<string[]> {
  const params = new URLSearchParams({
    key: process.env.GOOGLE_API_KEY ?? "",
    cx: process.env.GOOGLE_CSE_ID ?? "",
    searchType: "image",
    q: query,
    num: String(Math.min(count, 10)),
  });
  const res = await fetch(
    `https://www.googleapis.com/customsearch/v1?${params}`,
  );
  if (!res.ok) throw new Error(`Google CSE error: ${res.status}`);
  const data = (await res.json()) as { items?: { link: string }[] };
  return (data.items ?? []).map((item) => item.link);
}

export function createExecute() {
  return async ({ queries, count }: z.infer<typeof parameters>) => {
    const n = count ?? 5;
    const results = await Promise.all(
      queries.map(async (query) => {
        try {
          const urls = await googleImageSearch(query, n);
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
