import { describe, it, expect } from 'vitest'
import {
  startWorkout, setWeight, closeSet, clearSet, toggleAthletic, finishWorkout,
} from './workout.js'

const empty = { version: 1, lastSession: {}, current: null }
const started = startWorkout(empty, 'thu', '2026-07-30T18:00:00.000Z')

describe('startWorkout', () => {
  it('заводит текущую тренировку', () => {
    expect(started.current).toEqual({
      dayId: 'thu',
      startedAt: '2026-07-30T18:00:00.000Z',
      reps: {},
      weights: {},
      athletic: {},
    })
  })

  it('поверх незавершённой тренировки начинает с чистого листа', () => {
    const dirty = closeSet(started, 'back-squat', 0, 3, 8)
    const again = startWorkout(dirty, 'tue', '2026-08-01T10:00:00.000Z')
    expect(again.current.reps).toEqual({})
    expect(again.current.dayId).toBe('tue')
  })

  it('не трогает прошлые сессии', () => {
    const withHistory = { ...empty, lastSession: { 'back-squat': { weight: 80, reps: [8], date: 'x' } } }
    expect(startWorkout(withHistory, 'thu', 'now').lastSession).toEqual(withHistory.lastSession)
  })
})

describe('closeSet', () => {
  it('пишет повторы в нужный индекс, остальные остаются пустыми', () => {
    const s = closeSet(started, 'back-squat', 1, 3, 8)
    expect(s.current.reps['back-squat']).toEqual([null, 8, null])
  })

  it('повторное закрытие перезаписывает значение', () => {
    let s = closeSet(started, 'back-squat', 0, 3, 8)
    s = closeSet(s, 'back-squat', 0, 3, 6)
    expect(s.current.reps['back-squat']).toEqual([6, null, null])
  })

  it('без начатой тренировки ничего не делает', () => {
    expect(closeSet(empty, 'back-squat', 0, 3, 8)).toEqual(empty)
  })
})

describe('clearSet', () => {
  it('возвращает подход в незакрытое состояние', () => {
    let s = closeSet(started, 'back-squat', 0, 3, 8)
    s = clearSet(s, 'back-squat', 0, 3)
    expect(s.current.reps['back-squat']).toEqual([null, null, null])
  })
})

describe('setWeight', () => {
  it('запоминает рабочий вес', () => {
    expect(setWeight(started, 'back-squat', 82.5).current.weights).toEqual({ 'back-squat': 82.5 })
  })
})

describe('toggleAthletic', () => {
  it('отмечает и снимает отметку', () => {
    let s = toggleAthletic(started, 'jump-rope')
    expect(s.current.athletic['jump-rope']).toBe(true)
    s = toggleAthletic(s, 'jump-rope')
    expect(s.current.athletic['jump-rope']).toBeUndefined()
  })
})

describe('finishWorkout', () => {
  it('переносит сделанное в историю и закрывает тренировку', () => {
    let s = closeSet(started, 'back-squat', 0, 3, 8)
    s = closeSet(s, 'back-squat', 1, 3, 8)
    s = closeSet(s, 'back-squat', 2, 3, 7)
    s = setWeight(s, 'back-squat', 80)
    const done = finishWorkout(s, '2026-07-30')

    expect(done.current).toBeNull()
    expect(done.lastSession['back-squat']).toEqual({
      weight: 80, reps: [8, 8, 7], date: '2026-07-30',
    })
  })

  it('упражнения без единого закрытого подхода в историю не попадают', () => {
    const s = closeSet(started, 'back-squat', 0, 3, 8)
    const done = finishWorkout(s, '2026-07-30')
    expect(Object.keys(done.lastSession)).toEqual(['back-squat'])
  })

  it('нетронутое упражнение не затирает прошлый результат', () => {
    const withHistory = {
      ...empty,
      lastSession: { 'bench-press': { weight: 60, reps: [8, 8, 8], date: '2026-07-23' } },
    }
    let s = startWorkout(withHistory, 'tue', 'now')
    s = closeSet(s, 'db-row', 0, 3, 10)
    const done = finishWorkout(s, '2026-07-30')
    expect(done.lastSession['bench-press']).toEqual({ weight: 60, reps: [8, 8, 8], date: '2026-07-23' })
  })

  it('без начатой тренировки ничего не делает', () => {
    expect(finishWorkout(empty, '2026-07-30')).toEqual(empty)
  })
})
