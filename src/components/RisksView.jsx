import { useState } from 'react'
import Icon from './Icon.jsx'
import { formatDate } from '../lib/estimate.js'

const SEVERITIES = [
  { id: 'cokme', name: 'Çökme', tone: 'bad' },
  { id: 'bozuk', name: 'Bozuk', tone: 'warn' },
  { id: 'rahatsiz', name: 'Rahatsız edici', tone: '' },
  { id: 'kozmetik', name: 'Kozmetik', tone: '' },
]

function RiskSection({ project, actions }) {
  const [text, setText] = useState('')
  const [worst, setWorst] = useState('')

  function add() {
    if (text.trim() === '') return
    actions.addRisk({ text: text.trim(), worst: worst.trim() })
    setText('')
    setWorst('')
  }

  return (
    <div className="card">
      <div className="card-head">
        <h2>
          <Icon name="alert" size={17} />
          Risk kaydı
        </h2>
        <span className={'chip ' + (project.risks.length >= 3 ? 'chip-good' : 'chip-warn')}>
          {project.risks.length} / en az 3
        </span>
      </div>
      <p className="card-note" style={{ marginBottom: 12 }}>
        Projeyi öldüren şey bildiğin zorluklar değil, test etmediğin varsayımlardır. En
        riskli olanı işaretle: prototipte önce onu test edeceksin.
      </p>

      {project.risks.length === 0 ? (
        <p className="empty">Henüz risk yazılmamış.</p>
      ) : (
        <ul className="item-list">
          {project.risks.map((risk) => (
            <li key={risk.id} className="item">
              <button
                className="icon-btn"
                title="En riskli olarak işaretle"
                onClick={() => actions.setTopRisk(risk.id)}
                style={{ color: risk.top ? 'var(--bad)' : undefined }}
              >
                <Icon name="flag" size={16} />
              </button>
              <div className="item-body">
                <div className="item-title">{risk.text}</div>
                {risk.worst && (
                  <div className="item-sub">Yanlışsa: {risk.worst}</div>
                )}
                {risk.top && (
                  <div className="item-sub" style={{ color: 'var(--bad)' }}>
                    En riskli varsayım
                  </div>
                )}
              </div>
              <button className="icon-btn danger" onClick={() => actions.removeRisk(risk.id)}>
                <Icon name="trash" size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="field-row" style={{ marginTop: 14 }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Emin olmadığın bir şey"
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <input
            value={worst}
            onChange={(e) => setWorst(e.target.value)}
            placeholder="Yanlışsa ne olur?"
          />
        </div>
        <button className="btn btn-sm" onClick={add}>
          <Icon name="plus" size={15} />
          Ekle
        </button>
      </div>
    </div>
  )
}

function DecisionSection({ project, actions }) {
  const [title, setTitle] = useState('')
  const [reason, setReason] = useState('')

  function add() {
    if (title.trim() === '') return
    actions.addDecision({ title: title.trim(), reason: reason.trim() })
    setTitle('')
    setReason('')
  }

  return (
    <div className="card">
      <div className="card-head">
        <h2>
          <Icon name="clipboard" size={17} />
          Karar günlüğü
        </h2>
        <span className="chip">{project.decisions.length} karar</span>
      </div>
      <p className="card-note" style={{ marginBottom: 12 }}>
        Verdiğin kararları sebebiyle birlikte yaz. İki ay sonra aynı kararı yeniden
        tartışmaya başladığında buraya bakarsın.
      </p>

      {project.decisions.length === 0 ? (
        <p className="empty">Henüz karar yazılmamış.</p>
      ) : (
        <ul className="item-list">
          {project.decisions.map((d) => (
            <li key={d.id} className="item alt">
              <div className="item-body">
                <div className="item-title">{d.title}</div>
                {d.reason && <div className="item-sub">Sebep: {d.reason}</div>}
                <div className="item-sub">{formatDate(d.at)}</div>
              </div>
              <button
                className="icon-btn danger"
                onClick={() => actions.removeDecision(d.id)}
              >
                <Icon name="trash" size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="field-row" style={{ marginTop: 14 }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ne karar verdin?"
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Neden?"
          />
        </div>
        <button className="btn btn-sm" onClick={add}>
          <Icon name="plus" size={15} />
          Ekle
        </button>
      </div>
    </div>
  )
}

function PlaytestSection({ project, actions }) {
  const [who, setWho] = useState('')
  const [notes, setNotes] = useState('')

  function add() {
    if (who.trim() === '') return
    actions.addPlaytest({ who: who.trim(), notes: notes.trim() })
    setWho('')
    setNotes('')
  }

  return (
    <div className="card">
      <div className="card-head">
        <h2>
          <Icon name="users" size={17} />
          Oynanabilirlik testleri
        </h2>
        <span className="chip">{project.playtests.length} test</span>
      </div>
      <p className="card-note" style={{ marginBottom: 12 }}>
        Sen oyunu bilerek oynuyorsun, bu yüzden kendi gözlemin sayılmaz. İzlerken
        konuşma: müdahale etmek zorunda kaldığın her an bir tasarım sorunudur.
      </p>

      {project.playtests.length === 0 ? (
        <p className="empty">Henüz test kaydı yok.</p>
      ) : (
        <ul className="item-list">
          {project.playtests.map((t) => (
            <li key={t.id} className="item alt">
              <div className="item-body">
                <div className="item-title">{t.who}</div>
                {t.notes && <div className="item-sub">{t.notes}</div>}
                <div className="item-sub">{formatDate(t.at)}</div>
              </div>
              <button
                className="icon-btn danger"
                onClick={() => actions.removePlaytest(t.id)}
              >
                <Icon name="trash" size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="field-row" style={{ marginTop: 14 }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <input
            value={who}
            onChange={(e) => setWho(e.target.value)}
            placeholder="Kim denedi?"
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Nerede takıldı, ne dedi?"
          />
        </div>
        <button className="btn btn-sm" onClick={add}>
          <Icon name="plus" size={15} />
          Ekle
        </button>
      </div>
    </div>
  )
}

function BugSection({ project, actions }) {
  const [text, setText] = useState('')
  const [severity, setSeverity] = useState('bozuk')

  function add() {
    if (text.trim() === '') return
    actions.addBug({ text: text.trim(), severity })
    setText('')
  }

  const open = project.bugs.filter((b) => !b.done)
  const openCrash = open.filter((b) => b.severity === 'cokme').length

  return (
    <div className="card">
      <div className="card-head">
        <h2>
          <Icon name="bug" size={17} />
          Hata listesi
        </h2>
        <span className={'chip ' + (openCrash > 0 ? 'chip-bad' : 'chip-good')}>
          {openCrash} açık çökme
        </span>
      </div>
      <p className="card-note" style={{ marginBottom: 12 }}>
        Çökme hataları en üstte durur ve hepsi kapanmadan yayın kapısı açılmaz.
      </p>

      {project.bugs.length === 0 ? (
        <p className="empty">Hata listesi boş.</p>
      ) : (
        <ul className="item-list">
          {[...project.bugs]
            .sort((a, b) => {
              const order = ['cokme', 'bozuk', 'rahatsiz', 'kozmetik']
              if (a.done !== b.done) return a.done ? 1 : -1
              return order.indexOf(a.severity) - order.indexOf(b.severity)
            })
            .map((bug) => {
              const sev = SEVERITIES.find((s) => s.id === bug.severity) || SEVERITIES[1]
              return (
                <li key={bug.id} className="item">
                  <input
                    type="checkbox"
                    className="check"
                    checked={bug.done}
                    onChange={() => actions.toggleBug(bug.id)}
                  />
                  <div className="item-body">
                    <div className={'item-title' + (bug.done ? ' done' : '')}>
                      {bug.text}
                    </div>
                  </div>
                  <span className={'chip ' + (sev.tone ? 'chip-' + sev.tone : '')}>
                    {sev.name}
                  </span>
                  <button
                    className="icon-btn danger"
                    onClick={() => actions.removeBug(bug.id)}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </li>
              )
            })}
        </ul>
      )}

      <div className="field-row" style={{ marginTop: 14 }}>
        <div className="field" style={{ marginBottom: 0, flex: 2 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Hata açıklaması"
          />
        </div>
        <div className="field" style={{ marginBottom: 0, maxWidth: 170 }}>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            {SEVERITIES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-sm" onClick={add}>
          <Icon name="plus" size={15} />
          Ekle
        </button>
      </div>
    </div>
  )
}

export default function RisksView({ project, actions }) {
  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Kayıtlar</div>
        <h1>Riskler, kararlar ve testler</h1>
        <p className="sub">
          Bu ekrandaki kayıtlar kapı kontrollerini besler. Boş bırakırsan kapılar
          açılmaz, çünkü sistem doğrulayacak bir şey bulamaz.
        </p>
      </div>

      <RiskSection project={project} actions={actions} />
      <PlaytestSection project={project} actions={actions} />
      <BugSection project={project} actions={actions} />
      <DecisionSection project={project} actions={actions} />
    </div>
  )
}
