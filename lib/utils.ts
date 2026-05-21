import type { PlayerRole } from '@/types'
import { POSITIONS_BASE } from '@/lib/constants/assets'

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
  { label: string; shortLabel: string; accentColor: string; positionKey: string }
> = {
  Top:     { label: 'Línea Superior', shortLabel: 'TOP', accentColor: '#E8945A', positionKey: 'top'     },
  Jungle:  { label: 'Jungla',         shortLabel: 'JG',  accentColor: '#5AA84A', positionKey: 'jungle'  },
  Mid:     { label: 'Línea Central',  shortLabel: 'MID', accentColor: '#5A7FE8', positionKey: 'middle'  },
  ADC:     { label: 'Tirador',        shortLabel: 'ADC', accentColor: '#E8C85A', positionKey: 'bottom'  },
  Support: { label: 'Soporte',        shortLabel: 'SUP', accentColor: '#B85AE8', positionKey: 'utility' },
}

/**
 * Community Dragon position icon URL.
 * Base: rcp-fe-lol-shared-components · files: position-{key}.png
 */
export function getRoleIconUrl(role: PlayerRole): string {
  const { positionKey } = roleConfig[role]
  return `${POSITIONS_BASE}/position-${positionKey}.png`
}
