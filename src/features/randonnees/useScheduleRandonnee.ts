import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Randonnee, RandonneeType, Transport } from '../../lib/types'
import { randonneesKeys } from './queries'

export interface ScheduleRandonneeInput {
  id: string
  type: RandonneeType
  scheduled_at: string                     // ISO datetime
  meeting_point_url: string                // Google Maps URL
  meeting_time: string                     // HH:MM
  transport: Transport
  transit_station?: string
  transit_time?: string
  spots_total?: number
  // Spécifique corsaria
  price_cents?: number
  // Spécifique pirata
  whatsapp_url?: string
}

/**
 * Mutation : passer une randonnée de 'suggestion' à 'programmed'.
 *
 * RLS côté Supabase :
 *  - L'utilisateur doit être proposed_by, scheduled_by, ou admin
 *  - Pour type='corsaria', l'utilisateur doit être guide fédéré (ou admin)
 *  - Pour type='pirata', n'importe quel cotisant éligible passe
 */
export function useScheduleRandonnee() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: ScheduleRandonneeInput): Promise<Randonnee> => {
      const { data: userData, error: userErr } = await supabase.auth.getUser()
      if (userErr || !userData.user) {
        throw new Error('Sesión no encontrada.')
      }

      const { id, ...fields } = input

      const { data, error } = await supabase
        .from('randonnees')
        .update({
          status: 'programmed',
          type: fields.type,
          scheduled_at: fields.scheduled_at,
          scheduled_by: userData.user.id,
          meeting_point_url: fields.meeting_point_url,
          meeting_time: fields.meeting_time,
          transport: fields.transport,
          transit_station: fields.transit_station ?? null,
          transit_time: fields.transit_time ?? null,
          spots_total: fields.spots_total ?? null,
          price_cents: fields.type === 'corsaria' ? (fields.price_cents ?? 0) : null,
          whatsapp_url: fields.type === 'pirata' ? (fields.whatsapp_url ?? null) : null,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Randonnee
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: randonneesKeys.lists() })
      qc.invalidateQueries({ queryKey: randonneesKeys.detail(id) })
    },
  })
}
