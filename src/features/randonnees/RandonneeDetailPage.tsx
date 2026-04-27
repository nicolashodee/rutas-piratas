import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import CoverImage from '../../components/ui/CoverImage'
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '../../lib/types'
import TypeBadge from '../../components/ui/TypeBadge'
import { useProfile } from '../auth/useProfile'
import { useRandonnee } from './useRandonnee'
import VoteInterestButton from './VoteInterestButton'
import ScheduleForm from './ScheduleForm'

export default function RandonneeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, error } = useRandonnee(id)
  const { data: profile } = useProfile()
  const [showScheduleForm, setShowScheduleForm] = useState(false)

  if (isLoading) {
    return <p className="text-gray-500 text-sm">Cargando…</p>
  }

  if (isError || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
        {(error as Error)?.message ?? 'No se encontró la ruta.'}
      </div>
    )
  }

  const { randonnee: r } = data
  const isSuggestion = r.status === 'suggestion'
  const isProgrammed = r.status === 'programmed'
  const diffColor = r.difficulty ? DIFFICULTY_COLORS[r.difficulty] : null

  return (
    <div className="space-y-5">
      <Link to="/randonnees" className="text-sm text-gray-500 hover:text-ink inline-block">
        ← Volver
      </Link>

      {/* Cover */}
      {r.cover_photo_url && (
        <CoverImage
          src={r.cover_photo_url}
          alt={r.title}
          heightClass="h-56"
          className="rounded-2xl"
        />
      )}

      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="font-kara text-3xl tracking-wide leading-tight">{r.title}</h1>
          {isProgrammed && r.type && <TypeBadge type={r.type} size="md" />}
        </div>

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
          {isProgrammed && r.scheduled_at && (
            <span className="text-gray-500">
              📅 {new Date(r.scheduled_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} · {r.meeting_time}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {r.description && (
        <Card>
          <p className="text-sm leading-relaxed whitespace-pre-line">{r.description}</p>
        </Card>
      )}

      {/* Bloc SUGGESTION : vote intérêt + programmer */}
      {isSuggestion && (
        <>
          <Card>
            <h2 className="font-medium mb-3">¿Te interesa esta propuesta?</h2>
            <VoteInterestButton randonneeId={r.id} voteCount={r.vote_count} />
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-medium">Programar esta ruta</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Confirmar una fecha y los detalles logísticos
                </p>
              </div>
              <Button
                variant={showScheduleForm ? 'ghost' : 'secondary'}
                onClick={() => setShowScheduleForm((s) => !s)}
              >
                {showScheduleForm ? 'Cancelar' : 'Programar'}
              </Button>
            </div>

            {showScheduleForm && (
              <div className="border-t border-bone pt-4 mt-3">
                <ScheduleForm
                  randonneeId={r.id}
                  isFederatedGuide={!!profile?.is_federated_guide}
                  isAdmin={profile?.role === 'admin'}
                  onScheduled={() => setShowScheduleForm(false)}
                />
              </div>
            )}
          </Card>
        </>
      )}

      {/* Bloc PROGRAMMED : info logistique (les inscriptions seront dans une feature séparée) */}
      {isProgrammed && (
        <Card>
          <h2 className="font-medium mb-3">Información práctica</h2>
          <dl className="space-y-2 text-sm">
            {r.meeting_point_url && (
              <Row label="Punto de encuentro">
                <a
                  href={r.meeting_point_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-moss hover:underline"
                >
                  Abrir en Google Maps ↗
                </a>
              </Row>
            )}
            {r.transport && (
              <Row label="Transporte">
                {r.transport === 'car' ? 'En coche' : 'Transporte público'}
                {r.transport === 'transit' && r.transit_station && (
                  <> · {r.transit_station} ({r.transit_time})</>
                )}
              </Row>
            )}
            {r.spots_total && <Row label="Plazas">{r.spots_total}</Row>}
            {r.type === 'corsaria' && r.price_cents !== null && r.price_cents !== undefined && (
              <Row label="Precio">
                {r.price_cents === 0 ? 'Gratis' : `${(r.price_cents / 100).toFixed(2)} €`}
              </Row>
            )}
            {r.type === 'pirata' && r.whatsapp_url && (
              <Row label="WhatsApp">
                <a
                  href={r.whatsapp_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-moss hover:underline"
                >
                  Unirse al grupo ↗
                </a>
              </Row>
            )}
          </dl>

          <div className="mt-5 pt-4 border-t border-bone text-xs text-gray-400">
            (Las inscripciones llegarán en una próxima iteración.)
          </div>
        </Card>
      )}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="text-gray-500 w-32 flex-shrink-0">{label}</dt>
      <dd className="flex-1">{children}</dd>
    </div>
  )
}
