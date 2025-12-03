# Deploy Guide — Frontend (Vercel) + Backend (Render/Railway)

This guide shows a recommended deployment strategy: static frontend on Vercel and Node backend on a host that supports long-running processes (Render, Railway, Fly, DigitalOcean App, Azure Web App, etc.).

## 1) Frontend — Vercel (recommended)

1. Push your repo to GitHub/GitLab/Bitbucket and connect it in Vercel.
2. Vercel will auto-detect a Vite/React project. Set the following build settings if needed:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Environment variables (optional):
   - `VITE_API_URL` — URL to your backend API (e.g. `https://api.example.com`)

Notes:
- We added `vercel.json` to force a static-build deployment and `.vercelignore` to exclude the `server/` folder.
- If your frontend should call a hosted API, configure `VITE_API_URL` in the Vercel project settings.

## 2) Backend — Render / Railway / Fly / DigitalOcean App

Requirements:
- Node.js 18+ recommended
- MongoDB (Atlas) connection string in `MONGODB_URI`

Basic steps for Render (similar for other hosts):
1. Create a new Web Service and connect your repository.
2. Build command: `npm ci && npm run build` (optional)
3. Start command: `npm run server` or `node server/index.js`
4. Set environment variables in the host service:
   - `MONGODB_URI` — your MongoDB connection string
   - `PORT` — optional (the host usually provides)
   - `USE_MOCK_DATA` — set to `true` for demo mode (no DB)
5. For scheduled scraping/analysis, either enable the host's cron feature (Render has cron jobs) or use an external scheduler (GitHub Actions) hitting the backend's endpoints.

Caveats:
- `puppeteer` may require extra buildpacks or a Docker image with Chromium. Consider using a hosted scraping service or run scraping in a separate container with Chrome installed.
- `node-cron` requires a continuously-running process; serverless platforms like Vercel are unsuitable for cron tasks.

## 3) Quick demo (Frontend-only)
If you just want to host a demo without backend, you can build the frontend and let it use mock data (the app uses mock data when backend is not reachable). Ensure `USE_MOCK_DATA=true` is set locally for development, but note Vercel static hosting won't run server mocks.

## 4) Update `src/services/api.js`
The frontend reads `import.meta.env.VITE_API_URL` at build time. If you set `VITE_API_URL` in Vercel, the frontend will call the hosted backend. If left empty, it defaults to `/api` and will expect a proxied backend (useful for local dev).

## 5) Troubleshooting
- Large bundle warning: The Vite build produced a large JS bundle. Consider code-splitting using dynamic `import()` or adjusting `build.rollupOptions.output.manualChunks`.
- Puppeteer errors: If your backend fails due to Chromium, prefer deploying backend as Docker service with Chrome installed or remove puppeteer scraping and use a lightweight API-based data source.

---
If you want, I can:
- Add `VITE_API_URL` to the Vercel project settings for you (requires Vercel access).
- Prepare a Render or Railway setup guide with exact env var values and an example `service.yaml` or start command.
- Convert a small subset of endpoints into Vercel Serverless functions (if you prefer single-host on Vercel). 
