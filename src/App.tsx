import { useAuth } from './lib/auth'
import { useStore } from './store'
import Auth from './screens/Auth'
import Onboarding from './screens/Onboarding'
import Home from './screens/Home'
import Ordenar from './screens/Ordenar'
import Aprender from './screens/Aprender'
import Simulador from './screens/Simulador'
import Coach from './screens/Coach'
import Registro from './screens/Registro'
import OcrScanner from './screens/OcrScanner'
import CierreMes from './screens/CierreMes'
import Historial from './screens/Historial'
import Perfil from './screens/Perfil'
import Presupuesto from './screens/Presupuesto'
import Tribu from './screens/Tribu'
import TabBar from './components/TabBar'
import { c, serif } from './theme'

export default function App() {
  const { user, loading: authLoading } = useAuth()
  const { state, dispatch } = useStore()

  // Loading state
  if (authLoading) {
    return (
      <div style={{ minHeight: '100dvh', background: c.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div className="spinner" />
        <p style={{ color: c.sage, fontSize: 14 }}>Cargando…</p>
      </div>
    )
  }

  // Not authenticated → show auth screen
  if (!user) {
    return <Auth />
  }

  // Authenticated → show app
  let content
  if (state.screen === 'onboarding') {
    content = <Onboarding />
  } else if (state.screen === 'simulador') {
    content = <Simulador />
  } else if (state.screen === 'coach') {
    content = <Coach />
  } else {
    // shell con tabs
    let tabView
    switch (state.tab) {
      case 'hoy':
        tabView = <Home />
        break
      case 'ruta':
        tabView = state.route.stage === 1 ? <Ordenar /> : state.route.stage === 3 ? <Simulador /> : <Aprender />
        break
      case 'presupuesto':
        tabView = <Presupuesto />
        break
      case 'comunidad':
        tabView = <Tribu />
        break
    }
    const showCoach = state.tab === 'hoy' || state.tab === 'comunidad'
    content = (
      <>
        {tabView}
        {showCoach && (
          <button
            className="reset tap"
            aria-label="Abrir Coach"
            onClick={() => dispatch({ type: 'GO', screen: 'coach' })}
            style={{
              position: 'fixed',
              left: 'calc(50% - 240px + 22px)',
              bottom: 100,
              width: 52,
              height: 52,
              borderRadius: 999,
              background: c.ink,
              color: c.cream,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: serif,
              fontSize: 20,
              boxShadow: '0 8px 20px rgba(22,40,30,0.3)',
              zIndex: 5,
            }}
          >
            G
          </button>
        )}
        <TabBar />
      </>
    )
  }

  return (
    <div className="app-container">
      <div style={{ position: 'relative', minHeight: '100dvh', width: '100%' }}>
        {content}
        {state.registroOpen && <Registro />}
        {state.ocrOpen && <OcrScanner />}
        {state.cierreOpen && <CierreMes />}
        {state.historialOpen && <Historial />}
        {state.perfilOpen && <Perfil />}
      </div>
    </div>
  )
}
