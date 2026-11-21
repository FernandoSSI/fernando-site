import { useEffect, useState } from 'react'
import C from './content.json'
import { useLang, useT } from './i18n.jsx'
import { Panel } from './components.jsx'

const POLL_MS = 30_000

// `npm run dev` + ?spotify=mock shows fake data (stripped from the production build).
const MOCK = import.meta.env.DEV
  ? {
      isPlaying: true,
      title: 'Example Song Title That Is Quite Long',
      artist: 'Some Artist, Another One',
      album: 'Album',
      art:
        'data:image/svg+xml,' +
        encodeURIComponent(
          "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 4'><rect width='4' height='4' fill='#222'/><rect width='2' height='2' fill='#ff00cc'/><rect x='2' y='2' width='2' height='2' fill='#00e5ff'/></svg>",
        ),
      url: 'https://open.spotify.com',
    }
  : null

async function load() {
  if (MOCK && location.search.includes('spotify=mock')) return MOCK
  try {
    const r = await fetch('/api/spotify')
    if (!r.ok) return null // not configured / upstream down: panel just doesn't show
    return await r.json()
  } catch {
    return null
  }
}

function ago(iso, lang) {
  const secs = Math.round((new Date(iso).getTime() - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat(lang === 'pt' ? 'pt-BR' : 'en', { numeric: 'auto' })
  const steps = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, s] of steps) {
    if (Math.abs(secs) >= s) return rtf.format(Math.round(secs / s), unit)
  }
  return rtf.format(0, 'second')
}

export default function Spotify() {
  const { lang } = useLang()
  const t = useT()
  const [data, setData] = useState(null)

  useEffect(() => {
    let alive = true
    const tick = async () => {
      if (document.visibilityState !== 'visible') return
      const d = await load()
      if (alive) setData(d)
    }
    tick()
    const id = setInterval(tick, POLL_MS)
    document.addEventListener('visibilitychange', tick)
    return () => {
      alive = false
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  if (!data || data.empty || !data.title) return null

  const S = C.spotify
  return (
    <Panel color="mag" title={S.title} tdClass="mono spotify">
      <div className="status">
        {data.isPlaying ? (
          <>
            <span className="eq" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>{' '}
            {t(S.playing)}
          </>
        ) : (
          <>
            {t(S.last)}
            {data.playedAt && <> &middot; {ago(data.playedAt, lang)}</>}
          </>
        )}
      </div>
      {data.art && (
        <a href={data.url || undefined}>
          <img className="cover" src={data.art} alt={data.album} width="150" height="150" />
        </a>
      )}
      <div className="track">
        {data.url ? <a href={data.url}>{data.title}</a> : data.title}
      </div>
      <div className="artist">{data.artist}</div>
    </Panel>
  )
}
