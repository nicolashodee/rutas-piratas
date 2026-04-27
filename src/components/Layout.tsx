import { Link, NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useProfile } from '../features/auth/useProfile'

export default function Layout() {
  const { data: profile } = useProfile()
  const isAdmin = profile?.role === 'admin'

  const onLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="bg-ink text-parchment border-b-2 border-gold/40 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-kara text-2xl tracking-wider text-parchment group-hover:text-gold transition">
              Rutas Piratas
            </span>
            <span className="text-gold text-base leading-none mt-1">⚓</span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavItem to="/randonnees">Rutas</NavItem>
            {isAdmin && <NavItem to="/admin">Admin</NavItem>}
            <button
              onClick={onLogout}
              className="ml-2 text-sm text-parchment/60 hover:text-gold transition px-3 py-1.5"
            >
              Salir
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'text-sm px-3 py-1.5 rounded transition relative',
          isActive
            ? 'text-gold font-medium'
            : 'text-parchment/80 hover:text-parchment',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {children}
          {isActive && (
            <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 bg-gold rounded-full" />
          )}
        </>
      )}
    </NavLink>
  )
}
