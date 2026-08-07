const SHARED = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }

const PATHS = {
  barbell: (
    <>
      <line x1="3" y1="12" x2="21" y2="12" />
      <rect x="5" y="8" width="2.4" height="8" rx="0.6" />
      <rect x="16.6" y="8" width="2.4" height="8" rx="0.6" />
      <rect x="1.8" y="9.6" width="1.6" height="4.8" rx="0.6" />
      <rect x="20.6" y="9.6" width="1.6" height="4.8" rx="0.6" />
    </>
  ),
  dumbbell: (
    <>
      <line x1="8" y1="12" x2="16" y2="12" />
      <rect x="4" y="8.5" width="3" height="7" rx="1" />
      <rect x="17" y="8.5" width="3" height="7" rx="1" />
    </>
  ),
  machine: (
    <>
      <line x1="6" y1="3" x2="6" y2="21" />
      <circle cx="6" cy="7" r="2" />
      <line x1="8" y1="7.5" x2="16.5" y2="15.5" />
      <rect x="16" y="15" width="5" height="6.5" rx="0.8" />
    </>
  ),
  bar: (
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="6" y1="6" x2="6" y2="20" />
      <line x1="18" y1="6" x2="18" y2="20" />
    </>
  ),
}

/**
 * Иконка инвентаря упражнения — маленький визуальный ориентир в карточке,
 * чтобы список упражнений различался не только текстом. Ключ type — из
 * lib/equipment.js:equipmentIcon(); для null (инвентарь вне взвешиваемых
 * блоков) ничего не рендерим — вызывающая сторона просто не показывает
 * рамку иконки, а не подставляет угадайку.
 */
export default function EquipmentIcon({ type }) {
  const path = PATHS[type]
  if (!path) return null
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...SHARED}>
      {path}
    </svg>
  )
}
