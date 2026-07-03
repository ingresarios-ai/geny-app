import { useState, useMemo } from 'react'
import { useStore } from '../store'
import { c, serif } from '../theme'

const PROFILES = [
  { key: 'conservador', label: 'Conservador', emoji: '🛡️', rate: 0.06, risk: 'bajo', desc: 'Deuda gubernamental, CETES, pagarés' },
  { key: 'moderado', label: 'Moderado', emoji: '⚖️', rate: 0.10, risk: 'medio', desc: 'Mix de bonos + fondos indexados' },
  { key: 'agresivo', label: 'Agresivo', emoji: '🚀', rate: 0.15, risk: 'alto', desc: 'Fondos indexados globales, ETFs' },
] as const

const YEARS_OPTIONS = [1, 3, 5, 10, 20]

function money(n: number) {
  return '$' + Math.round(n).toLocaleString('es-MX')
}

export default function Simulador() {
  const { dispatch } = useStore()

  const [initial, setInitial] = useState('10000')
  const [monthly, setMonthly] = useState('1000')
  const [profile, setProfile] = useState<typeof PROFILES[number]>(PROFILES[1])
  const [years, setYears] = useState(5)

  const initialNum = Number(initial) || 0
  const monthlyNum = Number(monthly) || 0

  // Compound interest calculation
  const result = useMemo(() => {
    const r = profile.rate / 12 // monthly rate
    const n = years * 12 // total months
    // FV of initial lump sum
    const fvInitial = initialNum * Math.pow(1 + r, n)
    // FV of monthly contributions (annuity)
    const fvMonthly = monthlyNum * ((Math.pow(1 + r, n) - 1) / r)
    const total = fvInitial + fvMonthly
    const totalInvested = initialNum + (monthlyNum * n)
    const gains = total - totalInvested
    return { total, totalInvested, gains, months: n }
  }, [initialNum, monthlyNum, profile.rate, years])

  // Generate data points for the chart
  const chartPoints = useMemo(() => {
    const points: number[] = []
    const r = profile.rate / 12
    const totalMonths = years * 12
    const step = Math.max(1, Math.floor(totalMonths / 20))
    for (let m = 0; m <= totalMonths; m += step) {
      const fvI = initialNum * Math.pow(1 + r, m)
      const fvM = m > 0 ? monthlyNum * ((Math.pow(1 + r, m) - 1) / r) : 0
      points.push(fvI + fvM)
    }
    return points
  }, [initialNum, monthlyNum, profile.rate, years])

  // Build SVG path
  const svgPath = useMemo(() => {
    if (chartPoints.length < 2) return ''
    const max = Math.max(...chartPoints)
    const min = 0
    const range = max - min || 1
    const w = 300
    const h = 60
    return chartPoints.map((val, i) => {
      const x = (i / (chartPoints.length - 1)) * w
      const y = h - ((val - min) / range) * (h - 4) - 2
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' ')
  }, [chartPoints])

  const fillPath = svgPath ? `${svgPath} L300,60 L0,60 Z` : ''

  return (
    <div
      className="scroll"
      style={{ height: '100%', background: c.cream, color: c.ink, display: 'flex', flexDirection: 'column', padding: '52px 22px 30px 22px' }}
    >
      {/* Back */}
      <button
        className="reset tap"
        onClick={() => dispatch({ type: 'GO', screen: 'app' })}
        style={{ display: 'flex', alignItems: 'center', gap: 4, color: c.muted2, fontSize: 13, fontWeight: 600, marginBottom: 12 }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>‹</span> Ruta
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: c.clay, margin: 0 }}>
          Etapa 3 · Multiplicar
        </p>
        <span style={{ background: c.greenChip, color: c.green, fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
          Simulador
        </span>
      </div>
      <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 28, margin: '0 0 18px 0' }}>¿Cuánto crecería tu dinero?</h1>

      {/* Inputs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: c.muted2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Inversión inicial</label>
          <input
            type="number"
            inputMode="numeric"
            value={initial}
            onChange={e => setInitial(e.target.value)}
            style={{ width: '100%', marginTop: 6, padding: '12px 14px', borderRadius: 12, border: `1px solid ${c.cardBorder}`, background: c.card, fontSize: 16, fontWeight: 700, fontFamily: 'inherit', color: c.ink }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: c.muted2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Aporte mensual</label>
          <input
            type="number"
            inputMode="numeric"
            value={monthly}
            onChange={e => setMonthly(e.target.value)}
            style={{ width: '100%', marginTop: 6, padding: '12px 14px', borderRadius: 12, border: `1px solid ${c.cardBorder}`, background: c.card, fontSize: 16, fontWeight: 700, fontFamily: 'inherit', color: c.ink }}
          />
        </div>
      </div>

      {/* Risk profile */}
      <p style={{ fontSize: 11, fontWeight: 700, color: c.muted2, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Perfil de riesgo</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {PROFILES.map(p => {
          const on = profile.key === p.key
          return (
            <button
              key={p.key}
              className="reset tap"
              onClick={() => setProfile(p)}
              style={{ flex: 1, background: on ? c.ink : c.card, color: on ? c.cream : c.ink, border: on ? 'none' : `1px solid ${c.cardBorder}`, borderRadius: 12, padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
            >
              <span style={{ fontSize: 20 }}>{p.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: on ? 700 : 600 }}>{p.label}</span>
              <span style={{ fontSize: 10, color: on ? c.sage : c.muted2 }}>{(p.rate * 100).toFixed(0)}% anual</span>
            </button>
          )
        })}
      </div>

      {/* Years */}
      <p style={{ fontSize: 11, fontWeight: 700, color: c.muted2, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Plazo</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {YEARS_OPTIONS.map(y => {
          const on = years === y
          return (
            <button
              key={y}
              className="reset tap"
              onClick={() => setYears(y)}
              style={{ flex: 1, background: on ? c.ink : c.card, color: on ? c.cream : c.ink, border: on ? 'none' : `1px solid ${c.cardBorder}`, borderRadius: 999, padding: '9px 8px', fontSize: 13, fontWeight: on ? 700 : 600, textAlign: 'center' }}
            >
              {y} {y === 1 ? 'año' : 'años'}
            </button>
          )
        })}
      </div>

      {/* Result card */}
      <div style={{ background: c.ink, color: c.cream, borderRadius: 18, padding: 20, marginBottom: 14 }}>
        <p style={{ fontSize: 12, color: c.sage, margin: '0 0 4px 0', fontWeight: 600 }}>
          En {years} {years === 1 ? 'año' : 'años'} tendrías aprox.
        </p>
        <p style={{ fontFamily: serif, fontSize: 40, fontWeight: 500, margin: '0 0 4px 0' }}>{money(result.total)}</p>
        <p style={{ fontSize: 13, color: result.gains >= 0 ? '#7FBF9C' : '#E8A57F', fontWeight: 700, margin: '0 0 16px 0' }}>
          {result.gains >= 0 ? '▲' : '▼'} +{money(result.gains)} en ganancias
        </p>
        {svgPath && (
          <svg width="100%" height="60" viewBox="0 0 300 60" preserveAspectRatio="none" style={{ display: 'block' }}>
            <path d={fillPath} fill="rgba(196,98,45,0.15)" stroke="none" />
            <path d={svgPath} fill="none" stroke={c.clay} strokeWidth="2.5" />
          </svg>
        )}
      </div>

      {/* Breakdown */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, padding: '14px 16px' }}>
          <p style={{ fontSize: 11, color: c.muted2, margin: '0 0 4px 0', fontWeight: 600 }}>Invertido</p>
          <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{money(result.totalInvested)}</p>
        </div>
        <div style={{ flex: 1, background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, padding: '14px 16px' }}>
          <p style={{ fontSize: 11, color: c.muted2, margin: '0 0 4px 0', fontWeight: 600 }}>Ganancias</p>
          <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: c.green }}>{money(result.gains)}</p>
        </div>
      </div>

      {/* Insight */}
      <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: c.clay, margin: '0 0 4px 0' }}>💡 {profile.emoji} Perfil {profile.label}</p>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: '#43544A', margin: 0 }}>
          {profile.desc}. Rendimiento estimado: {(profile.rate * 100).toFixed(0)}% anual.
          {result.gains > result.totalInvested * 0.5 && ' ¡El interés compuesto hace la diferencia con el tiempo!'}
        </p>
      </div>

      {/* Disclaimer */}
      <p style={{ fontSize: 11, color: c.muted2, textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
        Simulación ilustrativa. Rendimientos pasados no garantizan resultados futuros.<br />
        Ingresarios no custodia tu dinero ni ofrece asesoría financiera.
      </p>
    </div>
  )
}
