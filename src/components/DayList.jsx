import { todayDayId, findDay, nextTrainingDay, doneThisWeek } from '../lib/program.js'
import { currentStreak } from '../lib/achievements.js'
import { sessionProgress } from '../lib/workout.js'
import { pluralRu } from '../lib/format.js'
import ProgressRing from './ProgressRing.jsx'
import Icon from './Icon.jsx'
import styles from './DayList.module.css'

const WORKOUT_FORMS = ['тренировка', 'тренировки', 'тренировок']
const DAY_FORMS = ['день', 'дня', 'дней']

/** Объём дня по плану — числа для плиток берём из программы, не на глаз. */
function dayStats(day) {
  return {
    exercises: day.blocks.length,
    sets: day.blocks.reduce((sum, b) => sum + b.sets, 0),
    athletic: day.athletic.length,
  }
}

/**
 * Главный экран отвечает на три вопроса с одного взгляда: что сегодня,
 * сколько осталось, куда дальше. Сверху — неделя целиком в кольце и двух
 * плитках, ниже один блок под текущее состояние (идёт тренировка / сегодня
 * по плану / сегодня отдых), затем компактная неделя для ручного перехода
 * на любой день, не только «свой».
 *
 * Переходы в каталог и дневник живут в нижней панели, а не карточками здесь:
 * дублировать их в двух местах — лишний шум на первом экране.
 */
export default function DayList({ program, today, current, history, onPick }) {
  const todayId = todayDayId(today)
  const streak = currentStreak(history)
  const historyCount = history.length

  const currentDay = current ? findDay(program, current.dayId) : null
  const todayDay = !currentDay && todayId ? findDay(program, todayId) : null
  const upcoming = !currentDay && !todayDay ? nextTrainingDay(program, today) : null
  const progress = currentDay ? sessionProgress(currentDay.blocks, current) : null

  // Кольцо считает сделанные дни программы на этой неделе. Идущая тренировка
  // ещё не сделана — она попадёт в счёт только после «Завершить».
  const doneDays = program.days.filter((d) => d.id !== current?.dayId && doneThisWeek(history, d.id, today)).length

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>Arvix</h1>
        <p className={styles.subtitle}>{program.title}</p>
      </header>

      <section className={styles.summary}>
        <span className={styles.summaryLabel}>Эта неделя</span>
        <div className={styles.summaryBody}>
          <ProgressRing value={doneDays} total={program.days.length} caption="дней" />
          <div className={styles.tiles}>
            {/* Показываем только положительную серию — если она прервалась,
                молчим, а не сообщаем об этом: тишина лучше чувства вины. */}
            <div className={styles.tile}>
              <span className={styles.tileIcon}><Icon name="flame" size={18} /></span>
              <span className={styles.tileValue}>{streak >= 2 ? streak : '—'}</span>
              <span className={styles.tileName}>
                {streak >= 2 ? pluralRu(streak, WORKOUT_FORMS) + ' подряд' : 'серия'}
              </span>
            </div>
            <div className={styles.tile}>
              <span className={styles.tileIcon}><Icon name="trophy" size={18} /></span>
              <span className={styles.tileValue}>{historyCount}</span>
              <span className={styles.tileName}>всего в дневнике</span>
            </div>
          </div>
        </div>
      </section>

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

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{progress.doneCount}<span className={styles.statOf}>/{progress.totalCount}</span></span>
              <span className={styles.statName}>упражнений</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{progress.doneSets}<span className={styles.statOf}>/{progress.totalSets}</span></span>
              <span className={styles.statName}>подходов</span>
            </div>
          </div>

          <button className={styles.heroAction} onClick={() => onPick(currentDay.id)}>Продолжить</button>
        </section>
      )}

      {(todayDay || upcoming) && (() => {
        const day = todayDay ?? upcoming.day
        const stats = dayStats(day)
        const rest = !todayDay
        return (
          <section className={rest ? `${styles.hero} ${styles.heroRest}` : styles.hero}>
            <span className={styles.heroLabel}>{rest ? 'Сегодня — отдых' : 'Сегодня'}</span>
            <h2 className={styles.heroTitle}>{day.weekday} · {day.accent}</h2>
            {rest && (
              <p className={styles.heroMeta}>через {upcoming.inDays} {pluralRu(upcoming.inDays, DAY_FORMS)}</p>
            )}

            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{stats.exercises}</span>
                <span className={styles.statName}>упражнений</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{stats.sets}</span>
                <span className={styles.statName}>подходов</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{stats.athletic}</span>
                <span className={styles.statName}>финишеров</span>
              </div>
            </div>

            <button
              className={rest ? styles.heroActionGhost : styles.heroAction}
              onClick={() => onPick(day.id)}
            >
              {rest ? 'Смотреть план' : 'Начать тренировку'}
            </button>
          </section>
        )
      })()}

      <ul className={styles.week}>
        {program.days.map((day) => {
          const isToday = day.id === todayId
          const isCurrent = day.id === current?.dayId
          const done = !isCurrent && doneThisWeek(history, day.id, today)
          const stats = dayStats(day)
          return (
            <li key={day.id}>
              <button className={styles.row} onClick={() => onPick(day.id)}>
                <span className={styles.rowIcon}><Icon name="sets" size={20} /></span>
                <span className={styles.rowText}>
                  <span className={styles.rowDay}>{day.weekday}</span>
                  <span className={styles.rowAccent}>{day.accent} · {stats.exercises} упр.</span>
                </span>
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
    </div>
  )
}
