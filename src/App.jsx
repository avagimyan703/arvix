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

export default function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  const w = useWorkout()

  useEffect(() => subscribeRoute(setRoute), [])

  // Стабильные по ссылке — без этого мемоизация ExerciseRow/AthleticBlock
  // ниже по дереву была бы бессмысленной: каждый ререндер App пересоздавал
  // бы эти функции и «пробивал» memo() у всех детей разом.
  const goToDays = useCallback(() => navigate({ screen: 'days' }), [])
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
      <HistoryScreen
        history={w.state.history}
        program={program}
        exercises={exercises}
        onBack={goToDays}
      />
    )
  }

  if (route.screen === 'reels') {
    return (
      <ReelCatalog
        library={reelLibrary}
        onPick={(categoryId) => navigate({ screen: 'reelCategory', categoryId })}
        onBack={goToDays}
      />
    )
  }

  return (
    <DayList
      program={program}
      today={new Date()}
      current={w.state.current}
      history={w.state.history}
      onPick={(dayId) => navigate({ screen: 'workout', dayId })}
      onOpenReels={() => navigate({ screen: 'reels' })}
      onOpenHistory={() => navigate({ screen: 'history' })}
    />
  )
}
