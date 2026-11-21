// Pure helpers for the extra effects (no DOM, easy to test).

// ---- stars -----------------------------------------------------------------
// star: x,y in [-1,1] (direction), z in (0,1] (1 = far, 0 = at the camera)
export function makeStars(n, rnd = Math.random) {
  return Array.from({ length: n }, () => ({ x: (rnd() - 0.5) * 2, y: (rnd() - 0.5) * 2, z: rnd() * 0.95 + 0.05 }))
}
export function stepStar(s, dz, rnd = Math.random) {
  s.z -= dz
  if (s.z <= 0.02) {
    s.x = (rnd() - 0.5) * 2
    s.y = (rnd() - 0.5) * 2
    s.z = 1
  }
}
export function projectStar(s, cx, cy, scale) {
  const k = 1 / s.z
  return {
    px: cx + s.x * k * scale * 0.35,
    py: cy + s.y * k * scale * 0.35,
    size: Math.min(3.2, 0.6 + (1 - s.z) * 2.6),
  }
}

// ---- falling tokens --------------------------------------------------------
export const WORDS = [
  'RAG', 'LoRA', 'agent', 'vLLM', 'embedding', 'tokens', 'prompt', 'tool_call', 'LangGraph',
  'Qdrant', 'MCP', 'eval', 'rerank', 'chunk', 'softmax', '<eos>', 'fine-tune', 'guardrail',
  'handoff', 'context', 'logits', 'QLoRA', 'trace',
]
export function makeDrop(vw, vh, rnd = Math.random, atTop = true) {
  return {
    x: rnd() * Math.max(1, vw - 90),
    y: atTop ? -rnd() * vh * 0.3 : rnd() * vh,
    speed: 25 + rnd() * 55, // px per second
    word: WORDS[Math.floor(rnd() * WORDS.length)],
    tint: Math.floor(rnd() * 4),
  }
}
export function stepDrop(d, dt, vw, vh, rnd = Math.random) {
  d.y += d.speed * dt
  if (d.y > vh + 20) Object.assign(d, makeDrop(vw, vh, rnd, true))
}

// ---- perspective grid ------------------------------------------------------
// row depths in [0,1): 0 = at the horizon, ->1 = at the bottom of the screen.
// offset in [0,1) slides the rows toward the viewer; at offset 1 it equals offset 0 (seamless loop).
export function gridRows(n, offset) {
  const out = []
  for (let i = 0; i < n; i++) out.push((i + offset) / n)
  return out
}
