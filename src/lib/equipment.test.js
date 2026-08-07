import { describe, it, expect } from 'vitest'
import { equipmentIcon } from './equipment.js'

describe('equipmentIcon', () => {
  it('узнаёт штангу', () => {
    expect(equipmentIcon('Штанга, горизонтальная скамья')).toBe('barbell')
    expect(equipmentIcon('Штанга, стойки')).toBe('barbell')
  })

  it('узнаёт гантели в единственном и множественном числе', () => {
    expect(equipmentIcon('Гантель, скамья')).toBe('dumbbell')
    expect(equipmentIcon('Гантели')).toBe('dumbbell')
  })

  it('узнаёт тренажёр и блочный тренажёр с обоими написаниями ё/е', () => {
    expect(equipmentIcon('Тренажёр для сгибания ног')).toBe('machine')
    expect(equipmentIcon('Тренажер для жима ногами')).toBe('machine')
    expect(equipmentIcon('Блочный тренажёр')).toBe('machine')
    expect(equipmentIcon('Блочный тренажёр, канат')).toBe('machine')
  })

  it('узнаёт турник', () => {
    expect(equipmentIcon('Турник')).toBe('bar')
  })

  it('для инвентаря атлетического финишера и пустых значений возвращает null', () => {
    expect(equipmentIcon('BOSU')).toBe(null)
    expect(equipmentIcon('Гиря')).toBe(null)
    expect(equipmentIcon('Без оборудования')).toBe(null)
    expect(equipmentIcon(undefined)).toBe(null)
    expect(equipmentIcon(null)).toBe(null)
  })
})
