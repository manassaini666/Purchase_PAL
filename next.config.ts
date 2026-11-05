import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // ...yahan tera pehle se jo bhi hai, wahi rehne de...
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
