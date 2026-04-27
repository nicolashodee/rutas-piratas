import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { RandonneeStatus } from '../../lib/types'
import { useRandonnees } from './useRandonnees'
import RandonneeCard from './RandonneeCard'
import Button from '../../components/ui/Button'

type Tab = Extract<RandonneeStatus, 'suggestion' | 'programmed'>

const TABS: { key: Tab; label: string }[] = [
  { key: 'programmed', label: 'Programadas' },
  { key: 'suggestion', label: 'Propuestas' },
]

export default function RandonneesListPage() {
  const [tab, setTab] = useState<Tab>('programmed')
  const { data, isLoading, isError, error } = useRandonnees({ status: tab })

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-kara text-2xl tracking-wide">Las rutas</h1>
        <Link to="/randonnees/proposer">
          <Button variant="primary">+ Proponer</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-bone">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition',
              tab === t.key
                ? 'border-ink text-ink'
                : 'border-transparent text-gray-500 hover:text-ink',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {isLoading && <p className="text-gray-500 text-sm">Cargando…</p>}

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Error: {(error as Error).message}
        </div>
      )}

      {data && data.length === 0 && (
        <div className="bg-white border border-bone rounded-2xl p-8 text-center text-gray-500">
          {tab === 'programmed'
            ? 'Aún no hay rutas programadas.'
            : 'Aún no hay propuestas. Sé el primero en proponer una.'}
        </div>
      )}

      {data && data.length > 0 && (
        <div className="grid gap-3">
          {data.map((r) => (
            <RandonneeCard key={r.id} randonnee={r} />
          ))}
        </div>
      )}
    </div>
  )
}
