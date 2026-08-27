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
  AI_TOOLS,
  DEFAULT_DISCIPLINE_SHARES,
  REALISM_FACTOR,
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
      // Zaten minimal bir görsel dil seçildiyse görsel aracın kazancı
      // sınırlıdır: kutu çizmek zaten hızlıdır.
      if (discipline === 'sanat' && profile.artId === 'minimal') {
        factor = factor + (1 - factor) * 0.5
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

// Projenin gerektirdiği toplam saat.
export function requiredHours(profile) {
  const genre = findGenre(profile.genreId)
  const scale = findOption(SCALES, profile.scaleId)
  const experience = findOption(EXPERIENCE_LEVELS, profile.experienceId)
  const engine = findOption(ENGINE_FAMILIARITY, profile.engineId)
  const art = findOption(ART_APPROACHES, profile.artId)
  const team = findOption(TEAM_SIZES, profile.teamId)
  // Eski kayıtlarda bu alan yok, o yüzden varsayılan tek oyunculu.
  const multiplayer = findOption(MULTIPLAYER_MODES, profile.multiplayerId || 'tek')

  const total =
    genre.baseHours *
    scale.multiplier *
    experience.multiplier *
    engine.multiplier *
    art.multiplier *
    team.multiplier *
    multiplayer.multiplier *
    aiEffect(profile).factor

  return Math.round(total)
}

// Yapay zeka asistanları olmasaydı gereken saat. Kazancı göstermek için.
export function requiredHoursWithoutAi(profile) {
  return requiredHours({ ...profile, aiTools: {} })
}

// Elindeki gerçekçi saat. Planlanan sürenin tamamı çalışmaya dönüşmez,
// bu yüzden gerçeklik katsayısı uygulanır ve kullanıcıya açıkça gösterilir.
export function availableHours(profile) {
  const weekly = (profile.dailyMinutes / 60) * profile.daysPerWeek
  const weeks = weeksUntil(profile.deadline)
  const raw = weekly * weeks
  return {
    weeklyHours: Math.round(weekly * 10) / 10,
    weeks: Math.round(weeks * 10) / 10,
    rawHours: Math.round(raw),
    hours: Math.round(raw * REALISM_FACTOR),
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

// Bir hobi projesinde sürdürülebilir günlük üst sınır. Bunun üstündeki
// öneriler matematiksel olarak doğru ama pratikte tükenmişlik demektir,
// o yüzden gerçekçi bir seçenek gibi sunulmazlar.
const MAX_REALISTIC_DAILY = 240
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
    const neededWeekly = required / REALISM_FACTOR / weeks
    const neededDaily = Math.ceil((neededWeekly / profile.daysPerWeek) * 60)
    if (neededDaily > profile.dailyMinutes) {
      const realistic = neededDaily <= MAX_REALISTIC_DAILY
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
            ' saat gerektirir. Bu, tam zamanlı bir iş temposudur ve hobi projesinde ' +
            'aylarca sürdürülemez. Bunu bir seçenek olarak sunmuyorum, sadece ' +
            'kapsamın ne kadar büyük olduğunu göstermek için yazıyorum.',
        fits: false,
        realistic,
        patch: realistic ? { dailyMinutes: neededDaily } : null,
      })
    }
  }

  // 5) Tarihi ertele
  const weekly = (profile.dailyMinutes / 60) * profile.daysPerWeek
  if (weekly > 0) {
    const neededWeeks = Math.ceil(required / REALISM_FACTOR / weekly)
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
  const weekly = (profile.dailyMinutes / 60) * profile.daysPerWeek
  if (weekly > 0 && cost.monthlyTotal > 0) {
    const realWeeks = required / (weekly * REALISM_FACTOR)
    const realMonths = realWeeks / 4.345
    cost.realisticMonths = Math.round(realMonths * 10) / 10
    cost.realisticTotal = Math.round(realMonths * cost.monthlyTotal) + cost.oneTime
    cost.exceedsPlan = cost.realisticTotal > cost.total
  }

  return {
    required,
    requiredWithoutAi: requiredHoursWithoutAi(profile),
    ai: aiEffect(profile),
    cost,
    available,
    ratio,
    verdict,
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
