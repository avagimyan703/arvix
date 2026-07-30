import { describe, it, expect } from 'vitest'
import { todayDayId, findDay } from './program.js'
import program from '../data/program.json'

describe('todayDayId', () => {
  it('вторник, четверг и воскресенье — тренировочные', () => {
    expect(todayDayId(new Date('2026-07-28T10:00:00'))).toBe('tue')
    expect(todayDayId(new Date('2026-07-30T10:00:00'))).toBe('thu')
    expect(todayDayId(new Date('2026-08-02T10:00:00'))).toBe('sun')
  })

  it('в остальные дни возвращает null', () => {
    expect(todayDayId(new Date('2026-07-29T10:00:00'))).toBeNull()
    expect(todayDayId(new Date('2026-07-31T10:00:00'))).toBeNull()
  })
})

describe('findDay', () => {
  it('находит день по id', () => {
    expect(findDay(program, 'thu').accent).toBe('Ноги')
  })

  it('для неизвестного id возвращает null', () => {
    expect(findDay(program, 'mon')).toBeNull()
  })
})
