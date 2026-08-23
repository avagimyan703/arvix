import { memo } from 'react'
import Icon from './Icon.jsx'
import styles from './TabBar.module.css'

const TABS = [
  { id: 'days', name: 'План', icon: 'plan' },
  { id: 'reels', name: 'Каталог', icon: 'reels' },
  { id: 'journal', name: 'Дневник', icon: 'journal' },
]

/**
 * Нижняя навигация по трём разделам, между которыми ходят постоянно.
 * Панель живёт только на корневых экранах: внутри тренировки и внутри
 * категории рилсов её нет — там задача одна, и уводить с неё одним касанием
 * значит терять место в сете или в списке.
 *
 * Активный раздел помечен и цветом, и aria-current: подсветка акцентом
 * читается не всеми, и без атрибута скринридер не сказал бы, где ты.
 */
function TabBar({ active, onNavigate }) {
  return (
    <nav className={styles.bar} aria-label="Разделы">
      <div className={styles.inner}>
        {TABS.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              className={isActive ? `${styles.tab} ${styles.active}` : styles.tab}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onNavigate(tab.id)}
            >
              <Icon name={tab.icon} size={23} />
              <span className={styles.name}>{tab.name}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default memo(TabBar)
