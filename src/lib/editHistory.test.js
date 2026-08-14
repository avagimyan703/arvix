import { describe, it, expect } from 'vitest'
import { rebuildLastSession } from './history.js'
import { deleteSession, setSessionWeight, setSessionRep } from './workout.js'

// История всегда от новых к старым — так её строит appendSession.
const history = [
  {
    date: '2026-08-12',
    dayId: 'thu',
    startedAt: null,
    finishedAt: null,
    note: null,
    exercises: { 'back-squat': { weight: 100, reps: [8, 8, 7] } },
    athletic: [],
  },
  {
    date: '2026-08-10',
    dayId: 'tue',
    startedAt: null,
    finishedAt: null,
    note: null,
    exercises: {
      'back-squat': { weight: 95, reps: [8, 8, 8] },
      'bench-press': { weight: 60, reps: [6, 6] },
    },
    athletic: [],
  },
]

const state = { version: 1, current: null, history, lastSession: rebuildLastSession(history) }

describe('rebuildLastSession', () => {
  it('берёт для каждого упражнения самую свежую запись', () => {
    expect(rebuildLastSession(history)).toEqual({
      'back-squat': { weight: 100, reps: [8, 8, 7], date: '2026-08-12' },
      'bench-press': { weight: 60, reps: [6, 6], date: '2026-08-10' },
    })
  })

  it('на пустой истории даёт пустой кеш', () => {
    expect(rebuildLastSession([])).toEqual({})
  })

  it('пропускает упражнения, где не закрыт ни один подход', () => {
    // Такие в историю не попадают через appendSession, но могут появиться
    // после правки: обнулил все подходы, а запись осталась.
    const withEmpty = [
      { ...history[0], exercises: { 'back-squat': { weight: 100, reps: [null, null, null] } } },
      history[1],
    ]
    expect(rebuildLastSession(withEmpty)['back-squat']).toEqual({
      weight: 95, reps: [8, 8, 8], date: '2026-08-10',
    })
  })
})

describe('deleteSession', () => {
  it('убирает запись из истории', () => {
    const next = deleteSession(state, 0)
    expect(next.history).toHaveLength(1)
    expect(next.history[0].date).toBe('2026-08-10')
  })

  it('откатывает подсказку по весу к предыдущей тренировке', () => {
    // Главное здесь: lastSession — кеш, собранный при завершении. Если его
    // не пересобрать, удалённая тренировка продолжит кормить прогрессию.
    const next = deleteSession(state, 0)
    expect(next.lastSession['back-squat']).toEqual({
      weight: 95, reps: [8, 8, 8], date: '2026-08-10',
    })
  })

  it('забывает упражнение, которое встречалось только в удалённой записи', () => {
    const next = deleteSession(state, 1)
    expect(next.lastSession['bench-press']).toBeUndefined()
    expect(next.lastSession['back-squat']).toEqual({
      weight: 100, reps: [8, 8, 7], date: '2026-08-12',
    })
  })

  it('не трогает текущую тренировку', () => {
    const running = { ...state, current: { dayId: 'sun', reps: {}, weights: {}, athletic: {} } }
    expect(deleteSession(running, 0).current).toBe(running.current)
  })

  it('на несуществующем индексе ничего не меняет', () => {
    expect(deleteSession(state, 9)).toBe(state)
    expect(deleteSession(state, -1)).toBe(state)
  })
})

describe('setSessionWeight', () => {
  it('правит вес в записи', () => {
    const next = setSessionWeight(state, 0, 'back-squat', 102.5)
    expect(next.history[0].exercises['back-squat'].weight).toBe(102.5)
  })

  it('тянет за собой подсказку, если правили самую свежую запись', () => {
    const next = setSessionWeight(state, 0, 'back-squat', 102.5)
    expect(next.lastSession['back-squat'].weight).toBe(102.5)
  })

  it('правка старой записи не меняет подсказку от свежей', () => {
    const next = setSessionWeight(state, 1, 'back-squat', 1)
    expect(next.lastSession['back-squat'].weight).toBe(100)
  })

  it('не создаёт упражнение, которого в записи не было', () => {
    expect(setSessionWeight(state, 0, 'pull-up', 10)).toBe(state)
  })

  it('оставляет остальные записи нетронутыми', () => {
    const next = setSessionWeight(state, 0, 'back-squat', 102.5)
    expect(next.history[1]).toBe(state.history[1])
  })
})

describe('setSessionRep', () => {
  it('правит один подход', () => {
    const next = setSessionRep(state, 0, 'back-squat', 2, 8)
    expect(next.history[0].exercises['back-squat'].reps).toEqual([8, 8, 8])
  })

  it('пустое значение стирает подход, а не пишет ноль', () => {
    const next = setSessionRep(state, 0, 'back-squat', 1, null)
    expect(next.history[0].exercises['back-squat'].reps).toEqual([8, null, 7])
  })

  it('тянет за собой подсказку по весу', () => {
    const next = setSessionRep(state, 0, 'back-squat', 2, 10)
    expect(next.lastSession['back-squat'].reps).toEqual([8, 8, 10])
  })

  it('на несуществующем подходе ничего не меняет', () => {
    expect(setSessionRep(state, 0, 'back-squat', 5, 8)).toBe(state)
  })
})
