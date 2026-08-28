import { useState } from 'react'
import Icon from './Icon.jsx'
import {
  contentTypesFor,
  containerTypeFor,
  lowerName,
  dativeName,
} from '../data/content.js'
import {
  contentCounts,
  contentChecks,
  contentItems,
  itemsOfType,
  detailProgress,
  totalContentUnits,
  orphanItems,
  itemRelations,
  eksikOgeler,
  contentExportJson,
  contentExportBrief,
} from '../lib/content.js'

// Bir bileşenin tek alanı. Referans alanları, aynı projedeki kapsayıcı
// bileşenlerden seçilir: elle isim yazmak yazım hatasıyla bağ koparır.
function Field({ field, value, options, onChange }) {
  if (field.type === 'ref') {
    return (
      <div className="field" style={{ marginBottom: 10 }}>
        <label className="tiny">{field.label}</label>
        <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Seçilmedi</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div className="field" style={{ marginBottom: 10 }}>
      <label className="tiny">{field.label}</label>
      {field.help && <div className="help">{field.help}</div>}
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        value={value === undefined ? '' : value}
        placeholder={field.type === 'list' ? 'virgülle ayır' : ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function ItemRow({ project, item, type, containerItems, actions }) {
  const [open, setOpen] = useState(false)
  // Bağlar türetiliyor, saklanmıyor. Aynı bilgiyi iki yerde tutmak,
  // iki yerin ayrışması demek olurdu.
  const bag = itemRelations(project, item)
  const filled = type.fields.filter((f) => {
    const v = (item.fields || {})[f.key]
    return v !== undefined && String(v).trim() !== ''
  }).length

  return (
    <div className="item" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
      <div className="item-body">
        <input
          value={item.name}
          onChange={(e) => actions.renameContentItem(item.id, e.target.value)}
        />
        <div className="tiny muted" style={{ marginTop: 4 }}>
          {filled} / {type.fields.length} alan dolu
        </div>

        {(bag.dusurenler.length > 0 ||
          bag.kullananlar.length > 0 ||
          bag.dusurdukleri.length > 0 ||
          bag.malzemeler.length > 0) && (
          <div className="tiny" style={{ marginTop: 6, color: 'var(--text-secondary)' }}>
            {bag.dusurenler.length > 0 && (
              <div>Şunlardan düşüyor: {bag.dusurenler.join(', ')}</div>
            )}
            {bag.kullananlar.length > 0 && (
              <div>Şunların üretiminde kullanılıyor: {bag.kullananlar.join(', ')}</div>
            )}
            {bag.malzemeler.length > 0 && (
              <div>
                Malzemeleri:{' '}
                {bag.malzemeler.map((m, i) => (
                  <span key={m.ad}>
                    {i > 0 && ', '}
                    <span style={m.tanimli ? undefined : { color: 'var(--warn)' }}>
                      {m.ad}
                      {m.tanimli ? '' : ' (tanımsız)'}
                    </span>
                  </span>
                ))}
              </div>
            )}
            {bag.dusurdukleri.length > 0 && (
              <div>
                Düşürdükleri:{' '}
                {bag.dusurdukleri.map((d, i) => (
                  <span key={d.ad}>
                    {i > 0 && ', '}
                    <span style={d.tanimli ? undefined : { color: 'var(--warn)' }}>
                      {d.ad}
                      {d.tanimli ? '' : ' (tanımsız)'}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {open && (
          <div style={{ marginTop: 12 }}>
            {type.fields.map((field) => (
              <Field
                key={field.key}
                field={field}
                value={(item.fields || {})[field.key]}
                options={field.type === 'ref' ? containerItems : []}
                onChange={(v) => actions.setContentField(item.id, field.key, v)}
              />
            ))}
          </div>
        )}
      </div>

      <button className="btn btn-sm btn-ghost" onClick={() => setOpen(!open)}>
        {open ? 'Kapat' : 'Detay'}
      </button>
      <button
        className="btn btn-sm btn-ghost"
        onClick={() => actions.removeContentItem(item.id)}
        aria-label="Sil"
      >
        <Icon name="trash" size={15} />
      </button>
    </div>
  )
}

function TypeSection({ project, type, containerItems, actions }) {
  const [text, setText] = useState('')
  const [showTests, setShowTests] = useState(false)
  const items = itemsOfType(project, type.id)

  function add() {
    if (text.trim() === '') return
    actions.addContentItem(type.id, text.trim())
    setText('')
  }

  return (
    <div className="card">
      <div className="card-head">
        <h2>
          {type.name}
          <span className="chip" style={{ marginLeft: 10 }}>
            {items.length}
          </span>
        </h2>
      </div>
      <p className="card-note" style={{ marginBottom: 12 }}>
        {type.summary}
      </p>

      {items.map((item) => (
        <ItemRow
          key={item.id}
          project={project}
          item={item}
          type={type}
          containerItems={containerItems}
          actions={actions}
        />
      ))}

      <div className="row" style={{ marginTop: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={type.name + ' adı'}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add()
          }}
        />
        <button className="btn btn-sm" onClick={add}>
          <Icon name="plus" size={15} />
          Ekle
        </button>
      </div>

      <button
        className="btn btn-sm btn-ghost"
        style={{ marginTop: 12 }}
        onClick={() => setShowTests(!showTests)}
      >
        {showTests ? 'Test föyünü gizle' : 'Test föyü'}
      </button>

      {showTests && (
        <div className="hint-box" style={{ marginTop: 12, marginBottom: 0 }}>
          <strong>Bu türden bir şey eklediğinde bunlara bak:</strong>
          <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
            {type.testChecklist.map((c, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function ContentView({ project, actions, toast }) {
  const [tab, setTab] = useState('liste')
  const types = contentTypesFor(project.profile.genreId)
  const container = containerTypeFor(project.profile.genreId)
  const containerItems = container ? itemsOfType(project, container.id) : []
  const counts = contentCounts(project)
  const checks = contentChecks(project)
  const progress = detailProgress(project)
  const total = totalContentUnits(project)
  const orphans = orphanItems(project)
  const eksik = eksikOgeler(project)
  // Ganimet ve malzemelerin ekleneceği tür. Çoğu türde "kaynak", yoksa
  // eylem düğmesi hiç gösterilmez.
  const esyaTuru = types.find((t) => t.id === 'kaynak' || t.id === 'esya') || null

  function copy(text, label) {
    navigator.clipboard.writeText(text).then(
      () => toast(label + ' panoya kopyalandı.', 'good'),
      () => toast('Kopyalanamadı. Metni elle seçip kopyalayabilirsin.', 'bad')
    )
  }

  function download(text, filename, type) {
    const blob = new Blob([text], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">İçerik</div>
        <h1>Oyunun içinde ne olacak</h1>
        <p className="sub">
          Kabaca isim girerek başla, alanları zamanla doldur. Bu liste bir üreteç
          değil, bir sayım: kaç birim içerik planladığın artık tahmin değil.
        </p>
      </div>

      <div className="card card-tight">
        <div className="number-row" style={{ marginTop: 0 }}>
          <div className="number-box">
            <div className="number-value">{total}</div>
            <div className="number-label">toplam bileşen</div>
          </div>
          <div className="number-box">
            <div className="number-value">{progress.percent}%</div>
            <div className="number-label">alanlar doldu</div>
          </div>
          <div className="number-box">
            <div className="number-value">{checks.length}</div>
            <div className="number-label">dikkat çekilen durum</div>
          </div>
        </div>
        <p className="small muted" style={{ marginTop: 12 }}>
          Bu sayı, Üretim kapısındaki birim matematiğinde kullanılabilir. Orada
          &quot;kaç birim içerik&quot; diye sorulduğunda tahmin etmek yerine bu
          listeyi say.
        </p>
      </div>

      <div className="row" style={{ marginBottom: 18, gap: 8 }}>
        {[
          ['liste', 'Bileşenler'],
          ['kontrol', 'Tutarlılık (' + checks.length + ')'],
          ['disa', 'Dışa aktar'],
        ].map(([id, label]) => (
          <button
            key={id}
            className={'btn btn-sm' + (tab === id ? ' btn-primary' : '')}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'liste' && (
        <>
          {container && containerItems.length === 0 && (
            <div className="rules">
              <div className="rules-title">
                <Icon name="alert" size={15} />
                Önce {lowerName(container)} ekle
              </div>
              <p style={{ fontSize: 13.5, margin: 0 }}>
                Diğer bileşenler bir {dativeName(container)} bağlanıyor. Hiç{' '}
                {lowerName(container)} yoksa, girdiğin düşmanların ve eşyaların
                nerede karşılaşılacağı belli olmaz.
              </p>
            </div>
          )}

          {eksik.length > 0 && esyaTuru && (
            <div className="card card-tight">
              <div className="spread">
                <span className="small">
                  <strong>{eksik.length} ganimet veya malzeme</strong> bir yerde adı
                  geçiyor ama listede yok: {eksik.map((e) => e.ad).join(', ')}
                </span>
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    eksik.forEach((e) => actions.addContentItem(esyaTuru.id, e.ad))
                    toast(eksik.length + ' eşya listeye eklendi.', 'good')
                  }}
                >
                  <Icon name="plus" size={15} />
                  Hepsini ekle
                </button>
              </div>
            </div>
          )}

          {types.map((type) => (
            <TypeSection
              key={type.id}
              project={project}
              type={type}
              containerItems={containerItems}
              actions={actions}
            />
          ))}

          {orphans.length > 0 && (
            <div className="card">
              <div className="card-head">
                <h2>
                  <Icon name="alert" size={17} />
                  Seçili türe uymayan bileşenler
                </h2>
              </div>
              <p className="card-note" style={{ marginBottom: 14 }}>
                Bunlar başka bir tür seçiliyken girilmiş ve seçili türün
                şemasında karşılıkları yok. Silinmediler, ama yukarıdaki
                bölümlerde görünmüyorlar ve birim sayımına dahil değiller.
                Türü geri değiştirirsen olduğu gibi geri gelirler.
              </p>
              {orphans.map((item) => (
                <div className="item" key={item.id} style={{ marginBottom: 8 }}>
                  <div className="item-body">
                    <div className="item-title">{item.name}</div>
                    <div className="item-sub">eski tür kodu: {item.typeId}</div>
                  </div>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => actions.removeContentItem(item.id)}
                    aria-label="Sil"
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'kontrol' && (
        <div className="card">
          <div className="card-head">
            <h2>
              <Icon name="alert" size={17} />
              Veri tutarlılığı
            </h2>
          </div>
          <p className="card-note" style={{ marginBottom: 14 }}>
            Buradaki her madde veriye bakarak hesaplandı. Hiçbiri &quot;bu
            eğlenceli değil&quot; demiyor, çünkü sistemin bunu bilmesi mümkün
            değil. Hepsi kasıtlı olabilir; amaç kararı senin yerine vermek değil,
            durumu görünür kılmak.
          </p>

          {contentItems(project).length === 0 && (
            <p className="small muted">
              Henüz bileşen girilmedi. Liste doldukça kontroller burada belirir.
            </p>
          )}

          {checks.length === 0 && contentItems(project).length > 0 && (
            <p className="small">
              Şu an dikkat çekilecek bir durum yok. Bu, tasarımın doğru olduğu
              anlamına gelmez: sadece veride tutarsızlık görünmüyor.
            </p>
          )}

          {checks.map((c, i) => (
            <div
              key={i}
              className="item"
              style={{ marginBottom: 10, alignItems: 'flex-start' }}
            >
              <span
                className={'chip chip-' + (c.tone === 'warn' ? 'warn' : '')}
                style={{ marginTop: 2 }}
              >
                {c.tone === 'warn' ? 'bak' : 'not'}
              </span>
              <div className="item-body">
                <div className="item-title">{c.title}</div>
                <div className="item-sub">{c.detail}</div>
                {c.eylem && c.eylem.tur === 'ganimetEkle' && esyaTuru && (
                  <button
                    className="btn btn-sm"
                    style={{ marginTop: 10 }}
                    onClick={() => {
                      c.eylem.adlar.forEach((ad) => actions.addContentItem(esyaTuru.id, ad))
                      toast(c.eylem.adlar.length + ' eşya listeye eklendi.', 'good')
                    }}
                  >
                    <Icon name="plus" size={15} />
                    {c.eylem.adlar.length} tanesini {esyaTuru.name} olarak ekle
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'disa' && (
        <>
          <div className="card">
            <div className="card-head">
              <h2>Dışa aktar</h2>
            </div>
            <p className="card-note" style={{ marginBottom: 14 }}>
              İki biçim var. JSON makine için, föy insan ve asistan için. Föyün
              içinde ne istendiği de yazılı: iskelet kod, tanım dosyaları ve
              yükleme kodu. Sayılar tasarım kararıdır ve değiştirilmesi istenmez.
            </p>

            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn btn-sm"
                onClick={() => copy(contentExportBrief(project), 'Föy')}
              >
                Föyü kopyala
              </button>
              <button
                className="btn btn-sm"
                onClick={() =>
                  download(contentExportBrief(project), 'icerik-foyu.md', 'text/markdown')
                }
              >
                Föyü indir (.md)
              </button>
              <button
                className="btn btn-sm"
                onClick={() => copy(contentExportJson(project), 'JSON')}
              >
                JSON kopyala
              </button>
              <button
                className="btn btn-sm"
                onClick={() =>
                  download(contentExportJson(project), 'icerik.json', 'application/json')
                }
              >
                JSON indir
              </button>
            </div>
          </div>

          <div className="rules">
            <div className="rules-title">
              <Icon name="alert" size={15} />
              Asistana verirken
            </div>
            <p style={{ fontSize: 13.5, margin: 0 }}>
              Bir kod asistanı bu veriden iskelet kod üretebilir: veri yapıları,
              tanım dosyaları, alan adları, yükleme kodu. Üretemeyeceği tek şey,
              dengenin doğru olup olmadığı. Bir bossun canı fazla mı, çatışma
              eğlenceli mi, zorluk eğrisi doğru mu: bunlar oynayarak anlaşılır ve
              bu sistemde &quot;karar&quot; işkoluna girer. Karar işkolu hiçbir
              araçtan hızlanmaz ve projelerin öldüğü yer tam olarak orasıdır.
              Testi sen yaparsın.
            </p>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Föy önizleme</h2>
            </div>
            <pre
              style={{
                fontSize: 12,
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                margin: 0,
                color: 'var(--text-secondary)',
              }}
            >
              {contentExportBrief(project).slice(0, 1600)}
              {contentExportBrief(project).length > 1600 ? '\n...' : ''}
            </pre>
          </div>
        </>
      )}

      {tab === 'liste' && counts.length > 0 && (
        <div className="hint-box">
          <strong>Bileşen dağılımı:</strong>{' '}
          {counts.map((c) => c.type.name + ' ' + c.count).join(', ')}.
        </div>
      )}
    </div>
  )
}
