import { useRef, useState } from 'react'
import Icon from './Icon.jsx'
import NumberField from './NumberField.jsx'
import ArchiveDetail from './ArchiveDetail.jsx'
import { computeEstimate, formatDate } from '../lib/estimate.js'
import { yedekMetni } from '../lib/storage.js'
import { GENRES, findGenre } from '../data/genres.js'
import {
  SCALES,
  EXPERIENCE_LEVELS,
  ENGINE_FAMILIARITY,
  ART_APPROACHES,
  TEAM_SIZES,
  MULTIPLAYER_MODES,
  PLATFORM_TARGETS,
  AI_TOOLS,
  COMMITMENT_MODES,
  DEFAULT_COMMITMENT_ID,
} from '../data/options.js'

// Profil alanları sonradan değişebilmeli: bir proje ilerledikçe kapsam
// kararları değişir (çok oyunculudan vazgeçmek, ekibe biri katılmak gibi).
// Değişiklik anında saat tahminini ve dolayısıyla kapı kontrollerini etkiler.
const PROFILE_FIELDS = [
  { key: 'genreId', label: 'Tür', options: GENRES },
  { key: 'scaleId', label: 'Ölçek', options: SCALES },
  { key: 'experienceId', label: 'Deneyim', options: EXPERIENCE_LEVELS },
  { key: 'engineId', label: 'Motor aşinalığı', options: ENGINE_FAMILIARITY },
  { key: 'artId', label: 'Sanat yaklaşımı', options: ART_APPROACHES },
  { key: 'multiplayerId', label: 'Çok oyunculu', options: MULTIPLAYER_MODES },
  { key: 'platformId', label: 'Platform', options: PLATFORM_TARGETS },
  { key: 'teamId', label: 'Ekip', options: TEAM_SIZES },
]

export default function SettingsView({ project, archive, actions, yedek }) {
  const fileRef = useRef(null)
  const [confirmNew, setConfirmNew] = useState(false)
  // Arşivde açık olan projenin kimliği. Aynı anda tek proje açılır,
  // liste uzayınca hepsi birden açık olursa okunmaz hale geliyordu.
  const [acikArsiv, setAcikArsiv] = useState(null)
  // İçe aktarma iki adımlı: dosya seçilince önce karşılaştırma gösterilir.
  const [pendingImport, setPendingImport] = useState(null)

  const estimate = computeEstimate(project.profile)
  const genre = findGenre(project.profile.genreId)
  const yedekYazi = yedekMetni(yedek)

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Ayarlar</div>
        <h1>Proje ve veri</h1>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>
            <Icon name="gamepad" size={17} />
            Proje
          </h2>
        </div>

        <div className="field">
          <label>Oyun adı</label>
          <input
            value={project.name}
            onChange={(e) => actions.setName(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Kullandığın motor</label>
          <input
            value={project.profile.engineName}
            onChange={(e) => actions.setProfile({ engineName: e.target.value })}
            placeholder="Godot, Unity, Unreal..."
          />
        </div>

        <p className="card-note" style={{ marginBottom: 14 }}>
          Aşağıdaki kararlar proje ilerledikçe değişebilir. Değiştirdiğinde saat
          tahmini anında güncellenir. Kapsamı küçültmek her zaman meşrudur; kapsamı
          büyütürken tarihi de gözden geçir.
        </p>

        {PROFILE_FIELDS.map((field) => (
          <div className="field" key={field.key}>
            <label>{field.label}</label>
            <select
              value={project.profile[field.key] || field.options[0].id}
              onChange={(e) => actions.setProfile({ [field.key]: e.target.value })}
            >
              {field.options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        ))}

        <div className="hint-box">
          <strong>İçerik hacmi:</strong> {genre.contentUnits[project.profile.scaleId]}
        </div>

        <div className="divider" />

        <p className="card-note" style={{ marginBottom: 14 }}>
          Tempo ve tarihi değiştirebilirsin. Değiştirdiğinde kapsam hesabı anında
          güncellenir, çünkü bu sayılar kapı kontrollerini besliyor.
        </p>

        <div className="field">
          <label>Günün geri kalanında ne yapıyorsun?</label>
          <select
            value={project.profile.commitmentId || DEFAULT_COMMITMENT_ID}
            onChange={(e) => actions.setProfile({ commitmentId: e.target.value })}
          >
            {COMMITMENT_MODES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Günlük dakika</label>
            <NumberField
              min="15"
              step="15"
              value={project.profile.dailyMinutes}
              onChange={(v) =>
                actions.setProfile({ dailyMinutes: Number(v) })
              }
            />
          </div>
          <div className="field">
            <label>Haftada gün</label>
            <NumberField
              min="1"
              max="7"
              value={project.profile.daysPerWeek}
              onChange={(v) =>
                actions.setProfile({ daysPerWeek: Number(v) })
              }
            />
          </div>
          <div className="field">
            <label>Hedef tarih</label>
            <input
              type="date"
              value={project.profile.deadline}
              onChange={(e) => actions.setProfile({ deadline: e.target.value })}
            />
          </div>
        </div>

        {estimate.tempo.isOver && (
          <div className="rules" style={{ marginTop: 14 }}>
            <div className="rules-title">
              <Icon name="alert" size={15} />
              Bu tempo sürdürülebilir görünmüyor
            </div>
            <p style={{ fontSize: 13.5, margin: 0 }}>
              Günde {project.profile.dailyMinutes} dakika, senin durumun için
              sürdürülebilir kabul edilen{' '}
              {Math.round((estimate.tempo.ceiling / 60) * 10) / 10} saatlik tavanın
              üstünde. Aşağıdaki karar, sürdüremeyeceğin bir tempoya dayanıyorsa
              güvenilir değildir.
              {!estimate.tempo.scopeNeedsChange &&
                ' Aynı kapsam günde ' +
                  (estimate.tempo.comfortable || estimate.tempo.fitting) +
                  ' dakikayla da sığıyor.'}
            </p>
          </div>
        )}

        <div className={'verdict verdict-' + estimate.verdict.tone} style={{ marginTop: 6 }}>
          <div className="verdict-label">{estimate.verdict.label}</div>
          <div className="verdict-message">
            Gereken {estimate.required} saat, elindeki {estimate.available.hours} saat.
            Hedef tarih {formatDate(project.profile.deadline)}.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>
            <Icon name="sparkle" size={17} />
            Yapay zeka asistanları ve bütçe
          </h2>
        </div>
        <p className="card-note" style={{ marginBottom: 14 }}>
          Asistanlar sadece ilgili işkolunu hızlandırır. Tasarım, oynanabilirlik
          testi, denge ve cila hiçbir araçtan etkilenmez.
        </p>

        {AI_TOOLS.map((tool) => {
          const on = Boolean((project.profile.aiTools || {})[tool.id])
          const costs = project.profile.aiCosts || {}
          return (
            <div key={tool.id} className="item" style={{ marginBottom: 9 }}>
              <input
                type="checkbox"
                className="check"
                checked={on}
                onChange={() =>
                  actions.setProfile({
                    aiTools: { ...(project.profile.aiTools || {}), [tool.id]: !on },
                  })
                }
              />
              <div className="item-body">
                <div className="item-title">{tool.name}</div>
              </div>
              {on && (
                <div style={{ width: 110 }}>
                  <NumberField
                    min="0"
                    value={
                      costs[tool.id] === undefined ? tool.defaultMonthly : costs[tool.id]
                    }
                    onChange={(v) =>
                      actions.setProfile({
                        aiCosts: { ...costs, [tool.id]: v },
                      })
                    }
                  />
                </div>
              )}
            </div>
          )
        })}

        <div className="field-row" style={{ marginTop: 14 }}>
          <div className="field">
            <label>Diğer aylık giderler</label>
            <NumberField
              min="0"
              value={project.profile.otherMonthlyCost || 0}
              onChange={(v) =>
                actions.setProfile({ otherMonthlyCost: Number(v) })
              }
            />
          </div>
          <div className="field">
            <label>Tek seferlik giderler</label>
            <NumberField
              min="0"
              value={project.profile.oneTimeCost || 0}
              onChange={(v) =>
                actions.setProfile({ oneTimeCost: Number(v) })
              }
            />
          </div>
        </div>

        {estimate.cost.total > 0 && (
          <div className="number-row" style={{ marginTop: 0 }}>
            <div className="number-box">
              <div className="number-value">{estimate.cost.monthlyTotal}</div>
              <div className="number-label">aylık gider</div>
            </div>
            <div className="number-box">
              <div className="number-value">{estimate.cost.total}</div>
              <div className="number-label">hedef tarihe kadar toplam</div>
            </div>
            {estimate.cost.exceedsPlan && (
              <div className="number-box">
                <div className="number-value" style={{ color: 'var(--bad)' }}>
                  {estimate.cost.realisticTotal}
                </div>
                <div className="number-label">
                  bu kapsam gerçekten sürerse ({estimate.cost.realisticMonths} ay)
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-head">
          <h2>
            <Icon name="download" size={17} />
            Veri
          </h2>
        </div>
        <p className="card-note" style={{ marginBottom: 14 }}>
          Veriler bu tarayıcıda saklanıyor. Başka bir bilgisayara taşımak veya yedek
          almak için dışa aktar.
        </p>
        {/*
          Yedek göstergesi her zaman burada, uyarı olmasa da. Durumu ancak
          uyarı çıkınca görebilmek, arada ne olduğunu bilinmez yapar.
        */}
        {yedekYazi && (
          <div className={yedek.uyari ? 'rules' : 'hint-box'} style={{ marginBottom: 14 }}>
            {yedek.uyari ? (
              <div className="rules-title">
                <Icon name="archive" size={15} />
                {yedekYazi.baslik}
              </div>
            ) : (
              <strong>{yedekYazi.baslik}</strong>
            )}
            <p style={{ fontSize: 13, margin: '6px 0 0' }}>{yedekYazi.ayrinti}</p>
          </div>
        )}
        <div className="btn-row">
          <button className="btn btn-sm" onClick={actions.exportData}>
            <Icon name="download" size={15} />
            Dışa aktar
          </button>
          <button className="btn btn-sm" onClick={() => fileRef.current.click()}>
            <Icon name="upload" size={15} />
            İçe aktar
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = () => {
                const karsilastirma = actions.prepareImport(String(reader.result))
                if (karsilastirma) setPendingImport(karsilastirma)
              }
              reader.readAsText(file)
              e.target.value = ''
            }}
          />
        </div>

        {pendingImport && (
          <>
            <div className="divider" />
            <div
              className={pendingImport.dahaEski || pendingImport.gerileme ? 'rules' : 'hint-box'}
              style={{ marginBottom: 14 }}
            >
              {(pendingImport.dahaEski || pendingImport.gerileme) && (
                <div className="rules-title">
                  <Icon name="alert" size={15} />
                  Bu dosya elindekinden geride
                </div>
              )}
              <p style={{ fontSize: 13.5, margin: 0 }}>
                {pendingImport.bosMu
                  ? 'Bu dosyada aktif proje yok. İçe aktarırsan mevcut projen silinir.'
                  : pendingImport.dahaEski || pendingImport.gerileme
                    ? 'İçe aktarırsan aşağıdaki farklar kaybolur. İki bilgisayar ' +
                      'arasında dosya taşıyorsan yanlış yönde taşıyor olabilirsin.'
                    : 'Bu dosya elindekinden ileride görünüyor. İçe aktarma ' +
                      'mevcut verinin tamamının yerine geçer.'}
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Alan</th>
                    <th>Şu an burada</th>
                    <th>Dosyada</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Proje', 'projeAdi'],
                    ['Faz', 'faz'],
                    ['Tamamlanan adım', 'adim'],
                    ['Kayıtlı oturum', 'oturum'],
                    ['Kaydedilen dakika', 'dakika'],
                    ['İçerik bileşeni', 'bilesen'],
                    ['Arşivdeki proje', 'arsiv'],
                  ].map(([etiket, anahtar]) => {
                    const a = pendingImport.mevcut[anahtar]
                    const b = pendingImport.yeni[anahtar]
                    const farkli = String(a) !== String(b)
                    return (
                      <tr key={anahtar}>
                        <td>{etiket}</td>
                        <td>{a === null || a === undefined ? '-' : String(a)}</td>
                        <td style={farkli ? { fontWeight: 700 } : undefined}>
                          {b === null || b === undefined ? '-' : String(b)}
                        </td>
                      </tr>
                    )
                  })}
                  <tr>
                    <td>Son değişiklik</td>
                    <td>
                      {pendingImport.mevcut.tarih
                        ? new Date(pendingImport.mevcut.tarih).toLocaleString('tr-TR')
                        : 'bilinmiyor'}
                    </td>
                    <td>
                      {pendingImport.yeni.tarih
                        ? new Date(pendingImport.yeni.tarih).toLocaleString('tr-TR')
                        : 'bilinmiyor'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="btn-row" style={{ marginTop: 14 }}>
              <button
                className={
                  'btn btn-sm ' +
                  (pendingImport.dahaEski || pendingImport.gerileme
                    ? 'btn-danger'
                    : 'btn-primary')
                }
                onClick={() => {
                  actions.applyImport(pendingImport.gelen)
                  setPendingImport(null)
                }}
              >
                {pendingImport.dahaEski || pendingImport.gerileme
                  ? 'Yine de üstüne yaz'
                  : 'İçe aktar'}
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => setPendingImport(null)}>
                Vazgeç
              </button>
              <button className="btn btn-sm" onClick={actions.exportData}>
                <Icon name="download" size={15} />
                Önce mevcudu yedekle
              </button>
            </div>
          </>
        )}
      </div>

      {archive.length > 0 && (
        <div className="card">
          <div className="card-head">
            <h2>
              <Icon name="archive" size={17} />
              Arşiv
            </h2>
            <span className="chip">{archive.length} proje</span>
          </div>
          <ul className="item-list">
            {archive.map((p) => {
              const acik = acikArsiv === p.id
              return (
                <li key={p.id} className="item alt">
                  <div className="item-body">
                    <div className="spread">
                      <div>
                        <div className="item-title">{p.name}</div>
                        <div className="item-sub">
                          {p.status === 'durduruldu' ? 'Durduruldu' : 'Tamamlandı'}
                          {p.archivedAt && ', ' + formatDate(p.archivedAt.slice(0, 10))}
                        </div>
                        {p.killReason && (
                          <div className="item-sub" style={{ marginTop: 4 }}>
                            Sebep: {p.killReason}
                          </div>
                        )}
                      </div>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => setAcikArsiv(acik ? null : p.id)}
                        aria-expanded={acik}
                      >
                        <Icon name={acik ? 'chevronUp' : 'chevronDown'} size={14} />
                        {acik ? 'Kapat' : 'Ayrıntı'}
                      </button>
                    </div>
                    {acik && <ArchiveDetail project={p} />}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <h2>
            <Icon name="alert" size={17} />
            Yeni proje
          </h2>
        </div>
        <p className="card-note" style={{ marginBottom: 14 }}>
          Aynı anda tek bir aktif proje olmasını öneriyorum. Bir saatlik günlük tempoda
          iki projeyi birlikte yürütmek, ikisini de bitirmemenin en kısa yoludur. Yeni
          proje başlatırsan mevcut proje arşive gider, silinmez.
        </p>
        {!confirmNew ? (
          <button className="btn btn-sm btn-danger" onClick={() => setConfirmNew(true)}>
            Yeni proje başlat
          </button>
        ) : (
          <div className="btn-row">
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                actions.archiveAndRestart()
                setConfirmNew(false)
              }}
            >
              Evet, mevcut projeyi arşivle
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => setConfirmNew(false)}>
              Vazgeç
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
