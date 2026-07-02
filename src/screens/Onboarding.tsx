import { useState } from 'react'
import { useStore, type Stage } from '../store'
import { useAuth } from '../lib/auth'
import * as api from '../lib/api'
import { c, serif } from '../theme'

const OPTIONS: { stage: Stage; title: string; desc: string }[] = [
  { stage: 1, title: 'No sé a dónde se va', desc: 'Llegamos justos a fin de mes y no hay registro claro.' },
  { stage: 2, title: 'Controlamos, pero no crece', desc: 'Hay presupuesto y algo de ahorro, sin plan para invertirlo.' },
  { stage: 3, title: 'Listos para multiplicar', desc: 'Ahorramos cada mes y queremos aprender a invertir bien.' },
]

export default function Onboarding() {
  const { dispatch } = useStore()
  const { household } = useAuth()
  const [selected, setSelected] = useState<Stage>(1)
  const [saving, setSaving] = useState(false)

  function invitePareja() {
    if (!household) return
    const url = `${window.location.origin}?invite=${household.invite_code}`
    if (navigator.share) {
      navigator.share({ title: 'Únete a nuestra ruta en Geny', url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url).then(() => alert('Link copiado al portapapeles'))
    }
  }

  async function empezar() {
    if (!household) return
    setSaving(true)
    try {
      await api.updateRouteProgress(household.id, {
        stage: selected,
        progress: 0,
        mission: selected === 1
          ? 'Registra 7 días seguidos para desbloquear "Tu primer presupuesto que sí funciona".'
          : selected === 2
            ? 'Completa tu presupuesto y define tu primera meta de ahorro.'
            : 'Explora el simulador y aprende riesgo con dinero virtual.',
      })
      dispatch({ type: 'SET_STAGE', stage: selected })
      dispatch({ type: 'FINISH_ONBOARDING' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="scroll"
      style={{
        minHeight: '100dvh',
        background: c.ink,
        color: c.cream,
        display: 'flex',
        flexDirection: 'column',
        padding: '58px 24px 40px 24px',
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: c.clay, margin: '0 0 14px 0' }}>
        Geny <span style={{ color: c.sage }}>by INGRESARIOS</span>
      </p>
      <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 34, lineHeight: 1.1, margin: '0 0 10px 0', textWrap: 'balance' as any }}>
        ¿Dónde está el dinero de tu familia hoy?
      </h1>
      <p style={{ fontSize: 14.5, lineHeight: 1.55, color: c.sage, margin: '0 0 28px 0' }}>
        Sé honesto. Tu ruta empieza donde estás, no donde quisieras estar.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {OPTIONS.map((o) => {
          const on = selected === o.stage
          return (
            <button
              key={o.stage}
              className="reset tap"
              onClick={() => setSelected(o.stage)}
              style={{
                background: on ? c.cream : c.onInkSurface,
                color: on ? c.ink : c.cream,
                borderRadius: 16,
                padding: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                border: on ? `2px solid ${c.clay}` : `1px solid ${c.onInkBorderStrong}`,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: on ? c.clay : 'rgba(245,241,233,0.12)',
                  color: c.cream,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: serif,
                  fontSize: 19,
                  flex: 'none',
                }}
              >
                {o.stage}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 2px 0' }}>{o.title}</p>
                <p style={{ fontSize: 12.5, color: on ? c.muted : c.sage, margin: 0, lineHeight: 1.4 }}>{o.desc}</p>
              </div>
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 24 }}>
        <button
          className="reset tap"
          onClick={invitePareja}
          style={{
            background: c.onInkSurface,
            border: '1px dashed rgba(245,241,233,0.3)',
            borderRadius: 14,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex' }}>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: c.clay, color: c.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, border: `2px solid ${c.ink}` }}>M</div>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: c.green, color: c.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, border: `2px solid ${c.ink}`, marginLeft: -8 }}>+</div>
          </div>
          <p style={{ fontSize: 13, color: c.mist, margin: 0, lineHeight: 1.4 }}>
            Invita a tu pareja — la ruta se camina mejor en equipo. <strong style={{ color: c.cream }}>Gratis, siempre.</strong>
          </p>
        </button>
        <button
          className="reset tap"
          onClick={empezar}
          disabled={saving}
          style={{ background: c.clay, color: c.cream, borderRadius: 999, padding: 17, textAlign: 'center', fontWeight: 700, fontSize: 16, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Guardando…' : 'Empezar mi ruta'}
        </button>
      </div>
    </div>
  )
}
