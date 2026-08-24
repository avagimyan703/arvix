import { describe, it, expect } from 'vitest'
import { startOfWeek, workoutsPerWeek, durationTrend } from './charts.js'

const d = (s) => new Date(`${s}T12:00:00`)

describe('startOfWeek', () => {
  it('понедельник остаётся собой', () => {
    // 2026-08-17 — понедельник
    expect(startOfWeek(d('2026-08-17')).getDate()).toBe(17)
  })

  it('воскресенье относится к начавшейся неделе, а не к следующей', () => {
    // 2026-08-23 — воскресенье, его понедельник это 17-е
    expect(startOfWeek(d('2026-08-23')).getDate()).toBe(17)
  })

  it('обнуляет время, чтобы недели сравнивались как даты', () => {
    const s = startOfWeek(d('2026-08-19'))
    expect([s.getHours(), s.getMinutes(), s.getSeconds()]).toEqual([0, 0, 0])
  })
})

describe('workoutsPerWeek', () => {
  const history = [
    { date: '2026-08-20' }, // неделя 17-го
    { date: '2026-08-18' }, // неделя 17-го
    { date: '2026-08-11' }, // неделя 10-го
    { date: '2026-06-01' }, // давно, за окном
  ]

  it('считает тренировки по календарным неделям', () => {
    const r = workoutsPerWeek(history, 2, d('2026-08-20'))
    expect(r).toEqual([
      { start: '2026-08-10', count: 1 },
      { start: '2026-08-17', count: 2 },
    ])
  })

  it('идёт от старых недель к новым', () => {
    const r = workoutsPerWeek(history, 3, d('2026-08-20'))
    expect(r.map((b) => b.start)).toEqual(['2026-08-03', '2026-08-10', '2026-08-17'])
  })

  it('пустая неделя остаётся нулём, а не выпадает из ряда', () => {
    const r = workoutsPerWeek([{ date: '2026-08-20' }], 3, d('2026-08-20'))
    expect(r.map((b) => b.count)).toEqual([0, 0, 1])
  })

  it('старые тренировки за окном не попадают в первую неделю', () => {
    const r = workoutsPerWeek(history, 2, d('2026-08-20'))
    expect(r.reduce((s, b) => s + b.count, 0)).toBe(3)
  })

  it('бессмысленное окно даёт пустой ряд', () => {
    expect(workoutsPerWeek(history, 0, d('2026-08-20'))).toEqual([])
  })
})

describe('durationTrend', () => {
  const s = (startedAt, finishedAt) => ({ startedAt, finishedAt })

  it('считает минуты и разворачивает от старых к новым', () => {
    const history = [
      s('2026-08-20T10:00:00Z', '2026-08-20T11:00:00Z'), // свежая, 60
      s('2026-08-18T10:00:00Z', '2026-08-18T10:45:00Z'), // 45
    ]
    expect(durationTrend(history)).toEqual([45, 60])
  })

  it('записи без времени окончания пропускаются, а не считаются нулём', () => {
    const history = [
      s('2026-08-20T10:00:00Z', '2026-08-20T11:00:00Z'),
      { startedAt: '2026-08-18T10:00:00Z', finishedAt: null },
    ]
    expect(durationTrend(history)).toEqual([60])
  })

  it('берёт не больше limit последних', () => {
    const history = Array.from({ length: 20 }, (_, i) =>
      s('2026-08-20T10:00:00Z', `2026-08-20T10:${String(10 + i).padStart(2, '0')}:00Z`))
    expect(durationTrend(history, 5)).toHaveLength(5)
  })

  it('пустая история — пустой ряд', () => {
    expect(durationTrend([])).toEqual([])
  })
})
