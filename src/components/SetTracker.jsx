import { memo, useRef, useState } from 'react'
import styles from './SetTracker.module.css'

const LONG_PRESS_MS = 450

function SetTracker({ sets, reps, repRange, onClose, onEdit, onClear }) {
  const [editing, setEditing] = useState(null)
  const [min, max] = repRange
  const values = reps ?? Array(sets).fill(null)

  // Долгое нажатие на пустой кружок делает то же, что тап-потом-тап
  // (закрыть на максимуме, затем открыть правку), но одним жестом — когда
  // повторы заведомо не совпадут с планом, не нужно тапать дважды подряд.
  const pressTimeout = useRef(null)
  const longPressedIndex = useRef(null)

  function cancelPress() {
    clearTimeout(pressTimeout.current)
  }

  function startPress(index) {
    if (values[index] != null) return
    longPressedIndex.current = null
    pressTimeout.current = setTimeout(() => {
      longPressedIndex.current = index
      onClose(index, max)
      setEditing(index)
    }, LONG_PRESS_MS)
  }

  // Тап по пустому кружку закрывает подход на верхней границе диапазона —
  // один тап в хорошем случае. Тап по закрытому открывает правку.
  function handleTap(index) {
    cancelPress()
    if (longPressedIndex.current === index) {
      longPressedIndex.current = null
      return
    }
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
            onPointerDown={() => startPress(i)}
            onPointerUp={cancelPress}
            onPointerLeave={cancelPress}
            onPointerCancel={cancelPress}
            onClick={() => handleTap(i)}
            aria-label={values[i] == null ? `Подход ${i + 1}, не сделан. Долгое нажатие — сразу править повторы` : `Подход ${i + 1}, ${values[i]} повторений`}
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

export default memo(SetTracker)
