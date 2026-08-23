#!/usr/bin/env bash
# Миниатюра рилса для списка каталога — чтобы упражнение читалось с одного
# взгляда, а не только по заголовку.
#
#   tools/make-preview.sh DTrPc9tExNW
#   tools/make-preview.sh DTrPc9tExNW 12.5   (кадр вручную, перезапишет готовый)
#   tools/make-preview.sh codes.txt          (файл с кодами, по одному на строку)
#
# Кладёт public/previews/<код>.jpg — 200 по ширине. Это не постер из
# public/thumbs: тот 480px и растягивается на всю ширину под клипом, а здесь
# картинка живёт в строке размером с ноготь, и 480px были бы восьмикратным
# перевесом в офлайн-кеше (globPatterns в vite.config.js тянет туда все jpg).
#
# Кадр берём на 35% длительности. Не с начала и не с конца осознанно: у этих
# роликов в конце врезка с рекламой приложения, а в начале бывает заставка —
# и там и там упражнения не видно. Середина показывает само движение.
#
# Из og:image Инстаграма кадр брать нельзя: в него впечатана кнопка
# воспроизведения, и ссылка протухает через несколько часов.
#
# Видео качается во временную папку и удаляется сразу после кадра — иначе
# двести роликов оставят после себя гигабайты.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/public/previews"
mkdir -p "$out"

one() {
  local id="$1"
  local pick="${2:-}"
  # Ручная секунда — это осознанная замена неудачного кадра, поэтому она
  # перезаписывает готовый файл. Без неё готовые пропускаем: batch на две
  # сотни роликов не должен качать заново то, что уже вырезано.
  if [ -z "$pick" ] && [ -f "$out/$id.jpg" ]; then
    echo "уже есть: $id"
    return 0
  fi

  local work="${TMPDIR:-/tmp}/preview-$id"
  mkdir -p "$work"
  local src="$work/src.mp4"

  if ! yt-dlp --no-warnings -q -o "$src" "https://www.instagram.com/p/$id/" 2>/dev/null; then
    echo "НЕ СКАЧАЛСЯ: $id"
    rm -rf "$work"
    return 0
  fi

  local at
  if [ -n "$pick" ]; then
    at="$pick"
  else
    local dur
    dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src" 2>/dev/null || echo "")
    if [ -n "$dur" ]; then
      at=$(node -e "console.log(($dur * 0.35).toFixed(2))")
    else
      at=3
    fi
  fi

  if ffmpeg -v error -ss "$at" -i "$src" -frames:v 1 -vf "scale=200:-2" -q:v 5 "$out/$id.jpg" -y 2>/dev/null; then
    echo "готово: $id ($(du -h "$out/$id.jpg" | cut -f1), кадр на $at с)"
  else
    echo "НЕ ВЫШЕЛ КАДР: $id"
  fi

  rm -rf "$work"
}

arg="${1:?укажи код ролика или файл с кодами}"
if [ -f "$arg" ]; then
  while read -r id; do
    [ -n "$id" ] && one "$id"
  done < "$arg"
else
  one "$arg" "${2:-}"
fi
