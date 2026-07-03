import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { c, serif } from '../theme'

// Curated content — in a real app this would come from a CMS
const CONTENT_CATEGORIES = ['Para tu etapa', 'Método', 'Inversión', 'En pareja'] as const

interface ContentItem {
  id: string
  title: string
  desc: string
  emoji: string
  stage: number // relevant stage
  category: string
  readTime: string
}

const CONTENT: ContentItem[] = [
  { id: 'c1', title: 'Registra gastos sin olvidar ninguno', desc: 'Aprende el método de 2 minutos para que registrar sea un hábito.', emoji: '📝', stage: 1, category: 'Método', readTime: '3 min' },
  { id: 'c2', title: 'Las 3 categorías donde más se fuga el dinero', desc: 'Descubre los patrones más comunes en familias de LatAm.', emoji: '🔍', stage: 1, category: 'Método', readTime: '5 min' },
  { id: 'c3', title: 'El presupuesto 50/30/20 adaptado a tu realidad', desc: 'La regla clásica ajustada para familias con ingresos variables.', emoji: '📊', stage: 2, category: 'Método', readTime: '7 min' },
  { id: 'c4', title: 'Cómo hablar de dinero en pareja sin pelear', desc: 'Estrategias probadas para que las finanzas unan, no dividan.', emoji: '💬', stage: 2, category: 'En pareja', readTime: '6 min' },
  { id: 'c5', title: 'Tu fondo de emergencia: cuánto y dónde', desc: 'Cuánto necesitas y las mejores opciones para guardarlo en tu país.', emoji: '🛟', stage: 2, category: 'Método', readTime: '5 min' },
  { id: 'c6', title: 'Qué son los CETES y cómo empezar', desc: 'La inversión más segura en México, explicada paso a paso.', emoji: '🏛️', stage: 3, category: 'Inversión', readTime: '8 min' },
  { id: 'c7', title: 'ETFs: tu primer paso a invertir en todo el mundo', desc: 'Cómo un solo instrumento te diversifica globalmente.', emoji: '🌎', stage: 3, category: 'Inversión', readTime: '10 min' },
  { id: 'c8', title: 'Metas financieras en pareja: el método de los sobres', desc: 'Divide metas compartidas sin conflicto usando sobres digitales.', emoji: '💕', stage: 1, category: 'En pareja', readTime: '4 min' },
]

export default function Tribu() {
  const { state } = useStore()
  const { household } = useAuth()
  const [filter, setFilter] = useState<string>('Para tu etapa')
  const [communityCount, setCommunityCount] = useState(0)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  // Get real community count
  useEffect(() => {
    supabase.from('households').select('id', { count: 'exact', head: true }).then(({ count }) => {
      setCommunityCount(count ?? 0)
    })
  }, [])

  // Filter content
  const stage = state.route.stage
  const filtered = CONTENT.filter(item => {
    if (filter === 'Para tu etapa') return item.stage <= stage
    return item.category === filter
  })

  // Is it near 8pm? (show live indicator only between 7:45pm and 8:30pm on Tuesdays)
  const now = new Date()
  const isLiveTime = now.getDay() === 2 && now.getHours() >= 19 && now.getHours() <= 20

  return (
    <div className="scroll" style={{ height: '100%', background: c.cream, color: c.ink, display: 'flex', flexDirection: 'column', paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ padding: '64px 22px 14px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.clay, margin: '0 0 6px 0' }}>Comunidad</p>
          <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 27, margin: 0 }}>La Tribu</h1>
        </div>
        {isLiveTime ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: c.ink, color: c.cream, borderRadius: 999, padding: '7px 12px' }}>
            <span className="live-dot" style={{ width: 7, height: 7, borderRadius: 999, background: '#E5484D', display: 'block' }} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>En vivo ahora</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 999, padding: '7px 12px' }}>
            <span style={{ fontSize: 14 }}>👥</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{communityCount} {communityCount === 1 ? 'familia' : 'familias'}</span>
          </div>
        )}
      </div>

      {/* Community stats */}
      <div style={{ padding: '0 22px 14px 22px' }}>
        <div style={{ background: c.ink, color: c.cream, borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 28, flex: 'none' }}>🏠</span>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, margin: '0 0 2px 0' }}>
              {household?.family_name ?? 'Tu familia'} está en la Etapa {stage}
            </p>
            <p style={{ fontSize: 12.5, color: c.sage, margin: 0 }}>
              {stage === 1 ? 'Ordenando sus finanzas' : stage === 2 ? 'Aprendiendo a optimizar' : 'Explorando inversiones'}
              {state.route.streak > 0 && ` · 🔥 ${state.route.streak} días de racha`}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="hscroll" style={{ padding: '0 22px 16px 22px' }}>
        <div style={{ display: 'flex', gap: 8, width: 'max-content' }}>
          {CONTENT_CATEGORIES.map((f) => {
            const on = filter === f
            return (
              <button key={f} className="reset tap" onClick={() => setFilter(f)} style={{ background: on ? c.ink : c.card, color: on ? c.cream : c.muted, border: on ? 'none' : `1px solid ${c.cardBorder}`, borderRadius: 999, padding: '8px 14px', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
                {f}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content list */}
      <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px' }}>
            <span style={{ fontSize: 32 }}>📚</span>
            <p style={{ fontSize: 14, color: c.muted, margin: '8px 0 0 0' }}>Contenido próximamente en esta categoría.</p>
          </div>
        ) : (
          filtered.map(item => {
            const isExpanded = expandedItem === item.id
            const isLocked = item.stage > stage
            return (
              <button
                key={item.id}
                className="reset tap"
                onClick={() => {
                  if (isLocked) return
                  setExpandedItem(isExpanded ? null : item.id)
                }}
                style={{
                  background: isExpanded ? c.ink : c.card,
                  color: isExpanded ? c.cream : c.ink,
                  border: `1px solid ${isExpanded ? c.ink : c.cardBorder}`,
                  borderRadius: 16,
                  padding: '16px 18px',
                  textAlign: 'left',
                  opacity: isLocked ? 0.5 : 1,
                  cursor: isLocked ? 'default' : 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24, flex: 'none' }}>{isLocked ? '🔒' : item.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 3px 0', lineHeight: 1.25 }}>{item.title}</p>
                    <p style={{ fontSize: 12, margin: 0, color: isExpanded ? c.sage : c.muted, fontWeight: 500 }}>
                      {isLocked ? `Se desbloquea en Etapa ${item.stage}` : `${item.readTime} de lectura`}
                    </p>
                  </div>
                </div>
                {isExpanded && !isLocked && (
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: c.mist, margin: '12px 0 0 0', paddingLeft: 36 }}>
                    {item.desc}
                  </p>
                )}
              </button>
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
