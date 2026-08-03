/**
 * Небольшие, но настоящие поводы порадоваться после тренировки: не
 * выдуманные очки, а то, что реально произошло — рекорд веса, ровная
 * серия тренировок, круглая цифра в дневнике. Про разрыв серии никогда
 * не сообщаем — тишина лучше чувства вины.
 */

// Первые несколько — сближены, чтобы поддержать в начале пути. Дальше шаг
// раз в 50 тренировок и без верхней границы — при графике 3×/нед это чуть
// реже раза в 4 месяца, и повод порадоваться не иссякнет даже за много лет.
const EARLY_MILESTONES = [1, 10, 25, 50, 100]
const MILESTONE_STEP = 50

// Вторник → четверг — 2 дня, четверг → воскресенье — 3, воскресенье →
// вторник — 2. Запас на день сверху, чтобы обычный ритм не считался разрывом.
const MAX_STREAK_GAP_DAYS = 4

function daysBetween(a, b) {
  return Math.abs(new Date(a) - new Date(b)) / 86400000
}

/**
 * Сколько последних тренировок подряд без разрыва длиннее допустимого.
 * history[0] — самая свежая запись. При разрыве счёт просто останавливается
 * молча, без отдельного сигнала «серия прервалась».
 *
 * @param {Array<{date: string}>} history
 * @returns {number}
 */
export function currentStreak(history) {
  if (history.length === 0) return 0
  let streak = 1
  for (let i = 1; i < history.length; i++) {
    if (daysBetween(history[i - 1].date, history[i].date) > MAX_STREAK_GAP_DAYS) break
    streak++
  }
  return streak
}

/**
 * Лучший зафиксированный вес по каждому упражнению за всю историю.
 *
 * @param {Array<{exercises: Record<string, {weight: number|null}>}>} history
 * @returns {Record<string, number>}
 */
export function bestWeights(history) {
  const best = {}
  for (const session of history) {
    for (const [id, done] of Object.entries(session.exercises)) {
      if (done.weight == null) continue
      if (best[id] == null || done.weight > best[id]) best[id] = done.weight
    }
  }
  return best
}

/**
 * Лучшая зафиксированная сессия по весу для одного упражнения — с повторами
 * и датой, а не только числом: «110 кг × 8» говорит больше, чем голое «110».
 *
 * @param {Array} history
 * @param {string} exerciseId
 * @returns {{weight: number, reps: Array<number|null>, date: string}|null}
 */
export function bestSession(history, exerciseId) {
  let best = null
  for (const session of history) {
    const done = session.exercises[exerciseId]
    if (!done || done.weight == null) continue
    if (best == null || done.weight > best.weight) {
      best = { weight: done.weight, reps: done.reps, date: session.date }
    }
  }
  return best
}

/**
 * Упражнения текущей (ещё не записанной в историю) сессии, где вес превысил
 * лучший исторический результат. Первый раз на упражнении рекордом не
 * считается — не с чем сравнивать.
 *
 * @param {Array} history — история без этой сессии
 * @param {Record<string, Array<number|null>>} sessionReps — current.reps
 * @param {Record<string, number>} sessionWeights — current.weights
 * @returns {string[]} id упражнений с новым рекордом
 */
export function newRecords(history, sessionReps, sessionWeights) {
  const best = bestWeights(history)
  const records = []
  for (const [id, reps] of Object.entries(sessionReps ?? {})) {
    if (reps.every((r) => r == null)) continue
    const weight = sessionWeights?.[id]
    if (weight == null) continue
    if (best[id] != null && weight > best[id]) records.push(id)
  }
  return records
}

/**
 * Круглая цифра в дневнике, если именно эта тренировка её достигает.
 * history — без этой сессии, то есть история «до».
 *
 * @param {Array} history
 * @returns {number|null}
 */
export function milestoneReached(history) {
  const count = history.length + 1
  if (EARLY_MILESTONES.includes(count)) return count
  const last = EARLY_MILESTONES[EARLY_MILESTONES.length - 1]
  if (count > last && count % MILESTONE_STEP === 0) return count
  return null
}
