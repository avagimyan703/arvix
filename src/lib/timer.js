/**
 * Таймер отдыха. Считает остаток по МЕТКЕ ВРЕМЕНИ, а не по числу тиков.
 *
 * Это принципиально: в зале телефон лежит в кармане с погасшим экраном, а
 * браузеры душат интервалы фоновых страниц до одного в минуту или вовсе их
 * останавливают. Таймер, который вычитает секунду на каждый тик, за две
 * минуты в кармане потеряет почти всё это время и покажет неправду.
 *
 * Текущее время передаётся аргументом, а не берётся из Date.now() внутри —
 * так функции остаются чистыми и проверяемыми.
 */

export function createTimer(totalSeconds) {
  return {
    total: totalSeconds,
    leftWhenPaused: totalSeconds,
    endsAt: null,
    running: false,
  }
}

export function startTimer(t, now) {
  return { ...t, endsAt: now + t.leftWhenPaused * 1000, running: true }
}

export function pauseTimer(t, now) {
  return { ...t, leftWhenPaused: remaining(t, now), endsAt: null, running: false }
}

export function remaining(t, now) {
  if (!t.running || t.endsAt == null) return t.leftWhenPaused
  return Math.max(0, Math.ceil((t.endsAt - now) / 1000))
}

export function isDone(t, now) {
  return t.running && remaining(t, now) === 0
}

/**
 * Добавляет секунды к отдыху — «мне нужно чуть больше времени прямо сейчас»,
 * без похода в настройки. Работает и на запущенном, и на паузе: там, где
 * запущен, сдвигает метку окончания; на паузе — прибавляет к тому, что
 * осталось. total тоже растёт — иначе полоса прогресса в интерфейсе
 * посчитала бы отдых «более чем выполненным».
 */
export function extendTimer(t, seconds) {
  if (t.running && t.endsAt != null) {
    return { ...t, total: t.total + seconds, endsAt: t.endsAt + seconds * 1000 }
  }
  return { ...t, total: t.total + seconds, leftWhenPaused: t.leftWhenPaused + seconds }
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
