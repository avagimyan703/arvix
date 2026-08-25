import { useState } from 'react'

/**
 * Превью упражнения в карточке — кадр из привязанного ролика.
 *
 * Кадр ищем в двух местах по очереди: thumbs — из нарезанного клипа, есть
 * только у упражнений программы; previews — миниатюра каталога, есть у всех
 * разборов. Упражнение, выбранное из каталога, живёт во втором.
 *
 * Ролика нет — не показываем ничего. Раньше здесь был силуэт с подсвеченной
 * мышцей, но пустая фигура рядом с настоящими кадрами читалась как
 * недогрузившаяся картинка, а не как осмысленная замена.
 */
export default function ExercisePreview({ videoId, className }) {
  const [step, setStep] = useState(0)

  if (!videoId) return null

  const base = import.meta.env.BASE_URL
  const sources = [`${base}thumbs/${videoId}.jpg`, `${base}previews/${videoId}.jpg`]
  const src = sources[step]
  if (!src) return null

  return (
    <img
      className={className}
      src={src}
      alt=""
      loading="lazy"
      onError={() => setStep((s) => s + 1)}
    />
  )
}
