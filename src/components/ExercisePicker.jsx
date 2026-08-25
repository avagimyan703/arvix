import { useMemo, useState } from 'react'
import ExercisePreview from './ExercisePreview.jsx'
import { categoryOf, categoryRank } from '../lib/exercisePool.js'
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
 * бы, только вспомнив, в какой группе оно лежало. По той же причине фильтр
 * по категории на выбранное не действует — спрятать уже отмеченное значит
 * потерять его из виду.
 *
 * Упражнение, по которому уже закрыт хотя бы один подход, снять нельзя —
 * иначе выбор молча стирал бы сделанную работу.
 */
export default function ExercisePicker({
  exercises, categories, blockFor, dayBlocks, picked, locked, onSave, onClose,
}) {
  const [chosen, setChosen] = useState(() => new Set(picked))
  const [query, setQuery] = useState('')
  const [chip, setChip] = useState(null)

  const dayOrder = useMemo(() => dayBlocks.map((b) => b.exercise), [dayBlocks])

  // Порядок выполнения: сперва то, что стоит в плане дня, затем добавленное
  // в порядке библиотеки — так своё не вклинивается в середину привычного.
  const order = useMemo(() => {
    const all = Object.keys(exercises)
    return [...dayOrder, ...all.filter((id) => !dayOrder.includes(id))]
  }, [exercises, dayOrder])

  const chosenIds = useMemo(() => order.filter((id) => chosen.has(id)), [order, chosen])

  // Кандидаты на добавление: не выбранные, с параметрами подхода и
  // подходящие под фильтр. Финишеры сюда не попадают — у них нет блока.
  const pool = useMemo(() => order.filter((id) => (
    !chosen.has(id)
    && blockFor(id)
    && (chip === null || categoryOf(exercises[id]) === chip)
  )), [order, chosen, blockFor, chip, exercises])

  const matches = useMemo(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return null
    return pool.filter((id) => {
      const hay = normalize(exercises[id].name)
      return tokens.every((t) => hay.includes(t))
    })
  }, [query, pool, exercises])

  // Без запроса показываем всё: библиотеку по мышцам, каталог по категориям.
  // Разборы держим отдельной секцией, а не подмешиваем к библиотеке —
  // названия групп у них разного происхождения («Грудные» из библиотеки и
  // «Грудь» из каталога), и рядом это читалось бы как две разные мышцы.
  const idle = useMemo(() => {
    if (matches !== null) return null

    // Группы идут в общем порядке категорий — том же, что и на экране
    // тренировки. Внутри секции названия разного уровня («Грудные» и «Верх
    // грудных» — обе грудь), поэтому у соседних групп ранг совпадает;
    // сортировка устойчивая и оставляет их так, как они лежат в библиотеке.
    const byGroup = (ids) => {
      const groups = {}
      for (const id of ids) {
        const name = exercises[id].primary[0] ?? 'Прочее'
        ;(groups[name] = groups[name] ?? []).push(id)
      }
      return Object.entries(groups)
        .sort(([, a], [, b]) => (
          categoryRank(categoryOf(exercises[a[0]])) - categoryRank(categoryOf(exercises[b[0]]))
        ))
    }

    const catalog = pool.filter((i) => exercises[i].fromCatalog)
    return {
      library: byGroup(pool.filter((i) => !exercises[i].fromCatalog)),
      catalog: byGroup(catalog),
      catalogTotal: catalog.length,
    }
  }, [matches, pool, exercises])

  // Категории, в которых вообще есть что выбрать: пустая кнопка-фильтр
  // обещает результат, которого нет.
  const chips = useMemo(() => {
    const present = new Set()
    for (const id of order) {
      if (chosen.has(id) || !blockFor(id)) continue
      const c = categoryOf(exercises[id])
      if (c) present.add(c)
    }
    return categories
      .filter((c) => present.has(c.id) || c.id === chip)
      .sort((a, b) => categoryRank(a.id) - categoryRank(b.id))
  }, [order, chosen, blockFor, exercises, categories, chip])

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
          {/* Без ролика кадра нет — и коробки тоже: пустой серый квадрат
              читался бы как недогрузившаяся картинка. */}
          {ex.video && (
            <span className={styles.preview}>
              <ExercisePreview videoId={ex.video} className={styles.previewImg} />
            </span>
          )}
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

      {/* Чипы прокручиваются вбок: девять категорий в один ряд на телефоне
          не помещаются, а перенос съел бы пол-экрана до первой строки. */}
      <div className={styles.chips}>
        <button
          className={chip === null ? `${styles.chip} ${styles.chipOn}` : styles.chip}
          aria-pressed={chip === null}
          onClick={() => setChip(null)}
        >
          Все
        </button>
        {chips.map((c) => (
          <button
            key={c.id}
            className={chip === c.id ? `${styles.chip} ${styles.chipOn}` : styles.chip}
            aria-pressed={chip === c.id}
            onClick={() => setChip(chip === c.id ? null : c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {matches !== null ? (
        <section className={styles.group}>
          <h3 className={styles.groupName}>Найдено · {matches.length}</h3>
          {matches.length > 0
            ? <ul className={styles.list}>{matches.map(row)}</ul>
            : <p className={styles.nothing}>
                Ничего не нашлось{chip !== null && ' в этой категории'}. Попробуй короче — например «жим».
              </p>}
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
