// Centralisation des query keys de la feature randonnees.
// Pattern recommandé par TanStack Query : permet l'invalidation propre
// (ex: invalider toutes les listes après une mutation de proposition).

export const randonneesKeys = {
  all: ['randonnees'] as const,
  lists: () => [...randonneesKeys.all, 'list'] as const,
  list: (filters: { status?: string }) =>
    [...randonneesKeys.lists(), filters] as const,
  details: () => [...randonneesKeys.all, 'detail'] as const,
  detail: (id: string) => [...randonneesKeys.details(), id] as const,
}
