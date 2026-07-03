import { useStore } from '../store'
import { c, serif } from '../theme'

export default function Aprender() {
  const { state, dispatch } = useStore()
  const { entries, budgets, route } = state

  const totalGastos = entries.filter(e => e.kind === 'gasto').reduce((s, e) => s + e.principal, 0)
  const totalIngresos = entries.filter(e => e.kind === 'ingreso').reduce((s, e) => s + e.principal, 0)
  const ahorro = totalIngresos - totalGastos
  const budgetTotal = budgets.reduce((s, b) => s + b.limit, 0)
  const budgetSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const underBudget = budgetTotal > 0 && budgetSpent <= budgetTotal
  const streak = route.streak

  // Missions for Stage 2: Aprender
  const missions = [
    {
      key: 'budget_review',
      title: 'Revisa tu presupuesto',
      desc: 'Ajusta tus categorías según lo que aprendiste en la Etapa 1.',
      done: budgets.length >= 3,
      icon: '📊',
      action: () => dispatch({ type: 'SET_TAB', tab: 'presupuesto' }),
    },
    {
      key: 'income_registered',
      title: 'Registra todos tus ingresos',
      desc: 'Anota cada fuente de ingreso del mes para ver tu panorama completo.',
      done: totalIngresos > 0,
      icon: '💰',
      action: () => dispatch({ type: 'OPEN_REGISTRO', kind: 'ingreso' }),
    },
    {
      key: 'under_budget',
      title: 'Quédate dentro del presupuesto',
      desc: 'No te pases del límite total que definiste este mes.',
      done: underBudget,
      icon: '🎯',
      action: () => dispatch({ type: 'SET_TAB', tab: 'presupuesto' }),
    },
    {
      key: 'save_something',
      title: 'Genera ahorro positivo',
      desc: 'Que tus ingresos superen tus gastos este mes.',
      done: ahorro > 0 && totalIngresos > 0,
      icon: '🐷',
    },
    {
      key: 'streak14',
      title: 'Logra 14 días de racha',
      desc: 'Dos semanas seguidas registrando. ¡Eres disciplinado!',
      done: streak >= 14,
      progress: Math.min(streak, 14),
      total: 14,
      icon: '🔥',
    },
    {
      key: 'reduce_top',
      title: 'Identifica tu gasto más alto',
      desc: 'Ve a tu cierre de mes y revisa dónde se va más dinero.',
      done: entries.filter(e => e.kind === 'gasto').length >= 10,
      icon: '🔍',
      action: () => dispatch({ type: 'OPEN_CIERRE' }),
    },
  ]

  const completedCount = missions.filter(m => m.done).length
  const allDone = completedCount === missions.length
  const progressPct = completedCount / missions.length

  function advanceToStage3() {
    dispatch({ type: 'SET_STAGE', stage: 3 })
    dispatch({ type: 'SET_TAB', tab: 'ruta' })
  }

  return (
    <div
      className="scroll"
      style={{ height: '100%', background: c.ink, color: c.cream, display: 'flex', flexDirection: 'column', padding: '64px 22px 116px 22px' }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: c.clay, margin: '0 0 8px 0' }}>
        Etapa 2 · Aprender
      </p>
      <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 30, lineHeight: 1.12, margin: '0 0 8px 0' }}>
        Domina tus finanzas
      </h1>
      <p style={{ fontSize: 14, lineHeight: 1.5, color: c.sage, margin: '0 0 22px 0' }}>
        Ahora que registras, aprende a optimizar tu dinero y generar ahorro real.
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
              } else if ('progress' in m) {
                return
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
              cursor: m.done || 'progress' in m ? 'default' : 'pointer',
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
            {!m.done && !('progress' in m) && 'action' in m && (
              <span style={{ fontSize: 16, color: c.sage, flex: 'none' }}>→</span>
            )}
          </button>
        ))}
      </div>

      {/* Advance to Stage 3 */}
      {allDone && (
        <div style={{ marginTop: 'auto', paddingTop: 24 }}>
          <div style={{ background: 'rgba(30,107,78,0.22)', border: '1px solid rgba(127,191,156,0.3)', borderRadius: 16, padding: '18px 16px', textAlign: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 32 }}>🎉</span>
            <p style={{ fontFamily: serif, fontSize: 20, margin: '8px 0 4px 0' }}>¡Etapa completada!</p>
            <p style={{ fontSize: 13, color: c.sage, margin: 0 }}>Dominaste tus finanzas. Ahora aprende a multiplicar.</p>
          </div>
          <button
            className="reset tap"
            onClick={advanceToStage3}
            style={{ width: '100%', background: c.clay, color: c.cream, borderRadius: 999, padding: 15, textAlign: 'center', fontWeight: 700, fontSize: 15 }}
          >
            Avanzar a Etapa 3 · Multiplicar →
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
