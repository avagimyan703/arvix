// Индексы Date#getDay: 0 — воскресенье, 2 — вторник, 4 — четверг
const WEEKDAY_TO_DAY = { 0: 'sun', 2: 'tue', 4: 'thu' }

export function todayDayId(date) {
  return WEEKDAY_TO_DAY[date.getDay()] ?? null
}

export function findDay(program, dayId) {
  return program.days.find((d) => d.id === dayId) ?? null
}
