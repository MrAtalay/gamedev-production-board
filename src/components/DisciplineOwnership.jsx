import { DISCIPLINES, UNOWNED_WORK_LIMIT } from '../data/options.js'
import { teamEffect } from '../lib/estimate.js'

// Hangi işkolunda kimse olmadığını işaretleme alanı.
//
// Hem sihirbazda hem ayarlarda aynı soru soruluyor ve aynı sayıyı
// göstermesi gerekiyor, o yüzden tek bileşen.
export default function DisciplineOwnership({ profile, onChange }) {
  const effect = teamEffect(profile)
  const unowned = profile.unownedDisciplines || {}
  const percent = Math.round(effect.unownedShare * 100)
  const limitPercent = Math.round(UNOWNED_WORK_LIMIT * 100)
  const soloEkip = effect.teamMultiplier === 1

  function toggle(id) {
    onChange({
      unownedDisciplines: { ...unowned, [id]: !unowned[id] },
    })
  }

  return (
    <div className="field">
      <label>Sahipsiz işkolları</label>
      <p className="card-note" style={{ marginBottom: 10 }}>
        Bu işi yapacak kimse yoksa işaretle. Ekip çarpanı sahipsiz işkoluna
        uygulanmaz, çünkü o iş ekip büyüdüğü için kısalmaz. Yüzdeler seçtiğin
        türün iş dağılımından geliyor.
      </p>

      {DISCIPLINES.map((discipline) => {
        const share = effect.shares[discipline.id] || 0
        const on = Boolean(unowned[discipline.id])
        return (
          <div key={discipline.id} className="item" style={{ marginBottom: 9 }}>
            <input
              type="checkbox"
              className="check"
              checked={on}
              onChange={() => toggle(discipline.id)}
              id={'sahipsiz-' + discipline.id}
            />
            <label
              htmlFor={'sahipsiz-' + discipline.id}
              style={{ margin: 0, cursor: 'pointer' }}
            >
              {discipline.name}
              <span className="small muted"> (işin %{Math.round(share * 100)}'i)</span>
            </label>
          </div>
        )
      })}

      {effect.unownedNames.length > 0 && (
        <div className="hint-box" style={{ marginTop: 10 }}>
          <strong>
            İşin %{percent}'i sahipsiz: {effect.unownedNames.join(', ')}.
          </strong>{' '}
          {soloEkip
            ? 'Yalnız çalıştığın için saat tahmini değişmiyor, ama Kalite kapısı ' +
              'bu işkolunu yine de soruyor.'
            : 'Bu pay ekip çarpanından muaf tutuluyor, yani tahmin ' +
              'olduğundan kısa görünmüyor.'}{' '}
          {percent > limitPercent
            ? 'Sınır %' +
              limitPercent +
              ', bu haliyle Kalite kapısı açılmaz: üretime bu kadar sahipsiz işle girilmez.'
            : 'Sınır %' + limitPercent + ', bu haliyle Kalite kapısını engellemiyor.'}
        </div>
      )}
    </div>
  )
}
