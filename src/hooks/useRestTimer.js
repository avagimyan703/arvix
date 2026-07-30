import { useCallback, useEffect, useRef, useState } from 'react'
import { createTimer, startTimer, pauseTimer, remaining, isDone } from '../lib/timer.js'

export function useRestTimer() {
  const [timer, setTimer] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  const vibratedFor = useRef(null)

  const running = timer?.running ?? false

  // Тик только для перерисовки — сам остаток вычисляется из метки времени,
  // поэтому пропущенные тики ничего не ломают. 250 мс, чтобы цифра менялась
  // без заметного запаздывания.
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [running])

  // Возврат из фона: пересчитываем сразу, не дожидаясь очередного тика.
  useEffect(() => {
    const sync = () => setNow(Date.now())
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('focus', sync)
    return () => {
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  const left = timer ? remaining(timer, now) : 0
  const done = timer ? isDone(timer, now) : false

  // Вибрируем один раз на таймер: метка времени окончания служит его личностью.
  useEffect(() => {
    if (!done || !timer) return
    if (vibratedFor.current === timer.endsAt) return
    vibratedFor.current = timer.endsAt
    navigator.vibrate?.([200, 100, 200])
  }, [done, timer])

  const startRest = useCallback((seconds) => {
    const t = Date.now()
    setNow(t)
    setTimer(startTimer(createTimer(seconds), t))
  }, [])

  const pauseRest = useCallback(() => {
    const t = Date.now()
    setNow(t)
    setTimer((prev) => (prev ? pauseTimer(prev, t) : prev))
  }, [])

  const resumeRest = useCallback(() => {
    const t = Date.now()
    setNow(t)
    setTimer((prev) => (prev ? startTimer(prev, t) : prev))
  }, [])

  const dismissRest = useCallback(() => setTimer(null), [])

  return {
    // Компоненту отдаём готовые числа, чтобы он не знал про метки времени.
    timer: timer ? { total: timer.total, remaining: left, running: timer.running, done } : null,
    startRest,
    pauseRest,
    resumeRest,
    dismissRest,
  }
}
