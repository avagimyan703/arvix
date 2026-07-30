/**
 * История тренировок и её выгрузка текстом.
 *
 * Спека v1 сознательно хранила только последнюю сессию по упражнению —
 * этого хватало для двойной прогрессии. Но в методичке основателя есть
 * пункт про анализ недельного объёма, восстановления и слабых мест, а он
 * без истории невыполним. Отсюда этот модуль.
 */

// Сколько тренировок держим. Три в неделю — это примерно год с запасом.
// Ограничение нужно, чтобы localStorage не разрастался без предела.
export const HISTORY_LIMIT = 200

export function appendSession(history, current, date) {
  if (!current) return history

  const exercises = {}
  for (const [id, reps] of Object.entries(current.reps ?? {})) {
    if (reps.every((r) => r === null || r === undefined)) continue
    exercises[id] = { weight: current.weights?.[id] ?? null, reps }
  }

  const session = {
    date,
    dayId: current.dayId,
    startedAt: current.startedAt,
    exercises,
    athletic: Object.keys(current.athletic ?? {}),
  }

  return [session, ...history].slice(0, HISTORY_LIMIT)
}

/**
 * Сколько рабочих подходов пришлось на каждую группу мышц за период.
 * Считаем по первичным мышцам: именно они определяют, добрал ли ты объём.
 */
export function weekVolume(history, exercises, fromDate, toDate) {
  const volume = {}
  for (const session of history) {
    if (session.date < fromDate || session.date > toDate) continue
    for (const [id, done] of Object.entries(session.exercises)) {
      const sets = done.reps.filter((r) => typeof r === 'number').length
      for (const muscle of exercises[id]?.primary ?? []) {
        volume[muscle] = (volume[muscle] ?? 0) + sets
      }
    }
  }
  return volume
}

/**
 * Дневник простым текстом — чтобы скопировать и отправить на разбор.
 * Формат рассчитан на чтение человеком и моделью, без разметки.
 */
export function exportText(history, program, exercises) {
  if (history.length === 0) return 'История тренировок пуста.'

  const dayName = (dayId) => {
    const d = program.days.find((x) => x.id === dayId)
    return d ? `${d.weekday} — ${d.accent}` : dayId
  }

  const lines = ['ДНЕВНИК ТРЕНИРОВОК', '']

  for (const s of history) {
    lines.push(`${s.date} · ${dayName(s.dayId)}`)
    for (const [id, done] of Object.entries(s.exercises)) {
      const name = exercises[id]?.name ?? id
      const weight = done.weight != null ? `${String(done.weight).replace('.', ',')} кг` : 'без веса'
      const reps = done.reps.map((r) => (r == null ? '—' : r)).join(', ')
      lines.push(`  ${name}: ${weight} × ${reps}`)
    }
    if (s.athletic.length > 0) {
      const names = s.athletic.map((id) => exercises[id]?.name ?? id)
      lines.push(`  Финишер: ${names.join(', ')}`)
    }
    lines.push('')
  }

  // Объём за последние 7 дней от самой свежей тренировки
  const latest = history[0].date
  const from = new Date(latest)
  from.setDate(from.getDate() - 6)
  const fromDate = from.toISOString().slice(0, 10)
  const volume = weekVolume(history, exercises, fromDate, latest)

  const entries = Object.entries(volume).sort((a, b) => b[1] - a[1])
  if (entries.length > 0) {
    lines.push(`ОБЪЁМ ЗА НЕДЕЛЮ (${fromDate} — ${latest}), рабочих подходов:`)
    for (const [muscle, sets] of entries) lines.push(`  ${muscle}: ${sets}`)
  }

  return lines.join('\n')
}
