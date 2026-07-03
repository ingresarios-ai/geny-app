import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { c, serif } from '../theme'

const CATEGORIES = ['Para tu etapa', 'Método', 'Inversión', 'En pareja'] as const

interface VideoItem {
  id: string
  title: string
  desc: string
  duration: string
  emoji: string
  stage: number
  category: string
  youtubeId?: string
  locked?: boolean
}

const VIDEOS: VideoItem[] = [
  { id: 'v1', title: 'A dónde se va tu dinero', desc: 'Entiende tus patrones de gasto con este ejercicio de 10 minutos.', duration: '12:40', emoji: '💸', stage: 1, category: 'Método', youtubeId: '' },
  { id: 'v2', title: 'Registra gastos sin olvidar ninguno', desc: 'El método de 2 minutos para que registrar sea un hábito diario.', duration: '8:15', emoji: '📝', stage: 1, category: 'Método', youtubeId: '' },
  { id: 'v3', title: 'Tu primer presupuesto que sí funciona', desc: 'Cómo crear un presupuesto realista y que puedas seguir.', duration: '15:20', emoji: '📊', stage: 1, category: 'Método', youtubeId: '' },
  { id: 'v4', title: 'Metas financieras en pareja', desc: 'Divide metas compartidas sin conflicto usando sobres digitales.', duration: '10:05', emoji: '💕', stage: 1, category: 'En pareja', youtubeId: '' },
  { id: 'v5', title: 'Cómo hablar de dinero sin pelear', desc: 'Estrategias probadas para que las finanzas unan, no dividan.', duration: '11:30', emoji: '💬', stage: 2, category: 'En pareja', youtubeId: '' },
  { id: 'v6', title: 'El presupuesto 50/30/20', desc: 'La regla clásica ajustada para familias con ingresos variables.', duration: '9:45', emoji: '⚖️', stage: 2, category: 'Método', youtubeId: '' },
  { id: 'v7', title: 'El sobre de emergencia familiar', desc: 'Cuánto necesitas y las mejores opciones para guardarlo.', duration: '8:15', emoji: '🛟', stage: 2, category: 'Método', youtubeId: '' },
  { id: 'v8', title: 'Las 3 fugas de dinero más comunes', desc: 'Descubre los patrones más frecuentes en familias de LatAm.', duration: '7:30', emoji: '🔍', stage: 2, category: 'Método', youtubeId: '' },
  { id: 'v9', title: 'Qué son los CETES y cómo empezar', desc: 'La inversión más segura en México, explicada paso a paso.', duration: '14:20', emoji: '🏛️', stage: 3, category: 'Inversión', youtubeId: '' },
  { id: 'v10', title: 'ETFs: invierte en todo el mundo', desc: 'Cómo un solo instrumento te diversifica globalmente.', duration: '16:10', emoji: '🌎', stage: 3, category: 'Inversión', youtubeId: '' },
  { id: 'v11', title: 'Riesgo y diversificación sin jerga', desc: 'Todo lo que necesitas saber antes de invertir tu primer peso.', duration: '12:00', emoji: '🎲', stage: 3, category: 'Inversión', youtubeId: '' },
]

export default function Tribu() {
  const { state } = useStore()
  const { household } = useAuth()
  const [filter, setFilter] = useState<string>('Para tu etapa')
  const [communityCount, setCommunityCount] = useState(0)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('households').select('id', { count: 'exact', head: true }).then(({ count }) => {
      setCommunityCount(count ?? 0)
    })
  }, [])

  const stage = state.route.stage

  const filtered = VIDEOS.map(v => ({
    ...v,
    locked: v.stage > stage,
  })).filter(v => {
    if (filter === 'Para tu etapa') return v.stage <= stage
    return v.category === filter
  })

  // Featured = first unlocked video
  const featured = VIDEOS.find(v => v.stage <= stage)

  // Is it near 8pm on Tuesday?
  const now = new Date()
  const isLiveTime = now.getDay() === 2 && now.getHours() >= 19 && now.getHours() <= 20

  return (
    <div className="scroll" style={{ height: '100%', background: c.cream, color: c.ink, display: 'flex', flexDirection: 'column', paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ padding: '64px 22px 14px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.clay, margin: '0 0 6px 0' }}>Capacitación</p>
          <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 27, margin: 0 }}>La Tribu</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isLiveTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: c.ink, color: c.cream, borderRadius: 999, padding: '7px 12px' }}>
              <span className="live-dot" style={{ width: 7, height: 7, borderRadius: 999, background: '#E5484D', display: 'block' }} />
              <span style={{ fontSize: 12, fontWeight: 700 }}>En vivo</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 999, padding: '7px 12px' }}>
            <span style={{ fontSize: 14 }}>👥</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{communityCount} familia{communityCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Family stage */}
      <div style={{ padding: '0 22px 14px 22px' }}>
        <div style={{ background: c.ink, color: c.cream, borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24, flex: 'none' }}>🏠</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 2px 0' }}>
              {household?.family_name ?? 'Tu familia'} — Etapa {stage}
            </p>
            <p style={{ fontSize: 12, color: c.sage, margin: 0 }}>
              {stage === 1 ? 'Ordenando finanzas' : stage === 2 ? 'Aprendiendo a optimizar' : 'Explorando inversiones'}
              {state.route.streak > 0 && ` · 🔥 ${state.route.streak} días`}
            </p>
          </div>
        </div>
      </div>

      {/* Featured video */}
      {featured && (
        <div style={{ padding: '0 22px 14px 22px' }}>
          <button
            className="reset tap"
            onClick={() => setPlayingVideo(playingVideo === featured.id ? null : featured.id)}
            style={{ width: '100%', position: 'relative', borderRadius: 16, overflow: 'hidden', background: c.ink, textAlign: 'left' }}
          >
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #16281E 0%, #2A4A38 100%)' }}>
              <span style={{ fontSize: 48 }}>{featured.emoji}</span>
            </div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 38%, rgba(22,40,30,0.92))', pointerEvents: 'none' }} />
            <span style={{ position: 'absolute', top: 12, left: 12, background: c.clay, color: c.cream, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: 999, pointerEvents: 'none' }}>
              Clase recomendada
            </span>
            <div style={{ position: 'absolute', left: 14, right: 70, bottom: 14, pointerEvents: 'none' }}>
              <p style={{ fontFamily: serif, fontSize: 19, fontWeight: 500, color: c.cream, margin: '0 0 3px 0', lineHeight: 1.15 }}>{featured.title}</p>
              <p style={{ fontSize: 12, color: c.mist, margin: 0 }}>Mentoría Ingresarios · {featured.duration}</p>
            </div>
            <div style={{ position: 'absolute', right: 14, bottom: 14, width: 46, height: 46, borderRadius: 999, background: c.cream, color: c.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, paddingLeft: 3, pointerEvents: 'none' }}>
              ▶
            </div>
          </button>
          {playingVideo === featured.id && (
            <div style={{ marginTop: 10, background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: '#43544A', margin: '0 0 10px 0' }}>
                {featured.desc}
              </p>
              <p style={{ fontSize: 12, color: c.clay, fontWeight: 700, margin: 0 }}>
                📌 Próximamente: los videos estarán disponibles dentro de la app.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="hscroll" style={{ padding: '0 22px 16px 22px' }}>
        <div style={{ display: 'flex', gap: 8, width: 'max-content' }}>
          {CATEGORIES.map((f) => {
            const on = filter === f
            return (
              <button key={f} className="reset tap" onClick={() => setFilter(f)} style={{ background: on ? c.ink : c.card, color: on ? c.cream : c.muted, border: on ? 'none' : `1px solid ${c.cardBorder}`, borderRadius: 999, padding: '8px 14px', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
                {f}
              </button>
            )
          })}
        </div>
      </div>

      {/* Videos list */}
      <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px' }}>
            <span style={{ fontSize: 32 }}>📚</span>
            <p style={{ fontSize: 14, color: c.muted, margin: '8px 0 0 0' }}>Contenido próximamente en esta categoría.</p>
          </div>
        ) : (
          filtered.map(v => {
            const isExpanded = playingVideo === v.id
            return (
              <div key={v.id}>
                <button
                  className={v.locked ? 'reset' : 'reset tap'}
                  onClick={() => {
                    if (v.locked) return
                    setPlayingVideo(isExpanded ? null : v.id)
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    opacity: v.locked ? 0.55 : 1,
                    cursor: v.locked ? 'default' : 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{ position: 'relative', width: 92, height: 60, borderRadius: 10, overflow: 'hidden', background: isExpanded ? c.clay : c.ink, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 22 }}>{v.emoji}</span>
                    {v.locked ? (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(22,40,30,0.55)', color: c.cream, fontSize: 15, pointerEvents: 'none' }}>🔒</div>
                    ) : (
                      <span style={{ position: 'absolute', right: 5, bottom: 5, background: 'rgba(22,40,30,0.85)', color: c.cream, fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 5, pointerEvents: 'none' }}>{v.duration}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 3px 0', lineHeight: 1.25 }}>{v.title}</p>
                    <p style={{ fontSize: 12, margin: 0, color: v.locked ? c.muted2 : c.muted, fontWeight: 500 }}>
                      {v.locked ? `🔒 Se desbloquea en Etapa ${v.stage}` : `Mentoría · ${v.duration}`}
                    </p>
                  </div>
                </button>
                {isExpanded && !v.locked && (
                  <div style={{ marginTop: 8, marginLeft: 104, background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 12, padding: '12px 14px' }}>
                    <p style={{ fontSize: 13, lineHeight: 1.5, color: '#43544A', margin: 0 }}>{v.desc}</p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Community CTA */}
      <div style={{ padding: '20px 22px 0 22px', marginTop: 'auto' }}>
        <div style={{ background: 'rgba(196,98,45,0.12)', border: '1px solid rgba(196,98,45,0.35)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>💪</span>
          <p style={{ fontSize: 12.5, lineHeight: 1.45, color: '#43544A', margin: 0 }}>
            <strong style={{ color: c.ink }}>{communityCount} {communityCount === 1 ? 'familia está' : 'familias están'}</strong> en su ruta financiera con Geny. ¡Tú eres parte!
          </p>
        </div>
      </div>
    </div>
  )
}
