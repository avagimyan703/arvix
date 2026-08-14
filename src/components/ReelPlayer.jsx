import { useState } from 'react'
import { embedUrl } from '../lib/reels.js'
import styles from './ReelPlayer.module.css'

/**
 * Разбор упражнения. Основной путь — свой короткий ролик из
 * public/clips: он играет сразу, зациклено и без звука, без единого
 * тапа и без единого запроса наружу.
 *
 * Так пришлось сделать из-за встраивания Инстаграма, которое было
 * здесь раньше. Их embed тянет кросс-доменно свою страницу, скрипты и
 * видео, отдаёт событие load очень поздно (замеряли — секунды и
 * больше), а поверх всего показывает собственную кнопку
 * воспроизведения, которую снаружи не нажать: получалось два тапа и
 * ожидание чужого сервера ровно тогда, когда между подходами нужно
 * быстро глянуть движение.
 *
 * Ролик есть не для каждого рилса (каталог — сотни записей, клипы
 * нарезаны только под упражнения программы). Где его нет, остаётся
 * прежний путь: кадр с кнопкой, по которой монтируется embed. Полный
 * ролик и автор — по ссылке рядом, её ставит вызывающий.
 *
 * autoLoad — для мест, где тап «смотреть» уже был (каталог рилсов):
 * там кнопка поверх кадра была бы вторым тапом за то же самое.
 */
export default function ReelPlayer({ reel, title, autoLoad = false }) {
  const src = embedUrl(reel.url)
  const [clipFailed, setClipFailed] = useState(false)
  const [started, setStarted] = useState(autoLoad)
  const [posterFailed, setPosterFailed] = useState(false)

  const base = import.meta.env.BASE_URL
  const poster = `${base}thumbs/${reel.id}.jpg`

  // Свой ролик пробуем всегда: наличие файла проверяется не списком в
  // коде, который разъедется с каталогом, а тем, отдал ли его сервер.
  if (!clipFailed) {
    return (
      <div className={`${styles.wrap} ${styles.clipWrap}`}>
        <video
          className={styles.clip}
          src={`${base}clips/${reel.id}.mp4`}
          poster={posterFailed ? undefined : poster}
          title={title}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setClipFailed(true)}
        />
      </div>
    )
  }

  if (!src) return null

  return (
    <div className={styles.wrap}>
      {/* Кадр лежит под плеером и остаётся там после запуска: пока
          страница Инстаграма рисуется, видно упражнение, а не пустой
          прямоугольник. */}
      {!posterFailed && (
        <img
          className={styles.poster}
          src={poster}
          alt=""
          onError={() => setPosterFailed(true)}
        />
      )}

      {started ? (
        <iframe
          className={styles.frame}
          src={src}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          // Страница Инстаграма держит overflow-y: scroll и без прокрутки —
          // на Mac с мышью системные скроллбары видны всегда, и это давало
          // белую полосу вдоль правого края поверх видео. Кросс-доменно свой
          // CSS внутрь фрейма не пробросить, но scrolling="no" — атрибут
          // самого iframe, а не его содержимого, и отключает полосу на уровне
          // браузера независимо от источника.
          scrolling="no"
        />
      ) : (
        <button
          className={styles.facade}
          onClick={() => setStarted(true)}
          aria-label={`Смотреть видео: ${title}`}
        >
          <span className={styles.play} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
