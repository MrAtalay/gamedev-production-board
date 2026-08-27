import Icon from './Icon.jsx'
import { formatDate } from '../lib/estimate.js'
import { totalLoggedMinutes, streakInfo } from '../lib/project.js'

const HISTORY_DAYS = 35

function lastDays(count) {
  const days = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    days.push(yyyy + '-' + mm + '-' + dd)
  }
  return days
}

export default function JournalView({ project }) {
  const sessions = [...project.sessions].reverse()
  const totalMinutes = totalLoggedMinutes(project)
  const streak = streakInfo(project)
  const target = project.profile.dailyMinutes

  const byDate = {}
  project.sessions.forEach((s) => {
    byDate[s.date] = (byDate[s.date] || 0) + (Number(s.minutes) || 0)
  })

  const days = lastDays(HISTORY_DAYS)
  const activeDays = Object.keys(byDate).length
  const average = activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Günlük</div>
        <h1>Çalışma kaydı</h1>
        <p className="sub">
          Ne kadar çalıştığını ölçmek, tahminlerini düzelten tek şey. Bu sayılar
          post-mortem sırasında en değerli veri olacak.
        </p>
      </div>

      <div className="number-row" style={{ marginTop: 0 }}>
        <div className="number-box">
          <div className="number-value">{Math.round(totalMinutes / 60)}</div>
          <div className="number-label">toplam saat</div>
        </div>
        <div className="number-box">
          <div className="number-value">{activeDays}</div>
          <div className="number-label">çalışılan gün</div>
        </div>
        <div className="number-box">
          <div className="number-value">{average}</div>
          <div className="number-label">günlük ortalama dk</div>
        </div>
        <div className="number-box">
          <div className="number-value">{streak.current}</div>
          <div className="number-label">gün üst üste</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>
            <Icon name="clock" size={17} />
            Son {HISTORY_DAYS} gün
          </h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {days.map((day) => {
            const minutes = byDate[day] || 0
            const ratio = target > 0 ? Math.min(1, minutes / target) : 0
            return (
              <span
                key={day}
                title={formatDate(day) + ': ' + minutes + ' dakika'}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 4,
                  backgroundColor:
                    minutes === 0
                      ? 'var(--surface-alt)'
                      : 'var(--accent)',
                  opacity: minutes === 0 ? 1 : 0.35 + ratio * 0.65,
                }}
              />
            )
          })}
        </div>
        <p className="tiny muted" style={{ marginTop: 10 }}>
          Koyu kareler hedefini doldurduğun günler. Boşluklar sorun değil, düzen önemli.
        </p>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>
            <Icon name="clipboard" size={17} />
            Oturumlar
          </h2>
          <span className="chip">{sessions.length} kayıt</span>
        </div>

        {sessions.length === 0 ? (
          <p className="empty">Henüz kayıt yok. Bugün ekranından zamanlayıcıyı kullan.</p>
        ) : (
          <ul className="item-list">
            {sessions.slice(0, 60).map((s) => (
              <li key={s.id} className="item alt">
                <div className="item-body">
                  <div className="item-title">
                    {s.note || 'Kayıt'}
                  </div>
                  <div className="item-sub">{formatDate(s.date)}</div>
                </div>
                {s.minutes > 0 && <span className="chip">{s.minutes} dk</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
