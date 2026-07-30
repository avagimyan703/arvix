import { appendSession } from './history.js'

export function startWorkout(state, dayId, startedAt) {
  return {
    ...state,
    current: { dayId, startedAt, reps: {}, weights: {}, athletic: {} },
  }
}

export function setWeight(state, exerciseId, weight) {
  if (!state.current) return state
  return {
    ...state,
    current: {
      ...state.current,
      weights: { ...state.current.weights, [exerciseId]: weight },
    },
  }
}

export function closeSet(state, exerciseId, setIndex, sets, repsValue) {
  if (!state.current) return state
  const existing = state.current.reps[exerciseId] ?? Array(sets).fill(null)
  const next = [...existing]
  next[setIndex] = repsValue
  return {
    ...state,
    current: {
      ...state.current,
      reps: { ...state.current.reps, [exerciseId]: next },
    },
  }
}

export function clearSet(state, exerciseId, setIndex, sets) {
  return closeSet(state, exerciseId, setIndex, sets, null)
}

export function toggleAthletic(state, exerciseId) {
  if (!state.current) return state
  const athletic = { ...state.current.athletic }
  if (athletic[exerciseId]) delete athletic[exerciseId]
  else athletic[exerciseId] = true
  return { ...state, current: { ...state.current, athletic } }
}

export function finishWorkout(state, date) {
  if (!state.current) return state

  const lastSession = { ...state.lastSession }
  for (const [exerciseId, reps] of Object.entries(state.current.reps)) {
    // Упражнение, к которому не притронулись, не должно затирать прошлый результат
    if (reps.every((r) => r === null || r === undefined)) continue
    lastSession[exerciseId] = {
      weight: state.current.weights[exerciseId] ?? null,
      reps,
      date,
    }
  }

  return {
    version: 1,
    lastSession,
    current: null,
    history: appendSession(state.history ?? [], state.current, date),
  }
}
