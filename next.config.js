/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['api.minimax.io', 'minimax.io', 'file-id.minimax.io'],
  },
};

module.exports = nextConfig;
