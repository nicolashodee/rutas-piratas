import type { RandonneeType } from '../../lib/types'

interface Props {
  type: RandonneeType
  size?: 'sm' | 'md'
}

/**
 * Badge "tampon" pour distinguer Corsaria (officiel, marine + or)
 * de Pirata (rebelle, encre + ivoire).
 */
export default function TypeBadge({ type, size = 'sm' }: Props) {
  const sizeClass =
    size === 'sm'
      ? 'text-[10px] px-2 py-0.5'
      : 'text-xs px-2.5 py-1'

  if (type === 'corsaria') {
    return (
      <span
        className={[
          'inline-flex items-center gap-1 font-medium uppercase tracking-wider',
          'bg-navy text-parchment border border-gold/60 rounded-sm',
          sizeClass,
        ].join(' ')}
      >
        <span className="text-gold leading-none">⚓</span>
        <span>Corsaria</span>
      </span>
    )
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-1 font-medium uppercase tracking-wider',
        'bg-ink text-parchment border border-parchment/30 rounded-sm',
        sizeClass,
      ].join(' ')}
    >
      <span className="text-parchment leading-none">☠</span>
      <span>Pirata</span>
    </span>
  )
}
