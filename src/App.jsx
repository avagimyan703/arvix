import { useCallback, useEffect, useState } from 'react'
import { parseHash, subscribeRoute, navigate } from './lib/router.js'
import { findDay } from './lib/program.js'
import { useWorkout } from './hooks/useWorkout.js'
import program from './data/program.json'
import exercises from './data/exercises.json'
import reelLibrary from './data/reels.json'
import DayList from './components/DayList.jsx'
import WorkoutScreen from './components/WorkoutScreen.jsx'
import ReelCatalog from './components/ReelCatalog.jsx'
import ReelCategory from './components/ReelCategory.jsx'
import HistoryScreen from './components/HistoryScreen.jsx'
import TabBar from './components/TabBar.jsx'

// Разделы нижней панели. Ключ — id вкладки, значение — маршрут: дневник
// живёт по screen: 'history', и без этой таблицы пришлось бы разводить
// «id вкладки» и «имя экрана» прямо в разметке.
const TAB_ROUTES = {
  days: { screen: 'days' },
  reels: { screen: 'reels' },
  journal: { screen: 'history' },
}

export default function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  const w = useWorkout()

  useEffect(() => subscribeRoute(setRoute), [])

  // Стабильные по ссылке — без этого мемоизация ExerciseRow/AthleticBlock
  // ниже по дереву была бы бессмысленной: каждый ререндер App пересоздавал
  // бы эти функции и «пробивал» memo() у всех детей разом.
  const goToDays = useCallback(() => navigate({ screen: 'days' }), [])
  const goToTab = useCallback((tab) => navigate(TAB_ROUTES[tab]), [])
  const finishWorkout = useCallback((note) => {
    w.finishWorkout(note)
    navigate({ screen: 'days' })
  }, [w.finishWorkout])
  const cancelWorkout = useCallback(() => {
    w.cancelWorkout()
    navigate({ screen: 'days' })
  }, [w.cancelWorkout])

  if (route.screen === 'workout') {
    const day = findDay(program, route.dayId)
    if (!day) {
      navigate({ screen: 'days' })
      return null
    }
    return (
      <WorkoutScreen
        day={day}
        exercises={exercises}
        library={reelLibrary}
        state={w.state}
        onStart={w.startWorkout}
        onWeight={w.setWeight}
        onCloseSet={w.closeSet}
        onClearSet={w.clearSet}
        onToggleAthletic={w.toggleAthletic}
        onFinish={finishWorkout}
        onCancel={cancelWorkout}
        onBack={goToDays}
      />
    )
  }

  if (route.screen === 'reelCategory') {
    const known = reelLibrary.categories.some((c) => c.id === route.categoryId)
    if (!known) {
      navigate({ screen: 'reels' })
      return null
    }
    return (
      <ReelCategory
        library={reelLibrary}
        categoryId={route.categoryId}
        onBack={() => navigate({ screen: 'reels' })}
      />
    )
  }

  if (route.screen === 'history') {
    return (
      <>
        <HistoryScreen
          history={w.state.history}
          program={program}
          exercises={exercises}
          onDelete={w.deleteSession}
          onWeight={w.setSessionWeight}
          onRep={w.setSessionRep}
          onBack={goToDays}
        />
        <TabBar active="journal" onNavigate={goToTab} />
      </>
    )
  }

  if (route.screen === 'reels') {
    return (
      <>
        <ReelCatalog
          library={reelLibrary}
          onPick={(categoryId) => navigate({ screen: 'reelCategory', categoryId })}
          onBack={goToDays}
        />
        <TabBar active="reels" onNavigate={goToTab} />
      </>
    )
  }

  return (
    <>
      <DayList
        program={program}
        today={new Date()}
        current={w.state.current}
        history={w.state.history}
        onPick={(dayId) => navigate({ screen: 'workout', dayId })}
      />
      <TabBar active="days" onNavigate={goToTab} />
    </>
  )
}
