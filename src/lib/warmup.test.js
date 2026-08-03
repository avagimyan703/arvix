import { describe, it, expect } from 'vitest'
import { warmupSets } from './warmup.js'

describe('warmupSets', () => {
  it('считает 40/60/80% от рабочего веса с округлением к шагу', () => {
    expect(warmupSets(100, 2.5)).toEqual([
      { weight: 40, reps: 8 },
      { weight: 60, reps: 5 },
      { weight: 80, reps: 3 },
    ])
  })

  it('округляет к шагу, а не отдаёт дробные килограммы', () => {
    // 82.5 * 0.4 = 33 → к шагу 2.5 это ровно 32.5 или 35 в зависимости от округления
    const s = warmupSets(82.5, 2.5)
    expect(s[0].weight % 2.5).toBe(0)
  })

  it('пустой или нулевой рабочий вес — пустой список', () => {
    expect(warmupSets(null, 2.5)).toEqual([])
    expect(warmupSets(0, 2.5)).toEqual([])
  })

  it('отбрасывает подходы, округлившиеся до нуля при очень малом весе', () => {
    expect(warmupSets(1, 2.5)).toEqual([])
  })
})
