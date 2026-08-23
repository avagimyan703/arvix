import { useState } from 'react'
import ReelPlayer from './ReelPlayer.jsx'
import ReelThumb from './ReelThumb.jsx'
import { reelsInCategory } from '../lib/reels.js'
import styles from './ReelCategory.module.css'

export default function ReelCategory({ library, categoryId, onBack }) {
  // Раскрыт всегда только один плеер: десяток iframe'ов Инстаграма на
  // одном экране грузились бы вечность и съели бы всю память телефона.
  const [openId, setOpenId] = useState(null)

  const category = library.categories.find((c) => c.id === categoryId)
  const reels = reelsInCategory(library, categoryId)

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={onBack}>← Каталог</button>
      <h1 className={styles.title}>{category?.name ?? 'Категория'}</h1>

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
                    {reel.author} · {open ? 'свернуть' : 'смотреть'}
                  </span>
                </span>
              </button>

              {open && (
                <div className={styles.player}>
                  {/* Тап «смотреть» выше — уже согласие ждать видео;
                      кнопка воспроизведения поверх была бы вторым тапом
                      за то же самое. */}
                  <ReelPlayer reel={reel} title={reel.note} autoLoad />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
