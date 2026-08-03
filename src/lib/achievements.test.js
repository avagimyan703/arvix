import { describe, it, expect } from 'vitest'
import { currentStreak, bestWeights, bestSession, newRecords, milestoneReached } from './achievements.js'

describe('currentStreak', () => {
  it('на пустой истории — 0', () => {
    expect(currentStreak([])).toBe(0)
  })

  it('одна тренировка — серия 1', () => {
    expect(currentStreak([{ date: '2026-07-30' }])).toBe(1)
  })

  it('считает подряд идущие тренировки в обычном ритме вт/чт/вс', () => {
    const h = [
      { date: '2026-08-02' }, // вс
      { date: '2026-07-30' }, // чт
      { date: '2026-07-28' }, // вт
    ]
    expect(currentStreak(h)).toBe(3)
  })

  it('останавливается на разрыве длиннее допустимого, не считая дальше', () => {
    const h = [
      { date: '2026-08-10' },
      { date: '2026-08-08' },
      { date: '2026-07-01' }, // разрыв больше месяца
      { date: '2026-06-29' },
    ]
    expect(currentStreak(h)).toBe(2)
  })
})

describe('bestWeights', () => {
  it('берёт максимум по каждому упражнению за всю историю', () => {
    const h = [
      { exercises: { squat: { weight: 100 }, row: { weight: 40 } } },
      { exercises: { squat: { weight: 95 } } },
      { exercises: { squat: { weight: 110 } } },
    ]
    expect(bestWeights(h)).toEqual({ squat: 110, row: 40 })
  })

  it('игнорирует записи без веса', () => {
    const h = [{ exercises: { curl: { weight: null } } }]
    expect(bestWeights(h)).toEqual({})
  })

  it('на пустой истории отдаёт пустой объект', () => {
    expect(bestWeights([])).toEqual({})
  })
})

describe('bestSession', () => {
  const history = [
    { date: '2026-07-30', exercises: { squat: { weight: 100, reps: [8, 8, 7] } } },
    { date: '2026-07-23', exercises: { squat: { weight: 110, reps: [6, 6, 5] } } },
    { date: '2026-07-16', exercises: { squat: { weight: 90, reps: [8, 8, 8] } } },
  ]

  it('находит сессию с максимальным весом, а не самую свежую', () => {
    expect(bestSession(history, 'squat')).toEqual({ weight: 110, reps: [6, 6, 5], date: '2026-07-23' })
  })

  it('без единой записи по упражнению — null', () => {
    expect(bestSession(history, 'bench-press')).toBeNull()
  })

  it('игнорирует записи без веса', () => {
    const h = [{ date: '2026-07-30', exercises: { curl: { weight: null, reps: [10] } } }]
    expect(bestSession(h, 'curl')).toBeNull()
  })

  it('на пустой истории — null', () => {
    expect(bestSession([], 'squat')).toBeNull()
  })
})

describe('newRecords', () => {
  const history = [{ exercises: { squat: { weight: 100 }, row: { weight: 40 } } }]

  it('засчитывает упражнение, где вес сессии выше исторического максимума', () => {
    const reps = { squat: [8, 8, 7] }
    const weights = { squat: 105 }
    expect(newRecords(history, reps, weights)).toEqual(['squat'])
  })

  it('не засчитывает равный или меньший вес', () => {
    const reps = { squat: [8, 8, 7] }
    expect(newRecords(history, reps, { squat: 100 })).toEqual([])
    expect(newRecords(history, reps, { squat: 90 })).toEqual([])
  })

  it('первый раз на упражнении рекордом не считается', () => {
    const reps = { 'bench-press': [8, 8, 7] }
    const weights = { 'bench-press': 60 }
    expect(newRecords(history, reps, weights)).toEqual([])
  })

  it('упражнение без единого закрытого подхода не участвует', () => {
    const reps = { squat: [null, null, null] }
    expect(newRecords(history, reps, { squat: 200 })).toEqual([])
  })

  it('на пустой истории рекордов не бывает', () => {
    const reps = { squat: [8, 8, 7] }
    expect(newRecords([], reps, { squat: 200 })).toEqual([])
  })
})

describe('milestoneReached', () => {
  it('засчитывает ранние круглые цифры: 1, 10, 25, 50, 100', () => {
    expect(milestoneReached([])).toBe(1)
    expect(milestoneReached(Array(9).fill({}))).toBe(10)
    expect(milestoneReached(Array(24).fill({}))).toBe(25)
    expect(milestoneReached(Array(49).fill({}))).toBe(50)
    expect(milestoneReached(Array(99).fill({}))).toBe(100)
  })

  it('после 100 — каждые 50, без верхней границы', () => {
    expect(milestoneReached(Array(149).fill({}))).toBe(150)
    expect(milestoneReached(Array(199).fill({}))).toBe(200)
    expect(milestoneReached(Array(299).fill({}))).toBe(300)
    // 5 лет по 3 тренировки в неделю — это около 780
    expect(milestoneReached(Array(999).fill({}))).toBe(1000)
  })

  it('на некруглой цифре — null', () => {
    expect(milestoneReached(Array(5).fill({}))).toBeNull()
    expect(milestoneReached(Array(11).fill({}))).toBeNull()
    expect(milestoneReached(Array(119).fill({}))).toBeNull()
  })
})
