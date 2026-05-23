'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SFX_CLASH_START } from '@/lib/constants/assets'

interface ClashStartOverlayProps {
  visible: boolean
  onDismiss: () => void
}

export default function ClashStartOverlay({ visible, onDismiss }: ClashStartOverlayProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!visible) return
    const audio = audioRef.current ?? new Audio(SFX_CLASH_START)
    audioRef.current = audio
    audio.volume = 0.9
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* ── Backdrop ── */}
          <div
            className="absolute inset-0 bg-hextech-black/95 backdrop-blur-sm"
            onClick={onDismiss}
          />

          {/* ── Particle grid ── */}
          <div className="pointer-events-none absolute inset-0 bg-particle-grid opacity-15" />

          {/* ── Scan line ── */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute left-0 h-px w-full bg-gradient-to-r from-transparent via-hextech-gold/50 to-transparent"
              initial={{ top: '-2%' }}
              animate={{ top: '102%' }}
              transition={{ duration: 3.5, ease: 'linear', repeat: Infinity, repeatDelay: 0.8 }}
            />
          </div>

          {/* ── Card ── */}
          <motion.div
            className="relative z-10 mx-6 w-full max-w-sm"
            initial={{ scale: 0.82, opacity: 0, y: 28 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: -12 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260, delay: 0.08 }}
          >
            {/* Outer ambient glow */}
            <div className="pointer-events-none absolute -inset-[3px] rounded-sm glow-gold opacity-70" />

            {/* Panel */}
            <div className="relative overflow-hidden rounded-sm border border-hextech-gold bg-hextech-navy/98 px-6 py-8 text-center">

              {/* Top accent bar */}
              <motion.div
                className="absolute left-0 top-0 h-0.5 w-full bg-gradient-to-r from-transparent via-hextech-gold to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
              />

              {/* ⚔ Trophy icon */}
              <motion.div
                className="mb-4 flex justify-center"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 350, damping: 18 }}
              >
                <motion.div
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-hextech-gold-dark bg-hextech-gold/10 text-3xl"
                  animate={{ boxShadow: ['0 0 8px rgba(200,170,110,0.2)', '0 0 22px rgba(200,170,110,0.55)', '0 0 8px rgba(200,170,110,0.2)'] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                >
                  ⚔
                </motion.div>
              </motion.div>

              {/* Eyebrow label */}
              <motion.p
                className="mb-2 font-beaufort text-[8px] uppercase tracking-[.55em] text-hextech-gold-dark"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Torneo Clash · 10 de Octubre, 2026
              </motion.p>

              {/* "PARTIDA ENCONTRADA" — flickered entrance */}
              <motion.h2
                className="font-beaufort text-2xl font-black uppercase leading-tight tracking-wider text-gradient-gold"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.6, 1, 0.8, 1] }}
                transition={{ delay: 0.5, duration: 0.55, times: [0, 0.25, 0.45, 0.65, 0.82, 1] }}
              >
                ¡Partida<br />Encontrada!
              </motion.h2>

              {/* Divider */}
              <motion.div
                className="hextech-divider mx-auto my-5 w-40"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.72, duration: 0.55 }}
              />

              {/* Tournament name */}
              <motion.p
                className="font-beaufort text-lg font-bold uppercase tracking-widest text-hextech-gold"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.82 }}
              >
                Copa Mexicali
              </motion.p>

              {/* Subtitle */}
              <motion.p
                className="mt-1.5 font-spiegel text-sm text-hextech-gray/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.96 }}
              >
                está por comenzar
              </motion.p>

              {/* Pulsing dots */}
              <motion.div
                className="mt-5 flex justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.08 }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-hextech-gold"
                    animate={{ opacity: [0.15, 1, 0.15], scale: [0.7, 1.3, 0.7] }}
                    transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.18, ease: 'easeInOut' }}
                  />
                ))}
              </motion.div>

              {/* Dismiss CTA */}
              <motion.button
                className="mt-6 w-full rounded-sm border border-hextech-gold-dark bg-hextech-gold/10 px-4 py-2.5 font-beaufort text-xs uppercase tracking-widest text-hextech-gold transition-all hover:border-hextech-gold hover:bg-hextech-gold/20 active:scale-95"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.25 }}
                onClick={onDismiss}
              >
                ✦ ¡Que comience el clash! ✦
              </motion.button>

              {/* Bottom accent bar */}
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-hextech-gold to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
              />
            </div>

            {/* Corner accents */}
            {(
              [
                'left-0 top-0 border-l border-t',
                'right-0 top-0 border-r border-t',
                'bottom-0 left-0 border-b border-l',
                'bottom-0 right-0 border-b border-r',
              ] as const
            ).map((cls, i) => (
              <motion.div
                key={i}
                className={`absolute h-4 w-4 border-hextech-gold ${cls}`}
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.28 + i * 0.04, duration: 0.25 }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
