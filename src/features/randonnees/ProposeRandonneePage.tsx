import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Field, { inputClass } from '../../components/ui/Field'
import { DIFFICULTY_LABELS } from '../../lib/types'
import type { Difficulty } from '../../lib/types'
import { useProposeRandonnee } from './useProposeRandonnee'

type FormState = {
  title: string
  description: string
  difficulty: Difficulty | ''
  duration: string
  cover_photo_url: string
}

const initial: FormState = {
  title: '',
  description: '',
  difficulty: '',
  duration: '',
  cover_photo_url: '',
}

export default function ProposeRandonneePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const propose = useProposeRandonnee()

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.title.trim()) e.title = 'Campo obligatorio'
    if (!form.difficulty) e.difficulty = 'Elige una dificultad'
    return e
  }

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return

    propose.mutate(
      {
        title: form.title,
        description: form.description || undefined,
        difficulty: (form.difficulty || undefined) as Difficulty | undefined,
        duration: form.duration || undefined,
        cover_photo_url: form.cover_photo_url || undefined,
      },
      {
        onSuccess: (r) => navigate(`/randonnees/${r.id}`),
      },
    )
  }

  return (
    <div>
      <div className="mb-5">
        <Link to="/randonnees" className="text-sm text-gray-500 hover:text-ink">
          ← Volver
        </Link>
        <h1 className="font-kara text-2xl tracking-wide mt-2">Proponer una ruta</h1>
        <p className="text-sm text-gray-500 mt-1">
          Una propuesta es una zona o ruta que te gustaría explorar. Los demás miembros pueden votar por interés.
        </p>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Título" required error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Por ejemplo : Pico de las Tres Reinas"
              className={inputClass(!!errors.title)}
            />
          </Field>

          <Field
            label="Dificultad"
            required
            error={errors.difficulty}
            hint="Estimada por el proponente, ajustable luego"
          >
            <select
              value={form.difficulty}
              onChange={(e) => set('difficulty', e.target.value as Difficulty | '')}
              className={inputClass(!!errors.difficulty)}
            >
              <option value="">— Elegir —</option>
              {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
              ))}
            </select>
          </Field>

          <Field label="Duración estimada" hint="Por ejemplo : 4–5 horas">
            <input
              type="text"
              value={form.duration}
              onChange={(e) => set('duration', e.target.value)}
              placeholder="4–5 horas"
              className={inputClass()}
            />
          </Field>

          <Field
            label="Descripción"
            hint="Algo de contexto sobre la zona, el interés, las dificultades…"
          >
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className={inputClass()}
            />
          </Field>

          <Field
            label="URL de la foto de portada"
            hint="Pegar una URL pública (no se sube todavía a Storage)"
          >
            <input
              type="url"
              value={form.cover_photo_url}
              onChange={(e) => set('cover_photo_url', e.target.value)}
              placeholder="https://…"
              className={inputClass()}
            />
          </Field>

          {propose.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {(propose.error as Error).message}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Link to="/randonnees" className="flex-shrink-0">
              <Button variant="ghost" type="button">Cancelar</Button>
            </Link>
            <Button
              variant="primary"
              type="submit"
              fullWidth
              disabled={propose.isPending}
            >
              {propose.isPending ? 'Creando…' : 'Crear propuesta'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
