import { formatTime } from '../lib/timer.js'
import styles from './RestTimer.module.css'

export default function RestTimer({ timer, onPause, onResume, onDismiss }) {
  if (!timer) return null

  const progress = timer.total > 0 ? 1 - timer.remaining / timer.total : 1

  return (
    <div className={timer.done ? `${styles.bar} ${styles.done}` : styles.bar}>
      <div className={styles.progress} style={{ transform: `scaleX(${progress})` }} />

      <span className={styles.label}>{timer.done ? 'Отдых окончен' : 'Отдых'}</span>
      <span className={styles.time}>{formatTime(timer.remaining)}</span>

      {!timer.done && (
        <button className={styles.action} onClick={timer.running ? onPause : onResume}>
          {timer.running ? 'Пауза' : 'Дальше'}
        </button>
      )}

      <button className={styles.close} onClick={onDismiss} aria-label="Закрыть таймер">✕</button>
    </div>
  )
}
