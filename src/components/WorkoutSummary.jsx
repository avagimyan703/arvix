import { useState } from 'react'
import { useCountUp } from '../hooks/useCountUp.js'
import { pluralRu } from '../lib/format.js'
import styles from './WorkoutSummary.module.css'

const WORKOUT_FORMS = ['тренировка', 'тренировки', 'тренировок']

/**
 * Экран признания результата сразу после «Завершить тренировку» — момент,
 * который раньше молча уводил обратно на список дней. Показывает только то,
 * что реально произошло: сколько сделано, за сколько, рекорды веса, серию
 * и юбилей — без выдуманных очков и без давления продолжать.
 */
export default function WorkoutSummary({
  dayLabel, doneSets, totalSets, doneCount, totalCount, durationMin, records, streak, milestone, onDone,
}) {
  const sets = useCountUp(doneSets)
  const [note, setNote] = useState('')

  return (
    <div className={styles.wrap}>
      <div className={styles.mark} aria-hidden="true" />

      <h1 className={styles.title}>Тренировка завершена</h1>
      <p className={styles.subtitle}>
        {dayLabel}
        {durationMin != null && ` · ${durationMin} мин`}
      </p>

      <div className={styles.stat}>
        <span className={styles.statValue}>{sets}</span>
        <span className={styles.statLabel}>
          из {totalSets} подходов · {doneCount} из {totalCount} упражнений
        </span>
      </div>

      {records.length > 0 && (
        <ul className={styles.records}>
          {records.map((name) => (
            <li key={name} className={styles.record}>Новый рекорд веса — {name}</li>
          ))}
        </ul>
      )}

      {milestone != null && (
        <p className={styles.milestone}>Это твоя {milestone}-я тренировка</p>
      )}

      {/* Серия видна только положительная и только начиная с 2 — одна
          тренировка «серией» не ощущается, а хвастать нечем. */}
      {streak >= 2 && (
        <p className={styles.streak}>Серия: {streak} {pluralRu(streak, WORKOUT_FORMS)} подряд</p>
      )}

      <textarea
        className={styles.note}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Как прошло? (необязательно)"
        rows={2}
      />

      <button className={styles.done} onClick={() => onDone(note)}>Готово</button>
    </div>
  )
}
