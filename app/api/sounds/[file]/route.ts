/**
 * Self-healing audio proxy.
 *
 * On first request for a file:
 *   1. Checks public/sounds/{file} — if it exists, serves it immediately.
 *   2. Otherwise fetches from Community Dragon CDN using Node's https module
 *      with rejectUnauthorized: false (safe for dev behind a corporate TLS proxy).
 *   3. Saves the buffer to public/sounds/{file} for subsequent static serving.
 *
 * Browser Cache-Control: 7 days immutable — after the first load the browser
 * never requests the file again.
 */
export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import https from 'https'
import fs from 'fs'
import path from 'path'

/* ── Allow-list prevents path traversal ── */
const CDN_MAP: Record<string, string> = {
  'button-hover.ogg':
    'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-uikit/global/default/sfx-uikit-button-generic-hover.ogg',
  'clash-team-lock.ogg':
    'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/audio/sfx-clash-player-lockin.ogg',
  'matchmaking_found.ogg':
    'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/audio/sfx-clash-opponent-found.ogg',
  /* BGM: try primary path, fallback handled in fetchBuffer */
  'clash-hub-bgm.ogg':
    'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/audio/sfx-clash-trophy-ceremony-music.ogg',
  'clash-round-start.ogg':
    'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/audio/sfx-clash-round-start.ogg',
}

/* Alternate CDN paths to try when primary returns 403/404 */
const CDN_FALLBACKS: Record<string, string[]> = {
  'button-hover.ogg': [],
  'clash-team-lock.ogg': [],
  'matchmaking_found.ogg': [],
  'clash-hub-bgm.ogg': [],
  'clash-round-start.ogg': [],
}

/* Browser-like headers prevent CDN 403 blocks on server-side requests */
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'audio/webm,audio/ogg,audio/*;q=0.9,*/*;q=0.5',
  'Referer': 'https://www.communitydragon.org/',
  'Origin': 'https://www.communitydragon.org',
}

const SOUNDS_DIR = path.join(process.cwd(), 'public', 'sounds')

/** Fetch a URL via Node https — respects rejectUnauthorized: false so it works
 *  behind corporate TLS-inspection proxies. Follows up to 5 redirects. */
function fetchBuffer(url: string, hops = 5): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    if (hops === 0) return reject(new Error('Too many redirects'))
    https
      .get(url, { headers: BROWSER_HEADERS }, (res) => {
        /* Follow redirects (Cloudflare / CDN hops) */
        if (res.statusCode! >= 300 && res.statusCode! < 400 && res.headers.location) {
          fetchBuffer(res.headers.location, hops - 1).then(resolve).catch(reject)
          return
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`CDN returned HTTP ${res.statusCode}`))
        }
        const chunks: Buffer[] = []
        res.on('data', (c: Buffer) => chunks.push(c))
        res.on('end', () => resolve(Buffer.concat(chunks)))
        res.on('error', reject)
      })
      .on('error', reject)
  })
}

/** Try primary URL first, then fallbacks, reject only if all fail */
async function fetchWithFallbacks(file: string, primary: string): Promise<Buffer> {
  const urls = [primary, ...(CDN_FALLBACKS[file] ?? [])]
  let lastError: Error | undefined
  for (const url of urls) {
    try {
      const buf = await fetchBuffer(url)
      return buf
    } catch (err) {
      console.warn(`[sounds] ${url} → ${(err as Error).message}`)
      lastError = err as Error
    }
  }
  throw lastError ?? new Error('All CDN sources failed')
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ file: string }> },
) {
  const { file } = await context.params

  const cdnUrl = CDN_MAP[file]
  if (!cdnUrl) {
    return new NextResponse('Not found', { status: 404 })
  }

  const localPath = path.join(SOUNDS_DIR, file)

  /* ── Fast path: serve from disk cache ── */
  if (fs.existsSync(localPath)) {
    const data = fs.readFileSync(localPath)
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': 'audio/ogg',
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    })
  }

  /* ── Slow path: fetch → cache → serve ── */
  try {
    const data = await fetchWithFallbacks(file, cdnUrl)
    fs.mkdirSync(SOUNDS_DIR, { recursive: true })
    fs.writeFileSync(localPath, data)
    console.info(`[sounds] cached ${file} (${(data.length / 1024).toFixed(0)} KB)`)
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': 'audio/ogg',
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    })
  } catch (err) {
    console.error(`[sounds] CDN fetch failed for ${file}:`, err)
    return new NextResponse(`Audio unavailable: ${file}`, { status: 502 })
  }
}
