import { useState } from 'react'
import styles from './ExerciseGif.module.css'

export default function ExerciseGif({ id, name, size = 'row' }) {
  const [failed, setFailed] = useState(false)
  const className = size === 'detail' ? styles.detail : styles.row

  // Отсутствие файла — штатная ситуация: гифки добавляются постепенно.
  // Первая буква названия на плашке даёт хоть какое-то опознание.
  if (failed) {
    return (
      <div className={`${className} ${styles.placeholder}`} role="img" aria-label={name}>
        {name.slice(0, 1)}
      </div>
    )
  }

  return (
    <img
      className={className}
      src={`${import.meta.env.BASE_URL}gifs/${id}.gif`}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
