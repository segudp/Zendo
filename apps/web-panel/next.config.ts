import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita que Turbopack infiera la raíz del workspace subiendo hasta el
  // package-lock.json de la raíz del repo (que sólo existe para el Prisma CLI,
  // no forma un workspace real): esta app es autocontenida.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
