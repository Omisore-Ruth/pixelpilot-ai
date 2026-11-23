# PixelPilot AI

Describe a website section in plain English and PixelPilot generates it for you — a responsive navbar, hero, feature cards, pricing, contact form, footer or a full one-page site — in **Bootstrap 5**, **HTML & CSS**, or **React**. Preview it live on desktop and mobile, copy the code, and export your favourite sections together as a single ready-to-host `index.html`.

<!-- Add a screenshot or GIF here: ![PixelPilot AI screenshot](docs/screenshot.png) -->

**Live demo:** _add your deployed link here_

## Features

- **AI component generator** — pick a component type, framework, design style and brand colour, then describe what you want.
- **Live sandboxed preview** with a desktop/mobile toggle, plus a code view with one-click copy.
- **Saved library** — every result is saved in your browser so you can come back to it.
- **Combined export** — tick the sections you want and download them as one page, automatically arranged nav → hero → content → contact → footer.
- **Starter presets** to get going quickly.
- **Shareable pages** — each screen has its own URL (`/#/generate`, `/#/saved`, …), so refreshing keeps your place.

## Tech stack

| Part | Tools |
| --- | --- |
| Frontend | React 19, Vite, lucide-react |
| Backend | Node.js, Express 5, express-rate-limit |
| AI | Google Gemini (`@google/genai`), default model `gemini-2.5-flash` |

## Run it locally

You need Node.js 20 or newer and a free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

```bash
git clone https://github.com/Omisore-Ruth/pixelpilot-ai.git
cd pixelpilot-ai
npm install
cp .env.example .env      # then paste your GEMINI_API_KEY into .env
```

Start the backend and frontend in two terminals:

```bash
npm run server   # API on http://localhost:5000
npm run dev      # app on http://localhost:5173
```

## Environment variables

See [`.env.example`](.env.example) for the full list.

| Variable | Where | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | backend | **Required.** Your Gemini API key. Never commit this. |
| `GEMINI_MODEL` | backend | Optional. Defaults to `gemini-2.5-flash`. |
| `FRONTEND_URL` | backend | Your deployed frontend URL(s), comma-separated, for CORS. |
| `RATE_LIMIT_PER_MINUTE` | backend | Optional. Generations per visitor per minute (default 10). |
| `VITE_API_URL` | frontend | URL of your deployed backend. Defaults to `http://localhost:5000`. |

## Deploying

1. **Backend → Render** (or Railway): create a Web Service from this repo with start command `npm run server`. Add `GEMINI_API_KEY` and `FRONTEND_URL` in the service's environment settings.
2. **Frontend → Netlify** (or Vercel): build command `npm run build`, publish directory `dist`. Set `VITE_API_URL` to your backend URL.

> Free Render services sleep after inactivity, so the first generation after a while can take ~30 seconds. The app tells users to wait and retry if that happens.

## Security notes

- `.env` is git-ignored — keep your API key out of the repo.
- The `/api/generate` endpoint is rate-limited per IP and only accepts known option values, so your Gemini quota can't be drained or the prompt tampered with through the dropdown fields.
- Generated code is previewed in a sandboxed `<iframe>` with no access to the app.

## Project structure

```
server/index.js          Express API that calls Gemini
src/App.jsx              App state and page switching
src/pages/               One file per screen
src/components/          Sidebar, prompt form, preview panel
src/lib/                 API client, preview/export helpers, safe localStorage
src/data/                Option lists, starter components and presets
src/hooks/useHashRoute.js  URL-based page navigation
```

## Roadmap

- "Refine" follow-up edits on a generated component
- Live preview for React output
- Streaming responses

## Author

Built by **Omisore Ruth**.
