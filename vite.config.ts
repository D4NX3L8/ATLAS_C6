import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const api = process.env.ATLAS_API || "http://localhost:3001";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true,
    },
    proxy: {
      "/api": {
        target: api,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: api,
        changeOrigin: true,
      },
    },
  },
});
