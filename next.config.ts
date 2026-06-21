import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ana site (elegancevipperfume.com) bu uygulamayi /koku-asistani altinda proxy ile sunar.
  basePath: "/koku-asistani",
  // Eski kok (asya.elegancevipperfume.com/) -> /koku-asistani
  async redirects() {
    return [{ source: "/", destination: "/koku-asistani", basePath: false, permanent: false }];
  },
};

export default nextConfig;
