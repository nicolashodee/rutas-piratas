import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}

/**
 * Wrapper standard pour les champs de formulaire :
 * label + required indicator + erreur + hint
 */
export default function Field({ label, required, error, hint, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-500 mt-1">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}

/**
 * Style commun pour <input>, <select>, <textarea>.
 * Usage : <input className={inputClass(!!errors.title)} … />
 */
export function inputClass(hasError = false) {
  return [
    'w-full rounded-lg px-3 py-2 outline-none transition',
    'border focus:ring-2',
    hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : 'border-bone focus:border-moss focus:ring-moss/20',
  ].join(' ')
}
