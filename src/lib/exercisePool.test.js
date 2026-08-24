import { describe, it, expect } from 'vitest'
import { exercisePool, catalogExercise, catalogBlock } from './exercisePool.js'

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
