import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { randonneesKeys } from './queries'

/**
 * Toggle le vote (manifestation d'intérêt) du user courant sur une rando.
 * Le RLS vérifie côté Supabase que user_id = auth.uid() et que l'user est cotisant.
 */
export function useToggleVote() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      randonneeId,
      currentlyVoted,
    }: {
      randonneeId: string
      currentlyVoted: boolean
    }) => {
      const { data: userData, error: userErr } = await supabase.auth.getUser()
      if (userErr || !userData.user) {
        throw new Error('Sesión no encontrada.')
      }
      const userId = userData.user.id

      if (currentlyVoted) {
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('user_id', userId)
          .eq('randonnee_id', randonneeId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('votes')
          .insert({ user_id: userId, randonnee_id: randonneeId })
        if (error) throw error
      }
    },
    onSuccess: (_, { randonneeId }) => {
      // Le compteur de votes vit dans la vue randonnees_with_votes :
      // on invalide la liste ET le détail.
      qc.invalidateQueries({ queryKey: randonneesKeys.lists() })
      qc.invalidateQueries({ queryKey: randonneesKeys.detail(randonneeId) })
      qc.invalidateQueries({ queryKey: ['userVote'] })
    },
  })
}
