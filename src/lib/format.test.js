import { describe, it, expect } from 'vitest'
import { formatWeight, stepWeight } from './format.js'

describe('formatWeight', () => {
  it('дробную часть отделяет запятой', () => {
    expect(formatWeight(102.5)).toBe('102,5')
    expect(formatWeight(2.5)).toBe('2,5')
  })

  it('целые числа выводит без дробной части', () => {
    expect(formatWeight(100)).toBe('100')
    expect(formatWeight(0)).toBe('0')
  })

  it('отсутствующий вес превращает в пустую строку', () => {
    expect(formatWeight(null)).toBe('')
    expect(formatWeight(undefined)).toBe('')
    expect(formatWeight(NaN)).toBe('')
  })
})

describe('stepWeight', () => {
  it('от пустого поля без подсказки отталкивается от нуля', () => {
    expect(stepWeight(null, null, 2.5, 1)).toBe(2.5)
  })

  it('от пустого поля с подсказкой «в прошлый раз» стартует от неё', () => {
    expect(stepWeight(null, 60, 2.5, 1)).toBe(62.5)
  })

  it('уже введённое значение важнее подсказки', () => {
    expect(stepWeight(60, 80, 2.5, 1)).toBe(62.5)
  })

  it('минус уменьшает вес', () => {
    expect(stepWeight(60, null, 2.5, -1)).toBe(57.5)
  })

  it('не уходит в отрицательные значения', () => {
    expect(stepWeight(0, null, 2.5, -1)).toBe(0)
    expect(stepWeight(2, null, 2.5, -1)).toBe(0)
  })

  it('несколько шагов подряд не накапливают ошибку округления', () => {
    let w = 100
    for (let i = 0; i < 3; i++) w = stepWeight(w, null, 2.5, 1)
    expect(w).toBe(107.5)
  })
})
