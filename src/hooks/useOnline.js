import { useEffect, useState } from 'react'

/**
 * Есть ли сеть. Нужно, чтобы не рисовать пустой прямоугольник вместо
 * встроенного плеера, когда в зале нет связи: iframe с чужого домена
 * своей ошибки загрузки не сообщает, поэтому спрашиваем браузер заранее.
 */
export function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])

  return online
}
