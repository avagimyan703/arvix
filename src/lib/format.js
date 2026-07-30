/**
 * Вес для показа на экране. Интерфейс русский, поэтому дробная часть
 * отделяется запятой: «102,5 кг», а не «102.5 кг». Целые числа выводятся
 * без дробной части.
 *
 * В <input type="number"> подставлять НЕ нужно — там браузер ждёт точку.
 *
 * @param {number|null|undefined} weight
 * @returns {string}
 */
export function formatWeight(weight) {
  if (typeof weight !== 'number' || Number.isNaN(weight)) return ''
  return String(weight).replace('.', ',')
}
