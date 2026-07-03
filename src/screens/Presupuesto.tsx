import { useState, useEffect } from 'react'
import { useStore, MAIN_CATEGORIES, EXTRA_CATEGORIES, type Category } from '../store'
import { useAuth } from '../lib/auth'
import * as api from '../lib/api'
import { c, serif } from '../theme'
import ProgressBar from '../components/ProgressBar'

type Seg = 'gasto' | 'metas' | 'pagos'

function money(n: number) {
  return '$' + n.toLocaleString('es-MX', { maximumFractionDigits: 0 })
}

const ALL_CATS: Category[] = [...MAIN_CATEGORIES, ...EXTRA_CATEGORIES]

export default function Presupuesto() {
  const [seg, setSeg] = useState<Seg>('gasto')

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

/* ═══════════════════════════════════════════════════════ */
/*  GASTO VIEW — Budget limits per category               */
/* ═══════════════════════════════════════════════════════ */
function GastoView() {
  const { state } = useStore()
  const { household } = useAuth()
  const [showAdd, setShowAdd] = useState(false)
  const [selectedCat, setSelectedCat] = useState<Category | null>(null)
  const [limitInput, setLimitInput] = useState('')
  const [saving, setSaving] = useState(false)

  const existingKeys = state.budgets.map(b => b.key)
  const availableCats = ALL_CATS.filter(cat => !existingKeys.includes(cat.key))
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  async function saveBudget() {
    if (!selectedCat || !household || !limitInput) return
    setSaving(true)
    await api.upsertBudget({
      household_id: household.id,
      key: selectedCat.key,
      label: selectedCat.label,
      emoji: selectedCat.emoji,
      budget_limit: Number(limitInput),
      month,
    })
    // Reload page to refresh budgets from store
    window.location.reload()
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: c.muted, fontWeight: 600 }}>Límites por categoría</span>
        <span style={{ fontSize: 12.5, color: state.monthRemaining >= 0 ? c.green : c.clay, fontWeight: 700 }}>
          {state.monthRemaining >= 0 ? `Quedan ${money(state.monthRemaining)}` : `Excedido ${money(Math.abs(state.monthRemaining))}`}
        </span>
      </div>

      {state.budgets.length > 0 && (
        <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 14 }}>
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
      )}

      {/* Add budget form */}
      {!showAdd ? (
        <button
          className="reset tap"
          onClick={() => setShowAdd(true)}
          style={{ width: '100%', background: c.ink, color: c.cream, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}
        >
          + Agregar categoría al presupuesto
        </button>
      ) : (
        <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: c.muted2, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px 0' }}>Categoría</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 14 }}>
            {availableCats.map(cat => {
              const on = selectedCat?.key === cat.key
              return (
                <button key={cat.key} className="reset tap" onClick={() => setSelectedCat(cat)} style={{ background: on ? c.ink : 'transparent', color: on ? c.cream : c.ink, border: `1px solid ${on ? c.ink : c.cardBorder}`, borderRadius: 12, padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 9.5, fontWeight: on ? 700 : 600 }}>{cat.label}</span>
                </button>
              )
            })}
          </div>

          {selectedCat && (
            <>
              <p style={{ fontSize: 12, fontWeight: 700, color: c.muted2, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>
                Límite mensual para {selectedCat.label}
              </p>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Ej: 3000"
                value={limitInput}
                onChange={e => setLimitInput(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${c.cardBorder}`, background: c.cream, fontSize: 16, fontWeight: 700, fontFamily: 'inherit', color: c.ink, marginBottom: 12, boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="reset tap" onClick={() => { setShowAdd(false); setSelectedCat(null); setLimitInput('') }} style={{ flex: 1, padding: 12, borderRadius: 999, border: `1px solid ${c.cardBorder}`, fontSize: 13, fontWeight: 700, color: c.muted }}>
                  Cancelar
                </button>
                <button className="reset tap" onClick={saveBudget} disabled={saving || !limitInput} style={{ flex: 1, padding: 12, borderRadius: 999, background: c.clay, color: c.cream, fontSize: 13, fontWeight: 700, opacity: saving || !limitInput ? 0.5 : 1 }}>
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </>
          )}

          {!selectedCat && availableCats.length === 0 && (
            <p style={{ fontSize: 13, color: c.muted, margin: 0, textAlign: 'center' }}>Ya tienes presupuesto en todas las categorías.</p>
          )}
        </div>
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════════════ */
/*  METAS VIEW — Savings goals                           */
/* ═══════════════════════════════════════════════════════ */
function MetasView() {
  const { household } = useAuth()
  const [goals, setGoals] = useState<api.GoalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [icon, setIcon] = useState('🎯')
  const [saving, setSaving] = useState(false)

  const GOAL_ICONS = ['🎯', '🏠', '🚗', '✈️', '🎓', '💍', '🛟', '📱', '🏖️', '💰', '🎁', '👶']

  useEffect(() => {
    if (!household) return
    api.fetchGoals(household.id).then((g) => { setGoals(g); setLoading(false) })
  }, [household])

  async function saveGoal() {
    if (!household || !name || !target) return
    setSaving(true)
    const row = await api.addGoal({
      household_id: household.id,
      name,
      icon,
      icon_bg: '#E7EFE9',
      target: Number(target),
    })
    if (row) setGoals(prev => [...prev, row])
    setShowAdd(false)
    setName('')
    setTarget('')
    setIcon('🎯')
    setSaving(false)
  }

  async function addToGoal(goal: api.GoalRow, amount: number) {
    const newSaved = Number(goal.saved) + amount
    await api.updateGoalSaved(goal.id, newSaved)
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, saved: newSaved } : g))
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 30 }}><div className="spinner" /></div>

  const totalSaved = goals.reduce((s, g) => s + Number(g.saved), 0)

  return (
    <>
      {/* Summary */}
      <div style={{ background: c.ink, color: c.cream, borderRadius: 16, padding: '18px 20px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ fontSize: 12, color: c.sage, margin: '0 0 4px 0', fontWeight: 600 }}>Ahorrado en total</p>
          <p style={{ fontFamily: serif, fontSize: 32, fontWeight: 500, margin: 0 }}>{money(totalSaved)}</p>
        </div>
        <p style={{ fontSize: 12, color: c.sage, margin: 0, fontWeight: 600 }}>{goals.length} meta{goals.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Goals list */}
      {goals.map((g) => {
        const pct = Number(g.target) > 0 ? Number(g.saved) / Number(g.target) : 0
        const done = pct >= 1
        return (
          <div key={g.id} style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: g.icon_bg || '#E7EFE9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flex: 'none' }}>{g.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14.5, fontWeight: 700, margin: 0 }}>{g.name}</p>
                <p style={{ fontSize: 12, color: c.muted2, margin: 0 }}>{money(Number(g.saved))} de {money(Number(g.target))}</p>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: done ? c.green : c.clay }}>{Math.min(Math.round(pct * 100), 100)}%</span>
            </div>
            <ProgressBar pct={Math.min(pct, 1)} color={done ? c.green : c.clay} height={8} />
            {!done && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {[100, 500, 1000].map(amount => (
                  <button key={amount} className="reset tap" onClick={() => addToGoal(g, amount)} style={{ flex: 1, padding: '8px 0', borderRadius: 999, border: `1px solid ${c.cardBorder}`, fontSize: 12, fontWeight: 700, color: c.ink }}>
                    +{money(amount)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Add goal */}
      {!showAdd ? (
        <button
          className="reset tap"
          onClick={() => setShowAdd(true)}
          style={{ width: '100%', background: c.ink, color: c.cream, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}
        >
          + Agregar meta de ahorro
        </button>
      ) : (
        <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: c.muted2, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Ícono</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {GOAL_ICONS.map(ic => (
              <button key={ic} className="reset tap" onClick={() => setIcon(ic)} style={{ width: 40, height: 40, borderRadius: 10, background: icon === ic ? c.ink : 'transparent', border: `1px solid ${icon === ic ? c.ink : c.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {ic}
              </button>
            ))}
          </div>

          <p style={{ fontSize: 12, fontWeight: 700, color: c.muted2, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>Nombre de la meta</p>
          <input
            type="text"
            placeholder="Ej: Fondo de emergencia"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${c.cardBorder}`, background: c.cream, fontSize: 14, fontFamily: 'inherit', color: c.ink, marginBottom: 12, boxSizing: 'border-box' }}
          />

          <p style={{ fontSize: 12, fontWeight: 700, color: c.muted2, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>¿Cuánto quieres ahorrar?</p>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Ej: 20000"
            value={target}
            onChange={e => setTarget(e.target.value)}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${c.cardBorder}`, background: c.cream, fontSize: 16, fontWeight: 700, fontFamily: 'inherit', color: c.ink, marginBottom: 12, boxSizing: 'border-box' }}
          />

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="reset tap" onClick={() => { setShowAdd(false); setName(''); setTarget(''); setIcon('🎯') }} style={{ flex: 1, padding: 12, borderRadius: 999, border: `1px solid ${c.cardBorder}`, fontSize: 13, fontWeight: 700, color: c.muted }}>
              Cancelar
            </button>
            <button className="reset tap" onClick={saveGoal} disabled={saving || !name || !target} style={{ flex: 1, padding: 12, borderRadius: 999, background: c.clay, color: c.cream, fontSize: 13, fontWeight: 700, opacity: saving || !name || !target ? 0.5 : 1 }}>
              {saving ? 'Guardando…' : 'Crear meta'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════════════ */
/*  PAGOS VIEW — Recurring payments                       */
/* ═══════════════════════════════════════════════════════ */
function PagosView() {
  const { household } = useAuth()
  const [payments, setPayments] = useState<api.RecurringRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [day, setDay] = useState('')
  const [autoDebit, setAutoDebit] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!household) return
    api.fetchRecurring(household.id).then((p) => { setPayments(p); setLoading(false) })
  }, [household])

  async function savePayment() {
    if (!household || !name || !amount || !day) return
    setSaving(true)
    const row = await api.addRecurring({
      household_id: household.id,
      name,
      amount: Number(amount),
      day_of_month: Number(day),
      auto_debit: autoDebit,
    })
    if (row) setPayments(prev => [...prev, row].sort((a, b) => a.day_of_month - b.day_of_month))
    setShowAdd(false)
    setName('')
    setAmount('')
    setDay('')
    setAutoDebit(false)
    setSaving(false)
  }

  async function removePayment(id: string) {
    await api.deleteRecurring(id)
    setPayments(prev => prev.filter(p => p.id !== id))
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 30 }}><div className="spinner" /></div>

  const total = payments.reduce((s, p) => s + Number(p.amount), 0)
  const today = new Date().getDate()
  const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  const currentMonth = MONTHS[new Date().getMonth()]

  return (
    <>
      {/* Summary */}
      <div style={{ background: c.ink, color: c.cream, borderRadius: 16, padding: '18px 20px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ fontSize: 12, color: c.sage, margin: '0 0 4px 0', fontWeight: 600 }}>Compromiso mensual fijo</p>
          <p style={{ fontFamily: serif, fontSize: 32, fontWeight: 500, margin: 0 }}>{money(total)}</p>
        </div>
        <p style={{ fontSize: 12, color: c.sage, margin: 0, fontWeight: 600 }}>{payments.length} pago{payments.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Payments list */}
      {payments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          {payments.map((r) => {
            const isPast = r.day_of_month < today
            return (
              <div key={r.id} style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: isPast ? c.emptyBar : c.ink, color: isPast ? c.muted : c.cream, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 'none', lineHeight: 1 }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{String(r.day_of_month).padStart(2, '0')}</span>
                  <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.05em' }}>{currentMonth}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 2px 0' }}>{r.name}</p>
                  <p style={{ fontSize: 11.5, margin: 0, color: c.muted2, fontWeight: 500 }}>
                    {r.auto_debit ? 'Débito automático' : 'Pago manual'}
                  </p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, marginRight: 8 }}>{money(Number(r.amount))}</span>
                <button className="reset tap" onClick={() => removePayment(r.id)} style={{ fontSize: 14, color: c.muted2, flex: 'none', padding: 4 }}>✕</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add payment */}
      {!showAdd ? (
        <button
          className="reset tap"
          onClick={() => setShowAdd(true)}
          style={{ width: '100%', background: c.ink, color: c.cream, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}
        >
          + Agregar pago fijo
        </button>
      ) : (
        <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: c.muted2, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>Nombre del pago</p>
          <input
            type="text"
            placeholder="Ej: Renta, Netflix, Gym"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${c.cardBorder}`, background: c.cream, fontSize: 14, fontFamily: 'inherit', color: c.ink, marginBottom: 12, boxSizing: 'border-box' }}
          />

          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: c.muted2, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>Monto</p>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Ej: 6500"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${c.cardBorder}`, background: c.cream, fontSize: 16, fontWeight: 700, fontFamily: 'inherit', color: c.ink, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: c.muted2, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>Día del mes</p>
              <input
                type="number"
                inputMode="numeric"
                placeholder="1-31"
                min="1"
                max="31"
                value={day}
                onChange={e => setDay(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${c.cardBorder}`, background: c.cream, fontSize: 16, fontWeight: 700, fontFamily: 'inherit', color: c.ink, boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <button
            className="reset tap"
            onClick={() => setAutoDebit(!autoDebit)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}
          >
            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${autoDebit ? c.green : c.cardBorder}`, background: autoDebit ? c.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.cream, fontSize: 12, fontWeight: 700 }}>
              {autoDebit ? '✓' : ''}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: c.ink }}>Es débito automático</span>
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="reset tap" onClick={() => { setShowAdd(false); setName(''); setAmount(''); setDay(''); setAutoDebit(false) }} style={{ flex: 1, padding: 12, borderRadius: 999, border: `1px solid ${c.cardBorder}`, fontSize: 13, fontWeight: 700, color: c.muted }}>
              Cancelar
            </button>
            <button className="reset tap" onClick={savePayment} disabled={saving || !name || !amount || !day} style={{ flex: 1, padding: 12, borderRadius: 999, background: c.clay, color: c.cream, fontSize: 13, fontWeight: 700, opacity: saving || !name || !amount || !day ? 0.5 : 1 }}>
              {saving ? 'Guardando…' : 'Guardar pago'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
