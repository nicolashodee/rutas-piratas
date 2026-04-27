import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { RandonneeWithVotes, Route } from '../../lib/types'
import { randonneesKeys } from './queries'

export interface RandonneeDetail {
  randonnee: RandonneeWithVotes
  routes: Route[]
}

/**
 * Récupère une randonnée par id (avec son compteur de votes) et ses routes.
 */
export function useRandonnee(id: string | undefined) {
  return useQuery({
    queryKey: id ? randonneesKeys.detail(id) : ['randonnees', 'detail', 'none'],
    enabled: !!id,
    queryFn: async (): Promise<RandonneeDetail> => {
      const [randoRes, routesRes] = await Promise.all([
        supabase
          .from('randonnees_with_votes')
          .select('*')
          .eq('id', id!)
          .single(),
        supabase
          .from('routes')
          .select('*')
          .eq('randonnee_id', id!)
          .order('position', { ascending: true }),
      ])

      if (randoRes.error) throw randoRes.error
      if (routesRes.error) throw routesRes.error

      return {
        randonnee: randoRes.data as RandonneeWithVotes,
        routes: (routesRes.data ?? []) as Route[],
      }
    },
  })
}
