// Vercel serverless function: GET /api/spotify
//
// Returns what is playing on Fernando's Spotify right now, or the last track
// he played. The secrets live in Vercel env vars, never in the browser:
//   SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN
// (get the refresh token once with scripts/spotify-auth.mjs)

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const API = 'https://api.spotify.com/v1'

// warm serverless instances reuse this; a cold start just fetches a new token
let cached = { token: null, exp: 0 }

async function getAccessToken() {
  if (cached.token && Date.now() < cached.exp - 30_000) return cached.token

  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } =
    process.env
  if (!id || !secret || !refresh) return null

  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
  })
  if (!r.ok) throw new Error(`token endpoint ${r.status}`)
  const j = await r.json()
  cached = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 }
  return cached.token
}

// Keep only what the page needs. Works for tracks and podcast episodes.
export function shape(item) {
  const images = (item.album?.images ?? item.images ?? []).slice().sort((a, b) => a.width - b.width)
  const art = (images.find((i) => i.width >= 128) ?? images[images.length - 1])?.url ?? null
  return {
    title: item.name,
    artist: item.artists?.map((a) => a.name).join(', ') ?? item.show?.publisher ?? item.show?.name ?? '',
    album: item.album?.name ?? item.show?.name ?? '',
    art,
    url: item.external_urls?.spotify ?? null,
  }
}

export default async function handler(req, res) {
  if (req.method && req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  try {
    const token = await getAccessToken()
    if (!token) {
      res.setHeader('Cache-Control', 'no-store')
      return res.status(503).json({ error: 'not_configured' })
    }
    const headers = { Authorization: `Bearer ${token}` }

    // 1. is something playing right now? (204 = nothing active)
    const cur = await fetch(`${API}/me/player/currently-playing?additional_types=track,episode`, { headers })
    if (cur.status === 200) {
      const d = await cur.json()
      if (d?.is_playing && d.item) {
        res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=60')
        return res.status(200).json({
          isPlaying: true,
          ...shape(d.item),
          progressMs: d.progress_ms ?? 0,
          durationMs: d.item.duration_ms ?? 0,
        })
      }
    }

    // 2. otherwise: last thing he played
    const rec = await fetch(`${API}/me/player/recently-played?limit=1`, { headers })
    if (rec.ok) {
      const d = await rec.json()
      const it = d.items?.[0]
      if (it?.track) {
        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
        return res.status(200).json({ isPlaying: false, ...shape(it.track), playedAt: it.played_at })
      }
    }

    res.setHeader('Cache-Control', 'public, s-maxage=60')
    return res.status(200).json({ isPlaying: false, empty: true })
  } catch (err) {
    console.error('spotify:', err.message)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(502).json({ error: 'upstream' })
  }
}
