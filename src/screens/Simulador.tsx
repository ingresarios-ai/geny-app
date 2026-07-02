import { useStore } from '../store'
import { c, serif } from '../theme'

export default function Simulador() {
  const { dispatch } = useStore()

  return (
    <div
      className="scroll"
      style={{ height: '100%', background: c.cream, color: c.ink, display: 'flex', flexDirection: 'column', padding: '52px 22px 30px 22px' }}
    >
      {/* Volver */}
      <button
        className="reset tap"
        onClick={() => dispatch({ type: 'GO', screen: 'app' })}
        style={{ display: 'flex', alignItems: 'center', gap: 4, color: c.muted2, fontSize: 13, fontWeight: 600, marginBottom: 12 }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>‹</span> Ruta
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: c.clay, margin: 0, whiteSpace: 'nowrap' }}>
          Etapa 3 · Multiplicar
        </p>
        <span style={{ background: c.greenChip, color: c.green, fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 999, whiteSpace: 'nowrap', flex: 'none' }}>
          Modo práctica
        </span>
      </div>
      <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 28, margin: '0 0 18px 0' }}>Tu portafolio de práctica</h1>

      {/* Tarjeta de valor */}
      <div style={{ background: c.ink, color: c.cream, borderRadius: 18, padding: 20, marginBottom: 14 }}>
        <p style={{ fontSize: 12, color: c.sage, margin: '0 0 4px 0', fontWeight: 600 }}>Valor simulado · empezaste con $10,000</p>
        <p style={{ fontFamily: serif, fontSize: 40, fontWeight: 500, margin: '0 0 4px 0' }}>$10,687</p>
        <p style={{ fontSize: 13, color: '#7FBF9C', fontWeight: 700, margin: '0 0 16px 0' }}>▲ +6.9% en 11 semanas</p>
        <svg width="100%" height="56" viewBox="0 0 300 56" preserveAspectRatio="none" style={{ display: 'block' }}>
          <path d="M0,44 C25,42 40,48 60,45 C85,41 100,30 125,33 C150,36 165,22 190,24 C215,26 235,14 260,12 C275,11 290,9 300,8" fill="none" stroke={c.clay} strokeWidth="2.5" />
          <path d="M0,44 C25,42 40,48 60,45 C85,41 100,30 125,33 C150,36 165,22 190,24 C215,26 235,14 260,12 C275,11 290,9 300,8 L300,56 L0,56 Z" fill="rgba(196,98,45,0.15)" stroke="none" />
        </svg>
      </div>

      {/* Posiciones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        <PositionRow sigla="ETF" siglaBg={c.greenChip} siglaColor={c.green} name="Fondo diversificado global" meta="70% del portafolio · riesgo medio" ret="+8.2%" />
        <PositionRow sigla="RF" siglaBg="#F3E9DC" siglaColor={c.clayDark} name="Deuda gubernamental" meta="30% del portafolio · riesgo bajo" ret="+3.8%" />
      </div>

      {/* Insight */}
      <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: c.clay, margin: '0 0 4px 0' }}>💡 Lo que aprendiste esta semana</p>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: '#43544A', margin: 0 }}>
          En la caída del martes no vendiste. Ese es el comportamiento que separa al inversionista del apostador.
        </p>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          className="reset tap"
          onClick={() => alert('Te conectaremos con plataformas reguladas en tu país (p. ej. Fintual CL/MX, Hapi LatAm).\n\nIngresarios no custodia tu dinero.')}
          style={{ background: c.ink, color: c.cream, borderRadius: 999, padding: 15, textAlign: 'center', fontWeight: 700, fontSize: 15 }}
        >
          Estoy listo para invertir de verdad
        </button>
        <p style={{ fontSize: 11, color: c.muted2, textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
          Te conectamos con plataformas reguladas en tu país.<br />Ingresarios no custodia tu dinero.
        </p>
      </div>
    </div>
  )
}

function PositionRow({
  sigla,
  siglaBg,
  siglaColor,
  name,
  meta,
  ret,
}: {
  sigla: string
  siglaBg: string
  siglaColor: string
  name: string
  meta: string
  ret: string
}) {
  return (
    <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: siglaBg, color: siglaColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flex: 'none' }}>
        {sigla}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0 }}>{name}</p>
        <p style={{ fontSize: 11.5, color: c.muted2, margin: 0 }}>{meta}</p>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: c.green }}>{ret}</span>
    </div>
  )
}
