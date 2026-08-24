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
  // Постер ищем в двух местах по очереди. thumbs — кадр из нарезанного
  // клипа, 480px во всю ширину, но есть только у упражнений программы.
  // previews — мелкая миниатюра из каталога, зато у всех разборов. Порядок
  // именно такой: где есть хороший кадр, показываем его, а не растянутый.
  const [posterStep, setPosterStep] = useState(0)

  const base = import.meta.env.BASE_URL
  const posters = [`${base}thumbs/${reel.id}.jpg`, `${base}previews/${reel.id}.jpg`]
  const poster = posters[posterStep] ?? null

  // Свой ролик пробуем всегда: наличие файла проверяется не списком в
  // коде, который разъедется с каталогом, а тем, отдал ли его сервер.
  if (!clipFailed) {
    return (
      <div className={`${styles.wrap} ${styles.clipWrap}`}>
        <video
          className={styles.clip}
          src={`${base}clips/${reel.id}.mp4`}
          poster={poster ?? undefined}
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
      {poster && (
        <img
          className={styles.poster}
          src={poster}
          alt=""
          onError={() => setPosterStep((s) => s + 1)}
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
