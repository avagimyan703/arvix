/**
 * Пул упражнений для выбора состава тренировки: библиотека плюс каталог
 * разборов.
 *
 * В библиотеке пятнадцать силовых упражнений — этого хватало, пока состав
 * дня был фиксированным, но мало, когда его выбирают руками. Каталог даёт
 * ещё две сотни, и разбор техники у каждого уже есть — сам ролик.
 *
 * Упражнение из каталога намеренно легче библиотечного: у него нет
 * пошаговой техники, списка ошибок и подсказки — вместо них ролик. Нет и
 * персональных подходов из программы: берутся общие, а вес и повторы
 * человек всё равно вбивает сам. Прогрессия по нему работает так же, как
 * по любому другому: она считает от того, что записано в дневнике.
 */

// Общие параметры для упражнения из каталога. 3 × 8–12 — рабочая середина
// для гипертрофии; RIR 2 и две минуты отдыха совпадают с тем, что стоит у
// большинства подсобных упражнений программы.
const CATALOG_BLOCK = { sets: 3, reps: [8, 12], rir: 2, rest: 120 }

// Шаг веса, когда он неизвестен: 2,5 кг — минимальная пара блинов, ниже
// которой в обычном зале всё равно не спуститься.
const CATALOG_WEIGHT_STEP = 2.5

/**
 * Запись упражнения по рилсу. Название берём из заметки каталога, рабочую
 * группу — из категории: это единственное, что о нём достоверно известно.
 *
 * @param {string} id — короткий код рилса, он же id упражнения
 * @param {{note: string, category: string}} reel
 * @param {string} muscle — человекочитаемое название категории
 * @returns {object}
 */
export function catalogExercise(id, reel, muscle) {
  return {
    name: reel.note,
    equipment: 'из каталога разборов',
    primary: [muscle],
    secondary: [],
    weightStep: CATALOG_WEIGHT_STEP,
    steps: [],
    mistakes: [],
    tip: '',
    video: id,
    // По этому признаку экраны понимают, что техники нет и рисовать пустые
    // разделы «Как делать» и «Частые ошибки» не нужно.
    fromCatalog: true,
  }
}

/**
 * Библиотека и каталог одним объектом — чтобы экраны искали упражнение в
 * одном месте, а не решали каждый раз, где смотреть.
 *
 * При совпадении ключей побеждает библиотека: там разобранная техника и
 * выверенный шаг веса, и подменять её автоматической записью нельзя.
 * Коды Инстаграма почти всегда с заглавными буквами, а id библиотеки — нет,
 * так что случай редкий, но молча ломаться он не должен.
 *
 * @param {Record<string, object>} exercises
 * @param {{categories: Array<{id: string, name: string}>, reels: Record<string, object>}} library
 * @returns {Record<string, object>}
 */
export function exercisePool(exercises, library) {
  const muscleByCategory = {}
  for (const c of library.categories) muscleByCategory[c.id] = c.name

  const pool = {}
  for (const [id, reel] of Object.entries(library.reels)) {
    if (exercises[id]) continue
    pool[id] = catalogExercise(id, reel, muscleByCategory[reel.category] ?? 'Прочее')
  }

  return { ...pool, ...exercises }
}

/**
 * Параметры подхода для упражнения из каталога — своих у него нет.
 *
 * @param {string} exerciseId
 * @returns {object}
 */
export function catalogBlock(exerciseId) {
  return { exercise: exerciseId, ...CATALOG_BLOCK, reps: [...CATALOG_BLOCK.reps] }
}
