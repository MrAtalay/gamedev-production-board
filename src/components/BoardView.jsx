import { useState } from 'react'
import Icon from './Icon.jsx'
import { boardStats } from '../lib/project.js'
import { unitMath } from '../lib/estimate.js'
import { phaseIndex } from '../data/phases.js'

// Üretim görev panosu. Sürükle bırak ile kart taşıma, projenin ilk
// sürümünden geliyor; artık üretim fazının içerik birimlerini takip ediyor.

function Card({ card, columnId, onDelete }) {
  function handleDragStart(e) {
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ cardId: card.id, fromColumnId: columnId })
    )
  }

  return (
    <div className="board-card" draggable onDragStart={handleDragStart}>
      <span className="board-card-text">{card.text}</span>
      <button className="icon-btn danger" onClick={() => onDelete(columnId, card.id)}>
        <Icon name="x" size={14} />
      </button>
    </div>
  )
}

function Column({ column, onAddCard, onDeleteCard, onDropCard }) {
  const [text, setText] = useState('')

  function add() {
    if (text.trim() === '') return
    onAddCard(column.id, text.trim())
    setText('')
  }

  return (
    <div
      className="board-column"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'))
          onDropCard(data.fromColumnId, column.id, data.cardId)
        } catch {
          // Pano dışından gelen sürüklemeleri sessizce yok say.
        }
      }}
    >
      <div className="board-column-head">
        <h3>{column.title}</h3>
        <span className="chip">{column.cards.length}</span>
      </div>

      {column.cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          columnId={column.id}
          onDelete={onDeleteCard}
        />
      ))}

      {column.id === 'yapilacak' && (
        <div className="board-add">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Yeni birim"
            onKeyDown={(e) => {
              if (e.key === 'Enter') add()
            }}
          />
          <button className="btn btn-sm" onClick={add}>
            <Icon name="plus" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

export default function BoardView({ project, actions }) {
  const stats = boardStats(project)
  const math = unitMath(project)
  const inProduction = phaseIndex(project.currentPhaseId) >= phaseIndex('uretim')

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Üretim panosu</div>
        <h1>İçerik birimleri</h1>
        <p className="sub">
          Üretilecek her parçayı buraya bir kart olarak gir: bölüm, sahne, oda, bulmaca,
          düşman. Kartları sürükleyerek taşıyabilirsin.
        </p>
      </div>

      {!inProduction && (
        <div className="card card-tight">
          <div className="row">
            <Icon name="clock" size={17} className="muted" />
            <p className="small">
              Henüz üretim fazında değilsin. Panoyu şimdiden doldurabilirsin ama asıl
              işlevi üretim fazında başlar. Önce tasarımı ve dikey dilimi bitir.
            </p>
          </div>
        </div>
      )}

      <div className="card card-tight">
        <div className="spread" style={{ marginBottom: 10 }}>
          <strong className="small">İlerleme</strong>
          <span className="small muted">
            {stats.done} / {stats.total} birim
          </span>
        </div>
        <div className="bar-track">
          <div
            className={'bar-fill' + (stats.percent === 100 ? ' good' : '')}
            style={{ width: stats.percent + '%' }}
          />
        </div>

        {math && (
          <p className="card-note" style={{ marginTop: 12 }}>
            Ölçtüğün birim süresi {math.unitHours} saat. {math.totalUnits} birim için{' '}
            {math.needed} saat gerekiyor, üretim bütçen {math.productionBudget} saat.
            {!math.fits && (
              <>
                {' '}
                <strong style={{ color: 'var(--bad)' }}>
                  Bu tempoyla en fazla {math.suggestedUnits} birim üretebilirsin.
                </strong>
              </>
            )}
          </p>
        )}
      </div>

      <div className="board">
        {project.board.map((column) => (
          <Column
            key={column.id}
            column={column}
            onAddCard={actions.addCard}
            onDeleteCard={actions.deleteCard}
            onDropCard={actions.moveCard}
          />
        ))}
      </div>
    </div>
  )
}
