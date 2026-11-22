import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// In production /api/* runs as Vercel functions. In `npm run dev` this serves
// api/spotify.js locally (reads SPOTIFY_* from .env.local), so no Vercel CLI needed.
function localApi(env) {
  return {
    name: 'local-api',
    configureServer(server) {
      Object.assign(process.env, env)
      server.middlewares.use('/api/spotify', async (req, res) => {
        res.status = (code) => ((res.statusCode = code), res)
        res.json = (body) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }
        try {
          const mod = await server.ssrLoadModule('/api/spotify.js')
          await mod.default(req, res)
        } catch (e) {
          console.error(e)
          res.status(500).json({ error: 'dev_api_failed' })
        }
      })
    },
  }
}

// Link previews need an absolute image URL. Set SITE_URL (e.g. https://fernando-santos.com)
// in Vercel; otherwise fall back to Vercel's own production URL, otherwise a relative path.
function siteUrl(env) {
  const v = env.SITE_URL || process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || ''
  if (!v) return ''
  return (/^https?:/.test(v) ? v : 'https://' + v).replace(/\/$/, '')
}

function ogUrls(env) {
  const base = siteUrl(env)
  return {
    name: 'og-urls',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', base),
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), localApi(loadEnv(mode, process.cwd(), '')), ogUrls(loadEnv(mode, process.cwd(), ''))],
  base: './',
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
}))
