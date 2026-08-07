import { memo, useCallback, useEffect, useRef } from 'react'
import SetTracker from './SetTracker.jsx'
import EquipmentIcon from './EquipmentIcon.jsx'
import ExercisePreview from './ExercisePreview.jsx'
import { formatTime } from '../lib/timer.js'
import { formatWeight, stepWeight } from '../lib/format.js'
import { equipmentIcon } from '../lib/equipment.js'
import { muscleZone } from '../lib/muscleZone.js'
import { useHoldStep } from '../hooks/useHoldStep.js'
import styles from './ExerciseRow.module.css'

/**
 * Мемоизирован: во время тренировки на экране до 6 таких строк одновременно,
 * и без этого правка веса в одной перерисовывала бы все остальные на каждое
 * нажатие клавиши. Работает, только если колбэки сверху стабильны по
 * ссылке — поэтому здесь принимаются «сырые» многоаргументные onWeight/
 * onCloseSet/onClearSet/onOpen (те же сигнатуры, что в useWorkout.js),
 * а не готовые под конкретное упражнение замыкания.
 */
function ExerciseRow({
  block, exercise, exerciseId, reps, weight, lastSession, isRecord,
  onWeight, onCloseSet, onClearSet, onOpen, startRest,
}) {
  // Шаг удержания читает вес отсюда, а не из замыкания: пока палец лежит на
  // кнопке, таймер повторов вызывает один и тот же callback много раз подряд,
  // и он должен видеть каждый раз уже обновлённое значение, а не то, что
  // было в момент начала нажатия.
  const weightRef = useRef(weight)
  useEffect(() => { weightRef.current = weight }, [weight])

  const handleWeight = useCallback((w) => onWeight(exerciseId, w), [onWeight, exerciseId])

  const handleClose = useCallback((i, r) => {
    onCloseSet(exerciseId, i, block.sets, r)
    startRest(block.rest)
  }, [onCloseSet, exerciseId, block.sets, block.rest, startRest])

  const handleEdit = useCallback(
    (i, r) => onCloseSet(exerciseId, i, block.sets, r),
    [onCloseSet, exerciseId, block.sets],
  )

  const handleClear = useCallback(
    (i) => onClearSet(exerciseId, i, block.sets),
    [onClearSet, exerciseId, block.sets],
  )

  const handleOpen = useCallback(() => onOpen(exerciseId), [onOpen, exerciseId])

  const decWeight = useHoldStep(
    () => handleWeight(stepWeight(weightRef.current, lastSession?.weight ?? null, exercise.weightStep, -1)),
  )
  const incWeight = useHoldStep(
    () => handleWeight(stepWeight(weightRef.current, lastSession?.weight ?? null, exercise.weightStep, 1)),
  )

  const [min, max] = block.reps
  const params = [
    `${block.sets} × ${min}–${max}`,
    `RIR ${block.rir}`,
    `отдых ${formatTime(block.rest)}`,
    block.tempo ? `темп ${block.tempo}` : null,
  ].filter(Boolean).join(' · ')

  // Все подходы закрыты — видно на уровне всей карточки, а не только по
  // кружкам внутри, чтобы прогресс тренировки читался с одного взгляда.
  const allDone = reps != null && reps.length === block.sets && reps.every((r) => r != null)
  const icon = equipmentIcon(exercise.equipment)
  const zone = muscleZone(exercise.primary)

  return (
    <article className={allDone ? `${styles.row} ${styles.done}` : styles.row}>
      <div className={styles.body}>
        <button className={styles.head} onClick={handleOpen} aria-label={`Техника: ${exercise.name}`}>
          {icon && (
            <span className={styles.icon}>
              <EquipmentIcon type={icon} />
            </span>
          )}
          <span className={styles.headText}>
            <span className={styles.name}>{exercise.name}</span>
            <span className={styles.params}>{params}</span>
          </span>
        </button>

        <div className={styles.weight}>
          <label className={styles.weightLabel} htmlFor={`w-${exerciseId}`}>Вес, кг</label>

          <div className={styles.weightControl}>
            <button
              className={styles.stepBtn}
              {...decWeight}
              aria-label="Меньше веса. Удержание — быстрее"
            >−</button>

            <input
              id={`w-${exerciseId}`}
              className={styles.weightInput}
              type="number"
              inputMode="decimal"
              step="0.5"
              value={weight ?? ''}
              placeholder="—"
              onChange={(e) => handleWeight(e.target.value === '' ? null : Number(e.target.value))}
            />

            <button
              className={styles.stepBtn}
              {...incWeight}
              aria-label="Больше веса. Удержание — быстрее"
            >+</button>
          </div>

          {/* Рекорд перекрывает обычную подсказку — это более полное сообщение
              (уже включает факт, что вес отличается от прошлого), а не эхо
              того же числа рядом с двумя разными подписями. */}
          {isRecord ? (
            <span className={styles.record}>Новый рекорд веса</span>
          ) : (
            // Поле уже предзаполнено прошлым весом при старте тренировки —
            // подсказка нужна, только если он от него отличается (сам изменил
            // или прошлого результата не было вовсе).
            lastSession?.weight != null && weight !== lastSession.weight && (
              <span className={styles.hint}>в прошлый раз: {formatWeight(lastSession.weight)} кг</span>
            )
          )}
        </div>

        <SetTracker
          sets={block.sets}
          reps={reps}
          repRange={block.reps}
          onClose={handleClose}
          onEdit={handleEdit}
          onClear={handleClear}
        />
      </div>

      {/* Во всю высоту карточки, не только строку заголовка — иначе на
          телефоне картинка выходит слишком мелкой, чтобы на бегу между
          подходами различить упражнение с одного взгляда. */}
      {(exercise.video || zone) && (
        <button className={styles.preview} onClick={handleOpen} aria-label={`Техника: ${exercise.name}`}>
          <ExercisePreview
            videoId={exercise.video}
            view={zone?.view}
            zone={zone?.zone}
            className={styles.previewImg}
          />
        </button>
      )}
    </article>
  )
}

export default memo(ExerciseRow)
