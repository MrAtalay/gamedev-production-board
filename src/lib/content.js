// İçerik veri tabanı: sayım, tutarlılık kontrolleri ve dışa aktarma.
//
// Buradaki kontrollerin hepsi HESAPLANIR. Sistem "bu boss eğlenceli mi"
// demez, diyemez: o karar işkoluna girer ve hiçbir araçtan etkilenmez.
// Ama "üç bossun ikisinin canı aynı" diyebilir, çünkü bu veriye bakarak
// doğrulanabilir bir şey.
//
// Aynı ayrım gates.js içinde de var: otomatik kontroller sistemin
// doğrulayabildikleri, kendi beyanları kullanıcının dürüstlüğüne kalanlar.
// Sistem doğrulayabildiğini doğrulamak zorundadır.

import {
  contentTypesFor,
  findContentType,
  containerTypeFor,
  lowerName,
  dativeName,
} from '../data/content.js'

export function contentItems(project) {
  return (project.content && project.content.items) || []
}

export function itemsOfType(project, typeId) {
  return contentItems(project).filter((i) => i.typeId === typeId)
}

// Tür başına sayım. plannedUnits'i tahmin olmaktan çıkaran şey bu.
export function contentCounts(project) {
  const types = contentTypesFor(project.profile.genreId)
  const items = contentItems(project)
  return types.map((type) => ({
    type,
    count: items.filter((i) => i.typeId === type.id).length,
  }))
}

// Seçili türün şemasında karşılığı olmayan bileşenler.
//
// Ayarlar'dan tür değiştirilince eski türün bileşenleri kayıtta kalır ama
// hiçbir bölümde görünmez. Sessizce kaybolmuş gibi durur, oysa duruyorlar.
// Veriyi göstermeden saymak da, silmek de yanlış olur: kullanıcıya
// gösterilip kararı ona bırakılıyor.
export function orphanItems(project) {
  const known = new Set(contentTypesFor(project.profile.genreId).map((t) => t.id))
  return contentItems(project).filter((i) => !known.has(i.typeId))
}

// Seçili türün şemasına uyan bileşenler. plannedUnits bu sayıyı kullanır:
// görünmeyen bir bileşeni saymak, sayımı tekrar tahmine çevirirdi.
export function validItems(project) {
  const known = new Set(contentTypesFor(project.profile.genreId).map((t) => t.id))
  return contentItems(project).filter((i) => known.has(i.typeId))
}

export function totalContentUnits(project) {
  return validItems(project).length
}

// Kaç alanın doldurulduğu. "Kabaca isim gir, zamanla detaylandır"
// akışının görünür hali: kullanıcı ne kadar ilerlediğini görür.
export function detailProgress(project) {
  const items = validItems(project)
  let filled = 0
  let total = 0
  items.forEach((item) => {
    const type = findContentType(project.profile.genreId, item.typeId)
    if (!type) return
    type.fields.forEach((field) => {
      total += 1
      const v = (item.fields || {})[field.key]
      if (v !== undefined && String(v).trim() !== '') filled += 1
    })
  })
  return { filled, total, percent: total === 0 ? 0 : Math.round((filled / total) * 100) }
}

function nameOf(project, id) {
  const item = contentItems(project).find((i) => i.id === id)
  return item ? item.name : null
}

// Bir bileşenin diğerleriyle bağı. TÜRETİLİR, saklanmaz.
//
// Aynı bilgiyi iki yerde tutmak, iki yerin ayrışması demektir: düşmanın
// "ne düşürür" alanı ile eşyanın "nereden düşer" alanı elle tutulsaydı
// biri değişince diğeri yanlış kalırdı. Tek kaynak düşmanın alanı,
// eşyanın tarafı ondan hesaplanıyor.
export function itemRelations(project, item) {
  const items = validItems(project)
  const ad = item.name.toLocaleLowerCase('tr').trim()

  // Bunu ne düşürür?
  const dusurenler = items
    .filter((x) => splitList((x.fields || {}).dusurur).some(
      (d) => d.toLocaleLowerCase('tr').trim() === ad
    ))
    .map((x) => x.name)

  // Bu, neyin üretiminde malzeme?
  const kullananlar = items
    .filter((x) => splitList((x.fields || {}).malzeme).some(
      (m) => m.toLocaleLowerCase('tr').trim() === ad
    ))
    .map((x) => x.name)

  // Bu neyden üretiliyor ve o malzemeler tanımlı mı?
  const bilinen = new Set(items.map((x) => x.name.toLocaleLowerCase('tr').trim()))
  const malzemeler = splitList((item.fields || {}).malzeme).map((m) => ({
    ad: m,
    tanimli: bilinen.has(m.toLocaleLowerCase('tr').trim()),
  }))

  // Bu ne düşürüyor ve o ganimetler tanımlı mı?
  const dusurdukleri = splitList((item.fields || {}).dusurur).map((d) => ({
    ad: d,
    tanimli: bilinen.has(d.toLocaleLowerCase('tr').trim()),
  }))

  return { dusurenler, kullananlar, malzemeler, dusurdukleri }
}

// Bir yerde adı geçen ama kendi kaydı olmayan ganimet ve malzemeler.
// Tek tıkla eşya olarak eklenebilsinler diye ayrı duruyor.
export function eksikOgeler(project) {
  const items = validItems(project)
  const bilinen = new Set(items.map((i) => i.name.toLocaleLowerCase('tr').trim()))
  const eksik = new Map()
  items.forEach((i) => {
    ;['dusurur', 'malzeme'].forEach((anahtar) => {
      splitList((i.fields || {})[anahtar]).forEach((ad) => {
        const k = ad.toLocaleLowerCase('tr').trim()
        if (bilinen.has(k) || eksik.has(k)) return
        eksik.set(k, { ad, kaynak: i.name, anahtar })
      })
    })
  })
  return [...eksik.values()]
}

function splitList(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

// Veri tutarlılığı kontrolleri.
//
// Her biri veriye bakarak doğrulanabilir. Hiçbiri "şunu yap" demiyor,
// "şu durum var, kasıtlı mı" diyor. Kasıtlı olabilir: sistem kararı
// kullanıcıya bırakır ama durumu gizlemez.
export function contentChecks(project) {
  const genreId = project.profile.genreId
  const types = contentTypesFor(genreId)
  const items = validItems(project)
  const container = containerTypeFor(genreId)
  const findings = []

  const orphans = orphanItems(project)
  if (orphans.length > 0) {
    findings.push({
      tone: 'warn',
      title: orphans.length + ' bileşen seçili türün şemasına uymuyor',
      detail:
        orphans.map((o) => o.name).join(', ') +
        '. Bunlar başka bir tür seçiliyken girilmiş. Kayıtta duruyorlar ama ' +
        'hiçbir bölümde görünmüyorlar ve birim sayımına dahil değiller. ' +
        'İçerik ekranının altındaki listeden silebilir veya türü geri ' +
        'değiştirip geri kazanabilirsin.',
    })
  }

  if (items.length === 0) return findings

  // 1) Boş tür: bu türden hiç bileşen girilmemiş.
  types.forEach((type) => {
    const count = items.filter((i) => i.typeId === type.id).length
    if (count === 0) {
      findings.push({
        tone: 'info',
        title: type.name + ' girilmemiş',
        detail:
          'Bu türden hiç bileşen yok. Oyununda gerçekten yoksa sorun değil, ' +
          'ama varsa listeye girmediğin içerik plana da girmiyor demektir.',
      })
    }
  })

  // 2) Aynı sayısal değeri paylaşan bileşenler.
  types.forEach((type) => {
    const mine = items.filter((i) => i.typeId === type.id)
    if (mine.length < 2) return
    type.fields
      .filter((f) => f.type === 'number')
      .forEach((field) => {
        const groups = {}
        mine.forEach((item) => {
          const v = (item.fields || {})[field.key]
          if (v === undefined || String(v).trim() === '') return
          groups[v] = groups[v] || []
          groups[v].push(item.name)
        })
        Object.keys(groups).forEach((value) => {
          if (groups[value].length < 2) return
          findings.push({
            tone: 'warn',
            title:
              type.name +
              ' türünde ' +
              groups[value].length +
              ' bileşenin "' +
              field.label +
              '" değeri aynı: ' +
              value,
            detail:
              groups[value].join(', ') +
              '. Kasıtlıysa sorun yok. Değilse, oyuncu bu bileşenleri ' +
              'birbirinden ayırt edemez ve içerik olduğundan az hissettirir.',
          })
        })
      })
  })

  // 3) Kapsayıcıya bağlanmamış bileşenler.
  if (container) {
    types.forEach((type) => {
      const refField = type.fields.find((f) => f.type === 'ref' && f.refType === container.id)
      if (!refField) return
      const orphans = items
        .filter((i) => i.typeId === type.id)
        .filter((i) => {
          const v = (i.fields || {})[refField.key]
          return v === undefined || String(v).trim() === ''
        })
      if (orphans.length > 0) {
        findings.push({
          tone: 'warn',
          title:
            orphans.length +
            ' ' +
            lowerName(type) +
            ' hiçbir ' +
            dativeName(container) +
            ' bağlı değil',
          detail:
            orphans.map((o) => o.name).join(', ') +
            '. Nerede karşılaşılacağı belli olmayan içerik, üretim sırasında ' +
            'unutulur veya son anda bir yere sıkıştırılır.',
        })
      }
    })

    // 4) İçi boş kapsayıcılar ve dağılım dengesizliği.
    const containers = items.filter((i) => i.typeId === container.id)
    if (containers.length > 0) {
      const load = containers.map((c) => {
        const count = items.filter((i) => {
          if (i.typeId === container.id) return false
          const type = findContentType(genreId, i.typeId)
          if (!type) return false
          const refField = type.fields.find((f) => f.type === 'ref' && f.refType === container.id)
          if (!refField) return false
          return (i.fields || {})[refField.key] === c.id
        }).length
        return { name: c.name, count }
      })

      const empty = load.filter((l) => l.count === 0)
      if (empty.length > 0 && load.length > empty.length) {
        findings.push({
          tone: 'warn',
          title: empty.length + ' ' + lowerName(container) + ' boş',
          detail:
            empty.map((e) => e.name).join(', ') +
            '. İçinde hiçbir şey olmayan bir ' +
            lowerName(container) +
            ', oyuncuya boş bir koridor gibi gelir.',
        })
      }

      const counts = load.map((l) => l.count)
      const max = Math.max(...counts)
      const min = Math.min(...counts)
      if (load.length > 1 && min > 0 && max >= min * 3) {
        const en = load.find((l) => l.count === max)
        const az = load.find((l) => l.count === min)
        findings.push({
          tone: 'info',
          title: 'İçerik dağılımı dengesiz',
          detail:
            en.name +
            ' içinde ' +
            max +
            ' bileşen var, ' +
            az.name +
            ' içinde ' +
            min +
            '. Kasıtlı bir tempo farkıysa sorun yok. Değilse, bir ' +
            lowerName(container) +
            ' diğerinden belirgin biçimde kısa hissedilecek.',
        })
      }
    }
  }

  // 5) Düşürülen ama listede olmayan ganimet.
  // "Hiçbir kaynak hiçbir düşmandan düşmüyor" durumunun tersi de burada:
  // adı geçen ama tanımlanmamış eşyalar.
  const dropFields = []
  types.forEach((type) => {
    type.fields
      .filter((f) => f.key === 'dusurur')
      .forEach((f) => dropFields.push({ type, field: f }))
  })
  if (dropFields.length > 0) {
    const droppedNames = new Set()
    dropFields.forEach(({ type, field }) => {
      items
        .filter((i) => i.typeId === type.id)
        .forEach((item) => {
          splitList((item.fields || {})[field.key]).forEach((drop) => {
            droppedNames.add(drop.toLocaleLowerCase('tr').trim())
          })
        })
    })

    const eksik = eksikOgeler(project)
    if (eksik.length > 0) {
      findings.push({
        tone: 'warn',
        title: eksik.length + ' ganimet veya malzeme listede tanımlı değil',
        detail:
          eksik.map((e) => e.ad).join(', ') +
          '. Bunlar düşürülüyor veya üretimde kullanılıyor ama kendi ' +
          'kayıtları yok, yani ne işe yaradıkları hiçbir yerde yazmıyor.',
        // Tek tıkla eşya olarak eklenebilmeleri için.
        eylem: { tur: 'ganimetEkle', adlar: eksik.map((e) => e.ad) },
      })
    }

    // Hiçbir yoldan elde edilemeyen eşyalar.
    //
    // Üç yol var ve üçü de sayılır: bir düşmandan düşmek, üretilmek
    // (malzemesi yazılı olmak) veya düşman dışı bir yolla gelmek
    // (sandık, dükkan, görev). Üçü de yoksa oyuncu o eşyaya ulaşamaz.
    const unreachable = items
      .filter((i) => {
        const t = findContentType(genreId, i.typeId)
        return t && (t.id === 'kaynak' || t.id === 'esya')
      })
      .filter((i) => {
        const ad = i.name.toLocaleLowerCase('tr').trim()
        if (droppedNames.has(ad)) return false
        if (splitList((i.fields || {}).malzeme).length > 0) return false
        if (String((i.fields || {}).nereden || '').trim() !== '') return false
        return true
      })
    if (unreachable.length > 0) {
      findings.push({
        tone: 'warn',
        title: unreachable.length + ' eşyanın elde etme yolu yok',
        detail:
          unreachable.map((u) => u.name).join(', ') +
          '. Bu eşyalar hiçbir düşmandan düşmüyor, üretilmiyor ve düşman ' +
          'dışı bir yolu da yazılmamış. Oyuncu bunlara hiç ulaşamaz.',
      })
    }
  }

  // 6) İsim tekrarı.
  const byName = {}
  items.forEach((i) => {
    const key = i.typeId + '|' + i.name.toLocaleLowerCase('tr').trim()
    byName[key] = (byName[key] || 0) + 1
  })
  const dupes = Object.keys(byName).filter((k) => byName[k] > 1)
  if (dupes.length > 0) {
    findings.push({
      tone: 'warn',
      title: dupes.length + ' isim birden fazla kez kullanılmış',
      detail:
        'Aynı türde aynı isimde iki bileşen var. Hangisinden bahsettiğini ' +
        'sonradan ayırt edemezsin.',
    })
  }

  const rank = { warn: 0, info: 1 }
  return findings.sort((a, b) => rank[a.tone] - rank[b.tone])
}

// Dışa aktarma: JSON.
// Asistana veya başka bir araca verilecek ham veri.
export function contentExportJson(project) {
  const genreId = project.profile.genreId
  const types = contentTypesFor(genreId)
  return JSON.stringify(
    {
      oyun: project.name,
      tur: genreId,
      olusturuldu: new Date().toISOString(),
      turler: types.map((t) => ({
        id: t.id,
        ad: t.name,
        alanlar: t.fields.map((f) => ({ anahtar: f.key, etiket: f.label, tip: f.type })),
      })),
      bilesenler: validItems(project).map((i) => ({
        id: i.id,
        tur: i.typeId,
        ad: i.name,
        alanlar: i.fields || {},
        // Referanslar id tutuyor, okunabilir olsun diye adı da yazılıyor.
        referansAdlari: Object.keys(i.fields || {}).reduce((acc, key) => {
          const n = nameOf(project, i.fields[key])
          if (n) acc[key] = n
          return acc
        }, {}),
      })),
    },
    null,
    2
  )
}

// Dışa aktarma: föy.
//
// JSON makine için, bu insan ve asistan için. Ne İSTENDİĞİNİ de yazar,
// çünkü ham veriyi bir asistana verip "bunu yaz" demek, ne yazılacağını
// söylemeden kod istemek demektir.
export function contentExportBrief(project) {
  const genreId = project.profile.genreId
  const types = contentTypesFor(genreId)
  const items = validItems(project)
  const lines = []

  lines.push('# ' + project.name + ': içerik föyü')
  lines.push('')
  lines.push('Bu dosya Proje Panosu\'ndan dışa aktarıldı. Oyunun içeriğinin')
  lines.push('tasarım kaydıdır, uygulanmış hali değil.')
  lines.push('')
  lines.push('Tarih: ' + new Date().toLocaleDateString('tr-TR'))
  lines.push('Tür: ' + genreId)
  lines.push('Toplam bileşen: ' + items.length)
  lines.push('')
  lines.push('## Bu föy nasıl kullanılır')
  lines.push('')
  lines.push('Bir kod asistanına verirken istenen şey ISKELET kodudur:')
  lines.push('veri yapıları, tanım dosyaları, alan adları ve yükleme kodu.')
  lines.push('Aşağıdaki sayılar TASARIM KARARLARIDIR, asistanın bunları')
  lines.push('değiştirmesi veya "dengelemesi" istenmez.')
  lines.push('')
  lines.push('Dengenin doğru olup olmadığı oynayarak anlaşılır. Bu föyü')
  lines.push('veren kişi o testi kendisi yapar.')
  lines.push('')

  types.forEach((type) => {
    const mine = items.filter((i) => i.typeId === type.id)
    lines.push('## ' + type.name + ' (' + mine.length + ')')
    lines.push('')
    lines.push(type.summary)
    lines.push('')
    if (mine.length === 0) {
      lines.push('_Bu türden bileşen girilmedi._')
      lines.push('')
      return
    }
    mine.forEach((item) => {
      lines.push('### ' + item.name)
      type.fields.forEach((field) => {
        let v = (item.fields || {})[field.key]
        if (v === undefined || String(v).trim() === '') v = '(boş)'
        else if (field.type === 'ref') v = nameOf(project, v) || v
        lines.push('- ' + field.label + ': ' + v)
      })
      lines.push('')
    })
    lines.push('**Bu türü test ederken bakılacaklar:**')
    lines.push('')
    type.testChecklist.forEach((c) => lines.push('- [ ] ' + c))
    lines.push('')
  })

  const checks = contentChecks(project)
  if (checks.length > 0) {
    lines.push('## Veri tutarlılığı notları')
    lines.push('')
    lines.push('Bunlar hata değil, dikkat çekilen durumlar. Kasıtlı olabilirler.')
    lines.push('')
    checks.forEach((c) => {
      lines.push('- **' + c.title + '** ' + c.detail)
    })
    lines.push('')
  }

  return lines.join('\n')
}
