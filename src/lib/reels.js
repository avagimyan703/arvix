/**
 * Из ссылки на рилс делаем адрес официального embed-эндпоинта Инстаграма.
 * Именно iframe, а не их embed.js: скрипт грузился бы в наше окно и тащил
 * трекинг внутрь приложения, а iframe остаётся на их стороне.
 *
 * @param {string} url
 * @returns {string|null}
 */
export function embedUrl(url) {
  const m = String(url ?? '').match(/instagram\.com\/(?:[^/]+\/)?(reel|p|tv)\/([\w-]+)/)
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed` : null
}

/**
 * Идентификатор рилса — короткий код Инстаграма из ссылки. Он же ключ
 * в reels.json, чтобы упражнение ссылалось на рилс, а не дублировало его.
 *
 * @param {string} url
 * @returns {string|null}
 */
export function reelId(url) {
  const m = String(url ?? '').match(/instagram\.com\/(?:[^/]+\/)?(?:reel|p|tv)\/([\w-]+)/)
  return m ? m[1] : null
}

/**
 * Рилсы категории в порядке появления в файле.
 *
 * @param {{reels: object}} library
 * @param {string} categoryId
 * @returns {Array<{id: string} & object>}
 */
export function reelsInCategory(library, categoryId) {
  return Object.entries(library.reels)
    .filter(([, r]) => r.category === categoryId)
    .map(([id, r]) => ({ id, ...r }))
}

/**
 * Приводит строку к виду для сравнения: нижний регистр и ё → е.
 *
 * Про «ё» отдельно: заметки в каталоге написаны с ней («Жим лёжа»), а
 * набирают в поиске почти всегда через «е». Без этой замены половина
 * запросов про жим не находила бы ничего.
 *
 * @param {string} s
 * @returns {string}
 */
function normalize(s) {
  return String(s ?? '').toLowerCase().replace(/ё/g, 'е')
}

/**
 * Поиск по каталогу: по заметке и автору, с необязательным сужением до
 * одной категории.
 *
 * Слова запроса соединяются через И, а не ИЛИ: «жим гантелей» должен
 * оставить только жимы гантелей, а не всё, где встретилось хоть одно из
 * двух слов. Порядок слов при этом не важен — ищем вхождения, а не фразу.
 *
 * Пустой запрос — не ошибка и не пустая выдача: это «показать всё»
 * (с учётом категории), чтобы экран не мигал между состояниями, пока
 * строку набирают и стирают.
 *
 * @param {{reels: object}} library
 * @param {string} query
 * @param {string|null} [categoryId]
 * @returns {Array<{id: string} & object>}
 */
export function searchReels(library, query, categoryId = null) {
  const tokens = normalize(query).split(/\s+/).filter(Boolean)

  let rows = Object.entries(library.reels).map(([id, r]) => ({ id, ...r }))
  if (categoryId) rows = rows.filter((r) => r.category === categoryId)
  if (tokens.length === 0) return rows

  return rows.filter((r) => {
    const hay = normalize(`${r.note} ${r.author}`)
    return tokens.every((t) => hay.includes(t))
  })
}

/**
 * Сколько рилсов в каждой категории. Нужно, чтобы на экране каталога
 * показать счётчик и приглушить пустые категории.
 *
 * @param {{categories: Array, reels: object}} library
 * @returns {Record<string, number>}
 */
export function countByCategory(library) {
  const counts = {}
  for (const c of library.categories) counts[c.id] = 0
  for (const r of Object.values(library.reels)) {
    if (r.category in counts) counts[r.category] += 1
  }
  return counts
}

/**
 * Рилс, привязанный к упражнению. В exercises.json лежит только ключ,
 * сам рилс живёт в библиотеке — иначе один рилс на три упражнения
 * пришлось бы копировать трижды.
 *
 * @param {{reels: object}} library
 * @param {{video?: string}} exercise
 * @returns {object|null}
 */
export function reelForExercise(library, exercise) {
  const key = exercise?.video
  if (!key) return null
  const reel = library.reels[key]
  return reel ? { id: key, ...reel } : null
}
