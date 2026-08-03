/**
 * Разминочные подходы под рабочий вес — 40/60/80% с убывающими повторами,
 * стандартная лесенка перед тяжёлым сетом. Округляем к шагу упражнения,
 * чтобы числа были такими же, какими их вводят в само поле веса.
 */
const STEPS = [
  { pct: 0.4, reps: 8 },
  { pct: 0.6, reps: 5 },
  { pct: 0.8, reps: 3 },
]

/**
 * @param {number|null} workingWeight
 * @param {number} weightStep
 * @returns {Array<{weight: number, reps: number}>}
 */
export function warmupSets(workingWeight, weightStep) {
  if (workingWeight == null || workingWeight <= 0) return []

  return STEPS
    .map(({ pct, reps }) => ({ weight: roundToStep(workingWeight * pct, weightStep), reps }))
    .filter((s) => s.weight > 0)
}

function roundToStep(value, step) {
  return Math.round(value / step) * step
}
