import { useEffect, useState } from 'react'
import { useStore, categoryLabel } from '../store'
import { useAuth } from '../lib/auth'
import * as api from '../lib/api'
import { c, serif } from '../theme'

const CATEGORY_COLORS: Record<string, string> = {
  super: '#4CAF50',
  transporte: '#2196F3',
  casa: c.clay,
  ninos: '#F0B04A',
  salud: '#E91E63',
  comer: '#FF9800',
  ropa: '#9C27B0',
  mascotas: '#795548',
  diversion: '#00BCD4',
  deudas: '#F44336',
  regalos: '#E91E63',
  servicios: '#607D8B',
  educacion: '#3F51B5',
  ahorro: c.green,
  otros: '#7E8F83',
}

function catColor(key: string): string {
  return CATEGORY_COLORS[key] ?? '#7E8F83'
}

function money(n: number) {
  return '$' + Math.abs(n).toLocaleString('es-MX', { maximumFractionDigits: 0 })
}

function prevMonthStr(month: string): string {
  const [y, m] = month.split('-').map(Number)
  if (m === 1) return `${y - 1}-12`
  return `${y}-${String(m - 1).padStart(2, '0')}`
}

export default function CierreMes() {
  const { state, dispatch } = useStore()
  const { household } = useAuth()

  const [prevTotal, setPrevTotal] = useState<number | null>(null)
  const [prevIncome, setPrevIncome] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Current month data from store
  const currentEntries = state.entries
  const totalGasto = currentEntries.filter(e => e.kind === 'gasto').reduce((s, e) => s + e.principal, 0)
  const totalIngreso = currentEntries.filter(e => e.kind === 'ingreso').reduce((s, e) => s + e.principal, 0)
  const ahorro = totalIngreso - totalGasto
  const budgetTotal = state.budgets.reduce((s, b) => s + b.limit, 0)

  // Group spending by category
  const spentByCategory: Record<string, number> = {}
  for (const e of currentEntries) {
    if (e.kind === 'gasto') {
      spentByCategory[e.categoryKey] = (spentByCategory[e.categoryKey] ?? 0) + e.principal
    }
  }

  // Sort by amount descending, take top 4
  const sortedCategories = Object.entries(spentByCategory)
    .sort(([, a], [, b]) => b - a)

  // Top 3 + "Otros" for the rest
  const topCategories = sortedCategories.slice(0, 3)
  const othersTotal = sortedCategories.slice(3).reduce((s, [, v]) => s + v, 0)

  const spentItems: { label: string; amount: number; pct: number; color: string }[] = []
  for (const [key, amount] of topCategories) {
    const pct = totalGasto > 0 ? Math.round((amount / totalGasto) * 100) : 0
    spentItems.push({ label: categoryLabel(key), amount, pct, color: catColor(key) })
  }
  if (othersTotal > 0) {
    const pct = totalGasto > 0 ? Math.round((othersTotal / totalGasto) * 100) : 0
    spentItems.push({ label: 'Otros', amount: othersTotal, pct, color: '#7E8F83' })
  }

  // Fetch previous month data for comparison
  useEffect(() => {
    if (!household) return
    const month = api.currentMonth()
    const prev = prevMonthStr(month)

    api.fetchEntries(household.id, prev).then(entries => {
      const prevGastos = entries.filter(e => e.kind === 'gasto').reduce((s, e) => s + Number(e.principal), 0)
      const prevIngresos = entries.filter(e => e.kind === 'ingreso').reduce((s, e) => s + Number(e.principal), 0)
      setPrevTotal(prevGastos)
      setPrevIncome(prevIngresos)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [household])

  // Calculate comparison percentages
  const prevAhorro = prevIncome !== null && prevTotal !== null ? prevIncome - prevTotal : null
  const ahorroDiff = prevAhorro !== null && prevAhorro !== 0
    ? Math.round(((ahorro - prevAhorro) / Math.abs(prevAhorro)) * 100)
    : null

  // Generate dynamic insights
  const topCategory = sortedCategories[0]
  const victory = (() => {
    if (ahorro > 0) {
      return `Este mes lograron ahorrar ${money(ahorro)}. ¡Cada peso cuenta para sus metas!`
    }
    if (prevTotal !== null && totalGasto < prevTotal) {
      const diff = prevTotal - totalGasto
      return `Gastaron ${money(diff)} menos que el mes pasado. ¡Van en la dirección correcta!`
    }
    return 'Registrar sus gastos es el primer paso. ¡Sigan así!'
  })()

  const leak = (() => {
    if (totalGasto > budgetTotal && budgetTotal > 0) {
      const over = totalGasto - budgetTotal
      return `Se pasaron ${money(over)} del presupuesto de ${money(budgetTotal)}. Revisen las categorías más altas.`
    }
    if (topCategory && totalGasto > 0) {
      const [key, amount] = topCategory
      const pct = Math.round((amount / totalGasto) * 100)
      if (pct > 40) {
        return `${categoryLabel(key)} representa el ${pct}% de sus gastos (${money(amount)}). ¿Pueden optimizar ahí?`
      }
    }
    if (sortedCategories.length > 1) {
      const [key, amount] = sortedCategories[sortedCategories.length - 1]
      return `Revisen gastos pequeños en "${categoryLabel(key)}" (${money(amount)}) — las fugas chicas se acumulan.`
    }
    return 'Sigan registrando para detectar fugas en los próximos meses.'
  })()

  const hasData = currentEntries.length > 0

  function compartir() {
    const text = 'La Familia ' + (household?.family_name ?? 'Mi Hogar') + (ahorro > 0 ? ` ahorró ${money(ahorro)} este mes. 💪` : ' cerró su mes con Geny. 💪') + ' #RutaDelDinero'
    if (navigator.share) navigator.share({ title: 'Nuestro cierre de mes', text }).catch(() => {})
    else navigator.clipboard?.writeText(text).then(() => alert('¡Copiado al portapapeles!'))
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

      {!hasData ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '40px 20px', textAlign: 'center' }}>
          <span style={{ fontSize: 48 }}>📭</span>
          <p style={{ fontFamily: serif, fontSize: 22, margin: 0 }}>Sin registros este mes</p>
          <p style={{ fontSize: 14, color: c.sage, margin: 0, lineHeight: 1.5 }}>
            Empieza a registrar gastos e ingresos para ver tu cierre de mes aquí.
          </p>
        </div>
      ) : (
        <>
          {/* Tarjetas gemelas */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, background: ahorro >= 0 ? 'rgba(30,107,78,0.22)' : 'rgba(196,98,45,0.18)', border: `1px solid ${ahorro >= 0 ? 'rgba(127,191,156,0.3)' : 'rgba(196,98,45,0.4)'}`, borderRadius: 16, padding: '16px 16px' }}>
              <p style={{ fontSize: 12, color: ahorro >= 0 ? '#9FD3B6' : '#E8A57F', margin: '0 0 6px 0', fontWeight: 600 }}>
                {ahorro >= 0 ? 'Ahorraron' : 'Déficit'}
              </p>
              <p style={{ fontFamily: serif, fontSize: 28, fontWeight: 500, margin: '0 0 4px 0' }}>{money(ahorro)}</p>
              {ahorroDiff !== null && !loading && (
                <p style={{ fontSize: 12, color: ahorroDiff >= 0 ? '#7FBF9C' : '#E8A57F', fontWeight: 700, margin: 0 }}>
                  {ahorroDiff >= 0 ? '▲' : '▼'} {Math.abs(ahorroDiff)}% vs. mes anterior
                </p>
              )}
              {prevAhorro === null && !loading && (
                <p style={{ fontSize: 12, color: c.mist, margin: 0 }}>Primer mes registrado</p>
              )}
            </div>
            <div style={{ flex: 1, background: c.onInkSurface, border: `1px solid ${c.onInkBorder}`, borderRadius: 16, padding: '16px 16px' }}>
              <p style={{ fontSize: 12, color: c.sage, margin: '0 0 6px 0', fontWeight: 600 }}>Gastaron</p>
              <p style={{ fontFamily: serif, fontSize: 28, fontWeight: 500, margin: '0 0 4px 0' }}>{money(totalGasto)}</p>
              {budgetTotal > 0 ? (
                <p style={{ fontSize: 12, color: totalGasto <= budgetTotal ? c.mist : '#E8A57F', margin: 0 }}>
                  de {money(budgetTotal)} presupuesto
                </p>
              ) : (
                <p style={{ fontSize: 12, color: c.mist, margin: 0 }}>Sin presupuesto definido</p>
              )}
            </div>
          </div>

          {/* A dónde se fue */}
          {spentItems.length > 0 && (
            <div style={{ background: c.onInkSurface, border: `1px solid ${c.onInkBorder}`, borderRadius: 16, padding: 16, marginBottom: 14 }}>
              <p style={{ fontSize: 12.5, fontWeight: 700, margin: '0 0 12px 0' }}>A dónde se fue</p>
              <div style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
                {spentItems.map((s) => (
                  <div key={s.label} style={{ width: `${s.pct}%`, background: s.color, minWidth: s.pct > 0 ? 4 : 0 }} />
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px 14px' }}>
                {spentItems.map((s) => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color, flex: 'none' }} />
                    <span style={{ fontSize: 12, color: c.mist, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{money(s.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <div style={{ background: c.cream, color: c.ink, borderRadius: 14, padding: '13px 15px', display: 'flex', alignItems: 'flex-start', gap: 11 }}>
              <span style={{ fontSize: 20, flex: 'none' }}>🏆</span>
              <div>
                <p style={{ fontSize: 12.5, fontWeight: 700, margin: '0 0 2px 0', color: c.green }}>Su victoria</p>
                <p style={{ fontSize: 13, lineHeight: 1.45, color: '#43544A', margin: 0 }}>{victory}</p>
              </div>
            </div>
            <div style={{ background: 'rgba(196,98,45,0.14)', border: '1px solid rgba(196,98,45,0.4)', borderRadius: 14, padding: '13px 15px', display: 'flex', alignItems: 'flex-start', gap: 11 }}>
              <span style={{ fontSize: 20, flex: 'none' }}>🔍</span>
              <div>
                <p style={{ fontSize: 12.5, fontWeight: 700, margin: '0 0 2px 0', color: '#E8A57F' }}>Una fuga</p>
                <p style={{ fontSize: 13, lineHeight: 1.45, color: '#E8D5C4', margin: 0 }}>{leak}</p>
              </div>
            </div>
          </div>
        </>
      )}

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
