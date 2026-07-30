export function createTimer(seconds) {
  return { total: seconds, remaining: seconds, running: false, done: false }
}

export function startTimer(t) {
  return { ...t, running: true, done: false }
}

export function pauseTimer(t) {
  return { ...t, running: false }
}

export function tick(t) {
  if (!t.running) return t
  const remaining = t.remaining - 1
  if (remaining <= 0) return { ...t, remaining: 0, running: false, done: true }
  return { ...t, remaining }
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
