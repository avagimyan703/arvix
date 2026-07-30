export function parseHash(hash) {
  const clean = String(hash ?? '').replace(/^#\/?/, '')
  if (!clean) return { screen: 'days' }

  const [head, param] = clean.split('/')
  if (head === 'day' && param) return { screen: 'workout', dayId: param }
  if (head === 'ex' && param) return { screen: 'exercise', exerciseId: param }
  return { screen: 'days' }
}

export function hashFor(route) {
  if (route.screen === 'workout') return `#/day/${route.dayId}`
  if (route.screen === 'exercise') return `#/ex/${route.exerciseId}`
  return '#/'
}

export function navigate(route) {
  window.location.hash = hashFor(route)
}

export function subscribeRoute(fn) {
  const handler = () => fn(parseHash(window.location.hash))
  window.addEventListener('hashchange', handler)
  return () => window.removeEventListener('hashchange', handler)
}
