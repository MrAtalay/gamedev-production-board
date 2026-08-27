import { useState } from 'react'
import Icon from './Icon.jsx'
import { PHASES, phaseIndex } from '../data/phases.js'
import { gateStatus } from '../lib/gates.js'

export default function GateView({ project, actions, goTo }) {
  const [showKill, setShowKill] = useState(false)
  const [killReason, setKillReason] = useState('')

  const phase = PHASES.find((p) => p.id === project.currentPhaseId) || PHASES[0]

  if (!phase.gate) {
    return (
      <div>
        <div className="page-head">
          <h1>Kapı yok</h1>
          <p className="sub">Bu faz son faz, geçilecek bir kapı yok.</p>
        </div>
      </div>
    )
  }

  const status = gateStatus(project, phase)
  const index = phaseIndex(phase.id)
  const nextPhase = PHASES[index + 1]
  const alreadyPassed = Boolean(project.gatePassed[phase.id])

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Faz {phase.no} kapısı</div>
        <h1>{phase.gate.title}</h1>
        <p className="sub">{phase.gate.intro}</p>
      </div>

      {alreadyPassed && (
        <div className="card card-tight">
          <div className="row">
            <Icon name="check" size={18} className="gate-mark ok" />
            <p className="small">
              Bu kapıyı zaten geçtin. Aşağıdaki kontroller kayıt olarak duruyor.
            </p>
          </div>
        </div>
      )}

      {status.autoChecks.length > 0 && (
        <>
          <div className="gate-tag">Sistemin doğruladığı</div>
          {status.autoChecks.map((check) => (
            <div
              key={check.id}
              className={'gate-check ' + (check.result.ok ? 'auto-ok' : 'auto-fail')}
            >
              <Icon
                name={check.result.ok ? 'check' : 'x'}
                size={18}
                className={'gate-mark ' + (check.result.ok ? 'ok' : 'fail')}
              />
              <div style={{ flex: 1 }}>
                <div className="gate-text">{check.result.text}</div>
                <div className="gate-detail">{check.result.detail}</div>
              </div>
            </div>
          ))}
          <p className="tiny muted" style={{ margin: '4px 0 22px' }}>
            Bu maddeleri sen işaretleyemezsin. Sistem verilerine bakarak karar verir.
            Bir sistemin her şeyi doğrulaması mümkün değil, ama doğrulayabildiğini
            doğrulaması gerekir.
          </p>
        </>
      )}

      {status.selfChecks.length > 0 && (
        <>
          <div className="gate-tag">Senin dürüstçe cevaplaman gereken</div>
          {status.selfChecks.map((check) => (
            <div key={check.id} className="gate-check">
              <input
                type="checkbox"
                className="check"
                checked={check.checked}
                disabled={alreadyPassed}
                onChange={() => actions.toggleGateCheck(check.id)}
              />
              <div style={{ flex: 1 }}>
                <div className="gate-text">{check.text}</div>
                {check.hint && <div className="gate-detail">{check.hint}</div>}
              </div>
            </div>
          ))}
          <p className="tiny muted" style={{ margin: '4px 0 22px' }}>
            Bunları kimse denetlemiyor. İşaretlemek kolay, ama kendini kandırmanın
            bedelini aylar sonra ödersin.
          </p>
        </>
      )}

      {!status.open && !alreadyPassed && (
        <div className="card">
          <div className="card-head">
            <h2>
              <Icon name="lock" size={17} />
              Kapı henüz açılmadı
            </h2>
          </div>
          <p className="small">{phase.gate.failAdvice}</p>
        </div>
      )}

      {!alreadyPassed && (
        <div className="btn-row" style={{ marginTop: 20 }}>
          <button
            className="btn btn-primary"
            disabled={!status.open}
            onClick={() => actions.passGate(phase.id)}
          >
            <Icon name="flag" size={16} />
            {nextPhase ? nextPhase.name + ' fazına geç' : 'Kapıyı geç'}
          </button>
          <button className="btn btn-ghost" onClick={() => goTo('faz')}>
            Faza dön
          </button>
        </div>
      )}

      {phase.gate.allowsKill && !alreadyPassed && (
        <div className="card" style={{ marginTop: 26 }}>
          <div className="card-head">
            <h2>
              <Icon name="alert" size={17} />
              Devam etmemek de bir seçenek
            </h2>
          </div>
          <p className="small" style={{ marginBottom: 14 }}>
            Stüdyolar projeleri tam bu noktada iptal eder ve bu bir başarısızlık sayılmaz.
            Eğlenceli olmayan bir çekirdeğin üstüne aylarca içerik üretmek, yapabileceğin
            en pahalı hatadır. Buraya kadar öğrendiklerin senin kalır.
          </p>

          {!showKill ? (
            <button className="btn btn-sm btn-danger" onClick={() => setShowKill(true)}>
              Bu projeyi durdurmayı düşünüyorum
            </button>
          ) : (
            <div>
              <div className="field">
                <label>Neden durduruyorsun?</label>
                <div className="help">
                  Bunu yazmak önemli. Sonraki projede aynı hataya düşmeni engeller.
                </div>
                <textarea
                  value={killReason}
                  onChange={(e) => setKillReason(e.target.value)}
                  placeholder="Örnek: Çekirdek döngü ikinci dakikada tekrara düşüyor ve bunu çözecek bir fikrim yok."
                />
              </div>
              <div className="btn-row">
                <button
                  className="btn btn-sm btn-danger"
                  disabled={killReason.trim() === ''}
                  onClick={() => actions.killProject(killReason.trim())}
                >
                  Projeyi durdur ve arşive al
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    setShowKill(false)
                    setKillReason('')
                  }}
                >
                  Vazgeç
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
