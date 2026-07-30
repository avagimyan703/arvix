import ExerciseGif from './ExerciseGif.jsx'
import styles from './ExerciseDetail.module.css'

export default function ExerciseDetail({ exercise, exerciseId, onBack }) {
  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={onBack}>← Назад</button>

      <ExerciseGif id={exerciseId} name={exercise.name} size="detail" />

      <h1 className={styles.title}>{exercise.name}</h1>
      <p className={styles.equipment}>{exercise.equipment}</p>

      <section className={styles.section}>
        <h2 className={styles.heading}>Как делать</h2>
        <ol className={styles.steps}>
          {exercise.steps.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Частые ошибки</h2>
        <ul className={styles.mistakes}>
          {exercise.mistakes.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Работают мышцы</h2>
        <p className={styles.muscles}>
          <strong>{exercise.primary.join(', ')}</strong>
          {exercise.secondary.length > 0 && <> · {exercise.secondary.join(', ')}</>}
        </p>
      </section>

      <p className={styles.tip}>{exercise.tip}</p>
    </div>
  )
}
