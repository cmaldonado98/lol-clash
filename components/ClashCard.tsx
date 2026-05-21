'use client'

import Image from 'next/image'
import { useState, useCallback, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import type { Groomsman } from '@/types'
import { getSummonerIconUrl, getRoleIconUrl, roleConfig } from '@/lib/utils'
import HextechButton from './HextechButton'
import { lockIn } from '@/app/actions/lockIn'

interface ClashCardProps {
  groomsman: Groomsman
}

/* ── Hextech Emblem SVG ──────────────────────────────────── */
function HextechEmblem() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16" aria-hidden>
      {/* Outer hexagon */}
      <polygon
        points="40,4 72,22 72,58 40,76 8,58 8,22"
        stroke="#C8AA6E"
        strokeWidth="1.5"
        fill="none"
        opacity=".7"
      />
      {/* Inner hexagon */}
      <polygon
        points="40,14 64,28 64,52 40,66 16,52 16,28"
        stroke="#785A28"
        strokeWidth="1"
        fill="rgba(10,22,40,.6)"
      />
      {/* Center star */}
      <path
        d="M40 24 L43 36 L55 36 L45.5 43.5 L49 56 L40 49 L31 56 L34.5 43.5 L25 36 L37 36 Z"
        fill="#C8AA6E"
        opacity=".85"
      />
      {/* Glow ring */}
      <circle cx="40" cy="40" r="24" stroke="#0AC8B9" strokeWidth=".5" fill="none" opacity=".4" />
    </svg>
  )
}

/* ── Role Badge ──────────────────────────────────────────── */
function RoleBadge({ role }: { role: Groomsman['role'] }) {
  const cfg = roleConfig[role]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-0.5 font-beaufort text-[10px] uppercase tracking-widest"
      style={{
        borderColor: cfg.accentColor + '80',
        color: cfg.accentColor,
        background: cfg.accentColor + '18',
      }}
    >
      <Image
        src={getRoleIconUrl(role)}
        alt={cfg.shortLabel}
        width={14}
        height={14}
        className="shrink-0"
        style={{ width: 14, height: 14 }}
        unoptimized
      />
      {cfg.shortLabel} · {cfg.label}
    </span>
  )
}

/* ── Floating particles ──────────────────────────────────── */
function Particles() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  /* Fixed positions — avoids SSR/client Math.random() mismatch */
  const particles = [
    { id: 0, x: 12,  delay: 0.0, duration: 3.5, size: 3 },
    { id: 1, x: 27,  delay: 0.6, duration: 4.0, size: 2 },
    { id: 2, x: 43,  delay: 1.2, duration: 3.2, size: 4 },
    { id: 3, x: 58,  delay: 1.8, duration: 4.5, size: 2 },
    { id: 4, x: 71,  delay: 0.3, duration: 3.8, size: 3 },
    { id: 5, x: 84,  delay: 0.9, duration: 4.2, size: 2 },
    { id: 6, x: 20,  delay: 2.4, duration: 3.0, size: 3 },
    { id: 7, x: 65,  delay: 1.5, duration: 4.8, size: 2 },
  ]

  if (!mounted) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-sm">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-hextech-gold"
          style={{ left: `${p.x}%`, bottom: '10%', width: p.size, height: p.size, opacity: 0 }}
          animate={{ y: [0, -100], opacity: [0, 0.7, 0.7, 0] }}
          transition={{
            repeat: Infinity,
            duration: p.duration,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────── */
export default function ClashCard({ groomsman }: ClashCardProps) {
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState(false)

  /* Sounds (match-found notification, BGM) are managed by <AudioUnlocker>,
     which guarantees the AudioContext is unlocked before any audio plays. */

  /* 3-D tilt on pointer move */
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]),  { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 })

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      x.set((e.clientX - rect.left) / rect.width - 0.5)
      y.set((e.clientY - rect.top)  / rect.height - 0.5)
    },
    [x, y],
  )
  const handlePointerLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  const handleAccept = async () => {
    setLoading(true)
    try {
      await lockIn(groomsman.slug)
      setAccepted(true)
    } catch {
      setLoading(false)
    }
  }

  return (
    /* ── Full-screen backdrop ── */
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-ambient-gold px-4 py-8 pt-safe">
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 bg-particle-grid opacity-40" />

      {/* Radial vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 70% at 50% 50%, transparent 40%, rgba(1,10,19,.9) 100%)',
        }}
      />

      {/* ── Tournament header ── */}
      <motion.div
        className="relative z-10 mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <p className="font-beaufort text-[10px] uppercase tracking-[.4em] text-hextech-gold-dark">
          Torneo Clash · Season 2026
        </p>
        <h1 className="mt-1 font-beaufort text-3xl font-black uppercase tracking-widest text-gradient-gold">
          Copa Mexicali
        </h1>
        <div className="hextech-divider mx-auto mt-2 w-40" />
      </motion.div>

      {/* ── Card ── */}
      <motion.div
        className="relative z-10 w-full max-w-sm"
        style={{ rotateX, rotateY, transformPerspective: 800 }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Breathing glow wrapper */}
        <motion.div
          className="relative overflow-hidden rounded-sm"
          animate={{
            boxShadow: [
              '0 0 20px rgba(200,170,110,.15), 0 0 40px rgba(200,170,110,.08)',
              '0 0 40px rgba(200,170,110,.35), 0 0 80px rgba(200,170,110,.15)',
              '0 0 20px rgba(200,170,110,.15), 0 0 40px rgba(200,170,110,.08)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          {/* Card background */}
          <div className="hextech-panel-glow relative flex flex-col items-center gap-5 px-6 pb-7 pt-7">
            <Particles />

            {/* Corner decorations */}
            <div className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-hextech-gold opacity-80" />
            <div className="pointer-events-none absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-hextech-gold opacity-80" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-hextech-gold opacity-80" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-hextech-gold opacity-80" />

            {/* Emblem */}
            <motion.div
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            >
              <HextechEmblem />
            </motion.div>

            {/* Recruitment text */}
            <div className="relative text-center">
              <div className="hextech-divider-blue mx-auto mb-3 w-24" />
              <p className="font-spiegel text-[11px] uppercase tracking-[.3em] text-hextech-gray">
                ArL3y te está invitando a unirte
              </p>
              <h2 className="mt-2 font-beaufort text-xl font-bold uppercase leading-tight tracking-wide text-hextech-gold-light">
                Forma parte del equipo{' '}
                <span className="text-gradient-gold">PanConQuesoTeam</span>
                {' '}<span className="text-hextech-blue">#PCQT</span>
              </h2>
              <div className="hextech-divider mx-auto mt-3 w-32" />
            </div>

            {/* Avatar */}
            <div className="relative">
              <motion.div
                className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-hextech-gold"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(200,170,110,.3)',
                    '0 0 20px rgba(200,170,110,.6)',
                    '0 0 10px rgba(200,170,110,.3)',
                  ],
                }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              >
                <Image
                  src={getSummonerIconUrl(groomsman.summoner_icon_id)}
                  alt={`Icono de ${groomsman.name}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  priority
                />
              </motion.div>
              {/* Online indicator */}
              <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-hextech-black bg-hextech-blue shadow-glow-blue-sm" />
            </div>

            {/* Name + Role */}
            <div className="flex flex-col items-center gap-2">
              <span className="font-beaufort text-2xl font-black uppercase tracking-widest text-hextech-gold-light">
                {groomsman.name}
              </span>
              <RoleBadge role={groomsman.role} />
            </div>

            {/* Date chip */}
            <div className="w-full rounded-sm border border-hextech-gold-dark/40 bg-hextech-navy/60 px-4 py-2 text-center">
              <p className="font-beaufort text-[10px] uppercase tracking-[.25em] text-hextech-gray">
                Fecha del torneo
              </p>
              <p className="mt-0.5 font-beaufort text-sm font-bold uppercase tracking-wider text-hextech-gold">
                10 de Octubre, 2026
              </p>
            </div>

            {/* CTA */}
            <HextechButton
              variant="blue"
              size="lg"
              loading={loading}
              disabled={accepted}
              className="w-full justify-center"
              onClick={handleAccept}
            >
              {accepted ? '✦ Invitación Aceptada' : '⚔ Aceptar'}
            </HextechButton>

            <p className="font-spiegel text-[10px] text-hextech-gray/60">
              Al aceptar, tu nombre quedará grabado en los registros del torneo.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom watermark */}
      <motion.p
        className="relative z-10 mt-6 font-beaufort text-[9px] uppercase tracking-[.4em] text-hextech-gold-dark"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Riot Games · League of Legends · Clash
      </motion.p>
    </div>
  )
}
