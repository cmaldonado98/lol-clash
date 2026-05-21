'use client'

import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes } from 'react'
import { SFX_HOVER, SFX_LOCK_IN } from '@/lib/constants/assets'

/* ── Module-level audio singletons ──
   Created once per page load, shared across every HextechButton instance.
   Using native HTMLAudioElement avoids Howler.js/use-sound compatibility
   issues and surfaces errors directly to the console. */
let _hoverAudio: HTMLAudioElement | null = null
let _clickAudio: HTMLAudioElement | null = null

function sfx(slot: 'hover' | 'click'): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  if (slot === 'hover') {
    if (!_hoverAudio) {
      _hoverAudio = new Audio(SFX_HOVER)
      _hoverAudio.volume = 0.45
      _hoverAudio.preload = 'auto'
    }
    return _hoverAudio
  }
  if (!_clickAudio) {
    _clickAudio = new Audio(SFX_LOCK_IN)
    _clickAudio.volume = 0.75
    _clickAudio.preload = 'auto'
  }
  return _clickAudio
}

interface HextechButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export default function HextechButton({
  children,
  variant = 'blue',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  onClick,
  ...props
}: HextechButtonProps) {
  const isDisabled = disabled || loading

  const playHover = () => {
    const a = sfx('hover')
    if (!a) return
    a.currentTime = 0
    a.play().catch(() => {}) /* may fail before first gesture on mobile — OK */
  }

  const playClick = () => {
    const a = sfx('click')
    if (!a) return
    a.currentTime = 0
    a.play().catch(console.error)
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) playClick()
    onClick?.(e)
  }

  const sizeClass = {
    sm: 'px-5 py-2   text-xs  min-h-[36px]',
    md: 'px-7 py-3   text-sm  min-h-[44px]',
    lg: 'px-8 py-4   text-base min-h-[52px]',
  }[size]

  const activeClass = {
    blue: 'border-hextech-blue   text-hextech-blue   bg-hextech-blue/10   hover:bg-hextech-blue/20   shadow-glow-blue-sm',
    gold: 'border-hextech-gold   text-hextech-gold   bg-hextech-gold/10   hover:bg-hextech-gold/20   shadow-glow-gold-sm',
  }[variant]

  const disabledClass =
    'border-hextech-gray-dark text-hextech-gray bg-hextech-gray-dark/20 cursor-not-allowed opacity-50'

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.025, y: -1 } : {}}
      whileTap={!isDisabled  ? { scale: 0.975, y: 0  } : {}}
      onHoverStart={() => { if (!isDisabled) playHover() }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      disabled={isDisabled}
      className={[
        'relative overflow-hidden border font-beaufort uppercase tracking-[.15em]',
        'transition-colors duration-200 select-none',
        sizeClass,
        isDisabled ? disabledClass : activeClass,
        className,
      ].join(' ')}
      onClick={handleClick}
      {...(props as object)}
    >
      {/* ── Corner ornaments ── */}
      <span className="pointer-events-none absolute left-0  top-0  h-2.5 w-2.5 border-l-2 border-t-2 border-current opacity-70" />
      <span className="pointer-events-none absolute right-0 top-0  h-2.5 w-2.5 border-r-2 border-t-2 border-current opacity-70" />
      <span className="pointer-events-none absolute left-0  bottom-0 h-2.5 w-2.5 border-l-2 border-b-2 border-current opacity-70" />
      <span className="pointer-events-none absolute right-0 bottom-0 h-2.5 w-2.5 border-r-2 border-b-2 border-current opacity-70" />

      {/* ── Shimmer sweep ── */}
      {!isDisabled && (
        <motion.span
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '220%' }}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'linear', repeatDelay: 3 }}
        />
      )}

      {/* ── Content ── */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <motion.span
              className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
            />
            <span>Procesando…</span>
          </>
        ) : (
          children
        )}
      </span>
    </motion.button>
  )
}
