/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const gw = process.env.API_BASE_SERVER ?? 'http://api-gateway:7500';
    const services = ['dataset','rag','clustering','eda','emotions','topicmodeling','wordcloud','classification','datacleaning','evolution','suicide','report','auth'];
    return {
      beforeFiles: services.map((s) => ({
        source: `/${s}/:path*`,
        destination: `${gw}/${s}/:path*`,
      })),
    };
  },
  experimental: {
    proxyTimeout: 10 * 60 * 1000, // 10 min en ms
  }
}

export default nextConfig
