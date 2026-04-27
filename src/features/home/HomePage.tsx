import { supabase } from '../../lib/supabase'
import { useSession } from '../auth/useSession'

/**
 * Page d'accueil temporaire (placeholder).
 * Sera remplacée par la liste des randonnées au jalon 3.
 */
export default function HomePage() {
  const session = useSession()

  const onLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="font-kara text-3xl tracking-wide">Rutas Piratas</h1>
        <button
          onClick={onLogout}
          className="text-sm text-gray-500 hover:text-ink transition"
        >
          Cerrar sesión
        </button>
      </header>

      <div className="bg-white border border-bone rounded-2xl p-6">
        <p className="text-sm text-gray-500 mb-2">Conectado en tant que</p>
        <p className="font-medium">{session?.user.email}</p>

        <hr className="my-6 border-bone" />

        <p className="text-sm text-gray-600 leading-relaxed">
          Squelette en place. Les prochaines features (randonnées, votes,
          inscriptions, cotisations) seront ajoutées dans <code className="bg-bone/40 px-1 rounded">src/features/</code>.
        </p>
      </div>
    </div>
  )
}
