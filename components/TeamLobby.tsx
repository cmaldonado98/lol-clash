'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Groomsman } from '@/types'
import { supabase } from '@/lib/supabase'
import PlayerRow from './PlayerRow'
import HextechButton from './HextechButton'
import ClashStartOverlay from './ClashStartOverlay'

/* BGM is started by <AudioUnlocker> — no local sound logic needed here. */

interface TeamLobbyProps {
  currentPlayer: Groomsman
  allPlayers: Groomsman[]
}

/* Role sort order for consistent display */
const ROLE_ORDER: Record<string, number> = {
  Top: 0, Jungle: 1, Mid: 2, ADC: 3, Support: 4,
}

export default function TeamLobby({ currentPlayer, allPlayers: initial }: TeamLobbyProps) {
  const [players, setPlayers] = useState<Groomsman[]>(
    [...initial].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]),
  )
  const [showOverlay, setShowOverlay] = useState(false)

  const lockedCount = players.filter((p) => p.status === 'locked_in').length
  const allLocked   = lockedCount === players.length

  /* ── Supabase real-time subscription ── */
  useEffect(() => {
    const channel = supabase
      .channel('groomsmen-lobby')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'groomsmen' },
        (payload) => {
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === (payload.new as Groomsman).id
                ? { ...p, ...(payload.new as Groomsman) }
                : p,
            ),
          )
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-ambient-gold">
      <ClashStartOverlay visible={showOverlay} onDismiss={() => setShowOverlay(false)} />
      {/* Particle grid */}
      <div className="pointer-events-none absolute inset-0 bg-particle-grid opacity-30" />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(200,170,110,.05) 0%, transparent 60%)',
        }}
      />

      {/* ── Header ── */}
      <motion.header
        className="relative z-10 border-b border-hextech-gold-dark/40 bg-hextech-navy/70 px-4 py-4 backdrop-blur-sm"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="mx-auto flex max-w-md flex-col gap-0.5">
          <p className="font-beaufort text-[9px] uppercase tracking-[.4em] text-hextech-gold-dark">
            Torneo Clash · 10 de Octubre, 2026
          </p>
          <h1 className="font-beaufort text-xl font-black uppercase tracking-widest text-gradient-gold">
            Copa Mexicali
          </h1>
          <div className="hextech-divider mt-1 w-28" />

          {/* Progress */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: players.length }, (_, i) => (
                <motion.div
                  key={i}
                  className="h-1.5 w-6 rounded-full"
                  style={{ background: i < lockedCount ? '#C8AA6E' : '#3C3C41' }}
                  animate={i < lockedCount ? { opacity: [0.7, 1, 0.7] } : {}}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                />
              ))}
            </div>
            <span className="font-spiegel text-[10px] text-hextech-gray">
              {lockedCount}/{players.length} Confirmados
            </span>
          </div>
        </div>
      </motion.header>

      {/* ── Main content ── */}
      <main className="relative z-10 flex flex-1 flex-col items-center px-4 py-5">
        <div className="w-full max-w-md">

          {/* Section label */}
          <motion.div
            className="mb-3 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="hextech-divider flex-1" />
            <span className="font-beaufort text-[10px] uppercase tracking-[.3em] text-hextech-gold-dark">
              Composición del Equipo
            </span>
            <div className="hextech-divider flex-1" />
          </motion.div>

          {/* Player list */}
          <div className="flex flex-col gap-2">
            {players.map((player, index) => (
              <PlayerRow
                key={player.id}
                player={player}
                index={index}
                isCurrentPlayer={player.id === currentPlayer.id}
              />
            ))}
          </div>

          {/* "You" indicator */}
          <motion.p
            className="mt-3 text-center font-spiegel text-[10px] text-hextech-gray/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            ▶ Estás jugando como{' '}
            <span className="text-hextech-blue">{currentPlayer.name}</span>
          </motion.p>
        </div>
      </main>

      {/* ── Footer CTA ── */}
      <motion.footer
        className="relative z-10 border-t border-hextech-gold-dark/40 bg-hextech-navy/80 px-4 py-4 pb-safe backdrop-blur-sm"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
      >
        <div className="mx-auto flex max-w-md flex-col gap-2">
          <HextechButton
            variant="gold"
            size="lg"
            disabled={!allLocked}
            className="w-full justify-center"
            onClick={allLocked ? () => setShowOverlay(true) : undefined}
          >
            {allLocked
              ? '✦ Confirmar Equipo'
              : '🔒 Bloquear Composición (10 de Octubre, 2026)'}
          </HextechButton>

          {!allLocked && (
            <p className="text-center font-spiegel text-[10px] text-hextech-gray/50">
              Disponible cuando todos los invocadores hayan confirmado.
            </p>
          )}
        </div>
      </motion.footer>
    </div>
  )
}
