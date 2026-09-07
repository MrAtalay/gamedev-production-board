// Kapı kontrolleri.
//
// İki tür kontrol var:
//   auto -> sistem hesaplar. Kullanıcı bunları işaretleyemez, sistem karar verir.
//   self -> kullanıcı dürüstçe kendisi cevaplar.
//
// Otomatik kontrollerin varlık sebebi şu: bir sistem her şeyi doğrulayamaz,
// ama doğrulayabildiğini doğrulamalıdır. "Kapsam bütçeye sığıyor mu" sorusunu
// kullanıcının iyimserliğine bırakmak, sistemi işe yaramaz hale getirir.

import { phaseDeliverables, isDeliverableDone, boardStats } from './project.js'
import { computeEstimate, unitMath, teamEffect } from './estimate.js'
import { UNOWNED_WORK_LIMIT } from '../data/options.js'

const VERIFIERS = {
  deliverablesDone(project, phase) {
    const deliverables = phaseDeliverables(project, phase.id)
    const missing = deliverables.filter((d) => !isDeliverableDone(project, d))
    return {
      ok: missing.length === 0,
      text: 'Bu fazın tüm teslimatları tamamlandı.',
      detail:
        missing.length === 0
          ? deliverables.length + ' teslimatın hepsi bitti.'
          : 'Eksik: ' + missing.map((d) => d.name).join(', '),
    }
  },

  scopeFits(project) {
    const estimate = computeEstimate(project.profile)
    const ok = estimate.verdict.id === 'rahat' || estimate.verdict.id === 'sinirda'
    return {
      ok,
      text: 'Kapsam, kalan süreye sığıyor.',
      detail: ok
        ? 'Gereken ' +
          estimate.required +
          ' saat, elindeki ' +
          estimate.available.hours +
          ' saate sığıyor.'
        : 'Gereken ' +
          estimate.required +
          ' saat, elindeki ' +
          estimate.available.hours +
          ' saati ' +
          estimate.gapHours +
          ' saat aşıyor. Kapsam veya takvim değişmeden bu kapı açılmaz.',
    }
  },

  outListMin5(project) {
    const count = project.scope.out.length
    return {
      ok: count >= 5,
      text: 'Kapsam dışı listesinde en az 5 madde var.',
      detail:
        count >= 5
          ? count + ' madde dışarıda bırakılmış.'
          : 'Şu an ' +
            count +
            ' madde var. Neyi yapmayacağını yazmadıysan hiçbir şey kapsam dışı değildir.',
    }
  },

  risksMin3(project) {
    const count = project.risks.length
    const hasTop = project.risks.some((r) => r.top)
    return {
      ok: count >= 3 && hasTop,
      text: 'En az 3 risk yazılı ve en riskli olan işaretli.',
      detail:
        count < 3
          ? 'Şu an ' + count + ' risk var, en az 3 gerekiyor.'
          : hasTop
            ? count + ' risk yazılı, en riskli işaretli.'
            : 'Riskler yazılı ama hiçbiri en riskli olarak işaretlenmemiş.',
    }
  },

  playtestMin2(project) {
    const count = project.playtests.length
    return {
      ok: count >= 2,
      text: 'En az 2 kişi oyunu denedi ve gözlem kaydedildi.',
      detail:
        count >= 2
          ? count + ' oynanabilirlik testi kayıtlı.'
          : 'Şu an ' + count + ' test kayıtlı. Kendi gözlemin sayılmaz.',
    }
  },

  playtestMin3(project) {
    const count = project.playtests.length
    return {
      ok: count >= 3,
      text: 'En az 3 kişi oyunu baştan sona denedi.',
      detail:
        count >= 3
          ? count + ' oynanabilirlik testi kayıtlı.'
          : 'Şu an ' + count + ' test kayıtlı, en az 3 gerekiyor.',
    }
  },

  noCrashBugs(project) {
    const open = project.bugs.filter((b) => !b.done && b.severity === 'cokme')
    return {
      ok: open.length === 0,
      text: 'Açık çökme hatası yok.',
      detail:
        open.length === 0
          ? 'Çökme hatası listesi temiz.'
          : open.length + ' açık çökme hatası var. Çökme varken yayına gidilmez.',
    }
  },

  unitMathOk(project) {
    const math = unitMath(project)
    if (!math) {
      return {
        ok: false,
        text: 'Birim üretim süresi ölçüldü ve kalan içerik bütçeye sığıyor.',
        detail:
          'Birim süresi veya planlanan birim sayısı girilmemiş. ' +
          'Dikey dilimde ölçtüğün gerçek süreyi girmeden bu kapı açılmaz.',
      }
    }
    return {
      ok: math.fits,
      text: 'Birim üretim süresi ölçüldü ve kalan içerik bütçeye sığıyor.',
      detail: math.fits
        ? math.totalUnits +
          ' birim x ' +
          math.unitHours +
          ' saat = ' +
          math.needed +
          ' saat, üretim bütçesi ' +
          math.productionBudget +
          ' saat.'
        : math.totalUnits +
          ' birim x ' +
          math.unitHours +
          ' saat = ' +
          math.needed +
          ' saat. Üretim bütçesi ' +
          math.productionBudget +
          ' saat, yani ' +
          math.overBy +
          ' saat aşıyorsun. Bu tempoyla en fazla ' +
          math.suggestedUnits +
          ' birim üretebilirsin.',
    }
  },

  // Üretime girerken sorulan soru: bu işi kim yapacak.
  //
  // Pano bunu kendi verisinden hesaplayabiliyor, o yüzden kullanıcının
  // iyimserliğine bırakılmıyor. Ton kuralı gereği suçlamıyor ve emir
  // vermiyor: durumu ve sayıyı söylüyor, kararı kullanıcıya bırakıyor.
  disciplinesOwned(project) {
    const effect = teamEffect(project.profile)
    const percent = Math.round(effect.unownedShare * 100)
    const limitPercent = Math.round(UNOWNED_WORK_LIMIT * 100)
    const text =
      'Üretimin sahipsiz kalan bölümü işin yüzde ' + limitPercent + "'ini aşmıyor."

    if (effect.unownedNames.length === 0) {
      return { ok: true, text, detail: 'Sahipsiz işaretlenmiş işkolu yok.' }
    }

    const liste = effect.unownedNames.join(', ')
    if (effect.unownedShare <= UNOWNED_WORK_LIMIT) {
      return {
        ok: true,
        text,
        detail:
          'Sahipsiz: ' +
          liste +
          '. İşin yüzde ' +
          percent +
          "'i ediyor, sınırın altında. Kayıtlı, üretime engel değil.",
      }
    }

    return {
      ok: false,
      text,
      detail:
        'Sahipsiz: ' +
        liste +
        '. İşin yüzde ' +
        percent +
        "'i ediyor ve bu iş kimse yapmadan bitmez. İki yol var, ikisi de " +
        'meşru: bu işkoluna bir sahip bul, veya kapsamı o işkolunu ' +
        'küçültecek şekilde değiştir (sanat için: sanat yaklaşımını sadeleştir).',
    }
  },

  boardComplete(project) {
    const stats = boardStats(project)
    return {
      ok: stats.total > 0 && stats.done === stats.total,
      text: 'Üretim panosundaki tüm içerik birimleri tamamlandı.',
      detail:
        stats.total === 0
          ? 'Üretim panosunda hiç birim yok. Önce içerik listesini panoya gir.'
          : stats.done + ' / ' + stats.total + ' birim tamamlandı.',
    }
  },
}

export function runAutoCheck(project, phase, check) {
  const verifier = VERIFIERS[check.verify]
  if (!verifier) {
    return { ok: false, text: check.verify, detail: 'Bilinmeyen kontrol.' }
  }
  return verifier(project, phase)
}

// Kapının açılıp açılmadığı: otomatik kontrollerin hepsi geçmeli ve
// kullanıcı kendi beyan ettiği maddelerin hepsini işaretlemeli.
export function gateStatus(project, phase) {
  if (!phase.gate) return { open: true, autoChecks: [], selfChecks: [] }

  const autoChecks = phase.gate.checks
    .filter((c) => c.type === 'auto')
    .map((c) => ({ ...c, result: runAutoCheck(project, phase, c) }))

  const selfChecks = phase.gate.checks
    .filter((c) => c.type === 'self')
    .map((c) => ({ ...c, checked: Boolean(project.gateChecks[c.id]) }))

  const autoOk = autoChecks.every((c) => c.result.ok)
  const selfOk = selfChecks.every((c) => c.checked)

  return {
    open: autoOk && selfOk,
    autoOk,
    selfOk,
    autoChecks,
    selfChecks,
  }
}
