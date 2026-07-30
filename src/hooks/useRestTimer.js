import { useEffect, useState } from 'react'
import { createTimer, startTimer, pauseTimer, tick } from '../lib/timer.js'

export function useRestTimer() {
  const [timer, setTimer] = useState(null)
  const running = timer?.running ?? false
  const done = timer?.done ?? false

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setTimer((t) => (t ? tick(t) : t)), 1000)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    if (done) navigator.vibrate?.([200, 100, 200])
  }, [done])

  return {
    timer,
    startRest: (seconds) => setTimer(startTimer(createTimer(seconds))),
    pauseRest: () => setTimer((t) => (t ? pauseTimer(t) : t)),
    resumeRest: () => setTimer((t) => (t ? startTimer(t) : t)),
    dismissRest: () => setTimer(null),
  }
}
