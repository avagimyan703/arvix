import { formatTime } from '../lib/timer.js'
import styles from './RestTimer.module.css'

export default function RestTimer({ timer, onPause, onResume, onDismiss, onExtend }) {
  if (!timer) return null

  const progress = timer.total > 0 ? 1 - timer.remaining / timer.total : 1

  return (
    <div className={timer.done ? `${styles.bar} ${styles.done}` : styles.bar}>
      <div className={styles.progress} style={{ transform: `scaleX(${progress})` }} />

      <div className={styles.top}>
        <span className={styles.label}>{timer.done ? 'Отдых окончен' : 'Отдых'}</span>
        <span className={styles.time}>{formatTime(timer.remaining)}</span>
        <button className={styles.close} onClick={onDismiss} aria-label="Закрыть таймер">✕</button>
      </div>

      <div className={styles.actions}>
        {/* Работает и после «Отдых окончен» — ожил и продолжил, если ещё не готов */}
        <button className={styles.extend} onClick={() => onExtend(30)}>+30 с</button>

        {!timer.done && (
          <button className={styles.action} onClick={timer.running ? onPause : onResume}>
            {timer.running ? 'Пауза' : 'Дальше'}
          </button>
        )}
      </div>
    </div>
  )
}
