import { useState } from 'react'
import ReelList from './ReelList.jsx'
import { countByCategory, searchReels } from '../lib/reels.js'
import { pluralRu } from '../lib/format.js'
import styles from './ReelCatalog.module.css'

const REEL_FORMS = ['рилс', 'рилса', 'рилсов']
const FOUND_FORMS = ['найден', 'найдено', 'найдено']

/**
 * Каталог живёт в двух состояниях. Пока не искали — плитки категорий, как
 * было: это оглавление, по нему понятно, что вообще есть. Как только в
 * строке появился запрос или выбран чип — плоский список разборов со всех
 * категорий сразу.
 *
 * Разделение именно такое, потому что искать в двести с лишним записей
 * приходится не «внутри спины», а «где вообще был жим лёжа», и заставлять
 * сначала угадать категорию значит заставлять искать дважды.
 */
export default function ReelCatalog({ library, onPick, onBack }) {
  const [query, setQuery] = useState('')
  const [chip, setChip] = useState(null)

  const counts = countByCategory(library)
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  const searching = query.trim() !== '' || chip !== null
  const results = searching ? searchReels(library, query, chip) : []
  const nameOf = (id) => library.categories.find((c) => c.id === id)?.name ?? id

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={onBack}>← Дни</button>
      <h1 className={styles.title}>Каталог рилсов</h1>
      <p className={styles.subtitle}>
        {searching
          ? `${results.length} ${pluralRu(results.length, REEL_FORMS)} ${pluralRu(results.length, FOUND_FORMS)}`
          : total === 0 ? 'Пока пусто' : `${total} ${pluralRu(total, REEL_FORMS)} по категориям`}
      </p>

      <div className={styles.searchRow}>
        <input
          className={styles.search}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Упражнение или автор"
          aria-label="Поиск по каталогу"
          autoComplete="off"
        />
        {query !== '' && (
          <button className={styles.clear} onClick={() => setQuery('')} aria-label="Очистить поиск">
            ×
          </button>
        )}
      </div>

      {/* Чипы прокручиваются вбок: девять категорий в один ряд на телефоне
          не помещаются, а перенос на вторую строку съел бы пол-экрана до
          первого результата. */}
      <div className={styles.chips}>
        <button
          className={chip === null ? `${styles.chip} ${styles.chipOn}` : styles.chip}
          aria-pressed={chip === null}
          onClick={() => setChip(null)}
        >
          Все
        </button>
        {library.categories.map((c) => (
          counts[c.id] > 0 && (
            <button
              key={c.id}
              className={chip === c.id ? `${styles.chip} ${styles.chipOn}` : styles.chip}
              aria-pressed={chip === c.id}
              onClick={() => setChip(chip === c.id ? null : c.id)}
            >
              {c.name}
            </button>
          )
        ))}
      </div>

      {searching ? (
        results.length > 0 ? (
          <ReelList reels={results} categoryName={chip === null ? nameOf : undefined} />
        ) : (
          <div className={styles.nothing}>
            <p className={styles.nothingText}>
              {chip === null
                ? 'Ничего не нашлось. Попробуй короче — например «жим» вместо «жим гантелей лёжа».'
                : `Ничего не нашлось в категории «${nameOf(chip)}». Возможно, разбор лежит в другой.`}
            </p>
            {/* Сузили категорией и промахнулись — самый частый случай, и
                чинится он одним нажатием, а не переписыванием запроса. */}
            {chip !== null && (
              <button className={styles.reset} onClick={() => setChip(null)}>
                Искать во всех категориях
              </button>
            )}
          </div>
        )
      ) : (
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
      )}
    </div>
  )
}
