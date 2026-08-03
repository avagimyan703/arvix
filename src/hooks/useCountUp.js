import { useEffect, useState } from 'react'

/**
 * Число «наматывается» от 0 до target один раз при монтировании — короткая
 * анимация признания результата на итоговом экране, а не бесконечный тикер.
 * Уважает prefers-reduced-motion: сразу показывает итог, без анимации.
 */
export function useCountUp(target, durationMs = 600) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (target <= 0 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }

    const start = performance.now()
    let frame

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / durationMs)
      setValue(Math.round(target * progress))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs])

  return value
}
