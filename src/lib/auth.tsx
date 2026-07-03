import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

// ---- Types ----
export interface Profile {
  id: string
  display_name: string
  avatar_initial: string
  avatar_color: string
  household_id: string | null
  phone: string | null
  phone_country: string | null
}

export interface Household {
  id: string
  family_name: string
  currency: string
  country: string
  invite_code: string
}

export interface HouseholdMember {
  id: string
  display_name: string
  avatar_initial: string
  avatar_color: string
}

export type ViewMode = 'familiar' | 'individual'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  household: Household | null
  members: HouseholdMember[]
  viewMode: ViewMode
  loading: boolean
  signUp: (email: string, password: string, meta: { display_name: string; family_name: string; phone: string; phone_country: string }) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  joinHousehold: (inviteCode: string) => Promise<{ error: string | null }>
  setViewMode: (mode: ViewMode) => void
  refreshProfile: () => Promise<void>
}

const AuthCtx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [household, setHousehold] = useState<Household | null>(null)
  const [members, setMembers] = useState<HouseholdMember[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('familiar')
  const [loading, setLoading] = useState(true)

  // Load profile and household data
  async function loadUserData(userId: string) {
    // Fetch profile
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (prof) {
      setProfile(prof as Profile)

      // Fetch household
      if (prof.household_id) {
        const { data: hh } = await supabase
          .from('households')
          .select('*')
          .eq('id', prof.household_id)
          .single()

        if (hh) setHousehold(hh as Household)

        // Fetch household members
        const { data: mems } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_initial, avatar_color')
          .eq('household_id', prof.household_id)

        if (mems) setMembers(mems as HouseholdMember[])
      }
    }
  }

  async function refreshProfile() {
    if (user) await loadUserData(user.id)
  }

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        loadUserData(s.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        loadUserData(s.user.id)
      } else {
        setProfile(null)
        setHousehold(null)
        setMembers([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sign up
  async function signUp(
    email: string,
    password: string,
    meta: { display_name: string; family_name: string; phone: string; phone_country: string },
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: meta.display_name,
            family_name: meta.family_name,
            phone: meta.phone,
            phone_country: meta.phone_country,
          },
        },
      })
      if (error) return { error: error.message || 'Error al crear la cuenta' }
      return { error: null }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error inesperado al crear la cuenta'
      return { error: msg }
    }
  }

  // Sign in
  async function signIn(email: string, password: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }

  // Sign out
  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
    setHousehold(null)
    setMembers([])
  }

  // Join household by invite code
  async function joinHousehold(inviteCode: string): Promise<{ error: string | null }> {
    if (!user) return { error: 'No autenticado' }

    // Find household by invite code
    const { data: hh, error: hhErr } = await supabase
      .from('households')
      .select('id')
      .eq('invite_code', inviteCode)
      .single()

    if (hhErr || !hh) return { error: 'Código de invitación no válido' }

    // Update profile to join this household
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ household_id: hh.id })
      .eq('id', user.id)

    if (updateErr) return { error: updateErr.message }

    await loadUserData(user.id)
    return { error: null }
  }

  return (
    <AuthCtx.Provider
      value={{
        user,
        session,
        profile,
        household,
        members,
        viewMode,
        loading,
        signUp,
        signIn,
        signOut,
        joinHousehold,
        setViewMode,
        refreshProfile,
      }}
    >
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
