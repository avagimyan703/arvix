import { describe, it, expect } from 'vitest'
import { createTimer, startTimer, pauseTimer, remaining, isDone, formatTime, extendTimer } from './timer.js'

// Время передаётся аргументом, а не берётся из Date.now() — иначе таймер
// нельзя ни протестировать, ни починить: он обязан считать по метке времени,
// а не по числу тиков.
const T0 = 1_700_000_000_000

describe('таймер', () => {
  it('создаётся остановленным на полном времени', () => {
    const t = createTimer(180)
    expect(t.total).toBe(180)
    expect(t.running).toBe(false)
    expect(remaining(t, T0)).toBe(180)
  })

  it('после запуска остаток считается от метки времени', () => {
    const t = startTimer(createTimer(180), T0)
    expect(remaining(t, T0)).toBe(180)
    expect(remaining(t, T0 + 1000)).toBe(179)
    expect(remaining(t, T0 + 60_000)).toBe(120)
  })

  it('ГЛАВНОЕ: пропущенное время не теряется', () => {
    // Экран погас на две минуты, интервалы в фоне не тикали.
    // Остаток обязан быть посчитан по часам, а не по числу тиков.
    const t = startTimer(createTimer(180), T0)
    expect(remaining(t, T0 + 120_000)).toBe(60)
  })

  it('в нуле останавливается и не уходит в минус', () => {
    const t = startTimer(createTimer(5), T0)
    expect(remaining(t, T0 + 5000)).toBe(0)
    expect(remaining(t, T0 + 60_000)).toBe(0)
  })

  it('завершённость определяется по времени', () => {
    const t = startTimer(createTimer(5), T0)
    expect(isDone(t, T0 + 4000)).toBe(false)
    expect(isDone(t, T0 + 5000)).toBe(true)
    expect(isDone(t, T0 + 99_000)).toBe(true)
  })

  it('незапущенный таймер завершённым не считается', () => {
    expect(isDone(createTimer(5), T0)).toBe(false)
  })

  it('пауза замораживает остаток, время дальше не течёт', () => {
    let t = startTimer(createTimer(180), T0)
    t = pauseTimer(t, T0 + 60_000)
    expect(remaining(t, T0 + 60_000)).toBe(120)
    expect(remaining(t, T0 + 600_000)).toBe(120)
    expect(t.running).toBe(false)
  })

  it('повторный запуск продолжает с замороженного остатка', () => {
    let t = startTimer(createTimer(180), T0)
    t = pauseTimer(t, T0 + 60_000)
    t = startTimer(t, T0 + 600_000)
    expect(remaining(t, T0 + 600_000)).toBe(120)
    expect(remaining(t, T0 + 610_000)).toBe(110)
  })

  it('пауза на завершённом таймере оставляет ноль', () => {
    let t = startTimer(createTimer(5), T0)
    t = pauseTimer(t, T0 + 10_000)
    expect(remaining(t, T0 + 10_000)).toBe(0)
  })

  it('продление запущенного таймера сдвигает метку окончания', () => {
    const t = extendTimer(startTimer(createTimer(60), T0), 30)
    expect(remaining(t, T0)).toBe(90)
    expect(t.total).toBe(90)
  })

  it('продление таймера на паузе прибавляет к замороженному остатку', () => {
    let t = startTimer(createTimer(60), T0)
    t = pauseTimer(t, T0 + 40_000)
    t = extendTimer(t, 30)
    expect(remaining(t, T0 + 40_000)).toBe(50)
    expect(t.running).toBe(false)
  })

  it('продление уже завершённого таймера возвращает его к отсчёту', () => {
    const t = extendTimer(startTimer(createTimer(5), T0), 20)
    expect(isDone(t, T0 + 5000)).toBe(false)
    expect(remaining(t, T0 + 5000)).toBe(20)
  })

  it('форматирует время', () => {
    expect(formatTime(180)).toBe('3:00')
    expect(formatTime(45)).toBe('0:45')
    expect(formatTime(5)).toBe('0:05')
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(125)).toBe('2:05')
  })
})
