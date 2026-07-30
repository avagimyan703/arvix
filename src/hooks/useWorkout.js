import { useCallback, useState } from 'react'
import { loadState, saveState } from '../lib/storage.js'
import * as workout from '../lib/workout.js'

// Хук — только проводка: все переходы делает lib/workout.js,
// после каждого состояние уезжает в localStorage.
export function useWorkout() {
  const [state, setState] = useState(loadState)

  const apply = useCallback((fn) => {
    setState((prev) => {
      const next = fn(prev)
      saveState(next)
      return next
    })
  }, [])

  return {
    state,

    startWorkout: useCallback((dayId) => {
      apply((s) => workout.startWorkout(s, dayId, new Date().toISOString()))
    }, [apply]),

    setWeight: useCallback((id, weight) => {
      apply((s) => workout.setWeight(s, id, weight))
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

    finishWorkout: useCallback(() => {
      apply((s) => workout.finishWorkout(s, new Date().toISOString().slice(0, 10)))
    }, [apply]),

    cancelWorkout: useCallback(() => {
      apply((s) => workout.cancelWorkout(s))
    }, [apply]),
  }
}
