/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'trustfolio-cm.vercel.app',
        port: '',
        pathname: '/images/books/**',
      },
      {
        protocol: 'https',
        hostname: 'trustfolio-cm.vercel.app',
        port: '',
        pathname: '/_next/image/**',
      },
    ],
  },
};

export default nextConfig;