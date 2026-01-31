// src/hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<null | NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>>['data']['user']>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // If Supabase env vars are not provided, skip auth calls and render app
    const hasSupabaseEnv = Boolean(
      // Vite exposes envs on import.meta.env
      (import.meta as any).env?.VITE_SUPABASE_URL && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY
    )

    // Allow explicit bypass for development/demo
    const disableAuth = (import.meta as any).env?.VITE_DISABLE_AUTH === 'true'

    if (disableAuth) {
      if (isMounted) {
        // Provide a minimal fake user object
        setUser({ id: 'dev-user', email: 'dev@local', role: 'dev' } as any)
        setLoading(false)
      }
      return () => { isMounted = false }
    }

    if (!hasSupabaseEnv) {
      if (isMounted) {
        setUser(null)
        setLoading(false)
      }
      return () => {
        isMounted = false
      }
    }

    // initial fetch – wait before rendering protected routing decisions
    supabase.auth.getUser().then(({ data }) => {
      if (isMounted) {
        setUser(data.user ?? null)
        setLoading(false)
      }
    })

    // subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      setUser(session?.user ?? null)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}
