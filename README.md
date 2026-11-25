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
- **Accounts** — register, sign in, reset a forgotten password and sign out, powered by Supabase. The API only answers signed-in users.
- **Pixie, the voice guide** — greets users out loud after they sign in, answers spoken or typed questions about PixelPilot, and can open pages on request. Play, pause, stop and mute controls.
- **Projects** — group sections into a website, reorder them, and export each project as one page. Saved to your account, so they follow you across devices.
- **Refine with AI, edit, delete** — describe a change ("make the headline bigger") and the existing design updates, with Undo; or edit the code by hand; or delete it.
- **Shareable pages** — each screen has its own URL (`/#/generate`, `/#/saved`, …), so refreshing keeps your place.

## Tech stack

| Part | Tools |
| --- | --- |
| Frontend | React 19, Vite, lucide-react |
| Backend | Node.js, Express 5, express-rate-limit |
| AI | Google Gemini (`@google/genai`), default model `gemini-3.8-flash` |
| Accounts | Supabase Auth (`@supabase/supabase-js`) |
| Voice | Browser Web Speech API (speech synthesis + recognition) |

## Run it locally

You need Node.js 20 or newer and a free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

```bash
git clone https://github.com/Omisore-Ruth/pixelpilot-ai.git
cd pixelpilot-ai
npm install
cp .env.example .env      # then paste your GEMINI_API_KEY into .env
```

### Set up Supabase (accounts)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings → API** and copy the **Project URL** and the **anon / publishable key** into `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Go to **Authentication → URL Configuration**. Set **Site URL** to `http://localhost:5173` while developing (your live URL once deployed) and add both URLs under **Redirect URLs**. Confirmation and password-reset emails link back here.
4. Optional: under **Authentication → Providers → Email** you can turn off "Confirm email" while testing so new accounts can sign in straight away.

5. **Create the database tables** (for saved components and projects): go to **SQL Editor → New query**, paste the whole of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**. Until you do, the app still works but saves projects in the browser only, and it moves them online automatically once the tables exist.

Start the backend and frontend in two terminals:

```bash
npm run server   # API on http://localhost:5000 (server/index.js → server/app.js)
npm run dev      # app on http://localhost:5173
```

## Environment variables

See [`.env.example`](.env.example) for the full list.

| Variable | Where | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | backend | **Required.** Your Gemini API key. Never commit this. |
| `GEMINI_MODEL` | backend | Optional. Defaults to `gemini-3.8-flash`. |
| `GEMINI_FALLBACK_MODELS` | backend | Optional, comma-separated. Tried in order when the main model is busy (503), rate-limited (429) or unavailable (404). Defaults to `gemini-3.6-flash,gemini-3.5-flash-lite`. |
| `FRONTEND_URL` | backend | Your deployed frontend URL(s), comma-separated, for CORS. |
| `RATE_LIMIT_PER_MINUTE` | backend | Optional. Generations per visitor per minute (default 10). |
| `VITE_API_URL` | frontend | URL of your deployed backend. Defaults to `http://localhost:5000`. |
| `VITE_SUPABASE_URL` | frontend (+ backend locally) | Supabase Project URL. |
| `VITE_SUPABASE_ANON_KEY` | frontend (+ backend locally) | Supabase anon / publishable key (safe to expose; never use the service-role key). |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | backend (when deployed) | Same values as above, so the API can check logins. |

## Deploying to Vercel

The website and the backend deploy together as **one Vercel project**: Vite builds the site, and `api/index.js` runs the Express backend as a serverless function under `/api` (see `vercel.json`).

1. On [vercel.com](https://vercel.com), click **Add New → Project** and import this GitHub repo. Vercel detects **Vite**; leave the build settings as they are.
2. Under **Environment Variables**, add:
   | Name | Value |
   | --- | --- |
   | `GEMINI_API_KEY` | your Gemini key |
   | `GEMINI_MODEL` | e.g. `gemini-3.5-flash-lite` (optional) |
   | `VITE_SUPABASE_URL` | your Supabase Project URL |
   | `VITE_SUPABASE_ANON_KEY` | your Supabase publishable/anon key |

   **Don't add `VITE_API_URL`** on Vercel: the site and API share one address.
3. Click **Deploy**. When it's live, open `https://YOUR-SITE.vercel.app/api/health`. It should say the backend is running, with `"gemini": true` and `"auth": true`.
4. In Supabase, go to **Authentication → URL Configuration**, set **Site URL** to your Vercel address, and add it under **Redirect URLs** (keep `http://localhost:5173` there too for local development).

Every push to `master` redeploys automatically.

## Security notes

- `.env` is git-ignored — keep your API key out of the repo.
- Saved components and projects are protected by Supabase Row Level Security, so each user can only read and change their own.
- `/api/generate`, `/api/refine` and `/api/assistant` require a valid Supabase login token, and rate limits apply per user.
- The `/api/generate` endpoint is rate-limited per IP and only accepts known option values, so your Gemini quota can't be drained or the prompt tampered with through the dropdown fields.
- Generated code is previewed in a sandboxed `<iframe>` with no access to the app.

## Project structure

```
server/app.js            Express API (Gemini, auth checks, rate limits)
server/index.js          Runs the API locally on port 5000
api/index.js             Runs the same API on Vercel
src/App.jsx              Shows login screen or the workspace
src/pages/               One file per screen
src/components/          Sidebar, prompt form, preview panel
src/lib/                 API client, preview/export helpers, safe localStorage
src/data/                Option lists, starter components and presets
src/hooks/                URL-based page navigation, auth session
src/Workspace.jsx          The signed-in app
src/components/Pixie.jsx   Voice assistant
```

## Roadmap

- "Refine" follow-up edits on a generated component
- Live preview for React output
- Streaming responses

## Author

Built by **Omisore Ruth**.
