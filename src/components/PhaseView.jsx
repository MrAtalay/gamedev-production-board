import { useState } from 'react'
import Icon from './Icon.jsx'
import NumberField from './NumberField.jsx'
import { totalContentUnits } from '../lib/content.js'
import PostmortemSummary from './PostmortemSummary.jsx'
import { PHASES } from '../data/phases.js'
import {
  phaseDeliverables,
  isDeliverableDone,
  deliverableProgress,
  phaseProgress,
  isPhaseUnlocked,
} from '../lib/project.js'

// Bazı teslimatların içeriği başka ekranlarda tutulur (kapsam listesi,
// riskler, hata listesi gibi). Burada onlara bağlantı gösteriyoruz,
// aynı veriyi iki yerde tutmamak için.
const MANAGED_ELSEWHERE = {
  scope: { view: 'kapsam', label: 'Kapsam ekranını aç' },
  risks: { view: 'riskler', label: 'Risk kaydını aç' },
  playtests: { view: 'riskler', label: 'Oynanabilirlik testlerini aç' },
  bugs: { view: 'riskler', label: 'Hata listesini aç' },
  contentUnits: { view: 'pano', label: 'Üretim panosunu aç' },
}

function DeliverableCard({ project, deliverable, actions, goTo }) {
  const done = isDeliverableDone(project, deliverable)
  const progress = deliverableProgress(project, deliverable)
  const [open, setOpen] = useState(!done)

  const managed = deliverable.field ? MANAGED_ELSEWHERE[deliverable.field] : null
  const isUnitField = deliverable.field === 'unitHours'
  // İçerik ekranındaki sayım. Birim sayısını tahmin etmek yerine
  // sayabiliyorsa, kullanıcıya bunu hatırlatıyoruz.
  const contentUnitCount = totalContentUnits(project)
  const isTextField = deliverable.field && !managed && !isUnitField

  return (
    <div className="card">
      <div className="card-head" style={{ marginBottom: open ? 14 : 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ alignItems: 'flex-start' }}>
            <Icon
              name={done ? 'check' : 'chevronRight'}
              size={17}
              className={done ? 'gate-mark ok' : 'muted'}
            />
            <span style={{ color: done ? 'var(--text-muted)' : undefined }}>
              {deliverable.name}
            </span>
          </h2>
          <div className="tiny muted" style={{ marginTop: 4, marginLeft: 26 }}>
            {progress.done} / {progress.total} adım
            {deliverable.minutes > 0 && ', yaklaşık ' + deliverable.minutes + ' dakika'}
            {deliverable.fromGenre && ', ' + deliverable.fromGenre + ' türüne özel'}
          </div>
        </div>
        <button className="icon-btn" onClick={() => setOpen((o) => !o)}>
          <Icon name={open ? 'chevronLeft' : 'chevronRight'} size={17} />
        </button>
      </div>

      {open && (
        <>
          <div className="hint-box">
            <strong>Neden:</strong> {deliverable.why}
          </div>
          <div className="done-when">
            <strong>Bitti sayılır:</strong> {deliverable.doneWhen}
          </div>

          {deliverable.steps && deliverable.steps.length > 0 && (
            <ul className="item-list" style={{ marginTop: 14 }}>
              {deliverable.steps.map((step) => {
                const stepDone = Boolean(project.doneSteps[step.id])
                return (
                  <li key={step.id} className="item">
                    <input
                      type="checkbox"
                      className="check"
                      checked={stepDone}
                      onChange={() => actions.toggleStep(step.id)}
                    />
                    <div className="item-body">
                      <div className={'item-title' + (stepDone ? ' done' : '')}>
                        {step.text}
                      </div>
                      {step.minutes > 0 && (
                        <div className="item-sub">yaklaşık {step.minutes} dakika</div>
                      )}
                      {step.hint && !stepDone && (
                        <div className="item-sub" style={{ marginTop: 5 }}>
                          {step.hint}
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {managed && (
            <button
              className="btn btn-sm"
              style={{ marginTop: 14 }}
              onClick={() => goTo(managed.view)}
            >
              <Icon name="chevronRight" size={15} />
              {managed.label}
            </button>
          )}

          {isUnitField && (
            <div className="field-row" style={{ marginTop: 14 }}>
              <div className="field">
                <label>Bir birim kaç saat sürdü?</label>
                <div className="help">Dikey dilimde ölçtüğün gerçek süre.</div>
                <NumberField
                  min="0"
                  step="0.5"
                  value={project.fields.unitHours}
                  onChange={(v) => actions.setField('unitHours', v)}
                />
              </div>
              <div className="field">
                <label>Toplam kaç birim üreteceksin?</label>
                <div className="help">Bölüm, sahne, oda, bulmaca.</div>
                <NumberField
                  min="0"
                  value={project.fields.plannedUnits}
                  onChange={(v) => actions.setField('plannedUnits', v)}
                />
              </div>
            </div>
          )}

          {isUnitField && contentUnitCount > 0 && (
            <div className="hint-box" style={{ marginTop: 12 }}>
              İçerik ekranında <strong>{contentUnitCount} bileşen</strong> girilmiş.
              Bu sayı tahmin değil, sayım.{' '}
              {String(project.fields.plannedUnits) === String(contentUnitCount) ? (
                'Yukarıdaki alan bu sayıyla aynı.'
              ) : (
                <button
                  className="btn btn-sm"
                  style={{ marginLeft: 6 }}
                  onClick={() => actions.setField('plannedUnits', String(contentUnitCount))}
                >
                  {contentUnitCount} olarak yaz
                </button>
              )}
            </div>
          )}

          {isTextField && (
            <div className="field" style={{ marginTop: 14, marginBottom: 0 }}>
              <label>Yazdıklarını buraya kaydet</label>
              <textarea
                value={project.fields[deliverable.field] || ''}
                onChange={(e) => actions.setField(deliverable.field, e.target.value)}
                placeholder="Buraya yaz. Kaydetmen gerekmiyor, yazdıkça saklanıyor."
              />
            </div>
          )}

          {deliverable.tracksBoard && (
            <p className="card-note" style={{ marginTop: 12 }}>
              Bu teslimat üretim panosunu takip eder. Panodaki tüm kartlar tamamlandı
              sütununa geçtiğinde bitmiş sayılır.
            </p>
          )}

          {(!deliverable.steps || deliverable.steps.length === 0) && (
            <button
              className="btn btn-sm btn-primary"
              style={{ marginTop: 14 }}
              onClick={() => actions.completeDeliverable(deliverable.id)}
            >
              <Icon name="check" size={15} />
              Bitirdim
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default function PhaseView({ project, phaseId, actions, goTo }) {
  const phase = PHASES.find((p) => p.id === phaseId) || PHASES[0]
  const unlocked = isPhaseUnlocked(project, phase.id)
  const deliverables = phaseDeliverables(project, phase.id)
  const progress = phaseProgress(project, phase.id)
  const passed = Boolean(project.gatePassed[phase.id])

  if (!unlocked) {
    return (
      <div>
        <div className="page-head">
          <h1>{phase.name}</h1>
        </div>
        <div className="card">
          <div className="row">
            <Icon name="lock" size={18} className="muted" />
            <p className="small">
              Bu faz henüz kilitli. Önceki fazın kapısını geçmen gerekiyor.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Faz {phase.no}</div>
        <h1>
          {phase.name}
          {phase.subtitle && <span className="muted"> / {phase.subtitle}</span>}
        </h1>
        <p className="sub">{phase.goal}</p>
      </div>

      <div className="card card-tight">
        <p className="small" style={{ marginBottom: 12 }}>
          {phase.why}
        </p>
        <div className="bar-track">
          <div
            className={'bar-fill' + (passed ? ' good' : '')}
            style={{ width: progress.percent + '%' }}
          />
        </div>
        <div className="tiny muted" style={{ marginTop: 6 }}>
          {progress.deliverablesDone} / {progress.deliverablesTotal} teslimat bitti
          {passed && ', kapı geçildi'}
        </div>
      </div>

      {phase.hardRules && phase.hardRules.length > 0 && (
        <div className="rules">
          <div className="rules-title">
            <Icon name="lock" size={15} />
            Bu fazın sert kuralları
          </div>
          <ul>
            {phase.hardRules.map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ul>
        </div>
      )}

      {phase.id === 'postmortem' && <PostmortemSummary project={project} />}

      {deliverables.map((deliverable) => (
        <DeliverableCard
          key={deliverable.id}
          project={project}
          deliverable={deliverable}
          actions={actions}
          goTo={goTo}
        />
      ))}

      {phase.gate && (
        <div className="card">
          <div className="card-head">
            <h2>
              <Icon name="flag" size={17} />
              {phase.gate.title}
            </h2>
          </div>
          <p className="small" style={{ marginBottom: 14 }}>
            {phase.gate.intro}
          </p>
          <button className="btn btn-primary" onClick={() => goTo('kapi')}>
            Kapıyı görüntüle
            <Icon name="chevronRight" size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
