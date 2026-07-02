import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { useAuth } from '../lib/auth'
import * as api from '../lib/api'
import { c, serif } from '../theme'
import ProgressBar from '../components/ProgressBar'

type Seg = 'gasto' | 'metas' | 'pagos'

function money(n: number) {
  return '$' + n.toLocaleString('es-MX')
}

export default function Presupuesto() {
  const [seg, setSeg] = useState<Seg>('metas')

  return (
    <div className="scroll" style={{ minHeight: '100dvh', background: c.cream, color: c.ink, display: 'flex', flexDirection: 'column', paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ padding: '48px 22px 12px 22px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.clay, margin: '0 0 6px 0' }}>Presupuesto</p>
        <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 27, margin: 0 }}>
          {seg === 'gasto' ? 'Este mes' : seg === 'metas' ? 'Nuestras metas' : 'Pagos fijos'}
        </h1>
      </div>

      {/* Segmented control */}
      <div style={{ padding: '0 22px 14px 22px' }}>
        <div style={{ display: 'flex', gap: 4, background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 999, padding: 4 }}>
          {([['gasto', 'Gasto'], ['metas', 'Metas'], ['pagos', 'Pagos']] as [Seg, string][]).map(([k, label]) => {
            const on = seg === k
            return (
              <button key={k} className="reset tap" onClick={() => setSeg(k)} style={{ flex: 1, borderRadius: 999, padding: '9px 0', textAlign: 'center', fontSize: 13, fontWeight: 700, background: on ? c.ink : 'transparent', color: on ? c.cream : c.muted }}>
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ padding: '0 22px' }}>
        {seg === 'gasto' && <GastoView />}
        {seg === 'metas' && <MetasView />}
        {seg === 'pagos' && <PagosView />}
      </div>
    </div>
  )
}

function GastoView() {
  const { state } = useStore()
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: c.muted, fontWeight: 600 }}>Límites por categoría</span>
        <span style={{ fontSize: 12.5, color: state.monthRemaining >= 0 ? c.green : c.clay, fontWeight: 700 }}>
          {state.monthRemaining >= 0 ? `Quedan ${money(state.monthRemaining)}` : `Excedido ${money(Math.abs(state.monthRemaining))}`}
        </span>
      </div>
      {state.budgets.length > 0 ? (
        <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 13 }}>
          {state.budgets.map((b) => {
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
          <p style={{ fontSize: 14, color: c.muted, margin: 0 }}>Aún no hay presupuestos configurados.</p>
        </div>
      )}
    </>
  )
}

function MetasView() {
  const { household } = useAuth()
  const [goals, setGoals] = useState<api.GoalRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!household) return
    api.fetchGoals(household.id).then((g) => { setGoals(g); setLoading(false) })
  }, [household])

  if (loading) return <div style={{ textAlign: 'center', padding: 30 }}><div className="spinner" /></div>

  const totalSaved = goals.reduce((s, g) => s + Number(g.saved), 0)

  return (
    <>
      {/* Resumen */}
      <div style={{ background: c.ink, color: c.cream, borderRadius: 16, padding: '18px 20px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ fontSize: 12, color: c.sage, margin: '0 0 4px 0', fontWeight: 600 }}>Ahorrado en total</p>
          <p style={{ fontFamily: serif, fontSize: 32, fontWeight: 500, margin: 0 }}>{money(totalSaved)}</p>
        </div>
      </div>

      {goals.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
          {goals.map((g) => {
            const pct = Number(g.target) > 0 ? Number(g.saved) / Number(g.target) : 0
            const onTrack = pct >= 0.5
            return (
              <div key={g.id} style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: g.icon_bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flex: 'none' }}>{g.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14.5, fontWeight: 700, margin: 0 }}>{g.name}</p>
                    <p style={{ fontSize: 12, color: c.muted2, margin: 0 }}>{g.subtitle}</p>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: onTrack ? c.green : c.clay }}>{Math.round(pct * 100)}%</span>
                </div>
                <ProgressBar pct={Math.min(pct, 1)} color={onTrack ? c.green : c.clay} height={8} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <span style={{ fontSize: 12.5, color: c.muted, fontWeight: 600 }}>{money(Number(g.saved))} de {money(Number(g.target))}</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: '24px 18px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: c.muted, margin: 0 }}>Aún no tienes metas de ahorro.<br />¡Crea tu primera meta!</p>
        </div>
      )}
    </>
  )
}

function PagosView() {
  const { household } = useAuth()
  const [payments, setPayments] = useState<api.RecurringRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!household) return
    api.fetchRecurring(household.id).then((p) => { setPayments(p); setLoading(false) })
  }, [household])

  if (loading) return <div style={{ textAlign: 'center', padding: 30 }}><div className="spinner" /></div>

  const total = payments.reduce((s, p) => s + Number(p.amount), 0)
  const today = new Date().getDate()
  const thisWeek = payments.filter((p) => p.day_of_month >= today && p.day_of_month <= today + 7)
  const later = payments.filter((p) => p.day_of_month > today + 7 || p.day_of_month < today)

  const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  const currentMonth = MONTHS[new Date().getMonth()]

  return (
    <>
      {/* Resumen */}
      <div style={{ background: c.ink, color: c.cream, borderRadius: 16, padding: '18px 20px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ fontSize: 12, color: c.sage, margin: '0 0 4px 0', fontWeight: 600 }}>Compromiso mensual fijo</p>
          <p style={{ fontFamily: serif, fontSize: 32, fontWeight: 500, margin: 0 }}>{money(total)}</p>
        </div>
        {thisWeek.length > 0 && (
          <p style={{ fontSize: 12.5, color: '#F0B04A', fontWeight: 700, margin: 0, textAlign: 'right' }}>Próximos 7 días<br />· {thisWeek.length} pagos</p>
        )}
      </div>

      {payments.length > 0 ? (
        <>
          {thisWeek.length > 0 && <PagosGroup title="Esta semana" items={thisWeek} month={currentMonth} />}
          {later.length > 0 && <PagosGroup title="Más adelante" items={later} month={currentMonth} dim />}
        </>
      ) : (
        <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: '24px 18px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: c.muted, margin: 0 }}>No hay pagos recurrentes configurados.</p>
        </div>
      )}
    </>
  )
}

function PagosGroup({ title, items, month, dim }: { title: string; items: api.RecurringRow[]; month: string; dim?: boolean }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.muted2, margin: '0 0 10px 0' }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((r) => (
          <div key={r.id} style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: dim ? c.emptyBar : c.ink, color: dim ? c.muted : c.cream, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 'none', lineHeight: 1 }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{String(r.day_of_month).padStart(2, '0')}</span>
              <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.05em' }}>{month}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 2px 0' }}>{r.name}</p>
              <p style={{ fontSize: 11.5, margin: 0, color: c.muted2, fontWeight: 500 }}>
                {r.auto_debit ? 'Débito automático' : 'Pago manual'}
              </p>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{money(Number(r.amount))}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
