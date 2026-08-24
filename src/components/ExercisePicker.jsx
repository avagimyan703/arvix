import { useMemo, useState } from 'react'
import styles from './ExercisePicker.module.css'

const normalize = (s) => String(s ?? '').toLowerCase().replace(/ё/g, 'е')

/**
 * Состав тренировки на сегодня. План дня — предложение, а не приговор:
 * тренажёр занят, плечо ноет, захотелось другого — здесь это решается,
 * не переписывая программу.
 *
 * Выбирать можно и из библиотеки, и из каталога разборов. У библиотечного
 * упражнения разобрана техника, свой шаг веса и параметры подходов из
 * программы; у каталожного вместо техники сам ролик и общие подходы.
 * Разница помечена, чтобы выбор был осознанным, а не сюрпризом на месте.
 *
 * Выбранное всегда сверху и всегда доступно: иначе снять лишнее можно было
 * бы, только вспомнив, в какой группе оно лежало.
 *
 * Упражнение, по которому уже закрыт хотя бы один подход, снять нельзя —
 * иначе выбор молча стирал бы сделанную работу.
 */
export default function ExercisePicker({ exercises, blockFor, dayBlocks, picked, locked, onSave, onClose }) {
  const [chosen, setChosen] = useState(() => new Set(picked))
  const [query, setQuery] = useState('')

  const dayOrder = useMemo(() => dayBlocks.map((b) => b.exercise), [dayBlocks])

  // Порядок выполнения: сперва то, что стоит в плане дня, затем добавленное
  // в порядке библиотеки — так своё не вклинивается в середину привычного.
  const order = useMemo(() => {
    const all = Object.keys(exercises)
    return [...dayOrder, ...all.filter((id) => !dayOrder.includes(id))]
  }, [exercises, dayOrder])

  const chosenIds = useMemo(() => order.filter((id) => chosen.has(id)), [order, chosen])

  const matches = useMemo(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean)
    const rest = order.filter((id) => !chosen.has(id) && blockFor(id))
    if (tokens.length === 0) return null
    return rest.filter((id) => {
      const hay = normalize(exercises[id].name)
      return tokens.every((t) => hay.includes(t))
    })
  }, [query, order, chosen, exercises, blockFor])

  // Без запроса показываем всё: библиотеку по мышцам, каталог по категориям.
  // Разборы держим отдельной секцией, а не подмешиваем к библиотеке —
  // названия групп у них разного происхождения («Грудные» из библиотеки и
  // «Грудь» из каталога), и рядом это читалось бы как две разные мышцы.
  const idle = useMemo(() => {
    if (matches !== null) return null
    const rest = order.filter((id) => !chosen.has(id) && blockFor(id))

    const byGroup = (ids) => {
      const groups = {}
      for (const id of ids) {
        const name = exercises[id].primary[0] ?? 'Прочее'
        ;(groups[name] = groups[name] ?? []).push(id)
      }
      return Object.entries(groups)
    }

    const catalog = rest.filter((i) => exercises[i].fromCatalog)
    return {
      library: byGroup(rest.filter((i) => !exercises[i].fromCatalog)),
      catalog: byGroup(catalog),
      catalogTotal: catalog.length,
    }
  }, [matches, order, chosen, exercises, blockFor])

  function toggle(id) {
    if (locked.has(id)) return
    setChosen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function row(id) {
    const on = chosen.has(id)
    const block = blockFor(id)
    const isLocked = locked.has(id)
    const ex = exercises[id]
    return (
      <li key={id}>
        <button
          className={on ? `${styles.row} ${styles.rowOn}` : styles.row}
          onClick={() => toggle(id)}
          aria-pressed={on}
          disabled={isLocked}
        >
          <span className={on ? `${styles.mark} ${styles.markOn}` : styles.mark} aria-hidden="true">
            {on ? '✓' : ''}
          </span>
          <span className={styles.text}>
            <span className={styles.name}>{ex.name}</span>
            <span className={styles.meta}>
              {block ? `${block.sets} × ${block.reps[0]}–${block.reps[1]}` : 'без плана'}
              {ex.fromCatalog && ` · ${ex.primary[0]} · из каталога`}
              {isLocked && ' · уже есть подходы'}
            </span>
          </span>
        </button>
      </li>
    )
  }

  return (
    <div className={styles.picker}>
      <h2 className={styles.title}>Состав тренировки</h2>
      <p className={styles.hint}>
        Программа не изменится — это только на сегодня. Кроме библиотеки можно взять любой разбор
        из каталога: техникой там служит сам ролик, подходы общие.
      </p>

      <section className={styles.group}>
        <h3 className={styles.groupName}>Выбрано · {chosenIds.length}</h3>
        <ul className={styles.list}>{chosenIds.map(row)}</ul>
      </section>

      <div className={styles.searchRow}>
        <input
          className={styles.search}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Найти упражнение или разбор"
          aria-label="Поиск по упражнениям"
          autoComplete="off"
        />
        {query !== '' && (
          <button className={styles.clear} onClick={() => setQuery('')} aria-label="Очистить поиск">×</button>
        )}
      </div>

      {matches !== null ? (
        <section className={styles.group}>
          <h3 className={styles.groupName}>Найдено · {matches.length}</h3>
          {matches.length > 0
            ? <ul className={styles.list}>{matches.map(row)}</ul>
            : <p className={styles.nothing}>Ничего не нашлось. Попробуй короче — например «жим».</p>}
        </section>
      ) : (
        <>
          {idle.library.map(([muscle, ids]) => (
            <section key={muscle} className={styles.group}>
              <h3 className={styles.groupName}>{muscle}</h3>
              <ul className={styles.list}>{ids.map(row)}</ul>
            </section>
          ))}

          {idle.catalogTotal > 0 && (
            <>
              <h3 className={styles.divider}>Из каталога · {idle.catalogTotal}</h3>
              {idle.catalog.map(([category, ids]) => (
                <section key={category} className={styles.group}>
                  <h3 className={styles.groupName}>{category} · {ids.length}</h3>
                  <ul className={styles.list}>{ids.map(row)}</ul>
                </section>
              ))}
            </>
          )}
        </>
      )}

      <div className={styles.actions}>
        <button className={styles.save} onClick={() => onSave(chosenIds)} disabled={chosenIds.length === 0}>
          {chosenIds.length === 0 ? 'Выбери хотя бы одно' : `Готово · ${chosenIds.length}`}
        </button>
        <button className={styles.cancel} onClick={onClose}>Отмена</button>
      </div>
    </div>
  )
}
