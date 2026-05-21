/**
 * Centralized asset URLs.
 *
 * Audio files are served from /public/sounds/ (same-origin) to avoid CDN
 * CORS / TLS-proxy issues in corporate networks. Download instructions:
 * see scripts/download-sounds.js or the README.
 *
 * Images are still served from Community Dragon (Next.js Image handles them
 * server-side, so the corporate proxy / NODE_TLS_REJECT_UNAUTHORIZED=0 applies).
 */

/* ── Image base (Community Dragon CDN, handled server-side) ─ */

/** Base URL for position icons: append `/position-{key}.png` */
export const POSITIONS_BASE =
  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default' as const

/* ── Audio paths — routed through /api/sounds/[file] ────── */
/* The API route fetches from Community Dragon on first request,   */
/* caches to public/sounds/, and serves with 7-day Cache-Control.  */

export const SFX_HOVER       = '/api/sounds/button-hover.ogg'      as const
export const SFX_LOCK_IN     = '/api/sounds/clash-team-lock.ogg'   as const
export const SFX_MATCH_FOUND = '/api/sounds/matchmaking_found.ogg' as const
export const BGM_CLASH_HUB   = '/api/sounds/clash-hub-bgm.ogg'     as const

/* ── Preload manifest ────────────────────────────────────── */

/**
 * SFX to inject as `<link rel="preload" as="audio">` in the document head.
 * Hitting /api/sounds/ early triggers the CDN fetch + disk cache on the
 * server, so by the time the user taps the splash the files are ready.
 * BGM excluded (large file, stream on demand).
 */
export const SFX_PRELOAD_URLS = [SFX_HOVER, SFX_LOCK_IN, SFX_MATCH_FOUND] as const
