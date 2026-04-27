import { Navigate } from 'react-router-dom'
import { useSession } from './useSession'

/**
 * Wrapper de route : redirige vers /login si pas connecté.
 * Utilisation :
 *   <Route element={<RequireAuth><Layout /></RequireAuth>}>
 *     <Route path="/" element={<HomePage />} />
 *   </Route>
 */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const session = useSession()

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando…</p>
      </div>
    )
  }

  if (session === null) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
