import { useState } from 'react'

interface Props {
  src: string | null | undefined
  alt: string
  className?: string
  /**
   * Hauteur Tailwind (ex: 'h-32', 'h-56'). Par défaut h-40.
   */
  heightClass?: string
}

/**
 * Image de couverture robuste :
 * - Utilise <img> (et non background-image) pour bénéficier de onError
 * - Si pas d'URL ou erreur de chargement, affiche un placeholder discret
 */
export default function CoverImage({
  src,
  alt,
  className = '',
  heightClass = 'h-40',
}: Props) {
  const [errored, setErrored] = useState(false)
  const showImage = src && !errored

  return (
    <div
      className={[
        heightClass,
        'w-full overflow-hidden bg-bone flex items-center justify-center',
        className,
      ].join(' ')}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setErrored(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-bone-foreground text-3xl text-gray-400">⛰</span>
      )}
    </div>
  )
}
