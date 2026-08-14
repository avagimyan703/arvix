import { useState } from 'react'
import { exportText, weekVolume, sessionDuration } from '../lib/history.js'
import { formatWeight, pluralRu } from '../lib/format.js'
import styles from './HistoryScreen.module.css'

const WORKOUT_FORMS = ['тренировка', 'тренировки', 'тренировок']

// Сколько последних тренировок реально рисуем на экране. С годами дневник
// растёт на тысячи записей — рендерить их все в DOM разом заметно тормозит
// прокрутку на слабых телефонах. Экспорт (кнопка ниже) при этом берёт всю
// историю целиком, лимит касается только того, что видно на этом экране.
const VISIBLE_LIMIT = 60

export default function HistoryScreen({
  history, program, exercises, onDelete, onWeight, onRep, onBack,
}) {
  const [copied, setCopied] = useState(false)
  // Индекс правимой записи, не флаг: открытой может быть только одна, иначе
  // дневник превращается в поле из десятков одинаковых числовых полей.
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  // visible — префикс history, поэтому индекс в нём совпадает с индексом в
  // полной истории. Правка адресуется именно им, так что срез обязан
  // остаться префиксом: любая сортировка или фильтр здесь сломают адресацию.
  const visible = history.slice(0, VISIBLE_LIMIT)

  function closeEditor() {
    setEditing(null)
    setConfirmDelete(null)
  }

  function handleDelete(index) {
    onDelete(index)
    closeEditor()
  }

  const num = (value) => (value === '' ? null : Number(value))

  const dayLabel = (dayId) => {
    const d = program.days.find((x) => x.id === dayId)
    return d ? `${d.weekday} · ${d.accent}` : dayId
  }

  async function copy() {
    const text = exportText(history, program, exercises)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Буфер обмена может быть недоступен без https или без разрешения.
      // Показываем текст в новом окне, чтобы скопировать руками, а не молчим.
      const w = window.open('', '_blank')
      if (w) {
        w.document.write(`<pre style="white-space:pre-wrap;font:14px monospace;padding:16px">${
          text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
        }</pre>`)
        w.document.close()
      }
    }
  }

  // Объём за последние 7 дней от самой свежей тренировки
  const volume = (() => {
    if (history.length === 0) return []
    const latest = history[0].date
    const from = new Date(latest)
    from.setDate(from.getDate() - 6)
    const v = weekVolume(history, exercises, from.toISOString().slice(0, 10), latest)
    return Object.entries(v).sort((a, b) => b[1] - a[1])
  })()

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={onBack}>← Дни</button>
      <h1 className={styles.title}>Дневник</h1>
      <p className={styles.subtitle}>
        {history.length === 0 ? 'Пока пусто' : `${history.length} ${pluralRu(history.length, WORKOUT_FORMS)}`}
      </p>

      {history.length > 0 && (
        <>
          <button className={styles.copy} onClick={copy}>
            {copied ? 'Скопировано ✓' : 'Скопировать для разбора'}
          </button>

          {volume.length > 0 && (
            <section className={styles.volume}>
              <h2 className={styles.heading}>Объём за неделю</h2>
              <ul className={styles.volumeList}>
                {volume.map(([muscle, sets]) => (
                  <li key={muscle} className={styles.volumeRow}>
                    <span>{muscle}</span>
                    <span className={styles.sets}>{sets}</span>
                  </li>
                ))}
              </ul>
              <p className={styles.volumeHint}>Рабочих подходов по первичным мышцам</p>
            </section>
          )}

          <ul className={styles.list}>
            {visible.map((s, i) => {
              const duration = sessionDuration(s)
              const open = editing === i
              return (
                <li key={`${s.date}-${i}`} className={styles.session}>
                  <div className={styles.sessionHead}>
                    <span className={styles.date}>{s.date}</span>
                    <span className={styles.day}>
                      {dayLabel(s.dayId)}{duration != null && ` · ${duration} мин`}
                    </span>
                  </div>

                  {open ? (
                    <ul className={styles.exercises}>
                      {Object.entries(s.exercises).map(([id, done]) => (
                        <li key={id} className={styles.exerciseEdit}>
                          <span className={styles.exName}>{exercises[id]?.name ?? id}</span>
                          <div className={styles.fields}>
                            <label className={styles.field}>
                              <span className={styles.fieldLabel}>кг</span>
                              <input
                                className={styles.input}
                                type="number"
                                inputMode="decimal"
                                step="0.5"
                                value={done.weight ?? ''}
                                placeholder="—"
                                onChange={(e) => onWeight(i, id, num(e.target.value))}
                              />
                            </label>
                            {done.reps.map((r, k) => (
                              <label key={k} className={styles.field}>
                                <span className={styles.fieldLabel}>{k + 1}</span>
                                <input
                                  className={styles.input}
                                  type="number"
                                  inputMode="numeric"
                                  value={r ?? ''}
                                  placeholder="—"
                                  onChange={(e) => onRep(i, id, k, num(e.target.value))}
                                />
                              </label>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className={styles.exercises}>
                      {Object.entries(s.exercises).map(([id, done]) => (
                        <li key={id} className={styles.exercise}>
                          <span className={styles.exName}>{exercises[id]?.name ?? id}</span>
                          <span className={styles.exData}>
                            {done.weight != null ? `${formatWeight(done.weight)} кг · ` : ''}
                            {done.reps.map((r) => (r == null ? '—' : r)).join(', ')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {s.athletic.length > 0 && (
                    <p className={styles.athletic}>
                      Финишер: {s.athletic.map((id) => exercises[id]?.name ?? id).join(', ')}
                    </p>
                  )}
                  {s.note && <p className={styles.sessionNote}>«{s.note}»</p>}

                  {open ? (
                    <div className={styles.editBar}>
                      {/* Два шага, как при отмене тренировки: один случайный
                          тап не должен стирать состоявшийся день. */}
                      {confirmDelete === i ? (
                        <>
                          <button className={styles.deleteConfirm} onClick={() => handleDelete(i)}>
                            Да, удалить
                          </button>
                          <button className={styles.editDone} onClick={() => setConfirmDelete(null)}>
                            Нет
                          </button>
                        </>
                      ) : (
                        <>
                          <button className={styles.delete} onClick={() => setConfirmDelete(i)}>
                            Удалить тренировку
                          </button>
                          <button className={styles.editDone} onClick={closeEditor}>
                            Готово
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <button
                      className={styles.edit}
                      onClick={() => { setEditing(i); setConfirmDelete(null) }}
                    >
                      Изменить
                    </button>
                  )}
                </li>
              )
            })}
          </ul>

          {history.length > VISIBLE_LIMIT && (
            <p className={styles.moreHint}>
              Показаны последние {VISIBLE_LIMIT} — вся история целиком есть в «Скопировать для разбора» выше.
            </p>
          )}
        </>
      )}
    </div>
  )
}
