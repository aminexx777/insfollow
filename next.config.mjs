/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // ← أضف هذا السطر
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

