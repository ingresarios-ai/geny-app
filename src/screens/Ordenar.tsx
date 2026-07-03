import { useStore, categoryLabel } from '../store'
import { c, serif } from '../theme'

function money(n: number) {
  return '$' + n.toLocaleString('es-MX', { maximumFractionDigits: 0 })
}

export default function Ordenar() {
  const { state, dispatch } = useStore()
  const { route, entries, budgets } = state

  // Progress milestones for Stage 1: Ordenar
  const totalGastos = entries.filter(e => e.kind === 'gasto').length
  const totalIngresos = entries.filter(e => e.kind === 'ingreso').length
  const hasBudget = budgets.length > 0
  const streak = route.streak

  // Today's data
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const todayEntries = entries.filter(e => e.ts >= todayStart)

  // Month totals
  const monthGastos = entries.filter(e => e.kind === 'gasto').reduce((s, e) => s + e.principal, 0)
  const monthIngresos = entries.filter(e => e.kind === 'ingreso').reduce((s, e) => s + e.principal, 0)

  // Define missions for Stage 1
  const missions = [
    {
      key: 'registro',
      title: 'Registra tu primer gasto',
      desc: 'El primer paso para saber a dónde se va tu dinero.',
      done: totalGastos >= 1,
      icon: '📝',
      action: () => dispatch({ type: 'OPEN_REGISTRO' }),
    },
    {
      key: 'ingreso',
      title: 'Registra un ingreso',
      desc: 'Anota lo que entra: sueldo, propina, venta, etc.',
      done: totalIngresos >= 1,
      icon: '💰',
      action: () => dispatch({ type: 'OPEN_REGISTRO', kind: 'ingreso' }),
    },
    {
      key: 'racha3',
      title: 'Logra 3 días de racha',
      desc: 'Registra algo cada día por 3 días seguidos.',
      hint: 'Registra un gasto o ingreso cada día. Tu racha crece automáticamente.',
      done: streak >= 3,
      progress: Math.min(streak, 3),
      total: 3,
      icon: '🔥',
      action: () => dispatch({ type: 'OPEN_REGISTRO' }),
    },
    {
      key: 'presupuesto',
      title: 'Crea tu primer presupuesto',
      desc: 'Define cuánto quieres gastar en cada categoría este mes.',
      done: hasBudget,
      icon: '📊',
      action: () => dispatch({ type: 'SET_TAB', tab: 'presupuesto' }),
    },
    {
      key: 'racha7',
      title: 'Logra 7 días de racha',
      desc: 'Una semana completa registrando. ¡Ya eres experto!',
      hint: 'Sigue registrando cada día. Ya llevas ' + streak + ' día' + (streak !== 1 ? 's' : '') + '.',
      done: streak >= 7,
      progress: Math.min(streak, 7),
      total: 7,
      icon: '🏆',
      action: () => dispatch({ type: 'OPEN_REGISTRO' }),
    },
  ]

  const completedCount = missions.filter(m => m.done).length
  const allDone = completedCount === missions.length
  const progressPct = completedCount / missions.length

  // Find the current (first incomplete) mission
  const currentMission = missions.find(m => !m.done)

  function advanceToStage2() {
    dispatch({ type: 'SET_STAGE', stage: 2 })
    dispatch({ type: 'SET_TAB', tab: 'ruta' })
  }

  return (
    <div
      className="scroll"
      style={{ height: '100%', background: c.ink, color: c.cream, display: 'flex', flexDirection: 'column', padding: '64px 22px 116px 22px' }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: c.clay, margin: '0 0 8px 0' }}>
        Etapa 1 · Ordenar
      </p>
      <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 30, lineHeight: 1.12, margin: '0 0 8px 0' }}>
        Pon orden en tu dinero
      </h1>
      <p style={{ fontSize: 14, lineHeight: 1.5, color: c.sage, margin: '0 0 22px 0' }}>
        Completa estas misiones para conocer tus hábitos y desbloquear la siguiente etapa.
      </p>

      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'rgba(245,241,233,0.12)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 999, background: allDone ? c.green : c.clay, width: `${progressPct * 100}%`, transition: 'width 0.4s ease' }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: allDone ? c.green : c.sage, whiteSpace: 'nowrap' }}>
          {completedCount}/{missions.length}
        </span>
      </div>

      {/* Current mission highlight */}
      {currentMission && !allDone && (
        <button
          className="reset tap"
          onClick={() => currentMission.action()}
          style={{
            width: '100%',
            background: 'rgba(196,98,45,0.2)',
            border: '1px solid rgba(196,98,45,0.5)',
            borderRadius: 16,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            textAlign: 'left',
            marginBottom: 16,
          }}
        >
          <div style={{ width: 42, height: 42, borderRadius: 999, background: c.clay, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flex: 'none' }}>
            {currentMission.icon}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.clay, margin: '0 0 3px 0' }}>
              Siguiente misión
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, margin: '0 0 2px 0', color: c.cream }}>{currentMission.title}</p>
            <p style={{ fontSize: 12, color: c.sage, margin: 0 }}>
              {'hint' in currentMission && currentMission.hint ? currentMission.hint : currentMission.desc}
            </p>
          </div>
          <span style={{ fontSize: 18, color: c.clay, flex: 'none' }}>→</span>
        </button>
      )}

      {/* Today's activity (if any) */}
      {todayEntries.length > 0 && (
        <div style={{ background: 'rgba(30,107,78,0.18)', border: '1px solid rgba(127,191,156,0.3)', borderRadius: 14, padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#9FD3B6' }}>✓ Hoy registraste</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#9FD3B6' }}>🔥 {streak} días</span>
          </div>
          {todayEntries.slice(0, 5).map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <span style={{ fontSize: 12.5, color: c.sage }}>{e.kind === 'ingreso' ? '+ ' : '− '}{categoryLabel(e.categoryKey)}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: e.kind === 'ingreso' ? '#9FD3B6' : c.cream }}>{money(e.principal)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Month totals */}
      {entries.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, background: c.onInkSurface, border: `1px solid ${c.onInkBorder}`, borderRadius: 14, padding: '12px 14px' }}>
            <p style={{ fontSize: 10, color: c.sage, margin: '0 0 2px 0', fontWeight: 600 }}>Gastos del mes</p>
            <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{money(monthGastos)}</p>
          </div>
          <div style={{ flex: 1, background: c.onInkSurface, border: `1px solid ${c.onInkBorder}`, borderRadius: 14, padding: '12px 14px' }}>
            <p style={{ fontSize: 10, color: c.sage, margin: '0 0 2px 0', fontWeight: 600 }}>Ingresos</p>
            <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#9FD3B6' }}>{money(monthIngresos)}</p>
          </div>
        </div>
      )}

      {/* Missions list */}
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.sage, margin: '0 0 10px 0' }}>
        Todas las misiones
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {missions.map((m) => (
          <button
            key={m.key}
            className="reset tap"
            onClick={() => {
              if (m.done) return
              m.action()
            }}
            style={{
              background: m.done ? 'rgba(30,107,78,0.18)' : c.onInkSurface,
              border: `1px solid ${m.done ? 'rgba(127,191,156,0.3)' : c.onInkBorder}`,
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              opacity: m.done ? 0.85 : 1,
              cursor: m.done ? 'default' : 'pointer',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                background: m.done ? c.green : 'rgba(245,241,233,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: m.done ? 14 : 16,
                flex: 'none',
              }}
            >
              {m.done ? '✓' : m.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 13.5, margin: '0 0 1px 0', color: m.done ? '#9FD3B6' : c.cream }}>
                {m.title}
              </p>
              <p style={{ fontSize: 11.5, color: m.done ? 'rgba(159,211,182,0.7)' : c.sage, margin: 0 }}>
                {m.done
                  ? '¡Completado!'
                  : 'progress' in m && m.progress !== undefined && m.total
                    ? `${m.progress}/${m.total} — toca para registrar`
                    : m.desc}
              </p>
            </div>
            {!m.done && (
              <span style={{ fontSize: 14, color: c.sage, flex: 'none' }}>→</span>
            )}
          </button>
        ))}
      </div>

      {/* Advance to Stage 2 button */}
      {allDone && (
        <div style={{ marginTop: 'auto', paddingTop: 24 }}>
          <div style={{ background: 'rgba(30,107,78,0.22)', border: '1px solid rgba(127,191,156,0.3)', borderRadius: 16, padding: '18px 16px', textAlign: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 32 }}>🎉</span>
            <p style={{ fontFamily: serif, fontSize: 20, margin: '8px 0 4px 0' }}>¡Etapa completada!</p>
            <p style={{ fontSize: 13, color: c.sage, margin: 0 }}>Ya dominaste el orden. Es hora de aprender a crecer.</p>
          </div>
          <button
            className="reset tap"
            onClick={advanceToStage2}
            style={{ width: '100%', background: c.clay, color: c.cream, borderRadius: 999, padding: 15, textAlign: 'center', fontWeight: 700, fontSize: 15 }}
          >
            Avanzar a Etapa 2 · Aprender →
          </button>
        </div>
      )}
    </div>
  )
}
