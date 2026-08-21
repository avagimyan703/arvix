#!/usr/bin/env node
// Поиск упражнения по подписям роликов.
//
//   tools/fetch-captions.sh urls.txt > captions.tsv
//   node tools/captions.mjs captions.tsv 'incline.*dumbbell'
//   node tools/captions.mjs captions.tsv --full DTrPc9tExNW
//
// Без запроса печатает по строке на ролик — обзор каталога целиком.
// С регулярным выражением показывает совпавшие подписи целиком: в них
// у части роликов лежит полный список упражнений с подходами, и именно
// он говорит, что нужное упражнение вообще есть внутри сборника.
import { readFileSync } from 'node:fs'

const [file, ...rest] = process.argv.slice(2)
if (!file) {
  console.error('использование: node tools/captions.mjs captions.tsv [регулярка | --full ID]')
  process.exit(1)
}

const rows = readFileSync(file, 'utf8').trim().split('\n').map((line) => {
  const [id, channel, ...tail] = line.split('|||')
  let text = tail.join('|||')
  // Подпись приходит JSON-строкой: снимаем кавычки и экранирование.
  try { text = JSON.parse(text) } catch { /* пустая подпись приезжает как NA */ }
  return { id, channel, text: String(text) }
})

const firstLine = (r) => r.text.split('\n')[0].slice(0, 100)

if (rest[0] === '--full') {
  const r = rows.find((x) => x.id === rest[1])
  if (!r) { console.error(`нет такого ролика: ${rest[1]}`); process.exit(1) }
  console.log(`${r.id} · ${r.channel}\n\n${r.text}`)
} else if (rest[0]) {
  const re = new RegExp(rest[0], 'i')
  const hits = rows.filter((r) => re.test(r.text))
  console.log(`совпало ${hits.length} из ${rows.length}\n`)
  for (const r of hits) console.log(`===== ${r.id} · ${r.channel} =====\n${r.text}\n`)
} else {
  console.log(`роликов: ${rows.length}`)
  for (const r of rows) console.log(`${r.id}  ${r.channel.padEnd(16)}  ${firstLine(r)}`)
}
