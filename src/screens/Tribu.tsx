import { useState } from 'react'
import { c, serif } from '../theme'
import { TRIBU_FILTERS, VIDEOS } from '../data'

export default function Tribu() {
  const [filter, setFilter] = useState(TRIBU_FILTERS[0])

  return (
    <div className="scroll" style={{ height: '100%', background: c.cream, color: c.ink, display: 'flex', flexDirection: 'column', paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ padding: '64px 22px 14px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.clay, margin: '0 0 6px 0' }}>Comunidad</p>
          <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 27, margin: 0 }}>La Tribu</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: c.ink, color: c.cream, borderRadius: 999, padding: '7px 12px' }}>
          <span className="live-dot" style={{ width: 7, height: 7, borderRadius: 999, background: '#E5484D', display: 'block' }} />
          <span style={{ fontSize: 12, fontWeight: 700 }}>En vivo · 8 pm</span>
        </div>
      </div>

      {/* Video destacado */}
      <div style={{ padding: '0 22px 14px 22px' }}>
        <div style={{ position: 'relative', height: 182, borderRadius: 16, overflow: 'hidden', background: c.ink }}>
          <image-slot id="tribu-featured" shape="rounded" radius="0" placeholder="Miniatura de la clase" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 38%, rgba(22,40,30,0.92))', pointerEvents: 'none' }} />
          <span style={{ position: 'absolute', top: 12, left: 12, background: c.clay, color: c.cream, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: 999, pointerEvents: 'none' }}>Clase de la semana</span>
          <div style={{ position: 'absolute', left: 14, right: 70, bottom: 14, pointerEvents: 'none' }}>
            <p style={{ fontFamily: serif, fontSize: 19, fontWeight: 500, color: c.cream, margin: '0 0 3px 0', lineHeight: 1.15 }}>Cómo encontrar $1,000 que no ves</p>
            <p style={{ fontSize: 12, color: c.mist, margin: 0 }}>Mentoría Ingresarios · 18 min</p>
          </div>
          <button className="reset tap" aria-label="Reproducir" style={{ position: 'absolute', right: 14, bottom: 14, width: 46, height: 46, borderRadius: 999, background: c.cream, color: c.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, paddingLeft: 3 }}>▶</button>
        </div>
      </div>

      {/* Filtros */}
      <div className="hscroll" style={{ padding: '0 22px 16px 22px' }}>
        <div style={{ display: 'flex', gap: 8, width: 'max-content' }}>
          {TRIBU_FILTERS.map((f) => {
            const on = filter === f
            return (
              <button key={f} className="reset tap" onClick={() => setFilter(f)} style={{ background: on ? c.ink : c.card, color: on ? c.cream : c.muted, border: on ? 'none' : `1px solid ${c.cardBorder}`, borderRadius: 999, padding: '8px 14px', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
                {f}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lista de videos */}
      <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {VIDEOS.map((v) => (
          <div key={v.id} className={v.locked ? '' : 'tap'} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: v.locked ? 0.72 : 1 }}>
            <div style={{ position: 'relative', width: 92, height: 60, borderRadius: 10, overflow: 'hidden', background: c.ink, flex: 'none' }}>
              <image-slot id={`tribu-${v.id}`} shape="rounded" radius="0" placeholder=" " />
              {v.locked ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(22,40,30,0.55)', color: c.cream, fontSize: 15, pointerEvents: 'none' }}>🔒</div>
              ) : (
                <span style={{ position: 'absolute', right: 5, bottom: 5, background: 'rgba(22,40,30,0.85)', color: c.cream, fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 5, pointerEvents: 'none' }}>{v.dur}</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 3px 0', lineHeight: 1.25 }}>{v.title}</p>
              <p style={{ fontSize: 12, margin: 0, color: v.locked ? c.muted2 : c.muted, fontWeight: 500 }}>
                {v.locked ? '🔒 ' : ''}{v.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
