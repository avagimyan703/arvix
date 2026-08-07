// Куда на силуэте попадает мышца — вид (спереди/сзади) и зона внутри
// него. Только мышцы, которые реально встречаются как primary[0] во
// взвешиваемых блоках (program.json) — см. muscleZone.test.js для
// полного списка. Мышцы вне этого набора (Координация, Сердечно-
// сосудистая система и т.п. — они только у атлетического финишера,
// который силуэт не показывает) осознанно не описаны.
const ZONE_BY_MUSCLE = {
  'Грудные': { view: 'front', zone: 'chest' },
  'Верх грудных': { view: 'front', zone: 'chest' },
  'Передняя дельта': { view: 'front', zone: 'shoulder' },
  'Средняя дельта': { view: 'front', zone: 'shoulder' },
  'Бицепс': { view: 'front', zone: 'bicep' },
  'Квадрицепс': { view: 'front', zone: 'quad' },
  'Широчайшие': { view: 'back', zone: 'lats' },
  'Ромбовидные': { view: 'back', zone: 'upperBack' },
  'Трицепс': { view: 'back', zone: 'triceps' },
  'Ягодичные': { view: 'back', zone: 'glutes' },
  'Бицепс бедра': { view: 'back', zone: 'hamstring' },
}

/**
 * Вид и зона силуэта для главной мышцы упражнения — первой в primary[].
 * Когда упражнение бьёт по двум зонам разного вида (например, присед —
 * квадрицепс спереди и ягодичные сзади), берём именно первую: порядок
 * в данных уже отражает акцент, а показывать два силуэта в одной
 * маленькой карточке некуда.
 *
 * @param {string[]|undefined} primary
 * @returns {{view: 'front'|'back', zone: string}|null}
 */
export function muscleZone(primary) {
  const main = Array.isArray(primary) ? primary[0] : null
  return ZONE_BY_MUSCLE[main] ?? null
}
