import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'

function format(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
}

// Basit bir sayaç. Geri sayım değil ileri sayım: amaç süreyi doldurmak değil,
// gerçekte ne kadar çalıştığını ölçmek. Ölçülen süre, sonraki tahminleri
// düzelten veridir.
export default function Timer({ targetMinutes, onLog }) {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1)
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  const minutes = Math.max(1, Math.round(seconds / 60))
  const reachedTarget = seconds >= targetMinutes * 60

  return (
    <div>
      <div className="timer">
        <div className={'timer-display' + (running ? ' running' : '')}>
          {format(seconds)}
        </div>

        <button className="btn btn-sm" onClick={() => setRunning((r) => !r)}>
          <Icon name={running ? 'pause' : 'play'} size={15} />
          {running ? 'Duraklat' : seconds === 0 ? 'Başlat' : 'Devam et'}
        </button>

        {seconds > 0 && (
          <>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                setRunning(false)
                onLog(minutes)
                setSeconds(0)
              }}
            >
              <Icon name="check" size={15} />
              {minutes} dakika kaydet
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setRunning(false)
                setSeconds(0)
              }}
            >
              Sıfırla
            </button>
          </>
        )}
      </div>

      {reachedTarget && (
        <p className="small muted" style={{ marginTop: 10 }}>
          Bugünkü hedefini doldurdun. Devam etmek serbest, ama düzenli olmak uzun vadede
          uzun oturumlardan daha çok iş bitirir.
        </p>
      )}
    </div>
  )
}
