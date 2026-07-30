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
