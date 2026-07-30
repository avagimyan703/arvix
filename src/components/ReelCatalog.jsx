import { countByCategory } from '../lib/reels.js'
import styles from './ReelCatalog.module.css'

export default function ReelCatalog({ library, onPick, onBack }) {
  const counts = countByCategory(library)
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={onBack}>← Дни</button>
      <h1 className={styles.title}>Каталог рилсов</h1>
      <p className={styles.subtitle}>
        {total === 0 ? 'Пока пусто' : `${total} ${plural(total)} по категориям`}
      </p>

      <ul className={styles.list}>
        {library.categories.map((c) => {
          const n = counts[c.id] ?? 0
          return (
            <li key={c.id}>
              <button
                className={n === 0 ? `${styles.card} ${styles.empty}` : styles.card}
                onClick={() => onPick(c.id)}
                disabled={n === 0}
              >
                <span className={styles.name}>{c.name}</span>
                <span className={styles.count}>{n === 0 ? '—' : n}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function plural(n) {
  const d = n % 10
  const h = n % 100
  if (d === 1 && h !== 11) return 'рилс'
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return 'рилса'
  return 'рилсов'
}
