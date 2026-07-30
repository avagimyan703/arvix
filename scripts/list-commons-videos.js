const SP = '/private/tmp/claude-501/-private-var-www/74799907-e49d-44d1-8a4a-0b38fab54c1a/scratchpad'
const fs = require('fs')

async function api(params) {
  const u = new URL('https://commons.wikimedia.org/w/api.php')
  u.searchParams.set('format', 'json')
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v)
  const r = await fetch(u)
  if (!r.ok) throw new Error(u + ' -> ' + r.status)
  return r.json()
}

;(async () => {
  // Серия «... - exercise demonstration video»
  const s = await api({
    action: 'query',
    list: 'search',
    srnamespace: 6,
    srsearch: 'intitle:"exercise demonstration video"',
    srlimit: 50,
  })
  const titles = s.query.search.map((x) => x.title)
  console.log('файлов в серии:', s.query.searchinfo.totalhits, '— получено', titles.length)

  // Лицензия и прямая ссылка
  const info = await api({
    action: 'query',
    titles: titles.join('|'),
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiextmetadatafilter: 'LicenseShortName|Artist|UsageTerms',
  })

  const rows = []
  for (const p of Object.values(info.query.pages)) {
    const ii = p.imageinfo?.[0]
    if (!ii) continue
    const md = ii.extmetadata || {}
    const strip = (h) => (h ? String(h.value).replace(/<[^>]*>/g, '').trim() : '')
    rows.push({
      title: p.title.replace(/^File:/, '').replace(/ - exercise demonstration video\.webm$/, ''),
      url: ii.url,
      mb: +(ii.size / 1048576).toFixed(1),
      license: strip(md.LicenseShortName),
      author: strip(md.Artist),
    })
  }

  rows.sort((a, b) => a.title.localeCompare(b.title))
  fs.writeFileSync(SP + '/commons-videos.json', JSON.stringify(rows, null, 1))
  console.log()
  rows.forEach((r) => console.log(String(r.mb).padStart(6) + 'МБ  ' + r.license.padEnd(14) + r.title))
})().catch((e) => console.log('ошибка:', e.message))
