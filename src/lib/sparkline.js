/**
 * Точки для мини-графика веса по тренировкам — простая ломаная без
 * библиотек. Значения приходят от старых к новым (порядок отображения
 * слева направо), сама функция ничего не знает про SVG кроме координат.
 */

/**
 * @param {number[]} values — от старых к новым
 * @param {{width?: number, height?: number, padding?: number}} [opts]
 * @returns {{points: string, last: {x: number, y: number}}|null}
 */
export function sparklinePoints(values, opts = {}) {
  const { width = 240, height = 48, padding = 4 } = opts
  if (values.length < 2) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = (width - padding * 2) / (values.length - 1)

  const coords = values.map((v, i) => ({
    x: padding + i * stepX,
    y: padding + (height - padding * 2) * (1 - (v - min) / range),
  }))

  return {
    points: coords.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
    last: coords[coords.length - 1],
  }
}
