import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { useAuth } from '../lib/auth'
import * as api from '../lib/api'
import { c, serif } from '../theme'

interface Msg { role: 'user' | 'coach'; text: string }

const SUGGESTIONS = ['¿Dónde recorto?', '¿Voy bien este mes?', '¿Puedo invertir ya?']

export default function Coach() {
  const { state, dispatch } = useStore()
  const { user, household } = useAuth()
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [simulated, setSimulated] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // Load previous messages from Supabase
  useEffect(() => {
    if (!household) return
    api.fetchCoachMessages(household.id).then((rows) => {
      const history: Msg[] = rows.map((r) => ({
        role: r.role === 'assistant' ? 'coach' : 'user',
        text: r.content,
      }))
      setMsgs(history)
      setLoaded(true)
    })
  }, [household])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, busy])

  async function send(text: string) {
    const q = text.trim()
    if (!q || busy || !user || !household) return
    const next = [...msgs, { role: 'user', text: q } as Msg]
    setMsgs(next)
    setInput('')
    setBusy(true)

    // Save user message to Supabase
    await api.addCoachMessage({
      household_id: household.id,
      user_id: user.id,
      role: 'user',
      content: q,
    })

    try {
      const context = {
        familyName: household.family_name,
        monthRemaining: state.monthRemaining,
        budgets: state.budgets.map((b) => ({ label: b.label, spent: b.spent, limit: b.limit })),
      }
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role === 'coach' ? 'assistant' : 'user', content: m.text })),
          context,
        }),
      })
      const data = (await res.json()) as { reply?: string; simulated?: boolean }
      setSimulated(!!data.simulated)
      const reply = data.reply || 'Tuve un problema. Intenta de nuevo.'
      setMsgs((m) => [...m, { role: 'coach', text: reply }])

      // Save assistant message to Supabase
      await api.addCoachMessage({
        household_id: household.id,
        user_id: user.id,
        role: 'assistant',
        content: reply,
      })
    } catch {
      const fallback = 'No pude conectar. Intenta de nuevo en un momento.'
      setMsgs((m) => [...m, { role: 'coach', text: fallback }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ height: '100dvh', background: c.cream, color: c.ink, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '44px 18px 14px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${c.cardBorder}` }}>
        <button className="reset tap" aria-label="Atrás" onClick={() => dispatch({ type: 'GO', screen: 'app' })} style={{ fontSize: 22, color: c.muted2, lineHeight: 1 }}>‹</button>
        <div style={{ width: 38, height: 38, borderRadius: 999, background: c.ink, color: c.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: serif, fontSize: 18, flex: 'none' }}>G</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Geny · tu coach</p>
          <p style={{ fontSize: 12, color: c.green, margin: 0, fontWeight: 600 }}>● Conoce tus números</p>
        </div>
        <span style={{ background: c.greenChip, color: c.green, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', padding: '4px 8px', borderRadius: 999 }}>AI</span>
      </div>

      {/* Mensajes */}
      <div className="scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 12, padding: '16px 18px' }}>
        {!loaded && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div className="spinner" />
          </div>
        )}
        {loaded && msgs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontFamily: serif, fontSize: 20, margin: '0 0 8px 0', color: c.ink }}>¡Hola! Soy Geny 👋</p>
            <p style={{ fontSize: 14, color: c.muted, margin: 0 }}>Tu coach financiero familiar. Pregúntame sobre tus números, presupuesto, o a dónde se va tu dinero.</p>
          </div>
        )}
        {msgs.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} style={{ alignSelf: 'flex-end', maxWidth: '82%', background: c.ink, color: c.cream, borderRadius: '16px 16px 4px 16px', padding: '11px 14px', fontSize: 14, lineHeight: 1.4 }}>
              {m.text}
            </div>
          ) : (
            <div key={i} style={{ alignSelf: 'flex-start', maxWidth: '90%' }}>
              <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: '16px 16px 16px 4px', padding: '12px 14px', fontSize: 14, lineHeight: 1.5, color: '#2C3A31' }}>
                {m.text}
              </div>
            </div>
          ),
        )}
        {busy && (
          <div style={{ alignSelf: 'flex-start', background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: '16px 16px 16px 4px', padding: '12px 16px', color: c.muted2, fontSize: 14 }}>…</div>
        )}
        <div ref={endRef} />
      </div>

      {/* Sugerencias + input + disclaimer */}
      <div style={{ padding: '10px 18px 22px 18px', borderTop: `1px solid ${c.cardBorder}` }}>
        <div className="hscroll" style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 8, width: 'max-content' }}>
            {SUGGESTIONS.map((s) => (
              <button key={s} className="reset tap" onClick={() => send(s)} style={{ background: c.card, border: `1px solid ${c.cardBorder}`, color: c.muted, borderRadius: 999, padding: '7px 12px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder="Pregúntale a tu coach…"
            style={{ flex: 1, background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 999, padding: '12px 16px', fontSize: 14, color: c.ink, outline: 'none' }}
          />
          <button className="reset tap" aria-label="Enviar" onClick={() => send(input)} style={{ width: 44, height: 44, borderRadius: 999, background: c.clay, color: c.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flex: 'none' }}>↑</button>
        </div>
        <p style={{ fontSize: 10.5, color: c.muted2, textAlign: 'center', margin: '10px 0 0 0', lineHeight: 1.4 }}>
          El coach usa los datos de tu hogar. Puede equivocarse — verifica antes de decidir.{simulated ? ' · modo demo (sin IA)' : ''}
        </p>
      </div>
    </div>
  )
}
