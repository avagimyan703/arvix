import { useState } from 'react'
import { exportText, weekVolume } from '../lib/history.js'
import { formatWeight } from '../lib/format.js'
import styles from './HistoryScreen.module.css'

export default function HistoryScreen({ history, program, exercises, onBack }) {
  const [copied, setCopied] = useState(false)

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
        {history.length === 0 ? 'Пока пусто' : `${history.length} ${plural(history.length)}`}
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
            {history.map((s, i) => (
              <li key={`${s.date}-${i}`} className={styles.session}>
                <div className={styles.sessionHead}>
                  <span className={styles.date}>{s.date}</span>
                  <span className={styles.day}>{dayLabel(s.dayId)}</span>
                </div>
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
                {s.athletic.length > 0 && (
                  <p className={styles.athletic}>
                    Финишер: {s.athletic.map((id) => exercises[id]?.name ?? id).join(', ')}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function plural(n) {
  const d = n % 10
  const h = n % 100
  if (d === 1 && h !== 11) return 'тренировка'
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return 'тренировки'
  return 'тренировок'
}
