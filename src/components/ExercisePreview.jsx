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
  const [failed, setFailed] = useState(false)

  if (videoId && !failed) {
    return (
      <img
        className={className}
        src={`${import.meta.env.BASE_URL}thumbs/${videoId}.jpg`}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
      />
    )
  }

  return <MuscleDiagram view={view} zone={zone} />
}
