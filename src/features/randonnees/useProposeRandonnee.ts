import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Difficulty, Randonnee } from '../../lib/types'
import { randonneesKeys } from './queries'

export interface ProposeRandonneeInput {
  title: string
  description?: string
  difficulty?: Difficulty
  duration?: string
  cover_photo_url?: string
}

/**
 * Mutation : proposer une nouvelle randonnée (status='suggestion', type=null).
 * Le RLS vérifie côté Supabase que :
 *  - proposed_by = auth.uid()
 *  - l'utilisateur est cotisant (is_active_member)
 */
export function useProposeRandonnee() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: ProposeRandonneeInput): Promise<Randonnee> => {
      const { data: userData, error: userErr } = await supabase.auth.getUser()
      if (userErr || !userData.user) {
        throw new Error('Sesión no encontrada. Vuelve a iniciar sesión.')
      }

      const { data, error } = await supabase
        .from('randonnees')
        .insert({
          title: input.title.trim(),
          description: input.description?.trim() || null,
          difficulty: input.difficulty ?? null,
          duration: input.duration?.trim() || null,
          cover_photo_url: input.cover_photo_url?.trim() || null,
          status: 'suggestion',
          type: null,
          proposed_by: userData.user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data as Randonnee
    },
    onSuccess: () => {
      // Invalide toutes les listes pour qu'elles se rafraîchissent
      qc.invalidateQueries({ queryKey: randonneesKeys.lists() })
    },
  })
}
