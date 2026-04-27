import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { RandonneeStatus, RandonneeWithVotes } from '../../lib/types'
import { randonneesKeys } from './queries'

interface UseRandonneesParams {
  status?: RandonneeStatus
}

/**
 * Liste des randonnées, avec compteur de votes (vue randonnees_with_votes).
 * Filtrable par statut.
 */
export function useRandonnees({ status }: UseRandonneesParams = {}) {
  return useQuery({
    queryKey: randonneesKeys.list({ status }),
    queryFn: async (): Promise<RandonneeWithVotes[]> => {
      let q = supabase
        .from('randonnees_with_votes')
        .select('*')
        .order('created_at', { ascending: false })

      if (status) q = q.eq('status', status)

      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as RandonneeWithVotes[]
    },
  })
}
