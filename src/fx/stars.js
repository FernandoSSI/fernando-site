import { readPalette } from './color.js'
import { loop } from './loop.js'
import { makeStars, stepStar, projectStar } from './logic.js'

export function startStars(canvas, { animate, onSlow }) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  canvas.width = vw
  canvas.height = vh
  const ctx = canvas.getContext('2d')
  const { accents } = readPalette()
  const css = accents.map(([r, g, b]) => `rgb(${r},${g},${b})`)

  const n = Math.min(260, Math.max(60, Math.round((vw * vh) / 6000))) // capped
  const stars = makeStars(n)
  const scale = Math.max(vw, vh)

  // the vanishing point drifts a little toward the mouse (parallax)
  let mx = 0, my = 0, tx = 0, ty = 0
  const onMove = (e) => {
    tx = (e.clientX / vw - 0.5) * 70
    ty = (e.clientY / vh - 0.5) * 45
  }

  const draw = () => {
    ctx.clearRect(0, 0, vw, vh)
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i]
      const { px, py, size } = projectStar(s, vw / 2 + mx, vh / 2 + my, scale)
      if (px < -4 || py < -4 || px > vw + 4 || py > vh + 4) continue
      ctx.globalAlpha = Math.min(1, 1.15 - s.z * 0.8)
      ctx.fillStyle = css[i % css.length]
      ctx.fillRect(px, py, size, size)
    }
    ctx.globalAlpha = 1
  }

  draw()
  if (!animate) return () => {}
  window.addEventListener('pointermove', onMove)
  const stop = loop({
    fps: 30,
    onSlow,
    tick: () => {
      mx += (tx - mx) * 0.05
      my += (ty - my) * 0.05
      for (const s of stars) stepStar(s, 0.0035)
      draw()
    },
  })
  return () => {
    stop()
    window.removeEventListener('pointermove', onMove)
  }
}
