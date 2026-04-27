import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../lib/types'
import { useSession } from './useSession'

/**
 * Hook qui récupère le profile de l'utilisateur courant.
 * Retourne `undefined` tant qu'on charge la session, `null` si pas connecté.
 */
export function useProfile() {
  const session = useSession()
  const userId = session?.user.id

  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId!)
        .single()
      if (error) throw error
      return data as Profile
    },
  })
}
