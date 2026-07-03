import { useState } from 'react'
import { useStore, categoryLabel, type Entry } from '../store'
import { useAuth } from '../lib/auth'
import { c, serif } from '../theme'

function money(n: number) {
  return '$' + n.toLocaleString('es-MX', { maximumFractionDigits: 0 })
}

function dayLabel(ts: number): string {
  const d = new Date(ts)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Hoy'
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer'

  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
}

function groupByDay(entries: Entry[]): { label: string; dayTs: number; entries: Entry[]; totalGasto: number; totalIngreso: number }[] {
  const groups = new Map<string, Entry[]>()
  for (const e of entries) {
    const d = new Date(e.ts)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(e)
  }
  return Array.from(groups.entries()).map(([, entries]) => {
    const dayTs = entries[0].ts
    return {
      label: dayLabel(dayTs),
      dayTs,
      entries,
      totalGasto: entries.filter(e => e.kind === 'gasto').reduce((s, e) => s + e.principal, 0),
      totalIngreso: entries.filter(e => e.kind === 'ingreso').reduce((s, e) => s + e.principal, 0),
    }
  }).sort((a, b) => b.dayTs - a.dayTs)
}

export default function Historial() {
  const { state, dispatch } = useStore()
  const { members } = useAuth()
  const { entries } = state

  const [filter, setFilter] = useState<'todos' | 'gasto' | 'ingreso'>('todos')

  const filtered = filter === 'todos' ? entries : entries.filter(e => e.kind === filter)
  const days = groupByDay(filtered)

  // Month totals
  const monthGastos = entries.filter(e => e.kind === 'gasto').reduce((s, e) => s + e.principal, 0)
  const monthIngresos = entries.filter(e => e.kind === 'ingreso').reduce((s, e) => s + e.principal, 0)

  return (
    <div
      className="scroll"
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: c.cream, color: c.ink, display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div style={{ padding: '52px 22px 12px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button
            className="reset tap"
            onClick={() => dispatch({ type: 'CLOSE_HISTORIAL' })}
            style={{ display: 'flex', alignItems: 'center', gap: 4, color: c.muted2, fontSize: 13, fontWeight: 600, marginBottom: 6 }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>‹</span> Inicio
          </button>
          <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 26, margin: 0 }}>Historial</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 12, color: c.muted2, margin: '0 0 2px 0', fontWeight: 600 }}>{entries.length} registros</p>
          <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>
            <span style={{ color: c.clay }}>-{money(monthGastos)}</span>
            {monthIngresos > 0 && <span style={{ color: c.green }}> +{money(monthIngresos)}</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '0 22px 14px 22px' }}>
        <div style={{ display: 'flex', gap: 4, background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 999, padding: 4 }}>
          {([['todos', 'Todos'], ['gasto', 'Gastos'], ['ingreso', 'Ingresos']] as ['todos' | 'gasto' | 'ingreso', string][]).map(([k, label]) => {
            const on = filter === k
            return (
              <button key={k} className="reset tap" onClick={() => setFilter(k)} style={{ flex: 1, borderRadius: 999, padding: '8px 0', textAlign: 'center', fontSize: 12.5, fontWeight: 700, background: on ? c.ink : 'transparent', color: on ? c.cream : c.muted }}>
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Day groups */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 40px 22px' }}>
        {days.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <span style={{ fontSize: 32 }}>📋</span>
            <p style={{ fontSize: 14, color: c.muted, margin: '8px 0 0 0' }}>
              {filter === 'todos' ? 'No hay registros aún.' : `No hay ${filter === 'gasto' ? 'gastos' : 'ingresos'} registrados.`}
            </p>
          </div>
        ) : (
          days.map((day) => (
            <div key={day.label} style={{ marginBottom: 18 }}>
              {/* Day header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{day.label}</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  {day.totalGasto > 0 && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: c.clay }}>-{money(day.totalGasto)}</span>
                  )}
                  {day.totalIngreso > 0 && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: c.green }}>+{money(day.totalIngreso)}</span>
                  )}
                </div>
              </div>

              {/* Entries for this day */}
              <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                {day.entries.map((entry, i) => {
                  const member = members.find(m => m.id === entry.userId)
                  const time = new Date(entry.ts)
                  const timeStr = `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`
                  return (
                    <div
                      key={entry.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 16px',
                        borderBottom: i < day.entries.length - 1 ? `1px solid ${c.cardBorder}` : 'none',
                      }}
                    >
                      {/* Kind indicator */}
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: entry.kind === 'ingreso' ? c.green : c.clay,
                        background: entry.kind === 'ingreso' ? c.greenChip : 'rgba(196,98,45,0.12)',
                        padding: '4px 7px',
                        borderRadius: 6,
                        flex: 'none',
                      }}>
                        {entry.kind === 'ingreso' ? '+' : '−'}
                      </span>

                      {/* Category + details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13.5, fontWeight: 700, margin: '0 0 1px 0' }}>{categoryLabel(entry.categoryKey)}</p>
                        <p style={{ fontSize: 11, color: c.muted2, margin: 0 }}>
                          {timeStr}
                          {entry.merchant && ` · ${entry.merchant}`}
                          {member && members.length > 1 && ` · ${member.display_name}`}
                        </p>
                      </div>

                      {/* Amount */}
                      <span style={{ fontSize: 14, fontWeight: 700, color: entry.kind === 'ingreso' ? c.green : c.ink, flex: 'none' }}>
                        {entry.kind === 'ingreso' ? '+' : '-'}{money(entry.principal)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
