import Icon from './Icon.jsx'
import { PHASES } from '../data/phases.js'
import { findGenre } from '../data/genres.js'
import { totalLoggedMinutes } from '../lib/project.js'
import { genelKarsilastirma, fazKarsilastirmasi } from '../lib/tempo.js'
import { formatDate } from '../lib/estimate.js'

// Arşivdeki bir projenin ayrıntısı.
//
// Arşiv, bitmiş işin mezarlığı değil, bir sonraki projenin verisi. Burada
// asıl değerli sayı sapma katsayısıdır: geçmiş projede tahminlerin kaç
// katına çıktığını bilmek, yeni projede tahminleri düzeltmeyi sağlar.
export default function ArchiveDetail({ project }) {
  const genre = findGenre(project.profile?.genreId)
  const toplamDakika = totalLoggedMinutes(project)
  const gunler = new Set(project.sessions.map((s) => s.date)).size
  const genel = genelKarsilastirma(project)
  const { satirlar } = fazKarsilastirmasi(project)
  const olculenler = satirlar.filter((s) => s.olculdu)

  const gecilenFazlar = PHASES.filter((p) => project.gatePassed?.[p.id])
  const sonFaz = gecilenFazlar.length > 0 ? gecilenFazlar[gecilenFazlar.length - 1] : null

  return (
    <div style={{ marginTop: 12 }}>
      <div className="number-row" style={{ marginTop: 0 }}>
        <div className="number-box">
          <div className="number-value">{Math.round(toplamDakika / 60)}</div>
          <div className="number-label">kayıtlı saat</div>
        </div>
        <div className="number-box">
          <div className="number-value">{gunler}</div>
          <div className="number-label">çalışılan gün</div>
        </div>
        <div className="number-box">
          <div className="number-value">
            {gecilenFazlar.length} / {PHASES.length}
          </div>
          <div className="number-label">geçilen kapı</div>
        </div>
        <div className="number-box">
          <div className="number-value">{genel.sapmaKatsayisi || '-'}</div>
          <div className="number-label">sapma katsayısı</div>
        </div>
      </div>

      <div className="rules-title">Profil</div>
      <p className="tiny muted">
        {genre ? genre.name : 'Tür bilinmiyor'}
        {project.profile?.dailyMinutes
          ? ', günde ' + project.profile.dailyMinutes + ' dakika'
          : ''}
        {project.profile?.daysPerWeek ? ', haftada ' + project.profile.daysPerWeek + ' gün' : ''}
        {project.profile?.deadline
          ? ', hedef tarih ' + formatDate(project.profile.deadline)
          : ''}
        .
        {sonFaz
          ? ' En son "' + sonFaz.name + '" fazının kapısı geçilmiş.'
          : ' Hiçbir kapı geçilmemiş.'}
      </p>

      {project.fields?.pitch ? (
        <>
          <div className="divider" />
          <div className="rules-title">Oyun tanımı</div>
          <p className="tiny muted">{project.fields.pitch}</p>
        </>
      ) : null}

      {olculenler.length > 0 ? (
        <>
          <div className="divider" />
          <div className="rules-title">Faz başına tahmin ve gerçek</div>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Faz</th>
                <th>Tahmin</th>
                <th>Gerçek</th>
                <th>Oran</th>
              </tr>
            </thead>
            <tbody>
              {olculenler.map((s) => (
                <tr key={s.id}>
                  <td>{s.ad}</td>
                  <td>{s.tahminSaat} sa</td>
                  <td>{s.gercekSaat} sa</td>
                  <td>{s.katsayi !== null ? s.katsayi : <span className="muted">kapı geçilmemiş</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p className="tiny muted" style={{ marginTop: 10 }}>
          Bu projede adıma bağlı süre kaydı yok, o yüzden faz karşılaştırması
          yapılamıyor.
        </p>
      )}

      <div className="divider" />
      <div className="rules-title">Kayıtlar</div>
      <div className="tag-list">
        <span className="chip">{(project.decisions || []).length} karar</span>
        <span className="chip">{(project.risks || []).length} risk</span>
        <span className="chip">{(project.playtests || []).length} test</span>
        <span className="chip">{(project.bugs || []).length} hata</span>
        <span className="chip">{(project.icebox || []).length} buzdolabı notu</span>
        <span className="chip">{(project.sessions || []).length} oturum</span>
      </div>

      {project.fields?.postmortem ? (
        <>
          <div className="divider" />
          <div className="rules-title">Post-mortem</div>
          <p className="tiny muted" style={{ whiteSpace: 'pre-wrap' }}>
            {project.fields.postmortem}
          </p>
        </>
      ) : null}

      {(project.decisions || []).length > 0 ? (
        <>
          <div className="divider" />
          <div className="rules-title">
            <Icon name="clipboard" size={15} />
            Kararlar
          </div>
          <ul className="item-list">
            {project.decisions.slice(0, 8).map((d) => (
              <li key={d.id} className="item alt">
                <div className="item-body">
                  <div className="item-title">{d.text || d.title}</div>
                  {d.why ? <div className="item-sub">{d.why}</div> : null}
                </div>
              </li>
            ))}
          </ul>
          {project.decisions.length > 8 ? (
            <p className="tiny muted">
              İlk 8 karar gösteriliyor, toplam {project.decisions.length} karar var.
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
