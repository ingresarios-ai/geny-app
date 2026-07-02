import { c } from './theme'

// Datos semilla de Presupuesto (6a Metas + 7a Pagos). Estáticos para el demo;
// en prod son `goals` y `recurring` del State (Firestore/Supabase).

export interface Goal {
  id: string
  name: string
  subtitle: string
  icon: string
  iconBg: string
  iconColor: string
  saved: number
  target: number
  pct: number
  onTrack: boolean
  contributors?: string[] // ids de miembros que aportan
  pace?: string // ritmo requerido si va atrasada
}

export const SAVINGS_TOTAL = 18400
export const SAVINGS_MONTH = 2150

export const GOALS: Goal[] = [
  {
    id: 'emergencia',
    name: 'Fondo de emergencia',
    subtitle: 'Meta: 3 meses de gastos',
    icon: '🛟',
    iconBg: '#E7EFE9',
    iconColor: c.green,
    saved: 13600,
    target: 20000,
    pct: 0.68,
    onTrack: true,
    contributors: ['luis', 'mariana'],
  },
  {
    id: 'vacaciones',
    name: 'Vacaciones diciembre',
    subtitle: 'Meta: dic 2026',
    icon: '🏖️',
    iconBg: '#F3E9DC',
    iconColor: c.clayDark,
    saved: 5100,
    target: 15000,
    pct: 0.34,
    onTrack: false,
    pace: '$2,640/mes para llegar',
  },
]

export interface Recurring {
  id: string
  name: string
  day: string
  month: string
  amount: number
  status: string
  amber?: boolean // recordatorio próximo (ámbar) vs. débito automático (muted)
  week: boolean // cae en los próximos 7 días
}

export const FIXED_MONTHLY = 8940

// ---- 3a La Tribu (videos). Thumbnails = image-slot (placeholders). ----
export interface Video {
  id: string
  title: string
  sub: string // ata el video a la Ruta
  dur: string
  locked?: boolean
}
export const TRIBU_FILTERS = ['Para tu etapa', 'Método', 'Inversión', 'En pareja']
export const VIDEOS: Video[] = [
  { id: 'v1', title: 'A dónde se va tu dinero, en pareja', sub: 'Vinculado a tu reto de 5 días', dur: '12:40' },
  { id: 'v2', title: 'El sobre de emergencia familiar', sub: 'Cap. 2 del Método', dur: '8:15' },
  { id: 'v3', title: 'Riesgo y diversificación sin jerga', sub: 'Se abre en Etapa 3', dur: '—', locked: true },
  { id: 'v4', title: 'Tu primer presupuesto que sí funciona', sub: 'Recomendado para ti', dur: '15:20' },
]

export const RECURRING: Recurring[] = [
  { id: 'renta', name: 'Renta', day: '05', month: 'JUL', amount: 6500, status: 'Débito automático', week: true },
  { id: 'gym', name: 'Gimnasio', day: '07', month: 'JUL', amount: 650, status: 'En 2 días · te recordamos mañana', amber: true, week: true },
  { id: 'netflix', name: 'Netflix', day: '15', month: 'JUL', amount: 159, status: 'Débito automático', week: false },
  { id: 'spotify', name: 'Spotify', day: '20', month: 'JUL', amount: 129, status: 'Débito automático', week: false },
  { id: 'max', name: 'Max', day: '22', month: 'JUL', amount: 169, status: 'Débito automático', week: false },
]
