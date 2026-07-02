import { useStore } from '../store'
import { useAuth } from '../lib/auth'
import { c, serif } from '../theme'

const AMBER = '#F0B04A'
const GRAY = '#7E8F83'
const money = (n: number) => '$' + n.toLocaleString('es-MX')

// Resumen del mes anterior. En prod lo genera un job mensual que agrega
// entries/goals/recurring del periodo; victoria y fuga se eligen por reglas.
const SPENT = [
  { label: 'Casa y servicios', amount: 15700, pct: 38, color: c.clay },
  { label: 'Súper y comida', amount: 10740, pct: 26, color: c.green },
  { label: 'Otros', amount: 9095, pct: 22, color: GRAY },
  { label: 'Niños y escuela', amount: 5785, pct: 14, color: AMBER },
]

export default function CierreMes() {
  const { state, dispatch } = useStore()
  const { household } = useAuth()

  function compartir() {
    const text = 'La Familia ' + (household?.family_name ?? 'Mi Hogar') + ' ahorró este mes. 💪 #RutaDelDinero'
    if (navigator.share) navigator.share({ title: 'Nuestro cierre de mes', text }).catch(() => {})
    else alert(text)
  }

  function empezarConPlan() {
    dispatch({ type: 'CLOSE_CIERRE' })
    dispatch({ type: 'SET_TAB', tab: 'ruta' })
    dispatch({ type: 'GO', screen: 'app' })
  }

  return (
    <div className="scroll" style={{ position: 'fixed', inset: 0, zIndex: 50, background: c.ink, color: c.cream, display: 'flex', flexDirection: 'column', padding: '44px 22px 28px 22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button className="reset tap" aria-label="Cerrar" onClick={() => dispatch({ type: 'CLOSE_CIERRE' })} style={{ fontSize: 15, color: c.sage }}>✕</button>
        <button className="reset tap" onClick={compartir} style={{ display: 'flex', alignItems: 'center', gap: 6, background: c.onInkSurface, border: `1px solid ${c.onInkBorder}`, borderRadius: 999, padding: '7px 13px', fontSize: 12.5, fontWeight: 700, color: c.cream }}>
          ↗ Compartir
        </button>
      </div>

      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: c.clay, margin: '0 0 8px 0' }}>Cierre de mes</p>
      <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 30, lineHeight: 1.12, margin: '0 0 20px 0' }}>Así les fue</h1>

      {/* Tarjetas gemelas */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1, background: 'rgba(30,107,78,0.22)', border: '1px solid rgba(127,191,156,0.3)', borderRadius: 16, padding: '16px 16px' }}>
          <p style={{ fontSize: 12, color: '#9FD3B6', margin: '0 0 6px 0', fontWeight: 600 }}>Ahorraron</p>
          <p style={{ fontFamily: serif, fontSize: 28, fontWeight: 500, margin: '0 0 4px 0' }}>$3,180</p>
          <p style={{ fontSize: 12, color: '#7FBF9C', fontWeight: 700, margin: 0 }}>▲ 24% más que el mes anterior</p>
        </div>
        <div style={{ flex: 1, background: c.onInkSurface, border: `1px solid ${c.onInkBorder}`, borderRadius: 16, padding: '16px 16px' }}>
          <p style={{ fontSize: 12, color: c.sage, margin: '0 0 6px 0', fontWeight: 600 }}>Gastaron</p>
          <p style={{ fontFamily: serif, fontSize: 28, fontWeight: 500, margin: '0 0 4px 0' }}>$41,320</p>
          <p style={{ fontSize: 12, color: c.mist, margin: 0 }}>de $44,000 presupuesto</p>
        </div>
      </div>

      {/* A dónde se fue */}
      <div style={{ background: c.onInkSurface, border: `1px solid ${c.onInkBorder}`, borderRadius: 16, padding: 16, marginBottom: 14 }}>
        <p style={{ fontSize: 12.5, fontWeight: 700, margin: '0 0 12px 0' }}>A dónde se fue</p>
        <div style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
          {SPENT.map((s) => (
            <div key={s.label} style={{ width: `${s.pct}%`, background: s.color }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px 14px' }}>
          {SPENT.map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color, flex: 'none' }} />
              <span style={{ fontSize: 12, color: c.mist, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{money(s.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <div style={{ background: c.cream, color: c.ink, borderRadius: 14, padding: '13px 15px', display: 'flex', alignItems: 'flex-start', gap: 11 }}>
          <span style={{ fontSize: 20, flex: 'none' }}>🏆</span>
          <div>
            <p style={{ fontSize: 12.5, fontWeight: 700, margin: '0 0 2px 0', color: c.green }}>Su victoria</p>
            <p style={{ fontSize: 13, lineHeight: 1.45, color: '#43544A', margin: 0 }}>Bajaron 18% los pedidos a domicilio vs. el mes anterior. Ese hábito solo ya vale ~$700 al mes.</p>
          </div>
        </div>
        <div style={{ background: 'rgba(196,98,45,0.14)', border: '1px solid rgba(196,98,45,0.4)', borderRadius: 14, padding: '13px 15px', display: 'flex', alignItems: 'flex-start', gap: 11 }}>
          <span style={{ fontSize: 20, flex: 'none' }}>🔍</span>
          <div>
            <p style={{ fontSize: 12.5, fontWeight: 700, margin: '0 0 2px 0', color: '#E8A57F' }}>Una fuga</p>
            <p style={{ fontSize: 13, lineHeight: 1.45, color: '#E8D5C4', margin: 0 }}>2 suscripciones muy parecidas siguen activas — $328/mes que se van sin que las usen.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: 8 }}>
        <p style={{ fontSize: 12.5, color: c.sage, textAlign: 'center', margin: '0 0 12px 0' }}>🔥 {state.route.streak} días de racha — ¡no la rompan!</p>
        <button className="reset tap" onClick={empezarConPlan} style={{ width: '100%', background: c.clay, color: c.cream, borderRadius: 999, padding: 15, textAlign: 'center', fontWeight: 700, fontSize: 15 }}>
          Empezar el mes con un plan →
        </button>
      </div>
    </div>
  )
}
