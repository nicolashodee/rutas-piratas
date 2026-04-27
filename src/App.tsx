import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './features/auth/LoginPage'
import AuthCallback from './features/auth/AuthCallback'
import RequireAuth from './features/auth/RequireAuth'
import Layout from './components/Layout'
import RandonneesListPage from './features/randonnees/RandonneesListPage'
import ProposeRandonneePage from './features/randonnees/ProposeRandonneePage'
import RandonneeDetailPage from './features/randonnees/RandonneeDetailPage'

export default function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Routes authentifiées (Layout = header + nav + outlet) */}
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/randonnees" replace />} />
        <Route path="randonnees" element={<RandonneesListPage />} />
        <Route path="randonnees/proposer" element={<ProposeRandonneePage />} />
        <Route path="randonnees/:id" element={<RandonneeDetailPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
