/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fonts are loaded via a <link> tag in app/layout.tsx, so we skip Next's
  // build-time font optimization (which would otherwise try to fetch Google
  // Fonts during the build).
  optimizeFonts: false,
};

export default nextConfig;
