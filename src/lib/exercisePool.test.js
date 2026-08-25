import { describe, it, expect } from 'vitest'
import { exercisePool, catalogExercise, catalogBlock, categoryOf, categoryRank } from './exercisePool.js'

const exercises = {
  'back-squat': {
    name: 'Приседания со штангой',
    equipment: 'штанга',
    primary: ['Квадрицепс'],
    secondary: ['Ягодичные'],
    weightStep: 2.5,
    steps: ['раз', 'два', 'три'],
    mistakes: ['ошибка'],
    tip: 'подсказка',
  },
}

const library = {
  categories: [
    { id: 'chest', name: 'Грудь' },
    { id: 'legs', name: 'Ноги' },
  ],
  reels: {
    AAA: { category: 'chest', note: 'Жим лёжа: разбор', author: 'a', url: 'https://www.instagram.com/p/AAA/' },
    BBB: { category: 'legs', note: 'Присед: разбор', author: 'b', url: 'https://www.instagram.com/p/BBB/' },
  },
}

describe('catalogExercise', () => {
  it('берёт название из заметки, а мышцу из категории', () => {
    const e = catalogExercise('AAA', library.reels.AAA, 'Грудь')
    expect(e.name).toBe('Жим лёжа: разбор')
    expect(e.primary).toEqual(['Грудь'])
  })

  it('ссылается на свой же ролик как на разбор техники', () => {
    expect(catalogExercise('AAA', library.reels.AAA, 'Грудь').video).toBe('AAA')
  })

  it('помечен как каталожный — экраны по этому признаку прячут пустую технику', () => {
    const e = catalogExercise('AAA', library.reels.AAA, 'Грудь')
    expect(e.fromCatalog).toBe(true)
    expect(e.steps).toEqual([])
    expect(e.mistakes).toEqual([])
  })
})

describe('exercisePool', () => {
  it('складывает библиотеку и каталог в один объект', () => {
    const pool = exercisePool(exercises, library)
    expect(Object.keys(pool).sort()).toEqual(['AAA', 'BBB', 'back-squat'])
  })

  it('библиотечное упражнение остаётся как было', () => {
    const pool = exercisePool(exercises, library)
    expect(pool['back-squat']).toBe(exercises['back-squat'])
  })

  it('при совпадении ключей побеждает библиотека, а не каталог', () => {
    const collided = {
      ...library,
      reels: { ...library.reels, 'back-squat': { category: 'legs', note: 'чужая заметка' } },
    }
    const pool = exercisePool(exercises, collided)
    expect(pool['back-squat'].name).toBe('Приседания со штангой')
  })

  it('неизвестная категория не роняет сборку', () => {
    const odd = { ...library, reels: { CCC: { category: 'нет-такой', note: 'что-то' } } }
    expect(exercisePool({}, odd).CCC.primary).toEqual(['Прочее'])
  })
})

describe('catalogBlock', () => {
  it('даёт общие параметры подхода', () => {
    expect(catalogBlock('AAA')).toEqual({ exercise: 'AAA', sets: 3, reps: [8, 12], rir: 2, rest: 120 })
  })

  it('диапазон повторов у каждого свой — общий массив не переиспользуется', () => {
    const a = catalogBlock('AAA')
    a.reps[0] = 99
    expect(catalogBlock('BBB').reps[0]).toBe(8)
  })
})

describe('categoryOf', () => {
  it('у каталожного берёт его категорию', () => {
    const e = catalogExercise('AAA', library.reels.AAA, 'Грудь')
    expect(categoryOf(e)).toBe('chest')
  })

  it('у библиотечного выводит из главной мышцы', () => {
    expect(categoryOf({ primary: ['Верх грудных'] })).toBe('chest')
    expect(categoryOf({ primary: ['Широчайшие'] })).toBe('back')
    expect(categoryOf({ primary: ['Бицепс бедра'] })).toBe('legs')
  })

  it('берёт первую мышцу, а не все — порядок в данных отражает акцент', () => {
    expect(categoryOf({ primary: ['Квадрицепс', 'Грудные'] })).toBe('legs')
  })

  it('незнакомая мышца — null, а не выдуманная категория', () => {
    expect(categoryOf({ primary: ['Координация'] })).toBeNull()
    expect(categoryOf({})).toBeNull()
    expect(categoryOf(null)).toBeNull()
  })
})

describe('categoryRank', () => {
  it('задаёт порядок спина → грудь → плечи → бицепс → трицепс → ноги', () => {
    const order = ['back', 'chest', 'shoulders', 'biceps', 'triceps', 'legs']
    const ranks = order.map(categoryRank)
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b))
    expect(new Set(ranks).size).toBe(order.length)
  })

  it('неперечисленные категории уходят в конец', () => {
    for (const id of ['press', 'forearms', 'athletic', 'other', null]) {
      expect(categoryRank(id)).toBeGreaterThan(categoryRank('legs'))
    }
  })

  it('у неперечисленных ранг одинаковый — устойчивая сортировка сохранит их порядок', () => {
    expect(categoryRank('press')).toBe(categoryRank('athletic'))
  })

  it('сортирует группы независимо от того, в каком порядке они пришли', () => {
    const sort = (ids) => [...ids].sort((a, b) => categoryRank(a) - categoryRank(b))
    expect(sort(['legs', 'chest', 'back'])).toEqual(['back', 'chest', 'legs'])
    expect(sort(['triceps', 'back', 'press', 'shoulders'])).toEqual(
      ['back', 'shoulders', 'triceps', 'press'],
    )
  })
})
