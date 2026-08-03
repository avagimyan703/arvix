/**
 * Что повесить на штангу под нужный вес — не считать в уме у стойки.
 * Гриф и набор блинов — стандартный олимпийский: гриф 20 кг, блины
 * 25/20/15/10/5/2.5/1.25 на сторону, предполагаем неограниченный запас
 * каждого номинала (это подсказка «в идеале», а не инвентаризация зала).
 */

export const BAR_WEIGHT = 20
const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25]
const EPS = 1e-6

/**
 * @param {number|null} totalWeight — вес со штангой целиком
 * @param {number} barWeight
 * @returns {{perSide: number[], remainder: number}|null} null, если вес
 *   меньше веса грифа — блины считать не с чего
 */
export function platesFor(totalWeight, barWeight = BAR_WEIGHT) {
  if (totalWeight == null || totalWeight <= barWeight) return null

  let perSideWeight = (totalWeight - barWeight) / 2
  const perSide = []
  for (const plate of PLATES) {
    while (perSideWeight >= plate - EPS) {
      perSide.push(plate)
      perSideWeight -= plate
    }
  }

  // Остаток меньше 1.25 кг с каждой стороны — это округление веса
  // до ближайшего блина, а не пропавшие граммы.
  return { perSide, remainder: Math.round(perSideWeight * 2 * 100) / 100 }
}
