import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  // Where `npm run dev` forwards /api requests (the local backend by default).
  const apiProxyTarget = env.VITE_DEV_API_PROXY || "http://localhost:5500";

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: apiProxyTarget.startsWith("https"),
        },
      },
    },
    optimizeDeps: {
      exclude: ["lucide-react"],
    },
  };
});
