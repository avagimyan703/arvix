import ExerciseGif from './ExerciseGif.jsx'
import styles from './AthleticBlock.module.css'

export default function AthleticBlock({ items, exercises, done, onToggle, onOpen }) {
  return (
    <section className={styles.block}>
      <h2 className={styles.heading}>Атлетический финишер</h2>
      <p className={styles.note}>5–10 минут. Не в ущерб восстановлению.</p>

      <ul className={styles.list}>
        {items.map((item) => {
          const exercise = exercises[item.exercise]
          const isDone = Boolean(done?.[item.exercise])
          return (
            <li key={item.exercise} className={isDone ? `${styles.card} ${styles.done}` : styles.card}>
              <button
                className={styles.gifBtn}
                onClick={() => onOpen(item.exercise)}
                aria-label={`Техника: ${exercise.name}`}
              >
                <ExerciseGif id={item.exercise} name={exercise.name} />
              </button>

              <div className={styles.meta}>
                <span className={styles.name}>{exercise.name}</span>
                <span className={styles.format}>{item.format} · отдых {item.rest} с</span>
              </div>

              <button
                className={styles.check}
                onClick={() => onToggle(item.exercise)}
                aria-label={isDone ? 'Снять отметку' : 'Отметить выполненным'}
              >
                {isDone ? '✓' : ''}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
