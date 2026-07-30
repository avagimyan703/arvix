import { useEffect, useState } from 'react'
import { parseHash, subscribeRoute, navigate } from './lib/router.js'
import { todayDayId, findDay } from './lib/program.js'
import { useWorkout } from './hooks/useWorkout.js'
import program from './data/program.json'
import exercises from './data/exercises.json'
import DayList from './components/DayList.jsx'
import WorkoutScreen from './components/WorkoutScreen.jsx'
import ExerciseDetail from './components/ExerciseDetail.jsx'

export default function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  const w = useWorkout()

  useEffect(() => subscribeRoute(setRoute), [])

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
        state={w.state}
        onStart={w.startWorkout}
        onWeight={w.setWeight}
        onCloseSet={w.closeSet}
        onClearSet={w.clearSet}
        onToggleAthletic={w.toggleAthletic}
        onFinish={() => { w.finishWorkout(); navigate({ screen: 'days' }) }}
        onOpen={(exerciseId) => navigate({ screen: 'exercise', exerciseId })}
        onBack={() => navigate({ screen: 'days' })}
      />
    )
  }

  if (route.screen === 'exercise') {
    const exercise = exercises[route.exerciseId]
    if (!exercise) {
      navigate({ screen: 'days' })
      return null
    }
    return (
      <ExerciseDetail
        exercise={exercise}
        exerciseId={route.exerciseId}
        onBack={() => window.history.back()}
      />
    )
  }

  return (
    <DayList
      program={program}
      todayId={todayDayId(new Date())}
      onPick={(dayId) => navigate({ screen: 'workout', dayId })}
    />
  )
}
