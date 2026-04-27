import { useState } from 'react'
import Button from '../../components/ui/Button'
import Field, { inputClass } from '../../components/ui/Field'
import type { RandonneeType, Transport } from '../../lib/types'
import { useScheduleRandonnee } from './useScheduleRandonnee'

interface Props {
  randonneeId: string
  isFederatedGuide: boolean
  isAdmin: boolean
  onScheduled?: () => void
}

interface FormState {
  type: RandonneeType
  date: string                // YYYY-MM-DD
  time: string                // HH:MM
  meeting_point_url: string
  transport: Transport
  transit_station: string
  transit_time: string
  spots_total: string
  price_eur: string           // saisi en euros, converti en cents
  whatsapp_url: string
}

const initial: FormState = {
  type: 'pirata',
  date: '',
  time: '',
  meeting_point_url: '',
  transport: 'car',
  transit_station: '',
  transit_time: '',
  spots_total: '',
  price_eur: '',
  whatsapp_url: '',
}

/**
 * Formulaire pour passer une randonnée de 'suggestion' à 'programmed'.
 * Le choix corsaria n'est proposé qu'aux guides fédérés (et admins).
 */
export default function ScheduleForm({
  randonneeId,
  isFederatedGuide,
  isAdmin,
  onScheduled,
}: Props) {
  const [form, setForm] = useState<FormState>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const schedule = useScheduleRandonnee()

  const canCorsaria = isFederatedGuide || isAdmin

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const validate = (): Partial<Record<keyof FormState, string>> => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.date) e.date = 'Fecha obligatoria'
    if (!form.time) e.time = 'Hora obligatoria'
    if (!form.meeting_point_url.trim()) e.meeting_point_url = 'Enlace Maps obligatorio'
    if (form.transport === 'transit') {
      if (!form.transit_station.trim()) e.transit_station = 'Estación obligatoria'
      if (!form.transit_time) e.transit_time = 'Hora obligatoria'
    }
    if (form.type === 'pirata' && !form.whatsapp_url.trim()) {
      e.whatsapp_url = 'Enlace WhatsApp obligatorio para una ruta pirata'
    }
    return e
  }

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return

    // Combine date + time en ISO timestamptz
    const scheduled_at = new Date(`${form.date}T${form.time}:00`).toISOString()

    schedule.mutate(
      {
        id: randonneeId,
        type: form.type,
        scheduled_at,
        meeting_point_url: form.meeting_point_url.trim(),
        meeting_time: form.time,
        transport: form.transport,
        transit_station: form.transit_station.trim() || undefined,
        transit_time: form.transit_time || undefined,
        spots_total: form.spots_total ? Number(form.spots_total) : undefined,
        price_cents:
          form.type === 'corsaria' && form.price_eur
            ? Math.round(Number(form.price_eur) * 100)
            : undefined,
        whatsapp_url:
          form.type === 'pirata' ? form.whatsapp_url.trim() : undefined,
      },
      {
        onSuccess: () => {
          setForm(initial)
          onScheduled?.()
        },
      },
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Type */}
      <Field
        label="Tipo de ruta"
        required
        hint={
          canCorsaria
            ? 'Las corsarias requieren un guía federado. Las piratas se organizan al margen del club (descargo de responsabilidad).'
            : 'Solo los guías federados pueden programar una ruta corsaria.'
        }
      >
        <div className="grid grid-cols-2 gap-2">
          <TypeRadio
            label="Pirata"
            value="pirata"
            current={form.type}
            onChange={(v) => set('type', v)}
            color="amber"
          />
          <TypeRadio
            label="Corsaria"
            value="corsaria"
            current={form.type}
            onChange={(v) => set('type', v)}
            color="blue"
            disabled={!canCorsaria}
          />
        </div>
      </Field>

      {/* Date + heure */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha" required error={errors.date}>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            className={inputClass(!!errors.date)}
          />
        </Field>
        <Field label="Hora" required error={errors.time}>
          <input
            type="time"
            value={form.time}
            onChange={(e) => set('time', e.target.value)}
            className={inputClass(!!errors.time)}
          />
        </Field>
      </div>

      {/* Punto de encuentro */}
      <Field
        label="Punto de encuentro — Google Maps"
        required
        error={errors.meeting_point_url}
        hint='Clic derecho en Maps → "¿Qué hay aquí?" → copiar enlace'
      >
        <input
          type="url"
          value={form.meeting_point_url}
          onChange={(e) => set('meeting_point_url', e.target.value)}
          placeholder="https://maps.google.com/?q=43.0,-1.7"
          className={inputClass(!!errors.meeting_point_url)}
        />
      </Field>

      {/* Transport */}
      <Field label="Transporte" required>
        <div className="grid grid-cols-2 gap-2">
          {(['car', 'transit'] as Transport[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set('transport', t)}
              className={[
                'border rounded-lg py-2 text-sm font-medium transition',
                form.transport === t
                  ? 'bg-ink text-white border-ink'
                  : 'bg-white text-gray-600 border-bone hover:border-gray-300',
              ].join(' ')}
            >
              {t === 'car' ? '🚗 En coche' : '🚌 Transporte público'}
            </button>
          ))}
        </div>
      </Field>

      {form.transport === 'transit' && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Estación" required error={errors.transit_station}>
            <input
              type="text"
              value={form.transit_station}
              onChange={(e) => set('transit_station', e.target.value)}
              placeholder="Ej : Estación de San Sebastián"
              className={inputClass(!!errors.transit_station)}
            />
          </Field>
          <Field label="Hora del transporte" required error={errors.transit_time}>
            <input
              type="time"
              value={form.transit_time}
              onChange={(e) => set('transit_time', e.target.value)}
              className={inputClass(!!errors.transit_time)}
            />
          </Field>
        </div>
      )}

      {/* Plazas */}
      <Field label="Plazas totales" hint="Dejar vacío = sin límite">
        <input
          type="number"
          min={1}
          value={form.spots_total}
          onChange={(e) => set('spots_total', e.target.value)}
          placeholder="Sin límite"
          className={inputClass()}
        />
      </Field>

      {/* Champs spécifiques par type */}
      {form.type === 'corsaria' && (
        <Field label="Precio por inscripción (€)" hint="Dejar 0 para gratis">
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.price_eur}
            onChange={(e) => set('price_eur', e.target.value)}
            placeholder="0"
            className={inputClass()}
          />
        </Field>
      )}

      {form.type === 'pirata' && (
        <Field
          label="Enlace WhatsApp dedicado"
          required
          error={errors.whatsapp_url}
          hint="Grupo separado del club, para coordinar al margen"
        >
          <input
            type="url"
            value={form.whatsapp_url}
            onChange={(e) => set('whatsapp_url', e.target.value)}
            placeholder="https://chat.whatsapp.com/…"
            className={inputClass(!!errors.whatsapp_url)}
          />
        </Field>
      )}

      {schedule.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {(schedule.error as Error).message}
        </div>
      )}

      <Button type="submit" variant="primary" fullWidth disabled={schedule.isPending}>
        {schedule.isPending ? 'Programando…' : 'Programar la ruta'}
      </Button>
    </form>
  )
}

// ─── Sous-composant Radio Type ───
function TypeRadio({
  label,
  value,
  current,
  onChange,
  color,
  disabled,
}: {
  label: string
  value: RandonneeType
  current: RandonneeType
  onChange: (v: RandonneeType) => void
  color: 'amber' | 'blue'
  disabled?: boolean
}) {
  const active = current === value
  const colorMap = {
    amber: active ? 'bg-amber-50 text-amber-900 border-amber-400' : '',
    blue:  active ? 'bg-blue-50  text-blue-900  border-blue-400'  : '',
  }
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(value)}
      disabled={disabled}
      className={[
        'border rounded-lg py-2.5 text-sm font-medium transition',
        active
          ? colorMap[color]
          : 'bg-white text-gray-600 border-bone hover:border-gray-300',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
