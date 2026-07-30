import { describe, it, expect } from 'vitest'
import { suggestWeight } from './progression.js'

const block = { sets: 3, reps: [5, 8] }

describe('suggestWeight', () => {
  it('все подходы на верхней границе — предлагает прибавку', () => {
    expect(suggestWeight({ weight: 60, reps: [8, 8, 8] }, block, 2.5, 60)).toBe(62.5)
  })

  it('повторов больше верхней границы — тоже прибавка', () => {
    expect(suggestWeight({ weight: 60, reps: [9, 8, 10] }, block, 2.5, 60)).toBe(62.5)
  })

  it('один подход недобрал — молчит', () => {
    expect(suggestWeight({ weight: 60, reps: [8, 8, 7] }, block, 2.5, 60)).toBeNull()
  })

  it('незакрытый подход — молчит', () => {
    expect(suggestWeight({ weight: 60, reps: [8, 8, null] }, block, 2.5, 60)).toBeNull()
  })

  it('подходов записано меньше планового числа — молчит', () => {
    expect(suggestWeight({ weight: 60, reps: [8, 8] }, block, 2.5, 60)).toBeNull()
  })

  it('вес сегодня ниже прошлого — молчит', () => {
    expect(suggestWeight({ weight: 60, reps: [8, 8, 8] }, block, 2.5, 55)).toBeNull()
  })

  it('вес сегодня ещё не выставлен — подсказка есть', () => {
    expect(suggestWeight({ weight: 60, reps: [8, 8, 8] }, block, 2.5, null)).toBe(62.5)
  })

  it('прошлой сессии нет — молчит', () => {
    expect(suggestWeight(undefined, block, 2.5, 60)).toBeNull()
  })

  it('шаг веса берётся из аргумента', () => {
    expect(suggestWeight({ weight: 100, reps: [12, 12], date: '' }, { sets: 2, reps: [10, 12] }, 5, 100)).toBe(105)
  })

  it('прошлый вес не записан — молчит', () => {
    expect(suggestWeight({ weight: null, reps: [8, 8, 8] }, block, 2.5, 60)).toBeNull()
  })
})
