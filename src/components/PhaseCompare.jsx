import Icon from './Icon.jsx'
import { fazKarsilastirmasi, genelKarsilastirma, duzeltilmisKalan } from '../lib/tempo.js'

const DURUM_ETIKET = {
  bitti: 'Bitti',
  devam: 'Devam ediyor',
  baslamadi: 'Başlamadı',
}

// Faz başına tahmin ve gerçek.
//
// Buradaki en önemli kural şu: devam eden bir fazda tahminin altında
// kalmak iyi haber değildir, sadece işin bitmemiş olmasıdır. O yüzden
// sapma yalnızca kapısı geçilmiş fazlarda gösteriliyor.
export default function PhaseCompare({ project }) {
  const { satirlar, dagitilmamisSaat } = fazKarsilastirmasi(project)
  const genel = genelKarsilastirma(project)
  const kalan = duzeltilmisKalan(project)

  const olculenVar = satirlar.some((s) => s.olculdu)

  return (
    <div className="card">
      <div className="card-head">
        <h2>
          <Icon name="scale" size={17} />
          Faz başına tahmin ve gerçek
        </h2>
        {genel.sapmaKatsayisi ? (
          <span className={'chip ' + (genel.sapmaKatsayisi > 1.15 ? 'chip-warn' : 'chip-good')}>
            sapma katsayın {genel.sapmaKatsayisi}
          </span>
        ) : null}
      </div>

      {!olculenVar ? (
        <p className="empty">
          Henüz adıma bağlı çalışma kaydı yok. Bugün ekranındaki sayacı
          kullanarak süre kaydettiğinde, harcanan saat otomatik olarak fazlara
          dağılır ve burada tahminle karşılaştırılır.
        </p>
      ) : (
        <table className="compare-table">
          <thead>
            <tr>
              <th>Faz</th>
              <th>Durum</th>
              <th>Tahmin</th>
              <th>Gerçek</th>
              <th>Sapma</th>
            </tr>
          </thead>
          <tbody>
            {satirlar.map((s) => (
              <tr key={s.id}>
                <td>{s.ad}</td>
                <td>
                  <span
                    className={
                      'chip ' +
                      (s.durum === 'bitti' ? 'chip-good' : s.durum === 'devam' ? 'chip-accent' : '')
                    }
                  >
                    {DURUM_ETIKET[s.durum]}
                  </span>
                </td>
                <td>{s.tahminSaat} sa</td>
                <td>{s.olculdu ? s.gercekSaat + ' sa' : '-'}</td>
                <td>
                  {s.sapmaSaat === null ? (
                    <span className="muted">
                      {s.durum === 'bitti' ? 'ölçülmedi' : 'faz bitmeden kıyaslanmaz'}
                    </span>
                  ) : (
                    <span className={s.sapmaSaat > 0 ? 'chip chip-warn' : 'chip chip-good'}>
                      {s.sapmaSaat > 0 ? '+' : ''}
                      {s.sapmaSaat} sa
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {dagitilmamisSaat > 0 ? (
        <p className="tiny muted" style={{ marginTop: 10 }}>
          Ayrıca {dagitilmamisSaat} saat, bir adıma bağlanmamış kayıtlardan
          geliyor. Bu süre gerçek çalışmadır ama hangi faza ait olduğu bilinmediği
          için tabloya dağıtılmadı.
        </p>
      ) : null}

      {genel.yeterliVeri ? (
        <>
          <div className="divider" />
          <div className="rules-title">Ne anlama geliyor</div>
          <p className="tiny muted">
            Biten {genel.bitmisFazSayisi} fazda tahmin {genel.bitmisTahminSaat} saatti,
            gerçekleşen {genel.bitmisGercekSaat} saat oldu. Yani tahminlerin
            ortalama {genel.sapmaKatsayisi} katına çıkıyor.
            {kalan
              ? ' Kalan fazların tahmini ' +
                kalan.kalanTahminSaat +
                ' saat; bu katsayıyla düzeltilince ' +
                kalan.duzeltilmisSaat +
                ' saat eder. Elindeki süre ' +
                kalan.eldekiSaat +
                ' saat.'
              : ''}
          </p>
          {kalan && !kalan.sigiyorMu ? (
            <p className="tiny" style={{ marginTop: 8, color: 'var(--danger)' }}>
              Düzeltilmiş tahmin elindeki süreyi aşıyor. Bu, kendi ölçtüğün
              sapmaya dayanan bir sayı, dışarıdan bir varsayım değil. Kapsam
              ekranındaki kaldıraçlar bu farkı kapatmak için var.
            </p>
          ) : null}
        </>
      ) : (
        <p className="tiny muted" style={{ marginTop: 10 }}>
          Sapma katsayısı için en az iki bitmiş faz gerekiyor. Tek fazdan
          çıkarılan katsayı yanıltıcı olur, o yüzden hesaplanmıyor.
        </p>
      )}
    </div>
  )
}
