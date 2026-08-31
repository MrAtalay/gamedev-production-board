import Icon from './Icon.jsx'
import { haftaOzeti, sonHaftalar } from '../lib/tempo.js'
import { formatDate } from '../lib/estimate.js'

function saat(dakika) {
  const s = Math.floor(dakika / 60)
  const d = dakika % 60
  if (s === 0) return d + ' dk'
  if (d === 0) return s + ' sa'
  return s + ' sa ' + d + ' dk'
}

// Bu haftanın durumu ve son dört haftanın eğilimi.
//
// Ton kuralı gereği eksik hafta suçlanmaz: "geride kaldın" denmez, sayı
// gösterilir ve ne anlama geldiği yazılır. Hedef yoksa hedefe göre yorum
// da yapılmaz, sadece harcanan süre gösterilir.
export default function WeekSummary({ project }) {
  const hafta = haftaOzeti(project)
  const gecmis = sonHaftalar(project, 4)
  const enBuyuk = Math.max(...gecmis.map((h) => h.toplamDakika), hafta.hedefDakika, 1)

  return (
    <div className="card">
      <div className="card-head">
        <h2>
          <Icon name="clock" size={17} />
          Bu hafta
        </h2>
        <span className="chip">
          {formatDate(hafta.baslangic)} ile {formatDate(hafta.bitis)} arası
        </span>
      </div>

      <div className="number-row" style={{ marginTop: 0 }}>
        <div className="number-box">
          <div className="number-value">{Math.round((hafta.toplamDakika / 60) * 10) / 10}</div>
          <div className="number-label">bu hafta saat</div>
        </div>
        <div className="number-box">
          <div className="number-value">
            {hafta.hedefVar ? Math.round((hafta.hedefDakika / 60) * 10) / 10 : '-'}
          </div>
          <div className="number-label">haftalık plan saati</div>
        </div>
        <div className="number-box">
          <div className="number-value">
            {hafta.calisilanGun}
            {hafta.planlananGun > 0 ? ' / ' + hafta.planlananGun : ''}
          </div>
          <div className="number-label">çalışılan gün</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', marginTop: 4 }}>
        {hafta.gunler.map((g) => {
          const oran = enBuyuk > 0 ? g.dakika / enBuyuk : 0
          return (
            <div key={g.iso} style={{ flex: 1, textAlign: 'center' }}>
              <div
                title={formatDate(g.iso) + ': ' + saat(g.dakika)}
                style={{
                  height: 54,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: Math.max(3, Math.round(oran * 54)),
                    borderRadius: 4,
                    backgroundColor: g.dakika > 0 ? 'var(--accent)' : 'var(--surface-alt)',
                    opacity: g.bugun ? 1 : 0.75,
                  }}
                />
              </div>
              <div className="tiny muted" style={{ marginTop: 4 }}>
                {g.ad}
              </div>
            </div>
          )
        })}
      </div>

      {hafta.hedefVar ? (
        <p className="tiny muted" style={{ marginTop: 12 }}>
          {hafta.farkDakika >= 0
            ? 'Planladığın haftalık süreyi ' +
              saat(hafta.farkDakika) +
              ' aştın. Plan ' +
              saat(hafta.hedefDakika) +
              ' idi.'
            : 'Planladığın haftalık sürenin ' +
              saat(Math.abs(hafta.farkDakika)) +
              ' gerisindesin. Haftanın kalanında ' +
              saat(Math.abs(hafta.farkDakika)) +
              ' daha çalışmak planı tutturur.'}
        </p>
      ) : (
        <p className="tiny muted" style={{ marginTop: 12 }}>
          Haftalık plan sayısı yok, çünkü profilde günlük süre veya haftalık gün
          girilmemiş. Ayarlardan girersen bu hafta planın neresinde olduğun da
          burada görünür.
        </p>
      )}

      <div className="divider" />

      <div className="rules-title">Son dört hafta</div>
      <table className="compare-table">
        <thead>
          <tr>
            <th>Hafta</th>
            <th>Çalışılan</th>
            <th>Plan</th>
            <th>Gün</th>
          </tr>
        </thead>
        <tbody>
          {gecmis.map((h) => (
            <tr key={h.baslangic}>
              <td>
                {formatDate(h.baslangic)}
                {h.buHafta ? <span className="chip chip-accent" style={{ marginLeft: 8 }}>bu hafta</span> : null}
              </td>
              <td>{saat(h.toplamDakika)}</td>
              <td>{h.hedefDakika > 0 ? saat(h.hedefDakika) : '-'}</td>
              <td>{h.calisilanGun}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="tiny muted" style={{ marginTop: 10 }}>
        Tek haftaya bakmak yanıltıcıdır. Bir hafta düşük geçmişse bu bir eğilim
        değildir, dört hafta üst üste düşükse eğilimdir.
      </p>
    </div>
  )
}
