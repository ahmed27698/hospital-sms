import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '20mb' },
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
}

export default withNextIntl(nextConfig)
