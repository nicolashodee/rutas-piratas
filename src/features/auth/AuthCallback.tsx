import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from './useSession'

/**
 * Route /auth/callback — Supabase redirige ici après clic sur le magic link.
 * detectSessionInUrl: true (dans supabase.ts) lit le hash et persiste la session.
 * On attend que la session apparaisse, puis on redirige vers /.
 */
export default function AuthCallback() {
  const session = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (session === undefined) return // encore en train de charger
    navigate(session ? '/' : '/login', { replace: true })
  }, [session, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Conectando…</p>
    </div>
  )
}
