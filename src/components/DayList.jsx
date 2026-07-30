import styles from './DayList.module.css'

export default function DayList({ program, todayId, onPick }) {
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
                {isToday && <span className={styles.badge}>сегодня</span>}
              </button>
            </li>
          )
        })}
      </ul>

      {/* Атрибуция обязательна по CC-BY-SA 4.0 — под этой лицензией взяты
          видео, из которых нарезаны анимации упражнений. */}
      <footer className={styles.credits}>
        Анимации: <a href="https://wger.de" className={styles.link}>wger.de</a> (Goulart,{' '}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/" className={styles.link}>CC-BY-SA 4.0</a>)
        и <a href="https://github.com/yuhonas/free-exercise-db" className={styles.link}>free-exercise-db</a>
      </footer>
    </div>
  )
}
