import { useState } from 'react'
import ExerciseRow from './ExerciseRow.jsx'
import AthleticBlock from './AthleticBlock.jsx'
import RestTimer from './RestTimer.jsx'
import { suggestWeight } from '../lib/progression.js'
import { formatWeight } from '../lib/format.js'
import { useRestTimer } from '../hooks/useRestTimer.js'
import styles from './WorkoutScreen.module.css'

export default function WorkoutScreen({
  day, exercises, state, onStart, onWeight, onCloseSet, onClearSet,
  onToggleAthletic, onFinish, onCancel, onOpen, onBack,
}) {
  const rest = useRestTimer()
  const [confirmCancel, setConfirmCancel] = useState(false)
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

  function handleClose(exerciseId, index, sets, reps, restSeconds) {
    onCloseSet(exerciseId, index, sets, reps)
    rest.startRest(restSeconds)
  }

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button className={styles.back} onClick={onBack}>← Дни</button>
        <h1 className={styles.title}>{day.weekday}</h1>
        <p className={styles.accent}>{day.accent}</p>
      </header>

      {!current && (
        <button className={styles.start} onClick={() => onStart(day.id)}>
          Начать тренировку
        </button>
      )}

      {current && (
        <>
          <div className={styles.rows}>
            {day.blocks.map((block) => (
              <ExerciseRow
                key={block.exercise}
                block={block}
                exercise={exercises[block.exercise]}
                exerciseId={block.exercise}
                reps={current.reps[block.exercise]}
                weight={current.weights[block.exercise] ?? null}
                lastSession={state.lastSession[block.exercise]}
                onWeight={(w) => onWeight(block.exercise, w)}
                onClose={(i, r) => handleClose(block.exercise, i, block.sets, r, block.rest)}
                onEdit={(i, r) => onCloseSet(block.exercise, i, block.sets, r)}
                onClear={(i) => onClearSet(block.exercise, i, block.sets)}
                onOpen={() => onOpen(block.exercise)}
              />
            ))}
          </div>

          <AthleticBlock
            items={day.athletic}
            exercises={exercises}
            done={current.athletic}
            onToggle={onToggleAthletic}
            onOpen={onOpen}
          />

          <button className={styles.finish} onClick={onFinish}>Завершить тренировку</button>

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

      {/* Спека, раздел 7: плашка итогов живёт внизу экрана */}
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

      <RestTimer
        timer={rest.timer}
        onPause={rest.pauseRest}
        onResume={rest.resumeRest}
        onDismiss={rest.dismissRest}
      />
    </div>
  )
}
