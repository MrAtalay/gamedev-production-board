import { useState } from 'react'
import Icon from './Icon.jsx'
import { phaseIndex } from '../data/phases.js'
import { computeEstimate } from '../lib/estimate.js'
import { duzeltilmisKalan } from '../lib/tempo.js'

function AddRow({ placeholder, onAdd, disabled }) {
  const [text, setText] = useState('')

  function submit() {
    if (text.trim() === '') return
    onAdd(text.trim())
    setText('')
  }

  return (
    <div className="row" style={{ marginTop: 12 }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
        }}
      />
      <button className="btn btn-sm" onClick={submit} disabled={disabled}>
        <Icon name="plus" size={15} />
        Ekle
      </button>
    </div>
  )
}

export default function ScopeView({ project, actions }) {
  const estimate = computeEstimate(project.profile)
  const scopeLocked = phaseIndex(project.currentPhaseId) >= phaseIndex('uretim')
  const outCount = project.scope.out.length
  // Ölçülen sapmaya göre düzeltilmiş kalan süre. Yeterli veri yoksa null
  // döner ve bu bölüm hiç gösterilmez.
  const olculen = duzeltilmisKalan(project)

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Kapsam</div>
        <h1>Ne var, ne yok</h1>
        <p className="sub">
          Kapsam şişmesi, bağımsız oyunları öldüren bir numaralı sebep. Neyi
          yapmayacağını yazmadıysan hiçbir şey kapsam dışı değildir.
        </p>
      </div>

      {scopeLocked && (
        <div className="rules">
          <div className="rules-title">
            <Icon name="lock" size={15} />
            Kapsam kilitli
          </div>
          <p style={{ fontSize: 13.5, margin: 0 }}>
            Üretim fazındasın. Bu fazda kapsama yeni madde eklenmez. Aklına gelen her
            fikir buzdolabına gider ve bu proje bittikten sonra değerlendirilir. Kilidi
            zorlamak istiyorsan önce süre tahminini güncellemen gerekir.
          </p>
        </div>
      )}

      <div className="card card-tight">
        <div className="spread">
          <span className="small muted">Kapsam durumu</span>
          <span className={'chip chip-' + estimate.verdict.tone.replace('good', 'good')}>
            {estimate.verdict.label}
          </span>
        </div>
        <p className="small" style={{ marginTop: 10 }}>
          Gereken {estimate.required} saat, elindeki {estimate.available.hours} saat.
          {estimate.gapHours > 0
            ? ' Aradaki fark ' + estimate.gapHours + ' saat.'
            : ' Kapsam süreye sığıyor.'}
        </p>
      </div>

      {olculen && (
        <div className="card card-tight">
          <div className="spread">
            <span className="small muted">Ölçülen tempona göre</span>
            <span className={'chip ' + (olculen.sigiyorMu ? 'chip-good' : 'chip-bad')}>
              {olculen.sigiyorMu ? 'Sığıyor' : 'Sığmıyor'}
            </span>
          </div>
          <p className="small" style={{ marginTop: 10 }}>
            Yukarıdaki sayı tahmine dayanıyor. Bu sayı ise senin kendi kaydına:
            biten fazlarda tahminlerin {olculen.katsayi} katına çıktı. Aynı oran
            devam ederse kalan {olculen.kalanTahminSaat} saatlik iş gerçekte
            yaklaşık <strong>{olculen.duzeltilmisSaat} saat</strong> sürer.
            Elindeki süre {olculen.eldekiSaat} saat.
          </p>
          <p className="tiny muted" style={{ marginTop: 8 }}>
            {olculen.sigiyorMu
              ? 'Ölçülen tempoyla kapsam süreye sığıyor. Bu, tahmine değil kendi verine dayanan bir sonuç.'
              : 'Ölçülen tempoyla kapsam süreye sığmıyor. Aşağıdaki kaldıraçlar bu farkı kapatmak için var.'}
          </p>
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <h2>
            <Icon name="check" size={17} />
            İçeride
          </h2>
          <span className="chip">{project.scope.in.length} madde</span>
        </div>
        <p className="card-note" style={{ marginBottom: 6 }}>
          Bu oyunda kesinlikle olacak şeyler. Her maddenin bir tasarım sütununa hizmet
          etmesi gerekir.
        </p>

        {project.scope.in.length === 0 ? (
          <p className="empty">Henüz madde yok.</p>
        ) : (
          <ul className="item-list">
            {project.scope.in.map((item) => (
              <li key={item.id} className="item">
                <div className="item-body">
                  <div className="item-title">{item.text}</div>
                </div>
                <button
                  className="icon-btn danger"
                  onClick={() => actions.removeScope('in', item.id)}
                >
                  <Icon name="trash" size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <AddRow
          placeholder="Oyunda kesinlikle olacak bir şey"
          onAdd={(text) => actions.addScope('in', text)}
          disabled={scopeLocked}
        />
      </div>

      <div className="card">
        <div className="card-head">
          <h2>
            <Icon name="x" size={17} />
            Dışarıda
          </h2>
          <span className={'chip ' + (outCount >= 5 ? 'chip-good' : 'chip-warn')}>
            {outCount} / en az 5
          </span>
        </div>
        <p className="card-note" style={{ marginBottom: 6 }}>
          Aklına gelen ama bu oyunda olmayacak şeyler. Bu liste, içeride listesinden daha
          değerlidir. Ön üretim kapısı en az 5 madde ister.
        </p>

        {outCount === 0 ? (
          <p className="empty">
            Henüz madde yok. Şunları düşün: çok oyunculu mod, başarımlar, kaydetme, dil
            desteği, ayarlar menüsü, hikaye, seslendirme, oyun kolu desteği.
          </p>
        ) : (
          <ul className="item-list">
            {project.scope.out.map((item) => (
              <li key={item.id} className="item alt">
                <div className="item-body">
                  <div className="item-title">{item.text}</div>
                </div>
                <button
                  className="icon-btn danger"
                  onClick={() => actions.removeScope('out', item.id)}
                >
                  <Icon name="trash" size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <AddRow
          placeholder="Bu oyunda olmayacak bir şey"
          onAdd={(text) => actions.addScope('out', text)}
        />
      </div>

      <div className="card">
        <div className="card-head">
          <h2>
            <Icon name="snowflake" size={17} />
            Buzdolabı
          </h2>
          <span className="chip">{project.icebox.length} fikir</span>
        </div>
        <p className="card-note" style={{ marginBottom: 6 }}>
          Üretim sırasında aklına gelen fikirler. Buradaki hiçbir şey bu projede
          yapılmayacak. Amaç fikri kaybetmemek, ama projeyi de bekletmemek.
        </p>

        {project.icebox.length === 0 ? (
          <p className="empty">Buzdolabı boş.</p>
        ) : (
          <ul className="item-list">
            {project.icebox.map((item) => (
              <li key={item.id} className="item alt">
                <div className="item-body">
                  <div className="item-title">{item.text}</div>
                  <div className="item-sub">{item.at}</div>
                </div>
                <button
                  className="icon-btn danger"
                  onClick={() => actions.removeIcebox(item.id)}
                >
                  <Icon name="trash" size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <AddRow
          placeholder="Yeni fikir"
          onAdd={(text) => actions.addIcebox(text)}
        />
      </div>
    </div>
  )
}
