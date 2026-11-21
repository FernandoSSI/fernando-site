// One-off helper: gets the refresh token the /api/spotify function needs.
//
// 1. https://developer.spotify.com/dashboard -> Create app
//    Redirect URI (exactly):  http://127.0.0.1:8888/callback
//    (Spotify no longer accepts "localhost", use the 127.0.0.1 address)
// 2. In YOUR terminal (not a shared one, the token is printed):
//      SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/spotify-auth.mjs
// 3. Open the URL it prints, accept, and copy the refresh token into Vercel
//    (Settings > Environment Variables) as SPOTIFY_REFRESH_TOKEN.
//
// Scopes are read-only: currently playing + recently played.

import http from 'node:http'
import crypto from 'node:crypto'

const id = process.env.SPOTIFY_CLIENT_ID
const secret = process.env.SPOTIFY_CLIENT_SECRET
if (!id || !secret) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.')
  process.exit(1)
}

const PORT = 8888
const REDIRECT = `http://127.0.0.1:${PORT}/callback`
const SCOPE = 'user-read-currently-playing user-read-recently-played'
const state = crypto.randomBytes(8).toString('hex')

const authUrl =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({ response_type: 'code', client_id: id, scope: SCOPE, redirect_uri: REDIRECT, state })

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`)
  if (url.pathname !== '/callback') {
    res.writeHead(404).end()
    return
  }
  if (url.searchParams.get('state') !== state || !url.searchParams.get('code')) {
    res.writeHead(400).end('Bad state or missing code.')
    return
  }
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: url.searchParams.get('code'),
      redirect_uri: REDIRECT,
    }),
  })
  const j = await r.json()
  if (!r.ok || !j.refresh_token) {
    res.writeHead(500).end('Spotify said: ' + JSON.stringify(j))
    console.error('Failed:', j)
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' }).end('Done. You can close this tab and go back to the terminal.')
    console.log('\nSPOTIFY_REFRESH_TOKEN=' + j.refresh_token + '\n')
  }
  server.close()
})

server.listen(PORT, '127.0.0.1', () => {
  console.log('Open this URL in your browser and accept:\n\n' + authUrl + '\n')
})
