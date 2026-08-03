import { describe, it, expect } from 'vitest'
import {
  appendSession, weekVolume, exportText, exerciseHistory, sessionDuration, HISTORY_LIMIT,
} from './history.js'

const program = {
  days: [
    {
      id: 'thu',
      weekday: 'Четверг',
      accent: 'Ноги',
      blocks: [
        { exercise: 'back-squat', sets: 3, reps: [5, 8], rir: 2, rest: 180 },
        { exercise: 'leg-press', sets: 2, reps: [10, 12], rir: 1, rest: 120 },
      ],
      athletic: [{ exercise: 'jump-rope', format: '3 × 45 с', rest: 45 }],
    },
  ],
}

const exercises = {
  'back-squat': { name: 'Приседания со штангой', primary: ['Квадрицепс'] },
  'leg-press': { name: 'Жим ногами', primary: ['Квадрицепс'] },
  'jump-rope': { name: 'Скакалка', primary: ['Икроножные'] },
}

const current = {
  dayId: 'thu',
  startedAt: '2026-07-30T18:00:00.000Z',
  reps: { 'back-squat': [8, 8, 7], 'leg-press': [12, 11] },
  weights: { 'back-squat': 100, 'leg-press': 180 },
  athletic: { 'jump-rope': true },
}

describe('appendSession', () => {
  it('добавляет тренировку в начало истории', () => {
    const h = appendSession([], current, '2026-07-30')
    expect(h).toHaveLength(1)
    expect(h[0]).toMatchObject({ date: '2026-07-30', dayId: 'thu' })
    expect(h[0].exercises['back-squat']).toEqual({ weight: 100, reps: [8, 8, 7] })
  })

  it('новые записи идут первыми', () => {
    let h = appendSession([], current, '2026-07-28')
    h = appendSession(h, current, '2026-07-30')
    expect(h.map((s) => s.date)).toEqual(['2026-07-30', '2026-07-28'])
  })

  it('упражнения без единого закрытого подхода не попадают', () => {
    const partial = { ...current, reps: { 'back-squat': [8, 8, 7], 'leg-press': [null, null] } }
    const h = appendSession([], partial, '2026-07-30')
    expect(Object.keys(h[0].exercises)).toEqual(['back-squat'])
  })

  it('отметки атлетического блока сохраняются', () => {
    const h = appendSession([], current, '2026-07-30')
    expect(h[0].athletic).toEqual(['jump-rope'])
  })

  it('история обрезается по лимиту, старое уходит', () => {
    let h = []
    for (let i = 0; i < HISTORY_LIMIT + 10; i++) {
      h = appendSession(h, current, `2026-01-${String((i % 28) + 1).padStart(2, '0')}`)
    }
    expect(h).toHaveLength(HISTORY_LIMIT)
  })

  it('без начатой тренировки история не меняется', () => {
    const h = [{ date: '2026-07-28', dayId: 'thu', exercises: {}, athletic: [] }]
    expect(appendSession(h, null, '2026-07-30')).toBe(h)
  })

  it('сохраняет время окончания и заметку, когда они переданы', () => {
    const h = appendSession([], current, '2026-07-30', '2026-07-30T18:48:00.000Z', 'Тяжело шло')
    expect(h[0].finishedAt).toBe('2026-07-30T18:48:00.000Z')
    expect(h[0].note).toBe('Тяжело шло')
  })

  it('пустая или пробельная заметка сохраняется как null', () => {
    const h = appendSession([], current, '2026-07-30', null, '   ')
    expect(h[0].note).toBeNull()
  })

  it('без явной передачи — оба поля null, старое поведение не ломается', () => {
    const h = appendSession([], current, '2026-07-30')
    expect(h[0].finishedAt).toBeNull()
    expect(h[0].note).toBeNull()
  })
})

describe('sessionDuration', () => {
  it('считает минуты между началом и концом', () => {
    const s = { startedAt: '2026-07-30T18:00:00.000Z', finishedAt: '2026-07-30T18:48:30.000Z' }
    expect(sessionDuration(s)).toBe(49)
  })

  it('без времени окончания — null', () => {
    expect(sessionDuration({ startedAt: '2026-07-30T18:00:00.000Z', finishedAt: null })).toBeNull()
  })

  it('минимум одна минута, даже если разница меньше', () => {
    const s = { startedAt: '2026-07-30T18:00:00.000Z', finishedAt: '2026-07-30T18:00:20.000Z' }
    expect(sessionDuration(s)).toBe(1)
  })
})

describe('weekVolume', () => {
  it('считает подходы по группам мышц за период', () => {
    const h = appendSession([], current, '2026-07-30')
    const v = weekVolume(h, exercises, '2026-07-27', '2026-08-02')
    // присед 3 подхода + жим ногами 2 = 5 на квадрицепс
    expect(v['Квадрицепс']).toBe(5)
  })

  it('тренировки вне периода не учитываются', () => {
    const h = appendSession([], current, '2026-06-01')
    expect(weekVolume(h, exercises, '2026-07-27', '2026-08-02')).toEqual({})
  })

  it('на пустой истории отдаёт пустой объект', () => {
    expect(weekVolume([], exercises, '2026-07-27', '2026-08-02')).toEqual({})
  })
})

describe('exerciseHistory', () => {
  it('фильтрует по упражнению, самые новые первыми', () => {
    let h = appendSession([], current, '2026-07-28')
    h = appendSession(h, { ...current, weights: { 'back-squat': 105, 'leg-press': 185 } }, '2026-07-30')
    const rows = exerciseHistory(h, 'back-squat')
    expect(rows).toEqual([
      { date: '2026-07-30', weight: 105, reps: [8, 8, 7] },
      { date: '2026-07-28', weight: 100, reps: [8, 8, 7] },
    ])
  })

  it('упражнения, которых не было в сессии, не попадают', () => {
    const h = appendSession([], current, '2026-07-30')
    expect(exerciseHistory(h, 'bench-press')).toEqual([])
  })

  it('уважает лимит', () => {
    let h = []
    for (let i = 0; i < 10; i++) h = appendSession(h, current, `2026-01-${String(i + 1).padStart(2, '0')}`)
    expect(exerciseHistory(h, 'back-squat', 3)).toHaveLength(3)
  })

  it('на пустой истории — пустой список', () => {
    expect(exerciseHistory([], 'back-squat')).toEqual([])
  })
})

describe('exportText', () => {
  it('содержит дату, день, упражнения, вес и повторы', () => {
    const h = appendSession([], current, '2026-07-30')
    const text = exportText(h, program, exercises)
    expect(text).toContain('2026-07-30')
    expect(text).toContain('Четверг')
    expect(text).toContain('Приседания со штангой')
    expect(text).toContain('100 кг')
    expect(text).toContain('8, 8, 7')
  })

  it('показывает недельный объём по группам', () => {
    const h = appendSession([], current, '2026-07-30')
    const text = exportText(h, program, exercises)
    expect(text).toContain('Квадрицепс')
  })

  it('на пустой истории говорит об этом прямо', () => {
    expect(exportText([], program, exercises)).toContain('пуста')
  })
})
