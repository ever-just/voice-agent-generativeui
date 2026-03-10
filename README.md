# LiveKit Generative UI

A voice AI agent that renders rich, interactive UI in real time using [LiveKit](https://livekit.io) and [Thesys](https://thesys.dev). Speak to the agent and it responds with both voice and on-screen visuals — product cards, charts, comparisons, forms, and more.

## How it works

1. **Next.js frontend** connects to a LiveKit room and renders streamed UI components via the Thesys GenUI SDK. A toggle on the landing page lets you choose between two agent modes before starting a session.
2. **LiveKit voice agent** (Node/TypeScript) receives the selected mode via room metadata and configures itself accordingly. It calls tools to search the web, find images, and generate visual UI streamed back to the browser.

### Agent modes

The agent supports two modes, selectable from the UI before starting a session:

**STT→LLM→TTS (Pipeline)** chains three separate models together. Deepgram transcribes the user's voice to text, Gemini Flash reasons and calls tools, and Inworld converts the response back to audio. Each component is independently swappable. Latency is higher since each step waits for the previous one, but you get maximum control — different STT for different languages, a cheaper LLM for simple tasks, a specific TTS voice, etc. Narration during tool calls is injected programmatically via `session.say()`.

**Realtime** uses a single multimodal model (OpenAI `gpt-realtime`) that natively consumes and produces audio. There's no transcription or synthesis step — the model hears the user directly and speaks back directly. This gives significantly lower latency and better emotional nuance (tone, hesitation, emphasis). Turn detection is built in. The trade-off is less modularity — you're locked to one provider for the whole voice pipeline. Narration before tool calls is handled by prompting the model to speak before acting.

Both modes share the same `voice.Agent` subclass, the same tools (`web_search`, `search_images`, `show_ui`), and the same core system prompt. The only differences are the session configuration and how narration is wired.

### Agent structure

```
livekit-agent/src/
  index.ts              — entry point: reads mode from room metadata, creates the right session
  agent.ts              — VoiceAgent class with mode-aware tool wiring
  prompt.ts             — system prompt builder with mode-specific narration section
  tools/
    web-search.ts       — Exa web search
    image-search.ts     — Google Custom Search for images
    show-ui.ts          — streams visual UI to the browser via Thesys
    narration.ts        — withNarration wrapper (pipeline mode only)
```

## Setup

### Prerequisites

- Node.js 20+
- pnpm
- A [LiveKit Cloud](https://cloud.livekit.io) project (or self-hosted server)
- API keys for [Thesys](https://platform.thesys.dev), [Exa](https://exa.ai), and optionally Google Custom Search
- An [OpenAI](https://platform.openai.com) API key (for Realtime mode)

### Install

```bash
# Frontend
pnpm install

# Agent (separate project in livekit-agent/)
cd livekit-agent && pnpm install
```

### Configure

Copy the example env file and fill in your keys:

```bash
cp .env.example .env
```

| Variable | Required for | Description |
|---|---|---|
| `LIVEKIT_URL` | Both | Your LiveKit server URL |
| `LIVEKIT_API_KEY` | Both | LiveKit API key |
| `LIVEKIT_API_SECRET` | Both | LiveKit API secret |
| `THESYS_API_KEY` | Both | Thesys API key for visual UI generation |
| `EXA_API_KEY` | Both | Exa API key for web search |
| `OPENAI_API_KEY` | Realtime mode | OpenAI API key for the Realtime model |
| `GOOGLE_API_KEY` | Optional | Google Custom Search API key for image search |
| `GOOGLE_CSE_ID` | Optional | Google Custom Search Engine ID |

### Run

Start the Next.js dev server and the agent in separate terminals:

```bash
# Terminal 1 — frontend
pnpm dev

# Terminal 2 — voice agent
cd livekit-agent && pnpm agent dev
```

Open [http://localhost:3000](http://localhost:3000), pick a mode, and click **Start**.

### Deploy agent to LiveKit Cloud

```bash
cd livekit-agent
lk cloud auth
lk agent create --secrets-file=../.env
```

Subsequent deploys: `cd livekit-agent && lk agent deploy`

## License

MIT — see [LICENSE](src/app/LICENSE).
