import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Dev only (ignored by `next build`): the dev server refuses cross-origin
  // requests to its assets and HMR endpoints, so a sandboxed/tunnelled preview
  // host loads a blank page without this.
  allowedDevOrigins: ["*.e2b.app", "*.e2b.dev"],
};

export default nextConfig;
