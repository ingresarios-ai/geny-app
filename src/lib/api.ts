import { supabase } from './supabase'

// ---- Entries (gastos / ingresos) ----
export interface EntryRow {
  id: string
  household_id: string
  user_id: string
  amount: number
  currency: string
  principal: number
  category_key: string
  kind: 'gasto' | 'ingreso'
  merchant: string | null
  has_photo: boolean
  created_at: string
}

export async function fetchEntries(householdId: string, month?: string): Promise<EntryRow[]> {
  let q = supabase
    .from('entries')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (month) {
    // month format: '2026-07'
    q = q.gte('created_at', `${month}-01`).lt('created_at', nextMonth(month))
  }

  const { data } = await q
  return (data ?? []) as EntryRow[]
}

export async function addEntry(entry: {
  household_id: string
  user_id: string
  amount: number
  currency: string
  principal: number
  category_key: string
  kind: 'gasto' | 'ingreso'
  merchant?: string
  has_photo?: boolean
}): Promise<EntryRow | null> {
  const { data, error } = await supabase
    .from('entries')
    .insert(entry)
    .select()
    .single()

  if (error) { console.error('addEntry error:', error); return null }
  return data as EntryRow
}

// ---- Budgets ----
export interface BudgetRow {
  id: string
  household_id: string
  key: string
  label: string
  emoji: string
  budget_limit: number
  month: string
}

export async function fetchBudgets(householdId: string, month: string): Promise<BudgetRow[]> {
  const { data } = await supabase
    .from('budgets')
    .select('*')
    .eq('household_id', householdId)
    .eq('month', month)

  return (data ?? []) as BudgetRow[]
}

export async function upsertBudget(budget: {
  household_id: string
  key: string
  label: string
  emoji: string
  budget_limit: number
  month: string
}): Promise<void> {
  await supabase.from('budgets').upsert(budget, { onConflict: 'household_id,key,month' })
}

// ---- Goals ----
export interface GoalRow {
  id: string
  household_id: string
  name: string
  subtitle: string | null
  icon: string
  icon_bg: string
  target: number
  saved: number
  deadline: string | null
  created_at: string
}

export async function fetchGoals(householdId: string): Promise<GoalRow[]> {
  const { data } = await supabase
    .from('goals')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at')

  return (data ?? []) as GoalRow[]
}

export async function addGoal(goal: {
  household_id: string
  name: string
  subtitle?: string
  icon?: string
  icon_bg?: string
  target: number
  deadline?: string
}): Promise<GoalRow | null> {
  const { data, error } = await supabase.from('goals').insert(goal).select().single()
  if (error) { console.error('addGoal error:', error); return null }
  return data as GoalRow
}

export async function updateGoalSaved(goalId: string, saved: number): Promise<void> {
  await supabase.from('goals').update({ saved }).eq('id', goalId)
}

// ---- Recurring Payments ----
export interface RecurringRow {
  id: string
  household_id: string
  name: string
  amount: number
  day_of_month: number
  auto_debit: boolean
  created_at: string
}

export async function fetchRecurring(householdId: string): Promise<RecurringRow[]> {
  const { data } = await supabase
    .from('recurring_payments')
    .select('*')
    .eq('household_id', householdId)
    .order('day_of_month')

  return (data ?? []) as RecurringRow[]
}

export async function addRecurring(payment: {
  household_id: string
  name: string
  amount: number
  day_of_month: number
  auto_debit?: boolean
}): Promise<RecurringRow | null> {
  const { data, error } = await supabase.from('recurring_payments').insert(payment).select().single()
  if (error) { console.error('addRecurring error:', error); return null }
  return data as RecurringRow
}

export async function deleteRecurring(id: string): Promise<void> {
  await supabase.from('recurring_payments').delete().eq('id', id)
}

// ---- Route Progress ----
export interface RouteProgressRow {
  id: string
  household_id: string
  stage: number
  progress: number
  streak: number
  last_logged: string | null
  mission: string | null
}

export async function fetchRouteProgress(householdId: string): Promise<RouteProgressRow | null> {
  const { data } = await supabase
    .from('route_progress')
    .select('*')
    .eq('household_id', householdId)
    .single()

  return data as RouteProgressRow | null
}

export async function updateRouteProgress(householdId: string, updates: Partial<RouteProgressRow>): Promise<void> {
  await supabase.from('route_progress').update(updates).eq('household_id', householdId)
}

export async function updateStreak(householdId: string): Promise<{ streak: number; alreadyLogged: boolean }> {
  const route = await fetchRouteProgress(householdId)
  if (!route) return { streak: 0, alreadyLogged: false }

  const today = new Date().toISOString().slice(0, 10)
  if (route.last_logged === today) {
    return { streak: route.streak, alreadyLogged: true }
  }

  const newStreak = route.streak + 1
  await supabase
    .from('route_progress')
    .update({ streak: newStreak, last_logged: today })
    .eq('household_id', householdId)

  return { streak: newStreak, alreadyLogged: false }
}

// ---- Coach Messages ----
export interface CoachMessageRow {
  id: string
  household_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export async function fetchCoachMessages(householdId: string, limit = 50): Promise<CoachMessageRow[]> {
  const { data } = await supabase
    .from('coach_messages')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at')
    .limit(limit)

  return (data ?? []) as CoachMessageRow[]
}

export async function addCoachMessage(msg: {
  household_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
}): Promise<void> {
  await supabase.from('coach_messages').insert(msg)
}

// ---- Household ----
export async function updateHousehold(householdId: string, updates: { family_name?: string; currency?: string; country?: string }): Promise<void> {
  await supabase.from('households').update(updates).eq('id', householdId)
}

// ---- Helpers ----
function nextMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
  return `${next}-01`
}

export function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
