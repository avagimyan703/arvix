const KEY = 'arvix.v1'

export const EMPTY_STATE = { version: 1, lastSession: {}, current: null }

function empty() {
  return { version: 1, lastSession: {}, current: null }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.version !== 1) return empty()
    return {
      version: 1,
      lastSession: parsed.lastSession ?? {},
      current: parsed.current ?? null,
    }
  } catch {
    return empty()
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Переполнена квота или приватный режим. Тренировка важнее записи —
    // молча продолжаем, экран остаётся рабочим.
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // см. saveState
  }
}
