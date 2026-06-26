/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "arcade.flashdust.dev" }],
        destination: "https://flashportal.dev/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "flasharcade.vercel.app" }],
        destination: "https://flashportal.dev/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
