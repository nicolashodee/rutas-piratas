import { Link } from 'react-router-dom'
import type { RandonneeWithVotes } from '../../lib/types'
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '../../lib/types'
import CoverImage from '../../components/ui/CoverImage'
import TypeBadge from '../../components/ui/TypeBadge'

interface Props {
  randonnee: RandonneeWithVotes
}

export default function RandonneeCard({ randonnee: r }: Props) {
  const diffColor = r.difficulty ? DIFFICULTY_COLORS[r.difficulty] : null
  const isProgrammed = r.status === 'programmed'

  return (
    <Link
      to={`/randonnees/${r.id}`}
      className="block bg-white border border-bone rounded-2xl overflow-hidden hover:border-gray-300 transition"
    >
      {r.cover_photo_url && (
        <CoverImage src={r.cover_photo_url} alt={r.title} heightClass="h-32" />
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-kara text-lg tracking-wide leading-tight">
            {r.title}
          </h3>
          {isProgrammed && r.type && <TypeBadge type={r.type} />}
        </div>

        {r.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {r.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {r.difficulty && diffColor && (
            <span className={`${diffColor.bg} ${diffColor.text} px-2 py-0.5 rounded-full font-medium`}>
              {DIFFICULTY_LABELS[r.difficulty]}
            </span>
          )}
          {r.duration && (
            <span className="bg-bone/60 text-ink px-2 py-0.5 rounded-full font-medium">
              ⏱ {r.duration}
            </span>
          )}
          {!isProgrammed && (
            <span className="ml-auto text-gray-500">
              ❤ {r.vote_count} {r.vote_count === 1 ? 'voto' : 'votos'}
            </span>
          )}
          {isProgrammed && r.scheduled_at && (
            <span className="ml-auto text-gray-500">
              📅 {formatDate(r.scheduled_at)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })
}
