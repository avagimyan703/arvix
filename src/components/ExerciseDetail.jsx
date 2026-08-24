import ReelPlayer from './ReelPlayer.jsx'
import { useOnline } from '../hooks/useOnline.js'
import { reelForExercise } from '../lib/reels.js'
import { suggestWeight } from '../lib/progression.js'
import { bestSession } from '../lib/achievements.js'
import { exerciseHistory } from '../lib/history.js'
import { formatWeight } from '../lib/format.js'
import { platesFor } from '../lib/plates.js'
import { warmupSets } from '../lib/warmup.js'
import { sparklinePoints } from '../lib/sparkline.js'
import styles from './ExerciseDetail.module.css'

/**
 * Экран одного упражнения — не только техника, но и личная статистика по
 * нему: что было в прошлый раз, лучший результат, стоит ли сегодня прибавить
 * вес, что повесить на штангу и с чего размяться. Это то, что реально хочется
 * знать между подходами, а не только при первом знакомстве с движением.
 */
export default function ExerciseDetail({
  exercise, exerciseId, library, block, lastSession, history, currentWeight, onBack,
}) {
  const online = useOnline()
  const reel = reelForExercise(library, exercise)
  const best = bestSession(history, exerciseId)
  const recent = exerciseHistory(history, exerciseId, 5)
  // Рекомендация появляется, только если известен день (сеты/повторы плана)
  // — без него сравнивать прошлый результат не с чем.
  const suggestion = block ? suggestWeight(lastSession, block, exercise.weightStep, currentWeight) : null

  // Блины и разминка — от веса, который уже стоит в поле сегодня. Пусто,
  // пока вес не введён (тренировка ещё не началась) — считать не от чего.
  const plates = exercise.barbell ? platesFor(currentWeight) : null
  const warmup = warmupSets(currentWeight, exercise.weightStep)

  const trend = exerciseHistory(history, exerciseId, 20)
    .map((row) => row.weight)
    .filter((w) => w != null)
    .reverse()
  const spark = sparklinePoints(trend)

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={onBack}>← Тренировка</button>

      <h1 className={styles.title}>{exercise.name}</h1>
      <p className={styles.equipment}>{exercise.equipment}</p>

      {(lastSession || best) && (
        <div className={styles.stats}>
          {lastSession && (
            <div className={styles.stat}>
              <span className={styles.statLabel}>Прошлый раз</span>
              <span className={styles.statValue}>{formatWeight(lastSession.weight)} кг</span>
              <span className={styles.statMeta}>{formatReps(lastSession.reps)} · {lastSession.date}</span>
            </div>
          )}

          {best && (
            <div className={styles.stat}>
              <span className={styles.statLabel}>Личный рекорд</span>
              <span className={styles.statValue}>{formatWeight(best.weight)} кг</span>
              <span className={styles.statMeta}>{formatReps(best.reps)} · {best.date}</span>
            </div>
          )}
        </div>
      )}

      {/* Порядок ниже — по срочности, а не по важности: что делать прямо
          сейчас (сколько добавить, что повесить на штангу, чем размяться)
          идёт раньше, чем то, что интересно посмотреть, но не требует
          действия в эту секунду (тренд, видео, теория). */}
      {suggestion != null && (
        <p className={styles.suggestion}>
          Все плановые подходы на {block.reps[1]} — в следующий раз можно {formatWeight(suggestion)} кг.
        </p>
      )}

      {(plates || warmup.length > 0) && (
        <div className={styles.prep}>
          {plates && (
            <div className={styles.prepRow}>
              <span className={styles.prepLabel}>Блины на сторону</span>
              <span className={styles.prepValue}>
                {plates.perSide.length > 0 ? plates.perSide.join(' + ') : '—'} кг
              </span>
            </div>
          )}

          {warmup.length > 0 && (
            <div className={styles.prepRow}>
              <span className={styles.prepLabel}>Разминка</span>
              <span className={styles.prepValue}>
                {warmup.map((s) => `${formatWeight(s.weight)}×${s.reps}`).join(' · ')}
              </span>
            </div>
          )}
        </div>
      )}

      {spark && (
        <div className={styles.trend}>
          <span className={styles.trendLabel}>Вес по тренировкам</span>
          <svg className={styles.trendSvg} viewBox="0 0 240 48" preserveAspectRatio="none" aria-hidden="true">
            <line x1="0" y1="24" x2="240" y2="24" className={styles.trendGrid} />
            <polyline points={spark.points} className={styles.trendLine} />
            <circle cx={spark.last.x} cy={spark.last.y} r="3" className={styles.trendDot} />
          </svg>
        </div>
      )}

      {reel && online && (
        <div className={styles.video}>
          <ReelPlayer reel={reel} title={`${exercise.name} — разбор, ${reel.author}`} />
          <p className={styles.videoCaption}>
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
        </div>
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

      {/* У упражнения из каталога разобранной техники нет — там её заменяет
          сам ролик выше. Пустые заголовки «Как делать» и «Частые ошибки»
          обещали бы разбор, которого не будет. */}
      {exercise.steps.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.heading}>Как делать</h2>
          <ol className={styles.steps}>
            {exercise.steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </section>
      )}

      {exercise.mistakes.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.heading}>Частые ошибки</h2>
          <ul className={styles.mistakes}>
            {exercise.mistakes.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.heading}>Работают мышцы</h2>
        <p className={styles.muscles}>
          <strong>{exercise.primary.join(', ')}</strong>
          {exercise.secondary.length > 0 && <> · {exercise.secondary.join(', ')}</>}
        </p>
      </section>

      {recent.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.heading}>История</h2>
          <ul className={styles.history}>
            {recent.map((row, i) => (
              <li key={i} className={styles.historyRow}>
                <span className={styles.historyDate}>{row.date}</span>
                <span className={styles.historyData}>
                  {row.weight != null ? `${formatWeight(row.weight)} кг · ` : ''}{formatReps(row.reps)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {exercise.tip && <p className={styles.tip}>{exercise.tip}</p>}
    </div>
  )
}

function formatReps(reps) {
  return reps.map((r) => (r == null ? '—' : r)).join(', ')
}
