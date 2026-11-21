// A frame loop with the safety measures every effect shares:
//  - capped frame rate (not the display's 60/144 Hz)
//  - stops completely while the tab is hidden
//  - if frames keep costing too much, gives up and calls onSlow()
const SLOW_MS = 14 // a frame that costs more than this counts as "slow"
const SLOW_STRIKES = 25 // this many net slow frames in a row-ish => bail out

export function loop({ fps, tick, onSlow }) {
  const interval = 1000 / fps
  let raf = 0
  let last = 0
  let strikes = 0
  let stopped = false

  const frame = (now) => {
    if (stopped) return
    raf = requestAnimationFrame(frame)
    if (now - last < interval) return
    last = now
    const t0 = performance.now()
    tick(now)
    const cost = performance.now() - t0
    strikes = cost > SLOW_MS ? strikes + 1 : Math.max(0, strikes - 1)
    if (strikes >= SLOW_STRIKES) {
      stop()
      onSlow?.()
    }
  }

  const onVisibility = () => {
    cancelAnimationFrame(raf)
    if (!document.hidden && !stopped) {
      last = 0
      raf = requestAnimationFrame(frame)
    }
  }

  function stop() {
    stopped = true
    cancelAnimationFrame(raf)
    document.removeEventListener('visibilitychange', onVisibility)
  }

  document.addEventListener('visibilitychange', onVisibility)
  if (!document.hidden) raf = requestAnimationFrame(frame)
  return stop
}
