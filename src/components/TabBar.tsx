import { useStore, type Tab } from '../store'
import { c } from '../theme'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'hoy', label: 'Hoy', icon: '🏠' },
  { key: 'presupuesto', label: 'Presupuesto', icon: '📊' },
  { key: 'ruta', label: 'Ruta', icon: '🗺️' },
  { key: 'comunidad', label: 'Comunidad', icon: '👥' },
]

export default function TabBar() {
  const { state, dispatch } = useStore()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        background: c.card,
        borderTop: `1px solid ${c.cardBorder}`,
        display: 'flex',
        padding: '8px 0 env(safe-area-inset-bottom, 12px) 0',
        zIndex: 10,
      }}
    >
      {TABS.map((t) => {
        const on = state.tab === t.key
        return (
          <button
            key={t.key}
            className="reset tap"
            onClick={() => {
              dispatch({ type: 'SET_TAB', tab: t.key })
              if (state.screen !== 'app') dispatch({ type: 'GO', screen: 'app' })
            }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '6px 0',
            }}
          >
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: on ? 700 : 600,
                color: on ? c.ink : c.muted2,
              }}
            >
              {t.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
