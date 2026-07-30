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

      {exercise.video && (
        <section className={styles.videoSection}>
          <h2 className={styles.heading}>Видео-разбор</h2>
          <p className={styles.videoNote}>{exercise.video.note}</p>

          {online && embed ? (
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
            // Пустой прямоугольник вместо плеера выглядел бы как поломка,
            // поэтому без сети честно говорим, чего не хватает.
            <p className={styles.videoOffline}>
              Нет сети — видео появится, когда связь вернётся. Техника выше работает офлайн.
            </p>
          )}

          <a
            className={styles.videoFallback}
            href={exercise.video.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Открыть в Instagram ↗ · {exercise.video.author}
          </a>
        </section>
      )}
    </div>
  )
}
