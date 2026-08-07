// Голова/торс/руки/ноги одинаковы для обоих видов — сами по себе от
// front они бы ничем не отличались от back, а квадрицепс на ноге и
// бицепс бедра на той же ноге тогда было бы не различить. Ориентацию
// даёт единственная деталь: глаза спереди, линия позвоночника сзади.
function Silhouette({ view }) {
  return (
    <g fill="var(--surface-2)" stroke="var(--line)" strokeWidth="1">
      <circle cx="20" cy="7" r="5" />
      <rect x="11" y="13" width="18" height="23" rx="7" />
      <rect x="3" y="15" width="7" height="19" rx="3.5" />
      <rect x="30" y="15" width="7" height="19" rx="3.5" />
      <rect x="12" y="36" width="7" height="24" rx="3.5" />
      <rect x="21" y="36" width="7" height="24" rx="3.5" />
      {view === 'front' ? (
        <g fill="var(--line)" stroke="none">
          <circle cx="17.5" cy="6.5" r="0.7" />
          <circle cx="22.5" cy="6.5" r="0.7" />
        </g>
      ) : (
        <line x1="20" y1="14" x2="20" y2="34" strokeWidth="1" />
      )}
    </g>
  )
}

const ZONES = {
  front: {
    chest: <ellipse cx="20" cy="19" rx="6.5" ry="4" />,
    shoulder: (
      <>
        <circle cx="7" cy="17" r="3" />
        <circle cx="33" cy="17" r="3" />
      </>
    ),
    bicep: (
      <>
        <ellipse cx="6.5" cy="24" rx="2.6" ry="5.5" />
        <ellipse cx="33.5" cy="24" rx="2.6" ry="5.5" />
      </>
    ),
    quad: (
      <>
        <ellipse cx="15.5" cy="47" rx="2.8" ry="9" />
        <ellipse cx="24.5" cy="47" rx="2.8" ry="9" />
      </>
    ),
  },
  back: {
    upperBack: <ellipse cx="20" cy="17" rx="4.5" ry="3.5" />,
    lats: (
      <>
        <ellipse cx="14" cy="22" rx="3.5" ry="7" />
        <ellipse cx="26" cy="22" rx="3.5" ry="7" />
      </>
    ),
    triceps: (
      <>
        <ellipse cx="6.5" cy="24" rx="2.6" ry="5.5" />
        <ellipse cx="33.5" cy="24" rx="2.6" ry="5.5" />
      </>
    ),
    glutes: <ellipse cx="20" cy="39" rx="7.5" ry="4.5" />,
    hamstring: (
      <>
        <ellipse cx="15.5" cy="49" rx="2.8" ry="8" />
        <ellipse cx="24.5" cy="49" rx="2.8" ry="8" />
      </>
    ),
  },
}

/**
 * Силуэт тела с подсвеченной целевой мышцей — превью «какое именно
 * упражнение» рядом с названием, без реального видео или фото (их для
 * половины упражнений просто нет — reels.json покрывает не всё, а
 * Instagram не отдаёт кадр-превью без токена и офлайн не работает).
 * view/zone приходят из lib/muscleZone.js.
 */
export default function MuscleDiagram({ view, zone }) {
  const highlight = ZONES[view]?.[zone]
  if (!highlight) return null
  return (
    <svg viewBox="0 0 40 64" width="100%" height="100%" aria-hidden="true">
      <Silhouette view={view} />
      <g fill="var(--accent)">{highlight}</g>
    </svg>
  )
}
