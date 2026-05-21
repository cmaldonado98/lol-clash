export type PlayerStatus = 'pending' | 'locked_in'
export type PlayerRole   = 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support'

export interface Groomsman {
  id:                string
  slug:              string
  name:              string
  role:              PlayerRole
  summoner_icon_id:  number
  status:            PlayerStatus
  created_at?:       string
  updated_at?:       string
}
