#!/bin/bash
# Режет из каждого видео wger (CC-BY-SA 4.0) один повтор в плавную гифку.
# 12 fps, 3 с, 320 px по ширине, 64 цвета — около 800 КБ на файл.
#
# -nostdin обязателен: без него ffmpeg съедает stdin у цикла while read
# и у следующих имён отгрызается первая буква.
set -u

SP=/private/tmp/claude-501/-private-var-www/74799907-e49d-44d1-8a4a-0b38fab54c1a/scratchpad
OUT=/var/www/arvix/public/gifs
VID=$SP/wger-vid

for f in "$VID"/*.mov; do
  id=$(basename "$f" .mov)

  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null < /dev/null | cut -d. -f1)
  [ -z "$dur" ] && dur=10
  # старт на 25% длины: там обычно уже рабочий повтор, а не подход к снаряду
  start=$(( dur / 4 ))

  if ffmpeg -nostdin -y -loglevel error -ss "$start" -t 3 -i "$f" \
    -vf "fps=12,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=64[p];[s1][p]paletteuse=dither=none" \
    -loop 0 "$OUT/$id.gif" 2>/dev/null
  then
    frames=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$OUT/$id.gif" 2>/dev/null < /dev/null)
    printf "  ✓ %-22s %6s  %s кадров  (из %s с, старт %s с)\n" "$id.gif" "$(du -h "$OUT/$id.gif" | cut -f1)" "$frames" "$dur" "$start"
  else
    echo "  ✗ $id — ffmpeg упал"
  fi
done
