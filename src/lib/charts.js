/**
 * Ряды для графиков дневника. Здесь только числа: сами графики ничего не
 * знают про SVG, а компоненты — про календарь.
 *
 * Неделя считается календарной, с понедельника. Это не то же самое, что в
 * program.js:doneThisWeek — там отсчёт идёт назад от конкретного дня недели
 * («был ли вторник с прошлого вторника»), и для кольца на главной так и
 * надо. Но столбики «сколько тренировок в неделю» должны стоять в ровной
 * сетке недель, иначе соседние столбцы окажутся про разные окна времени.
 */

/**
 * Дата в 'YYYY-MM-DD' по местному времени.
 *
 * Не toISOString(): он переводит в UTC, и западнее Гринвича полночь
 * понедельника уезжает в воскресенье — неделя молча сдвигается на день.
 *
 * @param {Date} d
 * @returns {string}
 */
function isoDate(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/**
 * Понедельник недели, в которую попадает дата.
 *
 * @param {Date} date
 * @returns {Date}
 */
export function startOfWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  // getDay(): воскресенье 0, понедельник 1. Сдвигаем так, чтобы
  // понедельник стал нулём, иначе воскресенье уедет в следующую неделю.
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

/**
 * Сколько тренировок пришлось на каждую из последних недель.
 *
 * Пустые недели остаются в ряду нулями, а не выпадают: пропуск — это тоже
 * результат, и без него график покажет ровный ритм там, где его не было.
 *
 * @param {Array<{date: string}>} history
 * @param {number} weeks — сколько недель назад показывать, включая текущую
 * @param {Date} today
 * @returns {Array<{start: string, count: number}>} от старых к новым
 */
export function workoutsPerWeek(history, weeks, today) {
  if (weeks < 1) return []

  const buckets = []
  const first = startOfWeek(today)
  first.setDate(first.getDate() - (weeks - 1) * 7)

  for (let i = 0; i < weeks; i++) {
    const start = new Date(first)
    start.setDate(start.getDate() + i * 7)
    buckets.push({ start: isoDate(start), count: 0 })
  }

  const firstStr = buckets[0].start
  for (const session of history) {
    if (!session.date || session.date < firstStr) continue
    const start = isoDate(startOfWeek(new Date(`${session.date}T00:00:00`)))
    const bucket = buckets.find((b) => b.start === start)
    if (bucket) bucket.count += 1
  }

  return buckets
}

/**
 * Длительности последних тренировок в минутах, от старых к новым.
 *
 * Записи без времени окончания пропускаем: дневник вёлся и до того, как
 * длительность стала сохраняться, и рисовать по ним ноль значило бы
 * показать провал там, где просто нет данных.
 *
 * @param {Array<{startedAt?: string, finishedAt?: string}>} history — от новых к старым
 * @param {number} limit
 * @returns {number[]}
 */
export function durationTrend(history, limit = 12) {
  const out = []
  for (const s of history) {
    if (!s.startedAt || !s.finishedAt) continue
    const min = Math.round((new Date(s.finishedAt) - new Date(s.startedAt)) / 60000)
    if (Number.isFinite(min) && min > 0) out.push(min)
    if (out.length === limit) break
  }
  return out.reverse()
}
