import { describe, it, expect, beforeEach } from 'vitest'
import { loadState, saveState, clearState } from './storage.js'

const KEY = 'arvix.v1'

describe('storage', () => {
  beforeEach(() => localStorage.clear())

  it('на пустом хранилище отдаёт пустое состояние', () => {
    expect(loadState()).toEqual({ version: 1, lastSession: {}, current: null })
  })

  it('сохранённое состояние читается обратно', () => {
    const state = {
      version: 1,
      lastSession: { 'back-squat': { weight: 80, reps: [8, 8, 8], date: '2026-07-21' } },
      current: null,
    }
    saveState(state)
    expect(loadState()).toEqual(state)
  })

  it('битый JSON не роняет приложение', () => {
    localStorage.setItem(KEY, '{это не json')
    expect(() => loadState()).not.toThrow()
    expect(loadState()).toEqual({ version: 1, lastSession: {}, current: null })
  })

  it('чужая версия схемы игнорируется', () => {
    localStorage.setItem(KEY, JSON.stringify({ version: 99, lastSession: { x: 1 } }))
    expect(loadState().lastSession).toEqual({})
  })

  it('недостающие поля добираются умолчаниями', () => {
    localStorage.setItem(KEY, JSON.stringify({ version: 1 }))
    expect(loadState()).toEqual({ version: 1, lastSession: {}, current: null })
  })

  it('clearState стирает запись', () => {
    saveState({ version: 1, lastSession: { a: 1 }, current: null })
    clearState()
    expect(loadState().lastSession).toEqual({})
  })
})
