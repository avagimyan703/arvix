import { useEffect } from 'react'
import ExerciseDetail from './ExerciseDetail.jsx'
import styles from './ExerciseSheet.module.css'

/**
 * Техника упражнения — не отдельный экран, а шторка поверх тренировки.
 * Раньше тап по названию уводил с WorkoutScreen целиком: терялся прогресс-
 * бар, позиция скролла, ощущение «я всё ещё здесь». Шторка открывается и
 * закрывается без навигации — тренировка всё это время остаётся под ней
 * как есть.
 */
export default function ExerciseSheet({ onClose, ...detailProps }) {
  // Фон не должен ехать вместе со шторкой, пока она открыта.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <div className={styles.scrim} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <ExerciseDetail {...detailProps} onBack={onClose} />
      </div>
    </div>
  )
}
