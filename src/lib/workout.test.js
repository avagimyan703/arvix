import { describe, it, expect } from 'vitest'
import {
  startWorkout, setWeight, closeSet, clearSet, toggleAthletic, finishWorkout, cancelWorkout,
  isBlockDone, sessionProgress,
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

  it('заранее заполняет вес известными прошлыми результатами', () => {
    const withHistory = {
      ...empty,
      lastSession: {
        'back-squat': { weight: 100, reps: [8, 8, 7], date: 'x' },
        'leg-press': { weight: 120, reps: [10, 10], date: 'x' },
      },
    }
    const s = startWorkout(withHistory, 'thu', 'now', ['back-squat', 'leg-press', 'lateral-raise'])
    expect(s.current.weights).toEqual({ 'back-squat': 100, 'leg-press': 120 })
  })

  it('упражнение без прошлого результата остаётся незаполненным', () => {
    const s = startWorkout(empty, 'thu', 'now', ['back-squat'])
    expect(s.current.weights).toEqual({})
  })

  it('повторный вызов для уже идущей тренировки того же дня не сбрасывает прогресс', () => {
    let s = startWorkout(empty, 'thu', '2026-07-30T18:00:00.000Z')
    s = closeSet(s, 'back-squat', 0, 3, 8)
    const again = startWorkout(s, 'thu', '2026-07-30T18:05:00.000Z')
    expect(again).toBe(s)
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

describe('cancelWorkout', () => {
  it('очищает current, не трогая историю и последние результаты', () => {
    const withHistory = {
      ...empty,
      lastSession: { 'bench-press': { weight: 60, reps: [8, 8, 8], date: '2026-07-23' } },
      history: [{ date: '2026-07-23', dayId: 'tue', exercises: {}, athletic: [] }],
    }
    let s = startWorkout(withHistory, 'thu', 'now')
    s = closeSet(s, 'back-squat', 0, 3, 8)
    s = setWeight(s, 'back-squat', 100)

    const cancelled = cancelWorkout(s)

    expect(cancelled.current).toBeNull()
    expect(cancelled.lastSession).toEqual(withHistory.lastSession)
    expect(cancelled.history).toEqual(withHistory.history)
  })

  it('без начатой тренировки ничего не делает', () => {
    expect(cancelWorkout(empty)).toEqual(empty)
  })
})

describe('isBlockDone', () => {
  const block = { sets: 3 }

  it('все подходы закрыты числами — true', () => {
    expect(isBlockDone(block, [8, 8, 7])).toBe(true)
  })

  it('хотя бы один подход пуст — false', () => {
    expect(isBlockDone(block, [8, null, 7])).toBe(false)
  })

  it('подходов ещё нет вовсе — false', () => {
    expect(isBlockDone(block, undefined)).toBe(false)
  })

  it('число подходов не совпадает с планом — false', () => {
    expect(isBlockDone(block, [8, 8])).toBe(false)
  })
})

describe('sessionProgress', () => {
  const blocks = [
    { exercise: 'back-squat', sets: 3 },
    { exercise: 'leg-press', sets: 2 },
  ]

  it('без тренировки — нули, но план виден', () => {
    expect(sessionProgress(blocks, null)).toEqual({ doneSets: 0, totalSets: 5, doneCount: 0, totalCount: 2 })
  })

  it('считает частично сделанную тренировку', () => {
    const current = { reps: { 'back-squat': [8, 8, null], 'leg-press': [12, 11] } }
    expect(sessionProgress(blocks, current)).toEqual({ doneSets: 4, totalSets: 5, doneCount: 1, totalCount: 2 })
  })

  it('упражнение, к которому не притронулись, не в счёт', () => {
    const current = { reps: { 'back-squat': [8, 8, 7] } }
    expect(sessionProgress(blocks, current)).toEqual({ doneSets: 3, totalSets: 5, doneCount: 1, totalCount: 2 })
  })
})
