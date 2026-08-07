/**
 * Тип инвентаря по строке exercise.equipment — определяет, какую иконку
 * показать в карточке упражнения. Понимает только категории, которые
 * реально встречаются во взвешиваемых блоках тренировки (program.json:
 * blocks) — штанга, гантели, блочный тренажёр, турник. Инвентарь
 * атлетического финишера (BOSU, гиря, скакалка и т.п.) сюда не входит:
 * там нет веса и подходов, карточка устроена иначе.
 *
 * @param {string} equipment
 * @returns {'barbell'|'dumbbell'|'machine'|'bar'|null}
 */
export function equipmentIcon(equipment) {
  const text = String(equipment ?? '')
  if (/штанг/i.test(text)) return 'barbell'
  if (/гантел/i.test(text)) return 'dumbbell'
  if (/тренажёр|тренажер|блочн/i.test(text)) return 'machine'
  if (/турник/i.test(text)) return 'bar'
  return null
}
