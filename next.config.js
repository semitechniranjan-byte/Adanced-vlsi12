/** @type {import('next').NextConfig} */
const nextConfig = {
  // Smaller build output — matters on Hostinger shared hosting
  output: "standalone",
  reactStrictMode: true,
};

module.exports = nextConfig;
