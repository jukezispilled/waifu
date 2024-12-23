/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  assetPrefix: process.env.BASE_PATH || "",
  basePath: process.env.BASE_PATH || "",
  trailingSlash: true,
  publicRuntimeConfig: {
    root: process.env.BASE_PATH || "",
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://0xbunny.wtf/api/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'www.0xbunny.wtf',
          },
        ],
        destination: 'https://0xbunny.wtf',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;