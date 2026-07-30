import { describe, it, expect } from 'vitest'
import { formatWeight } from './format.js'

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
