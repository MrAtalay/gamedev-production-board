import Icon from './Icon.jsx'
import { PHASES } from '../data/phases.js'
import { phaseProgress, isPhaseUnlocked, overallProgress } from '../lib/project.js'
import { computeEstimate, hoursByPhase } from '../lib/estimate.js'

export default function RoadmapView({ project, goTo, onSelectPhase }) {
  const estimate = computeEstimate(project.profile)
  const hours = hoursByPhase(estimate.required)
  const progress = overallProgress(project)

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Yol haritası</div>
        <h1>Üretim fazları</h1>
        <p className="sub">
          Fazlar sırayla açılır. Bir fazın kapısı, o fazın işleri bitmeden açılmaz.
          Bu kısıt can sıkıcı gelebilir ama tam olarak seni korumak için var.
        </p>
      </div>

      <div className="card card-tight">
        <div className="spread" style={{ marginBottom: 10 }}>
          <strong className="small">Genel ilerleme</strong>
          <span className="small muted">%{progress}</span>
        </div>
        <div className="bar-track">
          <div className="bar-fill" style={{ width: progress + '%' }} />
        </div>
      </div>

      {PHASES.map((phase) => {
        const unlocked = isPhaseUnlocked(project, phase.id)
        const passed = Boolean(project.gatePassed[phase.id])
        const isCurrent = phase.id === project.currentPhaseId
        const p = phaseProgress(project, phase.id)
        const phaseHours = hours.find((h) => h.id === phase.id)

        return (
          <button
            key={phase.id}
            className={
              'phase-row' +
              (isCurrent ? ' current' : '') +
              (passed ? ' passed' : '') +
              (!unlocked ? ' locked' : '')
            }
            onClick={() => {
              if (!unlocked) return
              onSelectPhase(phase.id)
              goTo('faz')
            }}
            disabled={!unlocked}
          >
            <div className="phase-mark">
              {passed ? (
                <Icon name="check" size={17} />
              ) : !unlocked ? (
                <Icon name="lock" size={16} />
              ) : (
                <Icon name={phase.icon} size={17} />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="phase-name">
                {phase.no}. {phase.name}
                {phase.subtitle && (
                  <span className="tiny muted"> / {phase.subtitle}</span>
                )}
              </div>
              <div className="phase-goal">{phase.goal}</div>

              {unlocked && !passed && p.total > 0 && (
                <div style={{ marginTop: 9 }}>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: p.percent + '%' }} />
                  </div>
                  <div className="tiny muted" style={{ marginTop: 4 }}>
                    {p.deliverablesDone} / {p.deliverablesTotal} teslimat, {p.done} /{' '}
                    {p.total} adım
                  </div>
                </div>
              )}
            </div>

            <div className="phase-side">
              {phaseHours && phaseHours.hours > 0 && (
                <div>~{phaseHours.hours} saat</div>
              )}
              {passed && <div style={{ color: 'var(--good)' }}>geçildi</div>}
              {!unlocked && <div>kilitli</div>}
              {isCurrent && !passed && <div style={{ color: 'var(--accent)' }}>şu an</div>}
            </div>
          </button>
        )
      })}

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-head">
          <h2>
            <Icon name="lightbulb" size={17} />
            Neden bu sıra?
          </h2>
        </div>
        <p className="small" style={{ marginBottom: 10 }}>
          Bu sıralama, büyük stüdyoların faz-kapı modelinin küçük ekiplere uyarlanmış
          hali. Mantığı şu: her faz, bir sonrakinin boşa gitmesini engelleyen bir soruyu
          cevaplar.
        </p>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13.5 }}>
          <li style={{ marginBottom: 5 }}>
            <strong>Konsept</strong> sorar: bu yapmaya değer mi?
          </li>
          <li style={{ marginBottom: 5 }}>
            <strong>Ön üretim</strong> sorar: ne yapacağımı tam olarak biliyor muyum?
          </li>
          <li style={{ marginBottom: 5 }}>
            <strong>Prototip</strong> sorar: bu eğlenceli mi?
          </li>
          <li style={{ marginBottom: 5 }}>
            <strong>Dikey dilim</strong> sorar: bu kaliteyi tekrarlayabilir miyim?
          </li>
          <li style={{ marginBottom: 5 }}>
            <strong>Üretim</strong> sorar: gerisini bitirebilir miyim?
          </li>
          <li style={{ marginBottom: 5 }}>
            <strong>Cila</strong> sorar: bu oynanabilir mi?
          </li>
          <li>
            <strong>Yayın</strong> sorar: insanlar bunu bulabilir mi?
          </li>
        </ul>
      </div>
    </div>
  )
}
