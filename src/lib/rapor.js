// Pano ile dışarıdaki bir kod asistanı arasındaki iki yönlü protokol.
//
// NEDEN DOSYA, NEDEN API DEĞİL
//
// Planlama iş bilgisayarında, oyun geliştirme kişisel bilgisayarda
// yapılıyor. İki makine birbirine bağlı değil, dolayısıyla bir API bu
// sorunu zaten çözmüyor: iki ayrı localStorage arasında veri taşımıyor.
// Ayrıca `KURALLAR.md` gereği bu araç bir dış servise bağımlı olamaz ve
// arka ucu olmayan bir sayfada API anahtarı tutmak, anahtarı dosyayla
// birlikte dağıtmak demek olurdu.
//
// İKİ YÖN
//
//   Pano -> asistan : durum föyü. Hangi fazdasın, o fazın sert kuralları,
//                     sıradaki adım, teslimatlar, kapsam, riskler, içerik.
//                     Ayrıca geri yazılacak rapor biçiminin tarifi.
//
//   Asistan -> pano : iş raporu. Ne kadar çalışıldı, hangi adımlar bitti,
//                     içeriğe ne eklendi, hangi hatalar bulundu.
//
// SINIR: RAPOR KAPIYA DOKUNAMAZ
//
// Kapı kontrollerinin bir kısmı otomatik ve zaten veriden hesaplanıyor.
// Diğerleri kullanıcının kendi beyanı: "10 dakika oynadın ve durmak
// istemedin" gibi. Bir asistanın bunları işaretleyebilmesi, aracın var
// oluş sebebini ortadan kaldırırdı. Rapor kapıya, kapsama ve tahmin
// eksenlerine dokunamaz. Bunlar kullanıcının kararıdır.
//
// Rapor ayrıca doğrudan uygulanmaz: önce fark gösterilir, kullanıcı
// onaylar. Asistan ne yaptığını SÖYLER, ne olduğuna kullanıcı karar verir.

import { PHASES } from '../data/phases.js'
import { contentTypesFor, findContentType } from '../data/content.js'
import { currentPhase, phaseDeliverables, isDeliverableDone, nextTask } from './project.js'
import { computeEstimate } from './estimate.js'
import { validItems, contentChecks } from './content.js'

export const RAPOR_TURU = 'oyun-uretim-panosu-rapor'
export const RAPOR_SURUMU = 1

// ---- Pano -> asistan: durum föyü ----

export function durumFoyu(project) {
  const phase = currentPhase(project)
  const estimate = computeEstimate(project.profile)
  const deliverables = phaseDeliverables(project, phase.id)
  const next = nextTask(project)
  const types = contentTypesFor(project.profile.genreId)
  const items = validItems(project)
  const L = []

  L.push('# ' + project.name + ': durum föyü')
  L.push('')
  L.push('Bu dosya Proje Panosu tarafından üretildi. Panonun o anki durumunu')
  L.push('anlatır ve sonunda panoya geri yazılacak rapor biçimini tarif eder.')
  L.push('')
  L.push('Tarih: ' + new Date().toLocaleDateString('tr-TR'))
  L.push('')

  L.push('## Nerede duruyoruz')
  L.push('')
  L.push('- Faz: **' + phase.name + '** (' + phase.subtitle + ')')
  L.push('- Fazın amacı: ' + phase.goal)
  L.push('- Gereken toplam saat: ' + estimate.required)
  L.push('- Elde olan saat: ' + estimate.available.hours)
  L.push('- Karar: **' + estimate.verdict.label + '**')
  L.push('')

  if (phase.hardRules && phase.hardRules.length > 0) {
    L.push('## Bu fazın sert kuralları')
    L.push('')
    L.push('Bunlar tercih değil, kural. Bu fazda ihlal edilmez.')
    L.push('')
    phase.hardRules.forEach((k) => L.push('- ' + k))
    L.push('')
  }

  L.push('## Sıradaki tek iş')
  L.push('')
  if (next.type === 'step') {
    L.push('**' + next.deliverable.name + '** teslimatı, adım `' + next.step.id + '`:')
    L.push('')
    L.push('> ' + next.step.text)
    if (next.step.hint) L.push('>')
    if (next.step.hint) L.push('> İpucu: ' + next.step.hint)
    L.push('')
    L.push('Tahmini süre: ' + next.step.minutes + ' dakika.')
  } else if (next.type === 'deliverable') {
    L.push('**' + next.deliverable.name + '** teslimatı.')
  } else if (next.type === 'gate') {
    L.push('Bu fazın teslimatları bitti, sırada **kapı** var.')
    L.push('')
    L.push('Kapıyı sistem veya asistan geçemez. Kullanıcı kendi değerlendirir.')
  } else {
    L.push('Bu fazda yapılacak iş kalmadı.')
  }
  L.push('')

  L.push('## Bu fazın teslimatları')
  L.push('')
  deliverables.forEach((d) => {
    const bitti = isDeliverableDone(project, d)
    L.push('- [' + (bitti ? 'x' : ' ') + '] **' + d.name + '** (`' + d.id + '`)')
    ;(d.steps || []).forEach((st) => {
      L.push(
        '  - [' + (project.doneSteps[st.id] ? 'x' : ' ') + '] `' + st.id + '` ' + st.text
      )
    })
  })
  L.push('')

  const ic = project.scope.in || []
  const dis = project.scope.out || []
  if (ic.length > 0 || dis.length > 0) {
    L.push('## Kapsam')
    L.push('')
    L.push('Bu listeler kullanıcının kararıdır. Rapor bunları değiştiremez.')
    L.push('')
    if (ic.length > 0) {
      L.push('İçeride:')
      ic.forEach((x) => L.push('- ' + x.text))
      L.push('')
    }
    if (dis.length > 0) {
      L.push('Dışarıda (bu sürümde YAPILMAYACAK):')
      dis.forEach((x) => L.push('- ' + x.text))
      L.push('')
    }
  }

  if ((project.risks || []).length > 0) {
    L.push('## Riskler')
    L.push('')
    project.risks.forEach((r) => {
      L.push('- ' + (r.top ? '**(en riskli)** ' : '') + r.text)
    })
    L.push('')
  }

  L.push('## İçerik veri tabanı')
  L.push('')
  if (items.length === 0) {
    L.push('Henüz bileşen girilmedi.')
    L.push('')
  } else {
    types.forEach((t) => {
      const mine = items.filter((i) => i.typeId === t.id)
      if (mine.length === 0) return
      L.push('### ' + t.name + ' (`' + t.id + '`, ' + mine.length + ' tane)')
      mine.forEach((i) => {
        const alanlar = t.fields
          .map((f) => {
            let v = (i.fields || {})[f.key]
            if (v === undefined || String(v).trim() === '') return null
            if (f.type === 'ref') {
              const hedef = items.find((x) => x.id === v)
              v = hedef ? hedef.name : v
            }
            return f.label + ': ' + v
          })
          .filter(Boolean)
        L.push('- **' + i.name + '**' + (alanlar.length ? ' — ' + alanlar.join(', ') : ''))
      })
      L.push('')
    })
    const kontrol = contentChecks(project)
    if (kontrol.length > 0) {
      L.push('Veri tutarlılığı notları (hata değil, dikkat çekilen durumlar):')
      L.push('')
      kontrol.forEach((c) => L.push('- ' + c.title))
      L.push('')
    }
  }

  L.push('## Çalışma bitince panoya ne göndereceksin')
  L.push('')
  L.push('Aşağıdaki biçimde bir JSON dosyası yaz. Pano bunu okuyup farkı')
  L.push('gösterecek, kullanıcı onaylayınca uygulanacak.')
  L.push('')
  L.push('```json')
  L.push(ornekRapor(project))
  L.push('```')
  L.push('')
  L.push('### Kurallar')
  L.push('')
  L.push('- `tamamlananAdimlar` ve `tamamlananTeslimatlar` içine sadece')
  L.push('  yukarıdaki listelerde geçen kimlikleri yaz. Uydurma kimlik yazma.')
  L.push('- `oturumlar` içindeki dakika, gerçekten çalışılan süredir. Bilmiyorsan')
  L.push('  yazma: yanlış bir sayı, hiç sayı olmamasından kötüdür.')
  L.push('- **Kapı kontrollerine dokunamazsın.** Raporda kapıyla ilgili alan yok')
  L.push('  ve olsa da yok sayılır. Kapıyı kullanıcı kendi değerlendirir.')
  L.push('- **Kapsamı ve tahmin eksenlerini değiştiremezsin.** Yeni bir fikir')
  L.push('  varsa `gunlukNotlari` içine yaz, kullanıcı buzdolabına koyar.')
  L.push('- Fazın sert kurallarını ihlal eden iş yapma. Bu faz kod yazmayı')
  L.push('  yasaklıyorsa, rapor kod yazdığını söylememelidir.')
  L.push('')

  return L.join('\n')
}

function ornekRapor(project) {
  return JSON.stringify(
    {
      tur: RAPOR_TURU,
      surum: RAPOR_SURUMU,
      proje: project.name,
      olusturuldu: new Date().toISOString().slice(0, 10),
      oturumlar: [{ tarih: '2026-08-28', dakika: 90, not: 'Çekirdek döngü taslağı' }],
      tamamlananAdimlar: ['p-1'],
      tamamlananTeslimatlar: [],
      icerik: {
        eklenen: [{ tur: 'dusman', ad: 'Kor Yarasa', alanlar: { can: '40', kuvvet: '8' } }],
        guncellenen: [{ ad: 'Alev Muhafızı', alanlar: { can: '600' } }],
      },
      gunlukNotlari: ['Çatışma temposu hızlı geldi, denenecek.'],
      hatalar: [{ baslik: 'Ganimet iki kez düşüyor', onem: 'orta' }],
    },
    null,
    2
  )
}

// ---- Asistan -> pano: iş raporu ----

export function parseRapor(text) {
  const r = JSON.parse(text)
  if (!r || typeof r !== 'object') throw new Error('Dosya okunamadı.')
  if (r.tur !== RAPOR_TURU) {
    throw new Error('Bu bir iş raporu değil. Beklenen tür: ' + RAPOR_TURU)
  }
  return r
}

const dizi = (x) => (Array.isArray(x) ? x : [])

// Raporun ne değiştireceğini, uygulamadan önce hesaplar.
//
// Uygulanamayan her madde sebebiyle birlikte döner. Sessizce yok saymak,
// kullanıcının yapıldığını sandığı bir işin kaydedilmemesi demek olurdu.
export function raporFarki(project, rapor) {
  const phase = currentPhase(project)
  const deliverables = phaseDeliverables(project, phase.id)
  const bilinenAdimlar = new Set()
  const bilinenTeslimatlar = new Set()
  PHASES.forEach((p) => {
    ;(p.deliverables || []).forEach((d) => {
      bilinenTeslimatlar.add(d.id)
      ;(d.steps || []).forEach((s) => bilinenAdimlar.add(s.id))
    })
  })
  deliverables.forEach((d) => {
    bilinenTeslimatlar.add(d.id)
    ;(d.steps || []).forEach((s) => bilinenAdimlar.add(s.id))
  })

  const uygulanacak = { oturumlar: [], adimlar: [], teslimatlar: [], eklenen: [], guncellenen: [], notlar: [], hatalar: [] }
  const atlanan = []

  dizi(rapor.oturumlar).forEach((o) => {
    const dk = Number(o.dakika) || 0
    if (dk <= 0) {
      atlanan.push({ ne: 'Oturum', deger: o.not || '(notsuz)', sebep: 'Dakika yok veya sıfır.' })
      return
    }
    uygulanacak.oturumlar.push({ tarih: o.tarih || null, dakika: dk, not: o.not || '' })
  })

  dizi(rapor.tamamlananAdimlar).forEach((id) => {
    if (!bilinenAdimlar.has(id)) {
      atlanan.push({ ne: 'Adım', deger: id, sebep: 'Böyle bir adım yok.' })
    } else if (project.doneSteps[id]) {
      atlanan.push({ ne: 'Adım', deger: id, sebep: 'Zaten tamamlanmış.' })
    } else {
      uygulanacak.adimlar.push(id)
    }
  })

  dizi(rapor.tamamlananTeslimatlar).forEach((id) => {
    if (!bilinenTeslimatlar.has(id)) {
      atlanan.push({ ne: 'Teslimat', deger: id, sebep: 'Böyle bir teslimat yok.' })
    } else if (project.doneDeliverables[id]) {
      atlanan.push({ ne: 'Teslimat', deger: id, sebep: 'Zaten tamamlanmış.' })
    } else {
      uygulanacak.teslimatlar.push(id)
    }
  })

  const icerik = rapor.icerik || {}
  const mevcutAdlar = new Map(
    validItems(project).map((i) => [i.name.toLocaleLowerCase('tr').trim(), i])
  )
  dizi(icerik.eklenen).forEach((x) => {
    const tip = findContentType(project.profile.genreId, x.tur)
    if (!tip) {
      atlanan.push({ ne: 'İçerik', deger: x.ad || '?', sebep: 'Bilinmeyen tür: ' + x.tur })
      return
    }
    if (!x.ad || String(x.ad).trim() === '') {
      atlanan.push({ ne: 'İçerik', deger: '(adsız)', sebep: 'Ad yok.' })
      return
    }
    if (mevcutAdlar.has(String(x.ad).toLocaleLowerCase('tr').trim())) {
      atlanan.push({ ne: 'İçerik', deger: x.ad, sebep: 'Bu adda bir bileşen zaten var.' })
      return
    }
    uygulanacak.eklenen.push({ typeId: x.tur, name: String(x.ad), fields: x.alanlar || {} })
  })

  dizi(icerik.guncellenen).forEach((x) => {
    const hedef = mevcutAdlar.get(String(x.ad || '').toLocaleLowerCase('tr').trim())
    if (!hedef) {
      atlanan.push({ ne: 'İçerik güncelleme', deger: x.ad || '?', sebep: 'Bu adda bileşen yok.' })
      return
    }
    const tip = findContentType(project.profile.genreId, hedef.typeId)
    const gecerli = {}
    Object.keys(x.alanlar || {}).forEach((k) => {
      if (tip && tip.fields.some((f) => f.key === k)) gecerli[k] = x.alanlar[k]
      else atlanan.push({ ne: 'Alan', deger: x.ad + '.' + k, sebep: 'Bu türde böyle bir alan yok.' })
    })
    if (Object.keys(gecerli).length > 0) {
      uygulanacak.guncellenen.push({ id: hedef.id, name: hedef.name, fields: gecerli })
    }
  })

  dizi(rapor.gunlukNotlari).forEach((n) => {
    if (String(n || '').trim()) uygulanacak.notlar.push(String(n))
  })

  dizi(rapor.hatalar).forEach((h) => {
    const b = typeof h === 'string' ? h : h.baslik
    if (!b || !String(b).trim()) return
    uygulanacak.hatalar.push({ text: String(b), severity: (h && h.onem) || 'orta' })
  })

  // Raporda kapıya veya kapsama dokunmaya çalışan alan var mı?
  const yasakli = []
  ;['kapi', 'kapiKontrolleri', 'gateChecks', 'kapsam', 'scope', 'profil', 'profile'].forEach(
    (k) => {
      if (rapor[k] !== undefined) yasakli.push(k)
    }
  )

  const toplam =
    uygulanacak.oturumlar.length +
    uygulanacak.adimlar.length +
    uygulanacak.teslimatlar.length +
    uygulanacak.eklenen.length +
    uygulanacak.guncellenen.length +
    uygulanacak.notlar.length +
    uygulanacak.hatalar.length

  return { uygulanacak, atlanan, yasakli, toplam, dakika: uygulanacak.oturumlar.reduce((t, o) => t + o.dakika, 0) }
}
