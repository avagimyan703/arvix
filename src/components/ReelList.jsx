import { useState } from 'react'
import ReelPlayer from './ReelPlayer.jsx'
import ReelThumb from './ReelThumb.jsx'
import styles from './ReelList.module.css'

/**
 * Список разборов с раскрывающимся плеером. Один компонент на два экрана:
 * категорию целиком и выдачу поиска — иначе логика «раскрыт ровно один»
 * и разметка строки разъехались бы по двум местам при первой же правке.
 *
 * Раскрыт всегда только один плеер: десяток видео на одном экране
 * грузились бы вечность и съели бы всю память телефона.
 *
 * categoryName — необязательный: в выдаче поиска нужно видеть, откуда
 * запись, а внутри категории это было бы повторением заголовка экрана.
 */
export default function ReelList({ reels, categoryName }) {
  const [openId, setOpenId] = useState(null)

  return (
    <ul className={styles.list}>
      {reels.map((reel) => {
        const open = openId === reel.id
        return (
          <li key={reel.id} className={styles.item}>
            <button
              className={styles.head}
              onClick={() => setOpenId(open ? null : reel.id)}
              aria-expanded={open}
            >
              <ReelThumb id={reel.id} />
              <span className={styles.text}>
                <span className={styles.note}>{reel.note}</span>
                <span className={styles.meta}>
                  {categoryName ? `${categoryName(reel.category)} · ` : ''}
                  {reel.author} · {open ? 'свернуть' : 'смотреть'}
                </span>
              </span>
            </button>

            {open && (
              <div className={styles.player}>
                {/* Тап «смотреть» выше — уже согласие ждать видео; кнопка
                    воспроизведения поверх была бы вторым тапом за то же. */}
                <ReelPlayer reel={reel} title={reel.note} autoLoad />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
