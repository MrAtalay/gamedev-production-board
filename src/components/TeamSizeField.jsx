import NumberField from './NumberField.jsx'
import { TEAM_SIZE_MAX, TEAM_SIZE_TRUSTED } from '../data/options.js'
import { teamSize, teamMultiplier } from '../lib/estimate.js'

// Kaç kişi olduğunuzu soran alan.
//
// Önce üç kademeli bir açılır listeydi ("yalnızım / iki kişiyiz / üç veya
// dört kişiyiz") ve dörtten fazlası hiç sorulamıyordu. Sayı doğrudan
// giriliyor, çarpan eğriden türetiliyor.
export default function TeamSizeField({ profile, onChange }) {
  const kisi = teamSize(profile)
  const carpan = teamMultiplier(profile)
  const eskiKayit = !(Number(profile.teamSize) >= 1)
  const uzatma = kisi > TEAM_SIZE_TRUSTED

  return (
    <div className="field">
      <label>Kaç kişisiniz (kendin dahil)</label>
      <NumberField
        value={String(kisi)}
        onChange={(v) => onChange({ teamSize: Number(v) || 1 })}
        min={1}
        max={TEAM_SIZE_MAX}
      />

      <p className="card-note" style={{ marginTop: 8 }}>
        {kisi === 1
          ? 'Yalnız çalışıyorsun, çarpan 1,00: işin tamamı sende.'
          : kisi +
            ' kişi için çarpan ' +
            carpan.toFixed(2).replace('.', ',') +
            '. Kişi sayısı işi düz bölmez, koordinasyon maliyeti çıkarır: ' +
            'iki kişi işi yarıya değil 0,65\'e indirir.'}
      </p>

      {uzatma && (
        <div className="hint-box" style={{ marginTop: 10 }}>
          <strong>Bu sayı ölçümün dışında.</strong> Çarpan tablosu dört
          kişiye kadar gözleme dayanıyor, {TEAM_SIZE_TRUSTED} kişiden
          sonrası aynı eğrinin uzatılması. Uzatma, koordinasyonun bedava
          olduğunu varsayar ve gerçekte varsaymaz. Bu araç solo ve küçük
          ekipler için yazıldı; bu büyüklükte bir ekipte tahmini panonun
          değil, ekibin kendi ölçümünün vermesi gerekir.
        </div>
      )}

      {eskiKayit && (
        <div className="hint-box" style={{ marginTop: 10 }}>
          <strong>Bu proje eski ekip tablosuyla kurulmuş.</strong> O tabloda
          üç ve dört kişi aynı kademedeydi ve ikisi de 0,45 alıyordu. Kişi
          sayısı artık tek tek soruluyor, bu yüzden üç kişi 0,51, dört kişi
          0,42. Sayıyı bir kez onaylaman yeterli: kutuya doğru kişi sayısını
          yaz, kayıt yeni hesaba geçsin.
        </div>
      )}
    </div>
  )
}
