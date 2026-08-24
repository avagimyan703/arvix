import { useCallback, useEffect, useRef, useState } from 'react'
import { loadState, saveState } from '../lib/storage.js'
import * as workout from '../lib/workout.js'

// Полсекунды простоя перед записью — пять нажатий клавиш при вводе веса
// («102,5») дают одну запись в localStorage вместо пяти подряд. Экран
// обновляется мгновенно в любом случае — откладывается только запись на диск.
const SAVE_DEBOUNCE_MS = 300

// Хук — только проводка: все переходы делает lib/workout.js.
export function useWorkout() {
  const [state, setState] = useState(loadState)
  const stateRef = useRef(state)
  const isFirstRender = useRef(true)

  useEffect(() => { stateRef.current = state }, [state])

  // Отложенная запись: отменяется и переставляется на каждое новое
  // изменение, пока их не станет тихо на SAVE_DEBOUNCE_MS.
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    const id = setTimeout(() => saveState(state), SAVE_DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [state])

  // Подстраховка: если вкладку свернули или закрыли раньше, чем сработала
  // отложенная запись выше, — пишем актуальное состояние немедленно.
  // Экономия на записи не должна стоить потерянного подхода.
  useEffect(() => {
    const flush = () => saveState(stateRef.current)
    const onVisibility = () => { if (document.visibilityState === 'hidden') flush() }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', flush)
    }
  }, [])

  const apply = useCallback((fn) => {
    setState((prev) => fn(prev))
  }, [])

  return {
    state,

    startWorkout: useCallback((dayId, exerciseIds) => {
      apply((s) => workout.startWorkout(s, dayId, new Date().toISOString(), exerciseIds))
    }, [apply]),

    setWeight: useCallback((id, weight) => {
      apply((s) => workout.setWeight(s, id, weight))
    }, [apply]),

    setPicked: useCallback((exerciseIds) => {
      apply((s) => workout.setPicked(s, exerciseIds))
    }, [apply]),

    closeSet: useCallback((id, index, sets, reps) => {
      apply((s) => workout.closeSet(s, id, index, sets, reps))
    }, [apply]),

    clearSet: useCallback((id, index, sets) => {
      apply((s) => workout.clearSet(s, id, index, sets))
    }, [apply]),

    toggleAthletic: useCallback((id) => {
      apply((s) => workout.toggleAthletic(s, id))
    }, [apply]),

    finishWorkout: useCallback((note) => {
      const now = new Date()
      apply((s) => workout.finishWorkout(s, now.toISOString().slice(0, 10), now.toISOString(), note))
    }, [apply]),

    cancelWorkout: useCallback(() => {
      apply((s) => workout.cancelWorkout(s))
    }, [apply]),

    deleteSession: useCallback((index) => {
      apply((s) => workout.deleteSession(s, index))
    }, [apply]),

    setSessionWeight: useCallback((index, id, weight) => {
      apply((s) => workout.setSessionWeight(s, index, id, weight))
    }, [apply]),

    setSessionRep: useCallback((index, id, setIndex, reps) => {
      apply((s) => workout.setSessionRep(s, index, id, setIndex, reps))
    }, [apply]),
  }
}
