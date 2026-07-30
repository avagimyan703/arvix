import { describe, it, expect } from 'vitest'
import { parseHash, hashFor } from './router.js'

describe('parseHash', () => {
  it('пустой хеш — список дней', () => {
    expect(parseHash('')).toEqual({ screen: 'days' })
    expect(parseHash('#')).toEqual({ screen: 'days' })
    expect(parseHash('#/')).toEqual({ screen: 'days' })
  })

  it('день', () => {
    expect(parseHash('#/day/thu')).toEqual({ screen: 'workout', dayId: 'thu' })
  })

  it('упражнение', () => {
    expect(parseHash('#/ex/back-squat')).toEqual({ screen: 'exercise', exerciseId: 'back-squat' })
  })

  it('каталог рилсов и его категория', () => {
    expect(parseHash('#/reels')).toEqual({ screen: 'reels' })
    expect(parseHash('#/reels/')).toEqual({ screen: 'reels' })
    expect(parseHash('#/reels/back')).toEqual({ screen: 'reelCategory', categoryId: 'back' })
  })

  it('дневник', () => {
    expect(parseHash('#/history')).toEqual({ screen: 'history' })
  })

  it('мусор скатывается к списку дней', () => {
    expect(parseHash('#/чтототакое')).toEqual({ screen: 'days' })
    expect(parseHash('#/day')).toEqual({ screen: 'days' })
    expect(parseHash('#/ex/')).toEqual({ screen: 'days' })
  })

  it('undefined не роняет', () => {
    expect(parseHash(undefined)).toEqual({ screen: 'days' })
  })
})

describe('hashFor', () => {
  it('собирает хеш обратно', () => {
    expect(hashFor({ screen: 'days' })).toBe('#/')
    expect(hashFor({ screen: 'workout', dayId: 'tue' })).toBe('#/day/tue')
    expect(hashFor({ screen: 'exercise', exerciseId: 'pull-up' })).toBe('#/ex/pull-up')
    expect(hashFor({ screen: 'reels' })).toBe('#/reels')
    expect(hashFor({ screen: 'reelCategory', categoryId: 'back' })).toBe('#/reels/back')
    expect(hashFor({ screen: 'history' })).toBe('#/history')
  })

  it('парсинг и сборка обратимы', () => {
    for (const h of ['#/', '#/day/sun', '#/ex/leg-press', '#/reels', '#/reels/chest', '#/history']) {
      expect(hashFor(parseHash(h))).toBe(h)
    }
  })
})
