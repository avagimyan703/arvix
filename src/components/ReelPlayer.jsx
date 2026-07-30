import { embedUrl } from '../lib/reels.js'
import styles from './ReelPlayer.module.css'

/**
 * Встроенный плеер рилса. Обвязка Инстаграма скрыта с двух сторон:
 * шапка с автором сдвигом вверх на её 54px, нижняя панель с лайками —
 * за счёт height больше контейнера. Автор указывается рядом вызывающим.
 */
export default function ReelPlayer({ reel, title }) {
  const src = embedUrl(reel.url)
  if (!src) return null

  return (
    <div className={styles.wrap}>
      {/* Подсказка лежит ПОД плеером и видна только если тот не отрисовался:
          у cross-origin iframe провал загрузки не отловить, а пустой
          прямоугольник читался бы как поломка. */}
      <p className={styles.fallback}>
        Плеер не загрузился —{' '}
        <a href={reel.url} target="_blank" rel="noopener noreferrer" className={styles.fallbackLink}>
          открыть в Instagram ↗
        </a>
      </p>

      <iframe
        className={styles.frame}
        src={src}
        title={title}
        loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  )
}
