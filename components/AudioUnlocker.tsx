'use client'

/**
 * AudioUnlocker — Splash screen + Web Audio API gate.
 *
 * Why this exists:
 *   Browsers (especially iOS Safari / Chrome Android) suspend the Web Audio
 *   AudioContext until the user makes a gesture. This component guarantees
 *   that EVERY audio call after the splash happens inside an already-resumed
 *   context, eliminating the "first sound is silent" bug on mobile.
 *
 * How it works:
 *   1. Renders a full-screen splash over the real content (content is hidden
 *      at opacity 0, not removed — preserving SSR HTML in the DOM).
 *   2. On first click / touch the user unlocks the AudioContext via the
 *      play() call (Howler.js resumes ctx automatically inside a gesture).
 *   3. Optionally plays the match-found notification (pending/invite view)
 *      or starts the BGM with a 2-second fade-in (lobby view).
 *   4. Splash fades out; real content fades in.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SFX_MATCH_FOUND, BGM_CLASH_HUB } from '@/lib/constants/assets'

interface AudioUnlockerProps {
  children: React.ReactNode
  /** Play matchmaking_found.ogg on unlock — set for the pending/invite screen. */
  notification?: boolean
  /** Loop clash-hub-bgm.ogg with fade-in on unlock — set for the team lobby. */
  bgm?: boolean
}

export default function AudioUnlocker({
  children,
  notification = false,
  bgm = false,
}: AudioUnlockerProps) {
  const [unlocked, setUnlocked] = useState(false)
  const alreadyFired = useRef(false)

  /* Native <audio> refs — no third-party library, errors surface to console */
  const notifRef = useRef<HTMLAudioElement | null>(null)
  const bgmRef   = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (notification) {
      const a = new Audio(SFX_MATCH_FOUND)
      a.volume = 0.85
      a.preload = 'auto'
      notifRef.current = a
    }
    if (bgm) {
      const a = new Audio(BGM_CLASH_HUB)
      a.volume = 0
      a.loop = true
      a.preload = 'auto'
      bgmRef.current = a
    }
    return () => {
      bgmRef.current?.pause()
      bgmRef.current   = null
      notifRef.current = null
    }
  }, [notification, bgm])

  const handleUnlock = useCallback(() => {
    if (alreadyFired.current) return
    alreadyFired.current = true
    setUnlocked(true)

    if (notification && notifRef.current) {
      notifRef.current.play().catch(console.error)
    }

    if (bgm && bgmRef.current) {
      const audio = bgmRef.current
      audio.play()
        .then(() => {
          /* Smooth volume fade-in over 2 s using rAF */
          const TARGET   = 0.18
          const DURATION = 2000
          const start    = performance.now()
          const tick = () => {
            const t = Math.min((performance.now() - start) / DURATION, 1)
            audio.volume = t * TARGET
            if (t < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        })
        .catch(console.error)
    }
  }, [notification, bgm])

  return (
    <>
      {/* ── Splash overlay ───────────────────────────────── */}
      <AnimatePresence>
        {!unlocked && (
          <motion.div
            key="audio-splash"
            className="fixed inset-0 z-[60] flex cursor-pointer flex-col items-center justify-center gap-7 bg-hextech-black select-none overflow-hidden"
            role="button"
            aria-label="Toca para conectar al servidor"
            tabIndex={0}
            onClick={handleUnlock}
            onTouchStart={handleUnlock}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleUnlock()
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.43, 0.13, 0.23, 0.96] }}
          >
            {/* Subtle grid */}
            <div className="pointer-events-none absolute inset-0 bg-particle-grid opacity-20" />

            {/* Top vignette glow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(200,170,110,.07) 0%, transparent 70%)',
              }}
            />

            {/* ── Hextech emblem ── */}
            <motion.div
              animate={{
                scale: [1, 1.07, 1],
                filter: [
                  'drop-shadow(0 0 6px rgba(200,170,110,.25))',
                  'drop-shadow(0 0 22px rgba(200,170,110,.75))',
                  'drop-shadow(0 0 6px rgba(200,170,110,.25))',
                ],
              }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              <svg viewBox="0 0 80 80" fill="none" className="h-24 w-24" aria-hidden>
                <polygon
                  points="40,4 72,22 72,58 40,76 8,58 8,22"
                  stroke="#C8AA6E"
                  strokeWidth="1.5"
                  fill="none"
                  opacity=".7"
                />
                <polygon
                  points="40,14 64,28 64,52 40,66 16,52 16,28"
                  stroke="#785A28"
                  strokeWidth="1"
                  fill="rgba(10,22,40,.6)"
                />
                <path
                  d="M40 24 L43 36 L55 36 L45.5 43.5 L49 56 L40 49 L31 56 L34.5 43.5 L25 36 L37 36 Z"
                  fill="#C8AA6E"
                  opacity=".85"
                />
                <circle cx="40" cy="40" r="24" stroke="#0AC8B9" strokeWidth=".5" fill="none" opacity=".4" />
              </svg>
            </motion.div>

            {/* ── Title ── */}
            <div className="text-center">
              <p className="font-beaufort text-[9px] uppercase tracking-[.4em] text-hextech-gold-dark">
                Torneo Clash · 10 de Octubre, 2026
              </p>
              <h1 className="mt-1 font-beaufort text-3xl font-black uppercase tracking-widest text-gradient-gold">
                Copa Mexicali
              </h1>
            </div>

            <div className="hextech-divider w-32" />

            {/* ── Connection bars (LoL-style audio visualizer) ── */}
            <div className="flex items-end gap-[3px]" aria-hidden>
              {([14, 8, 18, 22, 12, 20, 10] as const).map((h, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 rounded-sm bg-hextech-blue"
                  style={{ height: h }}
                  animate={{ opacity: [0.3, 1, 0.3], scaleY: [0.55, 1, 0.55] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.1,
                    delay: i * 0.11,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            {/* ── Blinking prompt ── */}
            <motion.p
              className="font-spiegel text-[11px] uppercase tracking-[.25em] text-hextech-blue text-center w-full"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            >
              Toca la pantalla para conectar al servidor...
            </motion.p>

            {/* Bottom corner ornaments */}
            <span className="pointer-events-none absolute left-4 top-4 h-5 w-5 border-l-2 border-t-2 border-hextech-gold opacity-40" />
            <span className="pointer-events-none absolute right-4 top-4 h-5 w-5 border-r-2 border-t-2 border-hextech-gold opacity-40" />
            <span className="pointer-events-none absolute bottom-4 left-4 h-5 w-5 border-b-2 border-l-2 border-hextech-gold opacity-40" />
            <span className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 border-b-2 border-r-2 border-hextech-gold opacity-40" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Real content ─────────────────────────────────── */}
      {/* Always in the DOM (preserves SSR HTML). Hidden & non-interactive
          until the splash clears, then fades in. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: unlocked ? 1 : 0 }}
        transition={{ duration: 0.5, delay: unlocked ? 0.25 : 0 }}
        aria-hidden={!unlocked || undefined}
        style={{ pointerEvents: unlocked ? undefined : 'none' }}
      >
        {children}
      </motion.div>
    </>
  )
}
