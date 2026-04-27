import { createClient } from '@supabase/supabase-js'

// Variables exposées au navigateur (préfixe VITE_).
// Définies dans .env à la racine — voir .env.example.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Erreur explicite au boot — préférable à des erreurs silencieuses runtime
  throw new Error(
    'Variables Supabase manquantes. Vérifie que .env contient VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.',
  )
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
