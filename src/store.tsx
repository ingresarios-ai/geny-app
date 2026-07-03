import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import { useAuth } from './lib/auth'
import * as api from './lib/api'

// ---- Modelo de estado ----
export type Stage = 1 | 2 | 3
export type Tab = 'hoy' | 'presupuesto' | 'ruta' | 'comunidad'
export type Screen = 'onboarding' | 'app' | 'simulador' | 'coach'

export interface Entry {
  id: string
  amount: number
  currency: string
  principal: number
  categoryKey: string
  userId: string
  kind: 'gasto' | 'ingreso'
  merchant?: string
  hasPhoto?: boolean
  ts: number
}

export interface Budget {
  id: string
  key: string
  label: string
  emoji: string
  spent: number
  limit: number
}

export interface RouteState {
  stage: Stage
  mission: string
  progress: number
  streak: number
  lastLogged: string | null
}

interface State {
  screen: Screen
  tab: Tab
  registroOpen: boolean
  ocrOpen: boolean
  cierreOpen: boolean
  entries: Entry[]
  budgets: Budget[]
  route: RouteState
  monthRemaining: number
  dataLoaded: boolean
}

// ---- Monedas soportadas (USA, Canadá y Latinoamérica) ----
export interface Currency {
  code: string
  flag: string
  symbol: string
  mxn: number
}
export const CURRENCIES: Currency[] = [
  { code: 'MXN', flag: '🇲🇽', symbol: '$', mxn: 1 },
  { code: 'USD', flag: '🇺🇸', symbol: 'US$', mxn: 17.2 },
  { code: 'CAD', flag: '🇨🇦', symbol: 'C$', mxn: 12.6 },
  { code: 'GTQ', flag: '🇬🇹', symbol: 'Q', mxn: 2.2 },
  { code: 'HNL', flag: '🇭🇳', symbol: 'L', mxn: 0.69 },
  { code: 'NIO', flag: '🇳🇮', symbol: 'C$', mxn: 0.47 },
  { code: 'CRC', flag: '🇨🇷', symbol: '₡', mxn: 0.033 },
  { code: 'PAB', flag: '🇵🇦', symbol: 'B/.', mxn: 17.2 },
  { code: 'DOP', flag: '🇩🇴', symbol: 'RD$', mxn: 0.29 },
  { code: 'COP', flag: '🇨🇴', symbol: '$', mxn: 0.0043 },
  { code: 'VES', flag: '🇻🇪', symbol: 'Bs', mxn: 0.47 },
  { code: 'PEN', flag: '🇵🇪', symbol: 'S/', mxn: 4.6 },
  { code: 'BOB', flag: '🇧🇴', symbol: 'Bs', mxn: 2.5 },
  { code: 'BRL', flag: '🇧🇷', symbol: 'R$', mxn: 3.1 },
  { code: 'PYG', flag: '🇵🇾', symbol: '₲', mxn: 0.0023 },
  { code: 'UYU', flag: '🇺🇾', symbol: '$U', mxn: 0.43 },
  { code: 'ARS', flag: '🇦🇷', symbol: '$', mxn: 0.019 },
  { code: 'CLP', flag: '🇨🇱', symbol: '$', mxn: 0.018 },
]
export function currencyByCode(code: string): Currency {
  return CURRENCIES.find((x) => x.code === code) ?? CURRENCIES[0]
}
/** Convierte un monto de una moneda a la principal del hogar. */
export function toPrincipal(amount: number, from: string, principal: string): number {
  const rate = currencyByCode(from).mxn / currencyByCode(principal).mxn
  return Math.round(amount * rate * 100) / 100
}
/** Formatea con el símbolo de la moneda. */
export function fmt(amount: number, code = 'MXN'): string {
  return currencyByCode(code).symbol + amount.toLocaleString('es-MX', { maximumFractionDigits: 2 })
}

// ---- Categorías ----
export interface Category {
  key: string
  label: string
  emoji: string
}
export const MAIN_CATEGORIES: Category[] = [
  { key: 'super', label: 'Súper', emoji: '🛒' },
  { key: 'transporte', label: 'Transporte', emoji: '🚌' },
  { key: 'casa', label: 'Casa', emoji: '🏠' },
  { key: 'ninos', label: 'Niños', emoji: '🎓' },
  { key: 'salud', label: 'Salud', emoji: '💊' },
  { key: 'comer', label: 'Comer fuera', emoji: '🍽️' },
  { key: 'ropa', label: 'Ropa', emoji: '👕' },
  { key: 'mascotas', label: 'Mascotas', emoji: '🐾' },
  { key: 'diversion', label: 'Diversión', emoji: '🎬' },
  { key: 'deudas', label: 'Deudas', emoji: '💳' },
  { key: 'regalos', label: 'Regalos', emoji: '🎁' },
]
export const EXTRA_CATEGORIES: Category[] = [
  { key: 'servicios', label: 'Servicios', emoji: '💡' },
  { key: 'educacion', label: 'Educación', emoji: '📚' },
  { key: 'ahorro', label: 'Ahorro', emoji: '🐷' },
  { key: 'otros', label: 'Otros', emoji: '📦' },
]
const ALL_CATEGORIES = [...MAIN_CATEGORIES, ...EXTRA_CATEGORIES]
export function categoryLabel(key: string): string {
  const cat = ALL_CATEGORIES.find((c) => c.key === key)
  return cat ? cat.label : key.charAt(0).toUpperCase() + key.slice(1)
}

// ---- Initial State ----
const initialState: State = {
  screen: 'onboarding',
  tab: 'hoy',
  registroOpen: false,
  ocrOpen: false,
  cierreOpen: false,
  entries: [],
  budgets: [],
  route: {
    stage: 1,
    mission: 'Registra 7 días seguidos para desbloquear "Tu primer presupuesto que sí funciona".',
    progress: 0,
    streak: 0,
    lastLogged: null,
  },
  monthRemaining: 0,
  dataLoaded: false,
}

// ---- Acciones ----
export interface NewEntry {
  amount: number
  currency: string
  categoryKey: string
  userId: string
  kind: 'gasto' | 'ingreso'
  merchant?: string
  hasPhoto?: boolean
}

type Action =
  | { type: 'SET_STAGE'; stage: Stage }
  | { type: 'FINISH_ONBOARDING' }
  | { type: 'SET_TAB'; tab: Tab }
  | { type: 'GO'; screen: Screen }
  | { type: 'OPEN_REGISTRO' }
  | { type: 'CLOSE_REGISTRO' }
  | { type: 'OPEN_OCR' }
  | { type: 'CLOSE_OCR' }
  | { type: 'OPEN_CIERRE' }
  | { type: 'CLOSE_CIERRE' }
  | { type: 'ADD_ENTRY_LOCAL'; entry: Entry }
  | { type: 'LOAD_DATA'; entries: Entry[]; budgets: Budget[]; route: RouteState; hasOnboarded: boolean }
  | { type: 'UPDATE_STREAK'; streak: number }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_STAGE':
      return { ...state, route: { ...state.route, stage: action.stage } }
    case 'FINISH_ONBOARDING':
      return { ...state, screen: 'app', tab: 'ruta' }
    case 'SET_TAB':
      return { ...state, tab: action.tab }
    case 'GO':
      return { ...state, screen: action.screen }
    case 'OPEN_REGISTRO':
      return { ...state, registroOpen: true }
    case 'CLOSE_REGISTRO':
      return { ...state, registroOpen: false }
    case 'OPEN_OCR':
      return { ...state, ocrOpen: true }
    case 'CLOSE_OCR':
      return { ...state, ocrOpen: false }
    case 'OPEN_CIERRE':
      return { ...state, cierreOpen: true }
    case 'CLOSE_CIERRE':
      return { ...state, cierreOpen: false }
    case 'ADD_ENTRY_LOCAL': {
      const e = action.entry
      const budgets = state.budgets.map((b) =>
        b.key === e.categoryKey && e.kind === 'gasto' ? { ...b, spent: b.spent + e.principal } : b,
      )
      const delta = e.kind === 'gasto' ? -e.principal : e.principal
      return {
        ...state,
        registroOpen: false,
        ocrOpen: false,
        entries: [e, ...state.entries],
        budgets,
        monthRemaining: state.monthRemaining + delta,
      }
    }
    case 'LOAD_DATA': {
      const totalLimit = action.budgets.reduce((s, b) => s + b.limit, 0)
      const totalSpent = action.budgets.reduce((s, b) => s + b.spent, 0)
      return {
        ...state,
        entries: action.entries,
        budgets: action.budgets,
        route: action.route,
        monthRemaining: totalLimit - totalSpent,
        dataLoaded: true,
        screen: action.hasOnboarded ? 'app' : 'onboarding',
      }
    }
    case 'UPDATE_STREAK':
      return { ...state, route: { ...state.route, streak: action.streak } }
    default:
      return state
  }
}

const StoreCtx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { user, household, viewMode } = useAuth()

  // Load data from Supabase when user/household changes
  useEffect(() => {
    if (!user || !household) return

    const month = api.currentMonth()

    async function load() {
      const [entriesRaw, budgetsRaw, routeRaw] = await Promise.all([
        api.fetchEntries(household!.id, month),
        api.fetchBudgets(household!.id, month),
        api.fetchRouteProgress(household!.id),
      ])

      // Filter entries for individual mode
      let filteredEntries = entriesRaw
      if (viewMode === 'individual') {
        filteredEntries = entriesRaw.filter((e) => e.user_id === user!.id)
      }

      const entries: Entry[] = filteredEntries.map((e) => ({
        id: e.id,
        amount: Number(e.amount),
        currency: e.currency,
        principal: Number(e.principal),
        categoryKey: e.category_key,
        userId: e.user_id,
        kind: e.kind as 'gasto' | 'ingreso',
        merchant: e.merchant ?? undefined,
        hasPhoto: e.has_photo,
        ts: new Date(e.created_at).getTime(),
      }))

      // Calculate spent per budget from entries
      const spentMap: Record<string, number> = {}
      for (const e of filteredEntries) {
        if (e.kind === 'gasto') {
          spentMap[e.category_key] = (spentMap[e.category_key] ?? 0) + Number(e.principal)
        }
      }

      const budgets: Budget[] = budgetsRaw.map((b) => ({
        id: b.id,
        key: b.key,
        label: b.label,
        emoji: b.emoji,
        spent: spentMap[b.key] ?? 0,
        limit: Number(b.budget_limit),
      }))

      const route: RouteState = routeRaw
        ? {
            stage: routeRaw.stage as Stage,
            mission: routeRaw.mission ?? '',
            progress: Number(routeRaw.progress),
            streak: routeRaw.streak,
            lastLogged: routeRaw.last_logged,
          }
        : initialState.route

      // If route has progress > 0 or streak > 0, user has onboarded
      const hasOnboarded = route.streak > 0 || route.progress > 0 || entries.length > 0

      dispatch({ type: 'LOAD_DATA', entries, budgets, route, hasOnboarded })
    }

    load()
  }, [user, household, viewMode])

  return <StoreCtx.Provider value={{ state, dispatch }}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore fuera de StoreProvider')
  return ctx
}
