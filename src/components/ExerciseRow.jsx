import ExerciseGif from './ExerciseGif.jsx'
import SetTracker from './SetTracker.jsx'
import { formatTime } from '../lib/timer.js'
import { formatWeight } from '../lib/format.js'
import styles from './ExerciseRow.module.css'

export default function ExerciseRow({
  block, exercise, exerciseId, reps, weight, lastSession,
  onWeight, onClose, onEdit, onClear, onOpen,
}) {
  const [min, max] = block.reps
  const params = [
    `${block.sets} × ${min}–${max}`,
    `RIR ${block.rir}`,
    `отдых ${formatTime(block.rest)}`,
    block.tempo ? `темп ${block.tempo}` : null,
  ].filter(Boolean).join(' · ')

  return (
    <article className={styles.row}>
      <div className={styles.head}>
        <button className={styles.gifBtn} onClick={onOpen} aria-label={`Техника: ${exercise.name}`}>
          <ExerciseGif id={exerciseId} name={exercise.name} />
        </button>

        <div className={styles.meta}>
          <button className={styles.name} onClick={onOpen}>{exercise.name}</button>
          <p className={styles.params}>{params}</p>
        </div>
      </div>

      <div className={styles.weight}>
        <label className={styles.weightLabel} htmlFor={`w-${exerciseId}`}>Вес, кг</label>
        <input
          id={`w-${exerciseId}`}
          className={styles.weightInput}
          type="number"
          inputMode="decimal"
          step="0.5"
          value={weight ?? ''}
          placeholder="—"
          onChange={(e) => onWeight(e.target.value === '' ? null : Number(e.target.value))}
        />
        {lastSession?.weight != null && (
          <span className={styles.hint}>в прошлый раз: {formatWeight(lastSession.weight)} кг</span>
        )}
      </div>

      <SetTracker
        sets={block.sets}
        reps={reps}
        repRange={block.reps}
        onClose={onClose}
        onEdit={onEdit}
        onClear={onClear}
      />
    </article>
  )
}
