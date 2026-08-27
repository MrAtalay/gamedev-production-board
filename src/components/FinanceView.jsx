import { useState } from 'react'
import Icon from './Icon.jsx'
import { STORES, REVENUE_FIELDS } from '../data/publishing.js'
import { breakEven, scenarios, revenueSettings } from '../lib/money.js'
import { CURRENCIES, fetchRate, loadCachedRate } from '../lib/rates.js'

function money(value, rate, currency) {
  const n = Math.round(value)
  if (!rate || currency === 'USD') return n + ' USD'
  return n + ' USD (' + Math.round(n * rate).toLocaleString('tr-TR') + ' ' + currency + ')'
}

export default function FinanceView({ project, actions }) {
  const [currency, setCurrency] = useState('TRY')
  // Sadece bu oturumda alınan kur. Para birimi değişince kendiliğinden
  // geçersiz olur, o yüzden ayrıca sıfırlamaya gerek yok.
  const [fetched, setFetched] = useState(null)
  const [loading, setLoading] = useState(false)
  const [manual, setManual] = useState('')

  const be = breakEven(project)
  const rows = scenarios(project)
  const r = revenueSettings(project.profile)

  // Kur bilgisi render sırasında türetiliyor: önce bu oturumda alınan,
  // yoksa önbellekteki.
  const rateInfo =
    fetched && fetched.currency === currency ? fetched : loadCachedRate(currency)
  const failed = Boolean(fetched && fetched.currency === currency && fetched.error)

  async function refresh() {
    setLoading(true)
    const result = await fetchRate(currency)
    setLoading(false)
    setFetched(result ? { ...result, currency } : { currency, error: true })
  }

  const activeRate =
    manual !== ''
      ? Number(manual)
      : rateInfo && !rateInfo.error
        ? rateInfo.rate
        : null

  function setRevenue(key, value) {
    actions.setProfile({
      revenue: { ...(project.profile.revenue || {}), [key]: value },
    })
  }

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Bütçe ve geri dönüş</div>
        <h1>Bu proje parasını çıkarır mı?</h1>
        <p className="sub">
          Saat ve para giderken, bu ekran paranın geri gelip gelmeyeceğini soruyor.
          Aşağıdaki sayıların çoğu senin tahminin, sistem sadece hesabı yapıyor.
        </p>
      </div>

      <div className="rules">
        <div className="rules-title">
          <Icon name="alert" size={15} />
          Önce dürüst olalım
        </div>
        <p style={{ fontSize: 13.5, margin: 0 }}>
          Bağımsız oyunların çoğu masrafını çıkarmaz. Steam'de yayınlanan oyunların
          büyük kısmı birkaç yüz kopya satar ve medyan gelir düşüktür. Bu bir
          karamsarlık değil, planlama girdisi: ilk oyununu para kazanmak için değil,
          bitirmeyi öğrenmek için yap. Aşağıdaki "beklenen satış" alanına iyimser bir
          sayı yazmak, sadece kendini kandırmanı sağlar.
        </p>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>
            <Icon name="scale" size={17} />
            Para birimi
          </h2>
        </div>
        <p className="card-note" style={{ marginBottom: 12 }}>
          Hesaplar dolar üzerinden yapılır. İstersen güncel kurla kendi para
          biriminde de görebilirsin. Kur bilgisi olmadan da her şey çalışır.
        </p>
        <div className="btn-row">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{ width: 120 }}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button className="btn btn-sm" onClick={refresh} disabled={loading}>
            <Icon name="download" size={15} />
            {loading ? 'Alınıyor...' : 'Güncel kuru al'}
          </button>
          <input
            type="number"
            step="0.01"
            placeholder="veya kuru elle gir"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            style={{ width: 190 }}
          />
        </div>

        {rateInfo && !rateInfo.error && manual === '' && (
          <p className="tiny muted" style={{ marginTop: 10 }}>
            1 USD = {rateInfo.rate} {currency}, kaynak {rateInfo.source}
            {rateInfo.stale && ', bu kur 12 saatten eski'}
          </p>
        )}
        {failed && (
          <p className="tiny" style={{ marginTop: 10, color: 'var(--warn)' }}>
            Kur alınamadı. İnternet yok veya servis yanıt vermiyor. Kuru elle
            girebilirsin, hesapların geri kalanı etkilenmez.
          </p>
        )}
      </div>

      <div className="card">
        <div className="card-head">
          <h2>
            <Icon name="rocket" size={17} />
            Nerede yayınlayacaksın?
          </h2>
        </div>
        <div className="choice-grid">
          {STORES.map((s) => (
            <button
              key={s.id}
              className={
                'choice' + ((project.profile.storeId || 'steam') === s.id ? ' selected' : '')
              }
              onClick={() => actions.setProfile({ storeId: s.id })}
            >
              <div className="choice-title">{s.name}</div>
              <div className="choice-desc">{s.note}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Gelir varsayımların</h2>
        </div>

        {REVENUE_FIELDS.map((field) => (
          <div className="field" key={field.key}>
            <label>
              {field.label}
              {field.verify && (
                <span className="chip chip-warn" style={{ marginLeft: 8 }}>
                  doğrula
                </span>
              )}
            </label>
            <div className="help">{field.help}</div>
            <input
              type="number"
              min="0"
              step={field.percent ? 0.01 : field.step || 1}
              value={r[field.key]}
              onChange={(e) => setRevenue(field.key, Number(e.target.value))}
            />
            {field.percent && (
              <div className="tiny muted" style={{ marginTop: 4 }}>
                yüzde {Math.round((Number(r[field.key]) || 0) * 100)} olarak
                hesaplanıyor
              </div>
            )}
          </div>
        ))}

        <div className="field">
          <label>Beklediğin satış adedi</label>
          <div className="help">
            İyimser değil, gerçekçi bir sayı yaz. Bu sayı sadece senin tahminin.
          </div>
          <input
            type="number"
            min="0"
            value={r.expectedUnits}
            onChange={(e) => setRevenue('expectedUnits', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>
            <Icon name="list" size={17} />
            Bir kopya sattığında ne oluyor
          </h2>
        </div>
        <p className="card-note" style={{ marginBottom: 14 }}>
          Kayıpların nerede olduğunu görmek, tek bir sonuç sayısından daha
          öğreticidir.
        </p>
        <ul className="item-list">
          {be.chain.steps.map((step, i) => (
            <li key={i} className={'item' + (i === 0 ? '' : ' alt')}>
              <div className="item-body">
                <div className="item-title">{step.label}</div>
                {step.note && <div className="item-sub">{step.note}</div>}
              </div>
              <strong>{step.value.toFixed(2)} USD</strong>
            </li>
          ))}
        </ul>
        <div className="hint-box" style={{ marginTop: 14 }}>
          Liste fiyatın {Number(r.price).toFixed(2)} dolar, ama bir satıştan cebine
          giren <strong>{be.netPerUnit.toFixed(2)} dolar</strong>. Aradaki fark
          bölgesel fiyatlandırma, indirim, iade, mağaza payı ve vergilerden geliyor.
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>
            <Icon name="target" size={17} />
            Başabaş noktası
          </h2>
        </div>

        <div className="number-row" style={{ marginTop: 0 }}>
          <div className="number-box">
            <div className="number-value">{Math.round(be.totalCost)}</div>
            <div className="number-label">toplam maliyet (USD)</div>
          </div>
          <div className="number-box">
            <div className="number-value">{be.netPerUnit.toFixed(2)}</div>
            <div className="number-label">kopya başına net</div>
          </div>
          <div className="number-box">
            <div className="number-value">
              {be.unitsToBreakEven === null ? '-' : be.unitsToBreakEven}
            </div>
            <div className="number-label">başabaş için gereken satış</div>
          </div>
        </div>

        <p className="card-note">
          Maliyetin {Math.round(be.recurringCost)} dolar tekrar eden gider ve{' '}
          {be.storeFee} dolar mağaza kayıt ücretinden oluşuyor. Tekrar eden gider,
          projenin gerçekten süreceği zamana göre hesaplandı, hedef tarihine göre
          değil.
        </p>

        {activeRate && currency !== 'USD' && (
          <div className="hint-box">
            Kendi para biriminde: toplam maliyet{' '}
            {money(be.totalCost, activeRate, currency)}, başabaş için{' '}
            {be.unitsToBreakEven} satış gerekiyor.
          </div>
        )}

        {be.feeRefundThreshold && (
          <div className="hint-box">
            {be.chain.store.name} kayıt ücreti, {be.feeRefundThreshold} dolar brüt
            gelire ulaşınca iade ediliyor. Beklediğin {be.expectedUnits} satışta brüt
            gelirin yaklaşık {be.grossAtExpected} dolar, yani ücret{' '}
            {be.feeRefunded ? 'iade edilir' : 'iade edilmez'}.
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Beklentin gerçekleşirse</h2>
        </div>
        <div className={'verdict verdict-' + (be.profitable ? 'good' : 'bad')}>
          <div className="verdict-label">
            {be.profitable ? 'Masrafını çıkarır' : 'Masrafını çıkarmaz'}
          </div>
          <div className="verdict-message">
            {be.expectedUnits} satışta net gelirin {be.expectedRevenue} dolar,
            maliyetin {Math.round(be.totalCost)} dolar. Sonuç:{' '}
            {be.expectedProfit >= 0 ? '+' : ''}
            {be.expectedProfit} dolar.
          </div>
        </div>

        <div className="hint-box">
          Bu projeye {be.requiredHours} saat harcayacaksın. Beklentin gerçekleşirse
          saat başına <strong>{be.hourlyReturn.toFixed(2)} dolar</strong> kazanmış
          olacaksın. Bu sayı çoğu bağımsız geliştiricinin bakmadığı sayıdır ve
          genellikle asgari ücretin altındadır. Bunu bilerek devam etmek, bilmeden
          devam etmekten iyidir: ilk oyunun yatırımı paraya değil, öğrenmeye ve
          bitirmiş olmaya yapılır.
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Farklı satış senaryoları</h2>
        </div>
        <ul className="item-list">
          {rows.map((row) => (
            <li key={row.units} className={'item' + (row.covers ? '' : ' alt')}>
              <div className="item-body">
                <div className="item-title">{row.units} satış</div>
                <div className="item-sub">
                  net gelir {row.revenue} dolar
                  {activeRate && currency !== 'USD'
                    ? ', yaklaşık ' +
                      Math.round(row.revenue * activeRate).toLocaleString('tr-TR') +
                      ' ' +
                      currency
                    : ''}
                </div>
              </div>
              <span className={'chip ' + (row.covers ? 'chip-good' : 'chip-warn')}>
                {row.profit >= 0 ? '+' : ''}
                {row.profit} USD
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>
            <Icon name="alert" size={17} />
            Bu hesabın sınırları
          </h2>
        </div>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13.5 }}>
          <li style={{ marginBottom: 6 }}>
            Stopaj ve gelir vergisi alanlarına varsayılan olarak sıfır yazılı. Bunlar
            ülkene, şirket türüne ve vergi anlaşmalarına göre değişir. Uydurma bir
            oran yazmaktansa boş bırakmayı tercih ettim: yanlış bir sayı, hiç sayı
            olmamasından kötüdür. Kendi durumunu öğrenip gir.
          </li>
          <li style={{ marginBottom: 6 }}>
            Mağaza ücretleri ve payları değişebilir. Yayına yaklaştığında mağazanın
            kendi belgelerinden güncel oranları doğrula.
          </li>
          <li style={{ marginBottom: 6 }}>
            Kur bilgisi bilgilendirme amaçlıdır. Gerçek ödemede bankanın uyguladığı
            kur ve komisyon farklı olacaktır.
          </li>
          <li>
            Beklenen satış adedi tamamen senin tahminin. Sistem bu sayıyı
            doğrulayamaz, sadece sonucunu hesaplar.
          </li>
        </ul>
      </div>
    </div>
  )
}
