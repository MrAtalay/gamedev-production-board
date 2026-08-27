import { useState } from 'react'
import Icon from './Icon.jsx'
import Timer from './Timer.jsx'
import {
  nextTask,
  streakInfo,
  minutesOnDate,
  todayStr,
  totalLoggedMinutes,
  overallProgress,
} from '../lib/project.js'
import { computeEstimate, formatDate } from '../lib/estimate.js'
import { findGenre } from '../data/genres.js'

export default function TodayView({ project, actions, goTo }) {
  const [note, setNote] = useState('')
  const [idea, setIdea] = useState('')

  const task = nextTask(project)
  const streak = streakInfo(project)
  const today = minutesOnDate(project, todayStr())
  const target = project.profile.dailyMinutes
  const estimate = computeEstimate(project.profile)
  const genre = findGenre(project.profile.genreId)
  const loggedHours = Math.round(totalLoggedMinutes(project) / 60)
  const progress = overallProgress(project)

  function logSession(minutes) {
    actions.logSession({
      minutes,
      note: note.trim(),
      stepId: task.step ? task.step.id : null,
    })
    setNote('')
  }

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">{project.name}</div>
        <h1>Bugün</h1>
        <p className="sub">
          Tek bir iş gösteriyorum. Bitirince bir sonraki kendiliğinden gelecek.
        </p>
      </div>

      {streak.brokenDays > 3 && (
        <div className="card card-tight">
          <div className="row">
            <Icon name="clock" size={17} className="muted" />
            <div>
              <strong>Tekrar hoş geldin.</strong>{' '}
              <span className="small muted">
                Son çalışmanın üzerinden {streak.brokenDays} gün geçmiş. Sorun değil,
                bugün 15 dakika yapman bile seriyi yeniden başlatır. Aşağıdaki işten
                devam et.
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="focus-card">
        <div className="focus-eyebrow">
          Faz {task.phase.no}: {task.phase.name}
        </div>

        {task.type === 'step' && (
          <>
            <div className="focus-title">{task.step.text}</div>
            <div className="focus-meta">
              <span className="chip chip-accent">
                <Icon name="clock" size={13} />
                yaklaşık {task.step.minutes} dakika
              </span>
              <span className="chip">{task.deliverable.name}</span>
              {task.deliverable.fromGenre && (
                <span className="chip chip-good">{task.deliverable.fromGenre} için</span>
              )}
            </div>

            {task.step.hint && <div className="hint-box">{task.step.hint}</div>}

            <div className="done-when">
              <strong>Bu teslimat neden var:</strong> {task.deliverable.why}
            </div>
            <div className="done-when">
              <strong>Bitti sayılır:</strong> {task.deliverable.doneWhen}
            </div>

            <div className="divider" />

            <Timer targetMinutes={target} onLog={logSession} />

            <div className="field" style={{ marginTop: 16, marginBottom: 12 }}>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Bugün ne yaptın? Tek satır yeter (isteğe bağlı)"
              />
            </div>

            <div className="btn-row">
              <button
                className="btn btn-primary"
                onClick={() => {
                  actions.completeStep(task.step.id)
                  if (note.trim()) {
                    actions.logSession({ minutes: 0, note: note.trim(), stepId: task.step.id })
                    setNote('')
                  }
                }}
              >
                <Icon name="check" size={16} />
                Bu adımı bitirdim
              </button>
              <button className="btn btn-ghost" onClick={() => goTo('faz')}>
                Fazın tamamını gör
              </button>
            </div>
          </>
        )}

        {task.type === 'deliverable' && (
          <>
            <div className="focus-title">{task.deliverable.name}</div>
            <div className="done-when">
              <strong>Bitti sayılır:</strong> {task.deliverable.doneWhen}
            </div>
            <button
              className="btn btn-primary"
              onClick={() => actions.completeDeliverable(task.deliverable.id)}
            >
              <Icon name="check" size={16} />
              Bitirdim
            </button>
          </>
        )}

        {task.type === 'gate' && (
          <>
            <div className="focus-title">
              Bu fazın tüm işleri bitti. Sıra kapıda.
            </div>
            <p className="small" style={{ marginBottom: 16 }}>
              {task.phase.gate.intro}
            </p>
            <button className="btn btn-primary" onClick={() => goTo('kapi')}>
              <Icon name="flag" size={16} />
              Kapıyı aç
            </button>
          </>
        )}

        {task.type === 'done' && (
          <>
            <div className="focus-title">Bu projede yapılacak iş kalmadı.</div>
            <p className="small">
              Post-mortem yazdıysan projeyi arşive alabilirsin. Ayarlar bölümünden yeni
              bir proje başlatabilirsin.
            </p>
          </>
        )}
      </div>

      {task.phase.hardRules && task.phase.hardRules.length > 0 && (
        <div className="rules">
          <div className="rules-title">
            <Icon name="lock" size={15} />
            Bu fazın sert kuralları
          </div>
          <ul>
            {task.phase.hardRules.map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <h2>
            <Icon name="target" size={17} />
            Durum
          </h2>
        </div>
        <div className="number-row" style={{ marginTop: 0 }}>
          <div className="number-box">
            <div className="number-value">
              {today}
              <span className="tiny muted"> / {target} dk</span>
            </div>
            <div className="number-label">bugün</div>
          </div>
          <div className="number-box">
            <div className="number-value">{streak.current}</div>
            <div className="number-label">
              {streak.current > 0 ? 'gün üst üste' : 'bugün başlayabilirsin'}
            </div>
          </div>
          <div className="number-box">
            <div className="number-value">{loggedHours}</div>
            <div className="number-label">toplam saat</div>
          </div>
          <div className="number-box">
            <div className="number-value">%{progress}</div>
            <div className="number-label">proje ilerlemesi</div>
          </div>
        </div>

        <div className="bar-track">
          <div className="bar-fill" style={{ width: progress + '%' }} />
        </div>

        <p className="card-note" style={{ marginTop: 12 }}>
          Hedef tarih {formatDate(project.profile.deadline)}. Kalan{' '}
          {estimate.available.weeks} haftada {estimate.available.hours} saat çalışman
          bekleniyor, projenin toplam ihtiyacı {estimate.required} saat.
        </p>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>
            <Icon name="snowflake" size={17} />
            Aklına yeni bir fikir mi geldi?
          </h2>
        </div>
        <p className="card-note" style={{ marginBottom: 12 }}>
          Buraya yaz ve unut. Fikri kapsama eklemek, projeyi geciktiren en yaygın
          sebeptir. Buzdolabındaki fikirler kaybolmaz, sadece bu projeyi bekletmez.
        </p>
        <div className="row">
          <input
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Fikri yaz, buzdolabına gitsin"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && idea.trim()) {
                actions.addIcebox(idea.trim())
                setIdea('')
              }
            }}
          />
          <button
            className="btn btn-sm"
            onClick={() => {
              if (idea.trim()) {
                actions.addIcebox(idea.trim())
                setIdea('')
              }
            }}
          >
            <Icon name="plus" size={15} />
            Ekle
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>
            <Icon name="alert" size={17} />
            {genre.name} türünde dikkat
          </h2>
        </div>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13.5 }}>
          {genre.traps.slice(0, 2).map((trap, i) => (
            <li key={i} style={{ marginBottom: 6 }}>
              {trap}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
