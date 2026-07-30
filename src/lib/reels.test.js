import { describe, it, expect } from 'vitest'
import { embedUrl, reelId, reelsInCategory, countByCategory, reelForExercise } from './reels.js'

const library = {
  categories: [
    { id: 'back', name: 'Спина' },
    { id: 'legs', name: 'Ноги' },
    { id: 'triceps', name: 'Трицепс' },
  ],
  reels: {
    AAA: { category: 'back', note: 'тяга', author: 'a', url: 'https://www.instagram.com/reel/AAA/' },
    BBB: { category: 'back', note: 'подтягивания', author: 'b', url: 'https://www.instagram.com/reel/BBB/' },
    CCC: { category: 'legs', note: 'присед', author: 'c', url: 'https://www.instagram.com/reel/CCC/' },
  },
}

describe('embedUrl', () => {
  it('делает адрес плеера из ссылки на рилс', () => {
    expect(embedUrl('https://www.instagram.com/reel/DbTgI_yCUor/'))
      .toBe('https://www.instagram.com/reel/DbTgI_yCUor/embed')
  })

  it('понимает ссылку с именем автора в пути', () => {
    expect(embedUrl('https://www.instagram.com/demicstory/reel/DbTgI_yCUor/'))
      .toBe('https://www.instagram.com/reel/DbTgI_yCUor/embed')
  })

  it('понимает обычный пост и tv', () => {
    expect(embedUrl('https://www.instagram.com/p/ABC123/')).toBe('https://www.instagram.com/p/ABC123/embed')
    expect(embedUrl('https://www.instagram.com/tv/ABC123/')).toBe('https://www.instagram.com/tv/ABC123/embed')
  })

  it('игнорирует хвост с параметрами', () => {
    expect(embedUrl('https://www.instagram.com/reel/XYZ/?igsh=abc123&utm_source=ig_web_copy_link'))
      .toBe('https://www.instagram.com/reel/XYZ/embed')
  })

  it('на чужой ссылке отдаёт null', () => {
    expect(embedUrl('https://youtube.com/watch?v=1')).toBeNull()
    expect(embedUrl('')).toBeNull()
    expect(embedUrl(undefined)).toBeNull()
  })
})

describe('reelId', () => {
  it('вытаскивает короткий код', () => {
    expect(reelId('https://www.instagram.com/reel/DbTgI_yCUor/?igsh=x')).toBe('DbTgI_yCUor')
    expect(reelId('https://www.instagram.com/demicstory/reel/ABC-1_2/')).toBe('ABC-1_2')
  })

  it('на чужой ссылке отдаёт null', () => {
    expect(reelId('https://example.com/reel/AAA/')).toBeNull()
  })
})

describe('reelsInCategory', () => {
  it('отдаёт рилсы категории с их ключами', () => {
    const r = reelsInCategory(library, 'back')
    expect(r.map((x) => x.id)).toEqual(['AAA', 'BBB'])
    expect(r[0].note).toBe('тяга')
  })

  it('для пустой категории отдаёт пустой список', () => {
    expect(reelsInCategory(library, 'triceps')).toEqual([])
  })
})

describe('countByCategory', () => {
  it('считает по всем категориям, включая пустые', () => {
    expect(countByCategory(library)).toEqual({ back: 2, legs: 1, triceps: 0 })
  })

  it('рилс с неизвестной категорией не ломает счёт', () => {
    const dirty = { ...library, reels: { ...library.reels, DDD: { category: 'нет-такой' } } }
    expect(countByCategory(dirty)).toEqual({ back: 2, legs: 1, triceps: 0 })
  })
})

describe('reelForExercise', () => {
  it('находит рилс по ключу из упражнения', () => {
    expect(reelForExercise(library, { video: 'CCC' })).toMatchObject({ id: 'CCC', note: 'присед' })
  })

  it('без поля video отдаёт null', () => {
    expect(reelForExercise(library, {})).toBeNull()
  })

  it('на ключ, которого нет в библиотеке, отдаёт null', () => {
    expect(reelForExercise(library, { video: 'ZZZ' })).toBeNull()
  })
})
