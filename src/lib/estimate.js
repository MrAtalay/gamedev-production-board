// Kapsam ve süre hesabı.
//
// Sistemin en sert parçası burası. Amaç motive etmek değil, gerçeği söylemek.
// Bir proje verilen sürede bitmeyecekse, bunu altı ay sonra değil bugün
// söylemek gerekir.

import {
  SCALES,
  EXPERIENCE_LEVELS,
  ENGINE_FAMILIARITY,
  ART_APPROACHES,
  TEAM_SIZES,
  MULTIPLAYER_MODES,
  PLATFORM_TARGETS,
  AI_TOOLS,
  COMMITMENT_MODES,
  ART_TOOL_OVERLAP,
  DEFAULT_DISCIPLINE_SHARES,
  DISCIPLINES,
  DEFAULT_COMMITMENT_ID,
  REALISM_FACTOR,
  OVERTIME_REALISM_FACTOR,
  findOption,
} from '../data/options.js'
import { findGenre } from '../data/genres.js'
import { PHASES } from '../data/phases.js'

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

export function weeksUntil(dateStr) {
  if (!dateStr) return 0
  const target = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = target.getTime() - today.getTime()
  if (diff <= 0) return 0
  return diff / MS_PER_WEEK
}

// Yapay zeka asistanlarının toplam iş üstündeki etkisi.
//
// Kural: hızlanma sadece ilgili işkoluna uygulanır. Kod asistanı kodu
// hızlandırır, oyunun eğlenceli olup olmadığına karar vermeyi hızlandırmaz.
// "karar" işkolu (tasarım, test, denge, cila) hiçbir asistandan etkilenmez
// ve projelerin öldüğü yer tam olarak orasıdır.
export function aiEffect(profile) {
  const genre = findGenre(profile.genreId)
  const shares = genre.disciplineShares || DEFAULT_DISCIPLINE_SHARES
  const selected = profile.aiTools || {}

  const perDiscipline = {}
  let total = 0

  Object.keys(shares).forEach((discipline) => {
    const share = shares[discipline]
    const tool = AI_TOOLS.find((t) => t.discipline === discipline)
    let factor = 1

    if (tool && selected[tool.id]) {
      if (tool.speedupByExperience) {
        factor = tool.speedupByExperience[profile.experienceId] || 1
      } else {
        factor = tool.speedup
      }
      // Sanat yaklaşımı ile görsel araç aynı sorunu çözüyor: sanatı
      // kendin üretmemek. Üst üste çarpıldıklarında kazanç iki kez
      // sayılıyordu. Önceden bu kırpma sadece "minimal" seçiliyken
      // yapılıyordu; "hazır varlık" seçen biri kazancın tamamını
      // alıyordu, oysa orada da işin çoğu üretmek değil seçmek ve
      // tutarlı tutmak.
      if (discipline === 'sanat') {
        const overlap = ART_TOOL_OVERLAP[profile.artId]
        if (overlap !== undefined && overlap < 1) {
          factor = 1 - (1 - factor) * overlap
        }
      }
    }

    perDiscipline[discipline] = { share, factor }
    total += share * factor
  })

  return {
    shares,
    perDiscipline,
    // Toplam iş çarpanı: 1 ise hiç hızlanma yok.
    factor: total,
    savedPercent: Math.round((1 - total) * 100),
  }
}

// Ekip büyüklüğünün toplam iş üstündeki etkisi.
//
// Kural, yapay zeka asistanlarındakiyle aynı: bir çarpan sadece gerçekten
// dokunduğu işkoluna uygulanır. Ekip çarpanı bütün tahmine düz uygulandığı
// sürece pano, o işi yapacak kimse olmayan bir işkolunu da "üç kişiye
// bölündü" sayıp ucuzlatır. Bu bir eksik özellik değil, yanlış cevaptır:
// sahipsiz iş, ekip büyüdüğü için kısalmaz.
//
// Sahipsiz işaretlenen payların çarpanı 1 kalır, kalan paylar ekip
// çarpanını alır. Hiçbir işkolu sahipsiz değilse sonuç eski davranışın
// aynısıdır, çünkü payların toplamı 1'dir.
export function teamEffect(profile) {
  const genre = findGenre(profile.genreId)
  const shares = genre.disciplineShares || DEFAULT_DISCIPLINE_SHARES
  const team = findOption(TEAM_SIZES, profile.teamId)
  // Eski kayıtlarda bu alan yok: hepsi sahipli sayılır, sonuç değişmez.
  const unowned = profile.unownedDisciplines || {}

  const perDiscipline = {}
  let total = 0
  let unownedShare = 0

  Object.keys(shares).forEach((discipline) => {
    const share = shares[discipline]
    const isUnowned = Boolean(unowned[discipline])
    const factor = isUnowned ? 1 : team.multiplier

    if (isUnowned) unownedShare += share
    perDiscipline[discipline] = { share, factor, unowned: isUnowned }
    total += share * factor
  })

  return {
    shares,
    perDiscipline,
    // Ekip çarpanının yerine geçen sayı: 1 ise ekipten hiç kazanç yok.
    factor: total,
    teamMultiplier: team.multiplier,
    unownedShare,
    unownedNames: DISCIPLINES.filter((d) => unowned[d.id] && shares[d.id] > 0).map(
      (d) => d.name
    ),
  }
}

// Projenin gerektirdiği toplam saat.
export function requiredHours(profile) {
  const genre = findGenre(profile.genreId)
  const scale = findOption(SCALES, profile.scaleId)
  const experience = findOption(EXPERIENCE_LEVELS, profile.experienceId)
  const engine = findOption(ENGINE_FAMILIARITY, profile.engineId)
  const art = findOption(ART_APPROACHES, profile.artId)
  // Eski kayıtlarda bu alan yok, o yüzden varsayılan tek oyunculu.
  const multiplayer = findOption(MULTIPLAYER_MODES, profile.multiplayerId || 'tek')
  // Aynı şekilde eski kayıtlarda platform yok, varsayılan bilgisayar.
  const platform = findOption(PLATFORM_TARGETS, profile.platformId || 'pc')

  const total =
    genre.baseHours *
    scale.multiplier *
    experience.multiplier *
    engine.multiplier *
    art.multiplier *
    teamEffect(profile).factor *
    multiplayer.multiplier *
    platform.multiplier *
    aiEffect(profile).factor

  return Math.round(total)
}

// Yapay zeka asistanları olmasaydı gereken saat. Kazancı göstermek için.
export function requiredHoursWithoutAi(profile) {
  return requiredHours({ ...profile, aiTools: {} })
}

// Kullanıcının kendi durumuna göre sürdürülebilir günlük üst sınır.
// Eski kayıtlarda bu alan yok, o yüzden varsayılana düşülüyor.
export function commitmentCeiling(profile) {
  const mode = findOption(COMMITMENT_MODES, profile.commitmentId || DEFAULT_COMMITMENT_ID)
  return mode.sustainableDailyMinutes
}

// Elindeki gerçekçi saat. Planlanan sürenin tamamı çalışmaya dönüşmez,
// bu yüzden gerçeklik katsayısı uygulanır ve kullanıcıya açıkça gösterilir.
//
// Katsayı tek parça değil: sürdürülebilir sınırın altındaki saatler ile
// üstündeki saatler aynı değerde sayılmaz. Sabit bir katsayı, yüksek tempo
// girildiğinde elindeki saati olduğundan fazla gösteriyordu.
export function availableHours(profile) {
  const ceiling = commitmentCeiling(profile)
  const daily = Number(profile.dailyMinutes) || 0
  const days = Number(profile.daysPerWeek) || 0
  const withinLimit = Math.min(daily, ceiling)
  const overLimit = Math.max(0, daily - ceiling)

  const weeks = weeksUntil(profile.deadline)
  const weeklyRaw = (daily / 60) * days
  const weeklyWithin = (withinLimit / 60) * days
  const weeklyOver = (overLimit / 60) * days

  const effectiveWeekly =
    weeklyWithin * REALISM_FACTOR + weeklyOver * OVERTIME_REALISM_FACTOR

  return {
    weeklyHours: Math.round(weeklyRaw * 10) / 10,
    weeks: Math.round(weeks * 10) / 10,
    rawHours: Math.round(weeklyRaw * weeks),
    hours: Math.round(effectiveWeekly * weeks),
    ceiling,
    overDailyMinutes: overLimit,
    overWeeklyHours: Math.round(weeklyOver * 10) / 10,
    // Arayüzde gösterilen katsayı artık sabit değil, tempoya göre değişir.
    effectiveFactor:
      weeklyRaw > 0 ? effectiveWeekly / weeklyRaw : REALISM_FACTOR,
  }
}

// Haftada belli bir etkin saate ulaşmak için gereken günlük dakika.
//
// availableHours artık iki katsayılı olduğu için bunun tersi de iki
// parçalı: tavana kadar olan saatler REALISM_FACTOR ile, üstündekiler
// OVERTIME_REALISM_FACTOR ile sayılır. Düz bölme yapmak, tavanın
// üstündeki tempolarda gereken süreyi olduğundan az gösterirdi.
function dailyMinutesForWeeklyHours(profile, targetWeeklyHours) {
  const days = Number(profile.daysPerWeek) || 0
  if (days <= 0 || targetWeeklyHours <= 0) return 0

  const ceiling = commitmentCeiling(profile)
  const ceilingWeeklyHours = (ceiling / 60) * days
  const withinCapacity = ceilingWeeklyHours * REALISM_FACTOR

  if (targetWeeklyHours <= withinCapacity) {
    return Math.ceil((targetWeeklyHours / REALISM_FACTOR / days) * 60)
  }
  const overtimeWeeklyHours =
    (targetWeeklyHours - withinCapacity) / OVERTIME_REALISM_FACTOR
  return Math.ceil(ceiling + (overtimeWeeklyHours / days) * 60)
}

// Tempo gerçeklik kontrolü.
//
// Sistemin en kolay kandırılan yeri burasıydı: kapsam sığmayınca günlük
// süreyi büyütmek kararı yeşile çeviriyordu. Aritmetik doğruydu, plan
// değildi. Bu fonksiyon iki soruyu ayırıyor: tempo sürdürülebilir mi, ve
// sürdürülebilir bir tempoyla bu kapsam zaten sığıyor mu?
export function sustainableTempo(profile) {
  const ceiling = commitmentCeiling(profile)
  const daily = Number(profile.dailyMinutes) || 0
  const days = Number(profile.daysPerWeek) || 0
  const required = requiredHours(profile)

  // Tavanın altında kalarak yeterli olan en düşük tempoyu ara.
  // Oran tempoyla birlikte arttığı için ilk bulunan en düşüğüdür.
  let fitting = null
  let comfortable = null
  for (let minutes = 15; minutes <= ceiling; minutes += 15) {
    const hours = availableHours({ ...profile, dailyMinutes: minutes }).hours
    const ratio = required > 0 ? hours / required : 0
    if (fitting === null && ratio >= 0.95) fitting = minutes
    if (ratio >= 1.15) {
      comfortable = minutes
      break
    }
  }

  return {
    ceiling,
    daily,
    isOver: daily > ceiling,
    overBy: Math.max(0, daily - ceiling),
    weeklyHours: Math.round((daily / 60) * days * 10) / 10,
    // Tavanın altında kalarak "Rahat" veren en düşük günlük süre.
    comfortable,
    // Tavanın altında kalarak en azından "Sınırda" veren en düşük süre.
    fitting,
    // Tavana kadar hiçbir tempo yetmiyorsa sorun tempoda değil kapsamda.
    scopeNeedsChange: fitting === null,
  }
}

// Para hesabı.
//
// Saat kadar önemli bir eksen, çünkü abonelikler aylık işler: proje uzadıkça
// maliyet artar. Bu, sistemin başka hiçbir yerinde olmayan bir gerilim yaratır:
// tarihi ertelemek haftalık yükü azaltır ama toplam parayı artırır.
export function computeCost(profile) {
  const weeks = weeksUntil(profile.deadline)
  const months = weeks / 4.345
  const selected = profile.aiTools || {}
  const custom = profile.aiCosts || {}

  const lines = AI_TOOLS.filter((tool) => selected[tool.id]).map((tool) => {
    const monthly =
      custom[tool.id] === undefined || custom[tool.id] === ''
        ? tool.defaultMonthly
        : Number(custom[tool.id]) || 0
    return { id: tool.id, name: tool.name, monthly, total: Math.round(monthly * months) }
  })

  const otherMonthly = Number(profile.otherMonthlyCost) || 0
  const oneTime = Number(profile.oneTimeCost) || 0

  const monthlyTotal = lines.reduce((sum, l) => sum + l.monthly, 0) + otherMonthly
  const recurringTotal = Math.round(monthlyTotal * months)

  return {
    months: Math.round(months * 10) / 10,
    lines,
    otherMonthly,
    oneTime,
    monthlyTotal,
    recurringTotal,
    total: recurringTotal + oneTime,
    // Bir ay uzatmanın maliyeti. Tarih kaldıracının bedelini göstermek için.
    costPerExtraMonth: monthlyTotal,
  }
}

function verdictFor(ratio) {
  if (ratio >= 1.15) {
    return {
      id: 'rahat',
      label: 'Rahat',
      tone: 'good',
      message:
        'Kapsam süreye rahat sığıyor. Bu iyi bir yer: cila ve beklenmedik işler için payın var.',
    }
  }
  if (ratio >= 0.95) {
    return {
      id: 'sinirda',
      label: 'Sınırda',
      tone: 'warn',
      message:
        'Kapsam süreye ancak sığıyor. Aksama payın yok. Kapsamı bir miktar küçültmek ' +
        'seni rahatlatır, çünkü her projede beklenmedik işler çıkar.',
    }
  }
  if (ratio >= 0.6) {
    return {
      id: 'riskli',
      label: 'Riskli',
      tone: 'warn',
      message:
        'Kapsam süreye sığmıyor. Bu haliyle başlarsan büyük ihtimalle ya tarihi kaçırırsın ' +
        'ya da yarım bırakırsın. Aşağıdaki seçeneklerden en az birini uygula.',
    }
  }
  return {
    id: 'imkansiz',
    label: 'Bu haliyle bitmez',
    tone: 'bad',
    message:
      'Bu kapsam, bu sürede bitmez. Bu bir tahmin değil, aritmetik. ' +
      'Kapsamı küçültmeden başlarsan proje yarım kalır. Aşağıdaki seçenekleri incele.',
  }
}

// Makul planlama ufku. Bunun ötesine ertelemek "bir gün yaparım" demektir.
const MAX_HORIZON_WEEKS = 130

// Kapsamı bütçeye sığdırmak için somut seçenekler. Her biri hesaplanmış
// gerçek sayılarla gelir, "biraz küçült" gibi belirsiz tavsiye vermez.
//
// Önemli kural: sığmayan bir seçeneği sığıyormuş gibi göstermiyoruz.
// "Ölçeği bir kademe küçült" demek, o kademe de sığmıyorsa faydasızdır;
// bu yüzden gerçekten sığan kademeyi buluyoruz.
function buildLevers(profile, required, available) {
  const levers = []
  const scaleIndex = SCALES.findIndex((s) => s.id === profile.scaleId)

  // 1) Gerçekten sığan en büyük ölçek
  if (scaleIndex > 0) {
    let target = null
    for (let i = scaleIndex - 1; i >= 0; i--) {
      const hours = requiredHours({ ...profile, scaleId: SCALES[i].id })
      if (hours <= available) {
        target = { scale: SCALES[i], hours }
        break
      }
    }

    if (target) {
      levers.push({
        id: 'olcek',
        tone: 'good',
        title: 'Ölçeği küçült: ' + target.scale.name,
        detail:
          required +
          ' saatten ' +
          target.hours +
          ' saate iner ve bütçene sığar. ' +
          target.scale.summary,
        fits: true,
        patch: { scaleId: target.scale.id },
      })
    } else {
      const smallest = SCALES[0]
      const hours = requiredHours({ ...profile, scaleId: smallest.id })
      levers.push({
        id: 'olcek',
        tone: 'bad',
        title: 'Ölçeği en küçüğe indir: ' + smallest.name,
        detail:
          hours +
          ' saate iner ama bu bile elindeki ' +
          available +
          ' saate sığmıyor. Tek başına ölçek küçültmek bu projeyi kurtarmıyor, ' +
          'süreyi de artırman veya tarihi ertelemen gerekiyor.',
        fits: false,
        patch: { scaleId: smallest.id },
      })
    }
  }

  // 2) Sanat yaklaşımını sadeleştir
  if (profile.artId !== 'minimal') {
    const newRequired = requiredHours({ ...profile, artId: 'minimal' })
    const fits = newRequired <= available
    levers.push({
      id: 'sanat',
      tone: fits ? 'good' : 'warn',
      title: 'Sanat yaklaşımını sadeleştir: Minimal / geometrik',
      detail:
        newRequired +
        ' saate iner' +
        (fits ? ' ve bütçene sığar. ' : ', ama tek başına yetmiyor. ') +
        'Sanat, solo projelerde en çok şişen kalemdir; sade bir görsel dil ' +
        'hem hızlıdır hem tutarlıdır.',
      fits,
      patch: { artId: 'minimal' },
    })
  }

  // 3) Çok oyunculuyu bırak. Genellikle tek kalemde en büyük kazanç.
  if (profile.multiplayerId && profile.multiplayerId !== 'tek') {
    const newRequired = requiredHours({ ...profile, multiplayerId: 'tek' })
    const fits = newRequired <= available
    levers.push({
      id: 'coklu',
      tone: fits ? 'good' : 'warn',
      title: 'Çok oyunculuyu şimdilik bırak',
      detail:
        required +
        ' saatten ' +
        newRequired +
        ' saate iner' +
        (fits ? ' ve bütçene sığar. ' : ', tek başına yetmese de en büyük tek kazanç bu. ') +
        'Çok oyunculu, sonradan eklenen bir özellik değil, her sistemi baştan ' +
        'etkileyen bir karardır. Tek oyunculu sürümü bitirip yayınlamak, ' +
        'çok oyunculu bir projeyi yarım bırakmaktan iyidir.',
      fits,
      patch: { multiplayerId: 'tek' },
    })
  }

  // 3b) İki platform yerine tek platform. Çok oyunculu kaldıracıyla aynı
  // mantık: sonradan eklenen bir şey değil, baştan etkileyen bir karar.
  if (profile.platformId === 'ikisi') {
    const newRequired = requiredHours({ ...profile, platformId: 'pc' })
    const fits = newRequired <= available
    levers.push({
      id: 'platform',
      tone: fits ? 'good' : 'warn',
      title: 'Tek platformda çık: önce bilgisayar',
      detail:
        required +
        ' saatten ' +
        newRequired +
        ' saate iner' +
        (fits ? ' ve bütçene sığar. ' : ', tek başına yetmese de gerçek bir kazanç. ') +
        'İki platform, iki kontrol şeması ve iki mağaza süreci demektir. ' +
        'Bir platformda bitirip yayınlamak, ikisinde birden yarım kalmaktan iyidir. ' +
        'Diğer platform, ilk sürüm çıktıktan sonra gerçek veriyle planlanır.',
      fits,
      patch: { platformId: 'pc' },
    })
  }

  // 4) Ölçek ve sanatı birlikte küçült (ikisi tek başına yetmediyse)
  if (scaleIndex > 0 && profile.artId !== 'minimal') {
    const combined = { ...profile, scaleId: SCALES[scaleIndex - 1].id, artId: 'minimal' }
    const newRequired = requiredHours(combined)
    if (newRequired <= available) {
      levers.push({
        id: 'birlesik',
        tone: 'good',
        title:
          'İkisini birden: ' + SCALES[scaleIndex - 1].name + ' ölçek ve minimal sanat',
        detail: newRequired + ' saate iner ve bütçene sığar.',
        fits: true,
        patch: { scaleId: SCALES[scaleIndex - 1].id, artId: 'minimal' },
      })
    }
  }

  // 4) Günlük süreyi artır
  const weeks = weeksUntil(profile.deadline)
  if (weeks > 0) {
    const neededWeekly = required / weeks
    const neededDaily = dailyMinutesForWeeklyHours(profile, neededWeekly)
    if (neededDaily > profile.dailyMinutes) {
      // Sınır artık sabit değil, kullanıcının kendi beyanından geliyor.
      // Önceden 240 dakika sabitti ve kullanıcı 360 yazdığında sistem
      // bunu reddetmiyordu: aynı sayı, kim yazdığına göre farklı
      // muamele görüyordu.
      const realistic = neededDaily <= commitmentCeiling(profile)
      levers.push({
        id: 'sure',
        tone: realistic ? 'warn' : 'bad',
        title: 'Günlük süreyi artır: ' + neededDaily + ' dakika',
        detail: realistic
          ? 'Aynı kapsamı aynı tarihte bitirmek için haftada ' +
            profile.daysPerWeek +
            ' gün, günde ' +
            neededDaily +
            ' dakika gerekir (şu an ' +
            profile.dailyMinutes +
            ' dakika). Bunu aylarca sürdürebileceğinden eminsen seç.'
          : 'Aynı kapsamı aynı tarihte bitirmek günde ' +
            Math.round((neededDaily / 60) * 10) / 10 +
            ' saat gerektirir. Kendi durumun için sürdürülebilir tavan günde ' +
            Math.round((commitmentCeiling(profile) / 60) * 10) / 10 +
            ' saat olarak işaretli, bu onun üstünde. Bunu bir seçenek olarak ' +
            'sunmuyorum, sadece kapsamın ne kadar büyük olduğunu göstermek ' +
            'için yazıyorum.',
        fits: false,
        realistic,
        patch: realistic ? { dailyMinutes: neededDaily } : null,
      })
    }
  }

  // 5) Tarihi ertele
  //
  // Haftalık etkin saat, mevcut temponun kendi katsayısıyla alınır. Düz
  // REALISM_FACTOR kullanmak, tavanın üstünde çalışan biri için gereken
  // hafta sayısını olduğundan az gösteriyordu.
  const weekly = (profile.dailyMinutes / 60) * profile.daysPerWeek
  const effectiveWeekly = weekly * availableHours(profile).effectiveFactor
  if (effectiveWeekly > 0) {
    const neededWeeks = Math.ceil(required / effectiveWeekly)
    const newDate = new Date()
    newDate.setDate(newDate.getDate() + neededWeeks * 7)
    const iso = newDate.toISOString().slice(0, 10)
    const realistic = neededWeeks <= MAX_HORIZON_WEEKS

    // Tarihi ertelemek haftalık yükü azaltır ama aylık giderler sürdüğü için
    // toplam parayı artırır. Bu gerilimi gizlemiyoruz.
    const cost = computeCost(profile)
    const extraMonths = Math.max(0, neededWeeks / 4.345 - cost.months)
    const extraCost = Math.round(extraMonths * cost.costPerExtraMonth)
    const costNote =
      cost.costPerExtraMonth > 0 && extraCost > 0
        ? ' Ama aylık giderlerin sürdüğü için maliyet yaklaşık ' +
          extraCost +
          ' artar.'
        : ''

    levers.push({
      id: 'tarih',
      tone: realistic ? 'warn' : 'bad',
      title: 'Tarihi ertele: ' + formatDate(iso),
      detail: realistic
        ? 'Aynı kapsamı bu tempoyla bitirmek yaklaşık ' +
          neededWeeks +
          ' hafta sürer. Kapsamı korumak istiyorsan en dürüst seçenek budur.' +
          costNote
        : 'Aynı kapsamı bu tempoyla bitirmek yaklaşık ' +
          Math.round(neededWeeks / 52) +
          ' yıl sürer. Bu kadar uzun bir taahhüt, pratikte projeyi bırakmakla ' +
          'aynı şeydir. Kapsamı küçültmek daha iyi bir yol.' +
          costNote,
      fits: realistic,
      realistic,
      patch: realistic ? { deadline: iso } : null,
    })
  }

  // Uygulanabilir ve gerçekçi olanlar başa gelsin.
  const rank = { good: 0, warn: 1, bad: 2 }
  return levers.sort((a, b) => rank[a.tone] - rank[b.tone])
}

export function formatDate(iso) {
  if (!iso) return '-'
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ]
  const d = new Date(iso + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return iso
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear()
}

export function computeEstimate(profile) {
  const required = requiredHours(profile)
  const available = availableHours(profile)
  const ratio = required > 0 ? available.hours / required : 0
  const verdict = verdictFor(ratio)
  const cost = computeCost(profile)

  // Planlanan maliyet, hedef tarihe göre hesaplanır. Ama proje o tarihte
  // bitmeyecekse ödemeler devam eder. Gerçek maliyet, işin gerçekten
  // süreceği zamana göre olandır ve genellikle çok daha yüksektir.
  const effectiveWeekly =
    (profile.dailyMinutes / 60) * profile.daysPerWeek * available.effectiveFactor
  if (effectiveWeekly > 0 && cost.monthlyTotal > 0) {
    const realWeeks = required / effectiveWeekly
    const realMonths = realWeeks / 4.345
    cost.realisticMonths = Math.round(realMonths * 10) / 10
    cost.realisticTotal = Math.round(realMonths * cost.monthlyTotal) + cost.oneTime
    cost.exceedsPlan = cost.realisticTotal > cost.total
  }

  return {
    required,
    requiredWithoutAi: requiredHoursWithoutAi(profile),
    ai: aiEffect(profile),
    team: teamEffect(profile),
    cost,
    available,
    ratio,
    verdict,
    tempo: sustainableTempo(profile),
    realismFactor: REALISM_FACTOR,
    levers: buildLevers(profile, required, available.hours),
    gapHours: Math.max(0, required - available.hours),
  }
}

// Toplam saati fazlara dağıtır. Yüzdeler phases.js içinde tanımlı.
export function hoursByPhase(totalHours) {
  return PHASES.map((phase) => ({
    id: phase.id,
    name: phase.name,
    percent: phase.sharePercent,
    hours: Math.round((totalHours * phase.sharePercent) / 100),
  }))
}

// Dikey dilimde ölçülen birim süresi ile kalan içeriğin gerçek süresi.
// Kapı kontrolünde kullanılır: ölçülen gerçek, tahminden daha güvenilirdir.
export function unitMath(project) {
  const unitHours = Number(project.fields?.unitHours) || 0
  const totalUnits = Number(project.fields?.plannedUnits) || 0
  if (unitHours <= 0 || totalUnits <= 0) return null

  const estimate = computeEstimate(project.profile)
  const productionShare = PHASES.find((p) => p.id === 'uretim').sharePercent / 100
  const productionBudget = Math.round(estimate.required * productionShare)
  const needed = Math.round(unitHours * totalUnits)

  return {
    unitHours,
    totalUnits,
    needed,
    productionBudget,
    fits: needed <= productionBudget * 1.1,
    overBy: Math.max(0, needed - productionBudget),
    suggestedUnits: Math.floor(productionBudget / unitHours),
  }
}
