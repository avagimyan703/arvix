import { describe, it, expect } from 'vitest'
import exercises from './exercises.json'
import program from './program.json'

const ALL_BLOCKS = program.days.flatMap((d) => d.blocks)
const ALL_ATHLETIC = program.days.flatMap((d) => d.athletic)

describe('программа', () => {
  it('содержит ровно три дня с ожидаемыми акцентами', () => {
    expect(program.days.map((d) => [d.id, d.accent])).toEqual([
      ['tue', 'Грудь и спина'],
      ['thu', 'Ноги'],
      ['sun', 'Плечи и руки'],
    ])
  })

  it('у каждого силового блока заполнены обязательные поля', () => {
    for (const b of ALL_BLOCKS) {
      expect(typeof b.exercise, `${b.exercise}: id`).toBe('string')
      expect(b.sets, `${b.exercise}: sets`).toBeGreaterThan(0)
      expect(b.reps, `${b.exercise}: reps`).toHaveLength(2)
      expect(b.reps[0], `${b.exercise}: диапазон`).toBeLessThanOrEqual(b.reps[1])
      expect(typeof b.rir, `${b.exercise}: rir`).toBe('number')
      expect(b.rest, `${b.exercise}: rest`).toBeGreaterThan(0)
    }
  })

  it('у каждого атлетического блока есть формат и отдых', () => {
    for (const a of ALL_ATHLETIC) {
      expect(typeof a.format, `${a.exercise}: format`).toBe('string')
      expect(a.rest, `${a.exercise}: rest`).toBeGreaterThan(0)
    }
  })

  it('каждое упражнение из программы есть в библиотеке', () => {
    const missing = [...ALL_BLOCKS, ...ALL_ATHLETIC]
      .map((b) => b.exercise)
      .filter((id) => !exercises[id])
    expect(missing).toEqual([])
  })
})

describe('библиотека упражнений', () => {
  it('содержит 22 упражнения', () => {
    expect(Object.keys(exercises)).toHaveLength(22)
  })

  it('в библиотеке нет упражнений, которых нет в программе', () => {
    const used = new Set([...ALL_BLOCKS, ...ALL_ATHLETIC].map((b) => b.exercise))
    const unused = Object.keys(exercises).filter((id) => !used.has(id))
    expect(unused).toEqual([])
  })

  it('у каждого упражнения заполнены все поля', () => {
    for (const [id, ex] of Object.entries(exercises)) {
      expect(ex.name, `${id}: name`).toBeTruthy()
      expect(ex.equipment, `${id}: equipment`).toBeTruthy()
      expect(ex.primary.length, `${id}: primary`).toBeGreaterThan(0)
      expect(Array.isArray(ex.secondary), `${id}: secondary`).toBe(true)
      expect(typeof ex.weightStep, `${id}: weightStep`).toBe('number')
    }
  })

  it('техника описана не поверхностно', () => {
    for (const [id, ex] of Object.entries(exercises)) {
      expect(ex.steps.length, `${id}: шагов техники`).toBeGreaterThanOrEqual(3)
      expect(ex.mistakes.length, `${id}: частых ошибок`).toBeGreaterThanOrEqual(2)
      expect(ex.tip.length, `${id}: подсказка`).toBeGreaterThan(20)
      for (const step of ex.steps) {
        expect(step.length, `${id}: шаг «${step}»`).toBeGreaterThan(15)
      }
    }
  })

  it('если у упражнения есть видео, то заполнено целиком', () => {
    for (const [id, ex] of Object.entries(exercises)) {
      if (!ex.video) continue
      expect(ex.video.url, `${id}: адрес видео`).toMatch(/^https:\/\//)
      expect(ex.video.author, `${id}: автор видео`).toBeTruthy()
      expect(ex.video.note, `${id}: о чём видео`).toBeTruthy()
    }
  })

  it('идентификаторы пригодны как имена файлов', () => {
    for (const id of Object.keys(exercises)) {
      expect(id, `${id}`).toMatch(/^[a-z0-9-]+$/)
    }
  })
})
