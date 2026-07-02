import { useState } from 'react'
import { useStore, MAIN_CATEGORIES, toPrincipal } from '../store'
import { useAuth } from '../lib/auth'
import * as api from '../lib/api'
import { c, serif } from '../theme'

// OCR con opción de cámara real + campos editables
export default function OcrScanner() {
  const { dispatch } = useStore()
  const { user, household } = useAuth()
  const [amount, setAmount] = useState('487.50')
  const [merchant, setMerchant] = useState('Farmacia San Pablo')
  const [catIdx, setCatIdx] = useState(MAIN_CATEGORIES.findIndex((x) => x.key === 'salud'))
  const [saving, setSaving] = useState(false)

  const cat = MAIN_CATEGORIES[catIdx]
  const value = Number(amount) || 0

  async function confirmar() {
    if (value <= 0 || !user || !household) return
    setSaving(true)

    const principal = toPrincipal(value, household.currency, household.currency)

    try {
      const entry = await api.addEntry({
        household_id: household.id,
        user_id: user.id,
        amount: Math.round(value * 100) / 100,
        currency: household.currency,
        principal,
        category_key: cat.key,
        kind: 'gasto',
        merchant,
        has_photo: true,
      })

      if (entry) {
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
            merchant: entry.merchant ?? undefined,
            hasPhoto: entry.has_photo,
            ts: new Date(entry.created_at).getTime(),
          },
        })
        await api.updateStreak(household.id)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="scroll" style={{ position: 'fixed', inset: 0, zIndex: 40, background: c.ink, color: c.cream, display: 'flex', flexDirection: 'column', padding: '48px 22px 26px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button className="reset tap" aria-label="Cerrar" onClick={() => dispatch({ type: 'CLOSE_OCR' })} style={{ fontSize: 15, color: c.sage }}>✕</button>
        <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Escanear ticket</p>
        <span style={{ width: 16 }} />
      </div>

      {/* Zona de foto */}
      <div style={{ position: 'relative', borderRadius: 16, border: `2px solid ${c.clay}`, overflow: 'hidden', marginBottom: 18, background: 'rgba(245,241,233,0.92)' }}>
        <image-slot id="ocr-ticket" shape="rounded" radius="0" placeholder="Toca o arrastra la foto del ticket" style={{ display: 'block', width: '100%', height: '190px' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'linear-gradient(transparent, rgba(22,40,30,0.88))', padding: '20px 14px 12px 14px', display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: '#7FBF9C', flex: 'none' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: c.cream }}>Texto reconocido · 4 campos encontrados</span>
        </div>
      </div>

      {/* Campos extraídos (editables) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Field label="Monto">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: serif, fontSize: 22, color: c.cream }}>$</span>
            <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" style={inputStyle(serif, 22)} />
            <span style={{ fontSize: 12, color: c.sage, fontWeight: 600 }}>{household?.currency ?? 'MXN'}</span>
            <span style={{ marginLeft: 'auto', background: 'rgba(30,107,78,0.25)', color: '#7FBF9C', fontSize: 10.5, fontWeight: 700, padding: '4px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>98% seguro</span>
          </div>
        </Field>
        <Field label="Comercio">
          <input value={merchant} onChange={(e) => setMerchant(e.target.value)} style={inputStyle(undefined, 14.5)} />
        </Field>
        <Field label="Fecha">
          <p style={{ fontSize: 14.5, fontWeight: 600, color: c.cream, margin: 0 }}>Hoy, {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2, '0')}</p>
        </Field>
        <Field label="Categoría sugerida">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>{cat.emoji}</span>
            <span style={{ fontSize: 14.5, fontWeight: 700, color: c.cream }}>{cat.label}</span>
            <button className="reset tap" onClick={() => setCatIdx((i) => (i + 1) % MAIN_CATEGORIES.length)} style={{ marginLeft: 'auto', fontSize: 12.5, fontWeight: 700, color: c.clay }}>
              Cambiar
            </button>
          </div>
        </Field>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 18 }}>
        <button
          className="reset tap"
          onClick={confirmar}
          disabled={saving}
          style={{ width: '100%', background: c.clay, color: c.cream, borderRadius: 999, padding: 15, textAlign: 'center', fontWeight: 700, fontSize: 15, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Guardando…' : `Confirmar gasto · $${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </button>
        <p style={{ fontSize: 11, color: c.sage, textAlign: 'center', margin: '10px 0 0 0', lineHeight: 1.5 }}>
          La foto queda adjunta al registro. Corrige cualquier campo tocándolo.
        </p>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: c.onInkSurface, border: `1px solid ${c.onInkBorder}`, borderRadius: 14, padding: '11px 14px' }}>
      <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.sage, margin: '0 0 5px 0' }}>{label}</p>
      {children}
    </div>
  )
}

function inputStyle(fontFamily: string | undefined, fontSize: number): React.CSSProperties {
  return {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: c.cream,
    fontFamily,
    fontSize,
    fontWeight: fontFamily ? 500 : 600,
    width: '100%',
    minWidth: 0,
    padding: 0,
  }
}
