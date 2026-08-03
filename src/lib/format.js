/**
 * Вес для показа на экране. Интерфейс русский, поэтому дробная часть
 * отделяется запятой: «102,5 кг», а не «102.5 кг». Целые числа выводятся
 * без дробной части.
 *
 * В <input type="number"> подставлять НЕ нужно — там браузер ждёт точку.
 *
 * @param {number|null|undefined} weight
 * @returns {string}
 */
export function formatWeight(weight) {
  if (typeof weight !== 'number' || Number.isNaN(weight)) return ''
  return String(weight).replace('.', ',')
}

/**
 * Следующее значение веса при тапе по кнопке +/-.
 *
 * Если поле ещё пустое, отталкивается от подсказки «в прошлый раз», а не
 * от нуля — иначе первый тап уводил бы вес далеко от рабочего, и пришлось
 * бы тапать десяток раз, чтобы вернуться к прошлой тренировке.
 *
 * @param {number|null} current — то, что уже введено в поле
 * @param {number|null} fallback — вес прошлой сессии, если поле пустое
 * @param {number} step — шаг конкретного упражнения (exercise.weightStep)
 * @param {1|-1} direction
 * @returns {number}
 */
export function stepWeight(current, fallback, step, direction) {
  const base = current ?? fallback ?? 0
  const next = round1(base + direction * step)
  return Math.max(0, next)
}

function round1(n) {
  return Math.round(n * 10) / 10
}

/**
 * Русское склонение существительного по числу: «1 тренировка»,
 * «2 тренировки», «5 тренировок». Один и тот же алгоритм нужен в трёх
 * разных местах интерфейса — вынесен сюда, а не скопирован ещё раз.
 *
 * @param {number} n
 * @param {[string, string, string]} forms — [для 1, для 2–4, для остальных]
 * @returns {string}
 */
export function pluralRu(n, [one, few, many]) {
  const d = n % 10
  const h = n % 100
  if (d === 1 && h !== 11) return one
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return few
  return many
}
