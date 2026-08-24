import { useState } from 'react'
import MuscleDiagram from './MuscleDiagram.jsx'

/**
 * Превью упражнения в карточке: если у него есть привязанный рилс — кадр
 * из него (заранее скачан в public/thumbs/<id>.jpg — Instagram отдаёт
 * og:image прямо в HTML публичного поста, без API и без токена, но
 * ссылка на сам файл протухает, поэтому хранить нужно готовую картинку,
 * а не URL). Если рилса нет или файл не загрузился — силуэт с подсветкой
 * мышцы (см. lib/muscleZone.js), он есть для каждого упражнения.
 */
export default function ExercisePreview({ videoId, view, zone, className }) {
  // Кадр ищем в двух местах по очереди: thumbs — из нарезанного клипа, есть
  // только у упражнений программы; previews — миниатюра каталога, есть у
  // всех разборов. Упражнение, выбранное из каталога, живёт во втором.
  const [step, setStep] = useState(0)

  if (videoId) {
    const base = import.meta.env.BASE_URL
    const sources = [`${base}thumbs/${videoId}.jpg`, `${base}previews/${videoId}.jpg`]
    const src = sources[step]
    if (src) {
      return (
        <img
          className={className}
          src={src}
          alt=""
          loading="lazy"
          onError={() => setStep((s) => s + 1)}
        />
      )
    }
  }

  return <MuscleDiagram view={view} zone={zone} />
}
