import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'
import { loadDraft, saveDraft } from '../lib/storage.js'
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
  findOption,
} from '../data/options.js'
import { computeEstimate, formatDate, hoursByPhase } from '../lib/estimate.js'

function defaultDeadline() {
  const d = new Date()
  d.setMonth(d.getMonth() + 6)
  return d.toISOString().slice(0, 10)
}

const STEP_COUNT = 7

const EMPTY_FORM = {
  name: '',
  pitch: '',
  genreId: '',
  scaleId: 'kucuk',
  commitmentId: DEFAULT_COMMITMENT_ID,
  dailyMinutes: 60,
  daysPerWeek: 5,
  deadline: defaultDeadline(),
  experienceId: 'ilk',
  engineId: 'yeni',
  engineName: '',
  artId: 'minimal',
  teamId: 'tek',
  multiplayerId: 'tek',
  platformId: 'pc',
  aiTools: {},
  aiCosts: {},
  otherMonthlyCost: 0,
  oneTimeCost: 0,
}

export default function Wizard({ onFinish }) {
  // Taslak varsa kaldığı yerden devam edilir. Sihirbaz uzun ve yenileme
  // veya sekme kapatma her şeyi silmemeli.
  const [draft] = useState(() => loadDraft())
  const [restored, setRestored] = useState(() => Boolean(draft))
  const [step, setStep] = useState(() => (draft ? draft.step : 0))
  const [form, setForm] = useState(() =>
    draft ? { ...EMPTY_FORM, ...draft.form } : EMPTY_FORM
  )

  // Her değişiklikte taslağı yaz.
  useEffect(() => {
    saveDraft(form, step)
  }, [form, step])

  function set(patch) {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  const genre = form.genreId ? findGenre(form.genreId) : null
  const scale = findOption(SCALES, form.scaleId)
  const estimate = form.genreId ? computeEstimate(form) : null

  const canContinue = [
    form.name.trim() !== '' && form.pitch.trim() !== '',
    form.genreId !== '',
    true,
    form.dailyMinutes > 0 && form.daysPerWeek > 0 && form.deadline !== '',
    true,
    true,
    true,
  ][step]

  function toggleTool(id) {
    setForm((prev) => ({
      ...prev,
      aiTools: { ...prev.aiTools, [id]: !prev.aiTools[id] },
    }))
  }

  function setToolCost(id, value) {
    setForm((prev) => ({ ...prev, aiCosts: { ...prev.aiCosts, [id]: value } }))
  }

  return (
    <div className="wizard">
      <div className="wizard-steps">
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <div key={i} className={'wizard-step-dot' + (i <= step ? ' done' : '')} />
        ))}
      </div>

      {restored && (
        <div className="card card-tight" style={{ marginBottom: 20 }}>
          <div className="row">
            <Icon name="clock" size={17} className="muted" />
            <div style={{ flex: 1 }}>
              <strong className="small">Kaldığın yerden devam ediyorsun.</strong>{' '}
              <span className="small muted">
                Daha önce doldurduğun bilgiler geri yüklendi. Girdiklerin her
                değişiklikte kaydediliyor, sayfayı yenilesen de kaybolmaz.
              </span>
            </div>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setForm(EMPTY_FORM)
                setStep(0)
                setRestored(false)
              }}
            >
              Baştan başla
            </button>
          </div>
        </div>
      )}

      {step === 0 && (
        <div>
          <div className="page-head">
            <div className="eyebrow">Adım 1 / 7</div>
            <h1>Ne yapmak istiyorsun?</h1>
            <p className="sub">
              Önce oyunun ne olduğunu tek cümlede söylemen gerekiyor. Bu cümle, sonraki
              her kararın ölçüsü olacak. Şimdilik kaba olabilir, ön üretimde düzelteceksin.
            </p>
          </div>

          <div className="card">
            <div className="field">
              <label>Oyunun adı</label>
              <div className="help">Geçici olabilir, sonra değiştirebilirsin.</div>
              <input
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="Örnek: Batık"
              />
            </div>

            <div className="field">
              <label>Tek cümlelik tanım</label>
              <div className="help">
                Şu kalıbı kullan: [Oyuncu] [ne yapar] [nerede], [neden ilginç].
              </div>
              <textarea
                value={form.pitch}
                onChange={(e) => set({ pitch: e.target.value })}
                placeholder="Örnek: Oyuncu batmakta olan bir gemide eşya taşır, çünkü su her saniye yükseliyor."
              />
            </div>

            <div className="hint-box">
              Cümlen uzun ve virgüllü olduysa sorun değil. Bu aşamada amacımız fikri
              yakalamak, cilalamak değil. Ön üretim fazında bu cümleyi keskinleştireceksin.
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <div className="page-head">
            <div className="eyebrow">Adım 2 / 7</div>
            <h1>Bu hangi tür bir oyun?</h1>
            <p className="sub">
              Tür seçimi kozmetik değil: sistemin sana vereceği görevleri, uyarıları ve
              süre tahminini değiştirir. Bir platform oyununda önce zıplama hissi oturur,
              bir anlatı oyununda önce hikaye iskeleti.
            </p>
          </div>

          <div className="choice-grid">
            {GENRES.map((g) => (
              <button
                key={g.id}
                className={'choice' + (form.genreId === g.id ? ' selected' : '')}
                onClick={() => set({ genreId: g.id })}
              >
                <div className="choice-title">{g.name}</div>
                <div className="choice-desc">{g.summary}</div>
              </button>
            ))}
          </div>

          {genre && genre.fallbackWarning && (
            <div className="rules" style={{ marginTop: 18 }}>
              <div className="rules-title">
                <Icon name="alert" size={15} />
                Bu seçeneği seçmeden önce oku
              </div>
              <p style={{ fontSize: 13.5, margin: 0 }}>{genre.fallbackWarning}</p>
            </div>
          )}

          {genre && (
            <div className="card" style={{ marginTop: 18 }}>
              <div className="card-head">
                <h2>
                  <Icon name="alert" size={17} />
                  {genre.name} türünde en sık yapılan hatalar
                </h2>
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13.5 }}>
                {genre.traps.map((trap, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    {trap}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="page-head">
            <div className="eyebrow">Adım 3 / 7</div>
            <h1>Ne kadar büyük?</h1>
            <p className="sub">
              Bu, projenin bitip bitmeyeceğini belirleyen en önemli karardır. Solo
              geliştiricilerin çoğu, bu adımda gerçekçi olmadığı için projesini yarım
              bırakır.
            </p>
          </div>

          <div className="choice-grid">
            {SCALES.map((s) => (
              <button
                key={s.id}
                className={'choice' + (form.scaleId === s.id ? ' selected' : '')}
                onClick={() => set({ scaleId: s.id })}
              >
                <div className="choice-title">{s.name}</div>
                <div className="choice-desc">{s.summary}</div>
                {genre && (
                  <div className="choice-meta">{genre.contentUnits[s.id]}</div>
                )}
              </button>
            ))}
          </div>

          {genre && (
            <div className="hint-box" style={{ marginTop: 16 }}>
              <strong>{genre.name}</strong> türünde <strong>{scale.name}</strong> ölçek
              şu anlama geliyor: {genre.contentUnits[form.scaleId]}. Bu içeriğin her
              parçasını tek tek üretmen gerekecek.
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="page-head">
            <div className="eyebrow">Adım 4 / 7</div>
            <h1>Ne kadar zamanın var?</h1>
            <p className="sub">
              Burada iyimser olmak kendini kandırmaktır. Sürdürebileceğin sayıyı yaz,
              hedeflediğin sayıyı değil.
            </p>
          </div>

          <div className="card">
            <div className="field">
              <label>Günün geri kalanında ne yapıyorsun?</label>
              <div className="help">
                Günde kaç saat ayırabileceğin, bu cevaba bağlı. Sürdürülebilir
                üst sınırı tahmin etmek yerine sana soruyoruz.
              </div>
              <div className="choice-grid">
                {COMMITMENT_MODES.map((o) => (
                  <button
                    key={o.id}
                    className={
                      'choice' + (form.commitmentId === o.id ? ' selected' : '')
                    }
                    onClick={() => set({ commitmentId: o.id })}
                  >
                    <div className="choice-title">{o.name}</div>
                    <div className="choice-desc">{o.note}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="divider" />

            <div className="field-row">
              <div className="field">
                <label>Günde kaç dakika?</label>
                <div className="help">Kötü bir günde bile yapabileceğin süre.</div>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={form.dailyMinutes}
                  onChange={(e) => set({ dailyMinutes: Number(e.target.value) })}
                />
              </div>
              <div className="field">
                <label>Haftada kaç gün?</label>
                <div className="help">Yedi yazma. Ara vermek zorunda kalacaksın.</div>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={form.daysPerWeek}
                  onChange={(e) => set({ daysPerWeek: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="field">
              <label>Hedef bitiş tarihi</label>
              <div className="help">
                Tarih olmadan proje bitmez, sonsuza kadar sürer. Bir tarih seç.
              </div>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => set({ deadline: e.target.value })}
              />
            </div>

            {estimate && estimate.tempo.isOver && (
              <div className="rules" style={{ marginTop: 18, marginBottom: 0 }}>
                <div className="rules-title">
                  <Icon name="alert" size={15} />
                  Bu tempo sürdürülebilir görünmüyor
                </div>
                <p style={{ fontSize: 13.5, margin: '0 0 8px' }}>
                  {findOption(COMMITMENT_MODES, form.commitmentId).name} dedin.
                  Günde {form.dailyMinutes} dakika, haftada {form.daysPerWeek} gün,
                  bunun üstüne haftada {estimate.tempo.weeklyHours} saat demek.
                  Bu, senin durumun için sürdürülebilir kabul edilen{' '}
                  {Math.round((estimate.tempo.ceiling / 60) * 10) / 10} saatlik
                  günlük tavanın {Math.round((estimate.tempo.overBy / 60) * 10) / 10}{' '}
                  saat üstünde.
                </p>
                {estimate.tempo.scopeNeedsChange ? (
                  <p style={{ fontSize: 13.5, margin: 0 }}>
                    Ve tavanın altındaki hiçbir tempo bu kapsama yetmiyor. Bu, tempo
                    sorunu değil kapsam sorunu: günlük süreyi büyütmek kararı
                    yeşile çevirir ama planı gerçek yapmaz. Son adımdaki kapsam
                    seçeneklerini kullan.
                  </p>
                ) : (
                  <>
                    <p style={{ fontSize: 13.5, margin: '0 0 10px' }}>
                      Buna gerek de yok: aynı kapsam günde{' '}
                      <strong>
                        {estimate.tempo.comfortable || estimate.tempo.fitting} dakika
                      </strong>{' '}
                      ile de{' '}
                      {estimate.tempo.comfortable ? 'rahat sığıyor' : 'sınırda sığıyor'}.
                      Sürdürebileceğin tempoyu yazmak, sığdırmak için tempoyu
                      büyütmekten iyidir.
                    </p>
                    <button
                      className="btn"
                      onClick={() =>
                        set({
                          dailyMinutes:
                            estimate.tempo.comfortable || estimate.tempo.fitting,
                        })
                      }
                    >
                      Günlük süreyi{' '}
                      {estimate.tempo.comfortable || estimate.tempo.fitting} dakikaya
                      indir
                    </button>
                  </>
                )}
              </div>
            )}

            {estimate && (
              <>
                <div className="divider" />
                <h3 style={{ marginBottom: 10 }}>Bu ayarlarla elinde olacak süre</h3>
                <div className="number-row" style={{ marginTop: 0 }}>
                  <div className="number-box">
                    <div className="number-value">{estimate.available.weeklyHours}</div>
                    <div className="number-label">saat / hafta</div>
                  </div>
                  <div className="number-box">
                    <div className="number-value">{estimate.available.weeks}</div>
                    <div className="number-label">hafta kaldı</div>
                  </div>
                  <div className="number-box">
                    <div className="number-value">{estimate.available.hours}</div>
                    <div className="number-label">senin toplam çalışma saatin</div>
                  </div>
                </div>

                <h3 style={{ marginBottom: 10, marginTop: 20 }}>
                  Projenin ihtiyacı
                </h3>
                <div className="number-row" style={{ marginTop: 0 }}>
                  <div className="number-box">
                    <div className="number-value">{estimate.required}</div>
                    <div className="number-label">
                      {genre.name}, {scale.name} ölçek için gereken saat
                    </div>
                  </div>
                </div>

                <div className="hint-box">
                  Bu iki sayı birbirinden bağımsız. <strong>Projenin ihtiyacı</strong>{' '}
                  türe ve ölçeğe bağlıdır, tempoyu değiştirsen de değişmez.{' '}
                  <strong>Senin çalışma saatin</strong> ise tamamen tempoya ve tarihe
                  bağlıdır: günlük süreyi veya tarihi artırdıkça büyür. Son adımda bu
                  ikisini karşılaştıracağız.
                </div>

                <div className="hint-box">
                  Ham hesap {estimate.available.rawHours} saat veriyor, ama biz bunu
                  {' '}
                  {Math.round(estimate.available.effectiveFactor * 100)}
                  {'% '}
                  ile çarpıp {estimate.available.hours} saat kabul ediyoruz. Sebebi basit:
                  hastalık, iş yoğunluğu, motivasyon düşüşü ve araç sorunları planlanan
                  sürenin bir kısmını her zaman yer. Bu payı baştan ayırmak, sonradan
                  şaşırmaktan iyidir.
                  {estimate.available.overDailyMinutes > 0 && (
                    <>
                      {' '}
                      Bu oran normalde{' '}
                      {Math.round(estimate.realismFactor * 100)}%, ama sürdürülebilir
                      tavanın üstündeki günlük{' '}
                      {estimate.available.overDailyMinutes} dakika ayrıca ve daha
                      düşük katsayıyla sayıldığı için aşağı indi. Dolu bir günün
                      sonundaki saatler, günün ilk saatleriyle aynı işi çıkarmıyor.
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <div className="page-head">
            <div className="eyebrow">Adım 5 / 7</div>
            <h1>Koşulların neler?</h1>
            <p className="sub">
              Bu cevaplar süre tahminini ciddi biçimde değiştirir. Dürüst ol, kimse
              görmüyor.
            </p>
          </div>

          <div className="card">
            <div className="field">
              <label>Oyun geliştirme deneyimin</label>
              <div className="choice-grid">
                {EXPERIENCE_LEVELS.map((o) => (
                  <button
                    key={o.id}
                    className={'choice' + (form.experienceId === o.id ? ' selected' : '')}
                    onClick={() => set({ experienceId: o.id })}
                  >
                    <div className="choice-title">{o.name}</div>
                    <div className="choice-desc">{o.note}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="field">
              <label>Kullanacağın motor</label>
              <input
                value={form.engineName}
                onChange={(e) => set({ engineName: e.target.value })}
                placeholder="Godot, Unity, Unreal, GameMaker, kendi motorum..."
                style={{ marginBottom: 12 }}
              />
              <div className="choice-grid">
                {ENGINE_FAMILIARITY.map((o) => (
                  <button
                    key={o.id}
                    className={'choice' + (form.engineId === o.id ? ' selected' : '')}
                    onClick={() => set({ engineId: o.id })}
                  >
                    <div className="choice-title">{o.name}</div>
                    <div className="choice-desc">{o.note}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="field">
              <label>Sanat yaklaşımın</label>
              <div className="choice-grid">
                {ART_APPROACHES.map((o) => (
                  <button
                    key={o.id}
                    className={'choice' + (form.artId === o.id ? ' selected' : '')}
                    onClick={() => set({ artId: o.id })}
                  >
                    <div className="choice-title">{o.name}</div>
                    <div className="choice-desc">{o.note}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="field">
              <label>Çok oyunculu olacak mı?</label>
              <div className="help">
                Bu, listedeki en pahalı sorulardan biri. Çok oyunculu sonradan
                eklenen bir özellik değildir, her sistemi baştan etkiler.
              </div>
              <div className="choice-grid">
                {MULTIPLAYER_MODES.map((o) => (
                  <button
                    key={o.id}
                    className={
                      'choice' + (form.multiplayerId === o.id ? ' selected' : '')
                    }
                    onClick={() => set({ multiplayerId: o.id })}
                  >
                    <div className="choice-title">{o.name}</div>
                    <div className="choice-desc">{o.note}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="field">
              <label>Hangi platformda çıkacak?</label>
              <div className="help">
                Platform, sonradan eklenen bir şey değil: kontrol şemasını,
                arayüz yerleşimini ve test sürecini baştan belirler.
              </div>
              <div className="choice-grid">
                {PLATFORM_TARGETS.map((o) => (
                  <button
                    key={o.id}
                    className={
                      'choice' + (form.platformId === o.id ? ' selected' : '')
                    }
                    onClick={() => set({ platformId: o.id })}
                  >
                    <div className="choice-title">{o.name}</div>
                    <div className="choice-desc">{o.note}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="field">
              <label>Ekip</label>
              <div className="choice-grid">
                {TEAM_SIZES.map((o) => (
                  <button
                    key={o.id}
                    className={'choice' + (form.teamId === o.id ? ' selected' : '')}
                    onClick={() => set({ teamId: o.id })}
                  >
                    <div className="choice-title">{o.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 5 && estimate && (
        <div>
          <div className="page-head">
            <div className="eyebrow">Adım 6 / 7</div>
            <h1>Yapay zeka asistanları ve bütçe</h1>
            <p className="sub">
              Asistanlar hem süreyi hem parayı etkiler. İkisini de hesaba katmazsan
              tahmin eksik kalır.
            </p>
          </div>

          <div className="rules">
            <div className="rules-title">
              <Icon name="alert" size={15} />
              Önce bunu bil
            </div>
            <p style={{ fontSize: 13.5, margin: 0 }}>
              Asistanlar üretimi hızlandırır, kararı hızlandırmaz. Oyunun eğlenceli
              olup olmadığına karar vermek, dengeyi ayarlamak, oynanabilirlik testi
              yapmak ve cilalamak hâlâ tamamen senin işin. Bu proje türünde işin
              yaklaşık %{Math.round(estimate.ai.shares.karar * 100)} kadarı bu tür
              karar işidir ve hiçbir araçtan etkilenmez. Projelerin öldüğü yer de
              tam olarak orasıdır.
            </p>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Hangi asistanları kullanacaksın?</h2>
            </div>

            {AI_TOOLS.map((tool) => {
              const on = Boolean(form.aiTools[tool.id])
              const sharePercent = Math.round(
                (estimate.ai.shares[tool.discipline] || 0) * 100
              )
              return (
                <div
                  key={tool.id}
                  className="item"
                  style={{ marginBottom: 10, flexWrap: 'wrap' }}
                >
                  <input
                    type="checkbox"
                    className="check"
                    checked={on}
                    onChange={() => toggleTool(tool.id)}
                  />
                  <div className="item-body">
                    <div className="item-title">{tool.name}</div>
                    <div className="item-sub">
                      Bu projede işin yaklaşık %{sharePercent} kadarı bu işkolunda.{' '}
                      {tool.note}
                    </div>
                    {on && tool.warning && (
                      <div
                        className="item-sub"
                        style={{ marginTop: 6, color: 'var(--warn)' }}
                      >
                        {tool.warning}
                      </div>
                    )}
                  </div>
                  {on && (
                    <div style={{ width: 130 }}>
                      <input
                        type="number"
                        min="0"
                        placeholder="aylık"
                        value={
                          form.aiCosts[tool.id] === undefined
                            ? tool.defaultMonthly
                            : form.aiCosts[tool.id]
                        }
                        onChange={(e) => setToolCost(tool.id, e.target.value)}
                      />
                      <div className="tiny muted" style={{ marginTop: 3 }}>
                        aylık maliyet
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Diğer giderler</h2>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Diğer aylık giderler</label>
                <div className="help">Motor aboneliği, bulut, barındırma.</div>
                <input
                  type="number"
                  min="0"
                  value={form.otherMonthlyCost}
                  onChange={(e) => set({ otherMonthlyCost: Number(e.target.value) })}
                />
              </div>
              <div className="field">
                <label>Tek seferlik giderler</label>
                <div className="help">
                  Mağaza kayıt ücreti, hazır varlık paketleri, donanım.
                </div>
                <input
                  type="number"
                  min="0"
                  value={form.oneTimeCost}
                  onChange={(e) => set({ oneTimeCost: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="hint-box">
              Rakamları kendi para biriminde gir, sistem sadece toplar. Varsayılanlar
              yaklaşık dolar değerleridir, kendi aboneliklerine göre düzelt.
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>
                <Icon name="scale" size={17} />
                Bu seçimlerin etkisi
              </h2>
            </div>
            <div className="number-row" style={{ marginTop: 0 }}>
              <div className="number-box">
                <div className="number-value">{estimate.requiredWithoutAi}</div>
                <div className="number-label">asistansız gereken saat</div>
              </div>
              <div className="number-box">
                <div className="number-value">{estimate.required}</div>
                <div className="number-label">asistanlarla gereken saat</div>
              </div>
              <div className="number-box">
                <div className="number-value">
                  %{Math.max(0, estimate.ai.savedPercent)}
                </div>
                <div className="number-label">kazanç</div>
              </div>
            </div>

            {estimate.cost.total > 0 && (
              <div className="number-row">
                <div className="number-box">
                  <div className="number-value">{estimate.cost.monthlyTotal}</div>
                  <div className="number-label">aylık gider</div>
                </div>
                <div className="number-box">
                  <div className="number-value">{estimate.cost.months}</div>
                  <div className="number-label">ay sürecek</div>
                </div>
                <div className="number-box">
                  <div className="number-value">{estimate.cost.total}</div>
                  <div className="number-label">toplam maliyet</div>
                </div>
              </div>
            )}

            {estimate.cost.monthlyTotal > 0 && (
              <div className="hint-box">
                Dikkat et: bu giderler aylık. Tarihi ertelemek haftalık yükünü
                azaltır ama toplam maliyeti artırır. Her ek ay yaklaşık{' '}
                {estimate.cost.costPerExtraMonth} tutuyor. Kapsamı küçültmek ise
                hem süreyi hem parayı birden azaltır.
              </div>
            )}

            {estimate.cost.exceedsPlan && (
              <div className="rules">
                <div className="rules-title">
                  <Icon name="alert" size={15} />
                  Gerçek maliyet planladığından yüksek
                </div>
                <p style={{ fontSize: 13.5, margin: 0 }}>
                  Yukarıdaki {estimate.cost.total} rakamı hedef tarihine göre. Ama bu
                  kapsam bu tempoyla {estimate.cost.realisticMonths} ay sürer, hedef
                  tarihin değil. Abonelikler o süre boyunca devam edeceği için gerçek
                  maliyet yaklaşık{' '}
                  <strong>{estimate.cost.realisticTotal}</strong> olur. Kapsamı
                  küçültmek, ödeyeceğin parayı da küçültür.
                </p>
              </div>
            )}

            {form.experienceId === 'ilk' && form.aiTools.kod && (
              <div className="hint-box" style={{ borderLeftColor: 'var(--warn)' }}>
                İlk oyununu yapıyorsun ve kod asistanı seçtin. Sistem burada
                kasıtlı olarak küçük bir kazanç varsayıyor. Sebebi şu: üretilen kodu
                okuyup değerlendiremediğinde, anlamadığın kodun hatasını ayıklamak
                kazandığın süreyi büyük ölçüde geri alır. Hızlı bir prototipe
                ulaşıp sonra takılmak, yapay zeka ile çalışan yeni geliştiricilerde
                en sık görülen kalıptır.
              </div>
            )}
          </div>
        </div>
      )}

      {step === 6 && estimate && (
        <div>
          <div className="page-head">
            <div className="eyebrow">Adım 7 / 7</div>
            <h1>Gerçeklik kontrolü</h1>
            <p className="sub">
              Bu sayılar tahmin, ama uydurma değil. Aşağıdaki karar, projenin bitip
              bitmeyeceğini büyük ölçüde belirler.
            </p>
          </div>

          <div className={'verdict verdict-' + estimate.verdict.tone}>
            <div className="verdict-label">{estimate.verdict.label}</div>
            <div className="verdict-message">{estimate.verdict.message}</div>
          </div>

          <div className="number-row">
            <div className="number-box">
              <div className="number-value">{estimate.required}</div>
              <div className="number-label">gereken saat</div>
            </div>
            <div className="number-box">
              <div className="number-value">{estimate.available.hours}</div>
              <div className="number-label">elindeki saat</div>
            </div>
            <div className="number-box">
              <div className="number-value">
                {estimate.gapHours > 0 ? '-' + estimate.gapHours : '+' +
                  (estimate.available.hours - estimate.required)}
              </div>
              <div className="number-label">fark</div>
            </div>
          </div>

          {estimate.levers.length > 0 && estimate.verdict.id !== 'rahat' && (
            <div className="card">
              <div className="card-head">
                <h2>
                  <Icon name="scale" size={17} />
                  Seçeneklerin
                </h2>
              </div>
              <p className="card-note" style={{ marginBottom: 14 }}>
                Her seçeneğin yanındaki sayı hesaplanmış gerçek sayıdır. Birine tıklarsan
                ayarların güncellenir.
              </p>
              {estimate.levers.map((lever) => (
                <button
                  key={lever.id}
                  className={'lever lever-' + lever.tone}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    cursor: lever.patch ? 'pointer' : 'default',
                  }}
                  onClick={() => lever.patch && set(lever.patch)}
                  disabled={!lever.patch}
                >
                  <Icon
                    name={lever.tone === 'good' ? 'check' : lever.tone === 'bad' ? 'x' : 'alert'}
                    size={17}
                    className={
                      lever.tone === 'good'
                        ? 'gate-mark ok'
                        : lever.tone === 'bad'
                          ? 'gate-mark fail'
                          : ''
                    }
                  />
                  <div className="lever-body">
                    <div className="lever-title">{lever.title}</div>
                    <div className="lever-detail">{lever.detail}</div>
                    {lever.tone === 'good' && (
                      <div
                        className="tiny"
                        style={{ marginTop: 6, color: 'var(--good)', fontWeight: 600 }}
                      >
                        Tıklayınca uygulanır
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="card">
            <div className="card-head">
              <h2>
                <Icon name="map" size={17} />
                Bu saatler nereye gidiyor
              </h2>
            </div>
            <div className="stack">
              {hoursByPhase(estimate.required)
                .filter((p) => p.percent > 0)
                .map((p) => (
                  <div key={p.id} className="row">
                    <div style={{ width: 130, fontSize: 13.5 }}>{p.name}</div>
                    <div className="bar-track" style={{ flex: 1 }}>
                      <div className="bar-fill" style={{ width: p.percent * 2.5 + '%' }} />
                    </div>
                    <div
                      className="tiny muted"
                      style={{ width: 80, textAlign: 'right' }}
                    >
                      {p.hours} saat
                    </div>
                  </div>
                ))}
            </div>
            <p className="card-note" style={{ marginTop: 12 }}>
              Dikkat et: tasarım ve prototip birlikte toplam sürenin dörtte birini alıyor.
              Bu bir israf değil, üretimin geri kalanının çöpe gitmesini engelleyen
              yatırımdır.
            </p>
          </div>

          {estimate.verdict.id === 'imkansiz' && (
            <div className="rules">
              <div className="rules-title">
                <Icon name="alert" size={15} />
                Bu haliyle başlamanı önermiyorum
              </div>
              <p style={{ fontSize: 13.5, margin: 0 }}>
                Yine de başlayabilirsin, engellemiyorum. Ama bu kapsamla bu tarihte
                bitirme ihtimalin çok düşük. Yukarıdaki seçeneklerden birini uygularsan
                bitirme ihtimalin ciddi biçimde artar. Yarım kalan bir proje, küçük ama
                bitmiş bir projeden çok daha az şey öğretir.
              </p>
            </div>
          )}

          <div className="card">
            <div className="card-head">
              <h2>Özet</h2>
            </div>
            <div className="stack small">
              <div className="spread">
                <span className="muted">Oyun</span>
                <strong>{form.name}</strong>
              </div>
              <div className="spread">
                <span className="muted">Tür</span>
                <strong>{genre.name}</strong>
              </div>
              <div className="spread">
                <span className="muted">Ölçek</span>
                <strong>{scale.name}</strong>
              </div>
              <div className="spread">
                <span className="muted">Tempo</span>
                <strong>
                  Haftada {form.daysPerWeek} gün, günde {form.dailyMinutes} dakika
                </strong>
              </div>
              <div className="spread">
                <span className="muted">Hedef tarih</span>
                <strong>{formatDate(form.deadline)}</strong>
              </div>
              {estimate.cost.total > 0 && (
                <div className="spread">
                  <span className="muted">Tahmini toplam maliyet</span>
                  <strong>
                    {estimate.cost.total} ({estimate.cost.monthlyTotal} / ay x{' '}
                    {estimate.cost.months} ay
                    {estimate.cost.oneTime > 0
                      ? ' + ' + estimate.cost.oneTime + ' tek seferlik'
                      : ''}
                    )
                  </strong>
                </div>
              )}
              {estimate.ai.savedPercent > 0 && (
                <div className="spread">
                  <span className="muted">Asistan kazancı</span>
                  <strong>
                    %{estimate.ai.savedPercent} ({estimate.requiredWithoutAi} saatten{' '}
                    {estimate.required} saate)
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="wizard-nav">
        <button
          className="btn btn-ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <Icon name="chevronLeft" size={16} />
          Geri
        </button>

        {step < STEP_COUNT - 1 ? (
          <button
            className="btn btn-primary"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canContinue}
          >
            Devam
            <Icon name="chevronRight" size={16} />
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => onFinish(form)}>
            <Icon name="flag" size={16} />
            Projeyi başlat
          </button>
        )}
      </div>
    </div>
  )
}
