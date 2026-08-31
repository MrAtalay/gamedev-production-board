import Icon from './Icon.jsx'
import { genelKarsilastirma, fazKarsilastirmasi } from '../lib/tempo.js'
import { formatDate } from '../lib/estimate.js'

// Post-mortem özeti: tahmin ve gerçek karşılaştırması.
//
// Bu ekran, "Tahmin ve gerçek karşılaştırması" teslimatının aritmetiğini
// kullanıcı yerine yapar. Yorumu yapmaz: bir sonraki projede ne
// değiştireceğine kullanıcı karar verir, teslimatın asıl işi odur.
export default function PostmortemSummary({ project }) {
  const genel = genelKarsilastirma(project)
  const { satirlar } = fazKarsilastirmasi(project)
  const olculenler = satirlar.filter((s) => s.olculdu)

  const kiyasTahmin = genel.ilkTahminSaat !== null ? genel.ilkTahminSaat : genel.toplamTahminSaat
  const oran =
    kiyasTahmin > 0 ? Math.round((genel.toplamGercekSaat / kiyasTahmin) * 100) / 100 : null

  return (
    <div className="card">
      <div className="card-head">
        <h2>
          <Icon name="scale" size={17} />
          Tahmin ve gerçek
        </h2>
        <span className="chip">hesaplandı</span>
      </div>

      {genel.toplamGercekSaat === 0 ? (
        <p className="empty">
          Kayıtlı çalışma süresi yok, o yüzden karşılaştırılacak bir gerçek de
          yok. Bu teslimatı elle doldurman gerekiyor.
        </p>
      ) : (
        <>
          <div className="number-row" style={{ marginTop: 0 }}>
            <div className="number-box">
              <div className="number-value">{kiyasTahmin}</div>
              <div className="number-label">
                {genel.ilkTahminSaat !== null ? 'ilk tahmin saat' : 'şu anki tahmin saat'}
              </div>
            </div>
            <div className="number-box">
              <div className="number-value">{genel.toplamGercekSaat}</div>
              <div className="number-label">gerçekleşen saat</div>
            </div>
            <div className="number-box">
              <div className="number-value">{oran !== null ? oran : '-'}</div>
              <div className="number-label">gerçek / tahmin oranı</div>
            </div>
          </div>

          {genel.ilkTahminSaat === null ? (
            <p className="tiny muted">
              Bu projede ilk tahmin kaydedilmemiş, çünkü proje bu özellik
              eklenmeden önce açılmış. Yukarıdaki tahmin şu anki profile göre
              hesaplanan tahmindir. Kapsamı yol boyunca değiştirdiysen bu sayı
              ilk günkü sayı değildir.
            </p>
          ) : (
            <p className="tiny muted">
              İlk tahmin {formatDate(genel.ilkTahminTarihi.slice(0, 10))} tarihinde
              kaydedildi.
              {genel.tahminDegistiMi
                ? ' Şu anki profile göre tahmin ' +
                  genel.toplamTahminSaat +
                  ' saat, yani kapsam yol boyunca değişmiş. Karşılaştırma ilk tahmine göre yapıldı.'
                : ' Kapsam yol boyunca değişmemiş.'}
            </p>
          )}

          {oran !== null ? (
            <>
              <div className="divider" />
              <div className="rules-title">Bir sonraki proje için</div>
              <p className="tiny muted">
                Tahminlerin gerçeğin {oran} katı çıktı.
                {oran > 1
                  ? ' Bir sonraki projede süre tahminlerini ' +
                    oran +
                    ' ile çarpmak, bu projede öğrendiğin sapmayı hesaba katar.'
                  : oran < 1
                    ? ' Bu projede tahminlerin gerçekten yüksekmiş. Aynı oranı bir sonraki projeye taşımadan önce, işin kapsamının küçülüp küçülmediğine bak.'
                    : ' Tahminlerin tuttu.'}
              </p>
              <p className="tiny muted" style={{ marginTop: 8 }}>
                Bu oran {olculenler.length} fazda ölçülen süreden geliyor.
                {genel.dagitilmamisSaat > 0
                  ? ' Ayrıca ' +
                    genel.dagitilmamisSaat +
                    ' saat bir adıma bağlanmamış kayıttan geliyor ve toplam gerçeğe dahil, faz dağılımına değil.'
                  : ''}
              </p>
            </>
          ) : null}

          <div className="divider" />
          <div className="rules-title">Faz başına</div>
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
                  <td>{s.katsayi !== null ? s.katsayi : <span className="muted">faz bitmedi</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
