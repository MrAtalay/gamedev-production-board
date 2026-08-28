import { useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { formatDate } from '../lib/estimate.js'
import { totalLoggedMinutes, streakInfo } from '../lib/project.js'
import { durumFoyu, parseRapor, raporFarki } from '../lib/rapor.js'

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

export default function JournalView({ project, actions, toast }) {
  const raporRef = useRef(null)
  const [fark, setFark] = useState(null)
  const [raporHata, setRaporHata] = useState('')

  function indir(metin, ad, tip) {
    const blob = new Blob([metin], { type: tip })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = ad
    a.click()
    URL.revokeObjectURL(url)
  }

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

      <div className="card">
        <div className="card-head">
          <h2>
            <Icon name="upload" size={17} />
            Dışarıdaki asistanla çalışma
          </h2>
        </div>
        <p className="card-note" style={{ marginBottom: 14 }}>
          Oyunu başka bir bilgisayarda geliştiriyorsan, panonun durumunu föy
          olarak dışarı verip, çalışma bitince iş raporunu buraya alabilirsin.
          Dosya üzerinden yürür: internet, anahtar veya hesap gerekmez.
        </p>

        <div className="btn-row">
          <button
            className="btn btn-sm"
            onClick={() => indir(durumFoyu(project), 'durum-foyu.md', 'text/markdown')}
          >
            <Icon name="download" size={15} />
            Durum föyünü indir
          </button>
          <button
            className="btn btn-sm"
            onClick={() =>
              navigator.clipboard.writeText(durumFoyu(project)).then(
                () => toast('Durum föyü panoya kopyalandı.', 'good'),
                () => toast('Kopyalanamadı.', 'bad')
              )
            }
          >
            Föyü kopyala
          </button>
          <button className="btn btn-sm" onClick={() => raporRef.current.click()}>
            <Icon name="upload" size={15} />
            İş raporu al
          </button>
          <input
            ref={raporRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0]
              e.target.value = ''
              if (!file) return
              const reader = new FileReader()
              reader.onload = () => {
                try {
                  const rapor = parseRapor(String(reader.result))
                  setRaporHata('')
                  setFark(raporFarki(project, rapor))
                } catch (err) {
                  setFark(null)
                  setRaporHata(err.message)
                }
              }
              reader.readAsText(file)
            }}
          />
        </div>

        {raporHata && (
          <div className="rules" style={{ marginTop: 14, marginBottom: 0 }}>
            <div className="rules-title">
              <Icon name="alert" size={15} />
              Rapor okunamadı
            </div>
            <p style={{ fontSize: 13.5, margin: 0 }}>{raporHata}</p>
          </div>
        )}

        {fark && (
          <>
            <div className="divider" />
            <h3 style={{ marginBottom: 10 }}>Bu rapor neyi değiştirecek</h3>

            {fark.toplam === 0 ? (
              <p className="small muted">
                Uygulanacak bir şey yok. Aşağıdaki atlananlara bak.
              </p>
            ) : (
              <ul className="item-list" style={{ marginBottom: 14 }}>
                {fark.uygulanacak.oturumlar.length > 0 && (
                  <li className="small">
                    <strong>{fark.uygulanacak.oturumlar.length} oturum</strong>, toplam{' '}
                    {fark.dakika} dakika
                  </li>
                )}
                {fark.uygulanacak.adimlar.length > 0 && (
                  <li className="small">
                    <strong>{fark.uygulanacak.adimlar.length} adım</strong> tamamlanmış
                    olarak işaretlenecek: {fark.uygulanacak.adimlar.join(', ')}
                  </li>
                )}
                {fark.uygulanacak.teslimatlar.length > 0 && (
                  <li className="small">
                    <strong>{fark.uygulanacak.teslimatlar.length} teslimat</strong>{' '}
                    tamamlanacak: {fark.uygulanacak.teslimatlar.join(', ')}
                  </li>
                )}
                {fark.uygulanacak.eklenen.length > 0 && (
                  <li className="small">
                    <strong>{fark.uygulanacak.eklenen.length} içerik bileşeni</strong>{' '}
                    eklenecek: {fark.uygulanacak.eklenen.map((x) => x.name).join(', ')}
                  </li>
                )}
                {fark.uygulanacak.guncellenen.length > 0 && (
                  <li className="small">
                    <strong>{fark.uygulanacak.guncellenen.length} bileşen</strong>{' '}
                    güncellenecek:{' '}
                    {fark.uygulanacak.guncellenen.map((x) => x.name).join(', ')}
                  </li>
                )}
                {fark.uygulanacak.notlar.length > 0 && (
                  <li className="small">
                    <strong>{fark.uygulanacak.notlar.length} not</strong> günlüğe düşecek
                  </li>
                )}
                {fark.uygulanacak.hatalar.length > 0 && (
                  <li className="small">
                    <strong>{fark.uygulanacak.hatalar.length} hata</strong> kaydına eklenecek
                  </li>
                )}
              </ul>
            )}

            {fark.yasakli.length > 0 && (
              <div className="rules" style={{ marginBottom: 14 }}>
                <div className="rules-title">
                  <Icon name="lock" size={15} />
                  Yok sayılan alanlar
                </div>
                <p style={{ fontSize: 13.5, margin: 0 }}>
                  Rapor şu alanlara dokunmaya çalışmış: {fark.yasakli.join(', ')}. Kapı
                  kontrolleri, kapsam ve tahmin eksenleri rapordan değiştirilemez. Kapıyı
                  sen değerlendirirsin, kapsamı sen belirlersin.
                </p>
              </div>
            )}

            {fark.atlanan.length > 0 && (
              <div className="hint-box" style={{ marginBottom: 14 }}>
                <strong>{fark.atlanan.length} madde atlandı.</strong> Sessizce yok
                saymıyoruz, çünkü asistan bunları yaptığını sanıyor olabilir:
                <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                  {fark.atlanan.map((a, i) => (
                    <li key={i} style={{ marginBottom: 3 }}>
                      {a.ne}: <strong>{a.deger}</strong>, {a.sebep}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="btn-row">
              <button
                className="btn btn-sm btn-primary"
                disabled={fark.toplam === 0}
                onClick={() => {
                  actions.applyRapor(fark)
                  setFark(null)
                }}
              >
                Uygula
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => setFark(null)}>
                Vazgeç
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
