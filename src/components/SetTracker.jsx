import { useState } from 'react'
import styles from './SetTracker.module.css'

export default function SetTracker({ sets, reps, repRange, onClose, onEdit, onClear }) {
  const [editing, setEditing] = useState(null)
  const [min, max] = repRange
  const values = reps ?? Array(sets).fill(null)

  // Тап по пустому кружку закрывает подход на верхней границе диапазона —
  // один тап в хорошем случае. Тап по закрытому открывает правку.
  function handleTap(index) {
    if (values[index] == null) onClose(index, max)
    else setEditing(index)
  }

  const editValue = editing == null ? null : (values[editing] ?? max)

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        {Array.from({ length: sets }, (_, i) => (
          <button
            key={i}
            className={values[i] == null ? styles.circle : `${styles.circle} ${styles.done}`}
            onClick={() => handleTap(i)}
            aria-label={values[i] == null ? `Подход ${i + 1}, не сделан` : `Подход ${i + 1}, ${values[i]} повторений`}
          >
            {values[i] ?? ''}
          </button>
        ))}
      </div>

      {editing != null && (
        <div className={styles.stepper}>
          <button
            className={styles.stepBtn}
            onClick={() => onEdit(editing, Math.max(1, editValue - 1))}
            aria-label="Меньше повторений"
          >−</button>

          <span className={styles.stepValue}>{editValue}</span>

          <button
            className={styles.stepBtn}
            onClick={() => onEdit(editing, editValue + 1)}
            aria-label="Больше повторений"
          >+</button>

          <button className={styles.stepDone} onClick={() => setEditing(null)}>Готово</button>

          <button
            className={styles.stepClear}
            onClick={() => { onClear(editing); setEditing(null) }}
          >Сбросить</button>

          <span className={styles.stepHint}>план {min}–{max}</span>
        </div>
      )}
    </div>
  )
}
