import ReelPlayer from './ReelPlayer.jsx'
import { useOnline } from '../hooks/useOnline.js'
import { reelForExercise } from '../lib/reels.js'
import styles from './ExerciseDetail.module.css'

export default function ExerciseDetail({ exercise, exerciseId, library, onBack }) {
  const online = useOnline()
  const reel = reelForExercise(library, exercise)

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={onBack}>← Назад</button>

      {reel && online && (
        <ReelPlayer reel={reel} title={`${exercise.name} — разбор, ${reel.author}`} />
      )}

      {reel && !online && (
        // Плеер без сети отрисовался бы пустым прямоугольником, поэтому
        // вместо него говорим, чего не хватает. Текст ниже — в кеше.
        <p className={styles.noVideo}>
          Нет сети — видео появится, когда связь вернётся. Техника ниже работает офлайн.
        </p>
      )}

      {!reel && (
        <p className={styles.noVideo}>Видео к этому упражнению пока не добавлено.</p>
      )}

      <h1 className={styles.title}>{exercise.name}</h1>
      <p className={styles.equipment}>{exercise.equipment}</p>

      {reel && (
        <p className={styles.videoNote}>
          {reel.note} ·{' '}
          <a
            className={styles.videoAuthor}
            href={reel.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {reel.author} ↗
          </a>
        </p>
      )}

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
