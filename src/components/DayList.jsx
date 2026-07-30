import styles from './DayList.module.css'

export default function DayList({
  program, todayId, currentDayId, onPick, onOpenReels, onOpenHistory, historyCount,
}) {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>Arvix</h1>
        <p className={styles.subtitle}>{program.title}</p>
      </header>

      <ul className={styles.list}>
        {program.days.map((day) => {
          const isToday = day.id === todayId
          return (
            <li key={day.id}>
              <button
                className={isToday ? `${styles.card} ${styles.today}` : styles.card}
                onClick={() => onPick(day.id)}
              >
                <span className={styles.weekday}>{day.weekday}</span>
                <span className={styles.accent}>{day.accent}</span>
                <span className={styles.count}>
                  {day.blocks.length} упражнений · финишер
                </span>
                {/* Незавершённая тренировка важнее отметки «сегодня»:
                    она подсказывает, куда вернуться. */}
                {day.id === currentDayId
                  ? <span className={`${styles.badge} ${styles.badgeLive}`}>идёт</span>
                  : isToday && <span className={styles.badge}>сегодня</span>}
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
            : `${historyCount} ${plural(historyCount)} · объём за неделю · экспорт`}
        </span>
      </button>
    </div>
  )
}

function plural(n) {
  const d = n % 10
  const h = n % 100
  if (d === 1 && h !== 11) return 'тренировка'
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return 'тренировки'
  return 'тренировок'
}
