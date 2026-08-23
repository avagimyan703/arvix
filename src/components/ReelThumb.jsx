import { useState } from 'react'
import Icon from './Icon.jsx'
import styles from './ReelThumb.module.css'

/**
 * Кадр упражнения размером с ноготь — чтобы в списке было видно, о чём
 * ролик, до чтения заголовка. Картинки лежат в public/previews и режутся
 * скриптом tools/make-preview.sh из самого видео.
 *
 * Наличие файла не проверяем списком в коде — он разъехался бы с каталогом
 * при первом же пополнении. Пробуем загрузить и, если не отдалось, ставим
 * иконку: пустой прямоугольник в строке выглядел бы поломкой.
 */
export default function ReelThumb({ id }) {
  const [failed, setFailed] = useState(false)
  const src = `${import.meta.env.BASE_URL}previews/${id}.jpg`

  if (failed) {
    return (
      <span className={`${styles.thumb} ${styles.fallback}`} aria-hidden="true">
        <Icon name="reels" size={20} />
      </span>
    )
  }

  return (
    <img
      className={styles.thumb}
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
