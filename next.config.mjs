/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    // pg uses node-gyp deps and pg-cloudflare lazy paths; mark as external so
    // the Server Component runtime can require it without bundling tricks.
    serverComponentsExternalPackages: ["pg", "pg-native"],
  },
};

export default nextConfig;
