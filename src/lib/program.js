// Индексы Date#getDay: 0 — воскресенье, 2 — вторник, 4 — четверг
const WEEKDAY_TO_DAY = { 0: 'sun', 2: 'tue', 4: 'thu' }
const DAY_TO_WEEKDAY = { tue: 2, thu: 4, sun: 0 }

export function todayDayId(date) {
  return WEEKDAY_TO_DAY[date.getDay()] ?? null
}

export function findDay(program, dayId) {
  return program.days.find((d) => d.id === dayId) ?? null
}

/**
 * Ближайший тренировочный день после date — сама запись дня и число дней
 * до неё. Нужен для дня отдыха: тренировки сегодня нет, но должно быть
 * понятно, когда следующая.
 *
 * @param {{days: Array}} program
 * @param {Date} date
 * @returns {{day: object, inDays: number}|null}
 */
export function nextTrainingDay(program, date) {
  const todayNum = date.getDay()
  let best = null
  for (const day of program.days) {
    const dayNum = DAY_TO_WEEKDAY[day.id]
    if (dayNum == null) continue
    // || 7: если day — это сегодня, ищем следующее наступление, а не «через 0 дней»
    const inDays = (dayNum - todayNum + 7) % 7 || 7
    if (best == null || inDays < best.inDays) best = { day, inDays }
  }
  return best
}

/**
 * Выполнена ли тренировка этого дня недели с момента её последнего
 * наступления (включая сегодня) — «сделано на этой неделе» без привязки
 * к календарной неделе пн–вс: цикл вт/чт/вс сам задаёт себе границы.
 *
 * @param {Array<{dayId: string, date: string}>} history
 * @param {string} dayId
 * @param {Date} date
 * @returns {boolean}
 */
export function doneThisWeek(history, dayId, date) {
  const dayNum = DAY_TO_WEEKDAY[dayId]
  if (dayNum == null) return false

  const diff = (date.getDay() - dayNum + 7) % 7
  const since = new Date(date)
  since.setDate(since.getDate() - diff)
  const sinceStr = since.toISOString().slice(0, 10)

  return history.some((s) => s.dayId === dayId && s.date >= sinceStr)
}
