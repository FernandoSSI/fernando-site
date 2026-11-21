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

export default defineConfig(({ mode }) => ({
  plugins: [react(), localApi(loadEnv(mode, process.cwd(), ''))],
  base: './',
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
}))
