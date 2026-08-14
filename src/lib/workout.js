import { appendSession, rebuildLastSession } from './history.js'

/**
 * exerciseIds (обычно day.blocks.map(b => b.exercise)) — заранее заполняет
 * вес последним известным результатом по каждому упражнению, а не оставляет
 * поле пустым: чаще всего вес от раза к разу не меняется, и не должно быть
 * нужды вбивать его заново вручную. Первый раз на упражнении — вес остаётся
 * пустым, заполнять нечем.
 *
 * Идемпотентна для уже идущей тренировки того же дня: повторный вызов не
 * стирает то, что уже сделано. Это защищает автостарт (см. WorkoutScreen —
 * тренировка начинается неявно, первым же действием, а не отдельной кнопкой)
 * от случайного сброса прогресса при повторном срабатывании.
 */
export function startWorkout(state, dayId, startedAt, exerciseIds = []) {
  if (state.current?.dayId === dayId) return state

  const weights = {}
  for (const id of exerciseIds) {
    const last = state.lastSession[id]?.weight
    if (last != null) weights[id] = last
  }

  return {
    ...state,
    current: { dayId, startedAt, reps: {}, weights, athletic: {} },
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

export function finishWorkout(state, date, finishedAt = null, note = null) {
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
    history: appendSession(state.history ?? [], state.current, date, finishedAt, note),
  }
}

// Отличается от finishWorkout тем, что ничего не пишет ни в lastSession,
// ни в history: незавершённую тренировку не считаем состоявшейся.
export function cancelWorkout(state) {
  if (!state.current) return state
  return { ...state, current: null }
}

/**
 * Правка дневника задним числом.
 *
 * Все три функции ниже возвращают состояние с пересобранным lastSession, и
 * это не перестраховка: кеш последнего результата кормит и подсказку по
 * весу, и предзаполнение поля на старте тренировки. Поправил вес в записи,
 * а кеш остался прежним — и приложение продолжит советовать вес, которого в
 * дневнике уже нет.
 *
 * Запись адресуется индексом в history: даты не уникальны (две тренировки в
 * один день — обычное дело), а порядок стабилен.
 */
function replaceSession(state, index, nextSession) {
  const history = [...state.history]
  history[index] = nextSession
  return { ...state, history, lastSession: rebuildLastSession(history) }
}

function sessionExercise(state, index, exerciseId) {
  const session = state.history?.[index]
  return session?.exercises?.[exerciseId] ?? null
}

export function deleteSession(state, index) {
  if (!state.history?.[index]) return state
  const history = state.history.filter((_, i) => i !== index)
  return { ...state, history, lastSession: rebuildLastSession(history) }
}

export function setSessionWeight(state, index, exerciseId, weight) {
  const done = sessionExercise(state, index, exerciseId)
  if (!done) return state

  const session = state.history[index]
  return replaceSession(state, index, {
    ...session,
    exercises: { ...session.exercises, [exerciseId]: { ...done, weight } },
  })
}

export function setSessionRep(state, index, exerciseId, setIndex, repsValue) {
  const done = sessionExercise(state, index, exerciseId)
  if (!done || setIndex < 0 || setIndex >= done.reps.length) return state

  const reps = [...done.reps]
  reps[setIndex] = repsValue

  const session = state.history[index]
  return replaceSession(state, index, {
    ...session,
    exercises: { ...session.exercises, [exerciseId]: { ...done, reps } },
  })
}

export function isBlockDone(block, reps) {
  return reps != null && reps.length === block.sets && reps.every((r) => r != null)
}

/**
 * Свод по тренировке: сколько подходов и упражнений закрыто относительно
 * плана дня. Нужен и экрану тренировки (не терять место в списке), и
 * главному экрану (показать прогресс незавершённой сессии, не заходя внутрь).
 *
 * @param {Array<{exercise: string, sets: number}>} blocks — day.blocks
 * @param {{reps: Record<string, Array<number|null>>}|null} current
 */
export function sessionProgress(blocks, current) {
  const totalSets = blocks.reduce((sum, b) => sum + b.sets, 0)
  const totalCount = blocks.length
  if (!current) return { doneSets: 0, totalSets, doneCount: 0, totalCount }

  const doneSets = blocks.reduce(
    (sum, b) => sum + (current.reps[b.exercise]?.filter((r) => r != null).length ?? 0), 0,
  )
  const doneCount = blocks.filter((b) => isBlockDone(b, current.reps[b.exercise])).length

  return { doneSets, totalSets, doneCount, totalCount }
}
