import { readPalette } from './color.js'
import { loop } from './loop.js'
import { makeDrop, stepDrop } from './logic.js'

export function startTokens(canvas, { animate, onSlow }) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  canvas.width = vw
  canvas.height = vh
  const ctx = canvas.getContext('2d')
  const { accents } = readPalette()
  const css = [1, 2, 3, 0].map((i) => {
    const [r, g, b] = accents[i % accents.length]
    return `rgb(${r},${g},${b})`
  })

  const n = Math.min(48, Math.max(10, Math.round(vw / 40))) // capped
  const drops = Array.from({ length: n }, () => makeDrop(vw, vh, Math.random, false))

  const draw = () => {
    ctx.clearRect(0, 0, vw, vh)
    ctx.font = '14px "Courier New", Courier, monospace'
    ctx.textBaseline = 'top'
    for (const d of drops) {
      ctx.globalAlpha = Math.max(0, Math.min(1, d.y / 90, (vh - d.y) / 140 + 0.2))
      ctx.fillStyle = css[d.tint]
      ctx.fillText(d.word, d.x, d.y)
    }
    ctx.globalAlpha = 1
  }

  draw()
  if (!animate) return () => {}
  let prev = 0
  return loop({
    fps: 24,
    onSlow,
    tick: (now) => {
      const dt = prev ? Math.min(0.1, (now - prev) / 1000) : 0.04
      prev = now
      for (const d of drops) stepDrop(d, dt, vw, vh)
      draw()
    },
  })
}
