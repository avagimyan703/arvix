import styles from './BarChart.module.css'

/**
 * Столбики по неделям — видно ритм, а не только последнюю цифру.
 *
 * Высота считается от максимума ряда, а не от абсолютной шкалы: у одного
 * человека потолок три тренировки в неделю, у другого шесть, и общая шкала
 * половине пользователей рисовала бы вечно приплюснутый график. Нулевая
 * неделя всё равно получает тонкую полоску — иначе пропуск неотличим от
 * края графика.
 *
 * Цифры продублированы под столбцами: на графике без осей высота сама по
 * себе не читается, а считать пиксели глазами никто не станет.
 */
export default function BarChart({ bars, caption }) {
  if (bars.length === 0) return null

  const max = Math.max(...bars.map((b) => b.value), 1)

  return (
    <div className={styles.chart}>
      <div className={styles.bars} role="img" aria-label={caption}>
        {bars.map((bar, i) => {
          const last = i === bars.length - 1
          return (
            <div key={bar.label} className={styles.col}>
              <span className={styles.value}>{bar.value}</span>
              <div className={styles.track}>
                <div
                  className={last ? `${styles.bar} ${styles.barLast}` : styles.bar}
                  style={{ height: `${Math.max(3, (bar.value / max) * 100)}%` }}
                />
              </div>
              <span className={last ? `${styles.label} ${styles.labelLast}` : styles.label}>
                {bar.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
