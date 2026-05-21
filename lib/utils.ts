import type { PlayerRole } from '@/types'
import {
  ROLE_ICON_TOP,
  ROLE_ICON_JUNGLE,
  ROLE_ICON_MID,
  ROLE_ICON_ADC,
  ROLE_ICON_SUPPORT,
} from '@/lib/constants/assets'

/* ─────────────────────────────────────────────────────────── */
/*  Data Dragon                                                */
/* ─────────────────────────────────────────────────────────── */
const DDRAGON_VERSION = '14.24.1'

/**
 * Returns the public CDN URL for a summoner profile icon.
 * No API key required – uses Riot's open Data Dragon CDN.
 */
export function getSummonerIconUrl(id: number): string {
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${id}.png`
}

/* ─────────────────────────────────────────────────────────── */
/*  Role meta                                                   */
/* ─────────────────────────────────────────────────────────── */
export const roleConfig: Record<
  PlayerRole,
  { label: string; shortLabel: string; accentColor: string; iconUrl: string }
> = {
  Top:     { label: 'Línea Superior', shortLabel: 'TOP', accentColor: '#E8945A', iconUrl: ROLE_ICON_TOP     },
  Jungle:  { label: 'Jungla',         shortLabel: 'JG',  accentColor: '#5AA84A', iconUrl: ROLE_ICON_JUNGLE  },
  Mid:     { label: 'Línea Central',  shortLabel: 'MID', accentColor: '#5A7FE8', iconUrl: ROLE_ICON_MID     },
  ADC:     { label: 'Tirador',        shortLabel: 'ADC', accentColor: '#E8C85A', iconUrl: ROLE_ICON_ADC     },
  Support: { label: 'Soporte',        shortLabel: 'SUP', accentColor: '#B85AE8', iconUrl: ROLE_ICON_SUPPORT },
}

/**
 * Local proxy URL for a role icon.
 * Served from /api/roles/[file] — fetched from Community Dragon CDN
 * on first request and cached to public/roles/.
 */
export function getRoleIconUrl(role: PlayerRole): string {
  return roleConfig[role].iconUrl
}
