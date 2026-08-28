import Icon from './Icon.jsx'

// Temaya uyan sayı kutusu.
//
// NEDEN BİLEŞEN YAZILDI
//
// Diğer form elemanlarında (açılır liste, tarih, onay kutusu) yerel
// elemanı biçimlendirmek yetti: `appearance: none` görünümü alıyor,
// davranış tarayıcıda kalıyor. Sayı kutusunda bu yol denendi ve
// ÇALIŞMADI: yerel yukarı/aşağı düğmesini gizleyince Chrome'un iki
// bölgeli tıklama davranışı bozuluyor, alt yarı çalışırken üst yarı
// çalışmıyordu. Tarayıcıda ölçülerek görüldü.
//
// Bu yüzden burada okları kendimiz çiziyoruz. Ama yazı alanı hâlâ
// yerel `input type="number"`: klavye okları, sayı klavyesi, tekerlek,
// yapıştırma ve ekran okuyucu davranışı olduğu gibi duruyor. Sadece
// tıklanabilir okları biz koyuyoruz.

// Bir adım artır veya azalt.
//
// Yerel `stepUp()` kullanılmıyor: React kontrollü bir alanda DOM'u
// doğrudan değiştirmek durumu bozar, çünkü React o değişikliği görmez.
// Hesap burada yapılıp yukarı bildiriliyor.
function adimla(value, step, min, max, yon) {
  const adim = Number(step) || 1
  const mevcut = value === '' || value === undefined || value === null ? 0 : Number(value)
  if (Number.isNaN(mevcut)) return value

  let yeni = mevcut + yon * adim
  if (min !== undefined && min !== '' && yeni < Number(min)) yeni = Number(min)
  if (max !== undefined && max !== '' && yeni > Number(max)) yeni = Number(max)

  // 0.1 + 0.2 = 0.30000000000000004 gibi kayan nokta artıklarını temizle.
  return String(Math.round(yeni * 1e6) / 1e6)
}

export default function NumberField({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  disabled,
  ...rest
}) {
  const artir = () => onChange(adimla(value, step, min, max, 1))
  const azalt = () => onChange(adimla(value, step, min, max, -1))

  const enBuyukte = max !== undefined && max !== '' && Number(value) >= Number(max)
  const enKucukte = min !== undefined && min !== '' && Number(value) <= Number(min)

  return (
    <div className="number-field">
      <input
        type="number"
        value={value === undefined || value === null ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        {...rest}
      />
      {/*
        Oklar klavyeyle gezilmiyor (tabIndex -1): yazı alanı zaten
        odakta ve yukarı/aşağı tuşları aynı işi yapıyor. İki fazladan
        durak eklemek klavyeyle gezinmeyi yavaşlatırdı.
      */}
      <div className="number-steps">
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled || enBuyukte}
          onClick={artir}
        >
          <Icon name="chevronUp" size={13} />
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled || enKucukte}
          onClick={azalt}
        >
          <Icon name="chevronDown" size={13} />
        </button>
      </div>
    </div>
  )
}
