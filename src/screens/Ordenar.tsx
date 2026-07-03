import { useStore } from '../store'
import { c, serif } from '../theme'

export default function Ordenar() {
  const { state, dispatch } = useStore()
  const { route, entries, budgets } = state

  // Progress milestones for Stage 1: Ordenar
  const totalGastos = entries.filter(e => e.kind === 'gasto').length
  const totalIngresos = entries.filter(e => e.kind === 'ingreso').length
  const hasBudget = budgets.length > 0
  const streak = route.streak

  // Define missions for Stage 1
  const missions = [
    {
      key: 'registro',
      title: 'Registra tu primer gasto',
      desc: 'El primer paso para saber a dónde se va tu dinero.',
      done: totalGastos >= 1,
      icon: '📝',
    },
    {
      key: 'ingreso',
      title: 'Registra un ingreso',
      desc: 'Anota lo que entra: sueldo, propina, venta, etc.',
      done: totalIngresos >= 1,
      icon: '💰',
    },
    {
      key: 'racha3',
      title: 'Logra 3 días de racha',
      desc: 'Registra algo cada día por 3 días seguidos.',
      done: streak >= 3,
      progress: Math.min(streak, 3),
      total: 3,
      icon: '🔥',
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
      done: streak >= 7,
      progress: Math.min(streak, 7),
      total: 7,
      icon: '🏆',
    },
  ]

  const completedCount = missions.filter(m => m.done).length
  const allDone = completedCount === missions.length
  const progressPct = completedCount / missions.length

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'rgba(245,241,233,0.12)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 999, background: allDone ? c.green : c.clay, width: `${progressPct * 100}%`, transition: 'width 0.4s ease' }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: allDone ? c.green : c.sage, whiteSpace: 'nowrap' }}>
          {completedCount}/{missions.length}
        </span>
      </div>

      {/* Missions list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {missions.map((m) => (
          <button
            key={m.key}
            className="reset tap"
            onClick={() => {
              if (m.done) return
              if ('action' in m && m.action) {
                m.action()
              } else if (!m.done) {
                dispatch({ type: 'OPEN_REGISTRO' })
              }
            }}
            style={{
              background: m.done ? 'rgba(30,107,78,0.18)' : c.onInkSurface,
              border: `1px solid ${m.done ? 'rgba(127,191,156,0.3)' : c.onInkBorder}`,
              borderRadius: 16,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              opacity: m.done ? 0.85 : 1,
              cursor: m.done ? 'default' : 'pointer',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                background: m.done ? c.green : 'rgba(245,241,233,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: m.done ? 16 : 18,
                flex: 'none',
              }}
            >
              {m.done ? '✓' : m.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 14.5, margin: '0 0 2px 0', color: m.done ? '#9FD3B6' : c.cream }}>
                {m.title}
              </p>
              <p style={{ fontSize: 12, color: m.done ? 'rgba(159,211,182,0.7)' : c.sage, margin: 0, lineHeight: 1.4 }}>
                {m.done
                  ? '¡Completado!'
                  : 'progress' in m && m.progress !== undefined && m.total
                    ? `${m.desc} (${m.progress}/${m.total})`
                    : m.desc}
              </p>
            </div>
            {!m.done && (
              <span style={{ fontSize: 16, color: c.sage, flex: 'none' }}>→</span>
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

      {!allDone && (
        <div style={{ marginTop: 'auto', paddingTop: 24 }}>
          <button
            className="reset tap"
            onClick={() => dispatch({ type: 'OPEN_REGISTRO' })}
            style={{ width: '100%', background: c.clay, color: c.cream, borderRadius: 999, padding: 15, textAlign: 'center', fontWeight: 700, fontSize: 15 }}
          >
            Registrar un gasto →
          </button>
        </div>
      )}
    </div>
  )
}
