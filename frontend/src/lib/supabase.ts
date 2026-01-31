// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// If env vars are missing, provide a no-op client to avoid runtime crashes during development
const createNoopClient = () => {
  return {
    auth: {
      async getUser() {
        return { data: { user: null } } as any
      },
      onAuthStateChange(_cb: any) {
        return { data: { subscription: { unsubscribe() {} } } } as any
      },
    },
  } as any
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
        },
      })
    : createNoopClient()
