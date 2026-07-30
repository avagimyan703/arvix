import { describe, it, expect } from 'vitest'
import { createTimer, startTimer, pauseTimer, tick, formatTime } from './timer.js'

describe('таймер', () => {
  it('создаётся остановленным на полном времени', () => {
    expect(createTimer(180)).toEqual({ total: 180, remaining: 180, running: false, done: false })
  })

  it('запуск включает отсчёт', () => {
    expect(startTimer(createTimer(60)).running).toBe(true)
  })

  it('тик уменьшает остаток на секунду', () => {
    const t = tick(startTimer(createTimer(60)))
    expect(t.remaining).toBe(59)
  })

  it('на паузе тик ничего не меняет', () => {
    const paused = pauseTimer(startTimer(createTimer(60)))
    expect(tick(paused)).toEqual(paused)
  })

  it('в нуле останавливается и помечается завершённым', () => {
    let t = startTimer(createTimer(2))
    t = tick(t)
    t = tick(t)
    expect(t).toMatchObject({ remaining: 0, running: false, done: true })
  })

  it('тик после нуля не уводит остаток в минус', () => {
    let t = startTimer(createTimer(1))
    t = tick(t)
    t = tick(t)
    expect(t.remaining).toBe(0)
  })

  it('пауза и повторный запуск сохраняют остаток', () => {
    let t = tick(startTimer(createTimer(60)))
    t = startTimer(pauseTimer(t))
    expect(t).toMatchObject({ remaining: 59, running: true })
  })

  it('форматирует время', () => {
    expect(formatTime(180)).toBe('3:00')
    expect(formatTime(45)).toBe('0:45')
    expect(formatTime(5)).toBe('0:05')
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(125)).toBe('2:05')
  })
})
