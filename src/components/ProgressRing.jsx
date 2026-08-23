import styles from './ProgressRing.module.css'

const SIZE = 78
const STROKE = 7
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R

/**
 * Кольцо прогресса — доля от плана одним взглядом. Кольцо вместо полоски
 * там, где число само по себе важно: в центре живёт «2/3», а дуга даёт
 * ощущение «сколько осталось» без чтения.
 *
 * Дуга рисуется через stroke-dashoffset, а не через поворот элементов:
 * так она остаётся ровной на любом размере и не требует масштабирования.
 * Пустой план (total = 0) показываем нулевой дугой, а не делим на ноль.
 */
export default function ProgressRing({ value, total, caption }) {
  const share = total > 0 ? Math.min(1, value / total) : 0
  const percent = Math.round(share * 100)

  return (
    <div className={styles.wrap}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        role="img"
        aria-label={`${value} из ${total} — ${percent}%`}
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={STROKE}
        />
        <circle
          className={styles.arc}
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - share)}
        />
      </svg>

      <div className={styles.label} aria-hidden="true">
        <span className={styles.value}>{value}<span className={styles.total}>/{total}</span></span>
        {caption && <span className={styles.caption}>{caption}</span>}
      </div>
    </div>
  )
}
