import { useEffect, useState } from 'react'
import Icon from './components/Icon.jsx'
import Wizard from './components/Wizard.jsx'
import TodayView from './components/TodayView.jsx'
import RoadmapView from './components/RoadmapView.jsx'
import PhaseView from './components/PhaseView.jsx'
import GateView from './components/GateView.jsx'
import ScopeView from './components/ScopeView.jsx'
import RisksView from './components/RisksView.jsx'
import BoardView from './components/BoardView.jsx'
import JournalView from './components/JournalView.jsx'
import FinanceView from './components/FinanceView.jsx'
import SettingsView from './components/SettingsView.jsx'

import { PHASES, phaseIndex } from './data/phases.js'
import {
  createProject,
  newId,
  todayStr,
  nextTask,
  phaseDeliverables,
  isDeliverableDone,
} from './lib/project.js'
import {
  loadStore,
  saveStore,
  loadTheme,
  saveTheme,
  exportStore,
  parseImport,
} from './lib/storage.js'

const NAV = [
  { id: 'bugun', label: 'Bugün', icon: 'target', group: 'Çalışma' },
  { id: 'yol', label: 'Yol Haritası', icon: 'map', group: 'Çalışma' },
  { id: 'faz', label: 'Bu Faz', icon: 'list', group: 'Çalışma' },
  { id: 'kapi', label: 'Kapı', icon: 'flag', group: 'Çalışma' },
  { id: 'kapsam', label: 'Kapsam', icon: 'scale', group: 'Kayıtlar' },
  { id: 'riskler', label: 'Riskler ve Testler', icon: 'alert', group: 'Kayıtlar' },
  { id: 'pano', label: 'Üretim Panosu', icon: 'clipboard', group: 'Kayıtlar' },
  { id: 'gunluk', label: 'Günlük', icon: 'clock', group: 'Kayıtlar' },
  { id: 'butce', label: 'Bütçe ve Geri Dönüş', icon: 'scale', group: 'Kayıtlar' },
  { id: 'ayarlar', label: 'Ayarlar', icon: 'settings', group: 'Kayıtlar' },
]

export default function App() {
  const [store, setStore] = useState(loadStore)
  const [theme, setTheme] = useState(loadTheme)
  const [view, setView] = useState('bugun')
  const [selectedPhaseId, setSelectedPhaseId] = useState(null)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    saveStore(store)
  }, [store])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    saveTheme(theme)
  }, [theme])

  const project = store.active

  function toast(message, tone = '') {
    const id = newId()
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3200)
  }

  // Aktif projeyi güncellemenin tek yolu. Tüm eylemler bunun üstünden geçer,
  // böylece kaydetme tek yerde kalır.
  function update(fn) {
    setStore((prev) => {
      if (!prev.active) return prev
      return { ...prev, active: fn(prev.active) }
    })
  }

  const actions = {
    toggleStep(stepId) {
      update((p) => ({
        ...p,
        doneSteps: { ...p.doneSteps, [stepId]: !p.doneSteps[stepId] },
      }))
    },

    completeStep(stepId) {
      update((p) => ({ ...p, doneSteps: { ...p.doneSteps, [stepId]: true } }))
      toast('Adım tamamlandı.', 'good')
    },

    completeDeliverable(id) {
      update((p) => ({
        ...p,
        doneDeliverables: { ...p.doneDeliverables, [id]: { at: new Date().toISOString() } },
      }))
      toast('Teslimat tamamlandı.', 'good')
    },

    setField(key, value) {
      update((p) => ({ ...p, fields: { ...p.fields, [key]: value } }))
    },

    toggleGateCheck(id) {
      update((p) => ({
        ...p,
        gateChecks: { ...p.gateChecks, [id]: !p.gateChecks[id] },
      }))
    },

    passGate(phaseId) {
      const index = phaseIndex(phaseId)
      const next = PHASES[index + 1]
      update((p) => ({
        ...p,
        gatePassed: {
          ...p.gatePassed,
          [phaseId]: { at: new Date().toISOString() },
        },
        currentPhaseId: next ? next.id : p.currentPhaseId,
      }))
      setSelectedPhaseId(null)
      setView('bugun')
      toast(next ? next.name + ' fazı açıldı.' : 'Son kapı geçildi.', 'good')
    },

    killProject(reason) {
      setStore((prev) => {
        if (!prev.active) return prev
        const stopped = {
          ...prev.active,
          status: 'durduruldu',
          killReason: reason,
          archivedAt: new Date().toISOString(),
        }
        return { active: null, archive: [stopped, ...prev.archive] }
      })
      setView('bugun')
      toast('Proje arşive alındı. Öğrendiklerin sende kaldı.')
    },

    logSession({ minutes, note, stepId }) {
      if (!minutes && !note) return
      update((p) => ({
        ...p,
        sessions: [
          ...p.sessions,
          { id: newId(), date: todayStr(), minutes: minutes || 0, note: note || '', stepId },
        ],
      }))
      if (minutes) toast(minutes + ' dakika kaydedildi.', 'good')
    },

    addIcebox(text) {
      update((p) => ({
        ...p,
        icebox: [{ id: newId(), text, at: todayStr() }, ...p.icebox],
      }))
      toast('Buzdolabına eklendi.')
    },

    removeIcebox(id) {
      update((p) => ({ ...p, icebox: p.icebox.filter((i) => i.id !== id) }))
    },

    addScope(list, text) {
      update((p) => ({
        ...p,
        scope: { ...p.scope, [list]: [...p.scope[list], { id: newId(), text }] },
      }))
    },

    removeScope(list, id) {
      update((p) => ({
        ...p,
        scope: { ...p.scope, [list]: p.scope[list].filter((i) => i.id !== id) },
      }))
    },

    addRisk({ text, worst }) {
      update((p) => ({
        ...p,
        risks: [...p.risks, { id: newId(), text, worst, top: p.risks.length === 0 }],
      }))
    },

    removeRisk(id) {
      update((p) => ({ ...p, risks: p.risks.filter((r) => r.id !== id) }))
    },

    setTopRisk(id) {
      update((p) => ({
        ...p,
        risks: p.risks.map((r) => ({ ...r, top: r.id === id })),
      }))
    },

    addDecision({ title, reason }) {
      update((p) => ({
        ...p,
        decisions: [{ id: newId(), title, reason, at: todayStr() }, ...p.decisions],
      }))
    },

    removeDecision(id) {
      update((p) => ({ ...p, decisions: p.decisions.filter((d) => d.id !== id) }))
    },

    addPlaytest({ who, notes }) {
      update((p) => ({
        ...p,
        playtests: [{ id: newId(), who, notes, at: todayStr() }, ...p.playtests],
      }))
      toast('Test kaydedildi.', 'good')
    },

    removePlaytest(id) {
      update((p) => ({ ...p, playtests: p.playtests.filter((t) => t.id !== id) }))
    },

    addBug({ text, severity }) {
      update((p) => ({
        ...p,
        bugs: [...p.bugs, { id: newId(), text, severity, done: false }],
      }))
    },

    toggleBug(id) {
      update((p) => ({
        ...p,
        bugs: p.bugs.map((b) => (b.id === id ? { ...b, done: !b.done } : b)),
      }))
    },

    removeBug(id) {
      update((p) => ({ ...p, bugs: p.bugs.filter((b) => b.id !== id) }))
    },

    addCard(columnId, text) {
      update((p) => ({
        ...p,
        board: p.board.map((c) =>
          c.id === columnId ? { ...c, cards: [...c.cards, { id: newId(), text }] } : c
        ),
      }))
    },

    deleteCard(columnId, cardId) {
      update((p) => ({
        ...p,
        board: p.board.map((c) =>
          c.id === columnId ? { ...c, cards: c.cards.filter((x) => x.id !== cardId) } : c
        ),
      }))
    },

    moveCard(fromId, toId, cardId) {
      if (fromId === toId) return
      update((p) => {
        const from = p.board.find((c) => c.id === fromId)
        if (!from) return p
        const card = from.cards.find((x) => x.id === cardId)
        if (!card) return p
        return {
          ...p,
          board: p.board.map((c) => {
            if (c.id === fromId) return { ...c, cards: c.cards.filter((x) => x.id !== cardId) }
            if (c.id === toId) return { ...c, cards: [...c.cards, card] }
            return c
          }),
        }
      })
    },

    setName(name) {
      update((p) => ({ ...p, name }))
    },

    setProfile(patch) {
      update((p) => ({ ...p, profile: { ...p.profile, ...patch } }))
    },

    exportData() {
      exportStore(store)
      toast('Dosya indirildi.', 'good')
    },

    importData(text) {
      try {
        const parsed = parseImport(text)
        setStore(parsed)
        toast('Veriler içe aktarıldı.', 'good')
      } catch {
        toast('Dosya okunamadı.', 'bad')
      }
    },

    archiveAndRestart() {
      setStore((prev) => {
        if (!prev.active) return prev
        const archived = {
          ...prev.active,
          status: 'arsiv',
          archivedAt: new Date().toISOString(),
        }
        return { active: null, archive: [archived, ...prev.archive] }
      })
      setView('bugun')
    },
  }

  function startProject(form) {
    setStore((prev) => ({ ...prev, active: createProject(form) }))
    setView('bugun')
    toast('Proje başladı. Konsept fazındasın.', 'good')
  }

  if (!project) {
    return (
      <>
        <Wizard onFinish={startProject} />
        <Toasts toasts={toasts} />
      </>
    )
  }

  const task = nextTask(project)
  const phaseForView = selectedPhaseId || project.currentPhaseId

  // Kenar çubuğundaki rozetler: kullanıcıya nerede eksik olduğunu gösterir.
  const currentDeliverables = phaseDeliverables(project, project.currentPhaseId)
  const remaining = currentDeliverables.filter((d) => !isDeliverableDone(project, d)).length
  const openCrash = project.bugs.filter((b) => !b.done && b.severity === 'cokme').length

  const badges = {
    faz: remaining > 0 ? remaining : null,
    kapi: task.type === 'gate' ? 'hazır' : null,
    riskler: openCrash > 0 ? openCrash : null,
    kapsam: project.scope.out.length < 5 ? '!' : null,
  }

  const groups = ['Çalışma', 'Kayıtlar']

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Icon name="gamepad" size={17} />
          </div>
          <div>
            <div className="brand-name">{project.name}</div>
            <div className="brand-sub">
              Faz {task.phase.no}: {task.phase.name}
            </div>
          </div>
        </div>

        <nav className="nav">
          {groups.map((group) => (
            <div key={group}>
              <div className="nav-label">{group}</div>
              {NAV.filter((n) => n.group === group).map((item) => (
                <button
                  key={item.id}
                  className={'nav-item' + (view === item.id ? ' active' : '')}
                  onClick={() => {
                    if (item.id === 'faz') setSelectedPhaseId(null)
                    setView(item.id)
                  }}
                >
                  <Icon name={item.icon} size={17} />
                  <span>{item.label}</span>
                  {badges[item.id] && (
                    <span className="badge-count">{badges[item.id]}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="theme-row">
            <Icon name="moon" size={15} />
            <span className="grow">Karanlık tema</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
              />
              <span className="switch-track" />
            </label>
          </div>
        </div>
      </aside>

      <main className="main">
        {view === 'bugun' && (
          <TodayView project={project} actions={actions} goTo={setView} />
        )}
        {view === 'yol' && (
          <RoadmapView
            project={project}
            goTo={setView}
            onSelectPhase={setSelectedPhaseId}
          />
        )}
        {view === 'faz' && (
          <PhaseView
            project={project}
            phaseId={phaseForView}
            actions={actions}
            goTo={setView}
          />
        )}
        {view === 'kapi' && (
          <GateView project={project} actions={actions} goTo={setView} />
        )}
        {view === 'kapsam' && <ScopeView project={project} actions={actions} />}
        {view === 'riskler' && <RisksView project={project} actions={actions} />}
        {view === 'pano' && <BoardView project={project} actions={actions} />}
        {view === 'gunluk' && <JournalView project={project} />}
        {view === 'butce' && <FinanceView project={project} actions={actions} />}
        {view === 'ayarlar' && (
          <SettingsView project={project} archive={store.archive} actions={actions} />
        )}
      </main>

      <Toasts toasts={toasts} />
    </div>
  )
}

function Toasts({ toasts }) {
  if (toasts.length === 0) return null
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={'toast ' + t.tone}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
