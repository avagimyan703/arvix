import { useEffect, useRef, useState } from 'react'
import ExerciseDetail from './ExerciseDetail.jsx'
import styles from './ExerciseSheet.module.css'

// Сдвиг больше этого — однозначное намерение закрыть, даже если палец
// отпущен без разгона.
const CLOSE_DISTANCE = 120
// Или короткий, но резкий рывок — считаем по скорости в момент отпускания.
const CLOSE_VELOCITY = 0.5 // px/ms
// Длительность анимации закрытия — на неё же завязана задержка перед
// реальным onClose, чтобы шторка не размонтировалась посреди слайда.
const CLOSE_MS = 220

/**
 * Техника упражнения — не отдельный экран, а шторка поверх тренировки.
 * Раньше тап по названию уводил с WorkoutScreen целиком: терялся прогресс-
 * бар, позиция скролла, ощущение «я всё ещё здесь». Шторка открывается и
 * закрывается без навигации — тренировка всё это время остаётся под ней
 * как есть.
 *
 * Слайд ведём императивно через ref, а не CSS-классами: у закрытия два
 * независимых источника движения — программный (тап по скрим/кнопке назад)
 * и жестовый (свайп вниз, который должен доиграть анимацию из точки, где
 * его отпустили, а не дёрнуть шторку обратно к 0%). Один общий transform
 * на ref обслуживает оба случая без конфликта с CSS-каскадом.
 */
export default function ExerciseSheet({ onClose, children, ...detailProps }) {
  const [closing, setClosing] = useState(false)
  const [entering, setEntering] = useState(true)
  const sheetRef = useRef(null)
  const dragRef = useRef(null) // { startY, startT } пока палец на экране

  // Фон не должен ехать вместе со шторкой, пока она открыта.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Стартуем за пределами экрана и на следующем кадре съезжаем в 0 — так
  // же нужен настоящий переход, а не просто конечное состояние.
  useEffect(() => {
    const el = sheetRef.current
    if (!el) return
    const frame = requestAnimationFrame(() => {
      el.style.transition = `transform ${CLOSE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
      el.style.transform = 'translateY(0)'
    })
    // Пока шторка едет, содержимое не принимает нажатия. Иначе быстрый тап
    // сразу после открытия попадает в кнопку, которая в этот момент ещё
    // движется под пальцем, — палец жмёт в одно место, а срабатывает другое
    // или не срабатывает вовсе. Выглядит это как «кнопка не нажимается».
    const settle = setTimeout(() => setEntering(false), CLOSE_MS)
    return () => { cancelAnimationFrame(frame); clearTimeout(settle) }
  }, [])

  function requestClose() {
    if (closing) return
    setClosing(true)
    const el = sheetRef.current
    if (el) {
      el.style.transition = `transform ${CLOSE_MS}ms ease-in`
      el.style.transform = 'translateY(100%)'
    }
    setTimeout(onClose, CLOSE_MS)
  }

  function handleTouchStart(e) {
    if (closing) return
    dragRef.current = { startY: e.touches[0].clientY, startT: e.timeStamp }
  }

  function handleTouchMove(e) {
    if (!dragRef.current || !sheetRef.current) return
    const delta = Math.max(0, e.touches[0].clientY - dragRef.current.startY)
    sheetRef.current.style.transition = 'none'
    sheetRef.current.style.transform = `translateY(${delta}px)`
  }

  function handleTouchEnd(e) {
    if (!dragRef.current || !sheetRef.current) return
    const delta = Math.max(0, e.changedTouches[0].clientY - dragRef.current.startY)
    const elapsed = e.timeStamp - dragRef.current.startT
    const velocity = delta / Math.max(elapsed, 1)
    dragRef.current = null

    if (delta > CLOSE_DISTANCE || velocity > CLOSE_VELOCITY) {
      // Доигрываем из текущей точки — requestClose сам поставит transition
      // и новую цель, продолжая уже начатое пальцем движение.
      requestClose()
    } else {
      sheetRef.current.style.transition = 'transform 0.2s ease'
      sheetRef.current.style.transform = 'translateY(0)'
    }
  }

  return (
    <div
      className={`${styles.scrim} ${closing ? styles.scrimOut : ''}`}
      // Пока шторка едет снизу, место под пальцем ещё принадлежит подложке:
      // тап по строке, которой там пока нет, закрывал шторку сразу после
      // открытия. Со стороны — «нажимаю на упражнение, а оно пропадает».
      onClick={() => { if (!entering) requestClose() }}
    >
      <div
        ref={sheetRef}
        className={styles.sheet}
        style={{ transform: 'translateY(100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={styles.handleArea}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <span className={styles.handle} />
        </div>
        <div className={entering ? `${styles.content} ${styles.entering}` : styles.content}>
          {/* Своё содержимое, если дали: жест, скрим и блокировка фона тут
              уже отлажены, и заводить вторую такую же шторку ради выбора
              состава значило бы чинить свайп потом в двух местах. */}
          {children
            ? (typeof children === 'function' ? children(requestClose) : children)
            : <ExerciseDetail {...detailProps} onBack={requestClose} />}
        </div>
      </div>
    </div>
  )
}
