import { todayDayId, findDay, nextTrainingDay, doneThisWeek } from '../lib/program.js'
import { currentStreak } from '../lib/achievements.js'
import { sessionProgress } from '../lib/workout.js'
import { pluralRu } from '../lib/format.js'
import styles from './DayList.module.css'

const WORKOUT_FORMS = ['тренировка', 'тренировки', 'тренировок']
const DAY_FORMS = ['день', 'дня', 'дней']

/**
 * Главный экран отвечает на три вопроса с одного взгляда: что сегодня,
 * сколько осталось, куда дальше. Один блок сверху (hero) — под текущее
 * состояние: идёт тренировка / сегодня по плану / сегодня отдых. Ниже —
 * компактная неделя для ручного перехода на любой день, не только «свой».
 */
export default function DayList({ program, today, current, history, onPick, onOpenReels, onOpenHistory }) {
  const todayId = todayDayId(today)
  const streak = currentStreak(history)
  const historyCount = history.length

  const currentDay = current ? findDay(program, current.dayId) : null
  const todayDay = !currentDay && todayId ? findDay(program, todayId) : null
  const upcoming = !currentDay && !todayDay ? nextTrainingDay(program, today) : null
  const progress = currentDay ? sessionProgress(currentDay.blocks, current) : null

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>Arvix</h1>
        <p className={styles.subtitle}>{program.title}</p>
        {/* Показываем только положительную серию — если она прервалась,
            молчим, а не сообщаем об этом: тишина лучше чувства вины. */}
        {streak >= 2 && (
          <p className={styles.streak}>Серия: {streak} {pluralRu(streak, WORKOUT_FORMS)} подряд</p>
        )}
      </header>

      {currentDay && (
        <section className={styles.hero}>
          <span className={styles.heroLabel}>Идёт тренировка</span>
          <h2 className={styles.heroTitle}>{currentDay.weekday} · {currentDay.accent}</h2>

          <div className={styles.heroBar}>
            <div
              className={styles.heroBarFill}
              style={{ transform: `scaleX(${progress.totalSets > 0 ? progress.doneSets / progress.totalSets : 0})` }}
            />
          </div>
          <p className={styles.heroMeta}>
            {progress.doneCount} из {progress.totalCount} упражнений · {progress.doneSets} из {progress.totalSets} подходов
          </p>

          <button className={styles.heroAction} onClick={() => onPick(currentDay.id)}>Продолжить</button>
        </section>
      )}

      {todayDay && (
        <section className={styles.hero}>
          <span className={styles.heroLabel}>Сегодня</span>
          <h2 className={styles.heroTitle}>{todayDay.weekday} · {todayDay.accent}</h2>
          <p className={styles.heroMeta}>{todayDay.blocks.length} упражнений · финишер</p>
          <button className={styles.heroAction} onClick={() => onPick(todayDay.id)}>Начать тренировку</button>
        </section>
      )}

      {upcoming && (
        <section className={`${styles.hero} ${styles.heroRest}`}>
          <span className={styles.heroLabel}>Сегодня — отдых</span>
          <h2 className={styles.heroTitle}>{upcoming.day.weekday} · {upcoming.day.accent}</h2>
          <p className={styles.heroMeta}>через {upcoming.inDays} {pluralRu(upcoming.inDays, DAY_FORMS)}</p>
          <button className={styles.heroActionGhost} onClick={() => onPick(upcoming.day.id)}>Смотреть план</button>
        </section>
      )}

      <ul className={styles.week}>
        {program.days.map((day) => {
          const isToday = day.id === todayId
          const isCurrent = day.id === current?.dayId
          const done = !isCurrent && doneThisWeek(history, day.id, today)
          return (
            <li key={day.id}>
              <button className={styles.row} onClick={() => onPick(day.id)}>
                <span className={styles.rowDay}>{day.weekday}</span>
                <span className={styles.rowAccent}>{day.accent}</span>
                {isCurrent && <span className={`${styles.rowTag} ${styles.rowTagLive}`}>идёт</span>}
                {!isCurrent && isToday && <span className={styles.rowTag}>сегодня</span>}
                {!isCurrent && !isToday && done && (
                  <span className={styles.rowDone} aria-label="Сделано на этой неделе">✓</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      <button className={styles.catalog} onClick={onOpenReels}>
        <span className={styles.catalogName}>Каталог рилсов</span>
        <span className={styles.catalogHint}>Разборы по группам мышц</span>
      </button>

      <button className={styles.catalog} onClick={onOpenHistory}>
        <span className={styles.catalogName}>Дневник</span>
        <span className={styles.catalogHint}>
          {historyCount === 0
            ? 'Пока пусто — появится после первой тренировки'
            : `${historyCount} ${pluralRu(historyCount, WORKOUT_FORMS)} · объём за неделю · экспорт`}
        </span>
      </button>
    </div>
  )
}
