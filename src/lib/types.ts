// =========================================================
// Types du domaine — alignés sur le schéma SQL Supabase
// =========================================================
// À long terme on pourra générer ces types via `supabase gen types typescript`,
// pour l'instant on les maintient à la main pour rester explicite.

export type Role = 'member' | 'admin'

export type Difficulty = 'easy' | 'medium' | 'hard' | 'very_hard'

export type RandonneeStatus = 'suggestion' | 'programmed' | 'past' | 'cancelled'
export type RandonneeType   = 'corsaria' | 'pirata'
export type Transport       = 'car' | 'transit'
export type PaymentStatus   = 'pending' | 'paid' | 'free' | 'refunded' | 'failed'

// ─── Tables ──────────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: Role
  is_federated_guide: boolean
  created_at: string
}

export interface Randonnee {
  id: string
  proposed_by: string | null
  scheduled_by: string | null
  status: RandonneeStatus
  type: RandonneeType | null
  title: string
  description: string | null
  cover_photo_url: string | null
  photos: string[]
  difficulty: Difficulty | null
  duration: string | null
  scheduled_at: string | null
  meeting_point_url: string | null
  meeting_time: string | null
  transport: Transport | null
  transit_station: string | null
  transit_time: string | null
  spots_total: number | null
  price_cents: number | null
  whatsapp_url: string | null
  created_at: string
  updated_at: string
}

export interface RandonneeWithVotes extends Randonnee {
  vote_count: number
}

export interface Route {
  id: string
  randonnee_id: string
  name: string
  distance_km: number | null
  elevation_m: number | null
  external_url: string | null
  position: number
  created_at: string
}

export interface Vote {
  user_id: string
  randonnee_id: string
  created_at: string
}

export interface Membership {
  id: string
  user_id: string
  starts_at: string
  ends_at: string
  amount_cents: number
  stripe_payment_id: string | null
  created_at: string
}

export interface Inscription {
  id: string
  randonnee_id: string
  user_id: string
  voted_route_id: string | null
  car_offering: boolean
  car_seats: number | null
  joined_car_id: string | null
  payment_status: PaymentStatus
  stripe_session_id: string | null
  stripe_payment_intent: string | null
  amount_cents: number | null
  disclaimer_accepted_at: string | null
  created_at: string
  updated_at: string
}

// ─── Helpers d'affichage ─────────────────────────────────

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy:      'Fácil',
  medium:    'Moderada',
  hard:      'Difícil',
  very_hard: 'Muy difícil',
}

export const DIFFICULTY_COLORS: Record<Difficulty, { bg: string; text: string }> = {
  easy:      { bg: 'bg-green-50',  text: 'text-green-800'  },
  medium:    { bg: 'bg-yellow-50', text: 'text-yellow-800' },
  hard:      { bg: 'bg-orange-50', text: 'text-orange-800' },
  very_hard: { bg: 'bg-gray-100',  text: 'text-gray-900'   },
}

export const STATUS_LABELS: Record<RandonneeStatus, string> = {
  suggestion: 'Propuesta',
  programmed: 'Programada',
  past:       'Pasada',
  cancelled:  'Cancelada',
}

export const TYPE_LABELS: Record<RandonneeType, string> = {
  corsaria: 'Corsaria',
  pirata:   'Pirata',
}
