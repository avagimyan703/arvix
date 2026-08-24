import ReelList from './ReelList.jsx'
import { reelsInCategory } from '../lib/reels.js'
import styles from './ReelCategory.module.css'

export default function ReelCategory({ library, categoryId, onBack }) {
  const category = library.categories.find((c) => c.id === categoryId)
  const reels = reelsInCategory(library, categoryId)

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={onBack}>← Каталог</button>
      <h1 className={styles.title}>{category?.name ?? 'Категория'}</h1>

      <ReelList reels={reels} />
    </div>
  )
}
