/**
 * История тренировок и её выгрузка текстом.
 *
 * Спека v1 сознательно хранила только последнюю сессию по упражнению —
 * этого хватало для двойной прогрессии. Но в методичке основателя есть
 * пункт про анализ недельного объёма, восстановления и слабых мест, а он
 * без истории невыполним. Отсюда этот модуль.
 */

// Сколько тренировок держим. При графике 3×/нед 1000 — это больше шести
// лет: со старым лимитом в 200 история обрезалась бы уже на 16-м месяце,
// молча вытесняя самые ранние тренировки. Одна запись — около 0,5 КБ,
// 1000 записей — не больше полумегабайта, это далеко не предел квоты
// localStorage (обычно 5–10 МБ).
export const HISTORY_LIMIT = 1000

/**
 * finishedAt и note — необязательные: старые вызовы (и тесты) без них
 * по-прежнему работают, оба поля просто не попадают в запись.
 */
export function appendSession(history, current, date, finishedAt = null, note = null) {
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
    finishedAt,
    note: note?.trim() || null,
    exercises,
    athletic: Object.keys(current.athletic ?? {}),
  }

  return [session, ...history].slice(0, HISTORY_LIMIT)
}

/**
 * Длительность тренировки в минутах — для журнала и итогового экрана.
 * null, если не знаем время окончания (старые записи до этой функции).
 */
export function sessionDuration(session) {
  if (!session.startedAt || !session.finishedAt) return null
  const ms = new Date(session.finishedAt) - new Date(session.startedAt)
  return Math.max(1, Math.round(ms / 60000))
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
 * Последние сессии, где встречается конкретное упражнение — короткая справка
 * «как это шло в последний раз» на экране техники. history уже отсортирована
 * от новых к старым, поэтому просто фильтруем и берём первые limit.
 *
 * @param {Array} history
 * @param {string} exerciseId
 * @param {number} limit
 * @returns {Array<{date: string, weight: number|null, reps: Array<number|null>}>}
 */
export function exerciseHistory(history, exerciseId, limit = 5) {
  const rows = []
  for (const session of history) {
    const done = session.exercises[exerciseId]
    if (!done) continue
    rows.push({ date: session.date, weight: done.weight, reps: done.reps })
    if (rows.length >= limit) break
  }
  return rows
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
    const duration = sessionDuration(s)
    const durationPart = duration != null ? ` · ${duration} мин` : ''
    lines.push(`${s.date} · ${dayName(s.dayId)}${durationPart}`)
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
    if (s.note) lines.push(`  Заметка: ${s.note}`)
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
