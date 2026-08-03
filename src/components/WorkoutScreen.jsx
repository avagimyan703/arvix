import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ExerciseRow from './ExerciseRow.jsx'
import AthleticBlock from './AthleticBlock.jsx'
import RestTimer from './RestTimer.jsx'
import WorkoutSummary from './WorkoutSummary.jsx'
import ExerciseSheet from './ExerciseSheet.jsx'
import { suggestWeight } from '../lib/progression.js'
import { formatWeight } from '../lib/format.js'
import { appendSession } from '../lib/history.js'
import { currentStreak, newRecords, milestoneReached } from '../lib/achievements.js'
import { isBlockDone, sessionProgress } from '../lib/workout.js'
import { useRestTimer } from '../hooks/useRestTimer.js'
import styles from './WorkoutScreen.module.css'

export default function WorkoutScreen({
  day, exercises, library, state, onStart, onWeight, onCloseSet, onClearSet,
  onToggleAthletic, onFinish, onCancel, onBack,
}) {
  const rest = useRestTimer()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [summary, setSummary] = useState(null)
  const [openExercise, setOpenExercise] = useState(null)
  const current = state.current?.dayId === day.id ? state.current : null

  function handleCancel() {
    setConfirmCancel(false)
    onCancel()
  }

  const suggestions = day.blocks
    .map((block) => {
      const weight = suggestWeight(
        state.lastSession[block.exercise],
        block,
        exercises[block.exercise].weightStep,
        current?.weights?.[block.exercise] ?? null,
      )
      return weight == null ? null : { block, weight }
    })
    .filter(Boolean)

  const { doneSets, totalSets, doneCount, totalCount } = sessionProgress(day.blocks, current)

  // Тренировка начинается неявно, первым же действием — не отдельной кнопкой
  // «Начать» (см. lib/workout.js: startWorkout идемпотентна для уже идущей
  // тренировки того же дня, так что этот вызов безопасно повторять на
  // каждое действие, а не только на первое; лишние вызовы — no-op).
  const exerciseIds = useMemo(() => day.blocks.map((b) => b.exercise), [day.blocks])

  const handleWeight = useCallback((exerciseId, w) => {
    onStart(day.id, exerciseIds)
    onWeight(exerciseId, w)
  }, [day.id, exerciseIds, onStart, onWeight])

  const handleCloseSet = useCallback((exerciseId, index, sets, reps) => {
    onStart(day.id, exerciseIds)
    onCloseSet(exerciseId, index, sets, reps)
  }, [day.id, exerciseIds, onStart, onCloseSet])

  const handleClearSet = useCallback((exerciseId, index, sets) => {
    onStart(day.id, exerciseIds)
    onClearSet(exerciseId, index, sets)
  }, [day.id, exerciseIds, onStart, onClearSet])

  const handleToggleAthletic = useCallback((exerciseId) => {
    onStart(day.id, exerciseIds)
    onToggleAthletic(exerciseId)
  }, [day.id, exerciseIds, onStart, onToggleAthletic])

  // Открыть технику — не действие тренировки, а просто справка: не должно
  // неявно стартовать сессию (в отличие от веса/подходов/финишера выше).
  const handleOpenExercise = useCallback((exerciseId) => setOpenExercise(exerciseId), [])
  const handleCloseSheet = useCallback(() => setOpenExercise(null), [])

  // Живой рекорд — та же функция, что считает итог на экране признания
  // результата, просто спрошенная раньше: сразу когда подход закрыт, а не
  // только в конце тренировки. Одна формула для обоих мест, не две разных.
  const records = useMemo(
    () => new Set(current ? newRecords(state.history, current.reps, current.weights) : []),
    [state.history, current],
  )

  // Рефы на карточки упражнений — только чтобы прокрутить к следующей,
  // когда текущая закрыта целиком. Данные тренировки тут не хранятся.
  const rowRefs = useRef({})
  const prevDoneRef = useRef({})
  const sessionRef = useRef(null)

  useEffect(() => {
    if (!current) { sessionRef.current = null; return }

    const doneMap = {}
    day.blocks.forEach((b) => { doneMap[b.exercise] = isBlockDone(b, current.reps[b.exercise]) })

    // Первый рендер этой сессии (в том числе после перезагрузки страницы
    // посреди тренировки) — просто запоминаем состояние, ничего не листаем.
    if (sessionRef.current !== current.startedAt) {
      sessionRef.current = current.startedAt
      prevDoneRef.current = doneMap
      return
    }

    const justFinished = day.blocks.find((b) => doneMap[b.exercise] && !prevDoneRef.current[b.exercise])
    prevDoneRef.current = doneMap
    if (!justFinished) return

    const idx = day.blocks.findIndex((b) => b.exercise === justFinished.exercise)
    const next = day.blocks.slice(idx + 1).find((b) => !doneMap[b.exercise])
    if (!next) return

    // Небольшая пауза — чтобы прокрутка не спорила с тем, что палец ещё
    // на экране, и панель отдыха успела появиться внизу.
    const id = setTimeout(() => {
      rowRefs.current[next.exercise]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 350)
    return () => clearTimeout(id)
  }, [current, day.blocks])

  // Считаем итог из того, что уже есть в current, — не дожидаясь реальной
  // записи в историю. Так экран признания результата не зависит от того,
  // когда именно отработает finishWorkout, и использует те же чистые
  // функции (appendSession), что и настоящий реестр — не может разойтись.
  function handleFinish() {
    const now = new Date()
    const today = now.toISOString().slice(0, 10)
    const previewHistory = appendSession(state.history, current, today)
    const durationMin = Math.max(1, Math.round((now - new Date(current.startedAt)) / 60000))

    setSummary({
      dayLabel: `${day.weekday} · ${day.accent}`,
      doneSets,
      totalSets,
      doneCount,
      totalCount,
      durationMin,
      records: [...records].map((id) => exercises[id].name),
      streak: currentStreak(previewHistory),
      milestone: milestoneReached(state.history),
    })
  }

  if (summary) {
    return <WorkoutSummary {...summary} onDone={onFinish} />
  }

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button className={styles.back} onClick={onBack}>← Дни</button>
        <h1 className={styles.title}>{day.weekday}</h1>
        <p className={styles.accent}>{day.accent}</p>
      </header>

      {current && (
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ transform: `scaleX(${totalSets > 0 ? doneSets / totalSets : 0})` }}
            />
          </div>
          <span className={styles.progressLabel}>
            {doneCount} из {totalCount} упражнений · {doneSets} из {totalSets} подходов
          </span>
        </div>
      )}

      {/* Место плашки фиксировано сразу под заголовком независимо от
          состояния тренировки: это единственный экран, где видна подсказка
          по прогрессии, и она не должна прятаться внизу под уже сделанными
          подходами именно тогда, когда решение о весе нужно прямо сейчас. */}
      {suggestions.length > 0 && (
        <section className={styles.suggestions}>
          <h2 className={styles.suggestHeading}>Пора добавить вес</h2>
          {suggestions.map(({ block, weight }) => (
            <p key={block.exercise} className={styles.suggestion}>
              <strong>{exercises[block.exercise].name}</strong> — все подходы на {block.reps[1]}.
              В следующий раз {formatWeight(weight)} кг.
            </p>
          ))}
        </section>
      )}

      {/* Список виден сразу, без отдельного «Начать»: можно посмотреть план
          дня, ничего не запуская. Тренировка стартует неявно первым же
          касанием — тапнул подход или поправил вес, и она уже идёт. */}
      <div className={styles.rows}>
        {day.blocks.map((block) => (
          <div key={block.exercise} ref={(el) => { rowRefs.current[block.exercise] = el }}>
            <ExerciseRow
              block={block}
              exercise={exercises[block.exercise]}
              exerciseId={block.exercise}
              reps={current?.reps[block.exercise]}
              weight={current?.weights[block.exercise] ?? null}
              lastSession={state.lastSession[block.exercise]}
              isRecord={records.has(block.exercise)}
              onWeight={handleWeight}
              onCloseSet={handleCloseSet}
              onClearSet={handleClearSet}
              onOpen={handleOpenExercise}
              startRest={rest.startRest}
            />
          </div>
        ))}
      </div>

      <AthleticBlock
        items={day.athletic}
        exercises={exercises}
        done={current?.athletic}
        onToggle={handleToggleAthletic}
        onOpen={handleOpenExercise}
      />

      {current && (
        <>
          <button className={styles.finish} onClick={handleFinish}>Завершить тренировку</button>

          {/* Два шага, а не native confirm(): один случайный тап не должен
              стирать уже отмеченные подходы текущей сессии. */}
          {confirmCancel ? (
            <div className={styles.cancelConfirmRow}>
              <button className={styles.cancelConfirm} onClick={handleCancel}>Да, отменить</button>
              <button className={styles.cancelBack} onClick={() => setConfirmCancel(false)}>Нет, продолжить</button>
            </div>
          ) : (
            <button className={styles.cancel} onClick={() => setConfirmCancel(true)}>
              Отменить тренировку
            </button>
          )}
        </>
      )}

      <RestTimer
        timer={rest.timer}
        onPause={rest.pauseRest}
        onResume={rest.resumeRest}
        onDismiss={rest.dismissRest}
        onExtend={rest.extendRest}
      />

      {openExercise && (
        <ExerciseSheet
          exercise={exercises[openExercise]}
          exerciseId={openExercise}
          library={library}
          block={day.blocks.find((b) => b.exercise === openExercise) ?? null}
          lastSession={state.lastSession[openExercise]}
          history={state.history}
          currentWeight={current?.weights[openExercise] ?? null}
          onClose={handleCloseSheet}
        />
      )}
    </div>
  )
}
