import { useCallback, useRef } from 'react'

const START_DELAY_MS = 450
const REPEAT_MS = 110

/**
 * Тап делает один шаг. Удержание — повторяет шаг, пока палец не отпустят,
 * чтобы сменить вес на большую величину не постукиванием, а одним жестом.
 * onStep должен сам читать свежие значения (например, через ref), а не
 * замыкать их по значению: один и тот же таймер живёт несколько тиков.
 */
export function useHoldStep(onStep) {
  const timeout = useRef(null)
  const interval = useRef(null)
  const repeated = useRef(false)

  const stop = useCallback(() => {
    clearTimeout(timeout.current)
    clearInterval(interval.current)
  }, [])

  const onPointerDown = useCallback(() => {
    repeated.current = false
    timeout.current = setTimeout(() => {
      repeated.current = true
      onStep()
      interval.current = setInterval(onStep, REPEAT_MS)
    }, START_DELAY_MS)
  }, [onStep])

  const onClick = useCallback(() => {
    stop()
    if (repeated.current) {
      repeated.current = false
      return
    }
    onStep()
  }, [onStep, stop])

  return {
    onPointerDown,
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onClick,
  }
}
