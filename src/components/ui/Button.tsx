import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-ink text-parchment hover:bg-ink_soft border border-ink shadow-stamp ' +
    'hover:shadow-md active:translate-y-[1px] active:shadow-none',
  secondary:
    'bg-white border border-bone text-ink hover:bg-paper hover:border-gray-300',
  ghost:
    'bg-transparent text-gray-600 hover:text-ink hover:bg-bone/40',
  danger:
    'bg-wine text-parchment border border-wine hover:bg-red-900 shadow-stamp',
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={[
        'rounded px-4 py-2 font-medium text-sm transition',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0',
        VARIANTS[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
