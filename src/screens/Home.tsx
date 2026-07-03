import { useStore, categoryLabel } from '../store'
import { useAuth } from '../lib/auth'
import { c, serif } from '../theme'
import ProgressBar from '../components/ProgressBar'

function money(n: number) {
  return '$' + n.toLocaleString('es-MX', { maximumFractionDigits: 0 })
}

export default function Home() {
  const { state, dispatch } = useStore()
  const { household, profile, viewMode, setViewMode, members } = useAuth()
  const { budgets, route, entries } = state

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const now = new Date()
  const weekNum = Math.ceil(now.getDate() / 7)
  const monthName = monthNames[now.getMonth()]

  // Today's entries
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const todayEntries = entries.filter(e => e.ts >= todayStart)
  const todayGastos = todayEntries.filter(e => e.kind === 'gasto').reduce((s, e) => s + e.principal, 0)
  const todayIngresos = todayEntries.filter(e => e.kind === 'ingreso').reduce((s, e) => s + e.principal, 0)

  // Month totals
  const monthGastos = entries.filter(e => e.kind === 'gasto').reduce((s, e) => s + e.principal, 0)
  const monthIngresos = entries.filter(e => e.kind === 'ingreso').reduce((s, e) => s + e.principal, 0)

  // Has the user logged today?
  const loggedToday = todayEntries.length > 0

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
            onClick={() => dispatch({ type: 'OPEN_PERFIL' })}
            aria-label="Mi perfil"
            style={{ width: 34, height: 34, borderRadius: 999, background: c.ink, color: c.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}
          >
            {profile?.avatar_initial ?? 'U'}
          </button>
        </div>
      </div>

      {/* View mode switch */}
      {members.length > 1 && (
        <div style={{ padding: '0 22px 14px 22px' }}>
          <div className="mode-switch">
            <button className={`reset tap ${viewMode === 'familiar' ? 'active' : ''}`} onClick={() => setViewMode('familiar')}>
              👨‍👩‍👧 Familiar
            </button>
            <button className={`reset tap ${viewMode === 'individual' ? 'active' : ''}`} onClick={() => setViewMode('individual')}>
              👤 Individual
            </button>
          </div>
        </div>
      )}

      {/* ── Daily prompt: not logged today ── */}
      {!loggedToday && (
        <div style={{ padding: '0 22px 14px 22px' }}>
          <button
            className="reset tap"
            onClick={() => dispatch({ type: 'OPEN_REGISTRO' })}
            style={{ width: '100%', background: c.clay, color: c.cream, borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}
          >
            <div style={{ width: 42, height: 42, borderRadius: 999, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flex: 'none' }}>
              📝
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, margin: '0 0 2px 0' }}>¿Qué gastaste hoy?</p>
              <p style={{ fontSize: 12, color: 'rgba(245,241,233,0.7)', margin: 0 }}>
                Registra para mantener tu racha de {route.streak} día{route.streak !== 1 ? 's' : ''} 🔥
              </p>
            </div>
            <span style={{ fontSize: 18, flex: 'none', marginLeft: 'auto' }}>→</span>
          </button>
        </div>
      )}

      {/* ── Today's summary ── */}
      {todayEntries.length > 0 && (
        <div style={{ padding: '0 22px 14px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Hoy</h2>
            <span style={{ fontSize: 12, color: c.green, fontWeight: 700 }}>✓ Racha activa</span>
          </div>

          {/* Today totals */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            {todayGastos > 0 && (
              <div style={{ flex: 1, background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, padding: '12px 14px' }}>
                <p style={{ fontSize: 11, color: c.muted2, margin: '0 0 2px 0', fontWeight: 600 }}>Gastos</p>
                <p style={{ fontSize: 20, fontWeight: 700, margin: 0, color: c.clay }}>{money(todayGastos)}</p>
              </div>
            )}
            {todayIngresos > 0 && (
              <div style={{ flex: 1, background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, padding: '12px 14px' }}>
                <p style={{ fontSize: 11, color: c.muted2, margin: '0 0 2px 0', fontWeight: 600 }}>Ingresos</p>
                <p style={{ fontSize: 20, fontWeight: 700, margin: 0, color: c.green }}>{money(todayIngresos)}</p>
              </div>
            )}
          </div>

          {/* Today's entries list */}
          <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: '4px 0' }}>
            {todayEntries.slice(0, 10).map((entry, i) => (
              <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: i < Math.min(todayEntries.length, 10) - 1 ? `1px solid ${c.cardBorder}` : 'none' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: entry.kind === 'ingreso' ? c.green : c.clay, background: entry.kind === 'ingreso' ? c.greenChip : 'rgba(196,98,45,0.12)', padding: '3px 7px', borderRadius: 6, flex: 'none' }}>
                  {entry.kind === 'ingreso' ? '+' : '−'}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{categoryLabel(entry.categoryKey)}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: entry.kind === 'ingreso' ? c.green : c.ink }}>
                  {entry.kind === 'ingreso' ? '+' : '-'}{money(entry.principal)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial link */}
      {entries.length > 0 && (
        <div style={{ padding: '0 22px 14px 22px' }}>
          <button
            className="reset tap"
            onClick={() => dispatch({ type: 'OPEN_HISTORIAL' })}
            style={{ width: '100%', background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>📋</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 1px 0' }}>Ver historial completo</p>
                <p style={{ fontSize: 11.5, color: c.muted, margin: 0 }}>{entries.length} registros día por día</p>
              </div>
            </div>
            <span style={{ fontSize: 14, color: c.muted, flex: 'none' }}>→</span>
          </button>
        </div>
      )}

      {/* ── Month summary ── */}
      <div style={{ padding: '0 22px 0 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Este mes</h2>
          {entries.length > 0 && (
            <button className="reset tap" onClick={() => dispatch({ type: 'OPEN_CIERRE' })} style={{ fontSize: 12, color: c.clay, fontWeight: 700 }}>
              Ver cierre →
            </button>
          )}
        </div>

        {entries.length > 0 ? (
          <>
            {/* Month totals */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, padding: '12px 14px' }}>
                <p style={{ fontSize: 11, color: c.muted2, margin: '0 0 2px 0', fontWeight: 600 }}>Gastos del mes</p>
                <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{money(monthGastos)}</p>
              </div>
              <div style={{ flex: 1, background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, padding: '12px 14px' }}>
                <p style={{ fontSize: 11, color: c.muted2, margin: '0 0 2px 0', fontWeight: 600 }}>Ingresos del mes</p>
                <p style={{ fontSize: 20, fontWeight: 700, margin: 0, color: c.green }}>{money(monthIngresos)}</p>
              </div>
            </div>

            {/* Budget bars */}
            {budgets.length > 0 && (
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
            )}

            {budgets.length === 0 && (
              <button
                className="reset tap"
                onClick={() => dispatch({ type: 'SET_TAB', tab: 'presupuesto' })}
                style={{ width: '100%', background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}
              >
                <span style={{ fontSize: 20, flex: 'none' }}>📊</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 2px 0' }}>Crea tu presupuesto</p>
                  <p style={{ fontSize: 12, color: c.muted, margin: 0 }}>Define límites por categoría para controlar tus gastos</p>
                </div>
                <span style={{ fontSize: 14, color: c.muted, flex: 'none', marginLeft: 'auto' }}>→</span>
              </button>
            )}
          </>
        ) : (
          /* Empty state for new users */
          <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: '28px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: 32 }}>📊</span>
            <p style={{ fontSize: 14, fontWeight: 600, margin: '8px 0 4px 0' }}>Aquí verás tu resumen del mes</p>
            <p style={{ fontSize: 13, color: c.muted, margin: '0 0 14px 0', lineHeight: 1.4 }}>
              Registra tu primer gasto o ingreso y empieza a ver a dónde se va tu dinero.
            </p>
            <button
              className="reset tap"
              onClick={() => dispatch({ type: 'OPEN_REGISTRO' })}
              style={{ background: c.clay, color: c.cream, borderRadius: 999, padding: '12px 24px', fontWeight: 700, fontSize: 14 }}
            >
              Registrar mi primer gasto →
            </button>
          </div>
        )}
      </div>

      {/* FAB */}
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
    </div>
  )
}
