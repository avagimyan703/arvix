import { describe, it, expect } from 'vitest'
import { platesFor, BAR_WEIGHT } from './plates.js'

describe('platesFor', () => {
  it('раскладывает вес на блины по стороне, от крупных к мелким', () => {
    // (100-20)/2 = 40 на сторону: 25 + 15
    expect(platesFor(100)).toEqual({ perSide: [25, 15], remainder: 0 })
  })

  it('смешивает номиналы, когда одних крупных не хватает', () => {
    // (97.5-20)/2 = 38.75 на сторону: 25 + 10 + 2.5 + 1.25
    expect(platesFor(97.5)).toEqual({ perSide: [25, 10, 2.5, 1.25], remainder: 0 })
  })

  it('вес равен или меньше грифа — блинов нет', () => {
    expect(platesFor(20)).toBeNull()
    expect(platesFor(15)).toBeNull()
  })

  it('пустой вес — null', () => {
    expect(platesFor(null)).toBeNull()
  })

  it('свой вес грифа', () => {
    expect(platesFor(50, 15)).toEqual({ perSide: [15, 2.5], remainder: 0 })
  })

  it('остаток меньше минимального блина уходит в remainder, а не теряется', () => {
    const r = platesFor(100.5)
    // (100.5-20)/2 = 40.25 на сторону: 25+15=40, остаток 0.25*2=0.5
    expect(r.perSide).toEqual([25, 15])
    expect(r.remainder).toBeCloseTo(0.5)
  })

  it('BAR_WEIGHT — стандартный олимпийский гриф', () => {
    expect(BAR_WEIGHT).toBe(20)
  })
})
