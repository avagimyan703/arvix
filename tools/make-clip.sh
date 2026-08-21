#!/usr/bin/env bash
# Нарезает отрезок ролика в клип упражнения и кладёт его в проект.
#
#   tools/make-clip.sh DTrPc9tExNW 22.9 28.7
#
# Кладёт public/clips/<код>.mp4 и public/thumbs/<код>.jpg. Дальше нужно
# руками добавить "video": "<код>" в запись упражнения в
# src/data/exercises.json — по этому полю ExercisePreview и ReelPlayer
# находят и постер, и клип.
#
# Параметры кодирования подобраны под остальные клипы: 480 по ширине,
# main profile и yuv420p ради Safari на iPhone, без звука (клип играет
# сам собой в цикле), faststart — чтобы начинался без ожидания.
set -euo pipefail

id="${1:?укажи короткий код ролика}"
from="${2:?укажи начало отрезка в секундах}"
to="${3:?укажи конец отрезка в секундах}"

root="$(cd "$(dirname "$0")/.." && pwd)"
work="${TMPDIR:-/tmp}/reel-frames-$id"
mkdir -p "$work"
src="$work/src.mp4"
[ -f "$src" ] || yt-dlp --no-warnings -q -o "$src" "https://www.instagram.com/p/$id/"

ffmpeg -v error -ss "$from" -to "$to" -i "$src" -an \
  -vf "scale=480:-2" -c:v libx264 -profile:v main -pix_fmt yuv420p \
  -crf 28 -preset slow -movflags +faststart \
  "$root/public/clips/$id.mp4" -y

# Постер — кадр из середины отрезка. Из og:image Инстаграма его брать
# нельзя: там в кадр впечатана кнопка плеера, и ссылка протухает.
mid=$(node -e "console.log((($from + $to) / 2).toFixed(2))")
ffmpeg -v error -ss "$mid" -i "$src" -frames:v 1 -vf "scale=480:-2" -q:v 4 \
  "$root/public/thumbs/$id.jpg" -y

echo "клип:   public/clips/$id.mp4 ($(du -h "$root/public/clips/$id.mp4" | cut -f1))"
echo "постер: public/thumbs/$id.jpg"
echo "осталось: добавить \"video\": \"$id\" в src/data/exercises.json"
