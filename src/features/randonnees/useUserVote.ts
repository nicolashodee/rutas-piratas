import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useSession } from '../auth/useSession'

/**
 * Indique si l'utilisateur courant a voté sur cette randonnée.
 * Retourne true / false / undefined (pas encore chargé).
 */
export function useUserVote(randonneeId: string | undefined) {
  const session = useSession()
  const userId = session?.user.id

  return useQuery({
    queryKey: ['userVote', userId, randonneeId],
    enabled: !!userId && !!randonneeId,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase
        .from('votes')
        .select('user_id')
        .eq('user_id', userId!)
        .eq('randonnee_id', randonneeId!)
        .maybeSingle()
      if (error) throw error
      return !!data
    },
  })
}
