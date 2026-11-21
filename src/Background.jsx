import { useCallback, useEffect, useRef, useState } from 'react'
import C from './content.json'
import { useT } from './i18n.jsx'
import { startPlasma } from './fx/plasma.js'
import { startLife } from './fx/life.js'
import { startStars } from './fx/stars.js'
import { startTokens } from './fx/tokens.js'
import { startGrid } from './fx/grid.js'

const IDS = C.fx.map((f) => f.id)
const STARTERS = {
  plasma: startPlasma,
  life: startLife,
  stars: startStars,
  tokens: startTokens,
  grid: startGrid,
}

// Default is always "none": nobody sees an animation they didn't ask for.
// Order: explicit ?bg= link, then "this browser was too slow" (stays off), then the saved choice.
function initialFx() {
  const m = /[?&]bg=([a-z]+)/.exec(location.search)
  if (m && IDS.includes(m[1])) return m[1]
  try {
    if (localStorage.getItem('bg-slow') === '1') return 'none'
    const s = localStorage.getItem('bg')
    if (IDS.includes(s)) return s
  } catch {}
  return 'none'
}

export function useFx() {
  const [fx, setFxState] = useState(initialFx)
  const [slow, setSlow] = useState(false)

  // user picked something: remember it and forget any "too slow" flag
  const setFx = useCallback((v) => {
    try {
      localStorage.setItem('bg', v)
      localStorage.removeItem('bg-slow')
    } catch {}
    setSlow(false)
    setFxState(v)
  }, [])

  // the effect measured itself and gave up: turn off, but don't overwrite the user's saved choice
  const onSlow = useCallback(() => {
    try {
      localStorage.setItem('bg-slow', '1')
    } catch {}
    setSlow(true)
    setFxState('none')
  }, [])

  return { fx, setFx, slow, onSlow }
}

// The canvas sits behind everything (see .fx in styles.css).
export function BackgroundFx({ fx, onSlow }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const start = STARTERS[fx]
    if (!canvas || !start) return

    // people who asked their system for less motion get one still frame
    const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let stop = start(canvas, { animate, onSlow })
    const restart = () => {
      stop()
      stop = start(canvas, { animate, onSlow })
    }

    // resize (debounced) and theme changes re-read the size/colours
    let timer
    const onResize = () => {
      clearTimeout(timer)
      timer = setTimeout(restart, 200)
    }
    window.addEventListener('resize', onResize)
    const mo = new MutationObserver(restart)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', onResize)
      mo.disconnect()
      stop()
    }
  }, [fx, onSlow])

  return <canvas ref={ref} className="fx" data-fx={fx} aria-hidden="true" hidden={fx === 'none'} />
}

export function FxSelect({ fx, setFx, slow }) {
  const t = useT()
  return (
    <label className="themebar">
      {t(C.ui.fx)}:
      <select value={fx} onChange={(e) => setFx(e.target.value)}>
        {C.fx.map((o) => (
          <option key={o.id} value={o.id}>
            {t(o.name)}
          </option>
        ))}
      </select>
      {slow && <span className="fxnote"> {t(C.ui.fxslow)}</span>}
    </label>
  )
}
