import { describe, it, expect } from 'vitest'
import { muscleZone } from './muscleZone.js'

describe('muscleZone', () => {
  it('передние зоны — грудные, дельты, бицепс, квадрицепс', () => {
    expect(muscleZone(['Грудные'])).toEqual({ view: 'front', zone: 'chest' })
    expect(muscleZone(['Верх грудных'])).toEqual({ view: 'front', zone: 'chest' })
    expect(muscleZone(['Передняя дельта'])).toEqual({ view: 'front', zone: 'shoulder' })
    expect(muscleZone(['Средняя дельта'])).toEqual({ view: 'front', zone: 'shoulder' })
    expect(muscleZone(['Бицепс'])).toEqual({ view: 'front', zone: 'bicep' })
    expect(muscleZone(['Квадрицепс'])).toEqual({ view: 'front', zone: 'quad' })
  })

  it('задние зоны — широчайшие, ромбовидные, трицепс, ягодичные, бицепс бедра', () => {
    expect(muscleZone(['Широчайшие'])).toEqual({ view: 'back', zone: 'lats' })
    expect(muscleZone(['Ромбовидные'])).toEqual({ view: 'back', zone: 'upperBack' })
    expect(muscleZone(['Трицепс'])).toEqual({ view: 'back', zone: 'triceps' })
    expect(muscleZone(['Ягодичные'])).toEqual({ view: 'back', zone: 'glutes' })
    expect(muscleZone(['Бицепс бедра'])).toEqual({ view: 'back', zone: 'hamstring' })
  })

  it('при нескольких primary берёт только первую', () => {
    expect(muscleZone(['Квадрицепс', 'Ягодичные'])).toEqual({ view: 'front', zone: 'quad' })
  })

  it('для неизвестной мышцы и пустых значений возвращает null', () => {
    expect(muscleZone(['Координация'])).toBe(null)
    expect(muscleZone([])).toBe(null)
    expect(muscleZone(undefined)).toBe(null)
    expect(muscleZone(null)).toBe(null)
  })
})
