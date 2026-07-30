/**
 * Правило двойной прогрессии (спека, раздел 8).
 *
 * @param {{weight: number|null, reps: Array<number|null>}|undefined} lastSession
 * @param {{sets: number, reps: [number, number]}} block
 * @param {number} weightStep
 * @param {number|null} currentWeight
 * @returns {number|null} предлагаемый вес или null
 */
export function suggestWeight(lastSession, block, weightStep, currentWeight) {
  if (!lastSession) return null

  const { weight, reps } = lastSession
  if (typeof weight !== 'number') return null
  if (!Array.isArray(reps)) return null

  // Условие 1: записаны все плановые подходы
  if (reps.length !== block.sets) return null
  if (reps.some((r) => typeof r !== 'number')) return null

  // Условие 2: минимум по повторам не ниже верхней границы диапазона
  const max = block.reps[1]
  if (Math.min(...reps) < max) return null

  // Условие 3: сегодня вес не снижен сознательно
  if (currentWeight != null && currentWeight < weight) return null

  return weight + weightStep
}
