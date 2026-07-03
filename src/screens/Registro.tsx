import { useState } from 'react'
import { useStore, MAIN_CATEGORIES, EXTRA_CATEGORIES, INCOME_CATEGORIES, CURRENCIES, currencyByCode, toPrincipal } from '../store'
import { useAuth } from '../lib/auth'
import * as api from '../lib/api'
import { c, serif } from '../theme'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫']

export default function Registro() {
  const { state, dispatch } = useStore()
  const { user, household, members } = useAuth()
  const [amount, setAmount] = useState('0')
  const [kind, setKind] = useState<'gasto' | 'ingreso'>(state.registroKind)
  const [category, setCategory] = useState(state.registroKind === 'ingreso' ? 'sueldo' : 'super')
  const [member, setMember] = useState(user?.id ?? '')
  const [currency, setCurrency] = useState(household?.currency ?? 'MXN')
  const [showCurrencies, setShowCurrencies] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [saving, setSaving] = useState(false)

  const cur = currencyByCode(currency)
  const [intPart, decRaw] = amount.split('.')
  const hasDot = amount.includes('.')
  const displayInt = intPart === '' || intPart === '0' ? '0' : Number(intPart).toLocaleString('es-MX')
  const decDisplay = hasDot ? (decRaw ?? '').padEnd(2, '0').slice(0, 2) : '00'
  const extraSelected = EXTRA_CATEGORIES.some((x) => x.key === category)

  // Dynamic member list from auth
  const whoOptions = [
    ...members.map((m) => ({ id: m.id, label: m.display_name })),
    ...(members.length > 0 ? [] : [{ id: user?.id ?? '', label: 'Yo' }]),
  ]

  function press(k: string) {
    setAmount((a) => {
      if (k === '⌫') return a.length <= 1 ? '0' : a.slice(0, -1)
      if (k === '.') return a.includes('.') ? a : a + '.'
      if (a.includes('.') && a.split('.')[1].length >= 2) return a
      if (a === '0') return k
      return a + k
    })
  }

  async function guardar() {
    const value = Number(amount)
    if (!value || value <= 0 || !user || !household) return
    setSaving(true)

    const principal = toPrincipal(value, currency, household.currency)

    try {
      // Save to Supabase
      const entry = await api.addEntry({
        household_id: household.id,
        user_id: member || user.id,
        amount: Math.round(value * 100) / 100,
        currency,
        principal,
        category_key: category,
        kind,
      })

      if (entry) {
        // Update local state immediately
        dispatch({
          type: 'ADD_ENTRY_LOCAL',
          entry: {
            id: entry.id,
            amount: Number(entry.amount),
            currency: entry.currency,
            principal: Number(entry.principal),
            categoryKey: entry.category_key,
            userId: entry.user_id,
            kind: entry.kind as 'gasto' | 'ingreso',
            ts: new Date(entry.created_at).getTime(),
          },
        })

        // Update streak
        const { streak } = await api.updateStreak(household.id)
        dispatch({ type: 'UPDATE_STREAK', streak })
      }
    } catch (err) {
      console.error('Error saving entry:', err)
    } finally {
      setSaving(false)
    }
  }

  const now = new Date()
  const timeStr = `hoy, ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'pm' : 'am'}`

  return (
    <div
      className="scroll"
      style={{ position: 'fixed', inset: 0, zIndex: 20, background: c.cream, color: c.ink, display: 'flex', flexDirection: 'column', padding: '48px 22px 26px 22px' }}
    >
      {/* barra superior */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <button className="reset tap" aria-label="Cerrar" onClick={() => dispatch({ type: 'CLOSE_REGISTRO' })} style={{ fontSize: 15, color: c.muted2 }}>✕</button>
        <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Nuevo {kind === 'ingreso' ? 'ingreso' : 'gasto'}</p>
        <button className="reset tap" onClick={() => { const next = kind === 'gasto' ? 'ingreso' : 'gasto'; setKind(next); setCategory(next === 'ingreso' ? 'sueldo' : 'super') }} style={{ fontSize: 13, color: kind === 'ingreso' ? c.green : c.muted2, fontWeight: kind === 'ingreso' ? 700 : 600 }}>
          {kind === 'ingreso' ? 'Gasto' : 'Ingreso'}
        </button>
      </div>

      {/* monto */}
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <p style={{ fontFamily: serif, fontSize: 46, fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>
          {cur.symbol}{displayInt}<span style={{ color: '#C9C3B3' }}>.{decDisplay}</span>
        </p>
      </div>

      {/* chip de moneda + hora + Ticket */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
        <button className="reset tap" onClick={() => setShowCurrencies(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 999, padding: '6px 11px', fontSize: 12.5, fontWeight: 700 }}>
          <span>{cur.flag}</span> {cur.code} <span style={{ color: c.muted2, fontSize: 10 }}>▾</span>
        </button>
        <span style={{ fontSize: 12.5, color: c.muted2 }}>{timeStr}</span>
        <button className="reset tap" onClick={() => dispatch({ type: 'OPEN_OCR' })} style={{ display: 'flex', alignItems: 'center', gap: 5, background: c.ink, color: c.cream, borderRadius: 999, padding: '6px 12px', fontSize: 12.5, fontWeight: 700 }}>
          📷 Ticket
        </button>
      </div>

      {kind === 'gasto' ? (
        <>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.muted2, margin: '0 0 10px 0' }}>Categoría</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: showMore ? 8 : 18 }}>
            {MAIN_CATEGORIES.map((cat) => {
              const on = category === cat.key
              return (
                <button key={cat.key} className="reset tap" onClick={() => setCategory(cat.key)} style={cellStyle(on)}>
                  <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 10, fontWeight: on ? 700 : 600 }}>{cat.label}</span>
                </button>
              )
            })}
            <button
              className="reset tap"
              onClick={() => setShowMore((v) => !v)}
              style={{ background: extraSelected ? c.ink : 'transparent', color: extraSelected ? c.cream : c.muted, border: `1px dashed ${extraSelected ? c.ink : c.cardBorder}`, borderRadius: 14, padding: '10px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
            >
              <span style={{ fontSize: 18 }}>⋯</span>
              <span style={{ fontSize: 10, fontWeight: 600 }}>Más</span>
            </button>
          </div>
          {showMore && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 18 }}>
              {EXTRA_CATEGORIES.map((cat) => {
                const on = category === cat.key
                return (
                  <button key={cat.key} className="reset tap" onClick={() => setCategory(cat.key)} style={cellStyle(on)}>
                    <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                    <span style={{ fontSize: 10, fontWeight: on ? 700 : 600 }}>{cat.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.muted2, margin: '0 0 10px 0' }}>Concepto</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 18 }}>
            {INCOME_CATEGORIES.map((cat) => {
              const on = category === cat.key
              return (
                <button key={cat.key} className="reset tap" onClick={() => setCategory(cat.key)} style={cellStyle(on)}>
                  <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 10, fontWeight: on ? 700 : 600 }}>{cat.label}</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* ¿de quién? */}
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.muted2, margin: '0 0 10px 0' }}>¿De quién?</p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
        {whoOptions.map((w) => {
          const on = member === w.id
          return (
            <button key={w.id} className="reset tap" onClick={() => setMember(w.id)} style={{ flex: 1, background: on ? c.ink : c.card, color: on ? c.cream : c.ink, border: on ? 'none' : `1px solid ${c.cardBorder}`, borderRadius: 999, padding: 11, textAlign: 'center', fontSize: 13, fontWeight: on ? 700 : 600 }}>
              {w.label}
            </button>
          )
        })}
      </div>

      {/* teclado + CTA */}
      <div style={{ marginTop: 'auto', paddingTop: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
          {KEYS.map((k) => (
            <button key={k} className="reset tap" onClick={() => press(k)} style={{ padding: 12, textAlign: 'center', fontSize: 20, fontWeight: 500, background: c.card, borderRadius: 12, color: k === '.' || k === '⌫' ? c.muted2 : c.ink }}>
              {k}
            </button>
          ))}
        </div>
        <button
          className="reset tap"
          onClick={guardar}
          disabled={saving}
          style={{ width: '100%', background: c.clay, color: c.cream, borderRadius: 999, padding: 15, textAlign: 'center', fontWeight: 700, fontSize: 16, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Guardando…' : `Guardar · día ${state.route.streak + 1} de racha 🔥`}
        </button>
      </div>

      {/* selector de moneda */}
      {showCurrencies && (
        <div className="scroll" style={{ position: 'fixed', inset: 0, zIndex: 30, background: c.cream, display: 'flex', flexDirection: 'column', padding: '48px 22px 26px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <button className="reset tap" onClick={() => setShowCurrencies(false)} style={{ fontSize: 13, color: c.muted2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 18 }}>‹</span> Volver
            </button>
            <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Moneda</p>
            <span style={{ width: 40 }} />
          </div>
          <p style={{ fontSize: 12.5, color: c.muted, margin: '0 0 14px 0', lineHeight: 1.4 }}>Cualquier moneda de USA, Canadá y Latinoamérica. Se convierte a tu moneda principal ({household?.currency ?? 'MXN'}) para presupuestos.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CURRENCIES.map((cc) => {
              const on = cc.code === currency
              return (
                <button key={cc.code} className="reset tap" onClick={() => { setCurrency(cc.code); setShowCurrencies(false) }} style={{ display: 'flex', alignItems: 'center', gap: 12, background: on ? c.ink : c.card, color: on ? c.cream : c.ink, border: on ? 'none' : `1px solid ${c.cardBorder}`, borderRadius: 14, padding: '13px 16px' }}>
                  <span style={{ fontSize: 20 }}>{cc.flag}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, flex: 1, textAlign: 'left' }}>{cc.code}</span>
                  <span style={{ fontSize: 13, color: on ? c.sage : c.muted2, fontWeight: 600 }}>{cc.symbol}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function cellStyle(on: boolean): React.CSSProperties {
  return {
    background: on ? c.ink : c.card,
    color: on ? c.cream : c.ink,
    border: on ? 'none' : `1px solid ${c.cardBorder}`,
    borderRadius: 14,
    padding: '10px 4px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  }
}
