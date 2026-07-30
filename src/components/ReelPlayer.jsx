import { useEffect, useRef, useState } from 'react'
import { embedUrl } from '../lib/reels.js'
import styles from './ReelPlayer.module.css'

// Сколько ждать загрузки, прежде чем признать её неудачной. Cross-origin
// iframe об ошибке не сообщает, поэтому единственный признак провала —
// что событие load так и не пришло.
const GIVE_UP_AFTER_MS = 8000

/**
 * Встроенный плеер рилса. Обвязка Инстаграма скрыта с двух сторон:
 * шапка с автором сдвигом вверх на её 54px, нижняя панель с лайками —
 * за счёт height больше контейнера. Автор указывается рядом вызывающим.
 */
export default function ReelPlayer({ reel, title }) {
  const src = embedUrl(reel.url)
  const [state, setState] = useState('loading')
  const timer = useRef(null)

  useEffect(() => {
    if (!src) return
    setState('loading')
    timer.current = setTimeout(() => setState((s) => (s === 'loading' ? 'failed' : s)), GIVE_UP_AFTER_MS)
    return () => clearTimeout(timer.current)
  }, [src])

  if (!src) return null

  function handleLoad() {
    clearTimeout(timer.current)
    setState('ready')
  }

  return (
    <div className={styles.wrap}>
      {/* Пока грузится — нейтральная надпись. Сказать «не загрузился» сразу
          было бы враньём: плеер приходит через секунду-две. Признаём провал
          только когда событие load не пришло за GIVE_UP_AFTER_MS. */}
      {state === 'loading' && <p className={styles.status}>Загружаю видео…</p>}

      {state === 'failed' && (
        <p className={styles.status}>
          Плеер не загрузился —{' '}
          <a href={reel.url} target="_blank" rel="noopener noreferrer" className={styles.statusLink}>
            открыть в Instagram ↗
          </a>
        </p>
      )}

      <iframe
        className={state === 'ready' ? styles.frame : `${styles.frame} ${styles.hidden}`}
        src={src}
        title={title}
        onLoad={handleLoad}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  )
}
