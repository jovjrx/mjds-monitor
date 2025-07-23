/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para Vercel
  output: 'standalone',
  
  // Headers para APIs
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },

  // Configurações de build
  experimental: {
    // Otimizações para Vercel
    optimizeCss: true,
  },

  // Configurações de imagens
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig; 