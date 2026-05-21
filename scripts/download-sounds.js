/**
 * download-sounds.js
 * Downloads Community Dragon audio files to public/sounds/
 * Run: node scripts/download-sounds.js
 *
 * Uses NODE_TLS_REJECT_UNAUTHORIZED=0 (same as next.config.ts dev flag)
 * to work behind a corporate TLS proxy.
 */

/* eslint-disable */
'use strict'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const https = require('https')
const fs    = require('fs')
const path  = require('path')

const OUT_DIR = path.join(__dirname, '..', 'public', 'sounds')

const FILES = [
  {
    url:  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-uikit/global/default/sfx-uikit-button-generic-hover.ogg',
    name: 'button-hover.ogg',
  },
  {
    url:  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/audio/sfx-clash-player-lockin.ogg',
    name: 'clash-team-lock.ogg',
  },
  {
    url:  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/audio/sfx-clash-opponent-found.ogg',
    name: 'matchmaking_found.ogg',
  },
  {
    url:  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/audio/sfx-clash-trophy-ceremony-music.ogg',
    name: 'clash-hub-bgm.ogg',
  },
]

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  console.log('Created', OUT_DIR)
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url}`)
    const file = fs.createWriteStream(dest)

    const request = (targetUrl) => {
      https.get(targetUrl, (res) => {
        console.log(`  → ${res.statusCode} ${res.headers['content-type'] ?? '(no content-type)'}`)

        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          console.log(`  → redirect to ${res.headers.location}`)
          file.close()
          request(res.headers.location)
          return
        }

        if (res.statusCode !== 200) {
          file.close()
          fs.unlinkSync(dest)
          return reject(new Error(`HTTP ${res.statusCode} for ${targetUrl}`))
        }

        res.pipe(file)
        file.on('finish', () => {
          file.close()
          const size = fs.statSync(dest).size
          console.log(`  ✓ saved ${dest} (${(size / 1024).toFixed(1)} KB)`)
          resolve()
        })
      }).on('error', (err) => {
        file.close()
        if (fs.existsSync(dest)) fs.unlinkSync(dest)
        reject(err)
      })
    }

    request(url)
  })
}

;(async () => {
  let ok = 0
  for (const { url, name } of FILES) {
    const dest = path.join(OUT_DIR, name)
    try {
      await download(url, dest)
      ok++
    } catch (err) {
      console.error(`  ✗ FAILED: ${err.message}`)
    }
  }
  console.log(`\nDone: ${ok}/${FILES.length} files downloaded to public/sounds/`)
})()
