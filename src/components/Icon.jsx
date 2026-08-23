const SHARED = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }

const PATHS = {
  plan: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.2" />
      <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
      <line x1="8" y1="3" x2="8" y2="6" />
      <line x1="16" y1="3" x2="16" y2="6" />
    </>
  ),
  reels: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.2" />
      <path d="M10.4 9.4 15 12l-4.6 2.6z" />
    </>
  ),
  journal: (
    <>
      <path d="M5 4.5h11.5a2.5 2.5 0 0 1 2.5 2.5v12.5H7.5A2.5 2.5 0 0 1 5 17z" />
      <line x1="5" y1="17" x2="19" y2="17" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="12.5" x2="13" y2="12.5" />
    </>
  ),
  flame: (
    <>
      <path d="M12 3.5c3.2 3 4.8 5.4 4.8 7.9a4.8 4.8 0 0 1-9.6 0c0-1.2.4-2.3 1.2-3.4.3 1.3 1 2 2 2.2-.4-2.4.1-4.5 1.6-6.7z" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v4.5a4 4 0 0 1-8 0z" />
      <path d="M8 5.5H5.5V7a3 3 0 0 0 3 3" />
      <path d="M16 5.5h2.5V7a3 3 0 0 1-3 3" />
      <line x1="12" y1="12.5" x2="12" y2="16.5" />
      <line x1="8.5" y1="20" x2="15.5" y2="20" />
      <path d="M9.5 20c0-1.9 1.1-3.5 2.5-3.5s2.5 1.6 2.5 3.5" />
    </>
  ),
  sets: (
    <>
      <rect x="3.5" y="4.5" width="17" height="4.5" rx="1.4" />
      <rect x="3.5" y="11" width="17" height="4.5" rx="1.4" />
      <line x1="6.5" y1="18.5" x2="17.5" y2="18.5" />
    </>
  ),
  bolt: (
    <>
      <path d="M13.5 3 6.5 13.5h4.2L10 21l7.2-10.8h-4.3z" />
    </>
  ),
}

/**
 * Небольшой набор интерфейсных иконок — для нижней навигации и плиток со
 * цифрами. Отдельно от EquipmentIcon: там инвентарь упражнения, здесь
 * навигация и метрики, и смешивать эти наборы в одном файле значило бы
 * держать в нём два несвязанных словаря.
 *
 * Неизвестный ключ ничего не рендерит — так опечатка проявляется пустотой,
 * а не случайной картинкой не по смыслу.
 */
export default function Icon({ name, size = 22 }) {
  const path = PATHS[name]
  if (!path) return null
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...SHARED}>
      {path}
    </svg>
  )
}
