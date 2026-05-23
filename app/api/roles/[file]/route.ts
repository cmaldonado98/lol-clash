/**
 * Self-healing role-icon proxy.
 *
 * On first request for a file:
 *   1. Checks public/roles/{file} — if it exists, serves it immediately.
 *   2. Otherwise fetches from Community Dragon CDN using Node's https module
 *      with rejectUnauthorized: false (safe for dev behind a corporate TLS proxy).
 *   3. Saves the buffer to public/roles/{file} for subsequent static serving.
 *
 * Browser Cache-Control: 7 days immutable.
 */
export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import https from 'https'
import fs from 'fs'
import path from 'path'

const CDN_BASE =
  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default'

/* ── Allow-list prevents path traversal ── */
const CDN_MAP: Record<string, string> = {
  'position-top.png':     `${CDN_BASE}/position-top.png`,
  'position-jungle.png':  `${CDN_BASE}/position-jungle.png`,
  'position-middle.png':  `${CDN_BASE}/position-middle.png`,
  'position-bottom.png':  `${CDN_BASE}/position-bottom.png`,
  'position-utility.png': `${CDN_BASE}/position-utility.png`,
}

/* Browser-like headers prevent CDN 403 blocks on server-side requests */
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'image/png,image/*;q=0.9,*/*;q=0.5',
  'Referer': 'https://www.communitydragon.org/',
  'Origin': 'https://www.communitydragon.org',
}

const ROLES_DIR = path.join(process.cwd(), 'public', 'roles')

/** Fetch a URL via Node https — respects rejectUnauthorized: false so it works
 *  behind corporate TLS-inspection proxies. Follows up to 5 redirects. */
function fetchBuffer(url: string, hops = 5): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    if (hops === 0) return reject(new Error('Too many redirects'))
    https
      .get(url, { headers: BROWSER_HEADERS }, (res) => {
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

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ file: string }> },
) {
  const { file } = await context.params

  const cdnUrl = CDN_MAP[file]
  if (!cdnUrl) {
    return new NextResponse('Not found', { status: 404 })
  }

  const localPath = path.join(ROLES_DIR, file)

  /* ── Fast path: serve from disk cache ── */
  if (fs.existsSync(localPath)) {
    const data = fs.readFileSync(localPath)
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    })
  }

  /* ── Slow path: fetch → cache → serve ── */
  try {
    const data = await fetchBuffer(cdnUrl)
    fs.mkdirSync(ROLES_DIR, { recursive: true })
    fs.writeFileSync(localPath, data)
    console.info(`[roles] cached ${file} (${(data.length / 1024).toFixed(0)} KB)`)
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    })
  } catch (err) {
    console.error(`[roles] CDN fetch failed for ${file}:`, err)
    return new NextResponse(`Image unavailable: ${file}`, { status: 502 })
  }
}
