import ExerciseGif from './ExerciseGif.jsx'
import { useOnline } from '../hooks/useOnline.js'
import styles from './ExerciseDetail.module.css'

// Из ссылки на рилс делаем адрес официального embed-эндпоинта Инстаграма.
// Именно iframe, а не их embed.js: скрипт грузился бы в наше окно и тащил
// трекинг внутрь приложения, а iframe остаётся на их стороне.
function embedUrl(url) {
  const m = String(url).match(/instagram\.com\/(?:[^/]+\/)?(reel|p|tv)\/([\w-]+)/)
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed` : null
}

export default function ExerciseDetail({ exercise, exerciseId, onBack }) {
  const online = useOnline()
  const embed = exercise.video ? embedUrl(exercise.video.url) : null

  // Видео вытесняет гифку, но только когда его реально можно показать.
  // Без сети плеер отрисовался бы пустым прямоугольником, поэтому в зале
  // без связи на его месте снова гифка — она лежит в офлайн-кеше.
  const showVideo = Boolean(embed) && online

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={onBack}>← Назад</button>

      {showVideo ? (
        <div className={styles.embedWrap}>
          {/* Подсказка лежит ПОД плеером и видна только если тот не
              отрисовался: у cross-origin iframe провал загрузки не
              отловить, а пустой прямоугольник читался бы как поломка. */}
          <p className={styles.embedFallbackHint}>
            Плеер не загрузился — открой по ссылке ниже.
          </p>
          <iframe
            className={styles.embed}
            src={embed}
            title={`${exercise.name} — видео-разбор, ${exercise.video.author}`}
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      ) : (
        <ExerciseGif id={exerciseId} name={exercise.name} size="detail" />
      )}

      <h1 className={styles.title}>{exercise.name}</h1>
      <p className={styles.equipment}>{exercise.equipment}</p>

      {exercise.video && (
        <p className={styles.videoNote}>
          {exercise.video.note} ·{' '}
          <a
            className={styles.videoAuthor}
            href={exercise.video.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {exercise.video.author} ↗
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
