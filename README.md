# Arvix

Личный офлайн-помощник для зала: техника упражнения, норма подходов, отметки и двойная прогрессия. Один пользователь, без сервера и аккаунтов.

## Команды

```
npm install      установка
npm run dev      локальная разработка
npm test         тесты
npm run build    сборка в dist/
npm run preview  просмотр собранного
```

## Как менять программу

`src/data/program.json` — что и сколько делать. Дни, упражнения, подходы, диапазон повторений, RIR, отдых, темп.

`src/data/exercises.json` — как делать. Техника, частые ошибки, целевые мышцы, шаг прибавки веса.

Новое упражнение: запись в `exercises.json` + файл `public/gifs/<id>.gif` + строка в `program.json`. Кода это не касается.

Тест `src/data/data.test.js` следит, чтобы программа и библиотека не разъезжались в обе стороны: упражнение из программы обязано быть в библиотеке, а неиспользуемых записей в библиотеке быть не должно.

## Гифки

Кладутся в `public/gifs/` с именем, равным идентификатору упражнения: `back-squat.gif`, `bench-press.gif` и так далее. Полный список идентификаторов — ключи в `exercises.json`.

Отсутствующий файл приложение переживает: показывает плашку с первой буквой названия. Можно деплоить с неполным набором и дополнять по одной.

Проверить, каких гифок не хватает:

```bash
node -e "
const ex = require('./src/data/exercises.json');
const fs = require('fs');
const have = new Set(fs.readdirSync('public/gifs').filter(f => f.endsWith('.gif')).map(f => f.replace('.gif','')));
console.log('нет гифки:', Object.keys(ex).filter(id => !have.has(id)).join(', ') || '—');
console.log('лишние файлы:', [...have].filter(id => !ex[id]).join(', ') || '—');
"
```

## Прогресс

Хранится в `localStorage`, ключ `arvix.v1`. По каждому упражнению — только последняя сессия: этого хватает для двойной прогрессии, а данные остаются крошечными.

Правило прогрессии (`src/lib/progression.js`): подсказка «пора добавить вес» появляется, когда во всех плановых подходах достигнута верхняя граница диапазона и вес сегодня не ниже прошлого. Ничего не меняется автоматически — поле веса остаётся за тобой.

## Иконки

PNG в `public/icons/` собраны из SVG в `icons-src/`. Пересобрать после правки исходников:

```bash
cd public/icons
qlmanage -t -s 512 -o . ../../icons-src/icon.svg && mv icon.svg.png icon-512.png
cp icon-512.png icon-192.png && sips -z 192 192 icon-192.png
qlmanage -t -s 512 -o . ../../icons-src/icon-maskable.svg && mv icon-maskable.svg.png icon-512-maskable.png
```

## Документы

- Спека: `docs/superpowers/specs/2026-07-29-arvix-design.md`
- План реализации: `docs/superpowers/plans/2026-07-29-arvix-v1.md`
