#!/usr/bin/env bash
# Раскадровка ролика в одну картинку — чтобы глазами найти нужный
# отрезок и убедиться, что упражнение то самое.
#
#   tools/reel-frames.sh DTrPc9tExNW            весь ролик, 1 кадр в секунду
#   tools/reel-frames.sh DTrPc9tExNW 21 31 2    отрезок 21–31 с, 2 кадра в секунду
#
# Печатает путь к плитке. Подпись врёт про инвентарь (ролик с названием
# «Incline Bench Press» бывает со штангой, а не с гантелями), поэтому
# кадры — обязательный шаг, а не проверка на всякий случай.
set -euo pipefail

id="${1:?укажи короткий код ролика}"
from="${2:-}"
to="${3:-}"
fps="${4:-1}"

work="${TMPDIR:-/tmp}/reel-frames-$id"
mkdir -p "$work/f"
rm -f "$work"/f/*.jpg 2>/dev/null || true

src="$work/src.mp4"
[ -f "$src" ] || yt-dlp --no-warnings -q -o "$src" "https://www.instagram.com/p/$id/"

cut=()
[ -n "$from" ] && cut+=(-ss "$from")
[ -n "$to" ] && cut+=(-to "$to")

ffmpeg -v error "${cut[@]}" -i "$src" -vf "fps=$fps,scale=300:-2" "$work/f/%03d.jpg" -y
count=$(ls "$work"/f/*.jpg | wc -l | tr -d ' ')
cols=6
rows=$(( (count + cols - 1) / cols ))

ffmpeg -v error -i "$work/f/%03d.jpg" \
  -vf "tile=${cols}x${rows}:margin=3:padding=3:color=0x333333" \
  -frames:v 1 -q:v 3 "$work/tile.jpg" -y

echo "кадров: $count · сетка ${cols}x${rows}"
echo "$work/tile.jpg"
