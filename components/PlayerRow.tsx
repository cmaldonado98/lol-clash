'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Groomsman } from '@/types'
import { getSummonerIconUrl, getRoleIconUrl, roleConfig } from '@/lib/utils'

interface PlayerRowProps {
  player: Groomsman
  index: number
  isCurrentPlayer: boolean
}

export default function PlayerRow({ player, index, isCurrentPlayer }: PlayerRowProps) {
  const cfg = roleConfig[player.role]
  const isLocked = player.status === 'locked_in'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 + 0.2, duration: 0.5, ease: 'easeOut' }}
      className={[
        'relative flex items-center gap-3 overflow-hidden rounded-sm border p-3',
        'transition-all duration-300',
        isLocked
          ? 'border-hextech-gold-dark bg-hextech-navy/80'
          : 'border-hextech-gray-dark/40 bg-hextech-black/60',
        isCurrentPlayer ? 'ring-1 ring-hextech-blue/40' : '',
      ].join(' ')}
    >
      {/* Locked glow left-edge */}
      {isLocked && (
        <div className="pointer-events-none absolute left-0 top-0 h-full w-0.5 bg-hextech-gold opacity-60" />
      )}

      {/* Avatar */}
      <div
        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border"
        style={{ borderColor: isLocked ? cfg.accentColor + 'aa' : '#3C3C41' }}
      >
        <Image
          src={getSummonerIconUrl(player.summoner_icon_id)}
          alt={`Icono de ${player.name}`}
          fill
          className={['object-cover transition-all duration-300', !isLocked ? 'grayscale opacity-50' : ''].join(' ')}
          sizes="48px"
        />
      </div>

      {/* Role badge */}
      <div
        className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm border"
        style={{
          borderColor: cfg.accentColor + (isLocked ? 'aa' : '44'),
          background:  cfg.accentColor + (isLocked ? '18' : '0a'),
        }}
      >
        <Image
          src={getRoleIconUrl(player.role)}
          alt={cfg.label}
          fill
          className={['object-contain p-1 transition-all duration-300', !isLocked ? 'opacity-40' : ''].join(' ')}
          sizes="40px"
          style={{ filter: isLocked ? `drop-shadow(0 0 4px ${cfg.accentColor}88)` : undefined }}
        />
      </div>
      </div>

      {/* Name + role label */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={[
            'truncate font-beaufort text-sm font-bold uppercase tracking-wider',
            isLocked ? 'text-hextech-gold-light' : 'text-hextech-gray/50',
          ].join(' ')}
        >
          {player.name}
        </span>
        <span className="font-spiegel text-[10px] text-hextech-gray/60">{cfg.label}</span>
      </div>

      {/* Status chip */}
      <div className="shrink-0">
        {isLocked ? (
          <motion.span
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="badge-locked flex items-center gap-1 rounded-sm border px-2 py-0.5 font-beaufort text-[10px] uppercase tracking-wider"
          >
            <span className="text-[8px]">✦</span> Fijado
          </motion.span>
        ) : (
          <span className="badge-pending flex items-center gap-1 rounded-sm border px-2 py-0.5 font-beaufort text-[10px] uppercase tracking-wider">
            <motion.span
              className="inline-block h-1.5 w-1.5 rounded-full bg-hextech-gray/40"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
            Esperando…
          </span>
        )}
      </div>
    </motion.div>
  )
}
