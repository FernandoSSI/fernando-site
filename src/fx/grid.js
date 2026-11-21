import { readPalette } from './color.js'
import { loop } from './loop.js'
import { gridRows } from './logic.js'

const ROWS = 16

export function startGrid(canvas, { animate, onSlow }) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  canvas.width = vw
  canvas.height = vh
  const ctx = canvas.getContext('2d')
  const { accents } = readPalette()
  const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`
  const line = rgb(accents[0])
  const glow = rgb(accents[1 % accents.length])

  const horizon = Math.round(vh * 0.52)
  const cx = vw / 2

  const draw = (offset) => {
    ctx.clearRect(0, 0, vw, vh)

    // soft glow at the horizon
    const g = ctx.createLinearGradient(0, horizon - 140, 0, horizon + 6)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, glow)
    ctx.globalAlpha = 0.5
    ctx.fillStyle = g
    ctx.fillRect(0, horizon - 140, vw, 146)

    ctx.strokeStyle = line
    ctx.lineWidth = 1.5

    // horizontal rows rushing toward the viewer (closer = brighter)
    for (const t of gridRows(ROWS, offset)) {
      const y = horizon + (vh - horizon) * Math.pow(t, 2.2)
      ctx.globalAlpha = 0.12 + 0.88 * t
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(vw, y)
      ctx.stroke()
    }
    // vertical lines converging on the vanishing point
    ctx.globalAlpha = 0.55
    for (let k = -18; k <= 18; k++) {
      ctx.beginPath()
      ctx.moveTo(cx + k * vw * 0.018, horizon)
      ctx.lineTo(cx + k * vw * 0.12, vh)
      ctx.stroke()
    }
    // the horizon itself
    ctx.strokeStyle = glow
    ctx.globalAlpha = 0.9
    ctx.beginPath()
    ctx.moveTo(0, horizon)
    ctx.lineTo(vw, horizon)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  draw(0)
  if (!animate) return () => {}
  let offset = 0
  let prev = 0
  return loop({
    fps: 24,
    onSlow,
    tick: (now) => {
      const dt = prev ? Math.min(0.1, (now - prev) / 1000) : 0.04
      prev = now
      offset = (offset + dt * 0.7) % 1
      draw(offset)
    },
  })
}
