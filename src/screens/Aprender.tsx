import { useStore } from '../store'
import { c, serif } from '../theme'

const SEGMENTS = [c.green, c.green, c.clay, c.cardBorder, c.cardBorder]

export default function Aprender() {
  const { dispatch } = useStore()

  return (
    <div
      className="scroll"
      style={{ height: '100%', background: c.ink, color: c.cream, display: 'flex', flexDirection: 'column', padding: '64px 22px 116px 22px' }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: c.clay, margin: '0 0 8px 0' }}>
        Etapa 2 · Aprender
      </p>
      <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 30, lineHeight: 1.12, margin: '0 0 22px 0' }}>
        El método, ganado con tus propios hábitos
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Completada */}
        <div style={{ background: c.onInkSurface, border: `1px solid ${c.onInkBorder}`, borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 999, background: c.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flex: 'none' }}>✓</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 14.5, margin: '0 0 2px 0' }}>A dónde se va tu dinero</p>
            <p style={{ fontSize: 12, color: c.sage, margin: 0 }}>Completado · quiz 5/5</p>
          </div>
        </div>

        {/* Activa (reto) */}
        <div style={{ background: c.cream, color: c.ink, borderRadius: 16, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ background: c.clay, color: c.cream, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: 999, whiteSpace: 'nowrap', flex: 'none' }}>
              Reto de 5 días
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: c.clay }}>Día 3 de 5</span>
          </div>
          <p style={{ fontFamily: serif, fontSize: 21, fontWeight: 500, margin: '0 0 6px 0' }}>Maximiza tu dinero</p>
          <p style={{ fontSize: 13, lineHeight: 1.5, color: c.muted, margin: '0 0 14px 0' }}>
            Hoy: encuentra $500 al mes en gastos hormiga. Usa tus propios registros de junio.
          </p>
          <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
            {SEGMENTS.map((color, i) => (
              <div key={i} style={{ flex: 1, height: 5, borderRadius: 999, background: color }} />
            ))}
          </div>
          <div style={{ background: c.ink, color: c.cream, borderRadius: 999, padding: 13, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
            Continuar lección · 8 min
          </div>
        </div>

        {/* Bloqueada 1 */}
        <div style={{ background: c.onInkSurface, border: `1px solid ${c.onInkBorder}`, borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 999, background: 'rgba(245,241,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flex: 'none' }}>🔒</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 14.5, margin: '0 0 2px 0', color: c.sage }}>Tu fondo de emergencia familiar</p>
            <p style={{ fontSize: 12, color: c.inkSecondary, margin: 0, lineHeight: 1.45 }}>Se desbloquea al terminar el reto y ahorrar tu primer $1,000</p>
          </div>
        </div>

        {/* Bloqueada 2 → abre Etapa 3 (Simulador) */}
        <button
          className="reset tap"
          onClick={() => dispatch({ type: 'GO', screen: 'simulador' })}
          style={{ background: c.onInkSurface, border: `1px solid ${c.onInkBorder}`, borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}
        >
          <div style={{ width: 38, height: 38, borderRadius: 999, background: 'rgba(245,241,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flex: 'none' }}>🔒</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 14.5, margin: '0 0 2px 0', color: c.sage }}>Riesgo, plazo y diversificación</p>
            <p style={{ fontSize: 12, color: c.inkSecondary, margin: 0, lineHeight: 1.45 }}>Abre la Etapa 3 · Multiplicar</p>
          </div>
        </button>
      </div>

      {/* Banner comunidad */}
      <div style={{ marginTop: 'auto', background: 'rgba(196,98,45,0.14)', border: '1px solid rgba(196,98,45,0.4)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20 }}>◉</span>
        <p style={{ fontSize: 12.5, lineHeight: 1.45, color: '#E8D5C4', margin: 0 }}>
          <strong style={{ color: c.cream }}>2,340 familias</strong> están en el reto esta semana. Comparte tu avance en la comunidad.
        </p>
      </div>
    </div>
  )
}
