// Proje modeli ve türetilmiş bilgiler.
//
// Proje tek bir düz nesnedir ve localStorage'a olduğu gibi yazılır.
// Karmaşık durum yönetimi kütüphanesi yok: okunabilir kalması önemli.

import { PHASES, phaseIndex } from '../data/phases.js'
import { findGenre } from '../data/genres.js'
import { PLATFORM_TARGETS, findOption } from '../data/options.js'
import { requiredHours } from './estimate.js'

export const PROJECT_VERSION = 1

export function todayStr() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return yyyy + '-' + mm + '-' + dd
}

export function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// Sihirbaz girdisinden profil nesnesi. createProject hem projeye koymak
// hem de ilk tahmini hesaplamak için aynı profili kullanır.
function buildProfile(input) {
  return {
    genreId: input.genreId,
    scaleId: input.scaleId,
    experienceId: input.experienceId,
    engineId: input.engineId,
    artId: input.artId,
    teamId: input.teamId,
    multiplayerId: input.multiplayerId || 'tek',
    platformId: input.platformId || 'pc',
    aiTools: input.aiTools || {},
    aiCosts: input.aiCosts || {},
    otherMonthlyCost: input.otherMonthlyCost || 0,
    oneTimeCost: input.oneTimeCost || 0,
    // Mağaza varsayılanı platformdan türetilir: mobil bir projede Steam'i
    // varsayılan yapmak, yanlış pay ve yanlış kayıt ücretiyle hesap
    // yapmak demekti.
    storeId:
      input.storeId ||
      findOption(PLATFORM_TARGETS, input.platformId || 'pc').stores[0],
    revenue: {},
    // Mağaza başına kayıt ücreti ve ne zaman kontrol edildiği.
    // Tek alan olduğunda mağaza değişince yanlış tutar taşınıyordu.
    storeFees: {},
    storeFeeCheckedAt: {},
    engineName: input.engineName || '',
    // Sürdürülebilir günlük tavan bu cevaptan türetiliyor. Eski
    // kayıtlarda yok, estimate.js varsayılana düşüyor.
    commitmentId: input.commitmentId || 'yan',
    dailyMinutes: input.dailyMinutes,
    daysPerWeek: input.daysPerWeek,
    deadline: input.deadline,
  }
}

export function createProject(input) {
  const profile = buildProfile(input)
  return {
    version: PROJECT_VERSION,
    id: newId(),
    createdAt: new Date().toISOString(),
    // İlk tahminin anlık görüntüsü.
    //
    // Profil sonradan değişir: kaldıraç kapsamı küçültür, tarih ertelenir,
    // asistan eklenir. O yüzden post-mortemde "ilk tahmin buydu" demek
    // ancak burada saklanırsa doğru olur. Eski projelerde bu alan yok ve
    // arayüz bunu gizlemek yerine söyler.
    baseline: {
      requiredHours: requiredHours(profile),
      at: new Date().toISOString(),
    },
    name: input.name,
    status: 'aktif',
    profile,
    currentPhaseId: 'konsept',
    doneSteps: {},
    doneDeliverables: {},
    gatePassed: {},
    gateChecks: {},
    fields: {
      pitch: input.pitch || '',
      references: '',
      audience: '',
      definitionOfDone: '',
      onePager: '',
      pillars: '',
      coreLoop: '',
      verb: '',
      artDirection: '',
      unitHours: '',
      plannedUnits: '',
      postmortem: '',
    },
    // İçerik veri tabanı. Kabaca isimle başlar, zamanla alanlar dolar.
    // Asıl değeri: plannedUnits'i tahmin olmaktan çıkarıp sayım yapmak.
    content: { items: [] },
    scope: { in: [], out: [] },
    icebox: [],
    risks: [],
    decisions: [],
    playtests: [],
    bugs: [],
    sessions: [],
    board: [
      { id: 'yapilacak', title: 'Yapılacak', cards: [] },
      { id: 'devam', title: 'Devam Ediyor', cards: [] },
      { id: 'bitti', title: 'Tamamlandı', cards: [] },
    ],
  }
}

// Bir fazın teslimatları: ortak teslimatlar + türe özel eklemeler.
export function phaseDeliverables(project, phaseId) {
  const phase = PHASES.find((p) => p.id === phaseId)
  if (!phase) return []
  const genre = findGenre(project.profile.genreId)
  const extras = (genre.extraDeliverables && genre.extraDeliverables[phaseId]) || []
  return [...phase.deliverables, ...extras.map((d) => ({ ...d, fromGenre: genre.name }))]
}

export function isDeliverableDone(project, deliverable) {
  if (project.doneDeliverables[deliverable.id]) return true
  if (!deliverable.steps || deliverable.steps.length === 0) return false
  return deliverable.steps.every((step) => project.doneSteps[step.id])
}

export function deliverableProgress(project, deliverable) {
  const steps = deliverable.steps || []
  if (steps.length === 0) {
    return { done: project.doneDeliverables[deliverable.id] ? 1 : 0, total: 1 }
  }
  const done = steps.filter((s) => project.doneSteps[s.id]).length
  return { done, total: steps.length }
}

export function phaseProgress(project, phaseId) {
  const deliverables = phaseDeliverables(project, phaseId)
  let done = 0
  let total = 0
  deliverables.forEach((d) => {
    const p = deliverableProgress(project, d)
    done += p.done
    total += p.total
  })
  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    deliverablesDone: deliverables.filter((d) => isDeliverableDone(project, d)).length,
    deliverablesTotal: deliverables.length,
  }
}

export function isPhaseUnlocked(project, phaseId) {
  const index = phaseIndex(phaseId)
  if (index === 0) return true
  const previous = PHASES[index - 1]
  return Boolean(project.gatePassed[previous.id])
}

export function currentPhase(project) {
  return PHASES.find((p) => p.id === project.currentPhaseId) || PHASES[0]
}

// Bugünün tek işi. Sistemin "ne yapacağımı bilmiyorum" sorusunu
// ortadan kaldıran parçası: her zaman tek bir sonraki adım gösterilir.
export function nextTask(project) {
  const phase = currentPhase(project)
  const deliverables = phaseDeliverables(project, phase.id)

  for (const deliverable of deliverables) {
    if (isDeliverableDone(project, deliverable)) continue
    const steps = deliverable.steps || []
    const step = steps.find((s) => !project.doneSteps[s.id])
    if (step) {
      return { type: 'step', phase, deliverable, step }
    }
    return { type: 'deliverable', phase, deliverable, step: null }
  }

  if (phase.gate) {
    return { type: 'gate', phase, deliverable: null, step: null }
  }
  return { type: 'done', phase, deliverable: null, step: null }
}

export function totalLoggedMinutes(project) {
  return project.sessions.reduce((sum, s) => sum + (Number(s.minutes) || 0), 0)
}

export function minutesOnDate(project, dateStr) {
  return project.sessions
    .filter((s) => s.date === dateStr)
    .reduce((sum, s) => sum + (Number(s.minutes) || 0), 0)
}

// Seri sayacı. Kırıldığında sıfırı yüzüne vurmuyoruz: bu bir ceza aracı
// değil, momentum göstergesi. Kırılmışsa arayüz "yeniden başla" der.
export function streakInfo(project) {
  const days = new Set(project.sessions.map((s) => s.date))
  if (days.size === 0) return { current: 0, lastDate: null, brokenDays: 0 }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let cursor = new Date(today)
  if (!days.has(isoOf(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(isoOf(cursor))) {
      const sorted = [...days].sort()
      const last = sorted[sorted.length - 1]
      const lastDate = new Date(last + 'T00:00:00')
      const gap = Math.round((today - lastDate) / (24 * 60 * 60 * 1000))
      return { current: 0, lastDate: last, brokenDays: gap }
    }
  }

  let count = 0
  while (days.has(isoOf(cursor))) {
    count += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return { current: count, lastDate: isoOf(new Date(today)), brokenDays: 0 }
}

function isoOf(date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return yyyy + '-' + mm + '-' + dd
}

export function boardStats(project) {
  const columns = project.board || []
  const total = columns.reduce((sum, c) => sum + c.cards.length, 0)
  const doneColumn = columns.find((c) => c.id === 'bitti')
  const done = doneColumn ? doneColumn.cards.length : 0
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) }
}

export function overallProgress(project) {
  let weighted = 0
  PHASES.forEach((phase) => {
    if (phase.sharePercent === 0) return
    const passed = Boolean(project.gatePassed[phase.id])
    if (passed) {
      weighted += phase.sharePercent
      return
    }
    if (phase.id === project.currentPhaseId) {
      const p = phaseProgress(project, phase.id)
      weighted += (phase.sharePercent * p.percent) / 100
    }
  })
  return Math.round(weighted)
}
