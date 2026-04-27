import { useUserVote } from './useUserVote'
import { useToggleVote } from './useToggleVote'

interface Props {
  randonneeId: string
  voteCount: number
}

/**
 * Bouton "Me interesa" qui toggle l'intérêt du user courant.
 * Affiche le compteur et l'état (voté ou non).
 */
export default function VoteInterestButton({ randonneeId, voteCount }: Props) {
  const { data: hasVoted, isLoading } = useUserVote(randonneeId)
  const toggle = useToggleVote()

  const onClick = () => {
    if (hasVoted === undefined) return
    toggle.mutate({ randonneeId, currentlyVoted: hasVoted })
  }

  const disabled = isLoading || toggle.isPending

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onClick}
        disabled={disabled}
        className={[
          'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          hasVoted
            ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            : 'bg-white text-ink hover:bg-bone/40 border border-bone',
        ].join(' ')}
      >
        <span>{hasVoted ? '❤' : '♡'}</span>
        <span>{hasVoted ? 'Me interesa' : 'Me interesa'}</span>
      </button>

      <span className="text-sm text-gray-500">
        {voteCount} {voteCount === 1 ? 'persona interesada' : 'personas interesadas'}
      </span>

      {toggle.isError && (
        <span className="text-xs text-red-600">
          {(toggle.error as Error).message}
        </span>
      )}
    </div>
  )
}
