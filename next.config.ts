import type { NextConfig } from 'next'

/**
 * ⚠️  DEV-ONLY: Disable SSL cert verification to work behind a corporate TLS proxy.
 *     The `if` guard ensures this never runs in production builds.
 */
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.10.157'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com',
        pathname: '/cdn/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.communitydragon.org',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
