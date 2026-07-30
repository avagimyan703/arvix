#!/bin/bash
# Собирает двухкадровые циклические GIF из пар «начальная/конечная позиция»
# открытой базы free-exercise-db. Кадры чередуются раз в 0.7 с — движение
# читается за секунду, что и нужно в зале.
set -u

SP=/private/tmp/claude-501/-private-var-www/74799907-e49d-44d1-8a4a-0b38fab54c1a/scratchpad
BASE=https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises
OUT=/var/www/arvix/public/gifs
TMP=$SP/frames

mkdir -p "$OUT" "$TMP"

# id проекта  →  имя каталога в базе
build() {
  local id="$1" dir="$2"
  local f0="$TMP/${id}-1.jpg" f1="$TMP/${id}-2.jpg"

  curl -sfL -o "$f0" "$BASE/$dir/0.jpg" || { echo "  ✗ $id — не скачался кадр 0"; return 1; }
  curl -sfL -o "$f1" "$BASE/$dir/1.jpg" || { echo "  ✗ $id — не скачался кадр 1"; return 1; }

  ffmpeg -y -loglevel error \
    -framerate 1.43 -i "$TMP/${id}-%d.jpg" \
    -vf "scale=440:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse" \
    -loop 0 "$OUT/$id.gif" 2>/dev/null || { echo "  ✗ $id — ffmpeg упал"; return 1; }

  echo "  ✓ $id.gif ($(du -h "$OUT/$id.gif" | cut -f1))"
}

echo "=== Силовые: точные совпадения ==="
build bench-press            "Barbell_Bench_Press_-_Medium_Grip"
build db-row                 "One-Arm_Dumbbell_Row"
build pull-up                "Pullups"
build incline-db-press       "Incline_Dumbbell_Press"
build leg-curl               "Lying_Leg_Curls"
build back-squat             "Barbell_Full_Squat"
build db-rdl                 "Stiff-Legged_Dumbbell_Deadlift"
build leg-press              "Leg_Press"
build db-bench-press         "Dumbbell_Bench_Press"
build lateral-raise          "Side_Lateral_Raise"
build seated-db-press        "Seated_Dumbbell_Press"
build seated-row             "Seated_Cable_Rows"
build db-curl                "Dumbbell_Bicep_Curl"
build triceps-pushdown       "Triceps_Pushdown"
build jump-rope              "Rope_Jumping"
build squat-jump             "Freehand_Jump_Squat"

echo
echo "=== Приблизительные: движение то же, снаряд или вариант другой ==="
build bulgarian-split-squat  "Split_Squat_with_Dumbbells"
build bosu-balance           "Balance_Board"
build band-rotation          "Pallof_Press_With_Rotation"
build medball-slam           "One-Arm_Medicine_Ball_Slam"
build kettlebell-swing       "One-Arm_Kettlebell_Swings"

echo
echo "=== Не найдено в базе, остаётся буквой ==="
echo "  agility-ladder (координационная лестница)"
