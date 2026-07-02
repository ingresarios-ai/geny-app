import { useState } from 'react'
import { useStore, categoryLabel, fmt, type Entry } from '../store'
import { useAuth } from '../lib/auth'
import { c, serif } from '../theme'
import ProgressBar from '../components/ProgressBar'

const NODES = ['Ordenar', 'Aprender', 'Multiplicar'] as const

function money(n: number) {
  return '$' + n.toLocaleString('es-MX')
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'hace un momento'
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  return `hace ${Math.floor(hrs / 24)}d`
}

export default function Home() {
  const { state, dispatch } = useStore()
  const { household, members, profile, viewMode, setViewMode, signOut } = useAuth()
  const { budgets, route, entries, monthRemaining } = state
  const latest: Entry | undefined = entries[0]
  const latestMember = latest
    ? members.find((m) => m.id === latest.userId) ?? { id: 'unknown', display_name: 'Familiar', avatar_initial: 'F', avatar_color: c.clay }
    : undefined
  const [cierreDismissed, setCierreDismissed] = useState(false)

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const now = new Date()
  const weekNum = Math.ceil(now.getDate() / 7)
  const monthName = monthNames[now.getMonth()]

  return (
    <div
      className="scroll"
      style={{ minHeight: '100dvh', background: c.cream, color: c.ink, display: 'flex', flexDirection: 'column', paddingBottom: 120 }}
    >
      {/* Header */}
      <div style={{ padding: '48px 22px 12px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 12, color: c.muted2, margin: '0 0 2px 0', fontWeight: 600 }}>
            {viewMode === 'familiar' ? `Familia ${household?.family_name ?? ''}` : `${profile?.display_name ?? 'Mi cuenta'}`}
          </p>
          <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 26, margin: 0 }}>{monthName}, semana {weekNum}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 999, padding: '8px 12px' }}>
            <span style={{ fontSize: 15 }}>🔥</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{route.streak} días</span>
          </div>
          <button
            className="reset tap"
            onClick={signOut}
            aria-label="Cerrar sesión"
            style={{ width: 34, height: 34, borderRadius: 999, background: c.card, border: `1px solid ${c.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
          >
            ↗
          </button>
        </div>
      </div>

      {/* View mode switch: Familiar ↔ Individual */}
      {members.length > 1 && (
        <div style={{ padding: '0 22px 14px 22px' }}>
          <div className="mode-switch">
            <button
              className={`reset tap ${viewMode === 'familiar' ? 'active' : ''}`}
              onClick={() => setViewMode('familiar')}
            >
              👨‍👩‍👧 Familiar
            </button>
            <button
              className={`reset tap ${viewMode === 'individual' ? 'active' : ''}`}
              onClick={() => setViewMode('individual')}
            >
              👤 Individual
            </button>
          </div>
        </div>
      )}

      {/* Notificación: cierre de mes listo */}
      {!cierreDismissed && entries.length > 0 && (
        <div style={{ padding: '0 22px 14px 22px' }}>
          <div
            className="tap"
            onClick={() => dispatch({ type: 'OPEN_CIERRE' })}
            style={{ background: 'rgba(196,98,45,0.12)', border: '1px solid rgba(196,98,45,0.35)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11 }}
          >
            <span style={{ fontSize: 20, flex: 'none' }}>📊</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Tu cierre de mes está listo</p>
              <p style={{ fontSize: 11.5, color: c.muted, margin: 0 }}>Toca para ver el resumen</p>
            </div>
            <button
              className="reset tap"
              aria-label="Descartar"
              onClick={(e) => { e.stopPropagation(); setCierreDismissed(true) }}
              style={{ fontSize: 13, color: c.muted2, flex: 'none', padding: 4 }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Tarjeta Ruta */}
      <div style={{ padding: '0 22px' }}>
        <div style={{ background: c.ink, color: c.cream, borderRadius: 18, padding: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.sage, margin: '0 0 12px 0' }}>
            Tu ruta · Etapa {route.stage} de 3
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 14 }}>
            {NODES.map((label, i) => {
              const n = i + 1
              const active = n === route.stage
              const node = (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <button
                    className="reset tap"
                    onClick={() => {
                      if (n === 2) dispatch({ type: 'SET_TAB', tab: 'ruta' })
                      if (n === 3) dispatch({ type: 'GO', screen: 'simulador' })
                    }}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 999,
                      background: active ? c.clay : 'rgba(245,241,233,0.12)',
                      color: active ? c.cream : c.sage,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {n}
                  </button>
                  <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? c.cream : c.sage }}>{label}</span>
                </div>
              )
              if (i < NODES.length - 1) {
                const filled = i === 0 ? route.progress : 0
                return (
                  <div key={label} style={{ display: 'contents' }}>
                    {node}
                    <div style={{ flex: 1, height: 2, background: 'rgba(245,241,233,0.2)', marginBottom: 20, position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, height: 2, width: `${filled * 100}%`, background: c.clay }} />
                    </div>
                  </div>
                )
              }
              return <div key={label} style={{ display: 'contents' }}>{node}</div>
            })}
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.5, color: c.mist, margin: 0 }}>
            {route.mission || 'Registra tus primeros gastos para comenzar tu ruta.'}
          </p>
        </div>
      </div>

      {/* Este mes */}
      <div style={{ padding: '18px 22px 0 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Este mes</h2>
          <span style={{ fontSize: 12.5, color: monthRemaining >= 0 ? c.green : c.clay, fontWeight: 700 }}>
            {monthRemaining >= 0 ? `Quedan ${money(monthRemaining)}` : `Excedido ${money(Math.abs(monthRemaining))}`}
          </span>
        </div>
        {budgets.length > 0 ? (
          <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 13 }}>
            {budgets.map((b) => {
              const pct = b.limit > 0 ? b.spent / b.limit : 0
              const color = pct >= 0.95 ? c.clay : c.green
              return (
                <div key={b.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 17, flex: 'none' }}>{b.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>
                      <span>{b.label}</span>
                      <span>{money(b.spent)} / {money(b.limit)}</span>
                    </div>
                    <ProgressBar pct={Math.min(pct, 1)} color={color} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: '24px 18px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: c.muted, margin: 0 }}>Aún no hay presupuestos este mes.<br />Registra tu primer gasto para comenzar.</p>
          </div>
        )}
      </div>

      {/* FAB para registrar */}
      <button
        className="reset tap"
        onClick={() => dispatch({ type: 'OPEN_REGISTRO' })}
        style={{
          position: 'fixed',
          right: 'calc(50% - 240px + 22px)',
          bottom: 100,
          width: 56,
          height: 56,
          borderRadius: 999,
          background: c.clay,
          color: c.cream,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          fontWeight: 300,
          boxShadow: '0 8px 20px rgba(196,98,45,0.4)',
          zIndex: 5,
        }}
      >
        +
      </button>

      {/* Actividad familiar */}
      {latest && latestMember && (
        <div style={{ padding: '14px 22px 0 22px' }}>
          <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 999, background: latestMember.avatar_color, color: c.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flex: 'none' }}>
              {latestMember.avatar_initial}
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.45, color: '#43544A', margin: 0 }}>
              <strong style={{ color: c.ink }}>{latestMember.display_name}</strong> registró {fmt(latest.amount, latest.currency)} en {categoryLabel(latest.categoryKey)} {timeAgo(latest.ts)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
