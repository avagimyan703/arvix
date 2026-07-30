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
    </div>
  )
}
