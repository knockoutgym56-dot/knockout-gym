import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    '[KG] Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY\n' +
    'Local: create .env.local  |  Vercel: add in Project Settings → Environment Variables'
  )
}

export const supabase = createClient(
  SUPABASE_URL  || 'https://placeholder.supabase.co',
  SUPABASE_KEY  || 'placeholder',
  {
    auth: {
      persistSession: true,        // keeps owner logged in across refreshes
      autoRefreshToken: true,      // auto-renews session token
      detectSessionInUrl: true,
    }
  }
)

export const IS_DB_READY = !!(SUPABASE_URL && SUPABASE_KEY)

// Auth helpers
export const getOwnerSession = () => supabase.auth.getSession()
export const loginOwner   = (email, password) => supabase.auth.signInWithPassword({ email, password })
export const logoutOwner  = () => supabase.auth.signOut()
export const changeOwnerPassword = (newPassword) => supabase.auth.updateUser({ password: newPassword })
export const onAuthChange = (cb) => supabase.auth.onAuthStateChange(cb)
