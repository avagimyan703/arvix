import { describe, it, expect } from 'vitest'
import { todayDayId, findDay, nextTrainingDay, doneThisWeek } from './program.js'
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

describe('nextTrainingDay', () => {
  it('от понедельника — вторник через день', () => {
    const r = nextTrainingDay(program, new Date('2026-08-03T10:00:00'))
    expect(r.day.id).toBe('tue')
    expect(r.inDays).toBe(1)
  })

  it('от среды — четверг через день', () => {
    const r = nextTrainingDay(program, new Date('2026-07-29T10:00:00'))
    expect(r.day.id).toBe('thu')
    expect(r.inDays).toBe(1)
  })

  it('от пятницы — воскресенье через два дня', () => {
    const r = nextTrainingDay(program, new Date('2026-07-31T10:00:00'))
    expect(r.day.id).toBe('sun')
    expect(r.inDays).toBe(2)
  })

  it('от субботы — воскресенье завтра', () => {
    const r = nextTrainingDay(program, new Date('2026-08-01T10:00:00'))
    expect(r.day.id).toBe('sun')
    expect(r.inDays).toBe(1)
  })
})

describe('doneThisWeek', () => {
  it('засчитывает тренировку с последнего наступления этого дня недели', () => {
    const history = [{ dayId: 'tue', date: '2026-07-28' }]
    expect(doneThisWeek(history, 'tue', new Date('2026-07-30T10:00:00'))).toBe(true)
  })

  it('не засчитывает тренировку из прошлого цикла', () => {
    const history = [{ dayId: 'tue', date: '2026-07-21' }]
    expect(doneThisWeek(history, 'tue', new Date('2026-07-30T10:00:00'))).toBe(false)
  })

  it('засчитывает тренировку, сделанную сегодня же', () => {
    const history = [{ dayId: 'thu', date: '2026-07-30' }]
    expect(doneThisWeek(history, 'thu', new Date('2026-07-30T10:00:00'))).toBe(true)
  })

  it('без записей в истории — false', () => {
    expect(doneThisWeek([], 'tue', new Date('2026-07-30T10:00:00'))).toBe(false)
  })
})
